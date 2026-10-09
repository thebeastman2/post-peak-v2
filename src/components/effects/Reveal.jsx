import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Fade + slide in when scrolled into view. Renders plain when reduced motion.
/** @param {{ children?: any, className?: string, delay?: number, y?: number }} props */
export default function Reveal({ children, className, delay = 0, y = 14 }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}