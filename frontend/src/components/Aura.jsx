import React, { useEffect, useMemo, useState } from 'react';

// Glowing circular energy aura with flowing neon lines
// - Blue, purple, orange gradients
// - Smooth, breathing motion via SVG filters and dash animations
// - Center stays hollow; soft outer glow
// - Respects reduced-motion preference

function Aura({ size = 88, className = '', animated = true, variant = 'default' }) {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setPrefersReduced(!!mq.matches);
    handler();
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  const id = useMemo(() => Math.random().toString(36).slice(2), []);
  const view = 200; // viewBox for consistent geometry
  const r = 70; // base radius for the ring
  const animate = animated && !prefersReduced;

  // Variant tuning: calm < default < vivid
  const settings = useMemo(() => {
    switch (variant) {
      case 'calm':
        return {
          glowOpacity: 0.7,
          innerOpacity: [0.55, 0.44, 0.38],
          dispScale: { base: 6, anim: '5;9;5' },
          spinOuter: 80,
          spinInner: 56,
        };
      case 'vivid':
        return {
          glowOpacity: 1,
          innerOpacity: [0.9, 0.75, 0.62],
          dispScale: { base: 10, anim: '8;14;8' },
          spinOuter: 50,
          spinInner: 34,
        };
      default:
        return {
          glowOpacity: 0.85,
          innerOpacity: [0.75, 0.6, 0.5],
          dispScale: { base: 8, anim: '6;12;6' },
          spinOuter: 60,
          spinInner: 40,
        };
    }
  }, [variant]);

  return (
    <div className={`aura ${variant === 'calm' ? 'variant-calm' : variant === 'vivid' ? 'variant-vivid' : ''} ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      <svg width={size} height={size} viewBox={`0 0 ${view} ${view}`} role="img" aria-label="Glowing aura">
        <defs>
          {/* Color gradient across the ring */}
          <linearGradient id={`lg-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#66E1FF" />
            <stop offset="40%" stopColor="#A78BFA" />
            <stop offset="80%" stopColor="#FFA66E" />
            <stop offset="100%" stopColor="#66E1FF" />
          </linearGradient>

          {/* Plasma-like displacement */}
          <filter id={`plasma-${id}`} x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="8" result="noise">
              {animate && (
                <animate attributeName="baseFrequency" dur="10s" values="0.012 0.018;0.018 0.026;0.012 0.018" repeatCount="indefinite" />
              )}
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={settings.dispScale.base} xChannelSelector="R" yChannelSelector="G" result="distorted">
              {animate && (
                <animate attributeName="scale" dur="12s" values={settings.dispScale.anim} repeatCount="indefinite" />
              )}
            </feDisplacementMap>
            <feGaussianBlur in="distorted" stdDeviation="0.2" result="soft" />
            <feMerge>
              <feMergeNode in="soft" />
            </feMerge>
          </filter>

          {/* Outer glow */}
          <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feColorMatrix type="matrix" values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 1 0" />
          </filter>

          {/* Mask to keep center hollow */}
          <mask id={`hole-${id}`}>
            <rect x="0" y="0" width={view} height={view} fill="white" />
            <circle cx={view / 2} cy={view / 2} r={r - 18} fill="black" />
          </mask>
        </defs>

        {/* Slow overall rotation for gentle swirl */}
        <g mask={`url(#hole-${id})`} style={{ transformOrigin: '50% 50%' }}>
          <g filter={`url(#glow-${id})`} opacity={settings.glowOpacity} style={{ transformOrigin: '50% 50%' }}>
            <g style={{ transformOrigin: '50% 50%', animation: animate ? `auraSpin ${settings.spinOuter}s linear infinite` : 'none' }}>
              {/* Glow duplicates (thicker, blurred) */}
              <circle cx={view / 2} cy={view / 2} r={r} fill="none" stroke={`url(#lg-${id})`} strokeOpacity={settings.innerOpacity[0]} strokeWidth="16" strokeLinecap="round" strokeDasharray="140 60" />
              <circle cx={view / 2} cy={view / 2} r={r - 6} fill="none" stroke={`url(#lg-${id})`} strokeOpacity={settings.innerOpacity[1]} strokeWidth="12" strokeLinecap="round" strokeDasharray="80 40" />
              <circle cx={view / 2} cy={view / 2} r={r + 6} fill="none" stroke={`url(#lg-${id})`} strokeOpacity={settings.innerOpacity[2]} strokeWidth="10" strokeLinecap="round" strokeDasharray="60 30" />
            </g>
          </g>

          {/* Fine lines with displacement for living energy */}
          <g filter={`url(#plasma-${id})`} style={{ transformOrigin: '50% 50%', animation: animate ? `auraSpin ${settings.spinInner}s linear infinite reverse` : 'none' }}>
            <circle className="dash dash1" cx={view / 2} cy={view / 2} r={r} fill="none" stroke={`url(#lg-${id})`} strokeWidth="3.2" strokeLinecap="round" strokeDasharray="22 10" />
            <circle className="dash dash2" cx={view / 2} cy={view / 2} r={r - 6} fill="none" stroke={`url(#lg-${id})`} strokeWidth="2.6" strokeLinecap="round" strokeDasharray="16 8" />
            <circle className="dash dash3" cx={view / 2} cy={view / 2} r={r + 6} fill="none" stroke={`url(#lg-${id})`} strokeWidth="2.2" strokeLinecap="round" strokeDasharray="12 7" />
          </g>
        </g>

        {/* CSS-driven dash motion using pathLength trick via stroke-dashoffset (applied via global CSS) */}
        <style>{`
          @keyframes auraSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes dashMove1 { 0% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -64; } }
          @keyframes dashMove2 { 0% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: 54; } }
          @keyframes dashMove3 { 0% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -48; } }
          .dash1 { ${animate ? 'animation: dashMove1 6s ease-in-out infinite alternate;' : ''} }
          .dash2 { ${animate ? 'animation: dashMove2 7.5s ease-in-out infinite alternate;' : ''} }
          .dash3 { ${animate ? 'animation: dashMove3 9s ease-in-out infinite alternate;' : ''} }
        `}</style>
      </svg>
    </div>
  );
}

export default Aura;
