import React, { useState, useEffect } from 'react';
import { Home, LayoutGrid, Star, Clock, FileText, Tag, User, Settings, Play, BookOpen, Trash2, Edit2, Search, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchBooks } from '../api/libraryClient';

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

  return (
  <PageContainer>
    <PageHeader icon={Home} title="Accueil" desc="Votre tableau de bord de lecture personnel." />
    <div className="px-8 mt-4 grid grid-cols-1 xl:grid-cols-3 gap-8 pb-12">
       <div className="xl:col-span-2 space-y-8">

          {loading ? (
            <div className="bg-[#14120E]/80 backdrop-blur-xl border border-[#2C261A] rounded-3xl p-8 animate-pulse">
              <div className="h-6 bg-[#2C261A] rounded w-48 mb-4"></div>
              <div className="h-4 bg-[#2C261A] rounded w-96 mb-8"></div>
              <div className="flex gap-8">
                <div className="w-40 aspect-[2/3] bg-[#2C261A] rounded-xl"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-3 bg-[#2C261A] rounded w-full"></div>
                  <div className="h-2 bg-[#2C261A] rounded w-full"></div>
                  <div className="h-10 bg-[#2C261A] rounded w-48"></div>
                </div>
              </div>
            </div>
          ) : books.length === 0 ? (
            <div className="bg-[#14120E]/80 backdrop-blur-xl border border-[#2C261A] rounded-3xl p-12 text-center">
              <BookOpen className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucun livre disponible pour le moment.</p>
            </div>
          ) : (
          <div className="bg-[#14120E]/80 backdrop-blur-xl border border-[#D4AF37]/20 rounded-3xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden group">
             <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-[50px] group-hover:bg-[#D4AF37]/20 transition-all duration-700"></div>
             <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Reprendre la lecture</h2>
             <p className="text-gray-400 mb-8 relative z-10">Vous étiez à la page {Math.round((books[0]?.total_pages || 300) * 0.45)} de <strong className="text-[#D4AF37]">{books[0]?.titre}</strong>.</p>
             
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-8 relative z-10">
                <Link to={`/book/${books[0]?.id}`} className="w-40 rounded-xl shadow-[0_15px_35px_rgba(0,0,0,0.8)] transform -rotate-3 group-hover:rotate-0 transition-all duration-500 border border-[#2C261A] overflow-hidden">
                   {books[0]?.cover_image
                     ? <img src={books[0].cover_image} alt={books[0].titre} className="w-full h-auto object-cover" />
                     : <div className="w-40 aspect-[2/3] bg-[#1C1812] flex items-center justify-center text-gray-500 text-sm font-bold p-4 text-center">{books[0]?.titre}</div>
                   }
                </Link>
                <div className="flex-1 w-full pb-2">
                   <div className="flex justify-between text-xs text-[#D4AF37] font-bold mb-2 uppercase tracking-widest"><span>Progression</span> <span>45%</span></div>
                   <div className="w-full bg-[#0E0C0A] h-2 rounded-full overflow-hidden mb-6 border border-[#2C261A]">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-[#D4AF37] w-[45%] shadow-[0_0_10px_#D4AF37]"></div>
                   </div>
                   <Link to={`/reader/${books[0]?.id}`} className="inline-flex items-center justify-center gap-2 bg-[#D4AF37] text-black px-8 py-3 rounded-lg font-black uppercase tracking-wider hover:bg-white transition-colors shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                      <Play className="w-5 h-5 fill-black" /> Continuer Mode 3D
                   </Link>
                </div>
              </div>
          </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-[#14120E]/80 backdrop-blur-md border border-[#2C261A] rounded-2xl p-6 hover:border-[#D4AF37]/40 transition-colors shadow-2xl flex items-center justify-between">
                 <div>
                   <h3 className="text-[#D4AF37] font-bold mb-1 uppercase text-xs tracking-wider">Objectif Mensuel</h3>
                   <p className="text-4xl font-black text-white">{books.length} <span className="text-lg text-gray-500 font-normal">/ {Math.max(books.length, 5)} Livres</span></p>
                 </div>
                 <div className="w-16 h-16 rounded-full border-4 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] font-bold">{Math.min(100, Math.round((books.length / Math.max(books.length, 5)) * 100))}%</div>
              </div>
              <div className="bg-[#14120E]/80 backdrop-blur-md border border-[#2C261A] rounded-2xl p-6 hover:border-[#D4AF37]/40 transition-colors shadow-2xl flex items-center justify-between">
                 <div>
                   <h3 className="text-[#D4AF37] font-bold mb-1 uppercase text-xs tracking-wider">Temps de Lecture</h3>
                   <p className="text-4xl font-black text-white">{estimatedHours}<span className="text-lg text-gray-500 font-normal">h</span></p>
                 </div>
                 <Clock className="w-10 h-10 text-[#2C261A]" />
              </div>
          </div>
       </div>
       
       <div className="space-y-6">
          <div className="bg-gradient-to-b from-[#1A1525] to-[#0E0C0A] border border-purple-900/50 rounded-3xl p-6 shadow-[0_0_30px_rgba(147,51,234,0.1)] h-full">
             <h3 className="text-purple-400 font-bold flex items-center gap-2 mb-8 uppercase tracking-widest"><Tag className="w-5 h-5"/> Recommandé par l'IA</h3>
             <div className="space-y-6">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-5 items-center animate-pulse">
                      <div className="w-14 h-20 bg-[#2C261A] rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-[#2C261A] rounded w-24"></div>
                        <div className="h-3 bg-[#2C261A] rounded w-16"></div>
                      </div>
                    </div>
                  ))
                ) : iaRecommendations.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">Aucune recommandation disponible.</p>
                ) : (
                  iaRecommendations.map((bk, i) => (
                  <Link to={`/book/${bk.id}`} key={i} className="flex gap-5 items-center group cursor-pointer bg-[#14120E] p-3 rounded-xl border border-transparent hover:border-purple-500/30 hover:bg-[#1A1525] transition-all">
                    <div className="w-14 h-20 rounded shadow-lg border border-[#2C261A] group-hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all overflow-hidden">
                      {bk.cover_image
                        ? <img src={bk.cover_image} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" alt={bk.titre} />
                        : <div className="w-full h-full bg-[#1C1812] flex items-center justify-center text-[8px] text-gray-500 font-bold p-1 text-center">{bk.titre}</div>
                      }
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-base group-hover:text-purple-300 transition-colors">{bk.titre}</h4>
                      <p className="text-sm text-gray-400">{bk.auteur}</p>
                    </div>
                  </Link>
                  ))
                )}
             </div>
          </div>
       </div>
    </div>
  </PageContainer>
);
};

