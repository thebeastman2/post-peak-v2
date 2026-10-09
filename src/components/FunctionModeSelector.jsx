import { TrendingUp, Target } from 'lucide-react';

export default function FunctionModeSelector({ value, onChange }) {
  const modes = [
    {
      id: 'maximization',
      label: 'Viewer Maximization',
      description: 'Maximize reach for your existing audience',
      icon: TrendingUp,
    },
    {
      id: 'acquisition',
      label: 'Audience Acquisition',
      description: 'Target up to 5 new demographic groups',
      icon: Target,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {modes.map(m => {
        const active = value === m.id;
        const Icon = m.icon;
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-150 text-left ${
              active
                ? 'pp-primary-bg text-white border-transparent'
                : 'pp-card pp-border pp-hover'
            }`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${active ? 'text-white' : 'pp-text-muted'}`} />
            <div className="min-w-0">
              <div className="text-sm font-medium leading-tight">{m.label}</div>
              <div className={`text-xs leading-snug mt-1 ${active ? 'text-white/70' : 'pp-text-muted'}`}>
                {m.description}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}