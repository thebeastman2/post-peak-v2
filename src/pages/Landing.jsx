import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowDown } from 'lucide-react';
import IsometricDiagram from '@/components/landing/IsometricDiagram';
import AmbientBackground from '@/components/effects/AmbientBackground';
import PeakMark from '@/components/PeakMark';

/*
 * Scroll-built landing page. The build section is a tall container with a
 * sticky stage; scroll progress drives `phase` (0–6) which assembles the
 * isometric diagram layer by layer. Scrolling back up reverses the build.
 * The build finishes around 57% of the section; the completed diagram then
 * glides out at page-scroll speed while the remaining story scrolls past.
 */

const STEPS = [
  {
    eyebrow: 'THE METHOD',
    title: 'Four layers turn audience data into posting times.',
    body: 'Scroll to assemble the engine from bottom to top, one layer at a time. Every recommendation Post Peak makes comes out of this stack.',
  },
  {
    eyebrow: 'LAYER 01 — AUDIENCE SIGNALS',
    title: 'Start with who you actually reach.',
    body: 'Locations, age and gender mixes, and platform baselines form the raw input. Post Peak normalizes every percentage so the model always works from a complete picture.',
  },
  {
    eyebrow: 'LAYER 02 — REACH MODEL',
    title: 'Model reach, minute by minute.',
    body: 'Each audience segment becomes a Gaussian activity curve at one-minute resolution. Timezones localize every location, and day multipliers shape how the week breathes.',
  },
  {
    eyebrow: 'LAYER 03 — OPTIMIZER',
    title: 'Score every minute. Pick the peaks.',
    body: 'A sliding window scores each posting moment across seven days. A dynamic program then selects posts that maximize reach while honoring your minimum gaps.',
  },
  {
    eyebrow: 'LAYER 04 — POSTING PLAN',
    title: 'One plan, wired to everything.',
    body: 'Today’s best minutes and a full seven-day schedule land as concrete post times. Reach scores and day strengths show exactly why each slot wins.',
  },
  {
    eyebrow: 'CONNECTED OUTPUTS',
    title: 'Everything reads from one core.',
    body: 'Dashboards, schedules, and post cards all connect to the same model. Change one input and every layer re-computes together.',
  },
  {
    eyebrow: 'READY WHEN YOU ARE',
    title: 'Your next post has a best minute.',
    body: 'Drop in your audience mix and Post Peak returns the exact times to publish. It takes seconds.',
  },
];

// Phase thresholds along section scroll progress (build completes near the end,
// leaving only a short glide before the next section enters).
const PHASE_STOPS = [0, 0.08, 0.23, 0.38, 0.53, 0.72, 0.97];

const BENEFITS = [
  {
    title: 'Precision by the minute',
    body: 'Reach curves at one-minute resolution',
  },
  {
    label: 'MULTI-LOCATION',
    title: 'Real audience mixes',
    body: 'Weighted locations, ages, and genders across timezones in one model.',
  },
  {
    label: 'PLANS, NOT VIBES',
    title: 'Decisions you can defend',
    body: 'Reach scores, gap constraints, and day strengths behind every recommendation.',
  },
];

