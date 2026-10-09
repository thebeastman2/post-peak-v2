import { Palette, Sun, Moon, Check } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { colorSchemes } from '@/data/colorSchemes';

export default function ColorSchemeSettings({ schemeId, setSchemeId, themeMode, toggleTheme }) {
  const current = colorSchemes.find(s => s.id === schemeId);
  const currentColors = current?.[themeMode] || current?.light;

  return (
    <div className="flex items-center gap-2 shrink-0">
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border pp-border pp-card pp-hover transition-colors">
            <span
              className="w-3.5 h-3.5 rounded-full"
              style={{ background: `linear-gradient(135deg, hsl(${currentColors.primary}), hsl(${currentColors.accent}))` }}
            />
            <span className="text-xs font-medium pp-text">{current?.name || 'Theme'}</span>
            <Palette className="w-3.5 h-3.5 pp-text-muted" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 p-3 rounded-xl border pp-border" style={{ background: 'hsl(var(--pp-card))' }}>
          <div className="text-xs font-medium pp-text-muted uppercase tracking-wider mb-2">Accent</div>
          <div className="grid grid-cols-8 gap-1.5 mb-4">
            {colorSchemes.map(s => {
              const colors = s[themeMode] || s.light;
              const active = schemeId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSchemeId(s.id)}
                  title={s.name}
                  className="relative w-6 h-6 rounded-full transition-transform hover:scale-110"
                  style={{ background: `linear-gradient(135deg, hsl(${colors.primary}), hsl(${colors.accent}))` }}
                >
                  {active && (
                    <Check className="absolute inset-0 m-auto w-3 h-3 text-white drop-shadow" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="text-xs font-medium pp-text-muted uppercase tracking-wider mb-2">Mode</div>
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border pp-border pp-card pp-hover transition-colors"
          >
            {themeMode === 'light' ? <Sun className="w-4 h-4 pp-text" /> : <Moon className="w-4 h-4 pp-text" />}
            <span className="text-sm font-medium pp-text">{themeMode === 'light' ? 'Light' : 'Dark'}</span>
          </button>
        </PopoverContent>
      </Popover>
    </div>
  );
}