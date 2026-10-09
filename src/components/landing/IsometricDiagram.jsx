import { useState } from 'react';
import { MapPin, Activity, Clock, CalendarDays, Target } from 'lucide-react';

/*
 * Scroll-built isometric diagram for the Post Peak landing page.
 * One component per slab so each layer animates independently; all slabs
 * share a single SVG so leader lines and connectors can cross layers.
 *
 * Build state comes from the `phase` prop (0–6). Pieces reveal with
 * staggered CSS transitions (the diagonal wave / row fills), which also
 * reverses cleanly when the user scrolls back up.
 */

// ── Isometric projection (30°) ───────────────────────────────────────────────
const COS30 = Math.cos(Math.PI / 6);
const ORIGIN = { x: 600, y: 452 };

const iso = (x, y, z = 0) => [ORIGIN.x + (x - y) * COS30, ORIGIN.y + (x + y) * 0.5 - z];
const poly = (points) => points.map(([x, y, z]) => iso(x, y, z).map(v => v.toFixed(1)).join(',')).join(' ');

// ── Slab geometry ───────────────────────────────────────────────────────────
const SLAB = { x0: -230, x1: 230, y0: -155, y1: 155, t: 16 };
const Z1 = 40, Z2 = 175, Z3 = 310, Z4 = 445;

function SlabFrame({ z, label, on, labelSide = 'left', children }) {
  const { x0, x1, y0, y1, t } = SLAB;
  const anchor = labelSide === 'left' ? iso(x0, y1, z) : iso(x1, y0, z);
  const elbow = [anchor[0] + (labelSide === 'left' ? -56 : 56), anchor[1] + 26];
  const textEnd = [anchor[0] + (labelSide === 'left' ? -82 : 82), elbow[1] + 26];
  return (
    <g className={`iso-slab${on ? ' is-on' : ''}`}>
      <polygon className="iso-face" points={poly([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]])} />
      <polygon className="iso-face" points={poly([[x1, y0, z], [x1, y1, z], [x1, y1, z - t], [x1, y0, z - t]])} />
      <polygon className="iso-face" points={poly([[x0, y1, z], [x1, y1, z], [x1, y1, z - t], [x0, y1, z - t]])} />
      {children}
      <g className="iso-leader">
        <polyline className="iso-draw" pathLength="1" points={`${anchor[0].toFixed(1)},${anchor[1].toFixed(1)} ${elbow[0].toFixed(1)},${elbow[1].toFixed(1)} ${textEnd[0].toFixed(1)},${textEnd[1].toFixed(1)}`} fill="none" />
        <text
          className="iso-label-text"
          x={textEnd[0]}
          y={textEnd[1] + 16}
          textAnchor={labelSide === 'left' ? 'end' : 'start'}
        >
          {label}
        </text>
      </g>
    </g>
  );
}

// ── Layer 1: grid of cubes (audience signals) ───────────────────────────────
const CUBE = 15;
const CUBES = [];
for (let ix = 0; ix < 6; ix++) {
  for (let iy = 0; iy < 4; iy++) {
    CUBES.push({ x: -165 + ix * 66, y: -100 + iy * 66, delay: (ix + iy) * 55 });
  }
}

function PatternCubes({ z }) {
  return (
    <g>
      {CUBES.map((c, i) => {
        const top = poly([
          [c.x - CUBE, c.y - CUBE, z], [c.x + CUBE, c.y - CUBE, z],
          [c.x + CUBE, c.y + CUBE, z], [c.x - CUBE, c.y + CUBE, z],
        ]);
        const right = poly([
          [c.x + CUBE, c.y - CUBE, z], [c.x + CUBE, c.y + CUBE, z],
          [c.x + CUBE, c.y + CUBE, z - CUBE], [c.x + CUBE, c.y - CUBE, z - CUBE],
        ]);
        const left = poly([
          [c.x - CUBE, c.y + CUBE, z], [c.x + CUBE, c.y + CUBE, z],
          [c.x + CUBE, c.y + CUBE, z - CUBE], [c.x - CUBE, c.y + CUBE, z - CUBE],
        ]);
        return (
          <g key={i} className="iso-piece" style={{ transitionDelay: `${c.delay}ms` }}>
            <polygon className="iso-face" points={top} />
            <polygon className="iso-face-2" points={right} />
            <polygon className="iso-face-2" points={left} />
          </g>
        );
      })}
    </g>
  );
}

