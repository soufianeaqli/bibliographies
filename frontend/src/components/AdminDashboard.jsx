import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, BarChart3, Upload, Film, Headphones, 
  Settings, CheckCircle, XCircle, Clock, Trash2, Edit, 
  Image as ImageIcon, Video, Mic, Star, Tag
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale, Filler, BarElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { fetchBooks, deleteBook, deleteAllBooks, importBooks100 } from '../api/libraryClient';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale, Filler, BarElement);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [books, setBooks] = useState([]);
  const [isImporting100, setIsImporting100] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [importResult, setImportResult] = useState(null);
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

  const handleImport100 = async () => {
      setIsImporting100(true);
      setImportResult(null);
      try {
          const data = await importBooks100();
          await loadBooks();
          setImportResult(data);
          const s = data.skipped_no_cover + data.skipped_few_pages + data.skipped_no_description;
          setToast({ message: `${data.imported} importé(s), ${s} ignoré(s)`, type: 'success', visible: true });
      } catch (err) {
          console.error("Erreur import 100", err);
          setToast({ message: err.response?.data?.error || "Erreur lors de l'import 100.", type: 'error', visible: true });
      } finally {
          setIsImporting100(false);
      }
  };

  const handleDeleteAll = async () => {
      if (!window.confirm("Supprimer TOUS les livres définitivement ? Cette action est irréversible.")) return;
      setIsDeletingAll(true);
      try {
          const data = await deleteAllBooks();
          await loadBooks();
          setToast({ message: data.message || 'Tous les livres ont été supprimés.', type: 'success', visible: true });
      } catch (err) {
          console.error("Erreur suppression", err);
          setToast({ message: err.response?.data?.error || "Erreur lors de la suppression.", type: 'error', visible: true });
      } finally {
          setIsDeletingAll(false);
      }
  };

  // Real computed stats
  const uniqueAuthors = [...new Set(books.map(b => b.auteur))].length;
  const typesCount = {};
  books.forEach(b => { typesCount[b.type] = (typesCount[b.type] || 0) + 1; });
  const typeLabels = Object.keys(typesCount);
  const typeData = Object.values(typesCount);
  const featuredCount = books.filter(b => b.is_featured).length;
  const avgRating = books.reduce((acc, b) => acc + (b.rating || 0), 0) / (books.length || 1);

  const typeChartData = {
    labels: typeLabels.map(t => t.charAt(0).toUpperCase() + t.slice(1)),
    datasets: [{
      data: typeData.length ? typeData : [1],
      backgroundColor: ['#D4AF37', '#9333EA', '#1C1812', '#3B82F6', '#22C55E'],
      borderColor: ['#0E0C0A'],
      borderWidth: 4,
      hoverOffset: 10
    }],
  };

  const authorBooks = {};
  books.forEach(b => { authorBooks[b.auteur] = (authorBooks[b.auteur] || 0) + 1; });
  const topAuthors = Object.entries(authorBooks).sort((a, b) => b[1] - a[1]).slice(0, 7);
  const authorChartData = {
    labels: topAuthors.map(a => a[0].length > 15 ? a[0].slice(0, 15) + '...' : a[0]),
    datasets: [{
      label: 'Livres par auteur',
      data: topAuthors.map(a => a[1]),
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
      y: { grid: { color: '#2C261A' }, ticks: { color: '#9CA3AF', beginAtZero: true } }
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
               onClick={handleImport100}
               disabled={isImporting100}
               className="flex items-center justify-center gap-3 bg-[#D4AF37] text-black px-8 py-4 rounded-xl font-black uppercase tracking-wider hover:bg-white transition-all shadow-[0_0_25px_rgba(212,175,55,0.4)] disabled:opacity-50"
            >
               {isImporting100 ? <span className="animate-spin inline-block w-5 h-5 border-2 border-black border-t-transparent rounded-full"></span> : <Upload className="w-5 h-5"/>}
               Importer 100 livres Pro
            </button>
            <button 
               onClick={handleDeleteAll}
               disabled={isDeletingAll}
               className="flex items-center justify-center gap-3 bg-red-600/20 border border-red-500/40 text-red-400 px-8 py-4 rounded-xl font-black uppercase tracking-wider hover:bg-red-600/40 transition-all disabled:opacity-50"
            >
               {isDeletingAll ? <span className="animate-spin inline-block w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full"></span> : <Trash2 className="w-5 h-5"/>}
               Supprimer tout
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
              {/* Stats Cards — données réelles */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                  { title: 'Total Ouvrages', count: books.length.toString(), glow: 'shadow-[0_0_20px_rgba(212,175,55,0.15)]', icon: BookOpen, color: 'text-[#D4AF37]' },
                  { title: 'Auteurs Uniques', count: uniqueAuthors.toString(), glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]', icon: Users, color: 'text-blue-400' },
                  { title: 'Types différents', count: typeLabels.length.toString(), glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]', icon: Tag, color: 'text-green-400' },
                  { title: 'Mise en avant', count: featuredCount.toString(), glow: 'shadow-[0_0_20px_rgba(168,85,247,0.15)]', icon: Star, color: 'text-purple-400' },
                ].map((stat, i) => (
                  <div key={i} className={`bg-[#1A1713]/80 backdrop-blur-md border border-[#2C261A] p-6 rounded-2xl relative overflow-hidden group ${stat.glow} hover:border-gray-500 transition-colors`}>
                    <div className="absolute -right-6 -top-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                       <stat.icon className={`w-32 h-32 ${stat.color}`} />
                    </div>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl bg-[#0a0806] border border-[#2c261a]`}>
                         <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                    <h3 className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1">{stat.title}</h3>
                    <p className="text-4xl font-black text-white tracking-tight">{stat.count}</p>
                  </div>
                ))}
              </div>
             
              {/* Charts — données réelles */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 bg-[#1A1713]/80 backdrop-blur-md border border-[#2C261A] rounded-3xl p-8 shadow-xl">
                   <div className="flex justify-between items-center mb-6">
                     <h3 className="text-lg font-bold uppercase tracking-widest text-white">Livres par Auteur (Top)</h3>
                   </div>
                   <div className="h-[300px]">
                     {topAuthors.length > 0
                       ? <Bar data={authorChartData} options={chartOptions} />
                       : <p className="text-gray-500 text-center py-16">Aucune donnée disponible</p>
                     }
                   </div>
                 </div>
                 
                 <div className="bg-[#1A1713]/80 backdrop-blur-md border border-[#2C261A] rounded-3xl p-8 shadow-xl flex flex-col">
                   <h3 className="text-lg font-bold uppercase tracking-widest text-white mb-6 text-center">Répartition par Type</h3>
                   <div className="flex-1 min-h-[250px] relative flex justify-center items-center">
                     <Doughnut data={typeChartData} options={doughnutOptions} />
                     <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                        <span className="text-gray-500 text-xs uppercase tracking-widest font-bold">Total</span>
                        <span className="text-3xl font-black text-white">{books.length}</span>
                     </div>
                   </div>
                 </div>
              </div>
          </div>
        )}

        {/* --- LIBRARY TAB --- */}
        {activeTab === 'library' && (
          <div className="animate-fade-in space-y-6">
            
            {/* Result Alert */}
            {importResult && (
              <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/30 rounded-2xl p-6 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 bg-[#D4AF37]/10 rounded-full flex items-center justify-center border border-[#D4AF37]/30 shrink-0">
                    <CheckCircle className="w-7 h-7 text-[#D4AF37]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-lg">Import terminé</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="bg-[#14120E] rounded-xl p-3 border border-green-500/20 text-center">
                        <p className="text-2xl font-black text-green-400">{importResult.imported}</p>
                        <p className="text-xs text-gray-500 mt-1">Importés</p>
                      </div>
                      <div className="bg-[#14120E] rounded-xl p-3 border border-red-500/20 text-center">
                        <p className="text-2xl font-black text-red-400">{importResult.skipped_no_cover || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">Sans couverture</p>
                      </div>
                      <div className="bg-[#14120E] rounded-xl p-3 border border-yellow-500/20 text-center">
                        <p className="text-2xl font-black text-yellow-400">{importResult.skipped_few_pages || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">&lt; 20 pages</p>
                      </div>
                      <div className="bg-[#14120E] rounded-xl p-3 border border-orange-500/20 text-center">
                        <p className="text-2xl font-black text-orange-400">{importResult.skipped_no_description || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">Sans résumé</p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-xs mt-3">
                      Traités : <span className="text-gray-400 font-bold">{importResult.total_processed || 0}</span> livres au total
                    </p>
                  </div>
                  <button onClick={() => setImportResult(null)} className="text-gray-500 hover:text-white transition-colors shrink-0">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap gap-4">
              <button onClick={handleImport100} disabled={isImporting100} className="flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] px-4 py-3 rounded-xl font-bold hover:bg-[#D4AF37]/20 transition-all">
                {isImporting100 ? <span className="animate-spin inline-block w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full"></span> : <Upload className="w-4 h-4"/>}
                Importer 100 Pro + Trailers
              </button>
              <button onClick={handleDeleteAll} disabled={isDeletingAll} className="flex items-center gap-2 bg-red-600/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl font-bold hover:bg-red-600/20 transition-all">
                {isDeletingAll ? <span className="animate-spin inline-block w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full"></span> : <Trash2 className="w-4 h-4"/>}
                Supprimer tout
              </button>
            </div>

            <div className="bg-[#1A1713]/80 backdrop-blur-md border border-[#2C261A] rounded-3xl p-8 shadow-xl overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold text-white uppercase tracking-widest">Catalogue ({books.length})</h2>
                 <span className="text-xs text-gray-500">{uniqueAuthors} auteurs · {typeLabels.length} types</span>
              </div>
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
                               {b.cover_image ? <img src={b.cover_image} className="w-full h-full object-cover" /> : <BookOpen className="w-4 h-4 text-gray-600"/>}
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
                            <button className="p-2 bg-[#0E0C0A] rounded hover:bg-[#D4AF37] hover:text-black text-gray-400 transition-colors"><Edit className="w-4 h-4"/></button>
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
                 <div className="bg-[#1A1713]/80 backdrop-blur-md border border-[#2C261A] rounded-3xl p-8 text-center shadow-xl hover:border-purple-500/50 transition-colors group">
                   <div className="w-20 h-20 mx-auto bg-purple-900/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Video className="w-10 h-10 text-purple-400" />
                   </div>
                   <h3 className="font-bold text-white text-xl mb-2 uppercase tracking-wide">Vidéos & Trailers</h3>
                   <p className="text-gray-400 text-sm mb-8 px-4">Associez des liens YouTube aux œuvres.</p>
                   <button className="w-full text-purple-400 text-sm font-black uppercase tracking-widest border-2 border-purple-900 px-4 py-3 rounded-xl hover:bg-purple-900/40 transition-colors">Gérer les Vidéos</button>
                 </div>
                 
                 <div className="bg-[#1A1713]/80 backdrop-blur-md border border-[#2C261A] rounded-3xl p-8 text-center shadow-xl hover:border-green-500/50 transition-colors group">
                   <div className="w-20 h-20 mx-auto bg-green-900/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Mic className="w-10 h-10 text-green-400" />
                   </div>
                   <h3 className="font-bold text-white text-xl mb-2 uppercase tracking-wide">Audiobooks</h3>
                   <p className="text-gray-400 text-sm mb-8 px-4">Fichiers audio MP3 et extraits.</p>
                   <button className="w-full text-green-400 text-sm font-black uppercase tracking-widest border-2 border-green-900 px-4 py-3 rounded-xl hover:bg-green-900/40 transition-colors">Gérer l'Audio</button>
                 </div>

                 <div className="bg-[#1A1713]/80 backdrop-blur-md border border-[#2C261A] rounded-3xl p-8 text-center shadow-xl hover:border-[#D4AF37]/50 transition-colors group">
                   <div className="w-20 h-20 mx-auto bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-10 h-10 text-[#D4AF37]" />
                   </div>
                   <h3 className="font-bold text-white text-xl mb-2 uppercase tracking-wide">Couvertures</h3>
                   <p className="text-gray-400 text-sm mb-8 px-4">Images de couverture des ouvrages.</p>
                   <button className="w-full text-[#D4AF37] text-sm font-black uppercase tracking-widest border-2 border-[#D4AF37]/30 px-4 py-3 rounded-xl hover:bg-[#D4AF37]/20 transition-colors">Gérer les Images</button>
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

    </div>
  );
}
