// Inline SVG art — crisp at any size, no image files needed.
// A role with an artPath in ROLE_REGISTRY renders that image instead.
import { ROLE_REGISTRY } from "@werewolf/shared";

export function WolfMoon({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden>
      <defs>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#fbbf24" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="moonFace" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="52" r="46" fill="url(#moonGlow)" />
      <circle cx="60" cy="52" r="26" fill="url(#moonFace)" />
      <circle cx="51" cy="45" r="5" fill="#d97706" opacity="0.35" />
      <circle cx="67" cy="58" r="7" fill="#d97706" opacity="0.28" />
      <circle cx="63" cy="40" r="3.4" fill="#d97706" opacity="0.3" />
      {/* wolf silhouette howling */}
      <path
        d="M30 108 C34 96 36 88 44 82 L48 72 C49 69 51 68 53 66 L54 60 L58 64 L62 62 L64 56 L67 61 L74 64 C80 66 84 71 86 78 L90 92 C91 98 89 104 86 108 Z"
        fill="#160a0e"
        stroke="#cf5c28"
        strokeWidth="1.2"
        strokeOpacity="0.6"
      />
      <circle cx="59.5" cy="59.5" r="1.3" fill="#cf5c28">
        <animate attributeName="opacity" values="1;0.35;1" dur="3s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

export function ClawMarks({ width = 180 }: { width?: number }) {
  const marks = [
    { x: 10, rot: -18, d: "0s", w: 3 },
    { x: 55, rot: -12, d: "0.25s", w: 2.5 },
    { x: 100, rot: -16, d: "0.5s", w: 3.4 },
  ];
  return (
    <svg width={width} height={width * 0.28} viewBox="0 0 140 40" fill="none" aria-hidden className="claws">
      {marks.map((m, i) => (
        <g key={i}>
          <path
            d={`M${m.x} 4 Q ${m.x + 8} 20 ${m.x + 4} 38`}
            stroke="#cf5c28"
            strokeWidth={m.w}
            strokeLinecap="round"
            transform={`rotate(${m.rot} ${m.x + 6} 20)`}
            opacity="0.75"
          >
            <animate attributeName="opacity" values="0.2;0.85;0.2" dur="2.4s" begin={m.d} repeatCount="indefinite" />
          </path>
          {/* faint parallel scratch beside each mark */}
          <path
            d={`M${m.x + 7} 7 Q ${m.x + 13} 20 ${m.x + 10} 34`}
            stroke="#7c3413"
            strokeWidth="1.4"
            strokeLinecap="round"
            transform={`rotate(${m.rot} ${m.x + 6} 20)`}
            opacity="0.4"
          >
            <animate attributeName="opacity" values="0.1;0.45;0.1" dur="2.4s" begin={m.d} repeatCount="indefinite" />
          </path>
        </g>
      ))}
    </svg>
  );
}

/* ─────────────── role icons ───────────────
   Shared visual language: 24×24 viewBox, rounded strokes,
   blood-red / moon-gold accents on dark fill. */

const STROKE = 1.6;

function Svg({
  size,
  children,
  html,
}: {
  size: number;
  children?: React.ReactNode;
  html?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      dangerouslySetInnerHTML={html ? { __html: html } : undefined}
    >
      {children}
    </svg>
  );
}

export function RoleIcon({ roleId, size = 44 }: { roleId: string; size?: number }) {
  const def = ROLE_REGISTRY[roleId];
  if (def?.artPath) {
    return (
      <img
        src={def.artPath}
        alt=""
        aria-hidden
        width={size}
        height={size}
        style={{ width: size, height: size, objectFit: "contain" }}
      />
    );
  }
  if (def?.roleIcon) {
    // SVG markup is static, first-party data from ROLE_REGISTRY — safe to inject.
    return <Svg size={size} html={def.roleIcon} />;
  }
  // generic hourglass placeholder for unknown roleIds
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="8.5" fill="rgba(176,138,144,0.08)" stroke="#b08a90" strokeWidth={STROKE} />
      <path d="M12 8v4.5l3 2.5M12 8l-3 2.5 3 2" stroke="#b08a90" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="spinner-wrap" role="status" aria-live="polite">
      <svg className="spinner" width="42" height="42" viewBox="0 0 42 42" aria-hidden>
        <circle className="spinner-track" cx="21" cy="21" r="16" fill="none" strokeWidth="4" />
        <circle className="spinner-head" cx="21" cy="21" r="16" fill="none" strokeWidth="4" strokeLinecap="round" />
      </svg>
      {label && <span className="hint">{label}</span>}
    </div>
  );
}