// ── Layer 2: dot matrix (reach model) ───────────────────────────────────────
const DOTS = [];
for (let ix = 0; ix < 7; ix++) {
  for (let iy = 0; iy < 5; iy++) {
    DOTS.push({ x: -180 + ix * 60, y: -120 + iy * 60, delay: iy * 90 + ix * 25 });
  }
}

function PatternDots({ z }) {
  return (
    <g>
      {DOTS.map((d, i) => {
        const [cx, cy] = iso(d.x, d.y, z);
        return (
          <g key={i} className="iso-piece" style={{ transitionDelay: `${d.delay}ms` }}>
            <ellipse className="iso-dot" cx={cx} cy={cy} rx="6.5" ry="3.8" />
            {i % 4 === 0 && <ellipse className="iso-dot-ring" cx={cx} cy={cy} rx="12" ry="7" />}
          </g>
        );
      })}
    </g>
  );
}

// ── Layer 3: concentric insets + sliding windows (optimizer) ────────────────
const INSETS = [0, 34, 68, 102].map((inset, i) => ({
  inset,
  delay: i * 170,
}));

const WINDOWS = [
  { x: -110, y: -50, delay: 700 },
  { x: 30, y: -10, delay: 850 },
  { x: -30, y: 80, delay: 1000 },
];

function PatternInsets({ z }) {
  const { x0, x1, y0, y1 } = SLAB;
  return (
    <g>
      {INSETS.map((r, i) => (
        <polygon
          key={i}
          className="iso-draw iso-inset"
          style={{ transitionDelay: `${r.delay}ms` }}
          pathLength="1"
          points={poly([
            [x0 + r.inset, y0 + r.inset, z], [x1 - r.inset, y0 + r.inset, z],
            [x1 - r.inset, y1 - r.inset, z], [x0 + r.inset, y1 - r.inset, z],
          ])}
        />
      ))}
      {WINDOWS.map((w, i) => (
        <polygon
          key={`w${i}`}
          className="iso-draw iso-window"
          style={{ transitionDelay: `${w.delay}ms` }}
          pathLength="1"
          points={poly([
            [w.x - 46, w.y - 30, z], [w.x + 46, w.y - 30, z],
            [w.x + 46, w.y + 30, z], [w.x - 46, w.y + 30, z],
          ])}
        />
      ))}
    </g>
  );
}

// ── Layer 4: node map (posting plan) ────────────────────────────────────────
const NODES = [
  { id: 'signals', x: -150, y: -75, Icon: MapPin, name: 'Audience signals', desc: 'Locations, ages, genders — weighted to 100.' },
  { id: 'model', x: -35, y: -115, Icon: Activity, name: 'Reach model', desc: 'Minute-by-minute curves per segment.' },
  { id: 'times', x: 95, y: -65, Icon: Clock, name: 'Best post times', desc: 'The exact minutes to publish.' },
  { id: 'week', x: -95, y: 85, Icon: CalendarDays, name: '7-day schedule', desc: 'Posts spread across the week.' },
  { id: 'score', x: 45, y: 110, Icon: Target, name: 'Reach score', desc: 'Why each slot wins, quantified.' },
];

const NODE_LINKS = [
  ['signals', 'model'], ['model', 'times'], ['times', 'score'],
  ['score', 'week'], ['week', 'signals'], ['model', 'week'],
];

