import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldCheck, Shield, Ban, CheckCircle, XCircle, Trash2, ChevronDown, ChevronUp, BookOpen, Star, MessageSquare, Calendar, Loader } from 'lucide-react';
import client from '../api/client';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await client.get('/admin/users');
      setUsers(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleBlock = async (user) => {
    try {
      await client.patch(`/admin/users/${user.id}/toggle-block`);
      fetchUsers();
    } catch {}
  };

  const handleRoleChange = async (user, newRole) => {
    try {
      await client.patch(`/admin/users/${user.id}/role`, { role: newRole });
      fetchUsers();
    } catch {}
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Supprimer définitivement ${user.nom} ?`)) return;
    try {
      await client.delete(`/admin/users/${user.id}`);
      fetchUsers();
      if (expanded === user.id) setExpanded(null);
    } catch {}
  };

  const handleExpand = async (user) => {
    if (expanded === user.id) { setExpanded(null); return; }
    setExpanded(user.id);
    setDetailLoading(true);
    try {
      const { data } = await client.get(`/admin/users/${user.id}`);
      setSelectedDetail(data);
    } catch {}
    setDetailLoading(false);
  };

  const filtered = users.filter(u =>
    u.nom?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const actifs = filtered.filter(u => u.statut === 'actif').length;
  const bloques = filtered.filter(u => u.statut === 'inactif').length;

  if (loading) {
    return (
      <div className="flex-1 relative pb-20 min-h-screen bg-[#0A0806]">
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="w-8 h-8 text-[#D4AF37] animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative pb-20 min-h-screen bg-[#0A0806]">
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-[#D4AF37]/5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-purple-900/5 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="relative z-10">
        <div className="px-8 pt-10 pb-6">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-4 tracking-wider uppercase drop-shadow-lg" style={{ textShadow: '0 5px 20px rgba(212,175,55,0.4)' }}>
            <div className="p-3 bg-gradient-to-br from-[#D4AF37]/20 to-transparent rounded-xl border border-[#D4AF37]/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <Users className="w-8 h-8 text-[#D4AF37]" />
            </div>
            Utilisateurs
          </h1>
          <p className="text-gray-400 font-medium text-lg ml-20">Gérer les comptes, bloquer, modifier les rôles.</p>
        </div>

        <div className="px-8 mt-4 pb-12 space-y-6">
          {/* Stats + Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-4">
              <div className="bg-[#14120E] border border-[#2C261A] rounded-xl px-5 py-3">
                <span className="text-2xl font-black text-white">{actifs}</span>
                <span className="text-sm text-green-400 ml-2">actifs</span>
              </div>
              <div className="bg-[#14120E] border border-[#2C261A] rounded-xl px-5 py-3">
                <span className="text-2xl font-black text-white">{bloques}</span>
                <span className="text-sm text-red-400 ml-2">bloqués</span>
              </div>
              <div className="bg-[#14120E] border border-[#2C261A] rounded-xl px-5 py-3">
                <span className="text-2xl font-black text-white">{filtered.length}</span>
                <span className="text-sm text-gray-400 ml-2">total</span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#1A1713]/80 border border-[#2C261A] rounded-xl px-4 py-2.5 w-full sm:w-72">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un utilisateur..."
                className="bg-transparent text-white text-sm focus:outline-none w-full placeholder-gray-600"
              />
            </div>
          </div>

          {/* User list */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="bg-[#14120E] border border-[#2C261A] rounded-2xl p-12 text-center">
                <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">Aucun utilisateur trouvé.</p>
              </div>
            ) : (
              filtered.map((user) => {
                const isAdmin = user.role === 'administrateur';
                const isActif = user.statut === 'actif';
                const isExpanded = expanded === user.id;
                return (
                  <div key={user.id} className="bg-[#14120E] border border-[#2C261A] rounded-2xl overflow-hidden transition-all">
                    <div className="flex items-center gap-4 p-5">
                      <button onClick={() => handleExpand(user)} className="p-1 text-gray-500 hover:text-white transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      <div className="w-10 h-10 rounded-full bg-[#1C1812] border border-[#2C261A] overflow-hidden shrink-0">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.nom || '?')}&background=1C1812&color=D4AF37&size=40`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold truncate">{user.nom}</span>
                          {isAdmin && <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
                          isActif ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}>
                          {isActif ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {isActif ? 'Actif' : 'Bloqué'}
                        </span>
                        <span className="text-gray-500">{user.references_count || 0} livres</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isAdmin && (
                          <button
                            onClick={() => handleToggleBlock(user)}
                            className={`p-2 rounded-lg transition-all ${
                              isActif ? 'text-gray-500 hover:text-red-400 hover:bg-red-500/10' : 'text-green-400 hover:text-green-300 hover:bg-green-500/10'
                            }`}
                            title={isActif ? 'Bloquer' : 'Débloquer'}
                          >
                            {isActif ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                        )}

                        {!isAdmin && (
                          <button
                            onClick={() => handleRoleChange(user, isAdmin ? 'utilisateur' : 'administrateur')}
                            className="p-2 rounded-lg text-gray-500 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
                            title={isAdmin ? 'Rétrograder' : 'Promouvoir admin'}
                          >
                            {isAdmin ? <Shield className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                          </button>
                        )}

                        {!isAdmin && (
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="border-t border-[#2C261A] p-5">
                        {detailLoading ? (
                          <div className="h-20 flex items-center justify-center">
                            <Loader className="w-5 h-5 text-[#D4AF37] animate-spin" />
                          </div>
                        ) : selectedDetail ? (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-[#1C1812] rounded-xl p-4 border border-[#2C261A]">
                              <BookOpen className="w-4 h-4 text-[#D4AF37] mb-2" />
                              <p className="text-2xl font-black text-white">{selectedDetail.references_count || 0}</p>
                              <p className="text-xs text-gray-500">Livres</p>
                            </div>
                            <div className="bg-[#1C1812] rounded-xl p-4 border border-[#2C261A]">
                              <Star className="w-4 h-4 text-yellow-400 mb-2" />
                              <p className="text-2xl font-black text-white">{selectedDetail.favoris_count || 0}</p>
                              <p className="text-xs text-gray-500">Favoris</p>
                            </div>
                            <div className="bg-[#1C1812] rounded-xl p-4 border border-[#2C261A]">
                              <MessageSquare className="w-4 h-4 text-purple-400 mb-2" />
                              <p className="text-2xl font-black text-white">{selectedDetail.notifications_count || 0}</p>
                              <p className="text-xs text-gray-500">Notifications</p>
                            </div>
                            <div className="bg-[#1C1812] rounded-xl p-4 border border-[#2C261A]">
                              <Calendar className="w-4 h-4 text-blue-400 mb-2" />
                              <p className="text-2xl font-black text-white">
                                {selectedDetail.date_creation ? new Date(selectedDetail.date_creation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '-'}
                              </p>
                              <p className="text-xs text-gray-500">Inscription</p>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
