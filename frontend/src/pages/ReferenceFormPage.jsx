import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getReference, createReference, updateReference } from '../api/references';
import ReferenceFormFields from '../components/ReferenceFormFields';

export default function ReferenceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    titre: '',
    auteur: '',
    annee: new Date().getFullYear(),
    type: 'article',
    details: {}
  });

  useEffect(() => {
    if (isEditing) {
      const fetchRef = async () => {
        try {
          const res = await getReference(id);
          const data = res?.data || res;
          
          setFormData({
            titre: data.titre,
            auteur: data.auteur,
            annee: data.annee,
            type: data.type,
            details: data.details || data[data.type] || {}
          });
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchRef();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDetailsChange = (namePath, value) => {
    const field = namePath.replace('details.', '');
    setFormData(prev => ({
      ...prev,
      details: { ...prev.details, [field]: value }
    }));
  };

  const handleTypeChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev, type: value, details: {} 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditing) {
        await updateReference(id, formData);
      } else {
        await createReference(formData);
      }
      navigate('/references');
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        <Link to="/references" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors mb-8 group">
          <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Annuler et retourner à la liste
        </Link>

        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/40 border border-white relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          
          <div className="p-8 md:p-12">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              {isEditing ? 'Éditer la référence' : 'Nouvelle référence'}
            </h1>
            <p className="text-gray-500 mb-10 font-medium">
              Veuillez remplir les informations requises pour documenter cette ressource.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/30 p-6 md:p-8 rounded-3xl border border-gray-100">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2 tracking-wide">Titre <span className="text-pink-500">*</span></label>
                  <input 
                    type="text" 
                    name="titre" 
                    value={formData.titre} 
                    onChange={handleChange} 
                    required 
                    placeholder="Saisissez le titre principal..."
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all font-medium text-gray-900 shadow-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 tracking-wide">Auteur(s) <span className="text-pink-500">*</span></label>
                  <input 
                    type="text" 
                    name="auteur" 
                    value={formData.auteur} 
                    onChange={handleChange} 
                    required 
                    placeholder="Nom, Prénom"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all font-medium text-gray-900 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 tracking-wide">Année <span className="text-pink-500">*</span></label>
                  <input 
                    type="number" 
                    name="annee" 
                    value={formData.annee} 
                    onChange={handleChange} 
                    required 
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all font-medium text-gray-900 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 tracking-wide">
                  Catégorie de la ressource <span className="text-pink-500">*</span>
                </label>
                <div className="relative">
                  <select 
                    name="type" 
                    value={formData.type} 
                    onChange={handleTypeChange}
                    disabled={isEditing}
                    className="w-full md:w-1/2 appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all font-bold text-indigo-700 shadow-sm disabled:bg-gray-100 disabled:text-gray-400 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <option value="article">Article de revue</option>
                    <option value="livre">Livre complet</option>
                    <option value="these">Mémoire / Thèse</option>
                    <option value="site_web">Site Internet</option>
                    <option value="rapport">Rapport technique</option>
                    <option value="acte_conference">Acte de conférence</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 md:right-[50%] flex items-center px-4 text-gray-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
                {isEditing && <p className="text-xs font-semibold text-gray-400 mt-2">Le type ne peut pas être modifié une fois sauvegardé en base de données.</p>}
              </div>

              <div className="bg-indigo-50/50 p-6 md:p-8 rounded-3xl border border-indigo-100 mt-6">
                <h2 className="text-lg font-extrabold text-indigo-900 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  Champs Spécifiques : {formData.type.replace('_', ' ').toUpperCase()}
                </h2>
                <ReferenceFormFields 
                  type={formData.type}
                  data={formData.details}
                  onChange={handleDetailsChange}
                />
              </div>

              <div className="pt-6 flex justify-end items-center gap-4 border-t border-gray-100">
                <Link to="/references" className="px-6 py-3.5 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                  Annuler
                </Link>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="group relative inline-flex items-center justify-center px-8 py-3.5 text-sm font-bold text-white transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 border border-transparent rounded-xl shadow-md hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {saving ? (
                     <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Enregistrement...
                     </span>
                  ) : 'Sauvegarder la référence'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
