import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';

const FLIP_DURATION = 700;
const PAGE_STACK_MAX = 40;

function PaperTexture({ dark }) {
  if (dark) return null;
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <filter id="paperGrain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" result="noise" />
        <feColorMatrix type="saturate" values="0" in="noise" result="gray" />
        <feBlend in="SourceGraphic" in2="gray" mode="multiply" />
      </filter>
    </svg>
  );
}

function BookPage({ text, pageNum, totalPages, isLeft, fontSize, fontFamily, lineHeight, dark, isFlipping, flipSide }) {
  const showPage = pageNum > 0 && pageNum <= totalPages;

  return (
    <div className="book-page" style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Paper sheet */}
      <div style={{
        flex: 1,
        padding: '52px 44px 48px',
        position: 'relative',
        overflow: 'hidden',
        background: dark
          ? 'linear-gradient(180deg, #1E1C19 0%, #1A1816 40%, #171513 100%)'
          : `linear-gradient(${isLeft ? '105deg' : '75deg'},
              #FEFCF7 0%,
              #FAF6EE 15%,
              #F7F2E8 35%,
              #F5F0E4 55%,
              #F3EDE0 75%,
              #F0EADA 100%)`,
        color: dark ? 'rgba(225,220,210,0.9)' : '#2C2418',
        fontFamily,
        fontSize: `${fontSize}px`,
        lineHeight,
        userSelect: 'text',
        boxShadow: dark
          ? 'none'
          : `inset 0 0 30px rgba(160,140,100,0.06),
             inset 0 0 80px rgba(140,120,80,0.03)`,
      }}>
        {/* Paper grain overlay */}
        {!dark && (
          <div style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.35,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`,
            pointerEvents: 'none',
          }} />
        )}

        {/* Yellowed edge tint - top */}
        {!dark && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: 'linear-gradient(180deg, rgba(190,170,130,0.12), transparent)',
            pointerEvents: 'none',
          }} />
        )}

        {/* Yellowed edge tint - bottom */}
        {!dark && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background: 'linear-gradient(0deg, rgba(180,160,120,0.15), transparent)',
            pointerEvents: 'none',
          }} />
        )}

        {/* Outer edge yellowing - left page outer edge is left side */}
        {!dark && (
          <div style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            [isLeft ? 'left' : 'right']: 0,
            width: 4,
            background: isLeft
              ? 'linear-gradient(90deg, rgba(180,160,110,0.18), transparent)'
              : 'linear-gradient(270deg, rgba(180,160,110,0.18), transparent)',
            pointerEvents: 'none',
          }} />
        )}

        {/* Spine shadow - deep gutter */}
        <div style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          [isLeft ? 'right' : 'left']: 0,
          width: isLeft ? 45 : 45,
          background: isLeft
            ? 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.02) 30%, rgba(0,0,0,0.06) 60%, rgba(0,0,0,0.12) 85%, rgba(0,0,0,0.18) 100%)'
            : 'linear-gradient(270deg, transparent 0%, rgba(0,0,0,0.02) 30%, rgba(0,0,0,0.06) 60%, rgba(0,0,0,0.12) 85%, rgba(0,0,0,0.18) 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }} />

        {/* Subtle horizontal lines like real paper */}
        {!dark && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(180,160,120,0.015) 1px, rgba(180,160,120,0.015) 2px)',
            pointerEvents: 'none',
          }} />
        )}

        {/* Text content */}
        <div style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          position: 'relative',
          zIndex: 1,
        }}>
          {text || ''}
        </div>

        {/* Page number */}
        {showPage && (
          <div style={{
            position: 'absolute',
            bottom: 18,
            [isLeft ? 'left' : 'right']: 44,
            fontSize: `${Math.max(10, fontSize * 0.5)}px`,
            color: dark ? 'rgba(225,220,210,0.18)' : 'rgba(80,60,30,0.25)',
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontStyle: 'italic',
            pointerEvents: 'none',
            letterSpacing: '0.5px',
          }}>
            {pageNum}
          </div>
        )}
      </div>
    </div>
  );
}

function PageEdges({ count, side, isDark }) {
  const n = Math.min(count, PAGE_STACK_MAX);
  if (n <= 0) return null;

  const isLeft = side === 'left';
  const sign = isLeft ? -1 : 1;
  const edgeWidth = Math.min(n * 0.5, 18);

  return (
    <div style={{
      position: 'absolute',
      [isLeft ? 'left' : 'right']: isLeft ? -edgeWidth : -edgeWidth,
      top: 8,
      bottom: 8,
      width: edgeWidth,
      zIndex: 1,
      overflow: 'hidden',
    }}>
      {/* Stacked page edges */}
      {Array.from({ length: Math.min(n, PAGE_STACK_MAX) }, (_, i) => {
        const t = i / Math.max(1, n - 1);
        const edgeShade = isDark
          ? 20 + Math.floor(t * 8)
          : 215 + Math.floor(t * 15 - 7);
        const edgeColor = isDark
          ? `rgb(${edgeShade + 10},${edgeShade + 8},${edgeShade})`
          : `rgb(${edgeShade},${edgeShade - 5},${edgeShade - 15})`;
        return (
          <div key={i} style={{
            position: 'absolute',
            [isLeft ? 'right' : 'left']: 0,
            top: 0,
            bottom: 0,
            width: Math.max(1, edgeWidth / Math.min(n, PAGE_STACK_MAX)),
            left: isLeft ? `${(i / Math.min(n, PAGE_STACK_MAX)) * 100}%` : 'auto',
            right: !isLeft ? `${(i / Math.min(n, PAGE_STACK_MAX)) * 100}%` : 'auto',
            background: edgeColor,
            borderTop: isDark ? '0.5px solid rgba(255,255,255,0.03)' : '0.5px solid rgba(200,180,140,0.3)',
            borderBottom: isDark ? '0.5px solid rgba(0,0,0,0.2)' : '0.5px solid rgba(160,140,100,0.15)',
          }} />
        );
      })}

      {/* Top edge of stack - visible page thickness */}
      <div style={{
        position: 'absolute',
        top: 0,
        [isLeft ? 'right' : 'left']: 0,
        width: edgeWidth,
        height: 3,
        background: isDark
          ? 'linear-gradient(180deg, #302820, #282018)'
          : `linear-gradient(${isLeft ? '90deg' : '270deg'}, #E8DFC8, #EDE4D0)`,
        borderRadius: isLeft ? '2px 0 0 0' : '0 2px 0 0',
      }} />

      {/* Bottom edge of stack */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        [isLeft ? 'right' : 'left']: 0,
        width: edgeWidth,
        height: 3,
        background: isDark
          ? 'linear-gradient(0deg, #302820, #282018)'
          : `linear-gradient(${isLeft ? '90deg' : '270deg'}, #E2D8C0, #E8DFC8)`,
        borderRadius: isLeft ? '0 0 0 2px' : '0 0 2px 0',
      }} />
    </div>
  );
}

