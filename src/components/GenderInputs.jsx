export default function GenderInputs({ value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium pp-text-muted uppercase tracking-wider">Gender Distribution</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="flex items-center gap-2.5 p-3 rounded-xl border pp-border pp-card">
          <span className="text-sm pp-text shrink-0">Men</span>
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={value.men}
            onChange={e => onChange({ ...value, men: e.target.value })}
            placeholder="0"
            className="w-16 px-2 py-1.5 rounded-lg border pp-input text-sm text-center ml-auto shrink-0"
          />
        </div>
        <div className="flex items-center gap-2.5 p-3 rounded-xl border pp-border pp-card">
          <span className="text-sm pp-text shrink-0">Women</span>
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={value.women}
            onChange={e => onChange({ ...value, women: e.target.value })}
            placeholder="0"
            className="w-16 px-2 py-1.5 rounded-lg border pp-input text-sm text-center ml-auto shrink-0"
          />
        </div>
      </div>
    </div>
  );
}