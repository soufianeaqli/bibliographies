import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HTMLFlipBook from 'react-pageflip';
import { ChevronLeft, Maximize, ZoomIn, ZoomOut, Moon, Sun, Bookmark } from 'lucide-react';

const Page = React.forwardRef((props, ref) => {
  return (
    <div className={`page ${props.darkMode ? 'bg-[#1C1A17] text-gray-300' : 'bg-[#F9F6F0] text-gray-800'} shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col p-8 md:p-12 h-full`} ref={ref} data-density="soft">
      <div className="page-content flex-1">
        <h2 className="page-header text-xs uppercase tracking-widest text-center mb-8 opacity-50 border-b border-current pb-2">
          {props.title}
        </h2>
        <div 
           className="page-text leading-relaxed text-justify"
           style={{ fontSize: `${props.fontSize}px` }}
        >
          {props.children}
        </div>
      </div>
      <div className="page-footer text-center text-xs opacity-50 mt-4">
        {props.number}
      </div>
    </div>
  );
});

export default function BookReaderPage() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mock content for pages
  const content = [
    "Dans une contrée lointaine, au-delà des montagnes embrumées...",
    "Les premiers rayons de soleil perçaient difficilement les nuages épais, donnant à la forêt une teinte dorée et inquiétante à la fois.",
    "Lycidas marchait depuis des heures. Ses bottes lourdes résonnaient sur la pierre ancienne du chemin oublié.",
    "Soudain, une lueur bleutée attira son attention dans un buisson d'épines.",
    "Il s'approcha lentement, la main posée sur le pommeau de son épée.",
    "C'était là, le joyau perdu dont parlait la légende. Brillant d'un éclat irréel."
  ];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${darkMode ? 'bg-[#0A0908] text-white' : 'bg-[#E5DFD3] text-black'} relative`}>
      
      {/* Top Bar Options */}
      <div className={`header flex justify-between items-center p-4 ${darkMode ? 'bg-[#14120E]' : 'bg-[#F0ECE1]'} shadow-md z-10`}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/bibliotheque')} className="p-2 hover:bg-black/10 rounded-full transition-colors flex items-center gap-2">
            <ChevronLeft className="w-5 h-5"/> <span className="font-medium hidden sm:inline">Retour</span>
          </button>
          <div className="h-6 w-px bg-current opacity-20"></div>
          <h1 className="font-bold text-lg hidden md:block">Les Chroniques Oubliées</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => setFontSize(f => Math.max(12, f - 1))} className="p-2 hover:bg-black/10 rounded-full" title="Réduire police"><ZoomOut className="w-5 h-5"/></button>
          <button onClick={() => setFontSize(f => Math.min(24, f + 1))} className="p-2 hover:bg-black/10 rounded-full" title="Agrandir police"><ZoomIn className="w-5 h-5"/></button>
          <div className="h-6 w-px bg-current opacity-20 mx-1"></div>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-black/10 rounded-full" title="Thème">
            {darkMode ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
          </button>
          <button className="p-2 hover:bg-black/10 rounded-full mx-1" title="Marque page"><Bookmark className="w-5 h-5"/></button>
          <button onClick={toggleFullscreen} className="p-2 hover:bg-black/10 rounded-full" title="Plein Écran"><Maximize className="w-5 h-5"/></button>
        </div>
      </div>

      {/* Reader Container */}
      <div className="flex-1 flex justify-center items-center p-4 overflow-hidden perspective-[1500px]">
        {/* Book shadow effect behind the flipbook */}
        <div className="relative shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
          <HTMLFlipBook 
             width={350} 
             height={500} 
             size="fixed"
             minWidth={315}
             maxWidth={1000}
             minHeight={400}
             maxHeight={1533}
             maxShadowOpacity={0.5}
             showCover={true}
             mobileScrollSupport={true}
             className="book-wrapper"
          >
            {/* Front Cover */}
            <div className="page page-cover bg-[#2C261A] text-[#D4AF37] flex flex-col justify-center items-center shadow-lg border-2 border-amber-900/50 relative" data-density="hard">
               <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent"></div>
               <h1 className="text-4xl font-serif text-center relative z-10 px-4">Les Chroniques<br/>Oubliées</h1>
               <p className="mt-8 uppercase tracking-widest text-xs relative z-10">Aelys Vance</p>
            </div>
            
            {/* Pages */}
            {content.map((text, idx) => (
              <Page key={idx} number={idx + 1} title="L'Aube Grise" fontSize={fontSize} darkMode={darkMode}>
                {text}
              </Page>
            ))}
            
            {/* Back Cover */}
            <div className="page page-cover bg-[#2C261A] border-2 border-amber-900/50 shadow-lg" data-density="hard">
               <div className="w-full h-full bg-gradient-to-bl from-black/60 to-transparent flex items-center justify-center text-amber-900">
                  Fin du livre
               </div>
            </div>
          </HTMLFlipBook>
        </div>
      </div>
      
    </div>
  );
}
