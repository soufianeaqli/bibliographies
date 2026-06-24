import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Trash2, BookOpen, Star, Loader, Plus, X, ExternalLink, Globe, Eye } from 'lucide-react';
import { fetchBooks, deleteBook, deleteAllBooks, importBooks100, importSelected, fetchFromUrl } from '../api/libraryClient';

export default function AdminBookList() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlBook, setUrlBook] = useState(null);
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState('');

  const [importingId, setImportingId] = useState(null);

  const loadBooks = async () => {
    try {
      const data = await fetchBooks();
      setBooks(data);
    } catch (err) {
      console.error('Erreur chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBooks(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette œuvre définitivement ?')) {
      await deleteBook(id);
      loadBooks();
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    try {
      await importBooks100();
      await loadBooks();
    } catch (err) {
      console.error(err);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Supprimer TOUS les livres définitivement ?')) return;
    setIsDeletingAll(true);
    try {
      await deleteAllBooks();
      await loadBooks();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleFetchUrl = async () => {
    if (!urlInput.trim()) return;
    setUrlLoading(true);
    setUrlError('');
    setUrlBook(null);
    try {
      const book = await fetchFromUrl(urlInput.trim());
      setUrlBook(book);
    } catch (err) {
      setUrlError(err.response?.data?.message || 'Erreur lors de la récupération du livre');
    } finally {
      setUrlLoading(false);
    }
  };

  const handleImportSelected = async (book) => {
    setImportingId(book.google_id);
    try {
      await importSelected({
        titre: book.titre,
        auteur: book.auteur,
        description: book.description,
        cover_image: book.cover_image,
        annee: book.annee,
        rating: book.rating,
        total_pages: book.total_pages,
        genre: book.genre,
      });
      setShowModal(false);
      setUrlInput('');
      setUrlBook(null);
      await loadBooks();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'import');
    } finally {
      setImportingId(null);
    }
  };

  const uniqueAuthors = [...new Set(books.map(b => b.auteur))].length;

  return (
    <div className="flex-1 text-white p-8 bg-[#0E0C0A] min-h-screen relative overflow-y-auto custom-scrollbar">
      <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-widest uppercase" style={{ textShadow: '0 2px 20px rgba(212,175,55,0.4)' }}>
              Gestion des Livres
            </h1>
            <p className="text-gray-400 mt-2 text-lg">{books.length} livre{books.length > 1 ? 's' : ''} · {uniqueAuthors} auteur{uniqueAuthors > 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>

            <button onClick={handleImport} disabled={isImporting}
              className="flex items-center gap-2 bg-[#D4AF37] text-black px-6 py-3 rounded-xl font-bold uppercase tracking-wider hover:bg-white transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-50"
            >
              {isImporting ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Importer 100
            </button>
            <button onClick={handleDeleteAll} disabled={isDeletingAll}
              className="flex items-center gap-2 bg-red-600/10 border border-red-500/30 text-red-400 px-6 py-3 rounded-xl font-bold uppercase tracking-wider hover:bg-red-600/20 transition-all disabled:opacity-50"
            >
              {isDeletingAll ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Tout supprimer
            </button>
          </div>
        </div>

        <div className="bg-[#1A1713]/80 backdrop-blur-md border border-[#2C261A] rounded-3xl p-8 shadow-xl overflow-hidden">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-14 bg-[#2C261A] rounded"></div>
                  <div className="flex-1 h-4 bg-[#2C261A] rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#2C261A] text-gray-500 text-xs uppercase tracking-widest bg-[#0E0C0A]/50">
                    <th className="py-4 px-6 rounded-tl-xl whitespace-nowrap">Œuvre</th>
                    <th className="py-4 px-6 whitespace-nowrap">Type</th>
                    <th className="py-4 px-6 whitespace-nowrap">Année</th>
                    <th className="py-4 px-6 whitespace-nowrap">Note</th>
                    <th className="py-4 px-6 whitespace-nowrap">Statut</th>
                    <th className="py-4 px-6 text-right rounded-tr-xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {books.map((b) => (
                    <tr key={b.id} className="border-b border-[#2C261A]/50 hover:bg-[#1C1812] transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate(`/book/${b.id}`)}>
                          <div className="w-10 h-14 bg-[#0E0C0A] rounded border border-[#2C261A] flex items-center justify-center overflow-hidden shrink-0">
                            {b.cover_image ? <img src={b.cover_image} className="w-full h-full object-cover" /> : <BookOpen className="w-4 h-4 text-gray-600" />}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white text-base group-hover:text-[#D4AF37] transition-colors truncate max-w-[250px]">{b.titre}</div>
                            <div className="text-gray-500 text-xs uppercase tracking-wider mt-1">{b.auteur}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs font-bold bg-[#1C1812] border border-[#2C261A] px-2 py-1 rounded text-gray-300 uppercase">{b.type || 'livre'}</span>
                      </td>
                      <td className="py-4 px-6 text-gray-300">{b.annee || '—'}</td>
                      <td className="py-4 px-6">
                        {b.rating > 0 ? (
                          <span className="flex items-center gap-1 text-yellow-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-yellow-500" /> {b.rating}
                          </span>
                        ) : <span className="text-gray-600">—</span>}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          b.is_archived
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-green-500/10 text-green-400 border border-green-500/20'
                        }`}>
                          {b.is_archived ? 'Archivé' : 'Disponible'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-end gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => navigate(`/book/${b.id}`)} className="p-2 bg-[#0E0C0A] rounded hover:bg-[#D4AF37] hover:text-black text-gray-400 transition-colors" title="Détail">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => navigate(`/reader/${b.id}`)} className="p-2 bg-[#0E0C0A] rounded hover:bg-blue-500 hover:text-white text-gray-400 transition-colors" title="Lire">
                            <BookOpen className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(b.id)} className="p-2 bg-[#0E0C0A] rounded hover:bg-red-500 hover:text-white text-gray-400 transition-colors" title="Supprimer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-[#1A1713] border border-[#2C261A] rounded-3xl p-8 w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black uppercase tracking-widest text-white">Ajouter un livre</h2>
              <button onClick={() => { setShowModal(false); setUrlInput(''); setUrlBook(null); setUrlError(''); }} className="p-2 hover:bg-[#2C261A] rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-500 text-xs mb-4">Collez un lien Google Books pour importer un livre :</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => { setUrlInput(e.target.value); setUrlBook(null); setUrlError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleFetchUrl()}
                  placeholder="https://books.google.com/books?id=..."
                  className="flex-1 bg-[#0E0C0A] border border-[#2C261A] rounded-xl px-5 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50 transition-colors font-mono text-sm"
                />
                <button onClick={handleFetchUrl} disabled={urlLoading || !urlInput.trim()}
                  className="flex items-center gap-2 bg-[#D4AF37] text-black px-6 py-3 rounded-xl font-bold hover:bg-white transition-all disabled:opacity-50"
                >
                  {urlLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                  Récupérer
                </button>
              </div>

              {urlError && <p className="text-red-400 text-sm mt-3">{urlError}</p>}

              {urlBook && (
                <div className="flex gap-4 bg-[#0E0C0A] border border-green-500/30 rounded-2xl p-4 mt-4">
                  <div className="w-20 h-28 bg-[#1A1713] rounded-lg border border-[#2C261A] flex items-center justify-center overflow-hidden shrink-0">
                    {urlBook.cover_image ? <img src={urlBook.cover_image} className="w-full h-full object-cover" /> : <BookOpen className="w-6 h-6 text-gray-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-lg">{urlBook.titre}</div>
                    <div className="text-gray-500 text-xs uppercase tracking-wider mt-1">{urlBook.auteur}</div>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      {urlBook.annee && <span>{urlBook.annee}</span>}
                      {urlBook.total_pages && <span>{urlBook.total_pages} p.</span>}
                      {urlBook.rating && <span className="text-yellow-500">★ {urlBook.rating}</span>}
                    </div>
                    {urlBook.description && <p className="text-gray-400 text-xs mt-2">{urlBook.description}</p>}
                    <div className="mt-4">
                      <button onClick={() => { handleImportSelected(urlBook); }} disabled={importingId === urlBook.google_id}
                        className="flex items-center gap-2 bg-green-600/20 border border-green-500/40 text-green-400 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-green-600/30 transition-all disabled:opacity-50"
                      >
                        {importingId === urlBook.google_id ? <Loader className="w-3 h-3 animate-spin" /> : <ExternalLink className="w-3 h-3" />}
                        Importer ce livre
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
