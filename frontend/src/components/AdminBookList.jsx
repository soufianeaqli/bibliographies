import React, { useState, useEffect } from 'react';
import { Upload, Trash2, BookOpen, Star, Loader } from 'lucide-react';
import { fetchBooks, deleteBook, deleteAllBooks, importBooks100 } from '../api/libraryClient';

export default function AdminBookList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

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
                        <div className="flex items-center gap-4">
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
                          <button onClick={() => handleDelete(b.id)} className="p-2 bg-[#0E0C0A] rounded hover:bg-red-500 hover:text-white text-gray-400 transition-colors">
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
    </div>
  );
}
