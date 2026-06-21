import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, MessageSquare, Flame, Star, ChevronRight, BookOpen, Send, Play, Clock, Loader } from 'lucide-react';
import { fetchBooks } from '../api/libraryClient';

export default function UserLibrary() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([
    { text: "Bonjour ! Quel livre allez-vous dévorer aujourd'hui ?", isBot: true }
  ]);

  useEffect(() => {
      fetchBooks()
        .then(setBooks)
        .catch(console.error)
        .finally(() => setLoading(false));
  }, []);

  const filteredBooks = books.filter(book => {
    const matchesSearch = !searchQuery ||
      book.titre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.auteur?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' ||
      (activeFilter === 'Audiobooks' && book.audio_path) ||
      (activeFilter === 'Nouveautés') ||
      (activeFilter === 'Science-Fiction') ||
      (activeFilter === 'Histoire');
    return matchesSearch && matchesFilter;
  });

  const handleChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages([...chatMessages, { text: chatInput, isBot: false }]);
    setChatInput('');
    setTimeout(() => {
       setChatMessages(prev => [...prev, { text: "Laissez-moi chercher cela dans notre immense collection...", isBot: true }]);
    }, 1000);
  };

  const truncate = (str, len) => str?.length > len ? str.slice(0, len) + '...' : str;

  return (
    <div className="flex-1 relative pb-20 overflow-y-auto custom-scrollbar">
      <div className="px-8 pt-10 pb-4 relative z-20">
        <h1 className="text-5xl font-black text-white mb-8 uppercase tracking-widest drop-shadow-2xl" style={{ textShadow: '0 5px 30px rgba(212,175,55,0.4)' }}>
           Explorez l'Univers
        </h1>

        <div className="flex flex-col md:flex-row gap-6 items-center">
           <div className="flex-1 w-full bg-[#1A1713]/80 backdrop-blur-xl border-2 border-[#D4AF37]/30 rounded-2xl flex items-center px-6 py-4 shadow-[0_0_30px_rgba(212,175,55,0.15)] focus-within:border-[#D4AF37] focus-within:shadow-[0_0_40px_rgba(212,175,55,0.3)] transition-all">
              <Search className="w-8 h-8 text-[#D4AF37]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par Titre, Auteur..."
                className="w-full bg-transparent text-white placeholder-[#D4AF37]/50 ml-6 focus:outline-none font-bold text-lg"
              />
              <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
           </div>

           <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
              {['All', 'Nouveautés', 'Science-Fiction', 'Histoire', 'Audiobooks'].map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all border ${
                    activeFilter === f
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                    : 'bg-[#1C1812] text-gray-400 border-[#2C261A] hover:border-white'
                  }`}
                >
                  {f}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="px-8 mt-8 relative z-10 flex flex-col xl:flex-row gap-12">

        {/* Main Content */}
        <div className="flex-1 space-y-16">

          {/* Section: Tous les livres */}
          <div>
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-bold text-white tracking-wider flex items-center gap-3">
                 <BookOpen className="w-6 h-6 text-[#D4AF37]" /> Livres disponibles
              </h2>
              <span className="text-sm text-gray-500">{filteredBooks.length} ouvrage{filteredBooks.length > 1 ? 's' : ''}</span>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[2/3] bg-[#2C261A] rounded-xl mb-3"></div>
                    <div className="h-4 bg-[#2C261A] rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-[#2C261A] rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="text-center py-16 bg-[#14120E]/50 rounded-2xl border border-[#2C261A]">
                <BookOpen className="w-16 h-16 text-[#D4AF37] mx-auto mb-4 opacity-50" />
                <p className="text-gray-400 text-lg">Aucun livre trouvé.</p>
                {searchQuery && <p className="text-gray-600 text-sm mt-2">Essayez un autre terme de recherche.</p>}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {filteredBooks.map((book, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate(`/book/${book.id}`)}
                    className="group cursor-pointer bg-[#14120E]/80 rounded-xl border border-[#2C261A] overflow-hidden hover:border-[#D4AF37]/50 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all duration-300"
                  >
                    <div className="aspect-[2/3] overflow-hidden bg-[#1C1812] relative">
                      {book.cover_image
                        ? <img src={book.cover_image} alt={book.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        : <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-xs p-4 text-center">{book.titre}</div>
                      }
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0E0C0A]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                        <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                          <Play className="w-3 h-3" /> Découvrir
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-bold text-white truncate group-hover:text-[#D4AF37] transition-colors">{book.titre}</h3>
                      <p className="text-xs text-gray-500 truncate mt-1">{book.auteur}</p>
                      {book.rating > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-gray-400">{book.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full xl:w-[380px] shrink-0 space-y-8">

          {/* Currently Reading */}
          {filteredBooks.length > 0 && (
            <div className="bg-[#14120E]/90 backdrop-blur-xl border border-[#2C261A] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#D4AF37]" /> En cours de lecture
              </h3>
              <div className="flex gap-4">
                <div
                  onClick={() => navigate(`/book/${filteredBooks[0].id}`)}
                  className="w-20 h-28 rounded-lg overflow-hidden shrink-0 border border-[#2C261A] cursor-pointer hover:border-[#D4AF37]/50 transition-colors"
                >
                  {filteredBooks[0].cover_image
                    ? <img src={filteredBooks[0].cover_image} alt={filteredBooks[0].titre} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-[#1C1812] flex items-center justify-center text-[8px] text-gray-500 font-bold p-1 text-center">{filteredBooks[0].titre}</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{filteredBooks[0].titre}</p>
                  <p className="text-xs text-gray-500 truncate">{filteredBooks[0].auteur}</p>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progression</span>
                      <span className="text-[#D4AF37] font-bold">--%</span>
                    </div>
                    <div className="w-full bg-[#0E0C0A] h-1.5 rounded-full overflow-hidden border border-[#2C261A]">
                      <div className="h-full bg-gradient-to-r from-[#D4AF37] to-amber-400 w-0 rounded-full"></div>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/reader/${filteredBooks[0].id}`)} className="mt-3 text-xs text-[#D4AF37] font-bold uppercase tracking-wider hover:text-white transition-colors flex items-center gap-1">
                    Lire <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI Assistant */}
          <div className="flex flex-col h-[420px] bg-[#14120E]/90 backdrop-blur-lg border border-[#2C261A] rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-[#2C261A] flex items-center gap-3">
              <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center border border-[#D4AF37]/20">
                 <MessageSquare className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                 <h3 className="font-bold text-white text-sm">Assistant Bibliothèque</h3>
                 <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    <span className="text-xs text-gray-500">En ligne</span>
                 </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
               {chatMessages.map((msg, i) => (
                 <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${
                      msg.isBot
                        ? 'bg-[#1C1812] text-gray-300 border border-[#2C261A]'
                        : 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20'
                    }`}>
                       {msg.text}
                    </div>
                 </div>
               ))}
            </div>

            <div className="p-4 border-t border-[#2C261A]">
              <form onSubmit={handleChat} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Posez une question..."
                  className="flex-1 bg-[#1C1812] border border-[#2C261A] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition-colors placeholder-gray-600"
                />
                <button type="submit" className="bg-[#D4AF37] hover:bg-white text-black p-2.5 rounded-xl transition-colors">
                  <Send className="w-4 h-4"/>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
