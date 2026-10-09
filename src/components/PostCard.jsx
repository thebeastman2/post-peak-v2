import TiltCard from '@/components/effects/TiltCard';
import CountUp from '@/components/effects/CountUp';

export default function PostCard({ index, time, label, reachScore }) {
  return (
    <TiltCard tilt intensity={5} className="p-3">
      <div className="relative z-10">
        <div className="text-xs pp-text-muted mb-1">Post {index}</div>
        <div className="text-xl font-semibold pp-text tracking-tight">{time}</div>
        <div className="text-xs pp-text-muted">{label}</div>
        <div className="text-xs font-medium pp-primary mt-1.5">Reach <CountUp value={reachScore} /></div>
      </div>
    </TiltCard>
  );
}