export const Categories = () => {
  const cats = [
    { name: 'Science-Fiction', count: 1240, color: 'from-blue-900/40 to-[#0E0C0A]' },
    { name: 'Fantaisie', count: 850, color: 'from-purple-900/40 to-[#0E0C0A]' },
    { name: 'Histoire', count: 530, color: 'from-amber-900/40 to-[#0E0C0A]' },
    { name: 'Technologie', count: 1100, color: 'from-green-900/40 to-[#0E0C0A]' },
    { name: 'Philosophie', count: 420, color: 'from-rose-900/40 to-[#0E0C0A]' },
    { name: 'Art & Design', count: 310, color: 'from-teal-900/40 to-[#0E0C0A]' },
    { name: 'Biographies', count: 680, color: 'from-indigo-900/40 to-[#0E0C0A]' },
    { name: 'Business', count: 950, color: 'from-[#D4AF37]/20 to-[#0E0C0A]' },
  ];

  return (
    <PageContainer>
      <PageHeader icon={LayoutGrid} title="Catégories" desc="Parcourez la vaste bibliothèque par genres." />
      <div className="px-8 mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12">
         {cats.map(cat => (
           <div key={cat.name} className={`relative h-40 bg-gradient-to-br ${cat.color} backdrop-blur-md border border-[#2C261A] rounded-2xl p-6 cursor-pointer group overflow-hidden shadow-xl hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:-translate-y-1 transition-all duration-300`}>
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                <LayoutGrid className="w-16 h-16 text-white" />
              </div>
              <div className="h-full flex flex-col justify-end relative z-10">
                <span className="text-xl font-bold text-white group-hover:text-[#D4AF37] transition-colors">{cat.name}</span>
                <span className="text-sm text-gray-400">{cat.count} livres</span>
              </div>
           </div>
         ))}
      </div>
    </PageContainer>
  );
};

