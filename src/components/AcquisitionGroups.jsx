import { Plus, Trash2, Scale } from 'lucide-react';
import { countriesSorted } from '@/data/countries';

function makeBlankGroup(id) {
  return {
    id,
    location: { country: '', offset: null },
    ageGroupId: '',
    gender: 'mixed',
    weight: '',
  };
}

function GroupCard({ index, group, ageGroups, onChange, onRemove, canRemove }) {
  const handleCountryChange = (name) => {
    const country = countriesSorted.find(c => c.name === name);
    onChange({ ...group, location: { country: name, offset: country?.offset ?? null } });
  };

  const selectedCountry = countriesSorted.find(c => c.name === group.location.country);

  return (
    <div className="p-4 rounded-xl border pp-border pp-card space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium pp-text-muted">Group {index + 1}</span>
        {canRemove && (
          <button
            onClick={onRemove}
            className="ml-auto p-1.5 rounded-lg border pp-border pp-hover transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 pp-text-muted" />
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium pp-text-muted">Location</label>
          {selectedCountry?.offset != null && (
            <span className="text-xs pp-text-muted">
              UTC{selectedCountry.offset >= 0 ? '+' : ''}{selectedCountry.offset}
            </span>
          )}
        </div>
        <select
          value={group.location.country}
          onChange={e => handleCountryChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border pp-input text-sm"
        >
          {countriesSorted.map(c => (
            <option key={c.name || 'blank'} value={c.name}>{c.name || '— Select country —'}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium pp-text-muted">Age Group</label>
          <select
            value={group.ageGroupId}
            onChange={e => onChange({ ...group, ageGroupId: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border pp-input text-sm"
          >
            <option value="">— Select —</option>
            {ageGroups.map(ag => (
              <option key={ag.id} value={ag.id}>{ag.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium pp-text-muted">Gender</label>
          <select
            value={group.gender}
            onChange={e => onChange({ ...group, gender: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border pp-input text-sm"
          >
            <option value="mixed">Mixed</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Scale className="w-3.5 h-3.5 pp-text-muted shrink-0" />
        <label className="text-xs font-medium pp-text-muted shrink-0">Importance</label>
        <input
          type="number"
          min={0}
          max={100}
          step={1}
          value={group.weight}
          onChange={e => onChange({ ...group, weight: e.target.value })}
          placeholder="0"
          className="w-20 px-3 py-1.5 rounded-lg border pp-input text-sm text-center ml-auto shrink-0"
        />
        <span className="text-xs pp-text-muted shrink-0">%</span>
      </div>
    </div>
  );
}

export default function AcquisitionGroups({ value, onChange, ageGroups }) {
  const groups = value;

  const updateGroup = (i, newVal) => {
    const next = [...groups];
    next[i] = newVal;
    onChange(next);
  };

  const addGroup = () => {
    if (groups.length < 5) {
      onChange([...groups, makeBlankGroup(groups.length)]);
    }
  };

  const removeGroup = (i) => {
    if (groups.length > 1) {
      const next = groups.filter((_, idx) => idx !== i);
      onChange(next);
    }
  };

  const totalWeight = groups.reduce((s, g) => s + (parseFloat(g.weight) || 0), 0);
  const needsNormalize = totalWeight > 0 && Math.round(totalWeight) !== 100;

  const normalize = () => {
    if (totalWeight === 0) return;
    onChange(groups.map(g => {
      const w = parseFloat(g.weight) || 0;
      return { ...g, weight: Math.round((w / totalWeight) * 100) };
    }));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium pp-text-muted uppercase tracking-wider">Groups</span>
        <span className="text-xs pp-text-muted">{groups.length} / 5</span>
      </div>

      {groups.map((g, i) => (
        <GroupCard
          key={g.id}
          index={i}
          group={g}
          ageGroups={ageGroups}
          onChange={v => updateGroup(i, v)}
          onRemove={() => removeGroup(i)}
          canRemove={groups.length > 1}
        />
      ))}

      {groups.length < 5 && (
        <button
          onClick={addGroup}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-dashed pp-border pp-text-muted pp-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Add Group</span>
        </button>
      )}

      <div className="flex items-center gap-2 pt-1">
        <span className="text-sm pp-text-muted">Total</span>
        <span className={`text-sm font-semibold ${needsNormalize ? 'pp-accent' : 'pp-primary'}`}>
          {Math.round(totalWeight)}%
        </span>
        <button
          onClick={normalize}
          disabled={totalWeight === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg pp-primary-bg text-white text-xs font-medium ml-auto disabled:opacity-40 transition-opacity"
        >
          <Scale className="w-3.5 h-3.5" />
          Normalize
        </button>
      </div>
    </div>
  );
}

export { makeBlankGroup };