function formatHours(h) {
  const whole = Math.floor(h);
  const half = h % 1 !== 0;
  if (half) return `${whole}.5 hrs`;
  return `${whole} hr${whole > 1 ? 's' : ''}`;
}

export default function MultiPostControls({ numPosts, gaps, onNumPostsChange, onGapsChange }) {
  const updateGap = (i, val) => {
    const next = [...gaps];
    next[i] = val;
    onGapsChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium pp-text">Number of Posts</label>
          <span className="ml-auto text-sm font-semibold pp-primary">{numPosts}</span>
        </div>
        <input
          type="range"
          min={1}
          max={12}
          step={1}
          value={numPosts}
          onChange={e => onNumPostsChange(parseInt(e.target.value))}
          className="pp-range w-full"
        />
      </div>

      {numPosts > 1 && (
        <div className="space-y-3">
          <label className="text-sm font-medium pp-text">Minimum Spacing</label>
          <div className="space-y-2">
            {Array.from({ length: numPosts - 1 }, (_, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs pp-text-muted shrink-0 w-14">Post {i + 1}→{i + 2}</span>
                <input
                  type="range"
                  min={0}
                  max={12}
                  step={0.5}
                  value={gaps[i] ?? 2}
                  onChange={e => updateGap(i, parseFloat(e.target.value))}
                  className="pp-range flex-1 min-w-0"
                />
                <span className="text-xs font-medium pp-text shrink-0 w-16 text-right">{formatHours(gaps[i] ?? 2)}</span>
              </div>
            ))}
          </div>
          <p className="text-xs pp-text-muted leading-relaxed">
            Intervals are minimums — posts may be spaced further apart to maximize reach.
          </p>
        </div>
      )}
    </div>
  );
}