function PatternNodes({ z, ambient }) {
  const byId = Object.fromEntries(NODES.map(n => [n.id, n]));
  return (
    <g>
      {NODE_LINKS.map(([a, b], i) => {
        const [x1, y1] = iso(byId[a].x, byId[a].y, z + 2);
        const [x2, y2] = iso(byId[b].x, byId[b].y, z + 2);
        return (
          <g key={`l${i}`}>
            <line className="iso-draw iso-link" style={{ transitionDelay: `${i * 160}ms` }} pathLength="1" x1={x1} y1={y1} x2={x2} y2={y2} />
            {ambient && (
              <line className="iso-spark" pathLength="1" x1={x1} y1={y1} x2={x2} y2={y2} style={{ animationDelay: `${i * 0.5}s` }} />
            )}
          </g>
        );
      })}
      {NODES.map((n, i) => {
        const [cx, cy] = iso(n.x, n.y, z + 4);
        const { Icon } = n;
        return (
          <g key={n.id} className="iso-node" style={{ transitionDelay: `${i * 220}ms` }}>
            <circle className="iso-node-ring" cx={cx} cy={cy} r="17" />
            {ambient && <circle className="iso-node-pulse" cx={cx} cy={cy} r="17" style={{ animationDelay: `${i * 0.4}s` }} />}
            <circle className="iso-node-core" cx={cx} cy={cy} r="12.5" />
            <svg x={cx - 7} y={cy - 7} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="iso-node-icon">
              <Icon />
            </svg>
            <g className="iso-tip" transform={`translate(${cx}, ${cy - 34})`}>
              <rect x="-84" y="-34" width="168" height="40" rx="7" />
              <text className="iso-tip-title" x="0" y="-19" textAnchor="middle">{n.name}</text>
              <text className="iso-tip-desc" x="0" y="-6" textAnchor="middle">{n.desc}</text>
            </g>
          </g>
        );
      })}
    </g>
  );
}

// ── Floating cards above the stack ──────────────────────────────────────────
const CARDS = [
  { id: 'velocity', x: -175, y: -25, z: 610, label: 'REACH VELOCITY', glyph: 'bars', to: 'times', side: 'left' },
  { id: 'schedule', x: -15, y: -105, z: 640, label: '7-DAY SCHEDULE', glyph: 'dots', to: 'week', side: 'right' },
  { id: 'posts', x: 135, y: -25, z: 615, label: 'POST CARDS', glyph: 'rows', to: 'score', side: 'right' },
  { id: 'insights', x: -30, y: 115, z: 645, label: 'PLATFORM INSIGHTS', glyph: 'hub', to: 'signals', side: 'left' },
];

function CardGlyph({ kind, x, y, z }) {
  if (kind === 'bars') {
    return (
      <g>
        {[22, 44, 30, 56].map((h, i) => (
          <line key={i} className="iso-card-glyph" x1={iso(x - 30 + i * 20, y + 14, z)[0]} y1={iso(x - 30 + i * 20, y + 14, z)[1]} x2={iso(x - 30 + i * 20, y + 14, z + h)[0]} y2={iso(x - 30 + i * 20, y + 14, z + h)[1]} />
        ))}
      </g>
    );
  }
  if (kind === 'dots') {
    return (
      <g>
        {[0, 1, 2, 3, 4].map((i) => {
          const [cx, cy] = iso(x - 40 + i * 20, y, z + 1);
          return <circle key={i} className="iso-card-dot" cx={cx} cy={cy} r="3.4" />;
        })}
      </g>
    );
  }
  if (kind === 'rows') {
    return (
      <g>
        {[0, 1, 2].map((i) => {
          const [ax, ay] = iso(x - 34, y - 16 + i * 16, z + 1);
          const [bx, by] = iso(x + 34, y - 16 + i * 16, z + 1);
          return <line key={i} className="iso-card-glyph" x1={ax} y1={ay} x2={bx} y2={by} />;
        })}
      </g>
    );
  }
  return (
    <g>
      <polygon className="iso-card-glyph-fill" points={poly([[x - 12, y - 12, z + 1], [x + 12, y - 12, z + 1], [x + 12, y + 12, z + 1], [x - 12, y + 12, z + 1]])} />
      {[[-34, -20], [34, -20], [-34, 20], [34, 20]].map(([dx, dy], i) => {
        const [ax, ay] = iso(x + dx * 0.55, y + dy * 0.55, z + 1);
        const [bx, by] = iso(x + dx, y + dy, z + 1);
        return <line key={i} className="iso-card-glyph" x1={ax} y1={ay} x2={bx} y2={by} />;
      })}
    </g>
  );
}

