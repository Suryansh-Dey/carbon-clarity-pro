import { motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { fmt } from "../format";
import { HOW_TO_READ } from "./data";

/** Hazard glyphs in model order: flood, cyclone, drought, heat, earthquake, landslide, coastal. */
const GLYPHS: ReactNode[] = [
  <path
    key="0"
    d="M3 15c3-3 5 3 9 0s6 3 9 0M3 20c3-3 5 3 9 0s6 3 9 0M12 3c3 4 5 6 5 8a5 5 0 0 1-10 0c0-2 2-4 5-8z"
  />,
  <path
    key="1"
    d="M10 12a2 2 0 1 0 4 0a2 2 0 1 0-4 0M12 4a8 8 0 0 1 8 8M12 20a8 8 0 0 1-8-8M7 7a7 7 0 0 1 10 0M7 17a7 7 0 0 0 10 0"
  />,
  <path key="2" d="M3 18h18M5 18l3-4 2 3 3-5 2 4 3-3 1 5M12 3v4M8 5l1 2M16 5l-1 2" />,
  <g key="3">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M5 19l2-2" />
  </g>,
  <path key="4" d="M2 12h4l2-6 3 12 3-9 2 3h6" />,
  <path key="5" d="M3 20L12 5l9 15zM9 14l2 3M14 12l2 4" />,
  <path key="6" d="M3 16c3-3 5 3 9 0s6 3 9 0M12 3v9M8 8l4-5 4 5" />,
];

export function HazardIcon({
  i,
  size = 20,
  className,
}: {
  i: number;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("shrink-0 text-lavender", className)}
    >
      {GLYPHS[i]}
    </svg>
  );
}

/** "How to read this tab" box that closes each tab. */
export function HowToRead({ i }: { i: number }) {
  const h = HOW_TO_READ[i];
  if (!h) return null;
  return (
    <details
      open
      className="group rounded-3xl border border-lavender/15 bg-indigo-cosmic/25 px-5 py-4 text-[13px] leading-relaxed text-muted-foreground sm:px-7"
    >
      <summary className="cursor-pointer list-none font-semibold text-white">
        <span className="mr-2 inline-block text-lavender transition-transform group-open:rotate-90">
          ›
        </span>
        How to read this tab
      </summary>
      <p className="mt-3">
        <b className="text-white">Why we do this.</b> {h[0]}
      </p>
      <p className="mt-2">
        <b className="text-white">How to interpret.</b> {h[1]}
      </p>
    </details>
  );
}

/** Two-tone colours for physical and transition cost (brand hue, validated as an ordinal pair). */
export const PHYS = "#736CED";
export const TRANS = "#c9c7fa";

export function CostLegend() {
  return (
    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
      {(
        [
          [PHYS, "Physical"],
          [TRANS, "Transition"],
        ] as const
      ).map(([c, n]) => (
        <span key={n} className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-[3px]" style={{ background: c }} />
          {n}
        </span>
      ))}
    </div>
  );
}

/** Stacked annual-cost columns (physical below, transition above) with a hover readout. */
export function CostBars({
  bars,
  label,
}: {
  bars: { name: string; sub?: string; phys: number; tr: number }[];
  label: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 520,
    H = 230,
    base = 180,
    span = 150;
  const mx = Math.max(...bars.map((b) => b.phys + b.tr), 1e-9);
  const step = (W - 40) / bars.length,
    bw = Math.min(90, step * 0.56);
  const hv = hover != null ? bars[hover] : null;
  return (
    <div className="relative">
      <CostLegend />
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-3 block h-auto w-full"
        role="img"
        aria-label={label}
      >
        <line x1={20} x2={W - 20} y1={base} y2={base} stroke="rgb(255 255 255 / 0.12)" />
        {bars.map((b, i) => {
          const cx = 20 + step * (i + 0.5),
            hp = (b.phys / mx) * span,
            ht = (b.tr / mx) * span,
            x = cx - bw / 2;
          return (
            <g
              key={b.name}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="cursor-default"
            >
              <rect x={cx - step / 2} y={0} width={step} height={H} fill="transparent" />
              <motion.rect
                x={x}
                width={bw}
                rx={4}
                fill={PHYS}
                initial={{ y: base, height: 0 }}
                animate={{ y: base - hp, height: hp }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />
              {ht > 0.5 && (
                <motion.rect
                  x={x}
                  width={bw}
                  rx={4}
                  fill={TRANS}
                  stroke="#0d0e20"
                  strokeWidth={2}
                  initial={{ y: base, height: 0 }}
                  animate={{ y: base - hp - ht, height: ht }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
              <text
                x={cx}
                y={base - hp - ht - 8}
                textAnchor="middle"
                className="fill-white text-[13px] font-semibold"
              >
                ₹{fmt(b.phys + b.tr)} cr
              </text>
              <text x={cx} y={base + 18} textAnchor="middle" className="fill-[#8E92AA] text-[12px]">
                {b.name}
              </text>
              {b.sub && (
                <text
                  x={cx}
                  y={base + 33}
                  textAnchor="middle"
                  className="fill-[#8E92AA] text-[11px]"
                >
                  {b.sub}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hv && (
        <div className="pointer-events-none absolute right-0 top-0 rounded-2xl border border-white/10 bg-midnight/95 px-4 py-3 text-xs shadow-[0_20px_50px_-20px_rgb(0_0_0/0.9)] backdrop-blur">
          <p className="font-semibold text-white">{hv.name}</p>
          <p className="mt-1 text-muted-foreground">
            Physical <b className="text-white">₹ {fmt(hv.phys, 2)} cr</b>
          </p>
          <p className="text-muted-foreground">
            Transition <b className="text-white">₹ {fmt(hv.tr, 2)} cr</b>
          </p>
        </div>
      )}
    </div>
  );
}

/** Inline magnitude bar for table cells. */
export function CellBar({ share }: { share: number }) {
  return (
    <div className="mt-1.5 h-1.5 w-full min-w-16 overflow-hidden rounded-full bg-white/[0.06]">
      <div
        className="h-full rounded-full bg-periwinkle"
        style={{ width: `${Math.max(0, Math.min(1, share)) * 100}%` }}
      />
    </div>
  );
}

export function Slider({
  label,
  value,
  max,
  onChange,
}: {
  label: ReactNode;
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block text-sm text-muted-foreground">
      <span className="flex items-baseline justify-between gap-3">
        <span>{label}</span>
        <b className="font-display text-lg text-white">{value}</b>
      </span>
      <input
        type="range"
        min={0}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-periwinkle"
      />
    </label>
  );
}

export const linkCls =
  "font-semibold text-lavender underline decoration-lavender/30 underline-offset-4 transition-colors hover:text-white";
