import { countriesSorted } from '@/data/countries';

function LocationRow({ index, location, onChange }) {
  const selectedCountry = countriesSorted.find(c => c.name === location.country);

  const handleCountryChange = (name) => {
    const country = countriesSorted.find(c => c.name === name);
    onChange({ ...location, country: name, offset: country?.offset ?? null });
  };

  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl border pp-border pp-card">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium pp-text-muted shrink-0 w-4">{index + 1}</span>
        <select
          value={location.country}
          onChange={e => handleCountryChange(e.target.value)}
          className="flex-1 min-w-0 px-3 py-2 rounded-lg border pp-input text-sm"
        >
          {countriesSorted.map(c => (
            <option key={c.name || 'blank'} value={c.name}>{c.name || '— Select country —'}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2 pl-6">
        <input
          type="number"
          min={0}
          max={100}
          step={1}
          value={location.percentage}
          onChange={e => onChange({ ...location, percentage: e.target.value })}
          placeholder="0"
          className="w-20 px-3 py-2 rounded-lg border pp-input text-sm text-center shrink-0"
        />
        <span className="text-sm pp-text-muted shrink-0">% of audience</span>
        {selectedCountry?.offset != null && (
          <span className="ml-auto text-xs pp-text-muted shrink-0">
            UTC{selectedCountry.offset >= 0 ? '+' : ''}{selectedCountry.offset}
          </span>
        )}
      </div>
      {selectedCountry?.multiTimezone && (
        <p className="pl-6 text-xs pp-accent">{selectedCountry.note}</p>
      )}
    </div>
  );
}

export default function LocationInputs({ value, onChange }) {
  const updateRow = (i, newVal) => {
    const next = [...value];
    next[i] = newVal;
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {value.map((loc, i) => (
        <LocationRow key={i} index={i} location={loc} onChange={v => updateRow(i, v)} />
      ))}
    </div>
  );
}