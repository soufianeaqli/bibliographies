import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HTMLFlipBook from 'react-pageflip';
import {
  ChevronLeft, Maximize, ZoomIn, ZoomOut, Moon, Sun, Bookmark,
  BookmarkPlus, Loader, StickyNote, X, Trash2, FileText
} from 'lucide-react';
import {
  fetchBook, getBookPages, getReadingProgress, updateReadingProgress,
  getBookmarks, addBookmark, deleteBookmark,
  getNotes, addNote, deleteNote
} from '../api/libraryClient';

const Page = React.forwardRef((props, ref) => (
  <div
    className={`page ${props.darkMode ? 'bg-[#1C1A17] text-gray-300' : 'bg-[#F9F6F0] text-gray-800'} shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col p-8 md:p-12 h-full`}
    ref={ref} data-density="soft"
  >
    <div className="page-content flex-1">
      <h2 className="page-header text-xs uppercase tracking-widest text-center mb-8 opacity-50 border-b border-current pb-2">{props.title}</h2>
      <div className="page-text leading-relaxed text-justify whitespace-pre-line" style={{ fontSize: `${props.fontSize}px` }}>
        {props.children}
      </div>
    </div>
    <div className="page-footer text-center text-xs opacity-50 mt-4">{props.number}</div>
  </div>
));

