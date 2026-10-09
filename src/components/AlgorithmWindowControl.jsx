function formatDuration(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr${h > 1 ? 's' : ''}`;
  return `${h} hr${h > 1 ? 's' : ''} ${m} min`;
}

export default function AlgorithmWindowControl({ value, onChange }) {
  const clamped = Math.max(0.5, Math.min(12, value || 2));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium pp-text">Algorithm Window</label>
        <span className="ml-auto text-sm font-semibold pp-primary">{formatDuration(clamped)}</span>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <input
          type="range"
          min={0.5}
          max={12}
          step={0.5}
          value={clamped}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="pp-range flex-1 min-w-0"
        />
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="number"
            min={0.5}
            max={12}
            step={0.5}
            value={clamped}
            onChange={e => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v)) onChange(Math.max(0.5, Math.min(12, v)));
            }}
            className="w-20 px-3 py-2 rounded-lg border pp-input text-sm"
          />
          <span className="text-sm pp-text-muted shrink-0">hrs</span>
        </div>
      </div>
    </div>
  );
}