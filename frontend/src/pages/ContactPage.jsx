import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle, Mail, BookOpen, AlertCircle, Lightbulb } from 'lucide-react';
import { submitContact } from '../api/libraryClient';

const types = [
  { value: 'demande_livre', label: 'Demande de livre', icon: BookOpen },
  { value: 'suggestion', label: 'Suggestion', icon: Lightbulb },
  { value: 'probleme', label: 'Problème technique', icon: AlertCircle },
  { value: 'autre', label: 'Autre', icon: Mail },
];

export default function ContactPage() {
  const [sujet, setSujet] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('demande_livre');
  const [envoye, setEnvoye] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sujet.trim() || !message.trim()) return;
    setLoading(true);
    setErreur('');
    try {
      await submitContact({ sujet, message, type });
      setEnvoye(true);
      setSujet('');
      setMessage('');
      setType('demande_livre');
    } catch {
      setErreur('Erreur lors de l\'envoi du message. Réessayez plus tard.');
    } finally {
      setLoading(false);
    }
  };

  if (envoye) {
    return (
      <div className="flex-1 relative pb-20 min-h-screen bg-[#0A0806]">
        <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-[#D4AF37]/5 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-purple-900/5 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto px-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-500/10 flex items-center justify-center mb-6 border border-green-500/30">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-3xl font-black text-white mb-3">Message envoyé !</h2>
            <p className="text-gray-400 mb-8">L'équipe de la bibliothèque vous répondra dans les plus brefs délais.</p>
            <button
              onClick={() => setEnvoye(false)}
              className="bg-[#D4AF37] text-black px-8 py-3 rounded-xl font-bold hover:bg-white transition-all"
            >
              Envoyer un autre message
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative pb-20 min-h-screen bg-[#0A0806]">
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-[#D4AF37]/5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-purple-900/5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #1C1812 25%, transparent 25%, transparent 75%, #1C1812 75%, #1C1812), repeating-linear-gradient(45deg, #1C1812 25%, #0E0C0A 25%, #0E0C0A 75%, #1C1812 75%, #1C1812)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }}></div>

      <div className="relative z-10">
        <div className="px-8 pt-10 pb-6">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-4 tracking-wider uppercase drop-shadow-lg" style={{ textShadow: '0 5px 20px rgba(212,175,55,0.4)' }}>
            <div className="p-3 bg-gradient-to-br from-[#D4AF37]/20 to-transparent rounded-xl border border-[#D4AF37]/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <MessageSquare className="w-8 h-8 text-[#D4AF37]" />
            </div>
            Contacter l'équipe
          </h1>
          <p className="text-gray-400 font-medium text-lg ml-20">Une suggestion, une demande de livre ou un problème ? Écrivez-nous.</p>
        </div>

        <div className="px-8 mt-4 pb-12">
          <div className="max-w-2xl bg-[#14120E] border border-[#2C261A] rounded-3xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {erreur && (
                <div className="px-4 py-3 rounded-xl text-sm font-bold border bg-red-900/20 border-red-500/30 text-red-400">
                  {erreur}
                </div>
              )}

              <div>
                <label className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-3 block">Type de message</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {types.map((t) => {
                    const Icon = t.icon;
                    const estActif = type === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setType(t.value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                          estActif
                            ? 'bg-[#D4AF37]/10 border-[#D4AF37]/50 text-[#D4AF37]'
                            : 'bg-[#1C1812] border-[#2C261A] text-gray-400 hover:border-white/30'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-[11px] font-bold text-center leading-tight">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-2 block">Sujet</label>
                <input
                  value={sujet}
                  onChange={(e) => setSujet(e.target.value)}
                  placeholder="Ex: Demande d'ajout d'un livre"
                  className="w-full bg-[#1C1812] border border-[#2C261A] rounded-xl p-4 text-white focus:outline-none focus:border-[#D4AF37] transition-colors shadow-inner"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-2 block">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  placeholder="Décrivez votre demande, suggestion ou problème..."
                  className="w-full bg-[#1C1812] border border-[#2C261A] rounded-xl p-4 text-white focus:outline-none focus:border-[#D4AF37] transition-colors shadow-inner resize-y"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#D4AF37] text-black font-black uppercase tracking-wider text-sm px-8 py-4 rounded-xl hover:bg-white hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? 'Envoi en cours...' : (
                  <>
                    <Send className="w-4 h-4" /> Envoyer le message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