function FloatingCards({ active, hovered, setHovered }) {
  const byId = Object.fromEntries(NODES.map(n => [n.id, n]));
  return (
    <g className={`iso-float${active ? ' is-on' : ''}`}>
      {CARDS.map((c, i) => {
        const node = byId[c.to];
        const [ax, ay] = iso(c.x, c.y, c.z - 10);
        const [bx, by] = iso(node.x, node.y, Z4 + 8);
        const hot = hovered === c.id;
        return (
          <g key={c.id}>
            <line
              className={`iso-draw iso-connector${hot ? ' is-hot' : ''}`}
              style={{ transitionDelay: `${i * 260 + 120}ms` }}
              pathLength="1"
              x1={ax} y1={ay} x2={bx} y2={by}
            />
            <g
              className={`iso-card${hot ? ' is-hot' : ''}`}
              style={{ transitionDelay: `${i * 260}ms` }}
              onMouseEnter={() => setHovered(c.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <polygon className="iso-face" points={poly([
                [c.x - 58, c.y - 40, c.z], [c.x + 58, c.y - 40, c.z],
                [c.x + 58, c.y + 40, c.z], [c.x - 58, c.y + 40, c.z],
              ])} />
              <CardGlyph kind={c.glyph} x={c.x} y={c.y} z={c.z + 1} />
              <text
                className="iso-card-label"
                x={iso(c.x, c.y, c.z)[0] + (c.side === 'left' ? -78 : 78)}
                y={iso(c.x, c.y, c.z)[1] - 26}
                textAnchor={c.side === 'left' ? 'end' : 'start'}
              >
                {c.label}
              </text>
            </g>
          </g>
        );
      })}
    </g>
  );
}

// ── Background grid ─────────────────────────────────────────────────────────
const GRID_LINES = [];
for (let i = -6; i <= 6; i++) {
  GRID_LINES.push([i * 70, -420, i * 70, 420]);
  GRID_LINES.push([-420, i * 70, 420, i * 70]);
}

function IsoGrid() {
  return (
    <g className="iso-grid">
      {GRID_LINES.map(([x1, y1, x2, y2], i) => {
        const [ax, ay] = iso(x1, y1, -30);
        const [bx, by] = iso(x2, y2, -30);
        return <line key={i} x1={ax} y1={ay} x2={bx} y2={by} />;
      })}
    </g>
  );
}

// ── Stage ───────────────────────────────────────────────────────────────────
export default function IsometricDiagram({ phase }) {
  const [hovered, setHovered] = useState(null);
  return (
    <svg className="iso-svg" viewBox="0 -340 1200 1240" role="img" aria-label="How Post Peak works: audience signals, reach model, optimizer and posting plan assembled into one engine">
      <IsoGrid />
      <SlabFrame z={Z1} label="AUDIENCE SIGNALS" on={phase >= 1} labelSide="left">
        <PatternCubes z={Z1} />
      </SlabFrame>
      <SlabFrame z={Z2} label="REACH MODEL" on={phase >= 2} labelSide="right">
        <PatternDots z={Z2} />
      </SlabFrame>
      <SlabFrame z={Z3} label="OPTIMIZER" on={phase >= 3} labelSide="left">
        <PatternInsets z={Z3} />
      </SlabFrame>
      <SlabFrame z={Z4} label="POSTING PLAN" on={phase >= 4} labelSide="right">
        <PatternNodes z={Z4} ambient={phase >= 6} />
      </SlabFrame>
      <FloatingCards active={phase >= 5} hovered={hovered} setHovered={setHovered} />
    </svg>
  );
}
