import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';
import ParticleField from './ParticleField';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Fixed full-screen cinematic backdrop: perspective grid, ambient glow,
// cursor-following light, and the particle field.
export default function AmbientBackground({ colorKey }) {
  const reduced = useReducedMotion();
  const pointerRef = useRef({ x: 0.5, y: 0.5 });
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const lx = useTransform(sx, (v) => `${v * 100}%`);
  const ly = useTransform(sy, (v) => `${v * 100}%`);
  const light = useMotionTemplate`radial-gradient(620px circle at ${lx} ${ly}, hsl(var(--pp-primary) / 0.10), transparent 55%)`;

  useEffect(() => {
    if (reduced) return;
    let raf = null;
    const onMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      pointerRef.current.x = x;
      pointerRef.current.y = y;
      if (!raf) raf = requestAnimationFrame(() => { mx.set(x); my.set(y); raf = null; });
    };
    window.addEventListener('mousemove', onMove);
    return () => { window.removeEventListener('mousemove', onMove); if (raf) cancelAnimationFrame(raf); };
  }, [reduced, mx, my]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pp-bg" aria-hidden="true">
      <div className="absolute inset-0 pp-grid opacity-[0.07]" />
      <div className="absolute -top-1/4 -left-1/4 w-[60vw] h-[60vw] rounded-full blur-3xl pp-blob-a"
        style={{ background: 'radial-gradient(circle, hsl(var(--pp-primary) / 0.10), transparent 65%)' }} />
      <div className="absolute -bottom-1/4 -right-1/4 w-[55vw] h-[55vw] rounded-full blur-3xl pp-blob-b"
        style={{ background: 'radial-gradient(circle, hsl(var(--pp-accent) / 0.08), transparent 65%)' }} />
      <ParticleField colorKey={colorKey} pointerRef={pointerRef} reduced={reduced} />
      {!reduced && <motion.div className="absolute inset-0" style={{ background: light }} />}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 90% at 50% 0%, transparent 55%, hsl(var(--pp-bg) / 0.55) 100%)' }} />
    </div>
  );
}