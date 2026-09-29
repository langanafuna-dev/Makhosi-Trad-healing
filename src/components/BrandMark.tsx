// A small abstract mark — a drop inside a ring — standing in for water and
// growth, the two threads running through both branches. Replaces the
// plain solid-color dot the logo used to be, in Navbar and the footer.
export default function BrandMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="18" stroke="#c9a15e" strokeWidth="1.5" />
      <path d="M20 9 C 27 18.5, 27 26, 20 31.5 C 13 26, 13 18.5, 20 9 Z" fill="#7a3e20" />
    </svg>
  );
}
