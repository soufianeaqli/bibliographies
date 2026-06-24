import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, Upload, 
  Settings, CheckCircle, XCircle, Trash2, 
  Star, Tag
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

      <div className="relative z-10 space-y-8">
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
