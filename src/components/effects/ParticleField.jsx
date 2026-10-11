import { useEffect, useRef } from 'react';

function parseHsl(str) {
  const m = (str || '').trim().match(/^(\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%$/);
  if (!m) return { h: 0, s: 0, l: 50 };
  return { h: +m[1], s: +m[2], l: +m[3] };
}

function readVar(name, scope) {
  return parseHsl(window.getComputedStyle(scope || document.documentElement).getPropertyValue(name));
}

// Flow-field driven ambient particles — drifts like floating data points,
// reacts subtly to the pointer, draws faint connection lines.
export default function ParticleField({ colorKey, pointerRef, reduced }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf;

    // Resolve the palette from the nearest themed ancestor so a scoped theme
    // (e.g. the landing page's own --pp-* block) colors the particles too.
    // On the calculator the canvas sits directly under :root, so this reads
    // exactly the same values it always has.
    //
    // The palette is mutable and re-resolved whenever the theme changes, rather
    // than captured once. useColorScheme writes --pp-* from an effect on an
    // ancestor component, and React flushes effects child-first, so this effect
    // runs *before* that write lands: a one-shot read here always resolved the
    // previously selected scheme, which left the particles a theme behind.
    // colA/colB go through this object on every call, so refreshing it recolors
    // the next frame without touching the particles or the running loop.
    const scope = canvas.parentElement || document.documentElement;
    const palette = {
      primary: readVar('--pp-primary', scope),
      accent: readVar('--pp-accent', scope),
    };
    const refreshPalette = () => {
      palette.primary = readVar('--pp-primary', scope);
      palette.accent = readVar('--pp-accent', scope);
    };
    const colA = (a) => `hsla(${palette.primary.h}, ${palette.primary.s}%, ${palette.primary.l}%, ${a})`;
    const colB = (a) => `hsla(${palette.accent.h}, ${palette.accent.s}%, ${palette.accent.l}%, ${a})`;

    // Observe the themed elements instead of polling them: the theme hook
    // mutates inline style on <html>, and the landing page scopes its palette
    // to a .lp ancestor. Either way the mutation callback is a microtask, so it
    // lands before the next paint and both a scheme change and a light/dark
    // toggle recolor the very next frame.
    const observer = new MutationObserver(refreshPalette);
    for (const el of [document.documentElement, scope]) {
      if (el) observer.observe(el, { attributes: true, attributeFilter: ['style', 'class'] });
    }
    // Safety net for the mount commit, in case the ancestor's effect is flushed
    // after this frame is scheduled.
    let syncRaf = requestAnimationFrame(() => { refreshPalette(); syncRaf = null; });

    const COUNT = window.innerWidth < 640 ? 60 : 110;
    const particles = [];
    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random(),
        ph: Math.random() * Math.PI * 2,
        sp: 0.25 + Math.random() * 0.6,
      });
    }

    const LINK_DIST = 132;
    let t = 0;
    const flow = (x, y, tt) => {
      const a =
        Math.sin(x * 0.0016 + tt * 0.00025) +
        Math.cos(y * 0.0014 - tt * 0.0002) +
        Math.sin((x + y) * 0.0009 + tt * 0.00015);
      return a * Math.PI;
    };

    const draw = () => {
      t += 16;
      ctx.clearRect(0, 0, w, h);
      const px = pointerRef.current.x;
      const py = pointerRef.current.y;
      const scrollOff = window.scrollY * 0.012;
      const pts = particles.map((p) => {
        const ang = flow(p.x, p.y, t);
        p.x += Math.cos(ang) * 0.28 * p.sp;
        p.y += Math.sin(ang) * 0.28 * p.sp;
        if (p.x < -20) p.x = w + 20; else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20; else if (p.y > h + 20) p.y = -20;
        const shift = 0.3 + p.z * 0.7;
        const sx = p.x + (px - 0.5) * 42 * shift;
        const sy = p.y + (py - 0.5) * 42 * shift + scrollOff * (1 - p.z) * 7;
        const op = (0.12 + p.z * 0.5) * (0.6 + 0.4 * Math.sin(t * 0.001 + p.ph));
        return { x: sx, y: sy, z: p.z, op, i: p.ph };
      });

      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            const d = Math.sqrt(d2);
            const a = (1 - d / LINK_DIST) * 0.16 * Math.min(pts[i].op, pts[j].op);
            if (a <= 0.01) continue;
            ctx.strokeStyle = colA(a);
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const r = 1 + p.z * 2.4;
        const useAccent = i % 7 === 0;
        ctx.fillStyle = useAccent ? colB(p.op) : colA(p.op);
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
        if (p.z > 0.6) {
          ctx.fillStyle = useAccent ? colB(p.op * 0.12) : colA(p.op * 0.12);
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      if (syncRaf) cancelAnimationFrame(syncRaf);
      observer.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [colorKey, reduced, pointerRef]);

  if (reduced) return null;
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }} />;
}