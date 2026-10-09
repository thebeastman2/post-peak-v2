import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Animates a number from its previous value to the target with ease-out.
/** @param {{ value?: any, duration?: number, className?: string }} props */
export default function CountUp({ value, duration = 900, className }) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const target = Number(value) || 0;
    if (reduced) { setDisplay(target); prevRef.current = target; return; }
    const start = prevRef.current || 0;
    let raf;
    let t0;
    const step = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + (target - start) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
      else prevRef.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduced]);

  return <span className={className}>{display}</span>;
}