export const Favoris = () => (
  <PageContainer>
    <PageHeader icon={Star} title="Favoris" desc="Vos ouvrages précieux conservés ici." />
    <div className="px-8 mt-4 pb-12">
       {/* List Layout */}
       <div className="space-y-4">
         {[
           { title: 'L\'Alchimiste', author: 'Paulo Coelho', added: 'Ajouté hier', img:'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=150' },
           { title: 'Le Petit Prince', author: 'Antoine de Saint-Exupéry', added: 'Il y a 1 semaine', img:'https://images.unsplash.com/photo-1629196914275-f86050b4a4d6?q=80&w=150' },
         ].map((fav, i) => (
            <div key={i} className="flex items-center gap-6 bg-[#14120E]/80 backdrop-blur-md border border-[#2C261A] p-4 rounded-2xl hover:border-[#D4AF37]/50 transition-colors shadow-lg group">
               <div className="w-16 h-24 rounded overflow-hidden shadow-md">
                 <img src={fav.img} alt={fav.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
               </div>
               <div className="flex-1">
                 <h3 className="text-xl font-bold text-white">{fav.title}</h3>
                 <p className="text-gray-400">{fav.author}</p>
                 <p className="text-xs text-[#D4AF37] mt-2">{fav.added}</p>
               </div>
               <div className="px-4 flex gap-3">
                 <button className="w-10 h-10 rounded-full bg-[#1C1812] border border-[#2C261A] flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors">
                   <Play className="w-4 h-4 fill-current"/>
                 </button>
                 <button className="w-10 h-10 rounded-full bg-[#1C1812] border border-[#2C261A] flex items-center justify-center text-red-400 hover:bg-red-400/20 transition-colors">
                   <Trash2 className="w-4 h-4"/>
                 </button>
               </div>
            </div>
         ))}
       </div>
    </div>
  </PageContainer>
);

export const Historiques = () => (
  <PageContainer>
    <PageHeader icon={Clock} title="Historique" desc="Le fil du temps de vos lectures." />
    <div className="px-8 mt-4 pb-12">
       <div className="bg-[#14120E]/80 backdrop-blur-md border border-[#2C261A] rounded-3xl p-8 shadow-2xl relative">
          <div className="absolute left-12 top-8 bottom-8 w-px bg-gradient-to-b from-[#D4AF37] via-[#D4AF37]/20 to-transparent"></div>
          
          <div className="space-y-10 pl-16 pt-4 relative">
             {[
               { book: 'Sapiens', action: 'Lecture continuée', page: 'Page 145', time: 'Il y a 2 heures', icon: BookOpen },
               { book: 'Dune', action: 'Achevé', page: 'Page 890', time: 'Hier', icon: Star },
               { book: '1984', action: 'Ajouté aux favoris', page: '', time: 'Il y a 3 jours', icon: Star },
             ].map((evt, i) => (
               <div key={i} className="relative">
                 <div className="absolute -left-20 top-0 w-8 h-8 rounded-full bg-[#1C1812] border-2 border-[#D4AF37] flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.5)]">
                   <evt.icon className="w-3 h-3 text-[#D4AF37]" />
                 </div>
                 <div className="bg-[#1A1713] border border-[#2C261A] rounded-xl p-5 hover:border-[#D4AF37]/30 transition-colors">
                   <div className="flex justify-between items-start mb-2">
                     <h4 className="text-white font-bold text-lg">{evt.book}</h4>
                     <span className="text-xs text-gray-500 font-medium">{evt.time}</span>
                   </div>
                   <p className="text-gray-400">{evt.action} {evt.page && <span className="text-[#D4AF37] font-bold">— {evt.page}</span>}</p>
                 </div>
               </div>
             ))}
          </div>
       </div>
    </div>
  </PageContainer>
);

export const Notes = () => (
  <PageContainer>
    <PageHeader icon={FileText} title="Notes & Extraits" desc="Le coffre-fort de vos idées littéraires." />
    <div className="px-8 mt-4 pb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
       {[
         { text: "L'histoire a commencé quand les humains ont inventé les dieux, et se terminera quand ils deviendront des dieux.", book: "Sapiens", date: "12 Mai 2026" },
         { text: "Celui qui contrôle le passé contrôle l'avenir. Celui qui contrôle le présent contrôle le passé.", book: "1984", date: "05 Avr 2026" },
         { text: "Je ne dois pas avoir peur. La peur tue l'esprit. La peur est la petite mort qui conduit à l'oblitération totale.", book: "Dune", date: "22 Mar 2026" }
       ].map((note, i) => (
         <div key={i} className="bg-[#14120E] border border-[#2C261A] rounded-2xl p-8 shadow-2xl relative group overflow-hidden hover:border-[#D4AF37]/40 transition-colors">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 text-[120px] text-[#D4AF37]/5 font-serif leading-none select-none">"</div>
            <p className="font-serif italic text-gray-300 text-lg leading-relaxed relative z-10">
              "{note.text}"
            </p>
            <div className="mt-8 pt-4 border-t border-[#2C261A]/50 flex justify-between items-center relative z-10">
               <div>
                 <div className="text-sm text-[#D4AF37] uppercase font-bold tracking-widest">{note.book}</div>
                 <div className="text-xs text-gray-600 mt-1">{note.date}</div>
               </div>
               <button className="text-gray-400 hover:text-white transition-colors p-2"><Edit2 className="w-4 h-4"/></button>
            </div>
         </div>
       ))}
    </div>
  </PageContainer>
);

export const Recommandations = () => (
  <PageContainer>
    <PageHeader icon={Tag} title="IA Recommandations" desc="Une sélection sur-mesure calculée par nos algorithmes." />
    <div className="px-8 mt-4 pb-12">
      <div className="bg-[#14120E]/90 backdrop-blur-md border border-[#D4AF37]/20 rounded-3xl p-10 text-center shadow-[0_0_50px_rgba(212,175,55,0.05)] mb-8">
         <SparklesIcon className="w-16 h-16 text-purple-400 mx-auto mb-6 animate-pulse" />
         <h3 className="text-2xl font-bold text-white mb-2">Analyse de vos préférences en cours...</h3>
         <p className="text-gray-400 max-w-xl mx-auto">L'intelligence artificielle analyse vos 45 dernières lectures pour vous proposer des ouvrages qui correspondent exactement à vos goûts.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Mock Recommended Books */}
        <div className="bg-gradient-to-b from-[#1C1812] to-[#0E0C0A] border border-[#2C261A] rounded-2xl p-6 shadow-xl relative overflow-hidden group">
           <div className="absolute top-4 right-4 bg-purple-500/20 text-purple-300 text-xs font-bold px-2 py-1 rounded border border-purple-500/30">98% Match</div>
           <div className="w-32 h-48 mx-auto rounded-lg shadow-2xl overflow-hidden border border-[#2C261A] mb-6 transform group-hover:-translate-y-2 group-hover:scale-105 transition-all duration-500">
             <img src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=300" className="w-full h-full object-cover" alt="La Peste" />
           </div>
           <h4 className="text-center text-white font-bold text-lg">La Peste</h4>
           <p className="text-center text-[#D4AF37] text-sm mb-6">Albert Camus</p>
           <button className="w-full py-2 bg-transparent border border-[#D4AF37] text-[#D4AF37] rounded-lg font-bold hover:bg-[#D4AF37] hover:text-black transition-colors">Découvrir l'Aperçu</button>
        </div>
      </div>
    </div>
  </PageContainer>
);

const SparklesIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
);

export const Profil = () => {
  const { utilisateur, updateProfile } = useAuth();
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState('success');

  useEffect(() => {
    if (utilisateur) {
      setNom(utilisateur.nom || '');
      setEmail(utilisateur.email || '');
    }
  }, [utilisateur]);

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

  return (
  <PageContainer>
    <PageHeader icon={User} title="Profil Personnel" desc="Identité, badges virtuels et sécurité." />
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
            <p className="text-[#D4AF37] font-bold uppercase tracking-widest text-xs mt-1 mb-6 relative z-10">{(utilisateur?.role || 'membre').charAt(0).toUpperCase() + (utilisateur?.role || 'membre').slice(1)}</p>
            <div className="flex justify-center gap-2 relative z-10">
               <span className="bg-[#1C1812] border border-[#2C261A] text-white px-3 py-1 rounded-full text-xs font-bold">Niveau 12</span>
               <span className="bg-[#1C1812] border border-[#2C261A] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-green-400"/> Vérifié</span>
            </div>
         </div>
       </div>
       
       <div className="lg:col-span-2 bg-[#14120E] border border-[#2C261A] rounded-3xl p-8 shadow-2xl">
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
  </PageContainer>
);
};

export const Parametres = () => (
  <PageContainer>
    <PageHeader icon={Settings} title="Paramètres" desc="Personnalisez votre interface et vos préférences de lecture." />
    <div className="px-8 mt-4 pb-12 max-w-4xl grid gap-6">
       
       <div className="bg-[#14120E] border border-[#2C261A] rounded-3xl p-8 shadow-2xl">
          <h3 className="text-xl font-bold text-[#D4AF37] mb-6">Affichage & Lecture 3D</h3>
          <div className="space-y-6">
            <label className="flex items-center justify-between group cursor-pointer">
               <div>
                 <div className="text-white font-bold group-hover:text-[#D4AF37] transition-colors">Mode Nuit (Immersif) Universel</div>
                 <div className="text-sm text-gray-500 mt-1">Force l\'interface utilisateur en couleurs sombres.</div>
               </div>
               <input type="checkbox" defaultChecked className="w-6 h-6 accent-[#D4AF37] cursor-pointer" />
            </label>
            <hr className="border-[#2C261A]" />
            <label className="flex items-center justify-between group cursor-pointer">
               <div>
                 <div className="text-white font-bold group-hover:text-[#D4AF37] transition-colors">Animations 3D de pages</div>
                 <div className="text-sm text-gray-500 mt-1">Active le moteur de rendu 3D lors du changement de page.</div>
               </div>
               <input type="checkbox" defaultChecked className="w-6 h-6 accent-[#D4AF37] cursor-pointer" />
            </label>
          </div>
       </div>

       <div className="bg-[#14120E] border border-[#2C261A] rounded-3xl p-8 shadow-2xl">
          <h3 className="text-xl font-bold text-[#D4AF37] mb-6">Notifications & IA</h3>
          <div className="space-y-6">
            <label className="flex items-center justify-between group cursor-pointer">
               <div>
                 <div className="text-white font-bold group-hover:text-[#D4AF37] transition-colors">Alertes de Réservation Disponibles</div>
               </div>
               <input type="checkbox" defaultChecked className="w-6 h-6 accent-[#D4AF37] cursor-pointer" />
            </label>
            <hr className="border-[#2C261A]" />
            <label className="flex items-center justify-between group cursor-pointer">
               <div>
                 <div className="text-white font-bold group-hover:text-[#D4AF37] transition-colors">Suggestions IA Avancées</div>
                 <div className="text-sm text-gray-500 mt-1">Permet à l\'IA d'analyser vos notes pour de meilleures recommandations.</div>
               </div>
               <input type="checkbox" defaultChecked className="w-6 h-6 accent-[#D4AF37] cursor-pointer" />
            </label>
          </div>
       </div>

    </div>
  </PageContainer>
);
