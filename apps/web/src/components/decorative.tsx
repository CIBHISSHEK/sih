// Small decorative helpers for farmer-facing screens — kept deliberately
// simple (blurred CSS circles, not scaled/cropped SVG paths) after an
// earlier hand-drawn field-pattern SVG rendered as broken slivers once
// preserveAspectRatio scaling met a real wide viewport. Blurred circles are
// the same technique already proven on Login/Register and can't visually
// break regardless of container size.

export function HeroGlow({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute -top-16 -right-10 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-accent-300/20 blur-3xl" />
      <div className="absolute top-1/2 right-1/4 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
    </div>
  );
}

export function WaveDivider({ fillClassName = "fill-gray-50" }: { fillClassName?: string }) {
  return (
    <svg
      className={`block w-full h-8 ${fillClassName}`}
      viewBox="0 0 400 32"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0 32 C 60 8, 120 8, 200 18 C 280 28, 340 28, 400 10 V32 H0 Z" />
    </svg>
  );
}

export function EmptyCrateIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="26" width="48" height="26" rx="3" className="stroke-brand-300" strokeWidth="2.5" />
      <path d="M8 34h48M8 42h48M20 26v26M32 26v26M44 26v26" className="stroke-brand-200" strokeWidth="2" />
      <path d="M14 26 L22 12 H42 L50 26" className="stroke-brand-300" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="32" cy="10" r="4" className="fill-accent-400" />
    </svg>
  );
}
