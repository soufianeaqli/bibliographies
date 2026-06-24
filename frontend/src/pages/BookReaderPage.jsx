import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Book3D from '../components/Book3D';
import {
  ChevronLeft, ChevronRight, Maximize, Minimize,
  Moon, Sun, Bookmark, BookmarkPlus, Loader, X,
  Search, Settings, Volume2, VolumeX, ArrowLeft,
} from 'lucide-react';
import {
  fetchBook, getBookPages, getReadingProgress, updateReadingProgress,
  getBookmarks, addBookmark, deleteBookmark,
} from '../api/libraryClient';

const SETTINGS_KEY = 'reader_settings_v2';

const defaultSettings = {
  darkMode: false,
  fontSize: 16,
  fontFamily: 'Georgia, "Times New Roman", serif',
  lineHeight: 1.8,
  soundEnabled: true,
};

function loadSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  } catch { return defaultSettings; }
}

function persistSettings(s) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

let audioCtx = null;
function playPageSound() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const dur = 0.18;
    const len = audioCtx.sampleRate * dur;
    const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const t = i / audioCtx.sampleRate;
      data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 35) * 0.12 *
        (1 + 0.3 * Math.sin(t * 200));
    }
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const filt = audioCtx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 1200;
    const gain = audioCtx.createGain();
    gain.gain.value = 0.25;
    src.connect(filt);
    filt.connect(gain);
    gain.connect(audioCtx.destination);
    src.start();
  } catch {}
}

function chunkText(text, targetSize = 280) {
  const clean = text || '';
  if (!clean) return ['Aucun contenu disponible pour ce livre.'];
  const paragraphs = clean.split(/\n{2,}/);
  const chunks = [];
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    if (trimmed.length <= targetSize) {
      chunks.push(trimmed);
    } else {
      const sentences = trimmed.match(/[^.!?]*[.!?]+|[^.!?]+$/g) || [trimmed];
      let cur = '';
      for (const s of sentences) {
        const t = s.trim();
        if (!t) continue;
        if ((cur + ' ' + t).trim().length > targetSize && cur) {
          chunks.push(cur.trim());
          cur = t;
        } else {
          cur = cur ? cur + ' ' + t : t;
        }
      }
      if (cur.trim()) chunks.push(cur.trim());
    }
  }
  const minLen = Math.max(30, Math.floor(targetSize * 0.3));
  const merged = [];
  for (const chunk of chunks) {
    if (merged.length > 0 && chunk.length < minLen) {
      merged[merged.length - 1] += ' ' + chunk;
    } else if (merged.length > 0 && merged[merged.length - 1].length < minLen) {
      merged[merged.length - 1] += ' ' + chunk;
    } else {
      merged.push(chunk);
    }
  }
  if (merged.length > 1 && merged[merged.length - 1].length < minLen) {
    merged[merged.length - 2] += ' ' + merged.pop();
  }
  return merged.filter(c => c.length > 0);
}

