import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle, XCircle, Loader, BookOpen, User, Calendar } from 'lucide-react';
import { getPendingReservations, approveReservation, rejectReservation } from '../api/libraryClient';

export default function GestionReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const load = () => {
    setLoading(true);
    getPendingReservations()
      .then(setReservations)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleApprove = async (id) => {
    setActionLoading(`approve-${id}`);
    try {
      await approveReservation(id);
      setReservations(prev => prev.filter(r => r.id !== id));
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (id) => {
    setActionLoading(`reject-${id}`);
    try {
      await rejectReservation(id);
      setReservations(prev => prev.filter(r => r.id !== id));
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  return (
    <div className="flex-1 relative pb-20 min-h-screen bg-[#0A0806]">
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-[#D4AF37]/5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-purple-900/5 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="px-8 pt-10 pb-6 relative z-10">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-4 tracking-wider uppercase drop-shadow-lg" style={{ textShadow: '0 5px 20px rgba(212,175,55,0.4)' }}>
          <div className="p-3 bg-gradient-to-br from-[#D4AF37]/20 to-transparent rounded-xl border border-[#D4AF37]/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <ShieldCheck className="w-8 h-8 text-[#D4AF37]" />
          </div>
          Réservations
        </h1>
        <p className="text-gray-400 font-medium text-lg ml-20">Gérer les demandes de réservation des utilisateurs.</p>
      </div>

      <div className="px-8 pb-12 relative z-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader className="w-10 h-10 text-[#D4AF37] animate-spin" />
          </div>
        ) : reservations.length === 0 ? (
          <div className="bg-[#14120E]/80 backdrop-blur-md border border-[#2C261A] rounded-3xl p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Aucune demande en attente.</p>
            <p className="text-gray-600 text-sm mt-2">Toutes les réservations ont été traitées.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((res) => (
              <div key={res.id} className="bg-[#14120E]/90 backdrop-blur-md border border-[#2C261A] rounded-2xl p-5 hover:border-amber-500/40 transition-all shadow-xl flex items-center gap-6">
                <div className="w-16 h-24 rounded-lg overflow-hidden shrink-0 shadow-lg border border-[#2C261A]">
                  {res.reference?.cover_image
                    ? <img src={res.reference.cover_image} alt={res.reference.titre} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-[#1C1812] flex items-center justify-center text-[8px] text-gray-500 font-bold p-1 text-center">{res.reference?.titre}</div>
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">{res.reference?.titre || 'Livre inconnu'}</h3>
                  <p className="text-sm text-gray-400 truncate">{res.reference?.auteur || ''}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {res.utilisateur?.nom || 'Inconnu'}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(res.reservation_date || res.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleApprove(res.id)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-600/20 text-green-400 border border-green-500/30 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-green-600/40 hover:text-green-300 transition-all disabled:opacity-50"
                  >
                    {actionLoading === `approve-${res.id}` ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    Approuver
                  </button>
                  <button
                    onClick={() => handleReject(res.id)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-red-600/40 hover:text-red-300 transition-all disabled:opacity-50"
                  >
                    {actionLoading === `reject-${res.id}` ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
