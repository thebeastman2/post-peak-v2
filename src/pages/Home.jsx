
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { db } from '@/api/base44Client';
import { platforms } from '@/data/platforms';
import { calculatePlans } from '@/lib/optimizer';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSavedInputs } from '@/hooks/useSavedInputs';
import PlatformSelector from '@/components/PlatformSelector';
import AlgorithmWindowControl from '@/components/AlgorithmWindowControl';
import MultiPostControls from '@/components/MultiPostControls';
import LocationInputs from '@/components/LocationInputs';
import AgeGroupInputs from '@/components/AgeGroupInputs';
import GenderInputs from '@/components/GenderInputs';
import ColorSchemeSettings from '@/components/ColorSchemeSettings';
import FunctionModeSelector from '@/components/FunctionModeSelector';
import AcquisitionGroups, { makeBlankGroup } from '@/components/AcquisitionGroups';
import ResultsPanel from '@/components/ResultsPanel';
import ErrorMessage from '@/components/ErrorMessage';
import RingLoader from '@/components/RingLoader';
import PeakMark from '@/components/PeakMark';
import { usePlatformData } from '@/hooks/usePlatformData';
import AmbientBackground from '@/components/effects/AmbientBackground';
import TiltCard from '@/components/effects/TiltCard';
import Reveal from '@/components/effects/Reveal';
import { ArrowRight, History, ChevronDown, ChevronUp, Scale } from 'lucide-react';

// Scale non-negative shares to integers that sum to exactly 100 (largest remainder).
// Returns null when there is nothing to scale (total is zero).
function normalizeShares(values) {
  const total = values.reduce((s, v) => s + v, 0);
  if (total <= 0) return null;
  const raw = values.map(v => (v / total) * 100);
  const out = raw.map(v => Math.floor(v));
  let remainder = 100 - out.reduce((s, v) => s + v, 0);
  const order = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; k < order.length && remainder > 0; k++) {
    out[order[k].i] += 1;
    remainder -= 1;
  }
  return out;
}

