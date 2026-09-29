// A soft curve between two sections instead of a hard color edge — the
// flowing-water motif carried into the layout itself. `fill` should match
// the section that comes AFTER the divider (it sits on top of what comes
// before, like a wave washing over the edge).
export default function WaveDivider({ fill, flip = false }: { fill: string; flip?: boolean }) {
  return (
    <div
      aria-hidden="true"
      style={{ lineHeight: 0, transform: flip ? "scaleY(-1)" : undefined, marginTop: flip ? -1 : undefined }}
    >
      <svg viewBox="0 0 1440 90" preserveAspectRatio="none" style={{ width: "100%", height: 70, display: "block" }}>
        <path
          d="M0,45 C 220,90 420,0 720,28 C 1020,56 1220,10 1440,40 L1440,90 L0,90 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}
