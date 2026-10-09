// Post Peak's mark: the engine's track — the same outline the RingLoader
// traces — drawn as a static stroked shape, not a filled blob. The calculator
// header and the landing page's nav, hero and footer all render this.
// RingLoader stays for genuine progress (the Calculate button), so it animates;
// this never does.

const PEAK_TRACK =
  'M29.760000000000005 18.72 c0 7.28 -3.9200000000000004 13.600000000000001 -9.840000000000002 16.96 c -2.8800000000000003 1.6800000000000002 -6.24 2.64 -9.840000000000002 2.64 c -3.6 0 -6.88 -0.96 -9.76 -2.64 c0 -7.28 3.9200000000000004 -13.52 9.840000000000002 -16.96 c2.8800000000000003 -1.6800000000000002 6.24 -2.64 9.76 -2.64 S26.880000000000003 17.040000000000003 29.760000000000005 18.72 c5.84 3.3600000000000003 9.76 9.68 9.840000000000002 16.96 c -2.8800000000000003 1.6800000000000002 -6.24 2.64 -9.76 2.64 c -3.6 0 -6.88 -0.96 -9.840000000000002 -2.64 c -5.84 -3.3600000000000003 -9.76 -9.68 -9.76 -16.96 c0 -7.28 3.9200000000000004 -13.600000000000001 9.76 -16.96 C25.84 5.120000000000001 29.760000000000005 11.440000000000001 29.760000000000005 18.72z';

/**
 * @param {{ size?: number, className?: string }} props
 *
 * `strokeWidth` mirrors RingLoader's track so the mark reads as the same
 * shape at any size; callers can thin it with CSS (the landing nav does).
 *
 * `overflow="visible"` is load-bearing: the track spans x 0.32–39.6 and
 * y 1.76–38.32 in this viewBox, so a 4-unit stroke reaches ~1.7 units past it
 * on every side. Without it the default `overflow: hidden` shaves the outline —
 * which is exactly why RingLoader sets the same thing in CSS.
 */
export default function PeakMark({ size = 24, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      overflow="visible"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={PEAK_TRACK}
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
