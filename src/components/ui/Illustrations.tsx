import { cn } from "@/lib/cn";

/** Original laurel branch: paired leaves along a curved stem. Mirror for the right side. */
export function Laurel({ mirror = false, className }: { mirror?: boolean; className?: string }) {
  const P0 = [72, 196], P1 = [-4, 112], P2 = [56, 8];
  const at = (t: number) => {
    const u = 1 - t;
    const x = u * u * P0[0] + 2 * u * t * P1[0] + t * t * P2[0];
    const y = u * u * P0[1] + 2 * u * t * P1[1] + t * t * P2[1];
    const dx = 2 * u * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0]);
    const dy = 2 * u * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1]);
    return { x, y, a: (Math.atan2(dy, dx) * 180) / Math.PI };
  };
  const leaves = Array.from({ length: 8 }, (_, i) => {
    const t = 0.1 + i * 0.115;
    return { ...at(t), s: 1 - t * 0.35 };
  });
  const tip = at(1);
  return (
    <svg viewBox="-8 -14 104 216" className={cn("text-star", mirror && "-scale-x-100", className)} aria-hidden fill="currentColor">
      <path d={`M${P0[0]} ${P0[1]} Q${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`} stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {leaves.map((l, i) => (
        <g key={i} transform={`translate(${l.x.toFixed(1)} ${l.y.toFixed(1)}) scale(${l.s.toFixed(2)})`}>
          <ellipse cx="12" cy="0" rx="12" ry="4.8" transform={`rotate(${(l.a - 42).toFixed(1)})`} />
          <ellipse cx="12" cy="0" rx="12" ry="4.8" transform={`rotate(${(l.a + 42).toFixed(1)})`} opacity="0.8" />
        </g>
      ))}
      <ellipse cx="10" cy="0" rx="10" ry="4.2" transform={`translate(${tip.x.toFixed(1)} ${tip.y.toFixed(1)}) rotate(${tip.a.toFixed(1)})`} />
    </svg>
  );
}

/** Original circular guarantee seal with the mascot at the centre. */
export function Seal({ size = 150, className }: { size?: number; className?: string }) {
  const teeth = 28;
  const pts = Array.from({ length: teeth * 2 }, (_, i) => {
    const a = (i / (teeth * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? 74 : 68;
    return `${75 + Math.cos(a) * r},${75 + Math.sin(a) * r}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 150 150" width={size} height={size} className={className} role="img" aria-label="grant.ai guarantee seal">
      <defs>
        <path id="seal-text" d="M75,75 m-50,0 a50,50 0 1,1 100,0 a50,50 0 1,1 -100,0" />
      </defs>
      <polygon points={pts} fill="#F3B105" />
      <circle cx="75" cy="75" r="62" fill="#FFF4D9" />
      <circle cx="75" cy="75" r="60" fill="none" stroke="#F3B105" strokeWidth="2" strokeDasharray="3 4" />
      <text fontSize="11" fontWeight="800" letterSpacing="3" fill="#A36F00" fontFamily="var(--font-nunito)">
        <textPath href="#seal-text">GRANT.AI · ҰБТ · КЕПІЛДІК · ЕНТ · ГАРАНТИЯ ·</textPath>
      </text>
      <g transform="translate(53 61)">
        <rect width="44" height="32" rx="16" fill="#FF4B3C" />
        <rect x="7" y="8" width="30" height="16" rx="8" fill="#fff" />
        <circle cx="17" cy="14.5" r="1.9" fill="#030A19" />
        <circle cx="27" cy="14.5" r="1.9" fill="#030A19" />
        <path d="M18.5 18.6c2 1.8 5 1.8 7 0" stroke="#030A19" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

/** Placeholder organisation logo mark (generic shapes, no third-party marks). */
export function PlaceholderLogo({ i }: { i: number }) {
  const shapes = [
    <circle key="c" cx="14" cy="14" r="10" />,
    <rect key="r" x="4" y="4" width="20" height="20" rx="5" />,
    <polygon key="p" points="14,3 25,24 3,24" />,
    <path key="h" d="M4 14a10 10 0 0 1 20 0v10H4z" />,
  ];
  const colors = ["#135EF2", "#FF4B3C", "#049AEE", "#F56207", "#F3B105", "#D67BDD", "#12B76A"];
  return (
    <span className="inline-flex items-center gap-2 text-[16px] font-extrabold text-ink">
      <svg viewBox="0 0 28 28" width="28" height="28" fill={colors[i % colors.length]} aria-hidden>
        {shapes[i % shapes.length]}
      </svg>
      [LOGO {i + 1}]
    </span>
  );
}
