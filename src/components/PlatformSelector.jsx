import { platformList } from '@/data/platforms';
import { Camera, Music, Ghost, Play, Users } from 'lucide-react';

const platformIcons = {
  instagram: Camera,
  tiktok: Music,
  snapchat: Ghost,
  youtube: Play,
  facebook: Users,
};

export default function PlatformSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full">
      {platformList.map((p, i) => {
        const active = value === p.id;
        const isLastOdd = i === platformList.length - 1 && platformList.length % 2 === 1;
        const Icon = platformIcons[p.id];
        return (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl border transition-all duration-150 ${
              isLastOdd ? 'col-span-2 sm:col-span-1' : ''
            } ${
              active
                ? 'pp-primary-bg text-white border-transparent pp-btn-glow'
                : 'pp-card pp-border pp-text pp-hover'
            }`}
          >
            <Icon className={`w-5 h-5 ${active ? 'text-white' : 'pp-text-muted'}`} aria-hidden="true" />
            <span className="text-xs font-medium">{p.name}</span>
          </button>
        );
      })}
    </div>
  );
}