const CoverPage = React.forwardRef((props, ref) => (
  <div className="page page-cover bg-[#2C261A] text-[#D4AF37] flex flex-col justify-center items-center shadow-lg border-2 border-amber-900/50 relative" ref={ref} data-density="hard">
    <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent"></div>
    {props.coverImage && <img src={props.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />}
    <h1 className="text-4xl font-serif text-center relative z-10 px-4">{props.title}</h1>
    <p className="mt-8 uppercase tracking-widest text-xs relative z-10">{props.author}</p>
  </div>
));

const BackCover = React.forwardRef((props, ref) => (
  <div className="page page-cover bg-[#2C261A] border-2 border-amber-900/50 shadow-lg" ref={ref} data-density="hard">
    <div className="w-full h-full bg-gradient-to-bl from-black/60 to-transparent flex items-center justify-center text-amber-900">
      Fin du livre
    </div>
  </div>
));

export default function BookReaderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const flipRef = useRef();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState([]);
  const [bookPages, setBookPages] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('reader_dark') !== 'false');
  const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem('reader_font') || '16'));
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [progress, setProgress] = useState(0);
  const [bookmarks, setBookmarks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [viewPdf, setViewPdf] = useState(false);

  useEffect(() => { localStorage.setItem('reader_dark', darkMode); }, [darkMode]);
  useEffect(() => { localStorage.setItem('reader_font', fontSize); }, [fontSize]);

  const chunkText = (text) => {
    const clean = text || 'Aucun contenu disponible pour ce livre.';
    // Adapter la taille des pages : 200 chars pour les longs textes, 80 pour les courts
    const targetSize = clean.length > 5000 ? 200 : 80;
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
    // Fusionner les chunks trop courts (< 30% de targetSize)
    const minSize = Math.max(20, Math.floor(targetSize * 0.3));
    const merged = [];
    for (const chunk of chunks) {
      if (merged.length > 0 && chunk.length < minSize) {
        merged[merged.length - 1] += ' ' + chunk;
      } else if (merged.length > 0 && merged[merged.length - 1].length < minSize) {
        merged[merged.length - 1] += ' ' + chunk;
      } else {
        merged.push(chunk);
      }
    }
    if (merged.length > 1 && merged[merged.length - 1].length < minSize) {
      merged[merged.length - 2] += ' ' + merged.pop();
    }
    return merged.filter(c => c.length > 0);
  };

  const saveProgress = useCallback((page, total) => {
    const pageNum = Math.max(0, parseInt(page, 10) || 0);
    const totalNum = Math.max(1, parseInt(total, 10) || 1);
    const pct = Math.min(100, Math.round((pageNum / totalNum) * 100));
    setProgress(pct);
    setCurrentPage(pageNum + 1);
    if (id) {
      updateReadingProgress(id, { last_page_read: pageNum, progress_percentage: pct }).catch(() => {});
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetchBook(id),
      getBookPages(id).catch(() => null),
      getReadingProgress(id).catch(() => ({ last_page_read: 0, progress_percentage: 0 })),
      getBookmarks(id).catch(() => []),
      getNotes(id).catch(() => []),
    ])
      .then(([bookData, bPages, prog, bmk, nts]) => {
        setBook(bookData);
        setBookPages(bPages);
        setBookmarks(bmk);
        setNotes(nts);

        // Utiliser le full_text enrichi depuis Google Books (description + snippets + généré)
        const raw = bPages?.full_text || bookData.description || 'Aucun contenu disponible pour ce livre.';
        const chunks = chunkText(raw);
        setPages(chunks);
        setTotalPages(chunks.length);

        const startPage = Math.min(prog.last_page_read || 0, Math.max(0, chunks.length - 1));
        setCurrentPage(startPage + 1);
        setProgress(prog.progress_percentage || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleFlip = (e) => {
    const page = e.data;
    saveProgress(page, totalPages);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleAddBookmark = async () => {
    if (!id) return;
    try {
      const bm = await addBookmark(id, { page_number: currentPage, note: '' });
      setBookmarks(prev => [...prev, bm].sort((a, b) => a.page_number - b.page_number));
    } catch (err) { console.error(err); }
  };

  const handleDeleteBookmark = async (bmId) => {
    try {
      await deleteBookmark(bmId);
      setBookmarks(prev => prev.filter(b => b.id !== bmId));
    } catch (err) { console.error(err); }
  };

  const handleAddNote = async () => {
    if (!id || !newNote.trim()) return;
    try {
      const note = await addNote(id, { page_number: currentPage, text: newNote });
      setNotes(prev => [...prev, note]);
      setNewNote('');
    } catch (err) { console.error(err); }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(id, noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
    } catch (err) { console.error(err); }
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
        <button onClick={() => navigate('/bibliotheque')} className="ml-4 text-[#D4AF37] underline">Retour</button>
      </div>
    );
  }

  const bookPdfPath = bookPages?.book_pdf_path || null;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${darkMode ? 'bg-[#0A0908] text-white' : 'bg-[#E5DFD3] text-black'} relative`}>
      {/* Top Bar */}
      <div className={`header flex justify-between items-center p-4 ${darkMode ? 'bg-[#14120E]' : 'bg-[#F0ECE1]'} shadow-md z-10`}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/bibliotheque')} className="p-2 hover:bg-black/10 rounded-full transition-colors flex items-center gap-2">
            <ChevronLeft className="w-5 h-5" /> <span className="font-medium hidden sm:inline">Retour</span>
          </button>
          <div className="h-6 w-px bg-current opacity-20"></div>
          <h1 className="font-bold text-lg hidden md:block truncate max-w-xs">{book.titre}</h1>
          {totalPages > 0 && <span className="text-xs text-gray-500 font-mono">{totalPages} pages</span>}
        </div>
        <div className="flex items-center gap-2">
          {bookPdfPath && (
            <button onClick={() => setViewPdf(!viewPdf)} className={`p-2 hover:bg-black/10 rounded-full ${viewPdf ? 'text-[#D4AF37]' : ''}`} title="Voir le PDF">
              <FileText className="w-5 h-5" />
            </button>
          )}
          <button onClick={handleAddBookmark} className="p-2 hover:bg-black/10 rounded-full" title="Ajouter marque-page">
            <BookmarkPlus className="w-5 h-5" />
          </button>
          <button onClick={() => setShowBookmarks(!showBookmarks)} className="p-2 hover:bg-black/10 rounded-full relative" title="Voir marque-pages">
            <Bookmark className="w-5 h-5" />
            {bookmarks.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D4AF37] text-black text-[10px] font-bold rounded-full flex items-center justify-center">{bookmarks.length}</span>
            )}
          </button>
          <div className="h-6 w-px bg-current opacity-20 mx-1"></div>
          <button onClick={() => setFontSize(f => Math.max(12, f - 1))} className="p-2 hover:bg-black/10 rounded-full" title="Réduire police"><ZoomOut className="w-5 h-5" /></button>
          <button onClick={() => setFontSize(f => Math.min(24, f + 1))} className="p-2 hover:bg-black/10 rounded-full" title="Agrandir police"><ZoomIn className="w-5 h-5" /></button>
          <span className="text-xs opacity-50 font-mono w-10 text-center">{fontSize}px</span>
          <div className="h-6 w-px bg-current opacity-20 mx-1"></div>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-black/10 rounded-full" title="Thème">
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={toggleFullscreen} className="p-2 hover:bg-black/10 rounded-full" title="Plein Écran"><Maximize className="w-5 h-5" /></button>
          <button onClick={() => setShowNotes(!showNotes)} className="p-2 hover:bg-black/10 rounded-full" title="Notes">
            <StickyNote className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-[#2C261A]">
        <div className="h-full bg-gradient-to-r from-[#D4AF37] to-amber-400 transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main reader */}
        <div className="flex-1 flex flex-col justify-center items-center p-4 overflow-hidden perspective-[1500px]">
          {viewPdf && bookPdfPath ? (
            <div className="w-full h-full min-h-[80vh]">
              <embed src={bookPdfPath} type="application/pdf" className="w-full h-full rounded-lg shadow-[0_30px_60px_rgba(0,0,0,0.4)]" />
            </div>
          ) : (
          <div className="relative shadow-[0_30px_60px_rgba(0,0,0,0.4)] max-w-full">
            <HTMLFlipBook
              ref={flipRef}
              width={350} height={500}
              size="fixed" minWidth={315} maxWidth={1000}
              minHeight={400} maxHeight={1533}
              maxShadowOpacity={0.5} showCover={true}
              mobileScrollSupport={true}
              className="book-wrapper"
              onFlip={handleFlip}
              startPage={currentPage - 1}
            >
              <CoverPage key="cover" title={book.titre} author={book.auteur} coverImage={book.cover_image} darkMode={darkMode} />

              {pages.map((text, idx) => (
                <Page key={`p${idx}`} number={idx + 1} title={book.titre} fontSize={fontSize} darkMode={darkMode}>
                  {text}
                </Page>
              ))}

              <BackCover key="back" />
            </HTMLFlipBook>
          </div>
          )}
        </div>

        {/* Side panels */}
        {showBookmarks && (
          <div className={`w-80 shrink-0 border-l ${darkMode ? 'bg-[#14120E] border-[#2C261A]' : 'bg-[#F0ECE1] border-gray-300'} p-6 overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold uppercase tracking-wider flex items-center gap-2"><Bookmark className="w-4 h-4 text-[#D4AF37]" /> Marque-pages</h3>
              <button onClick={() => setShowBookmarks(false)}><X className="w-5 h-5 opacity-50 hover:opacity-100" /></button>
            </div>
            {bookmarks.length === 0 && <p className="text-sm text-gray-500">Aucun marque-page.</p>}
            <div className="space-y-3">
              {bookmarks.map(bm => (
                <div key={bm.id} className={`p-3 rounded-xl flex items-center justify-between ${darkMode ? 'bg-[#1C1812]' : 'bg-white'} border border-[#2C261A]/30`}>
                  <button
                    onClick={() => { flipRef.current?.pageFlip()?.flip(bm.page_number - 1); setShowBookmarks(false); }}
                    className="text-sm font-bold text-[#D4AF37] hover:underline"
                  >
                    Page {bm.page_number}
                    {bm.note && <p className="text-xs text-gray-500 font-normal mt-1">{bm.note}</p>}
                  </button>
                  <button onClick={() => handleDeleteBookmark(bm.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {showNotes && (
          <div className={`w-80 shrink-0 border-l ${darkMode ? 'bg-[#14120E] border-[#2C261A]' : 'bg-[#F0ECE1] border-gray-300'} p-6 overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold uppercase tracking-wider flex items-center gap-2"><StickyNote className="w-4 h-4 text-[#D4AF37]" /> Notes</h3>
              <button onClick={() => setShowNotes(false)}><X className="w-5 h-5 opacity-50 hover:opacity-100" /></button>
            </div>

            <div className={`mb-6 p-4 rounded-xl ${darkMode ? 'bg-[#1C1812]' : 'bg-white'} border border-[#2C261A]/30`}>
              <p className="text-xs text-gray-500 mb-2">Ajouter une note (page {currentPage})</p>
              <textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                className="w-full bg-transparent border border-[#2C261A] rounded-lg p-2 text-sm resize-none focus:outline-none focus:border-[#D4AF37]"
                rows={3}
                placeholder="Écrivez votre note..."
              />
              <button onClick={handleAddNote} className="mt-2 w-full bg-[#D4AF37] text-black py-2 rounded-lg font-bold text-sm hover:bg-white transition-colors">
                Ajouter
              </button>
            </div>

            {notes.length === 0 && <p className="text-sm text-gray-500">Aucune note.</p>}
            <div className="space-y-3">
              {notes.map((n, i) => (
                <div key={n.id || i} className={`p-3 rounded-xl ${darkMode ? 'bg-[#1C1812]' : 'bg-white'} border border-[#2C261A]/30`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#D4AF37] font-bold">Page {n.page_number}</span>
                    <button onClick={() => handleDeleteNote(n.id)} className="text-red-400 hover:text-red-300"><X className="w-3 h-3" /></button>
                  </div>
                  <p className="text-sm">{n.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