export default function BookReaderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const bookRef = useRef(null);
  const searchRef = useRef(null);

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState([]);
  const [settings, setSettings] = useState(loadSettings);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [progress, setProgress] = useState(0);
  const [bookmarks, setBookmarks] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTurning, setIsTurning] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchIdx, setSearchIdx] = useState(-1);

  const uiTimer = useRef(null);
  const saveTimer = useRef(null);
  const darkMode = settings.darkMode;

  useEffect(() => { persistSettings(settings); }, [settings]);

  const updateSetting = useCallback((k, v) => {
    setSettings(p => ({ ...p, [k]: v }));
  }, []);

  const saveProgress = useCallback((page, total) => {
    const p = Math.max(0, parseInt(page, 10) || 0);
    const t = Math.max(1, parseInt(total, 10) || 1);
    const pct = Math.min(100, Math.round((p / t) * 100));
    setProgress(pct);
    setCurrentPage(p + 1);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (id) updateReadingProgress(id, { last_page_read: p, progress_percentage: pct }).catch(() => {});
    }, 800);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetchBook(id),
      getBookPages(id).catch(() => null),
      getReadingProgress(id).catch(() => ({ last_page_read: 0, progress_percentage: 0 })),
      getBookmarks(id).catch(() => []),
    ])
      .then(([bookData, bPages, prog, bmk]) => {
        setBook(bookData);
        setBookmarks(bmk);
        const raw = bPages?.full_text || bookData.description || '';
        const len = raw.length;
        let cs = 280;
        if (len > 300000) cs = 420;
        else if (len > 150000) cs = 340;
        else if (len > 50000) cs = 300;
        const chunks = chunkText(raw, cs);
        setPages(chunks);
        setTotalPages(chunks.length);
        const start = Math.min(prog.last_page_read || 0, Math.max(0, chunks.length - 1));
        setCurrentPage(start + 1);
        setProgress(prog.progress_percentage || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // Sauvegarder la progression au montage (crée l'entrée dans l'historique)
  useEffect(() => {
    if (!id || loading || totalPages === 0) return;
    const timer = setTimeout(() => {
      const p = currentPage - 1;
      const pct = Math.min(100, Math.round((currentPage / totalPages) * 100));
      updateReadingProgress(id, { last_page_read: p, progress_percentage: pct }).catch(() => {});
    }, 1500);
    return () => clearTimeout(timer);
  }, [id, loading, totalPages]);

  // Sauvegarder la progression avant de quitter la page
  useEffect(() => {
    if (!id || totalPages === 0) return;
    const handleBeforeUnload = () => {
      const p = currentPage - 1;
      const pct = Math.min(100, Math.round((currentPage / totalPages) * 100));
      const token = localStorage.getItem('pt16_token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      fetch(`${baseUrl}/books/${id}/reading-progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        keepalive: true,
        body: JSON.stringify({ last_page_read: p, progress_percentage: pct }),
      }).catch(() => {});
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      const p = currentPage - 1;
      const pct = Math.min(100, Math.round((currentPage / totalPages) * 100));
      updateReadingProgress(id, { last_page_read: p, progress_percentage: pct }).catch(() => {});
    };
  }, [id, currentPage, totalPages]);

  const onTurnComplete = useCallback(() => {
    setIsTurning(false);
    const next = Math.min(currentPage + 1, totalPages);
    setCurrentPage(next);
    const pct = Math.min(100, Math.round((next / totalPages) * 100));
    setProgress(pct);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (id) updateReadingProgress(id, { last_page_read: next - 1, progress_percentage: pct }).catch(() => {});
    }, 800);
  }, [currentPage, totalPages, id]);

  const onTurnBackComplete = useCallback(() => {
    setIsTurning(false);
    const prev = Math.max(1, currentPage - 1);
    setCurrentPage(prev);
    const pct = Math.min(100, Math.round((prev / totalPages) * 100));
    setProgress(pct);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (id) updateReadingProgress(id, { last_page_read: prev - 1, progress_percentage: pct }).catch(() => {});
    }, 800);
  }, [currentPage, totalPages, id]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages && !isTurning && bookRef.current?.turnForward) {
      if (settings.soundEnabled) playPageSound();
      setIsTurning(true);
      bookRef.current.turnForward();
    }
  }, [currentPage, totalPages, isTurning, settings.soundEnabled]);

  const prevPage = useCallback(() => {
    if (currentPage > 1 && !isTurning && bookRef.current?.turnBackward) {
      if (settings.soundEnabled) playPageSound();
      setIsTurning(true);
      bookRef.current.turnBackward();
    }
  }, [currentPage, isTurning, settings.soundEnabled]);

  const goToPage = useCallback((pageNum) => {
    const p = Math.max(1, Math.min(pageNum, totalPages));
    setCurrentPage(p);
    const pct = Math.min(100, Math.round((p / totalPages) * 100));
    setProgress(pct);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (id) updateReadingProgress(id, { last_page_read: p - 1, progress_percentage: pct }).catch(() => {});
    }, 800);
  }, [totalPages, id]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleAddBookmark = async () => {
    if (!id) return;
    try {
      const pageText = pages[currentPage - 1] || '';
      const bm = await addBookmark(id, { page_number: currentPage, note: '', page_text: pageText });
      setBookmarks(prev => [...prev, bm].sort((a, b) => a.page_number - b.page_number));
    } catch {}
  };

  const handleDeleteBookmark = async (bmId) => {
    try {
      await deleteBookmark(bmId);
      setBookmarks(prev => prev.filter(b => b.id !== bmId));
    } catch {}
  };

  const performSearch = useCallback((q) => {
    if (!q.trim()) { setSearchResults([]); setSearchIdx(-1); return; }
    const results = [];
    const lower = q.toLowerCase();
    for (let i = 0; i < pages.length; i++) {
      if (pages[i].toLowerCase().includes(lower)) {
        results.push({ page: i + 1, preview: pages[i].substring(0, 120).replace(/\n/g, ' ') });
      }
    }
    setSearchResults(results);
    setSearchIdx(results.length > 0 ? 0 : -1);
    if (results.length > 0) goToPage(results[0].page);
  }, [pages, goToPage]);

  const navigateSearch = useCallback((dir) => {
    if (searchResults.length === 0) return;
    const ni = dir === 'next'
      ? (searchIdx + 1) % searchResults.length
      : (searchIdx - 1 + searchResults.length) % searchResults.length;
    setSearchIdx(ni);
    goToPage(searchResults[ni].page);
  }, [searchResults, searchIdx, goToPage]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      switch (e.key) {
        case 'ArrowRight': e.preventDefault(); nextPage(); break;
        case 'ArrowLeft': e.preventDefault(); prevPage(); break;
        case 'f': case 'F': if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); toggleFullscreen(); } break;
        case 's': case 'S': if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); setShowSearch(v => !v); } break;
        case 'b': case 'B': if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); handleAddBookmark(); } break;
        case 'Escape': setShowSearch(false); setShowSettings(false); setShowBookmarks(false); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [nextPage, prevPage, toggleFullscreen, handleAddBookmark]);

  const handleMouseMove = useCallback(() => {
    setShowUI(true);
    if (uiTimer.current) clearTimeout(uiTimer.current);
    uiTimer.current = setTimeout(() => {
      if (!showSearch && !showSettings && !showBookmarks) setShowUI(false);
    }, 3500);
  }, [showSearch, showSettings, showBookmarks]);

  useEffect(() => {
    return () => { if (uiTimer.current) clearTimeout(uiTimer.current); };
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: '#0D0B09' }}>
        <Loader className="w-10 h-10 animate-spin" style={{ color: '#D4AF37' }} />
        <span className="text-sm" style={{ color: 'rgba(212,175,55,0.6)' }}>
          Ouverture du livre...
        </span>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: '#0D0B09', color: '#888' }}>
        <span>Livre introuvable.</span>
        <button onClick={() => navigate('/bibliotheque')}
          className="px-4 py-2 text-sm rounded-lg transition-all"
          style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}>
          Retour
        </button>
      </div>
    );
  }

  const isBookmarked = bookmarks.some(b => b.page_number === currentPage);

  return (
    <div
      className="h-screen w-screen overflow-hidden relative select-none"
      style={{ background: darkMode ? '#0D0B09' : '#C8BCA8', cursor: isTurning ? 'wait' : 'default' }}
      onMouseMove={handleMouseMove}
    >
      {/* Book - centered */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ padding: '2%' }}>
        <div className="w-full h-full" style={{ maxWidth: '920px', maxHeight: '88vh' }}>
          <Book3D
            ref={bookRef}
            pages={pages}
            currentPage={currentPage}
            totalPages={totalPages}
            onTurnPage={onTurnComplete}
            onTurnBack={onTurnBackComplete}
            darkMode={darkMode}
            fontSize={settings.fontSize}
            fontFamily={settings.fontFamily}
            lineHeight={settings.lineHeight}
          />
        </div>
      </div>

      {/* Click zones */}
      <div
        className="absolute inset-0 z-10 flex pointer-events-none"
        style={{ padding: '5% 15% 10%' }}
      >
        <div
          className="flex-1 pointer-events-auto cursor-pointer"
          onClick={prevPage}
          style={{ cursor: currentPage > 1 ? 'pointer' : 'default' }}
        />
        <div className="w-16" />
        <div
          className="flex-1 pointer-events-auto cursor-pointer"
          onClick={nextPage}
          style={{ cursor: currentPage < totalPages ? 'pointer' : 'default' }}
        />
      </div>

      {/* Navigation arrows */}
      {currentPage > 1 && !isTurning && (
        <button
          onClick={(e) => { e.stopPropagation(); prevPage(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full transition-all duration-300 hover:scale-110"
          style={{
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(8px)',
            color: 'rgba(255,255,255,0.8)',
            opacity: showUI ? 1 : 0.2,
          }}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {currentPage < totalPages && !isTurning && (
        <button
          onClick={(e) => { e.stopPropagation(); nextPage(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full transition-all duration-300 hover:scale-110"
          style={{
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(8px)',
            color: 'rgba(255,255,255,0.8)',
            opacity: showUI ? 1 : 0.2,
          }}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Top bar */}
      <header
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-3 transition-all duration-500"
        style={{
          background: darkMode
            ? 'linear-gradient(180deg, rgba(13,11,9,0.92) 0%, transparent 100%)'
            : 'linear-gradient(180deg, rgba(200,188,168,0.92) 0%, transparent 100%)',
          opacity: showUI ? 1 : 0,
          pointerEvents: showUI ? 'auto' : 'none',
        }}
      >
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/bibliotheque')}
            className="p-2 rounded-full transition-all duration-200 hover:scale-110"
            style={{ background: 'rgba(0,0,0,0.25)', color: 'rgba(255,255,255,0.8)' }}>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex flex-col">
            <span className="text-sm font-semibold truncate max-w-[160px] sm:max-w-[280px]"
              style={{ color: darkMode ? '#fff' : '#1A1008' }}>
              {book.titre}
            </span>
            <span className="text-[10px] hidden sm:inline"
              style={{ color: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(26,16,8,0.4)' }}>
              {book.auteur}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setShowSearch(v => !v)}
            className="p-2 rounded-full transition-all duration-200 hover:scale-110"
            style={{
              background: showSearch ? 'rgba(212,175,55,0.25)' : 'rgba(0,0,0,0.25)',
              color: showSearch ? '#D4AF37' : 'rgba(255,255,255,0.8)',
            }}>
            <Search className="w-4 h-4" />
          </button>

          <button onClick={handleAddBookmark}
            className="p-2 rounded-full transition-all duration-200 hover:scale-110"
            style={{
              background: isBookmarked ? 'rgba(212,175,55,0.25)' : 'rgba(0,0,0,0.25)',
              color: isBookmarked ? '#D4AF37' : 'rgba(255,255,255,0.8)',
            }}>
            <BookmarkPlus className="w-4 h-4" />
          </button>

          <button onClick={() => setShowBookmarks(v => !v)}
            className="p-2 rounded-full transition-all duration-200 hover:scale-110 relative"
            style={{
              background: showBookmarks ? 'rgba(212,175,55,0.25)' : 'rgba(0,0,0,0.25)',
              color: showBookmarks ? '#D4AF37' : 'rgba(255,255,255,0.8)',
            }}>
            <Bookmark className="w-4 h-4" />
            {bookmarks.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                style={{ background: '#D4AF37', color: '#000' }}>
                {bookmarks.length}
              </span>
            )}
          </button>

          <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.15)' }} />

          <button onClick={() => setShowSettings(v => !v)}
            className="p-2 rounded-full transition-all duration-200 hover:scale-110"
            style={{
              background: showSettings ? 'rgba(212,175,55,0.25)' : 'rgba(0,0,0,0.25)',
              color: showSettings ? '#D4AF37' : 'rgba(255,255,255,0.8)',
            }}>
            <Settings className="w-4 h-4" />
          </button>

          <button onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
            className="p-2 rounded-full transition-all duration-200 hover:scale-110"
            style={{ background: 'rgba(0,0,0,0.25)', color: settings.soundEnabled ? 'rgba(255,255,255,0.8)' : 'rgba(255,80,80,0.5)' }}>
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button onClick={() => updateSetting('darkMode', !darkMode)}
            className="p-2 rounded-full transition-all duration-200 hover:scale-110"
            style={{ background: 'rgba(0,0,0,0.25)', color: 'rgba(255,255,255,0.8)' }}>
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button onClick={toggleFullscreen}
            className="p-2 rounded-full transition-all duration-200 hover:scale-110"
            style={{ background: 'rgba(0,0,0,0.25)', color: 'rgba(255,255,255,0.8)' }}>
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Search panel */}
      {showSearch && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-4"
          onClick={(e) => e.stopPropagation()}>
          <div className="rounded-xl overflow-hidden shadow-2xl"
            style={{
              background: darkMode ? 'rgba(20,17,13,0.95)' : 'rgba(248,243,234,0.95)',
              backdropFilter: 'blur(20px)',
              border: darkMode ? '1px solid rgba(212,175,55,0.15)' : '1px solid rgba(0,0,0,0.08)',
            }}>
            <div className="flex items-center gap-2 px-4 py-3">
              <Search className="w-4 h-4 shrink-0" style={{ color: '#D4AF37', opacity: 0.6 }} />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') performSearch(searchQuery); }}
                placeholder="Rechercher dans le livre..."
                className="flex-1 bg-transparent text-sm outline-none border-none placeholder:opacity-30"
                style={{ color: darkMode ? 'rgba(255,255,255,0.85)' : '#1A1008' }}
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setSearchResults([]); setSearchIdx(-1); }}
                  className="p-1 rounded-full hover:bg-black/10 transition-colors">
                  <X className="w-3.5 h-3.5" style={{ opacity: 0.4 }} />
                </button>
              )}
            </div>
            {searchResults.length > 0 && (
              <div className="border-t px-2 py-2 max-h-48 overflow-y-auto"
                style={{ borderColor: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                <div className="flex items-center justify-between px-2 mb-2">
                  <span className="text-[10px] font-mono" style={{ opacity: 0.5 }}>
                    {searchIdx + 1} / {searchResults.length}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => navigateSearch('prev')} className="p-1 rounded hover:bg-black/10">
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button onClick={() => navigateSearch('next')} className="p-1 rounded hover:bg-black/10">
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                {searchResults.slice(0, 15).map((r, i) => (
                  <button key={i}
                    onClick={() => { setSearchIdx(i); goToPage(r.page); setShowSearch(false); }}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex justify-between items-center"
                    style={{
                      background: i === searchIdx ? 'rgba(212,175,55,0.12)' : 'transparent',
                      color: darkMode ? 'rgba(255,255,255,0.7)' : '#2A2420',
                    }}>
                    <span className="truncate flex-1">{r.preview}</span>
                    <span className="font-mono shrink-0 ml-2 opacity-40" style={{ fontSize: 10 }}>p.{r.page}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings panel */}
      {showSettings && (
        <div className="absolute top-14 right-5 z-30 w-64"
          onClick={(e) => e.stopPropagation()}>
          <div className="rounded-xl overflow-hidden shadow-2xl"
            style={{
              background: darkMode ? 'rgba(20,17,13,0.95)' : 'rgba(248,243,234,0.95)',
              backdropFilter: 'blur(20px)',
              border: darkMode ? '1px solid rgba(212,175,55,0.15)' : '1px solid rgba(0,0,0,0.08)',
            }}>
            <div className="px-4 py-3 border-b"
              style={{ borderColor: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#D4AF37' }}>
                Paramètres
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold mb-2 block"
                  style={{ color: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(26,16,8,0.4)' }}>
                  Taille du texte
                </label>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateSetting('fontSize', Math.max(12, settings.fontSize - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all hover:scale-105"
                    style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37' }}>A-</button>
                  <span className="text-sm font-mono w-8 text-center"
                    style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : '#2A2420' }}>
                    {settings.fontSize}
                  </span>
                  <button onClick={() => updateSetting('fontSize', Math.min(28, settings.fontSize + 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all hover:scale-105"
                    style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37' }}>A+</button>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold mb-2 block"
                  style={{ color: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(26,16,8,0.4)' }}>
                  Interligne
                </label>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateSetting('lineHeight', Math.max(1.4, settings.lineHeight - 0.2))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all hover:scale-105"
                    style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37' }}>−</button>
                  <span className="text-sm font-mono w-8 text-center"
                    style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : '#2A2420' }}>
                    {settings.lineHeight.toFixed(1)}
                  </span>
                  <button onClick={() => updateSetting('lineHeight', Math.min(2.4, settings.lineHeight + 0.2))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all hover:scale-105"
                    style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37' }}>+</button>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold mb-2 block"
                  style={{ color: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(26,16,8,0.4)' }}>
                  Police
                </label>
                <div className="flex gap-2">
                  {[
                    { label: 'Sérif', value: 'Georgia, "Times New Roman", serif' },
                    { label: 'Sans', value: 'Arial, Helvetica, sans-serif' },
                  ].map(f => (
                    <button key={f.value} onClick={() => updateSetting('fontFamily', f.value)}
                      className="flex-1 py-2 text-xs rounded-lg transition-all"
                      style={{
                        background: settings.fontFamily === f.value ? 'rgba(212,175,55,0.2)' : 'rgba(128,128,128,0.08)',
                        color: settings.fontFamily === f.value ? '#D4AF37' : (darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(26,16,8,0.5)'),
                        border: settings.fontFamily === f.value ? '1px solid rgba(212,175,55,0.3)' : '1px solid transparent',
                        fontFamily: f.value,
                      }}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bookmarks panel */}
      {showBookmarks && (
        <div className="absolute top-14 right-5 z-30 w-72"
          onClick={(e) => e.stopPropagation()}>
          <div className="rounded-xl overflow-hidden shadow-2xl"
            style={{
              background: darkMode ? 'rgba(20,17,13,0.95)' : 'rgba(248,243,234,0.95)',
              backdropFilter: 'blur(20px)',
              border: darkMode ? '1px solid rgba(212,175,55,0.15)' : '1px solid rgba(0,0,0,0.08)',
            }}>
            <div className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#D4AF37' }}>
                <Bookmark className="w-3 h-3 inline mr-1.5" />Marque-pages
              </h3>
              <button onClick={() => setShowBookmarks(false)} className="p-1 rounded-full hover:bg-black/10">
                <X className="w-3.5 h-3.5" style={{ opacity: 0.5 }} />
              </button>
            </div>
            {bookmarks.length === 0 ? (
              <p className="text-xs px-4 py-6 text-center" style={{ opacity: 0.35 }}>
                Appuyez sur <kbd className="px-1.5 py-0.5 rounded text-[9px]"
                  style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}>B</kbd> pour ajouter
              </p>
            ) : (
              <div className="p-2 max-h-64 overflow-y-auto space-y-1">
                {bookmarks.map(bm => (
                  <div key={bm.id}
                    className="flex items-center justify-between p-2.5 rounded-lg transition-colors cursor-pointer group"
                    style={{ background: bm.page_number === currentPage ? 'rgba(212,175,55,0.1)' : 'transparent' }}
                    onClick={() => { goToPage(bm.page_number); setShowBookmarks(false); }}>
                    <div>
                      <span className="text-xs font-bold" style={{ color: '#D4AF37' }}>Page {bm.page_number}</span>
                      {bm.note && <p className="text-[10px] mt-0.5" style={{ opacity: 0.5 }}>{bm.note}</p>}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteBookmark(bm.id); }}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/10">
                      <X className="w-3 h-3" style={{ color: '#ef4444' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <footer
        className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-3 transition-all duration-500"
        style={{
          background: darkMode
            ? 'linear-gradient(0deg, rgba(13,11,9,0.92) 0%, transparent 100%)'
            : 'linear-gradient(0deg, rgba(200,188,168,0.92) 0%, transparent 100%)',
          opacity: showUI ? 1 : 0,
          pointerEvents: showUI ? 'auto' : 'none',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono tabular-nums"
            style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(26,16,8,0.5)' }}>
            <span style={{ color: '#D4AF37', fontWeight: 700 }}>{currentPage}</span>
            <span style={{ opacity: 0.4 }}> / {totalPages}</span>
          </span>
        </div>

        <div className="flex-1 mx-6 hidden sm:block">
          <div className="w-full h-1 rounded-full overflow-hidden"
            style={{ background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #B8860B, #D4AF37, #E8C84A)',
                boxShadow: '0 0 8px rgba(212,175,55,0.4)',
              }} />
          </div>
        </div>

        <div className="text-[10px] font-mono"
          style={{ color: darkMode ? 'rgba(255,255,255,0.35)' : 'rgba(26,16,8,0.35)' }}>
          {progress}%
        </div>
      </footer>
    </div>
  );
}
