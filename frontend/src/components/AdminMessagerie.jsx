import React, { useState, useEffect } from 'react';
import { MessageSquare, MailOpen, Trash2, Send, Clock, BookOpen, AlertCircle, Lightbulb, Check, Loader } from 'lucide-react';
import { getAdminContacts, getAdminContact, markContactRead, replyContact, deleteContact } from '../api/libraryClient';

const typeLabels = {
  demande_livre: { label: 'Demande de livre', icon: BookOpen, color: 'text-blue-400' },
  suggestion: { label: 'Suggestion', icon: Lightbulb, color: 'text-purple-400' },
  probleme: { label: 'Problème', icon: AlertCircle, color: 'text-red-400' },
  autre: { label: 'Autre', icon: MailOpen, color: 'text-gray-400' },
};

export default function AdminMessagerie() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reponse, setReponse] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getAdminContacts().then(setMessages).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSelect = async (msg) => {
    setSelected(msg);
    setReponse(msg.reponse || '');
    if (!msg.is_read) {
      try {
        await markContactRead(msg.id);
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
      } catch {}
    }
  };

  const handleReply = async () => {
    if (!reponse.trim() || !selected) return;
    setSending(true);
    try {
      const { data } = await replyContact(selected.id, reponse);
      setMessages(prev => prev.map(m => m.id === selected.id ? { ...m, ...data } : m));
      setSelected(prev => ({ ...prev, ...data }));
    } catch {}
    setSending(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteContact(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch {}
  };

  const unread = messages.filter(m => !m.is_read).length;

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
              <MessageSquare className="w-8 h-8 text-[#D4AF37]" />
            </div>
            Messagerie
            {unread > 0 && (
              <span className="text-sm bg-red-500/20 text-red-400 px-3 py-1 rounded-full border border-red-500/30 font-bold">
                {unread} non lu{unread > 1 ? 's' : ''}
              </span>
            )}
          </h1>
          <p className="text-gray-400 font-medium text-lg ml-20">Messages des utilisateurs.</p>
        </div>

        <div className="px-8 mt-4 pb-12 flex gap-6">
          {/* Sidebar */}
          <div className="w-full max-w-sm shrink-0 space-y-2">
            {messages.length === 0 ? (
              <div className="bg-[#14120E] border border-[#2C261A] rounded-2xl p-8 text-center">
                <MessageSquare className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Aucun message pour le moment.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const t = typeLabels[msg.type] || typeLabels.autre;
                const Icon = t.icon;
                return (
                  <button
                    key={msg.id}
                    onClick={() => handleSelect(msg)}
                    className={`w-full text-left bg-[#14120E] border rounded-2xl p-5 transition-all hover:border-[#D4AF37]/50 ${
                      selected?.id === msg.id ? 'border-[#D4AF37]/70' : 'border-[#2C261A]'
                    } ${!msg.is_read ? 'border-l-[#D4AF37] border-l-4' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {!msg.is_read && <span className="w-2 h-2 rounded-full bg-[#D4AF37] shrink-0" />}
                          <span className={`text-xs font-bold uppercase tracking-wider ${t.color}`}>
                            <Icon className="w-3 h-3 inline mr-1" />
                            {t.label}
                          </span>
                        </div>
                        <h4 className={`text-sm truncate ${!msg.is_read ? 'text-white font-bold' : 'text-gray-300'}`}>
                          {msg.sujet}
                        </h4>
                        <p className="text-xs text-gray-500 truncate mt-1">{msg.utilisateur?.nom || 'Inconnu'}</p>
                      </div>
                      <div className="text-[10px] text-gray-600 shrink-0">
                        {new Date(msg.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Detail */}
          <div className="flex-1">
            {!selected ? (
              <div className="bg-[#14120E] border border-[#2C261A] rounded-3xl p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">Sélectionnez un message pour le lire.</p>
              </div>
            ) : (
              <div className="bg-[#14120E] border border-[#2C261A] rounded-3xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-[#2C261A] flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-xs text-gray-500">
                        {new Date(selected.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white">{selected.sujet}</h2>
                    <p className="text-sm text-[#D4AF37] mt-1">
                      {selected.utilisateur?.nom || 'Inconnu'} — {selected.utilisateur?.email || ''}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(selected.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Message */}
                <div className="p-6">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>

                {/* Reply */}
                <div className="p-6 border-t border-[#2C261A]">
                  <label className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-3 block">
                    {selected.reponse ? 'Modifier votre réponse' : 'Votre réponse'}
                  </label>
                  <textarea
                    value={reponse}
                    onChange={(e) => setReponse(e.target.value)}
                    rows={4}
                    placeholder="Écrivez votre réponse..."
                    className="w-full bg-[#1C1812] border border-[#2C261A] rounded-xl p-4 text-white focus:outline-none focus:border-[#D4AF37] transition-colors resize-y mb-4"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleReply}
                      disabled={sending || !reponse.trim()}
                      className="flex items-center gap-2 bg-[#D4AF37] text-black px-6 py-3 rounded-xl font-bold hover:bg-white transition-all disabled:opacity-50 text-sm"
                    >
                      {sending ? 'Envoi...' : <><Send className="w-4 h-4" /> Envoyer la réponse</>}
                    </button>
                    {selected.reponse && (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <Check className="w-3 h-3" /> Réponse envoyée
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