export default function Home() {
  const { schemeId, setSchemeId, themeMode, toggleTheme } = useColorScheme();
  const { savedInputs, saveInput } = useSavedInputs();

  const [platform, setPlatform] = useState('instagram');
  const [mode, setMode] = useState('maximization');
  const [acquisitionGroups, setAcquisitionGroups] = useState([makeBlankGroup(0)]);
  const [algorithmWindow, setAlgorithmWindow] = useState(2);
  const [numPosts, setNumPosts] = useState(1);
  const [gaps, setGaps] = useState([2]);
  const [locations, setLocations] = useState(
    Array(5).fill(null).map(() => ({ country: '', offset: null, percentage: '' }))
  );
  const [ageGroups, setAgeGroups] = useState([]);
  const [gender, setGender] = useState({ men: '', women: '' });
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const { data: platformData, refreshing, refresh } = usePlatformData(platform);
  const resultsRef = useRef(null);
  // Input combos already calculated this session — repeats skip the loader wait.
  const seenQueries = useRef(new Set());

  // Reset age groups when platform changes
  useEffect(() => {
    const p = platforms[platform];
    setAgeGroups(p.ageGroups.map(ag => ({ id: ag.id, label: ag.label, percentage: '' })));
  }, [platform]);

  // Adjust gaps array length when numPosts changes
  useEffect(() => {
    setGaps(prev => {
      const next = [...prev];
      while (next.length < numPosts - 1) next.push(next[next.length - 1] ?? 2);
      while (next.length > numPosts - 1) next.pop();
      return next;
    });
  }, [numPosts]);

  const handleCalculate = async () => {
    let params;
    let savedData;

    if (mode === 'acquisition') {
      const validGroups = acquisitionGroups.filter(g =>
        g.location?.offset != null && g.ageGroupId && parseFloat(g.weight) > 0
      );
      if (validGroups.length === 0) {
        setError('please add at least one group with a location, age group, and weight');
        return;
      }

      // Auto-normalize weights if they don't sum to 100
      let groups = acquisitionGroups;
      const totalW = validGroups.reduce((s, g) => s + parseFloat(g.weight), 0);
      if (Math.round(totalW) !== 100) {
        groups = acquisitionGroups.map(g => {
          const w = parseFloat(g.weight) || 0;
          return { ...g, weight: /** @type {any} */ (w > 0 ? Math.round((w / totalW) * 100) : '') };
        });
        setAcquisitionGroups(groups);
      }

      params = {
        groups: groups.filter(g =>
          g.location?.offset != null && g.ageGroupId && parseFloat(g.weight) > 0
        ),
        platformId: platform,
        platformConfig,
        windowDuration: algorithmWindow,
        numPosts,
        gaps,
      };
      savedData = {
        mode,
        platform,
        algorithmWindow,
        numPosts,
        gaps,
        acquisitionGroups: groups,
      };
    } else {
      const hasValidLocation = locations.some(l => l.offset != null && l.percentage && parseFloat(l.percentage) > 0);
      if (!hasValidLocation) {
        setError('please add at least one audience location and its respective percentage');
        return;
      }

      params = {
        locations: locations.map(l => ({ ...l, percentage: parseFloat(l.percentage) || 0 })),
        ageGroups: ageGroups.map(a => ({ ...a, percentage: parseFloat(a.percentage) || 0 })),
        gender: { men: parseFloat(gender.men) || 0, women: parseFloat(gender.women) || 0 },
        platformId: platform,
        platformConfig,
        windowDuration: algorithmWindow,
        numPosts,
        gaps,
      };
      savedData = {
        mode,
        platform,
        algorithmWindow,
        numPosts,
        gaps,
        locations,
        ageGroups,
        gender,
      };
    }

    // Cache key for the full input set. The first time a set of inputs is
    // calculated it gets a 2s loader so the animation is actually visible;
    // the same inputs again resolve immediately.
    const queryKey = JSON.stringify(
      mode === 'acquisition'
        ? { mode, platform, algorithmWindow, numPosts, gaps, acquisitionGroups }
        : { mode, platform, algorithmWindow, numPosts, gaps, locations, ageGroups, gender }
    );
    const startedAt = Date.now();

    setCalculating(true);

    let freshData = null;
    try {
      freshData = await refresh();
    } catch (e) {
      // fall back to baseline
    }

    const freshConfig = freshData ? {
      ...p,
      activityPeaks: { ...p.activityPeaks, ...(freshData.activityPeaks || {}) },
      dayMultipliers: { ...p.dayMultipliers, ...(freshData.dayMultipliers || {}) },
    } : platformConfig;

    const result = calculatePlans({ ...params, platformConfig: freshConfig });

    // Hold the loader for 2s on a first-time input set (padded across the
    // real work so the wait is ~2s total, not 2s plus the fetch).
    if (!seenQueries.current.has(queryKey)) {
      seenQueries.current.add(queryKey);
      const elapsed = Date.now() - startedAt;
      if (elapsed < 2000) await new Promise(r => setTimeout(r, 2000 - elapsed));
    }

    setResults(result);

    db.analytics.track({
      eventName: 'optimal_times_calculated',
      properties: {
        platform,
        mode,
        num_posts: Number(numPosts),
      },
    });

    saveInput(savedData);

    setCalculating(false);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Normalize every visible percentage distribution so each sums to exactly 100.
  const handleNormalize = () => {
    let normalized = false;

    // Only rewrite rows the user filled in — blank rows stay blank.
    const applyToRows = (rows, norm, key) =>
      rows.map((row, i) => (row[key] === '' || row[key] == null ? row : { ...row, [key]: norm[i] }));

    if (mode === 'acquisition') {
      const norm = normalizeShares(acquisitionGroups.map(g => parseFloat(g.weight) || 0));
      if (norm) {
        setAcquisitionGroups(applyToRows(acquisitionGroups, norm, 'weight'));
        normalized = true;
      }
    } else {
      const normLoc = normalizeShares(locations.map(l => parseFloat(l.percentage) || 0));
      if (normLoc) {
        setLocations(applyToRows(locations, normLoc, 'percentage'));
        normalized = true;
      }
      const normAge = normalizeShares(ageGroups.map(a => parseFloat(a.percentage) || 0));
      if (normAge) {
        setAgeGroups(applyToRows(ageGroups, normAge, 'percentage'));
        normalized = true;
      }
      const normGender = normalizeShares([parseFloat(gender.men) || 0, parseFloat(gender.women) || 0]);
      if (normGender) {
        setGender({
          men: gender.men === '' ? '' : normGender[0],
          women: gender.women === '' ? '' : normGender[1],
        });
        normalized = true;
      }
    }

    if (!normalized) setError('nothing to normalize yet — add some values first');
  };

  const loadSavedInput = (saved) => {
    try {
      const data = JSON.parse(saved.input_data);
      if (data.platform) setPlatform(data.platform);
      if (data.mode) setMode(data.mode);
      if (data.algorithmWindow) setAlgorithmWindow(data.algorithmWindow);
      if (data.numPosts) setNumPosts(data.numPosts);
      if (data.gaps) setGaps(data.gaps);
      else if (data.minSpacing != null) setGaps(Array.from({ length: (data.numPosts || 1) - 1 }, () => data.minSpacing));
      if (data.locations) setLocations(data.locations);
      if (data.ageGroups) setAgeGroups(data.ageGroups);
      if (data.gender) setGender(data.gender);
      if (data.acquisitionGroups) setAcquisitionGroups(data.acquisitionGroups);
      setShowHistory(false);
    } catch (e) {
      // ignore parse errors
    }
  };

  const p = platforms[platform];
  const platformConfig = platformData ? {
    ...p,
    activityPeaks: { ...p.activityPeaks, ...(platformData.activityPeaks || {}) },
    dayMultipliers: { ...p.dayMultipliers, ...(platformData.dayMultipliers || {}) },
  } : undefined;

  return (
    <div className="min-h-screen pp-text relative">
      <AmbientBackground colorKey={`${schemeId}-${themeMode}`} />
      <div className="max-w-2xl mx-auto px-5 py-10 sm:py-14 space-y-8">
        {/* Header */}
        <Reveal>
          <header className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Link
                to="/"
                aria-label="Post Peak — back to landing page"
                className="inline-flex items-center gap-2.5 rounded-md transition-opacity hover:opacity-75"
              >
                <PeakMark size={22} />
                <h1 className="text-2xl sm:text-3xl font-semibold pp-text tracking-tight">Post Peak</h1>
              </Link>
              <p className="text-sm pp-text-muted">Post when the algorithm is watching.</p>
            </div>
            <ColorSchemeSettings
              schemeId={schemeId}
              setSchemeId={setSchemeId}
              themeMode={themeMode}
              toggleTheme={toggleTheme}
            />
          </header>
        </Reveal>

        {/* Platform */}
        <Reveal>
          <section className="space-y-3">
            <h2 className="text-xs font-medium pp-text-muted uppercase tracking-wider">Platform</h2>
            <TiltCard tilt={false} className="p-4">
              <PlatformSelector value={platform} onChange={setPlatform} />
            </TiltCard>
          </section>
        </Reveal>

        {/* Function */}
        <Reveal>
          <section className="space-y-3">
            <h2 className="text-xs font-medium pp-text-muted uppercase tracking-wider">Function</h2>
            <TiltCard tilt={false} className="p-4">
              <FunctionModeSelector value={mode} onChange={setMode} />
            </TiltCard>
          </section>
        </Reveal>

        {mode === 'acquisition' ? (
          <>
            <section className="space-y-3">
              <h2 className="text-xs font-medium pp-text-muted uppercase tracking-wider">Target Demographics</h2>
              <TiltCard tilt={false} className="p-4">
                <AcquisitionGroups
                  value={acquisitionGroups}
                  onChange={setAcquisitionGroups}
                  ageGroups={p.ageGroups}
                />
              </TiltCard>
            </section>

            <section className="space-y-3">
              <h2 className="text-xs font-medium pp-text-muted uppercase tracking-wider">Posting Strategy</h2>
              <TiltCard tilt={false} className="p-4">
                <div className="space-y-5">
                  <AlgorithmWindowControl value={algorithmWindow} onChange={setAlgorithmWindow} />
                  <MultiPostControls
                    numPosts={numPosts}
                    gaps={gaps}
                    onNumPostsChange={setNumPosts}
                    onGapsChange={setGaps}
                  />
                </div>
              </TiltCard>
            </section>
          </>
        ) : (
          <>
            <section className="space-y-3">
              <h2 className="text-xs font-medium pp-text-muted uppercase tracking-wider">Posting Strategy</h2>
              <TiltCard tilt={false} className="p-4">
                <div className="space-y-5">
                  <AlgorithmWindowControl value={algorithmWindow} onChange={setAlgorithmWindow} />
                  <MultiPostControls
                    numPosts={numPosts}
                    gaps={gaps}
                    onNumPostsChange={setNumPosts}
                    onGapsChange={setGaps}
                  />
                </div>
              </TiltCard>
            </section>

            <section className="space-y-3">
              <h2 className="text-xs font-medium pp-text-muted uppercase tracking-wider">Audience Locations</h2>
              <TiltCard tilt={false} className="p-4">
                <LocationInputs value={locations} onChange={setLocations} />
              </TiltCard>
            </section>

            <section className="space-y-3">
              <h2 className="text-xs font-medium pp-text-muted uppercase tracking-wider">{p.name} Demographics</h2>
              <TiltCard tilt={false} className="p-4">
                <div className="space-y-4">
                  {p.hasAge && (
                    <AgeGroupInputs ageGroups={p.ageGroups} value={ageGroups} onChange={setAgeGroups} />
                  )}
                  {p.hasGender && (
                    <GenderInputs value={gender} onChange={setGender} />
                  )}
                </div>
              </TiltCard>
            </section>
          </>
        )}

        {/* Normalize + Calculate */}
        <div className="pt-2 space-y-2">
          <button
            onClick={handleNormalize}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border pp-border pp-card pp-hover pp-text font-medium text-sm"
          >
            <Scale className="w-4 h-4" />
            Normalize to 100%
          </button>
          <button
            onClick={handleCalculate}
            disabled={calculating}
            className="group flex items-center justify-center gap-2 w-full py-4 rounded-2xl pp-primary-bg text-white font-medium text-[15px] pp-btn-glow disabled:opacity-50"
          >
            {calculating ? (
              <>
                <RingLoader size={22} />
                {refreshing ? 'Sourcing fresh data…' : 'Calculating…'}
              </>
            ) : (
              <>
                Calculate Optimal Posting Times
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>

        {/* Error */}
        <ErrorMessage message={error} onDismiss={() => setError('')} />

        {/* Results */}
        {results && (
          <Reveal>
            <div ref={resultsRef} className="space-y-5">
              <ResultsPanel results={results} />
            </div>
          </Reveal>
        )}

        {/* History */}
        {savedInputs.length > 0 && (
          <section className="pt-2 space-y-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 w-full text-left"
            >
              <History className="w-3.5 h-3.5 pp-text-muted" />
              <span className="text-xs font-medium pp-text-muted uppercase tracking-wider">Recent</span>
              <span className="text-xs pp-text-muted">({savedInputs.length})</span>
              {showHistory
                ? <ChevronUp className="w-4 h-4 ml-auto pp-text-muted" />
                : <ChevronDown className="w-4 h-4 ml-auto pp-text-muted" />}
            </button>
            {showHistory && (
              <div className="space-y-1.5">
                {savedInputs.map((s, i) => {
                  let data = {};
                  try { data = JSON.parse(s.input_data); } catch (e) {}
                  return (
                    <button
                      key={s.id || i}
                      onClick={() => loadSavedInput(s)}
                      className="flex items-center gap-3 w-full p-3 rounded-xl border pp-border pp-card pp-hover text-left transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium pp-text">
                          {platforms[data.platform]?.name || 'Unknown'}
                          <span className="pp-text-muted font-normal">
                            {data.mode === 'acquisition' ? ' · Acquisition' : ' · Maximize'}
                          </span>
                          {data.numPosts > 1 && ` · ${data.numPosts} posts`}
                        </div>
                        <div className="text-xs pp-text-muted truncate">
                          {data.mode === 'acquisition'
                            ? `${(data.acquisitionGroups || []).filter(g => g.location?.country).length} groups`
                            : (data.locations || []).filter(l => l.country).map(l => l.country).join(', ') || 'No locations'}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 pp-text-muted shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}