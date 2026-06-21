import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getReference, addTagToReference, removeTagFromReference, deleteReference } from '../api/references';
import ConfirmModal from '../components/ConfirmModal';

export default function ReferenceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reference, setReference] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tagInput, setTagInput] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchReference = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReference(id);
      setReference(data?.data || data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReference();
  }, [fetchReference]);

  const handleAddTag = async (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      try {
        await addTagToReference(id, { name: tagInput.trim() });
        setTagInput('');
        fetchReference();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleRemoveTag = async (tagId) => {
    try {
      await removeTagFromReference(id, tagId);
      fetchReference();
    } catch (error) {
      console.error(error);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteReference(id);
      navigate('/references', { replace: true });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!reference) return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Référence introuvable</h2>
      <Link to="/references" className="underline text-indigo-600">Retourner à la liste</Link>
    </div>
  );

  const renderSpecificFields = () => {
    const details = reference.details || reference[reference.type] || {};
    const specificFields = [];
    
    const pushField = (label, value, isLink=false) => {
      if (value) specificFields.push({label, value, isLink});
    };

    switch (reference.type) {
      case 'article':
        pushField('Revue', details.revue); pushField('Volume', details.volume); pushField('Numéro', details.numero); pushField('Pages', details.pages); pushField('DOI', details.doi); break;
      case 'livre':
        pushField('Éditeur', details.editeur); pushField('Édition', details.edition); pushField('ISBN', details.isbn); break;
      case 'these':
        pushField('Université', details.universite); pushField('Niveau', details.niveau); break;
      case 'site_web':
        pushField('URL', details.url, true); pushField('Consulté le', details.date_consultation); break;
      case 'rapport':
        pushField('Institution', details.institution); pushField('Numéro de rapport', details.numero_rapport); break;
      case 'acte_conference':
        pushField('Conférence', details.conference); pushField('Lieu', details.lieu); pushField('Pages', details.pages); break;
      default: break;
    }

    if(specificFields.length === 0) return <p className="text-gray-400 italic">Aucune information spécifique pour cette ressource.</p>;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {specificFields.map((f, idx) => (
          <div key={idx} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{f.label}</span>
            {f.isLink ? (
              <a href={f.value} target="_blank" rel="noreferrer" className="text-blue-600 font-medium hover:underline break-all">{f.value}</a>
            ) : (
              <span className="text-gray-800 font-medium">{f.value}</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header Navigation */}
        <Link to="/references" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors mb-8 group">
          <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Retour aux références
        </Link>
        
        {/* Main Card */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/40 border border-white relative overflow-hidden">
          {/* Decorative Gradient Background overlay */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-indigo-100/50"></div>
          
          <div className="relative p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
              <div className="flex-1">
                <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest mb-4">
                  {reference.type.replace('_', ' ')}
                </span>
                <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
                  {reference.titre}
                </h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-2 font-medium">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    {reference.auteur}
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                  <div className="flex items-center gap-2 font-medium">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {reference.annee}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 shrink-0">
                <Link to={`/references/${id}/edit`} className="inline-flex items-center justify-center p-3 sm:px-6 sm:py-3 bg-white border-2 border-indigo-100 rounded-2xl text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all font-bold shadow-sm">
                  <span className="hidden sm:block">Éditer</span>
                  <svg className="w-5 h-5 sm:ml-2 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </Link>
                <button onClick={() => setIsDeleteModalOpen(true)} className="inline-flex items-center justify-center p-3 bg-rose-50 border-2 border-rose-100 rounded-2xl text-rose-600 hover:bg-rose-100 transition-all font-bold shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>

            <hr className="border-gray-100 mb-10" />

            <div className="mb-12">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                </div>
                Détails Techniques
              </h3>
              {renderSpecificFields()}
            </div>

            <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-[2rem] border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <div className="p-2 bg-pink-50 text-pink-500 rounded-lg">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                </div>
                Étiquettes (Tags)
              </h3>
              
              <div className="flex flex-wrap gap-3 mb-6">
                {(reference.tags || []).map((t) => (
                  <span key={t.id} className="group relative inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-white text-gray-700 shadow-sm border border-gray-200 transition-all hover:pr-10 hover:border-pink-200 hover:text-pink-600">
                    #{t.nom}
                    <button 
                      onClick={() => handleRemoveTag(t.id)} 
                      className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                ))}
                {(!reference.tags || reference.tags.length === 0) && (
                  <span className="text-gray-400 italic text-sm py-2">Aucune étiquette n'a été ajoutée pour le moment.</span>
                )}
              </div>
              
              <div className="relative max-w-sm">
                <input
                  type="text"
                  className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-300 transition-all shadow-sm font-medium placeholder-gray-400 text-gray-700"
                  placeholder="Nouveau tag + Entrée"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                />
                <div className="absolute left-4 top-[14px] text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        title="Suppression irrémédiable"
        message={`Êtes-vous sûr de vouloir supprimer définitivement "${reference.titre}" ?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
