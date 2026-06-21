import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Star, Calendar, User, Clock, Video, Play, ChevronDown, Send, Loader } from 'lucide-react';
import { fetchBook, reserveBook, cancelReservation, getAvis, addAvis } from '../api/libraryClient';

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reservationStatus, setReservationStatus] = useState('none');
  const [canRead, setCanRead] = useState(false);
  const [avis, setAvis] = useState([]);
  const [avisForm, setAvisForm] = useState({ rating: 5, comment: '' });
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchBook(id)
      .then(data => {
        setBook(data);
        setReservationStatus(data.is_reserved ? 'pending' : 'none');
        setCanRead(data.can_read);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    getAvis(id).then(setAvis).catch(console.error);
  }, [id]);

  const handleReserve = async () => {
    try {
      if (reservationStatus === 'none') {
        const data = await reserveBook(id);
        setReservationStatus('pending');
      } else {
        await cancelReservation(id);
        setReservationStatus('none');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAvisSubmit = async (e) => {
    e.preventDefault();
    try {
      const newAvis = await addAvis(id, avisForm);
      setAvis(prev => [newAvis, ...prev.filter(a => a.id !== newAvis.id)]);
      setAvisForm({ rating: 5, comment: '' });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E0C0A] flex items-center justify-center">
        <Loader className="w-10 h-10 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-[#0E0C0A] flex items-center justify-center text-gray-400">
        Livre introuvable.
      </div>
    );
  }

  const avgRating = book.avg_rating || book.rating || 0;

  return (
    <div className="min-h-screen bg-[#0E0C0A] text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0E0C0A]/95 backdrop-blur-md border-b border-[#2C261A]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/bibliotheque')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" /> Retour
          </button>
          <div className="flex items-center gap-4">
            {book.video_url && (
              <button onClick={() => setShowVideo(!showVideo)} className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 text-purple-300 border border-purple-500/30 rounded-xl hover:bg-purple-600/40 transition-colors text-sm font-bold">
                <Video className="w-4 h-4" /> Bande-annonce
              </button>
            )}
            {canRead ? (
              <span className="px-6 py-2 rounded-xl font-bold uppercase tracking-wider text-sm bg-green-600/20 text-green-400 border border-green-500/30">
                Approuvé ✓
              </span>
            ) : (
              <button
                onClick={handleReserve}
                className={`px-6 py-2 rounded-xl font-bold uppercase tracking-wider text-sm transition-all ${
                  reservationStatus === 'pending'
                    ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30 hover:bg-amber-600/40'
                    : 'bg-[#D4AF37] text-black hover:bg-white shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                }`}
              >
                {reservationStatus === 'pending' ? 'En attente...' : 'Réserver le livre'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideo && book.video_url && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8" onClick={() => setShowVideo(false)}>
          <div className="relative w-full max-w-4xl aspect-video" onClick={e => e.stopPropagation()}>
            <iframe src={book.video_url.replace('watch?v=', 'embed/')} className="w-full h-full rounded-2xl" allowFullScreen title="Bande-annonce"></iframe>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left — Cover + Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-[#2C261A]">
                {book.cover_image
                  ? <img src={book.cover_image} alt={book.titre} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-[#1C1812] flex items-center justify-center text-gray-500 font-bold p-8 text-center text-lg">{book.titre}</div>
                }
              </div>

              {canRead && (
                <button
                  onClick={() => navigate(`/reader/${book.id}`)}
                  className="w-full flex items-center justify-center gap-3 bg-[#D4AF37] text-black py-4 rounded-xl font-black uppercase tracking-wider hover:bg-white transition-all shadow-[0_0_25px_rgba(212,175,55,0.4)]"
                >
                  <Play className="w-5 h-5 fill-black" /> Lire maintenant
                </button>
              )}
              {reservationStatus === 'pending' && (
                <p className="text-amber-400/80 text-xs text-center font-medium">En attente de validation par l'administrateur</p>
              )}
            </div>
          </div>

          {/* Center & Right — Book Info */}
          <div className="lg:col-span-2 space-y-10">
            {/* Title & Meta */}
            <div>
              <h1 className="text-4xl lg:text-5xl font-black text-white mb-3">{book.titre}</h1>
              <p className="text-xl text-[#D4AF37] font-bold mb-6">{book.auteur}</p>
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2 text-gray-400"><BookOpen className="w-4 h-4 text-[#D4AF37]" /> {book.total_pages || 'N/A'} pages</div>
                <div className="flex items-center gap-2 text-gray-400"><Star className="w-4 h-4 text-yellow-500" /> {avgRating}/5</div>
                <div className="flex items-center gap-2 text-gray-400"><Calendar className="w-4 h-4 text-[#D4AF37]" /> {book.annee || 'Année inconnue'}</div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#14120E]/80 backdrop-blur-md border border-[#2C261A] rounded-2xl p-8">
              <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">Résumé</h2>
              <p className="text-gray-300 leading-relaxed text-lg">{book.description || 'Aucune description disponible.'}</p>
            </div>

            {/* Reviews Section */}
            <div className="bg-[#14120E]/80 backdrop-blur-md border border-[#2C261A] rounded-2xl p-8">
              <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-500" /> Avis des lecteurs ({avis.length})
              </h2>

              {/* Add review */}
              <form onSubmit={handleAvisSubmit} className="mb-8 p-6 bg-[#1C1812] rounded-xl border border-[#2C261A]">
                <div className="flex items-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} type="button" onClick={() => setAvisForm(prev => ({ ...prev, rating: s }))}>
                      <Star className={`w-6 h-6 ${s <= avisForm.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={avisForm.comment}
                  onChange={e => setAvisForm(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Partagez votre avis sur ce livre..."
                  className="w-full bg-[#0E0C0A] border border-[#2C261A] rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                  rows={3}
                />
                <button type="submit" className="mt-4 flex items-center gap-2 bg-[#D4AF37] text-black px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-white transition-all">
                  <Send className="w-4 h-4" /> Publier
                </button>
              </form>

              {/* Reviews list */}
              <div className="space-y-6">
                {avis.length === 0 && <p className="text-gray-500 text-center py-8">Aucun avis pour le moment. Soyez le premier !</p>}
                {avis.map((a) => (
                  <div key={a.id} className="border-b border-[#2C261A]/50 pb-6 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1C1812] border border-[#2C261A] flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-bold text-white">{a.utilisateur?.nom || 'Anonyme'}</p>
                          <p className="text-xs text-gray-500">{new Date(a.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-4 h-4 ${s <= a.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} />
                        ))}
                      </div>
                    </div>
                    {a.comment && <p className="text-gray-300 mt-2 ml-13">{a.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