const Book3D = forwardRef(({
  pages = [],
  currentPage = 1,
  totalPages = 1,
  onTurnPage,
  onTurnBack,
  darkMode = false,
  fontSize = 16,
  fontFamily = 'Georgia, "Times New Roman", serif',
  lineHeight = 1.8,
  style,
  className,
}, ref) => {
  const [flipping, setFlipping] = useState(false);
  const [flipProgress, setFlipProgress] = useState(0);
  const [flipDirection, setFlipDirection] = useState('forward');
  const animRef = useRef(null);
  const startRef = useRef(0);

  const animateFlip = useCallback((dir, onComplete) => {
    setFlipping(true);
    setFlipDirection(dir);
    setFlipProgress(0);
    startRef.current = performance.now();

    function tick(now) {
      const elapsed = now - startRef.current;
      const raw = Math.min(1, elapsed / FLIP_DURATION);
      const eased = raw < 0.5
        ? 4 * raw * raw * raw
        : 1 - Math.pow(-2 * raw + 2, 3) / 2;
      setFlipProgress(eased);
      if (raw < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setFlipping(false);
        setFlipProgress(0);
        onComplete?.();
      }
    }
    animRef.current = requestAnimationFrame(tick);
  }, []);

  useImperativeHandle(ref, () => ({
    turnForward: () => {
      if (flipping || currentPage >= totalPages) return;
      animateFlip('forward', () => onTurnPage?.());
    },
    turnBackward: () => {
      if (flipping || currentPage <= 1) return;
      animateFlip('backward', () => onTurnBack?.());
    },
    turnPage: () => {
      if (flipping || currentPage >= totalPages) return;
      animateFlip('forward', () => onTurnPage?.());
    },
  }));

  useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  const leftIdx = currentPage - 2;
  const rightIdx = currentPage - 1;
  const leftText = leftIdx >= 0 && leftIdx < pages.length ? pages[leftIdx] : '';
  const rightText = rightIdx >= 0 && rightIdx < pages.length ? pages[rightIdx] : '';

  const readCount = Math.max(0, currentPage - 1);
  const unreadCount = Math.max(0, totalPages - currentPage);

  const coverThickness = 5;
  const spineWidth = Math.min(14, Math.max(4, Math.floor(totalPages / 60)));

  const isForwardFlip = flipping && flipDirection === 'forward';
  const isBackwardFlip = flipping && flipDirection === 'backward';

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: darkMode
        ? 'radial-gradient(ellipse at 50% 40%, #1A1614 0%, #0D0B09 70%)'
        : 'radial-gradient(ellipse at 50% 40%, #D4C8B4 0%, #B8AA94 50%, #A09080 100%)',
      ...style,
    }} className={className}>
      <PaperTexture dark={darkMode} />

      {/* Surface reflection / desk */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '35%',
        background: darkMode
          ? 'linear-gradient(0deg, rgba(13,11,9,0.8) 0%, transparent 100%)'
          : 'linear-gradient(0deg, rgba(140,120,90,0.15) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Book shadow on surface */}
      <div style={{
        position: 'absolute',
        bottom: '14%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '70%',
        height: 30,
        borderRadius: '50%',
        background: darkMode
          ? 'radial-gradient(ellipse, rgba(0,0,0,0.6) 0%, transparent 70%)'
          : 'radial-gradient(ellipse, rgba(80,60,30,0.25) 0%, transparent 70%)',
        filter: 'blur(12px)',
        pointerEvents: 'none',
      }} />

      {/* Main book wrapper - gives the 3D perspective */}
      <div style={{
        perspective: '1800px',
        perspectiveOrigin: '50% 45%',
        position: 'relative',
        maxWidth: '920px',
        width: '82%',
        height: '78vh',
      }}>
        {/* Book body - rotated slightly for 3D feel */}
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: 'rotateX(2deg)',
        }}>

          {/* === HARD COVER BACK === */}
          <div style={{
            position: 'absolute',
            inset: -coverThickness,
            background: darkMode
              ? 'linear-gradient(160deg, #3A2818 0%, #2A1C10 40%, #1E1408 100%)'
              : 'linear-gradient(160deg, #6B4423 0%, #5A3818 30%, #4A2E14 70%, #3E2510 100%)',
            borderRadius: '4px 4px 4px 4px',
            boxShadow: `
              0 2px 4px rgba(0,0,0,0.1),
              0 8px 16px rgba(0,0,0,0.15),
              0 20px 40px rgba(0,0,0,0.2),
              0 30px 60px rgba(0,0,0,0.25),
              inset 0 1px 0 rgba(255,255,255,0.06),
              inset 0 -1px 0 rgba(0,0,0,0.2)
            `,
            zIndex: 0,
          }}>
            {/* Cover texture grain */}
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              opacity: 0.4,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 128 128' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E")`,
            }} />

            {/* Cover border indent */}
            <div style={{
              position: 'absolute',
              inset: 8,
              border: darkMode
                ? '1px solid rgba(255,255,255,0.03)'
                : '1px solid rgba(255,220,160,0.08)',
              borderRadius: 2,
              pointerEvents: 'none',
            }} />
          </div>

          {/* === SPINE === */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: -coverThickness,
            bottom: -coverThickness,
            width: spineWidth,
            transform: 'translateX(-50%)',
            background: darkMode
              ? 'linear-gradient(90deg, #1A1008 0%, #2A1C10 20%, #322010 50%, #2A1C10 80%, #1A1008 100%)'
              : 'linear-gradient(90deg, #4A2E18 0%, #5A381C 20%, #633E20 50%, #5A381C 80%, #4A2E18 100%)',
            zIndex: 10,
            boxShadow: `
              inset 2px 0 3px rgba(0,0,0,0.2),
              inset -2px 0 3px rgba(0,0,0,0.2),
              0 0 6px rgba(0,0,0,0.3)
            `,
          }}>
            {/* Spine ridges */}
            {[0.2, 0.4, 0.6, 0.8].map((pos, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: `${pos * 100}%`,
                height: 1,
                background: darkMode
                  ? 'rgba(255,255,255,0.04)'
                  : 'rgba(255,220,160,0.08)',
              }} />
            ))}
          </div>

          {/* === LEFT PAGE STACK (read pages) === */}
          <PageEdges count={readCount} side="left" isDark={darkMode} />

          {/* === RIGHT PAGE STACK (unread pages) === */}
          <PageEdges count={unreadCount} side="right" isDark={darkMode} />

          {/* === LEFT PAGE === */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 'calc(50% - 2px)',
            overflow: 'hidden',
            borderRadius: '2px 0 0 2px',
            zIndex: 5,
            transformOrigin: 'right center',
            transform: isForwardFlip
              ? `perspective(1400px) rotateY(${flipProgress * -15}deg) scale(${1 - flipProgress * 0.03})`
              : isBackwardFlip
              ? `perspective(1400px) rotateY(${(1 - flipProgress) * -15}deg) scale(${0.97 + flipProgress * 0.03})`
              : 'none',
            transition: flipping ? 'none' : 'transform 0.3s ease',
          }}>
            <BookPage
              text={leftText}
              pageNum={leftIdx + 1}
              totalPages={totalPages}
              isLeft={true}
              fontSize={fontSize}
              fontFamily={fontFamily}
              lineHeight={lineHeight}
              dark={darkMode}
              isFlipping={isForwardFlip}
              flipSide="left"
            />
          </div>

          {/* === RIGHT PAGE === */}
          <div style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 'calc(50% - 2px)',
            overflow: 'hidden',
            borderRadius: '0 2px 2px 0',
            zIndex: 5,
            transformOrigin: 'left center',
            transform: isForwardFlip
              ? `perspective(1400px) rotateY(${(1 - flipProgress) * 15}deg) scale(${0.97 + flipProgress * 0.03})`
              : isBackwardFlip
              ? `perspective(1400px) rotateY(${flipProgress * 15}deg) scale(${1 - flipProgress * 0.03})`
              : 'none',
            transition: flipping ? 'none' : 'transform 0.3s ease',
          }}>
            <BookPage
              text={rightText}
              pageNum={rightIdx + 1}
              totalPages={totalPages}
              isLeft={false}
              fontSize={fontSize}
              fontFamily={fontFamily}
              lineHeight={lineHeight}
              dark={darkMode}
              isFlipping={isBackwardFlip}
              flipSide="right"
            />
          </div>

          {/* === CENTER GUTTER LINE === */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: 4,
            transform: 'translateX(-50%)',
            background: darkMode
              ? 'linear-gradient(90deg, rgba(0,0,0,0.3), rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0.3))'
              : 'linear-gradient(90deg, rgba(0,0,0,0.1), rgba(0,0,0,0.04) 30%, rgba(0,0,0,0.04) 70%, rgba(0,0,0,0.1))',
            zIndex: 8,
            pointerEvents: 'none',
          }} />
        </div>
      </div>
    </div>
  );
});

Book3D.displayName = 'Book3D';
export default Book3D;
