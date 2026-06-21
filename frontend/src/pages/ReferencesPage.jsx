import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getReferences, deleteReference } from '../api/references';
import ConfirmModal from '../components/ConfirmModal';

export default function ReferencesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [references, setReferences] = useState([]);
  const [meta, setMeta] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false); // Fetching progress without hiding list
  
  const [viewMode, setViewMode] = useState('grid');
  const [copiedId, setCopiedId] = useState(null);
  const [successToast, setSuccessToast] = useState(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [referenceToDelete, setReferenceToDelete] = useState(null);

  // Valeurs locales pour fluidité au clavier (confort utilisateur)
  const [localQ, setLocalQ] = useState(searchParams.get('q') || '');
  const [localType, setLocalType] = useState(searchParams.get('type') || '');
  const [localTag, setLocalTag] = useState(searchParams.get('tag') || '');
  const page = searchParams.get('page') || '1';

  // Synchronise les filtres URL vers l'UI si l'URL change depuis l'extérieur (ex: historique back/forward)
  useEffect(() => {
    setLocalQ(searchParams.get('q') || '');
    setLocalType(searchParams.get('type') || '');
    setLocalTag(searchParams.get('tag') || '');
  }, [searchParams]);

  const fetchReferences = useCallback(async () => {
    setIsFetching(true);
    try {
      const p = { 
        page, 
        q: searchParams.get('q') || '', 
        type: searchParams.get('type') || '', 
        tag: searchParams.get('tag') || '' 
      };
      Object.keys(p).forEach(key => !p[key] && delete p[key]);
      
      const response = await getReferences(p);
      setReferences(response?.data || []);
      setMeta(response?.meta || { last_page: 1, current_page: 1, total: 0 });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [page, searchParams]);

  useEffect(() => {
    fetchReferences();
  }, [fetchReferences]);

  // Debounce (délai d'attente) pour ne pas spammer l'URL et la requête
  useEffect(() => {
    const handler = setTimeout(() => {
      const p = { 
        q: localQ, 
        type: localType, 
        tag: localTag 
      };
      
      const paramsToSet = {};
      Object.keys(p).forEach(key => { if (p[key]) paramsToSet[key] = p[key]; });
      
      // On sauvegarde l'état actuel des search params, sans la page (la page reset à 1 si fitre change)
      // Pour éviter de reset la page injustement, on vérifie si les filtres ont VRAIMENT changé
      const currentQ = searchParams.get('q') || '';
      const currentType = searchParams.get('type') || '';
      const currentTag = searchParams.get('tag') || '';
      
      const filtersChanged = currentQ !== localQ || currentType !== localType || currentTag !== localTag;
      
      if (filtersChanged) {
        setSearchParams(paramsToSet, { replace: true });
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [localQ, localType, localTag, searchParams, setSearchParams]);

  const goToPage = (newPage) => {
    const p = Object.fromEntries(searchParams.entries());
    p.page = newPage.toString();
    setSearchParams(p);
  };

  const resetFilters = () => {
    setLocalQ(''); setLocalType(''); setLocalTag('');
    setSearchParams({});
  };

  const handleConfirmDelete = async () => {
    if (!referenceToDelete) return;
    try {
      await deleteReference(referenceToDelete.id);
      setIsDeleteModalOpen(false);
      setSuccessToast(`La référence "${referenceToDelete.titre}" a bien été supprimée.`);
      setReferenceToDelete(null);
      fetchReferences();
      setTimeout(() => setSuccessToast(null), 4000); // disparait après 4s
    } catch (error) {
      console.error(error);
    }
  };

  const copyCitation = (ref) => {
    const citation = `${ref.auteur} (${ref.annee}). ${ref.titre}.`;
    navigator.clipboard.writeText(citation).then(() => {
      setCopiedId(ref.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const getTypeColor = (t) => {
    const colors = {
      article: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      livre: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      these: 'bg-purple-100 text-purple-800 border-purple-200',
      site_web: 'bg-sky-100 text-sky-800 border-sky-200',
      rapport: 'bg-amber-100 text-amber-800 border-amber-200',
      acte_conference: 'bg-rose-100 text-rose-800 border-rose-200',
    };
    return colors[t] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              Mes Références
              {isFetching && !loading && (
                 <svg className="animate-spin h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              )}
            </h1>
            <p className="mt-2 text-sm text-gray-500 font-medium">
              Gérez votre bibliographie de manière professionnelle.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex bg-white items-center p-1 rounded-xl shadow-sm border border-gray-200">
              <button 
                onClick={() => setViewMode('grid')} 
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-400 hover:text-gray-600'}`}
                title="Vue Grille"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button 
                onClick={() => setViewMode('list')} 
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-400 hover:text-gray-600'}`}
                title="Vue Liste"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              </button>
            </div>

            <Link 
              to="/references/new" 
              className="px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 bg-gray-900 border border-transparent rounded-xl shadow-md hover:bg-gray-800 hover:-translate-y-0.5 active:translate-y-0 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
              Créer
            </Link>
          </div>
        </div>

        {/* NOUVEAU: Filtres Confortables (Bandeau fin et allongé) */}
        <div className="bg-white p-4 sm:p-5 rounded-[1.5rem] shadow-sm border border-gray-200 mb-8 w-full flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full">
             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                 <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </div>
             <input 
               type="text" 
               placeholder="Rechercher un titre ou un auteur..." 
               className="w-full bg-gray-50/50 border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-sm text-gray-800"
               value={localQ}
               onChange={(e) => setLocalQ(e.target.value)}
             />
          </div>
          <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
          <div className="flex flex-wrap md:flex-nowrap w-full md:w-auto gap-3 shrink-0">
             <select 
               className="bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-sm text-gray-700 min-w-[140px]"
               value={localType}
               onChange={(e) => setLocalType(e.target.value)}
             >
               <option value="">Tous types</option>
               <option value="article">Article</option>
               <option value="livre">Livre</option>
               <option value="these">Thèse</option>
               <option value="site_web">Site Web</option>
               <option value="rapport">Rapport</option>
               <option value="acte_conference">Conférence</option>
             </select>

             <input 
               type="text" 
               placeholder="#Tag" 
               className="w-24 sm:w-32 bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-sm text-gray-700"
               value={localTag}
               onChange={(e) => setLocalTag(e.target.value)}
             />
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : references.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-200 border-dashed">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4 text-gray-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Aucune référence n'a été trouvée</h3>
            <p className="text-gray-500 text-sm">Modifiez vos critères de recherche pour obtenir des résultats.</p>
            <button onClick={resetFilters} className="mt-4 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 font-medium text-sm text-gray-700 transition">Réinitialiser les filtres</button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            {references.map((ref) => (
              <div key={ref.id} className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col relative">
                
                <button 
                  onClick={() => copyCitation(ref)}
                  title="Copier citation (APA)"
                  className="absolute top-5 right-5 p-2.5 rounded-full bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                >
                  {copiedId === ref.id ? (
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  )}
                </button>

                <div className="flex items-center mb-4">
                  <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md border ${getTypeColor(ref.type)}`}>
                    {ref.type.replace('_', ' ')}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2 pr-10 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {ref.titre}
                </h3>
                <p className="text-gray-500 text-xs mb-4 font-semibold flex items-center gap-2 uppercase tracking-wide">
                  {ref.auteur} <span className="w-1 h-1 bg-gray-300 rounded-full"></span> {ref.annee}
                </p>
                
                <div className="flex flex-wrap gap-1.5 mb-6 mt-auto">
                  {(ref.tags || []).slice(0, 3).map(t => (
                    <span key={t.id} className="text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">
                      #{t.nom}
                    </span>
                  ))}
                  {(ref.tags?.length > 3) && <span className="text-[10px] font-bold text-gray-400">+{ref.tags.length - 3}</span>}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <Link to={`/references/${ref.id}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center gap-1 group/link">
                    Voir détails
                    <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </Link>
                  <div className="flex gap-1">
                    <Link to={`/references/${ref.id}/edit`} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors" title="Éditer">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </Link>
                    <button onClick={() => { setReferenceToDelete(ref); setIsDeleteModalOpen(true); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-50 rounded-lg transition-colors" title="Supprimer">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden transition-opacity duration-300 ${isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-[#f8fafc] text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Titre de la ressource</th>
                    <th className="px-6 py-4">Auteurs & Année</th>
                    <th className="px-6 py-4">Format</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {references.map(ref => (
                    <tr key={ref.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 mb-1 group-hover:text-indigo-600">{ref.titre}</div>
                        <div className="flex flex-wrap gap-1">
                          {(ref.tags || []).slice(0,2).map(t => (
                            <span key={t.id} className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">#{t.nom}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">{ref.auteur}</div>
                        <div className="text-gray-400 text-xs">{ref.annee}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md border ${getTypeColor(ref.type)}`}>
                          {ref.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => copyCitation(ref)} title="Copier citation" className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100">
                             {copiedId === ref.id ? <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>}
                           </button>
                           <Link to={`/references/${ref.id}`} className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></Link>
                           <Link to={`/references/${ref.id}/edit`} className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></Link>
                           <button onClick={() => { setReferenceToDelete(ref); setIsDeleteModalOpen(true); }} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {meta && meta.last_page > 1 && !loading && (
          <div className="mt-8 flex justify-center items-center gap-1.5">
            <button 
              onClick={() => goToPage(meta.current_page - 1)}
              disabled={meta.current_page === 1}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 transition-all shadow-sm"
            >
               Précédent
            </button>
            <span className="px-4 py-2 text-sm font-bold text-gray-400">
              {meta.current_page} / {meta.last_page}
            </span>
            <button 
              onClick={() => goToPage(meta.current_page + 1)}
              disabled={meta.current_page === meta.last_page}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 transition-all shadow-sm"
            >
              Suivant
            </button>
          </div>
        )}
      </div>

      {/* NOUVEAU: Toast de succès pour confirmation visuelle douce */}
      {successToast && (
        <div className="fixed bottom-6 right-6 bg-gray-900/95 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-bounce">
          <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium text-sm">{successToast}</span>
          <button onClick={() => setSuccessToast(null)} className="ml-4 text-gray-400 hover:text-white">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </button>
        </div>
      )}

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        title="Supprimer la référence ?"
        message={`Êtes-vous sûr de vouloir supprimer "${referenceToDelete?.titre}" ?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
