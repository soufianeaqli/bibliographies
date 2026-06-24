import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  Library, Home, BookOpen, LayoutGrid, Star, Clock, 
  FileText, Tag, User, LogOut, Bell, Book, ShieldCheck, X,
  Check, CheckCheck, Loader, MessageSquare, Users, BookOpen as BookIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getNotifications, getUnreadNotificationCount, markNotificationRead, markAllNotificationsRead
} from '../api/libraryClient';

export default function LibraryLayout() {
  const { logout, utilisateur } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (!showNotifPanel) return;
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifPanel(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifPanel]);

  const fetchNotifs = useCallback(async () => {
    try {
      const [notifs, { count }] = await Promise.all([
        getNotifications(),
        getUnreadNotificationCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifs]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await logout(); } catch {}
  };
  const estAdmin = utilisateur?.role === 'administrateur';
  const navItems = estAdmin
    ? [
        { icon: Home, label: 'Dashboard', path: '/bibliotheque' },
        { icon: BookOpen, label: 'Livres', path: '/bibliotheque/livres' },
        { icon: Users, label: 'Utilisateurs', path: '/bibliotheque/utilisateurs' },
        { icon: ShieldCheck, label: 'Réservations', path: '/bibliotheque/reservations' },
        { icon: MessageSquare, label: 'Messagerie', path: '/bibliotheque/messagerie' },
        { icon: User, label: 'Profil', path: '/bibliotheque/profil' },
      ]
    : [
        { icon: Home, label: 'Accueil', path: '/bibliotheque' },
        { icon: BookOpen, label: 'Bibliothèque', path: '/bibliotheque/livres' },
        { icon: Book, label: 'Mes Livres', path: '/bibliotheque/mes-livres' },
        { icon: LayoutGrid, label: 'Catégories', path: '/bibliotheque/categories' },
        { icon: Star, label: 'Favoris', path: '/bibliotheque/favoris' },
        { icon: Clock, label: 'Historiques', path: '/bibliotheque/historique' },
        { icon: FileText, label: 'Notes', path: '/bibliotheque/notes' },
        { icon: Tag, label: 'Recommandations', path: '/bibliotheque/recommandations' },
        { icon: MessageSquare, label: 'Contact', path: '/bibliotheque/contact' },
        { icon: User, label: 'Profil', path: '/bibliotheque/profil' },
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
          <button onClick={() => setShowLogoutConfirm(true)} className="flex items-center gap-4 px-4 py-3 w-full rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all font-medium">
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => !loggingOut && setShowLogoutConfirm(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-sm mx-4 rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: 'linear-gradient(180deg, #1C1812 0%, #14120E 100%)',
              border: '1px solid rgba(212,175,55,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <LogOut className="w-6 h-6 text-red-400" />
              </div>
              <button
                onClick={() => !loggingOut && setShowLogoutConfirm(false)}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              <h3 className="text-lg font-bold text-white/90 mb-2">Se déconnecter ?</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Vous serez déconnecté de votre compte. Vous devrez vous reconnecter pour accéder à la bibliothèque.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                disabled={loggingOut}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-white/10 disabled:opacity-50"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
                  color: '#fff',
                }}
              >
                {loggingOut ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Déconnexion...
                  </span>
                ) : 'Déconnexion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-8 bg-gradient-to-b from-[#0E0C0A] to-transparent absolute top-0 w-full z-30">
          <div></div>

          <div className="flex items-center gap-6">
            {/* Notification Bell */}
            <button
              onClick={(e) => { e.stopPropagation(); setShowNotifPanel(v => !v); }}
              className="relative p-2 text-gray-400 hover:text-white transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-1 border border-[#0E0C0A]">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
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

      {/* Notification Dropdown */}
      {showNotifPanel && (
        <div
          ref={notifRef}
          className="fixed right-6 top-[72px] w-[380px] max-h-[480px] rounded-2xl overflow-hidden shadow-2xl z-[100]"
          style={{
            background: '#1A1612',
            border: '1px solid rgba(212,175,55,0.12)',
          }}
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <h3 className="text-sm font-bold text-white/90 flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#D4AF37]" />
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={async () => {
                  try {
                    await markAllNotificationsRead();
                    setUnreadCount(0);
                    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                  } catch {}
                }}
                className="text-[10px] text-[#D4AF37] hover:text-white transition-colors flex items-center gap-1 font-medium"
              >
                <CheckCheck className="w-3 h-3" />
                Tout lu
              </button>
            )}
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center py-10 px-4 text-gray-500">
                <Bell className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-xs">Aucune notification</p>
              </div>
            ) : (
              <div className="py-1">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={async () => {
                      if (!notif.is_read) {
                        try {
                          await markNotificationRead(notif.id);
                          setUnreadCount(prev => Math.max(0, prev - 1));
                          setNotifications(prev =>
                            prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n)
                          );
                        } catch {}
                      }
                    }}
                    className="w-full text-left px-5 py-3 transition-colors hover:bg-white/5 flex items-start gap-3"
                    style={{
                      background: notif.is_read ? 'transparent' : 'rgba(212,175,55,0.04)',
                      borderLeft: notif.is_read ? '3px solid transparent' : '3px solid #D4AF37',
                    }}
                  >
                    <div className="mt-0.5 shrink-0">
                      {notif.type === 'new_reservation' ? (
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                          <BookIcon className="w-4 h-4 text-amber-400" />
                        </div>
                      ) : notif.type === 'reservation_approved' ? (
                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                          <Check className="w-4 h-4 text-green-400" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                          <X className="w-4 h-4 text-red-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-relaxed text-gray-300" style={{ fontWeight: notif.is_read ? 400 : 500 }}>
                        {notif.message}
                      </p>
                      <p className="text-[9px] mt-1 text-gray-500 font-mono">
                        {new Date(notif.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
