/**
 * Logo — the هستی brand mark.
 *
 * A minimalist geometric composition: an AI neural node (hub + spokes +
 * peripheral nodes) fused with a Persian eight-pointed octagram, on a
 * deep-indigo plaque, in the brand palette:
 *   Deep Indigo  #1a1a3e  — background
 *   Electric Cyan #00e5ff  — main shape
 *   Warm Amber   #ffb300  — accents
 */

type LogoProps = {
  size?: number;
  className?: string;
  title?: string;
};

export default function Logo({ size = 44, className = "", title = "هستی" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <title>{title}</title>

      <defs>
        {/* deep-indigo plaque */}
        <linearGradient id="logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#26245c" />
          <stop offset="0.55" stopColor="#1a1a3e" />
          <stop offset="1" stopColor="#12122e" />
        </linearGradient>

        {/* neutral inner glow */}
        <radialGradient id="logo-glow" cx="0.5" cy="0.5" r="0.55">
          <stop offset="0" stopColor="#00e5ff" stopOpacity="0.5" />
          <stop offset="0.55" stopColor="#00e5ff" stopOpacity="0.12" />
          <stop offset="1" stopColor="#00e5ff" stopOpacity="0" />
        </radialGradient>

        {/* electric cyan sweep */}
        <linearGradient id="logo-cyan" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8af4ff" />
          <stop offset="0.5" stopColor="#00e5ff" />
          <stop offset="1" stopColor="#0097b2" />
        </linearGradient>

        {/* warm amber accent */}
        <linearGradient id="logo-amber" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffdf6b" />
          <stop offset="0.6" stopColor="#ffb300" />
          <stop offset="1" stopColor="#e65100" />
        </linearGradient>
      </defs>

      {/* plaque */}
      <rect
        x="5"
        y="5"
        width="86"
        height="86"
        rx="24"
        fill="url(#logo-bg)"
        stroke="#ffffff"
        strokeOpacity="0.10"
        strokeWidth="1"
      />

      {/* Persian eight-pointed octagram backdrop */}
      <g stroke="#00e5ff" strokeOpacity="0.30" strokeWidth="1.1" fill="none">
        <polygon points="48,11 85,48 48,85 11,48" />
        <rect x="21.4" y="21.4" width="53.2" height="53.2" />
      </g>

      {/* soft inner glow */}
      <circle cx="48" cy="48" r="17" fill="url(#logo-glow)" />

      {/* neural spokes (six) */}
      <g stroke="#00e5ff" strokeOpacity="0.85" strokeWidth="1.6" strokeLinecap="round">
        <line x1="48" y1="48" x2="48" y2="17.5" />
        <line x1="48" y1="48" x2="70.9" y2="32.6" />
        <line x1="48" y1="48" x2="70.9" y2="63.4" />
        <line x1="48" y1="48" x2="48" y2="78.5" />
        <line x1="48" y1="48" x2="25.1" y2="63.4" />
        <line x1="48" y1="48" x2="25.1" y2="32.6" />
      </g>

      {/* neural nodes — five cyan, two amber accents */}
      <g stroke="#ffffff" strokeOpacity="0.45" strokeWidth="0.9">
        <circle cx="48" cy="17.5" r="3.6" fill="#00e5ff" />
        <circle cx="70.9" cy="32.6" r="3.6" fill="#00e5ff" />
        <circle cx="70.9" cy="63.4" r="3.9" fill="#ffb300" />
        <circle cx="48" cy="78.5" r="3.6" fill="#00e5ff" />
        <circle cx="25.1" cy="63.4" r="3.9" fill="#ffb300" />
        <circle cx="25.1" cy="32.6" r="3.6" fill="#00e5ff" />
      </g>

      {/* hub: mini octagram with rotating-faceted cyan prism */}
      <g>
        <rect x="36.5" y="36.5" width="23" height="23" rx="4.5" fill="url(#logo-cyan)" stroke="#e6fdff" strokeOpacity="0.65" strokeWidth="1" />
        <rect x="36.5" y="36.5" width="23" height="23" rx="4.5" fill="url(#logo-cyan)" stroke="#e6fdff" strokeOpacity="0.65" strokeWidth="1" transform="rotate(45 48 48)" />
      </g>

      {/* amber neural core (gentle heartbeat) */}
      <circle cx="48" cy="48" r="3.4" fill="url(#logo-amber)">
        <animate attributeName="r" values="3.2;4.1;3.2" dur="2.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.75;1;0.75" dur="2.6s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
