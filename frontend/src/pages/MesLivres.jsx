import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, CheckCircle, XCircle, Play, Loader } from 'lucide-react';
import { getMyReservations } from '../api/libraryClient';

const statusConfig = {
  pending: { label: 'En attente', icon: Clock, class: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  approved: { label: 'Approuvé', icon: CheckCircle, class: 'text-green-400 border-green-500/30 bg-green-500/10' },
  fulfilled: { label: 'Terminé', icon: CheckCircle, class: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  cancelled: { label: 'Annulé', icon: XCircle, class: 'text-red-400 border-red-500/30 bg-red-500/10' },
};

export default function MesLivres() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyReservations()
      .then(setReservations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 relative pb-20 min-h-screen bg-[#0A0806]">
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-[#D4AF37]/5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-purple-900/5 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="px-8 pt-10 pb-6 relative z-10">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-4 tracking-wider uppercase drop-shadow-lg" style={{ textShadow: '0 5px 20px rgba(212,175,55,0.4)' }}>
          <div className="p-3 bg-gradient-to-br from-[#D4AF37]/20 to-transparent rounded-xl border border-[#D4AF37]/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <BookOpen className="w-8 h-8 text-[#D4AF37]" />
          </div>
          Mes Livres
        </h1>
        <p className="text-gray-400 font-medium text-lg ml-20">Réservations et livres approuvés.</p>
      </div>

      <div className="px-8 pb-12 relative z-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader className="w-10 h-10 text-[#D4AF37] animate-spin" />
          </div>
        ) : reservations.length === 0 ? (
          <div className="bg-[#14120E]/80 backdrop-blur-md border border-[#2C261A] rounded-3xl p-12 text-center">
            <BookOpen className="w-16 h-16 text-[#D4AF37] mx-auto mb-4 opacity-50" />
            <p className="text-gray-500 text-lg">Aucune réservation pour le moment.</p>
            <button onClick={() => navigate('/bibliotheque/livres')} className="mt-4 text-[#D4AF37] underline text-sm">Parcourir les livres</button>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((res) => {
              const st = statusConfig[res.status] || statusConfig.pending;
              const StatusIcon = st.icon;
              return (
                <div key={res.id} className="bg-[#14120E]/90 backdrop-blur-md border border-[#2C261A] rounded-2xl p-5 hover:border-[#D4AF37]/40 transition-all shadow-xl flex items-center gap-6">
                  <div className="w-16 h-24 rounded-lg overflow-hidden shrink-0 shadow-lg border border-[#2C261A]">
                    {res.reference?.cover_image
                      ? <img src={res.reference.cover_image} alt={res.reference.titre} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-[#1C1812] flex items-center justify-center text-[8px] text-gray-500 font-bold p-1 text-center">{res.reference?.titre}</div>
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate">{res.reference?.titre || 'Livre inconnu'}</h3>
                    <p className="text-sm text-gray-400 truncate">{res.reference?.auteur || ''}</p>
                    <p className="text-xs text-gray-500 mt-1">Réservé le {new Date(res.reservation_date || res.created_at).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider ${st.class}`}>
                      <StatusIcon className="w-3.5 h-3.5" /> {st.label}
                    </span>

                    {res.status === 'approved' && (
                      <button onClick={() => navigate(`/reader/${res.reference_id}`)} className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black rounded-lg font-bold uppercase tracking-wider text-xs hover:bg-white transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                        <Play className="w-3.5 h-3.5 fill-black" /> Lire
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
