import React, { useEffect, useRef, useState } from 'react';

// Full-screen, responsive background animation with soft drifting blobs
// - Canvas 2D with offscreen buffers for performance
// - 3–5 organic shapes, slow drift/scale/rotate, 20–40s loop
// - DPR-aware, FPS-throttled, respects prefers-reduced-motion and save-data
// - Light/dark palettes, subtle noise + vignette overlay, parallax

const LIGHT_PALETTE = [
  '#BCA7FF', // lilac
  '#FFCBA7', // peach
  '#FF9DB2', // coral
  '#AEE8FF', // ice-blue
];
const DARK_PALETTE = [
  '#8D7BFF',
  '#FFB48F',
  '#FF7F98',
  '#7ED2F2',
];

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function useSaveData() {
  const [save, setSave] = useState(false);
  useEffect(() => {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const update = () => setSave(!!(conn && conn.saveData));
    update();
    conn && conn.addEventListener && conn.addEventListener('change', update);
    return () => conn && conn.removeEventListener && conn.removeEventListener('change', update);
  }, []);
  return save;
}

function Background({ className = '', enabled = true, theme = 'light' }) {
  const canvasRef = useRef(null);
  const layerRef = useRef(null);
  const [ok, setOk] = useState(true);

  const reduce = prefersReducedMotion();
  const saveData = useSaveData();
  const dark = theme === 'dark';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) { setOk(false); return; }

    let raf = 0;
    let running = true;
    let last = performance.now();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const desiredFPS = reduce || saveData ? 30 : 38; // throttle 30–45 fps
    const frameInterval = 1000 / desiredFPS;

    // Breakpoints for blob sizing/parallax
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const phone = vw <= 480;
    const tablet = vw > 480 && vw <= 1024;
    const count = phone ? 3 : tablet ? 4 : 5;
    const base = Math.min(vw, vh);
    const radiusBase = phone ? base * 0.55 : tablet ? base * 0.62 : base * 0.68;
    const depth = phone ? 6 : tablet ? 8 : 10; // parallax px capped 6–10

    // Setup canvas size
    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    // Keep vibrant palette in light; in dark we suppress blobs for full-black background
    const palette = LIGHT_PALETTE.slice(0);

    // Create offscreen blobs
    const blobs = Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const r = radiusBase * (0.85 + Math.random() * 0.35);
      const color = palette[i % palette.length];
      const off = document.createElement('canvas');
      const octx = off.getContext('2d');
      const size = Math.ceil(r * 2.2);
      off.width = size;
      off.height = size;
      // Paint an organic gradient blob into offscreen
      const cx = size / 2, cy = size / 2;
      const grad = octx.createRadialGradient(cx * 0.9, cy * 0.95, r * 0.15, cx, cy, r);
      grad.addColorStop(0, color + 'EE');
      grad.addColorStop(1, color + '00');
      octx.clearRect(0, 0, size, size);
      octx.globalCompositeOperation = 'lighter';
      octx.filter = 'blur(18px)';
      octx.fillStyle = grad;
      octx.beginPath();
      // Organic shape via squircle-like path
      const k = 0.55;
      octx.moveTo(cx + r, cy);
      octx.bezierCurveTo(cx + r, cy + r * k, cx + r * k, cy + r, cx, cy + r);
      octx.bezierCurveTo(cx - r * k, cy + r, cx - r, cy + r * k, cx - r, cy);
      octx.bezierCurveTo(cx - r, cy - r * k, cx - r * k, cy - r, cx, cy - r);
      octx.bezierCurveTo(cx + r * k, cy - r, cx + r, cy - r * k, cx + r, cy);
      octx.closePath();
      octx.fill();
      octx.filter = 'none';
      return {
        off, size, r,
        baseX: vw / 2 + Math.cos(angle) * (vw * 0.18 + Math.random() * vw * 0.12),
        baseY: vh / 2 + Math.sin(angle) * (vh * 0.18 + Math.random() * vh * 0.12),
        phase: Math.random() * Math.PI * 2,
        // Continuous, alive motion; 22–35s loop (speed ~ 0.18–0.28 rad/s)
        speed: (reduce ? 0.12 : 0.18) + Math.random() * (reduce ? 0.06 : 0.10),
        rot: (Math.random() * 8 - 4) * (Math.PI / 180), // few degrees
        rotDir: Math.random() > 0.5 ? 1 : -1,
        scaleAmp: (reduce ? 0.006 : 0.012) + Math.random() * (reduce ? 0.006 : 0.01), // 0.6–2%
        depth: (i / count) * depth,
      };
    });

    // Noise pattern (static)
    const noiseTile = document.createElement('canvas');
    const nctx = noiseTile.getContext('2d');
    noiseTile.width = noiseTile.height = 64;
    const imgData = nctx.createImageData(64, 64);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const v = 230 + Math.random() * 25; // low contrast noise
      imgData.data[i] = v;
      imgData.data[i + 1] = v;
      imgData.data[i + 2] = v;
      imgData.data[i + 3] = 10; // very subtle alpha
    }
    nctx.putImageData(imgData, 0, 0);
    const noisePattern = ctx.createPattern(noiseTile, 'repeat');

    let mx = vw / 2, my = vh / 2;
    const onMove = (e) => {
      if (e.touches && e.touches[0]) {
        mx = e.touches[0].clientX; my = e.touches[0].clientY; return;
      }
      mx = e.clientX; my = e.clientY;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('resize', resize);

    // Track panel/sidebar bounds for auto-dim under UI
    let dims = [];
    function computeDims() {
      dims = [];
      const nodes = document.querySelectorAll('.panel, .sidebar');
      nodes.forEach((el) => {
        const r = el.getBoundingClientRect();
        dims.push({ x: r.left, y: r.top, w: r.width, h: r.height, radius: 16 });
      });
    }
    computeDims();
    const dimsObserver = new ResizeObserver(() => computeDims());
    document.querySelectorAll('.panel, .sidebar').forEach((el) => dimsObserver.observe(el));
    window.addEventListener('orientationchange', computeDims);

    // Draw frame
    function draw(now) {
      if (!running) return;
      // When disabled, render a single static frame (no drift/parallax) and stop
      if (!enabled) {
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;
        ctx.clearRect(0, 0, w, h);
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#f6fbff');
        bgGrad.addColorStop(1, '#fff7f2');
        ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);
        // Subtle static blobs
        ctx.globalCompositeOperation = 'lighter';
        blobs.forEach((b) => {
          ctx.save();
          ctx.translate(b.baseX, b.baseY);
          ctx.globalAlpha = 0.22;
          ctx.drawImage(b.off, -b.size / 2, -b.size / 2);
          ctx.restore();
        });
        ctx.globalCompositeOperation = 'source-over';
        return; // no loop
      }
      const dt = now - last;
      if (dt < frameInterval) { raf = requestAnimationFrame(draw); return; }
      last = now;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      // Background: light uses soft gradient; dark uses full black
      if (dark) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);
      } else {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#f6fbff');
        bgGrad.addColorStop(1, '#fff7f2');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);
      }

      const t = now / 1000;
      if (!dark) {
        ctx.globalCompositeOperation = 'lighter';
        blobs.forEach((b) => {
          const driftX = Math.cos(t * b.speed + b.phase) * (w * 0.02);
          const driftY = Math.sin(t * b.speed * 0.8 + b.phase) * (h * 0.02);
          const parX = ((mx - w / 2) / w) * b.depth;
          const parY = ((my - h / 2) / h) * b.depth;
          const scale = 1 + (reduce ? 0 : Math.sin(t * (0.4 + b.speed * 0.2) + b.phase) * b.scaleAmp);
          const rot = b.rot + (reduce ? 0 : Math.sin(t * 0.1 + b.phase) * 0.02 * b.rotDir);
          const x = b.baseX + driftX + parX;
          const y = b.baseY + driftY + parY;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(rot);
          ctx.scale(scale, scale);
          ctx.globalAlpha = 0.24;
          ctx.drawImage(b.off, -b.size / 2, -b.size / 2);
          ctx.restore();
        });
      }

      // Vignette only in light; dark remains full black
      if (!dark) {
        const vg = ctx.createRadialGradient(w / 2, h * 0.45, Math.min(w, h) * 0.2, w / 2, h / 2, Math.max(w, h) * 0.75);
        vg.addColorStop(0, 'rgba(0,0,0,0.0)');
        vg.addColorStop(1, 'rgba(0,0,0,0.22)');
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, w, h);
      }

      // Auto-dim behind main UI surfaces
      if (dims.length) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = 'rgba(0,0,0,0.08)';
        dims.forEach(({ x, y, w: ww, h: hh, radius }) => {
          const r = Math.min(radius, ww / 2, hh / 2);
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.arcTo(x + ww, y, x + ww, y + hh, r);
          ctx.arcTo(x + ww, y + hh, x, y + hh, r);
          ctx.arcTo(x, y + hh, x, y, r);
          ctx.arcTo(x, y, x + ww, y, r);
          ctx.closePath();
          ctx.fill();
        });
        ctx.restore();
      }

      // Noise overlay
      if (!dark && noisePattern) {
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = 0.08;
        ctx.fillStyle = noisePattern;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }

    // Visibility handling: pause when hidden to save resources
    function onVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        last = performance.now();
        raf = requestAnimationFrame(draw);
      }
    }
    document.addEventListener('visibilitychange', onVisibility);

    raf = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('resize', resize);
      window.removeEventListener('orientationchange', computeDims);
      document.removeEventListener('visibilitychange', onVisibility);
      dimsObserver.disconnect();
    };
  }, [ok, enabled, theme]);

  // Fallback background if canvas unsupported
  if (!ok) {
    return (
      <div className={`bg-layer ${className}`} aria-hidden="true" />
    );
  }

  return (
    <div className={`bg-layer ${className}`} aria-hidden="true" ref={layerRef}>
      <canvas ref={canvasRef} className="bg-canvas" />
    </div>
  );
}

export default Background;
