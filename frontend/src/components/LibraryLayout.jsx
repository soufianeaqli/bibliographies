import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  Library, Home, BookOpen, LayoutGrid, Star, Clock, 
  FileText, Tag, User, Settings, LogOut, Search, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LibraryLayout() {
  const { logout, utilisateur } = useAuth();
  const navItems = [
    { icon: Home, label: 'Accueil', path: '/bibliotheque' },
    { icon: BookOpen, label: 'Bibliothèque', path: '/bibliotheque/livres' },
    { icon: LayoutGrid, label: 'Catégories', path: '/bibliotheque/categories' },
    { icon: Star, label: 'Favoris', path: '/bibliotheque/favoris' },
    { icon: Clock, label: 'Historiques', path: '/bibliotheque/historique' },
    { icon: FileText, label: 'Notes', path: '/bibliotheque/notes' },
    { icon: Tag, label: 'Recommandations', path: '/bibliotheque/recommandations' },
    { icon: User, label: 'Profil', path: '/bibliotheque/profil' },
    { icon: Settings, label: 'Paramètres', path: '/bibliotheque/parametres' },
  ];

  return (
    <div className="flex h-screen bg-[#0E0C0A] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col bg-[#14120E]/80 backdrop-blur-md border-r border-[#2C261A] z-20">
        <div className="p-6 flex items-center gap-3">
          <Library className="w-8 h-8 text-[#D4AF37]" />
          <span className="font-bold text-lg tracking-wide text-white/90">BIBLIOTHÈQUE 3D</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
             <NavLink
               key={item.label}
               to={item.path}
               end={item.path === '/bibliotheque'}
               className={({ isActive }) =>
                 `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                   isActive 
                     ? 'bg-[#D4AF37]/10 text-[#D4AF37] shadow-[inset_2px_0_0_0_#D4AF37]' 
                     : 'text-gray-400 hover:text-white hover:bg-white/5'
                 }`
               }
             >
               <item.icon className={`w-5 h-5`} />
               <span>{item.label}</span>
             </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#2C261A] mt-auto">
          <button onClick={logout} className="flex items-center gap-4 px-4 py-3 w-full rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all font-medium">
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-8 bg-gradient-to-b from-[#0E0C0A] to-transparent absolute top-0 w-full z-10">
          <div className="relative w-96 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400 group-focus-within:text-[#D4AF37] transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un livre, auteur, catégorie..."
              className="w-full bg-[#1C1812]/60 border border-[#2C261A] text-sm text-gray-200 rounded-full pl-11 pr-4 py-2.5 focus:outline-none focus:border-[#D4AF37]/50 focus:bg-[#1C1812] transition-all backdrop-blur-sm"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#0E0C0A]"></span>
            </button>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-9 h-9 rounded-full bg-[#2C261A] overflow-hidden border border-[#D4AF37]/30 group-hover:border-[#D4AF37] transition-colors">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(utilisateur?.nom || 'User')}&background=D4AF37&color=fff&bold=true`} alt="User avatar" className="w-full h-full object-cover" />
              </div>
              <div className="hidden md:block">
                <p className="text-xs text-gray-400">Bonjour,</p>
                <p className="text-sm font-semibold text-white/90 truncate max-w-[120px]">{utilisateur?.nom || 'Profil'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
