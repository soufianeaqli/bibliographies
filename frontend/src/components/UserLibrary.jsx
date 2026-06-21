import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Search, Bell, Sparkles, MessageSquare, Flame, Trophy, PlayCircle, Headphones, Star, ChevronRight, BookOpen, Send, Clock, Book } from 'lucide-react';
import { fetchBooks } from '../api/libraryClient';

export default function UserLibrary({ recommendations = [] }) {
  const [readingProgress, setReadingProgress] = useState(45);
  const [activeFilter, setActiveFilter] = useState('All');
  const [chatInput, setChatInput] = useState('');
  const [books, setBooks] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    { text: "Bonjour ! Quel livre allez-vous dévorer aujourd'hui ?", isBot: true }
  ]);

  useEffect(() => {
      fetchBooks().then(setBooks).catch(console.error);
  }, []);

  const handleChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages([...chatMessages, { text: chatInput, isBot: false }]);
    setChatInput('');
    setTimeout(() => {
       setChatMessages(prev => [...prev, { text: "Laissez-moi chercher cela dans notre immense collection...", isBot: true }]);
    }, 1000);
  };

  return (
    <div className="flex-1 relative pb-20 overflow-y-auto custom-scrollbar">
      {/* Search Header for Book Discovery */}
      <div className="px-8 pt-10 pb-4 relative z-20">
        <h1 className="text-5xl font-black text-white mb-8 uppercase tracking-widest drop-shadow-2xl" style={{ textShadow: '0 5px 30px rgba(212,175,55,0.4)' }}>
           Explorez l'Univers
        </h1>
        
        <div className="flex flex-col md:flex-row gap-6 items-center">
           <div className="flex-1 w-full bg-[#1A1713]/80 backdrop-blur-xl border-2 border-[#D4AF37]/30 rounded-2xl flex items-center px-6 py-4 shadow-[0_0_30px_rgba(212,175,55,0.15)] focus-within:border-[#D4AF37] focus-within:shadow-[0_0_40px_rgba(212,175,55,0.3)] transition-all">
              <Search className="w-8 h-8 text-[#D4AF37]" />
              <input 
                type="text" 
                placeholder="Discutez avec l'IA ou recherchez par Titre, Auteur, Catégorie..." 
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
        
        {/* Left Column (Library Rows) */}
        <div className="flex-1 space-y-16">
          
          {/* Trending Books */}
          <div>
            <div className="flex justify-between items-end mb-8 border-b border-[#2C261A] pb-4">
              <h2 className="text-3xl font-black text-white tracking-widest uppercase flex items-center gap-3">
                 <Flame className="w-8 h-8 text-orange-500 dropping-shadow" /> Tendances
              </h2>
              <button className="text-sm font-bold text-[#D4AF37] hover:text-white transition-colors flex items-center">Voir tout <ChevronRight className="w-4 h-4"/></button>
            </div>
            
            <div className="flex gap-8 overflow-x-auto pb-8 pt-4 custom-scrollbar px-4 -mx-4 items-center">
              {books.slice(0, 4).map((book, idx) => (
                <div key={`trend-${idx}`} className="w-48 shrink-0 group perspective-1000">
                  <div className="relative rounded-lg mb-4 aspect-[2/3] transform-style-3d group-hover:rotate-y-12 transition-all duration-700 shadow-[20px_20px_30px_rgba(0,0,0,0.8)] border border-[#2C261A] group-hover:border-[#D4AF37]/50 group-hover:shadow-[0_0_40px_rgba(212,175,55,0.4)]">
                    
                    {/* Spine Effect */}
                    <div className="absolute top-0 bottom-0 left-0 w-2 bg-gradient-to-r from-black/80 to-transparent z-10"></div>
                    
                    {book.cover_image 
                      ? <img src={book.cover_image} alt={book.titre} className="w-full h-full object-cover rounded-lg" />
                      : <div className="w-full h-full bg-[#1C1812] flex items-center justify-center rounded-lg text-gray-500 font-bold uppercase tracking-widest text-center px-4">{book.titre}</div>
                    }
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E0C0A] via-transparent to-transparent opacity-80"></div>
                    
                    {/* Floating Info inside Book Card on Hover */}
                    <div className="absolute inset-0 bg-[#0E0C0A]/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center items-center gap-4 p-4 rounded-lg">
                       <Link to="/reader" className="w-full flex items-center justify-center gap-2 py-3 bg-[#D4AF37] text-black font-black uppercase tracking-widest text-xs rounded shadow-[0_0_20px_rgba(212,175,55,0.6)] hover:bg-white hover:scale-105 transition-all">
                         <BookOpen className="w-4 h-4"/> 3D Read
                       </Link>
                       {book.audio_path && (
                         <button className="w-full flex items-center justify-center gap-2 py-2 border-2 border-white/20 text-white font-bold uppercase tracking-widest text-[10px] rounded hover:border-white transition-all">
                           <Headphones className="w-3 h-3"/> Extrait
                         </button>
                       )}
                    </div>
                    {/* Bookmark Badge */}
                    <button className="absolute top-0 right-4 translate-y-[-10px] group-hover:translate-y-0 text-gray-500 hover:text-[#D4AF37] transition-all opacity-0 group-hover:opacity-100">
                      <Bookmark className="w-8 h-8 fill-current" />
                    </button>
                  </div>
                  <h3 className="text-lg font-bold text-white truncate group-hover:text-[#D4AF37] transition-colors">{book.titre}</h3>
                  <p className="text-sm text-gray-400 truncate font-medium">{book.auteur}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommended */}
          <div>
            <div className="flex justify-between items-end mb-8 border-b border-[#2C261A] pb-4">
              <h2 className="text-3xl font-black text-white tracking-widest uppercase flex items-center gap-3">
                 <Sparkles className="w-8 h-8 text-purple-400" /> Recommandé Pour Vous
              </h2>
            </div>
             <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
              {books.slice(4, 10).map((book, idx) => (
                <div key={`ai-${idx}`} className="w-80 shrink-0 group">
                  <div className="flex bg-[#14120E] border border-transparent group-hover:border-purple-500/50 rounded-xl overflow-hidden shadow-xl group-hover:shadow-[0_0_30px_rgba(147,51,234,0.2)] transition-all">
                    <div className="w-32 h-44 shrink-0 shadow-[10px_0_15px_rgba(0,0,0,0.5)] z-10 border-r border-[#2C261A] overflow-hidden">
                       {book.cover_image 
                         ? <img src={book.cover_image} alt={book.titre} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                         : <div className="w-full h-full bg-[#1C1812] flex items-center justify-center text-xs text-gray-500 p-2 text-center font-bold">{book.titre}</div>
                       }
                    </div>
                    <div className="p-4 flex flex-col justify-center w-full relative overflow-hidden">
                         {/* Subtle AI Glow */}
                         <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl group-hover:bg-purple-500/20 transition-colors"></div>
                         
                         <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-300 transition-colors relative z-10 truncate">{book.titre}</h3>
                         <p className="text-sm text-gray-400 mb-4 relative z-10 truncate">{book.auteur}</p>
                         <button className="w-full py-2 bg-transparent border border-purple-900 text-purple-300 text-xs font-bold uppercase tracking-widest rounded hover:bg-purple-900/50 hover:text-white transition-colors relative z-10">
                            Ajouter / Réserver
                         </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Community, Personal & Gamification) */}
        <div className="w-full xl:w-[450px] shrink-0 space-y-10 relative">
           
           {/* Gamification / Reading History */}
           <div className="bg-[#14120E]/90 backdrop-blur-xl border border-[#D4AF37]/30 rounded-3xl p-8 shadow-[0_0_40px_rgba(212,175,55,0.08)] relative overflow-hidden group">
             {/* Decorative Background Icon */}
             <Trophy className="absolute -right-8 -top-8 w-48 h-48 text-[#D4AF37]/5 group-hover:text-[#D4AF37]/10 transition-colors transform -rotate-12 pointer-events-none" />

             <div className="flex justify-between items-center mb-8 relative z-10">
               <h3 className="font-black text-xl text-[#D4AF37] uppercase tracking-widest flex items-center gap-3">
                 <Book className="w-6 h-6"/> Vos Succès
               </h3>
               <span className="text-xs font-black bg-[#D4AF37] text-black px-3 py-1 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]">NIVEAU 12</span>
             </div>
             
             <div className="mb-8 relative z-10">
               <div className="flex justify-between items-end mb-3">
                 <p className="text-sm text-gray-300 font-bold uppercase tracking-wider">Livre en cours : <span className="text-white">Sapiens</span></p>
                 <span className="text-xl font-black text-[#D4AF37]">{readingProgress}%</span>
               </div>
               
               <div className="flex items-center gap-4 mb-4">
                 <div className="flex-1 bg-[#0E0C0A] p-1 rounded-full border border-[#2C261A]">
                     <div className="bg-gradient-to-r from-orange-500 to-[#D4AF37] h-3 rounded-full shadow-[0_0_10px_#D4AF37] transition-all duration-1000" style={{ width: `${readingProgress}%`}}></div>
                 </div>
               </div>
               <Link to="/reader" className="text-xs text-gray-500 uppercase tracking-widest font-bold hover:text-[#D4AF37] transition-colors flex items-center gap-1 group-hover:underline">
                 Mettre à jour la progression <ChevronRight className="w-3 h-3"/>
               </Link>
             </div>

             <div className="grid grid-cols-3 gap-4 text-center relative z-10">
                <div className="bg-[#1a1713] p-4 rounded-xl border border-[#2C261A] hover:border-[#D4AF37]/50 hover:bg-[#1C1812] transition-colors shadow-inner cursor-help tooltip" title="Liseur d'Or - Vous avez lu 100 heures">
                  <div className="text-3xl mb-2 drop-shadow-lg">🥇</div>
                  <div className="text-[9px] uppercase text-gray-400 font-bold tracking-widest">Liseur d'Or</div>
                </div>
                <div className="bg-[#1a1713] p-4 rounded-xl border border-[#2C261A] hover:border-[#D4AF37]/50 hover:bg-[#1C1812] transition-colors shadow-inner cursor-help tooltip" title="Explorateur - Streak de 10 jours">
                  <div className="text-3xl mb-2 drop-shadow-lg">🔥</div>
                  <div className="text-[9px] uppercase text-gray-400 font-bold tracking-widest">10 Jours</div>
                </div>
                <div className="bg-[#1a1713] p-4 rounded-xl border border-[#2C261A] hover:border-[#D4AF37]/50 hover:bg-[#1C1812] transition-colors shadow-inner cursor-help tooltip" title="Curieux - Découverte de 5 catégories">
                  <div className="text-3xl mb-2 drop-shadow-lg">🧠</div>
                  <div className="text-[9px] uppercase text-gray-400 font-bold tracking-widest">Curieux</div>
                </div>
             </div>
           </div>

           {/* AI Assistant Chatbot Interactif */}
           <div className="flex flex-col h-[400px] bg-gradient-to-b from-[#1C1326]/90 to-[#0E0C0A]/90 backdrop-blur-lg border border-purple-900/50 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] shadow-purple-900/20">
             
             {/* Chat Header */}
             <div className="p-6 border-b border-purple-500/20 bg-purple-900/10 flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                   <MessageSquare className="w-6 h-6 text-purple-300" />
                </div>
                <div>
                   <h3 className="font-black text-white text-lg uppercase tracking-wider">Bibliothécaire IA</h3>
                   <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e] animate-pulse"></span>
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">En Ligne</span>
                   </div>
                </div>
             </div>
             
             {/* Chat Messages */}
             <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                     <div className={`max-w-[80%] p-3 rounded-2xl ${msg.isBot ? 'bg-purple-900/30 text-gray-300 rounded-tl-sm border border-purple-500/20' : 'bg-[#D4AF37]/20 text-[#D4AF37] rounded-tr-sm border border-[#D4AF37]/30'}`}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                     </div>
                  </div>
                ))}
             </div>

             {/* Chat Input */}
             <div className="p-4 bg-black/40 border-t border-purple-900/30">
               <form onSubmit={handleChat} className="flex gap-2">
                 <input 
                   type="text" 
                   value={chatInput}
                   onChange={(e) => setChatInput(e.target.value)}
                   placeholder="Posez une question sur un livre..." 
                   className="flex-1 bg-[#1A1713] border border-purple-900/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors" 
                 />
                 <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)]">
                   <Send className="w-5 h-5"/>
                 </button>
               </form>
             </div>
           </div>

        </div>
      </div>
      
      {/* Required CSS additions for 3D layout are expected to be in App.css / index.css, 
          specifically .perspective-1000 and .transform-style-3d 
       */}
    </div>
  );
}