export default function Landing() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const heroRef = useRef(null);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const hero = heroRef.current;
    if (!section || !stage) return undefined;

    const panels = Array.from(section.querySelectorAll('.lp-step-panel'));
    const mobileQuery = window.matchMedia('(max-width: 860px)');

    // Place each copy panel so its center reaches the viewport's text area
    // when its matching diagram phase starts. The panels remain in section
    // coordinates, so they scroll away naturally after appearing.
    const positionPanels = () => {
      const viewportHeight = window.innerHeight;
      const scrollable = Math.max(0, section.offsetHeight - viewportHeight);
      const stickyTop = Math.min(Math.max(72, viewportHeight * 0.09), 88);
      const mobileDiagramHeight = viewportHeight * 0.42;
      const textCenter = mobileQuery.matches
        ? stickyTop + mobileDiagramHeight + (viewportHeight - stickyTop - mobileDiagramHeight) / 2
        : stickyTop + (viewportHeight - stickyTop) / 2;

      panels.forEach((panel, index) => {
        const centerY = PHASE_STOPS[index] * scrollable + textCenter;
        panel.style.top = `${centerY}px`;
      });
    };

    const update = () => {
      const viewportHeight = window.innerHeight;
      const total = Math.max(1, section.offsetHeight - viewportHeight);
      const progress = Math.min(1, Math.max(0, -section.getBoundingClientRect().top / total));
      const releaseShift = Math.max(0, (progress - PHASE_STOPS[6]) * total);

      // Keep the rail and diagram motion in sync. The built diagram moves up
      // at page-scroll speed after phase 6, then tracks back down on reverse scroll.
      section.style.setProperty('--p', progress.toFixed(4));
      stage.style.setProperty('--release-shift', `${releaseShift}px`);
      if (hero) {
        hero.style.opacity = String(Math.min(1, Math.max(0, 1 - window.scrollY / (viewportHeight * 0.7))));
      }

      let next = 0;
      for (let i = 0; i < PHASE_STOPS.length; i++) {
        if (progress >= PHASE_STOPS[i]) next = i;
      }
      setPhase(current => current === next ? current : next);
    };

    // A small timeout throttle works consistently in browsers and embedded
    // preview webviews, including ones that pause requestAnimationFrame.
    let scrollTimer = 0;
    const onScroll = () => {
      if (scrollTimer) return;
      scrollTimer = window.setTimeout(() => {
        scrollTimer = 0;
        update();
      }, 16);
    };

    let resizeTimer = 0;
    const onResize = () => {
      positionPanels();
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(update, 80);
    };

    positionPanels();
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (scrollTimer) clearTimeout(scrollTimer);
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, []);

  const scrollToBuild = () => {
    const section = sectionRef.current;
    const nav = document.querySelector('.lp-nav');
    if (!section) return;
    const navHeight = nav?.getBoundingClientRect().height || 72;
    const target = window.scrollY + section.getBoundingClientRect().top - navHeight + 12;
    window.scrollTo({ top: target, behavior: 'smooth' });
  };

  return (
    <div className="lp min-h-screen">
      {/* The calculator's backdrop, reused verbatim: perspective grid,
          ambient glow, drifting particle field and a cursor-following light.
          It paints from the fixed, negative-z layer behind the page, so the
          landing surfaces below it are translucent glass. */}
      <AmbientBackground colorKey="landing" />

      {/* Nav */}
      <nav className="lp-nav">
        <Link to="/" className="lp-brand">
          <PeakMark size={26} className="lp-brand-mark" />
          <span>Post Peak</span>
        </Link>
        <Link to="/app" className="lp-btn lp-btn-primary">
          Launch App
          <ArrowRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* Hero */}
      <header ref={heroRef} className="lp-hero">
        <p className="lp-eyebrow">POST PEAK · POSTING-TIME INTELLIGENCE</p>
        <h1 className="lp-headline">Post when the algorithm is watching.</h1>
        <PeakMark size={96} className="lp-hero-symbol" />
        <div className="lp-cta-row">
          <Link to="/app" className="lp-btn lp-btn-primary lp-btn-lg">
            Launch App
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button type="button" onClick={scrollToBuild} className="lp-btn lp-btn-ghost lp-btn-lg">
            See how it works
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Scroll-built diagram */}
      <section ref={sectionRef} className="lp-build" id="build">
        <div className="lp-build-grid">
          {/* Step text panels: absolutely positioned at each phase stop inside
              the (tall) text column, so they appear at the right moment and
              then scroll up and away as the user continues — instead of being
              pinned inside the sticky stage. */}
          <div className="lp-text-col">
            {STEPS.map((step, i) => (
              <div
                key={i}
                data-step={i}
                className={`lp-step-panel${i === phase ? ' is-active' : ''}`}
              >
                <div className="lp-step">
                  <p className="lp-eyebrow">{step.eyebrow}</p>
                  <h2 className="lp-step-title">{step.title}</h2>
                  <p className="lp-step-body">{step.body}</p>
                  {i === 6 && (
                    <Link to="/app" className="lp-btn lp-btn-primary lp-step-cta">
                      Launch App
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sticky diagram column: the isometric diagram builds here, layer by
              layer, while the step text scrolls on the left. After completion,
              it glides out at the same rate as the page. */}
          <div className="lp-diagram-col">
            <div ref={stageRef} className={`lp-stage${phase >= 6 ? ' is-built' : ''}`}>
              <div className="lp-diagram">
                <IsometricDiagram phase={phase} />
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Benefits */}
      <section className="lp-benefits">
        {BENEFITS.map(b => (
          <article key={b.title} className="lp-benefit pp-glass">
            {b.label && <p className="lp-eyebrow">{b.label}</p>}
            <h3 className="lp-benefit-title">{b.title}</h3>
            <p className="lp-benefit-body">{b.body}</p>
          </article>
        ))}
      </section>

      {/* Final CTA */}
      <section className="lp-final">
        <p className="lp-eyebrow">START HERE</p>
        <h2 className="lp-headline lp-headline-sm">Find your best minute to post.</h2>
        <p className="lp-subhead">Free to run. No account needed to explore.</p>
        <PeakMark size={56} className="lp-hero-symbol lp-hero-symbol--offset" />
        <Link to="/app" className="lp-btn lp-btn-primary lp-btn-lg">
          Launch App
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <Link to="/" className="lp-brand">
          <PeakMark size={20} className="lp-brand-mark" />
          <span>Post Peak</span>
        </Link>
        <p className="lp-footer-note">Posting-time intelligence for social teams.</p>
        <Link to="/app" className="lp-footer-link">Launch App</Link>
      </footer>
    </div>
  );
}
