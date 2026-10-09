export default function AgeGroupInputs({ ageGroups, value, onChange }) {
  const updateRow = (i, newVal) => {
    const next = [...value];
    next[i] = { ...next[i], percentage: newVal };
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium pp-text-muted uppercase tracking-wider">Age Distribution</label>
        <span className="text-xs pp-text-muted">From platform insights</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {ageGroups.map((ag, i) => (
          <div key={ag.id} className="flex items-center gap-2 p-2.5 rounded-xl border pp-border pp-card">
            <span className="text-sm pp-text shrink-0 min-w-0 flex-1">{ag.label}</span>
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={value[i]?.percentage || ''}
              onChange={e => updateRow(i, e.target.value)}
              placeholder="0"
              className="w-16 px-2 py-1.5 rounded-lg border pp-input text-sm text-center shrink-0"
            />
          </div>
        ))}
      </div>
    </div>
  );
}