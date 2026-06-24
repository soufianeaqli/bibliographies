import React, { useState, useEffect } from 'react';
import { Home, LayoutGrid, Star, Clock, FileText, Tag, User, Play, BookOpen, Book, Trash2, Search, ArrowRight, ShieldCheck, ChevronRight, Sparkles, Heart, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchBooks, getFavoris, removeFavori, reserveBook, getMyBookmarks, deleteBookmark, getCategories, getHistory, getMyReservations, getUnreadNotificationCount } from '../api/libraryClient';
import AdminDashboard from '../components/AdminDashboard';

const PageHeader = ({ icon: Icon, title, desc }) => (
  <div className="px-8 pt-10 pb-6 relative z-10">
    <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-4 tracking-wider uppercase drop-shadow-lg" style={{ textShadow: '0 5px 20px rgba(212,175,55,0.4)' }}>
      <div className="p-3 bg-gradient-to-br from-[#D4AF37]/20 to-transparent rounded-xl border border-[#D4AF37]/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
        <Icon className="w-8 h-8 text-[#D4AF37]" />
      </div>
      {title}
    </h1>
    <p className="text-gray-400 font-medium text-lg ml-20">{desc}</p>
  </div>
);

const PageContainer = ({ children }) => (
  <div className="flex-1 relative pb-20 min-h-screen bg-[#0A0806]">
    {/* Luxurious Background Effects */}
    <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-[#D4AF37]/5 blur-[150px] rounded-full pointer-events-none"></div>
    <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-purple-900/5 blur-[150px] rounded-full pointer-events-none"></div>
    {/* Wooden Texture Overlay Simulation */}
    <div className="fixed inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #1C1812 25%, transparent 25%, transparent 75%, #1C1812 75%, #1C1812), repeating-linear-gradient(45deg, #1C1812 25%, #0E0C0A 25%, #0E0C0A 75%, #1C1812 75%, #1C1812)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }}></div>
    
    <div className="relative z-10 h-full">
      {children}
    </div>
  </div>
);

const getTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

export const Accueil = () => {
  const { utilisateur } = useAuth();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks()
      .then(setBooks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const featuredBooks = books.filter(b => b.is_featured).slice(0, 3);
  const iaRecommendations = featuredBooks.length >= 3 ? featuredBooks : [...featuredBooks, ...books.filter(b => !b.is_featured)].slice(0, 3);
  const totalPages = books.reduce((acc, b) => acc + (b.total_pages || 300), 0);
  const estimatedHours = Math.round(totalPages / 250);
  const uniqueAuthors = [...new Set(books.map(b => b.auteur))].length;
  const recentBooks = books.slice(0, 6);
  const greeting = (h) => h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir';

  if (utilisateur?.role === 'administrateur') return <AdminDashboard />;

  return (
  <PageContainer>
    <div className="px-8 pt-10 pb-6 relative z-10">
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-[#2C261A] rounded w-96"></div>
          <div className="h-5 bg-[#2C261A] rounded w-64"></div>
        </div>
      ) : (
        <>
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-2 tracking-tight">
            {greeting(new Date().getHours())}{utilisateur?.nom ? `, ${utilisateur.nom.split(' ')[0]}` : ''}
            <span className="block text-[#D4AF37] text-2xl lg:text-3xl font-bold mt-1">Bienvenue dans votre bibliothèque</span>
          </h1>
          <p className="text-gray-400 text-lg mt-4 max-w-2xl">
            {books.length > 0
              ? `${books.length} ouvrages disponibles — ${uniqueAuthors} auteurs — ${estimatedHours}h de lecture estimées`
              : 'Explorez, lisez et gérez vos références bibliographiques en toute simplicité.'}
          </p>
        </>
      )}
    </div>

    <div className="px-8 mt-2 grid grid-cols-1 xl:grid-cols-3 gap-8 pb-12">
       <div className="xl:col-span-2 space-y-8">

          {loading ? (
            <div className="bg-[#14120E]/80 backdrop-blur-xl border border-[#2C261A] rounded-3xl p-8 animate-pulse">
              <div className="flex gap-8">
                <div className="w-40 aspect-[2/3] bg-[#2C261A] rounded-xl shrink-0"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-6 bg-[#2C261A] rounded w-48"></div>
                  <div className="h-4 bg-[#2C261A] rounded w-full"></div>
                  <div className="h-4 bg-[#2C261A] rounded w-3/4"></div>
                  <div className="h-10 bg-[#2C261A] rounded w-48 mt-6"></div>
                </div>
              </div>
            </div>
          ) : books.length === 0 ? (
            <div className="bg-[#14120E]/80 backdrop-blur-xl border border-[#2C261A] rounded-3xl p-16 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                <BookOpen className="w-12 h-12 text-[#D4AF37]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Bienvenue dans votre bibliothèque</h2>
              <p className="text-gray-400 max-w-md mx-auto mb-8">Commencez par importer des livres depuis Google Books ou ajoutez vos propres références.</p>
              <Link to="/bibliotheque/livres" className="inline-flex items-center gap-2 bg-[#D4AF37] text-black px-8 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-white transition-all shadow-[0_0_25px_rgba(212,175,55,0.3)]">
                <BookOpen className="w-5 h-5" /> Découvrir la bibliothèque
              </Link>
            </div>
          ) : (
          <div className="bg-gradient-to-br from-[#1C1812] to-[#14120E] border border-[#D4AF37]/20 rounded-3xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative group">
            <div className="absolute -right-32 -top-32 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-[80px] group-hover:bg-[#D4AF37]/20 transition-all duration-700 pointer-events-none"></div>
            <div className="p-8 relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="text-xs text-[#D4AF37] font-bold uppercase tracking-widest">À la une</span>
                  <h2 className="text-2xl font-bold text-white mt-1">{books[0]?.titre}</h2>
                  <p className="text-gray-400 text-sm mt-1">{books[0]?.auteur}</p>
                </div>
                {books[0]?.rating > 0 && (
                  <div className="flex items-center gap-1.5 bg-[#0E0C0A]/60 px-3 py-1.5 rounded-lg border border-[#2C261A]">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-white font-bold text-sm">{books[0].rating}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-8">
                <Link to={`/book/${books[0]?.id}`} className="w-36 shrink-0 rounded-xl overflow-hidden border border-[#2C261A] shadow-[0_15px_35px_rgba(0,0,0,0.8)] transform -rotate-2 group-hover:rotate-0 transition-all duration-500">
                  {books[0]?.cover_image
                    ? <img src={books[0].cover_image} alt={books[0].titre} className="w-full h-auto aspect-[2/3] object-cover" />
                    : <div className="w-full aspect-[2/3] bg-[#1C1812] flex items-center justify-center text-gray-500 text-sm font-bold p-4 text-center">{books[0]?.titre}</div>
                  }
                </Link>
                <div className="flex-1">
                  <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">{books[0]?.description || 'Aucune description disponible.'}</p>
                  <div className="flex flex-wrap gap-3 mt-6">
                    <Link to={`/book/${books[0]?.id}`} className="flex items-center gap-2 bg-[#D4AF37] text-black px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-white transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                      <BookOpen className="w-4 h-4" /> Réserver
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Stats Cards */}
          {!loading && books.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-[#14120E]/80 backdrop-blur-md border border-[#2C261A] rounded-2xl p-6 hover:border-[#D4AF37]/40 transition-all shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#D4AF37] font-bold uppercase text-xs tracking-wider">Collection</h3>
                <BookOpen className="w-6 h-6 text-[#2C261A]" />
              </div>
              <p className="text-4xl font-black text-white">{books.length}</p>
              <p className="text-sm text-gray-500 mt-1">ouvrages disponibles</p>
            </div>
            <div className="bg-[#14120E]/80 backdrop-blur-md border border-[#2C261A] rounded-2xl p-6 hover:border-[#D4AF37]/40 transition-all shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#D4AF37] font-bold uppercase text-xs tracking-wider">Auteurs</h3>
                <User className="w-6 h-6 text-[#2C261A]" />
              </div>
              <p className="text-4xl font-black text-white">{uniqueAuthors}</p>
              <p className="text-sm text-gray-500 mt-1">auteurs uniques</p>
            </div>
            <div className="bg-[#14120E]/80 backdrop-blur-md border border-[#2C261A] rounded-2xl p-6 hover:border-[#D4AF37]/40 transition-all shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#D4AF37] font-bold uppercase text-xs tracking-wider">Lecture</h3>
                <Clock className="w-6 h-6 text-[#2C261A]" />
              </div>
              <p className="text-4xl font-black text-white">~{estimatedHours}<span className="text-xl text-gray-500">h</span></p>
              <p className="text-sm text-gray-500 mt-1">temps estimé</p>
            </div>
          </div>
          )}

          {/* Recently Added / All Books */}
          {!loading && books.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#D4AF37]" /> Derniers ajouts
              </h2>
              <Link to="/bibliotheque/livres" className="text-sm text-[#D4AF37] font-bold hover:text-white transition-colors flex items-center gap-1">
                Voir tout <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {recentBooks.map((book, idx) => (
                <Link key={idx} to={`/book/${book.id}`} className="group">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[#1C1812] border border-[#2C261A] group-hover:border-[#D4AF37]/50 transition-all shadow-lg group-hover:shadow-[0_0_25px_rgba(212,175,55,0.15)]">
                    {book.cover_image
                      ? <img src={book.cover_image} alt={book.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-bold p-2 text-center">{book.titre}</div>
                    }
                  </div>
                  <h3 className="text-sm font-bold text-white mt-2 truncate group-hover:text-[#D4AF37] transition-colors">{book.titre}</h3>
                  <p className="text-xs text-gray-500 truncate">{book.auteur}</p>
                </Link>
              ))}
            </div>
          </div>
          )}
       </div>

       {/* Right Sidebar */}
       <div className="space-y-6">
          {!loading && books.length > 0 && (
          <div className="bg-gradient-to-b from-[#1A1525] to-[#0E0C0A] border border-purple-900/40 rounded-2xl p-6 shadow-[0_0_30px_rgba(147,51,234,0.08)]">
            <h3 className="text-purple-400 font-bold flex items-center gap-2 mb-6 uppercase tracking-widest text-sm">
              <Sparkles className="w-4 h-4" /> Recommandé pour vous
            </h3>
            <div className="space-y-5">
              {iaRecommendations.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">Aucune recommandation disponible.</p>
              ) : (
                iaRecommendations.map((bk, i) => (
                <Link to={`/book/${bk.id}`} key={i} className="flex gap-4 items-center group bg-[#14120E] p-3 rounded-xl border border-transparent hover:border-purple-500/30 hover:bg-[#1A1525] transition-all">
                  <div className="w-12 h-16 rounded-lg overflow-hidden border border-[#2C261A] shrink-0 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all">
                    {bk.cover_image
                      ? <img src={bk.cover_image} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" alt={bk.titre} />
                      : <div className="w-full h-full bg-[#1C1812] flex items-center justify-center text-[7px] text-gray-500 font-bold p-0.5 text-center">{bk.titre}</div>
                    }
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-white font-bold text-sm group-hover:text-purple-300 transition-colors truncate">{bk.titre}</h4>
                    <p className="text-xs text-gray-500 truncate">{bk.auteur}</p>
                  </div>
                </Link>
                ))
              )}
            </div>
          </div>
          )}

          <div className="bg-[#14120E]/80 backdrop-blur-md border border-[#2C261A] rounded-2xl p-6">
            <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-widest">Navigation rapide</h3>
            <div className="space-y-2">
              <Link to="/bibliotheque/livres" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1C1812] border border-[#2C261A] text-gray-300 hover:text-white hover:border-[#D4AF37]/50 transition-all text-sm font-medium">
                <BookOpen className="w-4 h-4 text-[#D4AF37]" /> Bibliothèque complète
              </Link>
              <Link to="/bibliotheque/mes-livres" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1C1812] border border-[#2C261A] text-gray-300 hover:text-white hover:border-[#D4AF37]/50 transition-all text-sm font-medium">
                <BookOpen className="w-4 h-4 text-[#D4AF37]" /> Mes livres réservés
              </Link>
              <Link to="/bibliotheque/historique" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1C1812] border border-[#2C261A] text-gray-300 hover:text-white hover:border-[#D4AF37]/50 transition-all text-sm font-medium">
                <Clock className="w-4 h-4 text-[#D4AF37]" /> Historique de lecture
              </Link>
            </div>
          </div>
       </div>
    </div>
  </PageContainer>
);
};

const categoryColors = {
  'Science-Fiction': 'from-blue-900/40 to-[#0E0C0A]',
  'Fantaisie': 'from-purple-900/40 to-[#0E0C0A]',
  'Histoire': 'from-amber-900/40 to-[#0E0C0A]',
  'Littérature': 'from-green-900/40 to-[#0E0C0A]',
  'Aventure': 'from-teal-900/40 to-[#0E0C0A]',
  'Philosophie': 'from-rose-900/40 to-[#0E0C0A]',
  'Psychologie': 'from-indigo-900/40 to-[#0E0C0A]',
  'Poésie': 'from-[#D4AF37]/20 to-[#0E0C0A]',
};
const defaultColor = 'from-gray-900/40 to-[#0E0C0A]';

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageContainer>
      <PageHeader icon={LayoutGrid} title="Catégories" desc="Parcourez la vaste bibliothèque par genres." />
      <div className="px-8 mt-4 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="h-40 bg-[#14120E]/80 border border-[#2C261A] rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 bg-[#14120E]/50 rounded-2xl border border-[#2C261A]">
            <LayoutGrid className="w-16 h-16 text-[#D4AF37] mx-auto mb-4 opacity-40" />
            <p className="text-gray-400 text-lg mb-2">Aucune catégorie</p>
            <p className="text-gray-600 text-sm">Les genres apparaîtront quand les livres seront importés.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map(cat => (
              <div
                key={cat.genre}
                onClick={() => navigate(`/bibliotheque/livres?genre=${encodeURIComponent(cat.genre)}`)}
                className={`relative h-40 bg-gradient-to-br ${categoryColors[cat.genre] || defaultColor} backdrop-blur-md border border-[#2C261A] rounded-2xl p-6 cursor-pointer group overflow-hidden shadow-xl hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:-translate-y-1 transition-all duration-300`}
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                  <LayoutGrid className="w-16 h-16 text-white" />
                </div>
                <div className="h-full flex flex-col justify-end relative z-10">
                  <span className="text-xl font-bold text-white group-hover:text-[#D4AF37] transition-colors">{cat.genre}</span>
                  <span className="text-sm text-gray-400">{cat.count} livre{cat.count > 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export const Favoris = () => {
  const [favoris, setFavoris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reservingIds, setReservingIds] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    getFavoris()
      .then(setFavoris)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (id) => {
    try {
      await removeFavori(id);
      setFavoris(prev => prev.filter(f => f.reference_id !== id));
    } catch {}
  };

  const handleReserve = async (bookId) => {
    setReservingIds(prev => new Set(prev).add(bookId));
    try {
      await reserveBook(bookId);
      alert('Livre réservé avec succès !');
    } catch (e) {
      alert(e?.response?.data?.message || 'Erreur lors de la réservation.');
    } finally {
      setReservingIds(prev => { const s = new Set(prev); s.delete(bookId); return s; });
    }
  };

  return (
    <PageContainer>
      <PageHeader icon={Star} title="Favoris" desc="Vos ouvrages précieux conservés ici." />
      <div className="px-8 mt-4 pb-12">
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-6 bg-[#14120E]/80 border border-[#2C261A] p-4 rounded-2xl animate-pulse">
                <div className="w-16 h-24 rounded bg-[#2C261A]"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-[#2C261A] rounded w-48"></div>
                  <div className="h-4 bg-[#2C261A] rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
        ) : favoris.length === 0 ? (
          <div className="text-center py-20 bg-[#14120E]/50 rounded-2xl border border-[#2C261A]">
            <Heart className="w-16 h-16 text-[#D4AF37] mx-auto mb-4 opacity-40" />
            <p className="text-gray-400 text-lg mb-2">Aucun favori</p>
            <p className="text-gray-600 text-sm">Ajoutez des livres à vos favoris depuis la bibliothèque.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {favoris.map((fav) => {
              const book = fav.reference;
              if (!book) return null;
              const cover = book.cover_image;
              const timeAgo = getTimeAgo(fav.created_at);
              const isReserving = reservingIds.has(book.id);
              return (
                <div key={fav.id} className="flex items-center gap-6 bg-[#14120E]/80 backdrop-blur-md border border-[#2C261A] p-4 rounded-2xl hover:border-[#D4AF37]/50 transition-colors shadow-lg group">
                  <div
                    onClick={() => navigate(`/book/${book.id}`)}
                    className="w-16 h-24 rounded overflow-hidden shadow-md cursor-pointer shrink-0"
                  >
                    {cover
                      ? <img src={cover} alt={book.titre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      : <div className="w-full h-full bg-[#1C1812] flex items-center justify-center text-[8px] text-gray-500 font-bold p-1 text-center">{book.titre}</div>
                    }
                  </div>
                  <div
                    onClick={() => navigate(`/book/${book.id}`)}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <h3 className="text-xl font-bold text-white truncate group-hover:text-[#D4AF37] transition-colors">{book.titre}</h3>
                    <p className="text-gray-400 truncate">{book.auteur}</p>
                    <p className="text-xs text-[#D4AF37] mt-2">{timeAgo}</p>
                  </div>
                  <div className="px-4 flex gap-3 shrink-0">
                    <button
                      onClick={() => handleReserve(book.id)}
                      disabled={isReserving}
                      className="w-10 h-10 rounded-full bg-[#1C1812] border border-[#2C261A] flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors disabled:opacity-50"
                    >
                      {isReserving
                        ? <Loader className="w-4 h-4 animate-spin" />
                        : <BookOpen className="w-4 h-4" />
                      }
                    </button>
                    <button
                      onClick={() => handleRemove(fav.reference_id)}
                      className="w-10 h-10 rounded-full bg-[#1C1812] border border-[#2C261A] flex items-center justify-center text-red-400 hover:bg-red-400/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export const Historiques = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getHistory()
      .then(setHistory)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getActionLabel = (pct) => {
    if (pct >= 100) return 'Achevé';
    if (pct > 0) return 'Lecture continuée';
    return 'Ouverture';
  };

  const getActionIcon = (pct) => {
    if (pct >= 100) return Star;
    return BookOpen;
  };

  return (
    <PageContainer>
      <PageHeader icon={Clock} title="Historique" desc="Le fil du temps de vos lectures." />
      <div className="px-8 mt-4 pb-12">
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-[#14120E]/80 border border-[#2C261A] rounded-2xl p-8 animate-pulse">
                <div className="h-4 bg-[#2C261A] rounded w-48 mb-4"></div>
                <div className="h-3 bg-[#2C261A] rounded w-full mb-2"></div>
                <div className="h-3 bg-[#2C261A] rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20 bg-[#14120E]/50 rounded-2xl border border-[#2C261A]">
            <Clock className="w-16 h-16 text-[#D4AF37] mx-auto mb-4 opacity-40" />
            <p className="text-gray-400 text-lg mb-2">Aucun historique</p>
            <p className="text-gray-600 text-sm">Ouvrez un livre dans le lecteur pour voir votre historique.</p>
          </div>
        ) : (
          <div className="bg-[#14120E]/80 backdrop-blur-md border border-[#2C261A] rounded-3xl p-8 shadow-2xl relative">
            <div className="absolute left-12 top-8 bottom-8 w-px bg-gradient-to-b from-[#D4AF37] via-[#D4AF37]/20 to-transparent"></div>
            <div className="space-y-10 pl-16 pt-4 relative">
              {history.map((entry, i) => {
                const Icon = getActionIcon(entry.progress_percentage);
                const book = entry.reference;
                const pageLabel = entry.last_page_read > 0 ? `Page ${entry.last_page_read + 1}` : '';
                const pctLabel = entry.progress_percentage > 0 ? `${Math.round(entry.progress_percentage)}%` : '';
                return (
                  <div key={entry.id} className="relative">
                    <div className="absolute -left-20 top-0 w-8 h-8 rounded-full bg-[#1C1812] border-2 border-[#D4AF37] flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.5)]">
                      <Icon className="w-3 h-3 text-[#D4AF37]" />
                    </div>
                    <div
                      onClick={() => book && navigate(`/reader/${book.id}`)}
                      className="bg-[#1A1713] border border-[#2C261A] rounded-xl p-5 hover:border-[#D4AF37]/30 transition-colors cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-bold text-lg">{book?.titre || 'Livre supprimé'}</h4>
                        <span className="text-xs text-gray-500 font-medium">{getTimeAgo(entry.updated_at)}</span>
                      </div>
                      <p className="text-gray-400">
                        {getActionLabel(entry.progress_percentage)}
                        {pageLabel && <span className="text-[#D4AF37] font-bold"> — {pageLabel}</span>}
                        {pctLabel && <span className="text-gray-500 ml-2">({pctLabel})</span>}
                      </p>
                      {book?.auteur && (
                        <p className="text-xs text-gray-600 mt-1">{book.auteur}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export const Notes = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBookmarks()
      .then(setBookmarks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteBookmark = async (id) => {
    try {
      await deleteBookmark(id);
      setBookmarks(prev => prev.filter(b => b.id !== id));
    } catch {}
  };

  return (
  <PageContainer>
    <PageHeader icon={FileText} title="Notes & Extraits" desc="Le coffre-fort de vos idées littéraires." />
    <div className="px-8 mt-4 pb-12">
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-[#14120E]/80 border border-[#2C261A] rounded-2xl p-8 animate-pulse">
              <div className="h-4 bg-[#2C261A] rounded w-48 mb-4"></div>
              <div className="h-3 bg-[#2C261A] rounded w-full mb-2"></div>
              <div className="h-3 bg-[#2C261A] rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="text-center py-20 bg-[#14120E]/50 rounded-2xl border border-[#2C261A]">
          <FileText className="w-16 h-16 text-[#D4AF37] mx-auto mb-4 opacity-40" />
          <p className="text-gray-400 text-lg mb-2">Aucune note</p>
          <p className="text-gray-600 text-sm">Ajoutez des marque-pages dans vos livres pour les retrouver ici.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookmarks.map(bm => (
            <div key={bm.id} className="bg-[#14120E] border border-[#2C261A] rounded-2xl p-8 shadow-2xl relative group overflow-hidden hover:border-[#D4AF37]/40 transition-colors">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 text-[120px] text-[#D4AF37]/5 font-serif leading-none select-none">"</div>
              {bm.page_text && (
                <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-4 relative z-10">
                  {bm.page_text}
                </p>
              )}
              <div className="relative z-10">
                {bm.note ? (
                  <p className="font-serif italic text-gray-300 text-lg leading-relaxed">
                    "{bm.note}"
                  </p>
                ) : (
                  <p className="text-gray-500 text-xs italic">Aucune note</p>
                )}
              </div>
              <div className="mt-6 pt-4 border-t border-[#2C261A]/50 flex justify-between items-center relative z-10">
                <div>
                  <div className="text-sm text-[#D4AF37] uppercase font-bold tracking-widest">
                    {bm.reference?.titre || 'Livre'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Page {bm.page_number}
                    {bm.reference?.auteur && <span className="ml-2">— {bm.reference.auteur}</span>}
                  </div>
                  <div className="text-[10px] text-gray-600 mt-1">
                    {bm.created_at ? new Date(bm.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                  </div>
                </div>
                <button onClick={() => handleDeleteBookmark(bm.id)}
                  className="p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 hover:bg-red-500/10"
                  style={{ color: '#ef4444' }}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </PageContainer>
  );
};

export const Recommandations = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [userGenres, setUserGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchBooks(),
      getFavoris().catch(() => []),
      getHistory().catch(() => []),
    ]).then(([allBooks, favoris, history]) => {
      setBooks(allBooks);

      const favGenres = favoris.map(f => f.reference?.genre).filter(Boolean);
      const histGenres = history.map(h => h.reference?.genre).filter(Boolean);
      const allUserGenres = [...favGenres, ...histGenres];
      const genreCounts = {};
      allUserGenres.forEach(g => { genreCounts[g] = (genreCounts[g] || 0) + 1; });
      const sorted = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).map(e => e[0]);
      setUserGenres(sorted.slice(0, 3));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader icon={Tag} title="Recommandations" desc="Livres sélectionnés pour vous." />
        <div className="px-8 mt-4 pb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 bg-[#1C1812] rounded-2xl animate-pulse border border-[#2C261A]" />
          ))}
        </div>
      </PageContainer>
    );
  }

  const topRated = [...books].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6);
  const genreBooks = userGenres.length > 0
    ? [...books].filter(b => userGenres.includes(b.genre)).sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6)
    : [];

  return (
    <PageContainer>
      <PageHeader icon={Tag} title="Recommandations" desc="Livres sélectionnés pour vous." />

      {genreBooks.length > 0 && (
      <div className="px-8 mt-4 pb-8">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-purple-400" /> Dans vos genres favoris
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {genreBooks.map((book) => (
            <BookCard key={book.id} book={book} navigate={navigate} badge="Recommandé" badgeColor="purple" />
          ))}
        </div>
      </div>
      )}

      <div className="px-8 mt-2 pb-12">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
          <Star className="w-5 h-5 text-yellow-400" /> Les mieux notés
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topRated.map((book) => (
            <BookCard key={book.id} book={book} navigate={navigate} badge={`${book.rating || '?'}/5`} badgeColor="yellow" />
          ))}
        </div>
      </div>
    </PageContainer>
  );
};

const BookCard = ({ book, navigate, badge, badgeColor }) => {
  const badgeColors = {
    purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  };

  return (
    <div
      onClick={() => navigate(`/book/${book.id}`)}
      className="bg-gradient-to-b from-[#1C1812] to-[#0E0C0A] border border-[#2C261A] rounded-2xl p-6 shadow-xl relative overflow-hidden group cursor-pointer hover:border-[#D4AF37]/50 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all duration-300"
    >
      <div className={`absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded border ${badgeColors[badgeColor] || badgeColors.purple}`}>
        {badge}
      </div>
      <div className="w-32 h-48 mx-auto rounded-lg shadow-2xl overflow-hidden border border-[#2C261A] mb-6 transform group-hover:-translate-y-2 group-hover:scale-105 transition-all duration-500">
        {book.cover_image
          ? <img src={book.cover_image} className="w-full h-full object-cover" alt={book.titre} />
          : <div className="w-full h-full bg-[#1C1812] flex items-center justify-center text-gray-500 text-xs font-bold p-4 text-center">{book.titre}</div>
        }
      </div>
      <h4 className="text-center text-white font-bold text-lg truncate">{book.titre}</h4>
      <p className="text-center text-[#D4AF37] text-sm mb-3 truncate">{book.auteur}</p>
      {book.genre && (
        <p className="text-center text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-4">{book.genre}</p>
      )}
      <button className="w-full py-2.5 bg-transparent border border-[#D4AF37] text-[#D4AF37] rounded-lg font-bold hover:bg-[#D4AF37] hover:text-black transition-colors text-sm">
        Découvrir
      </button>
    </div>
  );
};

export const Profil = () => {
  const { utilisateur, updateProfile } = useAuth();
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState('success');
  const [stats, setStats] = useState({ livresLus: 0, livresCompletes: 0, pagesLues: 0, favoris: 0, signets: 0, reservations: 0, nonLues: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (utilisateur) {
      setNom(utilisateur.nom || '');
      setEmail(utilisateur.email || '');
      chargerStats();
    }
  }, [utilisateur]);

  const chargerStats = async () => {
    setLoadingStats(true);
    try {
      const [history, favoris, bookmarks, reservations, notifCount] = await Promise.all([
        getHistory(),
        getFavoris(),
        getMyBookmarks(),
        getMyReservations(),
        getUnreadNotificationCount(),
      ]);
      const livresLus = history?.length || 0;
      const livresCompletes = history?.filter(h => (h.progress_percentage || 0) >= 100).length || 0;
      const pagesLues = history?.reduce((acc, h) => acc + (h.last_page_read || 0), 0) || 0;
      setStats({
        livresLus,
        livresCompletes,
        pagesLues,
        favoris: favoris?.length || 0,
        signets: bookmarks?.length || 0,
        reservations: reservations?.length || 0,
        nonLues: notifCount?.count || 0,
      });
    } catch {
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        nom,
        email,
        motDePasse: motDePasse || undefined,
        motDePasseConfirmation: motDePasse || undefined,
      });
      setMessage('Profil mis à jour avec succès !');
      setMsgType('success');
      setMotDePasse('');
    } catch {
      setMessage('Erreur lors de la mise à jour.');
      setMsgType('error');
    }
  };

  const statCards = [
    { label: 'Livres lus', value: stats.livresLus, icon: BookOpen, color: 'text-[#D4AF37]' },
    { label: 'Terminés', value: stats.livresCompletes, icon: ShieldCheck, color: 'text-green-400' },
    { label: 'Pages lues', value: stats.pagesLues, icon: FileText, color: 'text-blue-400' },
    { label: 'Favoris', value: stats.favoris, icon: Star, color: 'text-yellow-400' },
    { label: 'Signets', value: stats.signets, icon: Book, color: 'text-purple-400' },
    { label: 'Réservations', value: stats.reservations, icon: Clock, color: 'text-amber-400' },
  ];

  return (
  <PageContainer>
    <PageHeader icon={User} title="Profil Personnel" desc="Identité, statistiques et sécurité." />
    <div className="px-8 mt-4 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
       <div className="lg:col-span-1 space-y-6">
         <div className="bg-[#14120E] border border-[#2C261A] rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/10 to-transparent opacity-50 pointer-events-none"></div>
            <div className="w-32 h-32 mx-auto rounded-full p-1 bg-gradient-to-tr from-[#D4AF37] to-amber-200 mb-6 relative z-10 shadow-[0_0_30px_rgba(212,175,55,0.4)]">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#0E0C0A]">
                 <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(utilisateur?.nom || 'User')}&background=1C1812&color=D4AF37&size=256`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-white relative z-10">{utilisateur?.nom || 'Utilisateur'}</h3>
            <p className="text-[#D4AF37] font-bold uppercase tracking-widest text-xs mt-1 mb-4 relative z-10">{utilisateur?.email}</p>
            <div className="flex justify-center gap-2 relative z-10">
               {utilisateur?.date_creation && (
                 <span className="bg-[#1C1812] border border-[#2C261A] text-gray-400 px-3 py-1 rounded-full text-[11px] font-medium">
                   Membre depuis {new Date(utilisateur.date_creation).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                 </span>
               )}
            </div>
         </div>

         {/* Stats */}
         <div className="bg-[#14120E] border border-[#2C261A] rounded-3xl p-6 shadow-2xl">
           <h3 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-4">Statistiques</h3>
           {loadingStats ? (
             <div className="space-y-3">
               {Array.from({ length: 6 }).map((_, i) => (
                 <div key={i} className="h-10 bg-[#1C1812] rounded-xl animate-pulse" />
               ))}
             </div>
           ) : (
             <div className="space-y-2">
               {statCards.map((s, i) => (
                 <div key={i} className="flex items-center justify-between bg-[#1C1812] rounded-xl px-4 py-3 border border-[#2C261A]">
                   <div className="flex items-center gap-3">
                     <s.icon className={`w-4 h-4 ${s.color}`} />
                     <span className="text-sm text-gray-400">{s.label}</span>
                   </div>
                   <span className="text-white font-bold text-lg">{s.value}</span>
                 </div>
               ))}
             </div>
           )}
         </div>
       </div>

       <div className="lg:col-span-2 space-y-6">
         <div className="bg-[#14120E] border border-[#2C261A] rounded-3xl p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-[#2C261A] pb-4">Informations de Connexion</h3>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
               {message && (
                 <div className={`px-4 py-3 rounded-xl text-sm font-bold border ${
                   msgType === 'success'
                     ? 'bg-[#D4AF37]/10 border-[#D4AF37]/50 text-[#D4AF37]'
                     : 'bg-red-900/20 border-red-500/30 text-red-400'
                 }`}>
                   {message}
                 </div>
               )}
               <div>
                  <label className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-2 block">Nom Complet</label>
                  <input
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full bg-[#1C1812] border border-[#2C261A] rounded-xl p-4 text-white focus:outline-none focus:border-[#D4AF37] transition-colors shadow-inner"
                  />
               </div>
               <div>
                  <label className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-2 block">Adresse Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#1C1812] border border-[#2C261A] rounded-xl p-4 text-white focus:outline-none focus:border-[#D4AF37] transition-colors shadow-inner"
                  />
               </div>
               <div>
                  <label className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-2 block">Nouveau mot de passe (optionnel)</label>
                  <input
                    type="password"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    placeholder="Laisser vide pour conserver l'actuel"
                    className="w-full bg-[#1C1812] border border-[#2C261A] rounded-xl p-4 text-white focus:outline-none focus:border-[#D4AF37] transition-colors shadow-inner"
                  />
               </div>
               <button type="submit" className="bg-[#D4AF37] text-black font-black uppercase tracking-wider text-sm px-8 py-4 rounded-xl hover:bg-white hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all">Mettre à jour le profil</button>
            </form>
         </div>
       </div>
    </div>
  </PageContainer>
  );
};
