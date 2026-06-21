import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, BarChart3, Upload, Film, Headphones, 
  Settings, CheckCircle, XCircle, Clock, Trash2, Edit, Plus, 
  FolderPlus, UserPlus, Image as ImageIcon, Video, Mic, Share2, 
  TrendingUp, Award, StopCircle
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale, Filler, BarElement
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import AdminMediaUpload from './AdminMediaUpload';
import { fetchBooks, deleteBook, importBooksFromGoogle } from '../api/libraryClient';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale, Filler, BarElement);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [books, setBooks] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '', visible: false });

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  const loadBooks = async () => {
      try {
          const data = await fetchBooks();
          setBooks(data);
      } catch (err) {
          console.error("Erreur de chargement des livres:", err);
      }
  };

  useEffect(() => {
      loadBooks();
  }, []);

  const handleDelete = async (id) => {
      if (window.confirm("Supprimer cette oeuvre définitivement ?")) {
          await deleteBook(id);
          loadBooks();
      }
  };

  const handleImportGoogle = async () => {
      setIsImporting(true);
      try {
          const data = await importBooksFromGoogle();
          await loadBooks();
          setActiveTab('library');
          setToast({ message: data.message || 'Livres importés avec succès !', type: 'success', visible: true });
      } catch (err) {
          console.error("Erreur import", err);
          setToast({ message: err.response?.data?.error || "Erreur lors de l'import.", type: 'error', visible: true });
      } finally {
          setIsImporting(false);
      }
  };

  // Advanced Fake data
  const lineData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'Nouvelles Réservations',
        data: [120, 190, 300, 250, 400, 380],
        borderColor: '#D4AF37',
        backgroundColor: 'rgba(212,175,55,0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true
      },
      {
        label: 'Lectures Achevées',
        data: [90, 150, 200, 180, 310, 270],
        borderColor: '#9333EA',
        backgroundColor: 'rgba(147,51,234,0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true
      }
    ],
  };

  const doughnutData = {
    labels: ['Livres 3D', 'Audiobooks', 'Vidéos'],
    datasets: [{
      data: [3500, 1200, 800],
      backgroundColor: ['#D4AF37', '#9333EA', '#1C1812'],
      borderColor: ['#0E0C0A', '#0E0C0A', '#0E0C0A'],
      borderWidth: 4,
      hoverOffset: 10
    }],
  };
  
  const barData = {
    labels: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
    datasets: [{
      label: 'Activité Hebdomadaire',
      data: [65, 59, 80, 81, 56, 120, 150],
      backgroundColor: '#D4AF37',
      borderRadius: 6,
    }]
  };

  const chartOptions = { 
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#9CA3AF', font: { family: 'sans-serif' } } }
    },
    scales: {
      x: { grid: { color: '#2C261A' }, ticks: { color: '#9CA3AF' } },
      y: { grid: { color: '#2C261A' }, ticks: { color: '#9CA3AF' } }
    }
  };

  const doughnutOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#9CA3AF', padding: 20 } }
    },
    cutout: '75%'
  };

  return (
    <div className="flex-1 text-white p-8 bg-[#0E0C0A] min-h-screen relative overflow-y-auto custom-scrollbar">
      {/* Background Ornaments */}
      <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-purple-900/5 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 relative z-10 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-widest uppercase flex items-center gap-4" style={{ textShadow: '0 2px 20px rgba(212,175,55,0.4)' }}>
            <div className="p-3 bg-gradient-to-br from-[#D4AF37]/20 to-transparent rounded-xl border border-[#D4AF37]/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <Settings className="w-8 h-8 text-[#D4AF37]" />
            </div>
            Management
          </h1>
          <p className="text-gray-400 mt-2 ml-20 text-lg">Centre de commandement de la bibliothèque numérique.</p>
        </div>
        <div className="flex gap-4">
            <button 
               onClick={handleImportGoogle}
               disabled={isImporting}
               className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_0_25px_rgba(147,51,234,0.4)] disabled:opacity-50"
            >
               {isImporting ? <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span> : <Upload className="w-5 h-5"/>}
               Import Google API
            </button>
            <button 
               onClick={() => setShowUploadModal(true)}
               className="flex items-center justify-center gap-3 bg-[#D4AF37] text-black px-8 py-4 rounded-xl font-black uppercase tracking-wider hover:bg-white transition-all shadow-[0_0_25px_rgba(212,175,55,0.4)]"
            >
               <Upload className="w-5 h-5"/> Ajouter Œuvre
            </button>
        </div>
      </div>

      {/* Futuristic Tabs */}
      <div className="flex gap-2 border-b border-[#2C261A] mb-8 pb-px overflow-x-auto custom-scrollbar relative z-10">
        {[
          { id: 'analytics', label: 'Dashboard global', icon: BarChart3 },
          { id: 'library', label: 'Livres & Catalogue', icon: BookOpen },
          { id: 'multimedia', label: 'Multimédia & IA', icon: Film },
          { id: 'users', label: 'Utilisateurs', icon: Users }
        ].map(tab => (
           <button 
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={`flex items-center gap-2 px-6 py-4 font-bold uppercase tracking-wider text-sm transition-all border-b-2 rounded-t-lg ${
               activeTab === tab.id 
               ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5 shadow-[inset_0_-2px_10px_rgba(212,175,55,0.1)]' 
               : 'border-transparent text-gray-500 hover:text-white hover:bg-white/5'
             }`}
           >
             <tab.icon className="w-4 h-4" />
             {tab.label}
           </button>
        ))}
      </div>

      <div className="relative z-10">
        {/* --- ANALYTICS TAB --- */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-fade-in">
             {/* Stats Cards */}
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                  { title: 'Total Utilisateurs', count: '12,450', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]', icon: Users, color: 'text-blue-400' },
                  { title: 'Livres Disponibles', count: '158,432', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]', icon: BookOpen, color: 'text-green-400' },
                  { title: 'Réservations du Mois', count: '4,500', glow: 'shadow-[0_0_20px_rgba(212,175,55,0.15)]', icon: Clock, color: 'text-[#D4AF37]' },
                  { title: 'Pages Lues (Ce mois)', count: '2.4M', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.15)]', icon: BarChart3, color: 'text-purple-400' },
                ].map((stat, i) => (
                  <div key={i} className={`bg-[#1A1713]/80 backdrop-blur-md border border-[#2C261A] p-6 rounded-2xl relative overflow-hidden group ${stat.glow} hover:border-gray-500 transition-colors`}>
                    <div className="absolute -right-6 -top-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                       <stat.icon className={`w-32 h-32 ${stat.color}`} />
                    </div>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl bg-[#0a0806] border border-[#2c261a]`}>
                         <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <span className="text-green-400 text-xs font-bold bg-green-400/10 px-2 py-1 rounded">+12%</span>
                    </div>
                    <h3 className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1">{stat.title}</h3>
                    <p className="text-4xl font-black text-white tracking-tight">{stat.count}</p>
                  </div>
                ))}
             </div>
             
             {/* Charts */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#1A1713]/80 backdrop-blur-md border border-[#2C261A] rounded-3xl p-8 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold uppercase tracking-widest text-white">Activité & Croissance</h3>
                    <select className="bg-[#0E0C0A] border border-[#2C261A] text-sm text-[#D4AF37] px-3 py-1.5 rounded outline-none">
                      <option>Cette Année</option>
                      <option>Ce Mois</option>
                    </select>
                  </div>
                  <div className="h-[300px]"><Line data={lineData} options={chartOptions} /></div>
                </div>
                
                <div className="bg-[#1A1713]/80 backdrop-blur-md border border-[#2C261A] rounded-3xl p-8 shadow-xl flex flex-col">
                  <h3 className="text-lg font-bold uppercase tracking-widest text-white mb-6 text-center">Formats Préférés</h3>
                  <div className="flex-1 min-h-[250px] relative flex justify-center items-center">
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                       <span className="text-gray-500 text-xs uppercase tracking-widest font-bold">Total</span>
                       <span className="text-3xl font-black text-white">5.5K</span>
                    </div>
                  </div>
                </div>
             </div>
             
             {/* Secondary Charts */}
             <div className="bg-[#1A1713]/80 backdrop-blur-md border border-[#2C261A] rounded-3xl p-8 shadow-xl">
                <h3 className="text-lg font-bold uppercase tracking-widest text-white mb-6">Activité Hebdomadaire (Lectures)</h3>
                <div className="h-[250px]"><Bar data={barData} options={chartOptions} /></div>
             </div>
          </div>
        )}

        {/* --- LIBRARY TAB --- */}
        {activeTab === 'library' && (
          <div className="animate-fade-in space-y-6">
            
            {/* Action Bar */}
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-2 bg-[#1C1812] border border-[#D4AF37]/30 text-[#D4AF37] px-4 py-3 rounded-xl font-bold hover:bg-[#D4AF37] hover:text-black transition-all">
                <Plus className="w-4 h-4"/> Nouveau Livre
              </button>
              <button className="flex items-center gap-2 bg-[#1C1812] border border-[#2C261A] text-gray-300 px-4 py-3 rounded-xl font-bold hover:border-white transition-all">
                <FolderPlus className="w-4 h-4"/> Gérer Catégories
              </button>
              <button className="flex items-center gap-2 bg-[#1C1812] border border-[#2C261A] text-gray-300 px-4 py-3 rounded-xl font-bold hover:border-white transition-all">
                <UserPlus className="w-4 h-4"/> Gérer Auteurs
              </button>
            </div>

            <div className="bg-[#1A1713]/80 backdrop-blur-md border border-[#2C261A] rounded-3xl p-8 shadow-xl overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold text-white uppercase tracking-widest">Base de données des ouvrages</h2>
                 <input type="text" placeholder="Rechercher par ISBN, Titre..." className="bg-[#0E0C0A] border border-[#2C261A] text-white px-4 py-2 rounded-lg focus:outline-none focus:border-[#D4AF37]" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[#2C261A] text-gray-500 text-xs uppercase tracking-widest bg-[#0E0C0A]/50">
                      <th className="py-4 px-6 rounded-tl-xl whitespace-nowrap">Couverture & Info</th>
                      <th className="py-4 px-6 whitespace-nowrap">ISBN / Format</th>
                      <th className="py-4 px-6 whitespace-nowrap">Catégorie</th>
                      <th className="py-4 px-6 whitespace-nowrap">Disponibilité</th>
                      <th className="py-4 px-6 whitespace-nowrap">Mise en Avant</th>
                      <th className="py-4 px-6 text-right rounded-tr-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {books.map((b) => (
                      <tr key={b.id} className="border-b border-[#2C261A]/50 hover:bg-[#1C1812] transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-14 bg-[#0E0C0A] rounded border border-[#2C261A] flex items-center justify-center overflow-hidden">
                               {b.cover_image ? <img src={b.cover_image} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-gray-600"/>}
                            </div>
                            <div>
                              <div className="font-bold text-white text-base group-hover:text-[#D4AF37] transition-colors">{b.titre}</div>
                              <div className="text-gray-500 text-xs uppercase tracking-wider mt-1">{b.auteur}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                           <div className="flex gap-2">
                             {b.pdf_path && <span className="text-red-400 font-bold text-xs bg-red-900/20 px-2 py-1 rounded">PDF</span>}
                             {b.epub_path && <span className="text-blue-400 font-bold text-xs bg-blue-900/20 px-2 py-1 rounded">EPUB</span>}
                             {b.audio_path && <span className="text-green-400 font-bold text-xs bg-green-900/20 px-2 py-1 rounded">AUDIO</span>}
                           </div>
                        </td>
                        <td className="py-4 px-6 text-gray-300">Livre</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20`}>
                            Disponible
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs font-bold text-blue-400">{b.is_featured ? <span className="bg-blue-900/40 px-2 py-1 rounded">Featured</span> : null}</td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 bg-[#0E0C0A] rounded hover:bg-[#D4AF37] hover:text-black text-gray-400 transition-colors"><Edit className="w-4 h-4"/></button>
                            <button className="p-2 bg-[#0E0C0A] rounded hover:bg-purple-500 hover:text-white text-gray-400 transition-colors tooltip" title="Archive"><FolderPlus className="w-4 h-4"/></button>
                            <button onClick={() => handleDelete(b.id)} className="p-2 bg-[#0E0C0A] rounded hover:bg-red-500 hover:text-white text-gray-400 transition-colors"><Trash2 className="w-4 h-4"/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- MULTIMEDIA TAB --- */}
        {activeTab === 'multimedia' && (
           <div className="animate-fade-in space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Video Card */}
                 <div className="bg-[#1A1713]/80 backdrop-blur-md border border-[#2C261A] rounded-3xl p-8 text-center shadow-xl hover:border-purple-500/50 transition-colors group">
                   <div className="w-20 h-20 mx-auto bg-purple-900/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Video className="w-10 h-10 text-purple-400" />
                   </div>
                   <h3 className="font-bold text-white text-xl mb-2 uppercase tracking-wide">Vidéos & Trailers</h3>
                   <p className="text-gray-400 text-sm mb-8 px-4 h-16">Uploadez des trailers promotionnels, des interviews d'auteurs, et associez des liens YouTube.</p>
                   <button className="w-full text-purple-400 text-sm font-black uppercase tracking-widest border-2 border-purple-900 px-4 py-3 rounded-xl hover:bg-purple-900/40 transition-colors">Gérer les Vidéos</button>
                 </div>
                 
                 {/* Audio Card */}
                 <div className="bg-[#1A1713]/80 backdrop-blur-md border border-[#2C261A] rounded-3xl p-8 text-center shadow-xl hover:border-green-500/50 transition-colors group">
                   <div className="w-20 h-20 mx-auto bg-green-900/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Mic className="w-10 h-10 text-green-400" />
                   </div>
                   <h3 className="font-bold text-white text-xl mb-2 uppercase tracking-wide">Audiobooks</h3>
                   <p className="text-gray-400 text-sm mb-8 px-4 h-16">Stockage des fichiers MP3, gestion des chapitres et des extraits sonores.</p>
                   <button className="w-full text-green-400 text-sm font-black uppercase tracking-widest border-2 border-green-900 px-4 py-3 rounded-xl hover:bg-green-900/40 transition-colors">Gérer l'Audio</button>
                 </div>

                 {/* Cover/Images Card */}
                 <div className="bg-[#1A1713]/80 backdrop-blur-md border border-[#2C261A] rounded-3xl p-8 text-center shadow-xl hover:border-[#D4AF37]/50 transition-colors group">
                   <div className="w-20 h-20 mx-auto bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-10 h-10 text-[#D4AF37]" />
                   </div>
                   <h3 className="font-bold text-white text-xl mb-2 uppercase tracking-wide">Couvertures 3D</h3>
                   <p className="text-gray-400 text-sm mb-8 px-4 h-16">Uploadez des matrices de couverture pour la génération du rendu 3D des livres.</p>
                   <button className="w-full text-[#D4AF37] text-sm font-black uppercase tracking-widest border-2 border-[#D4AF37]/30 px-4 py-3 rounded-xl hover:bg-[#D4AF37]/20 transition-colors">Studio 3D</button>
                 </div>
              </div>

              {/* AI & Content Curation Features */}
              <div className="bg-gradient-to-r from-purple-900/20 to-[#0E0C0A] border border-purple-500/30 rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-center mt-6">
                 <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3 uppercase tracking-widest">Configuration de l'IA de Recommandation</h3>
                    <p className="text-gray-300 mb-6">Paramétrez le poids des algorithmes de recommandation, le filtrage des tendances et l'assistant conversationnel des utilisateurs.</p>
                    <button className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-bold">Ouvrir l'éditeur AI</button>
                 </div>
                 <div className="w-48 h-48 bg-[#0E0C0A] rounded-full border border-purple-500/50 flex items-center justify-center p-4">
                    <Radar data={{
                       labels: ['Collaborative', 'Contenu', 'Tendances', 'Nouveauté', 'Notes'],
                       datasets: [{
                         label: 'Poids IA Actuel',
                         data: [80, 60, 90, 70, 85],
                         backgroundColor: 'rgba(147, 51, 234, 0.4)',
                         borderColor: 'rgba(147, 51, 234, 1)',
                         borderWidth: 1,
                       }]
                    }} options={{
                       scales: {
                         r: { angleLines: { color: 'rgba(255,255,255,0.1)' }, grid: { color: 'rgba(255,255,255,0.1)' }, pointLabels: { color: 'white', font: {size: 10} }, ticks: { display:false } }
                       },
                       plugins: { legend: {display:false} }
                    }}/>
                 </div>
              </div>
           </div>
        )}

        {/* --- USERS TAB --- */}
        {activeTab === 'users' && (
          <div className="animate-fade-in space-y-6">
             <div className="bg-[#1A1713]/80 backdrop-blur-md border border-[#2C261A] rounded-3xl p-8 shadow-xl">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold text-white uppercase tracking-widest">Contrôle des Utilisateurs</h2>
                 <input type="text" placeholder="Chercher un nom, email..." className="bg-[#0E0C0A] border border-[#2C261A] text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500" />
               </div>

               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="border-b-2 border-[#2C261A] text-gray-500 text-xs uppercase tracking-widest bg-[#0E0C0A]/50">
                       <th className="py-4 px-6">Utilisateur</th>
                       <th className="py-4 px-6">Historique & Réservations</th>
                       <th className="py-4 px-6">Rôle / Droits</th>
                       <th className="py-4 px-6 text-right">Sanctions / Actions</th>
                     </tr>
                   </thead>
                   <tbody className="text-sm">
                     {[
                       { name: 'Alice Laurent', email: 'alice.l@mail.com', reads: 45, reserves: 2, role: 'Membre', status: 'Actif' },
                       { name: 'Bob Martin', email: 'bob.m@mail.com', reads: 12, reserves: 0, role: 'Membre', status: 'Bloqué' },
                       { name: 'Admin Principal', email: 'admin@library3d.com', reads: 999, reserves: 0, role: 'Admin', status: 'Super User' }
                     ].map((u, i) => (
                       <tr key={i} className="border-b border-[#2C261A]/50 hover:bg-[#1C1812] transition-colors">
                         <td className="py-4 px-6">
                            <div className="font-bold text-white">{u.name}</div>
                            <div className="text-gray-500 text-xs mt-1">{u.email}</div>
                         </td>
                         <td className="py-4 px-6">
                            <div className="text-gray-300 font-bold mb-1"><BookOpen className="inline w-3 h-3 mr-1 text-[#D4AF37]"/> {u.reads} Livres lus</div>
                            <div className="text-gray-500 text-xs"><Clock className="inline w-3 h-3 mr-1"/> {u.reserves} Réservations</div>
                         </td>
                         <td className="py-4 px-6">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'Admin' ? 'bg-purple-900/40 text-purple-300' : 'bg-blue-900/40 text-blue-300'}`}>
                              {u.role}
                            </span>
                         </td>
                         <td className="py-4 px-6">
                           <div className="flex justify-end gap-3">
                             <button className="text-gray-400 hover:text-white transition-colors tooltip" title="Historique Complet"><Clock className="w-5 h-5"/></button>
                             {u.role !== 'Admin' && (
                               u.status === 'Bloqué' 
                               ? <button className="text-red-500 hover:text-red-400 transition-colors border border-red-500/30 px-2 py-1 rounded text-xs">Débloquer</button>
                               : <button className="text-gray-500 hover:text-red-500 transition-colors tooltip" title="Bannir Ce Compte"><StopCircle className="w-5 h-5"/></button>
                             )}
                           </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
          </div>
        )}
      </div>

      {toast.visible && (
        <div className={`fixed bottom-8 right-8 z-50 flex items-center gap-4 bg-[#1A1713] border shadow-[0_0_30px_rgba(212,175,55,0.3)] text-white px-6 py-4 rounded-2xl animate-fade-in ${
          toast.type === 'success' ? 'border-[#D4AF37]/50' : 'border-red-500/50'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-6 h-6 text-[#D4AF37] shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-red-500 shrink-0" />
          )}
          <p className="font-bold text-sm">{toast.message}</p>
        </div>
      )}

      {showUploadModal && <AdminMediaUpload onClose={() => setShowUploadModal(false)} onUploadSuccess={loadBooks} />}
    </div>
  );
}
