import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

// Floating glass panel with subtle cursor-driven 3D tilt, spring return,
// and an internal cursor highlight. tilt={false} keeps inputs usable.
export default function TiltCard({ children, className, tilt = true, intensity = 6, glow = true }) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [intensity, -intensity]), { stiffness: 150, damping: 15 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-intensity, intensity]), { stiffness: 150, damping: 15 });
  const hx = useTransform(mx, (v) => `${v * 100}%`);
  const hy = useTransform(my, (v) => `${v * 100}%`);
  const highlight = useMotionTemplate`radial-gradient(420px circle at ${hx} ${hy}, hsl(var(--pp-primary) / 0.10), transparent 60%)`;
  const lift = useSpring(0, { stiffness: 200, damping: 20 });

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
    if (tilt && !reduced) lift.set(-6);
  };
  const onLeave = () => { mx.set(0.5); my.set(0.5); lift.set(0); };

  const useTilt = tilt && !reduced;

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        rotateX: useTilt ? rotateX : 0,
        rotateY: useTilt ? rotateY : 0,
        y: useTilt ? lift : 0,
        transformPerspective: 900,
        transformStyle: 'preserve-3d',
      }}
      className={cn('relative rounded-2xl pp-glass', className)}
    >
      {children}
      {glow && !reduced && (
        <motion.div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background: highlight }} />
      )}
      <div className="absolute inset-0 rounded-2xl pointer-events-none pp-edge" />
    </motion.div>
  );
}