import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Callout, Pill } from "@/components/observatory/ui";

/** Five-step risk ramp on the brand hue, validated for order and contrast on the dark surface. */
export const RISK = ["#3d399f", "#504abf", "#6861dc", "#928df3", "#c9c7fa"];
const RISK_INK = ["#ffffff", "#ffffff", "#ffffff", "#0a0b1a", "#0a0b1a"];
const step = (v: number) => Math.min(5, Math.max(1, Math.round(v))) - 1;
export const riskColor = (v: number) => RISK[step(v)];

const EASE = [0.22, 1, 0.36, 1] as const;

export function Card({
  title,
  sub,
  how,
  className,
  children,
}: {
  title?: ReactNode;
  sub?: ReactNode;
  how?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24, rotateX: 8 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: EASE }}
      style={{ transformPerspective: 1200, transformOrigin: "50% 0%" }}
      className={cn("glass min-w-0 rounded-3xl p-5 sm:p-7", className)}
    >
      {title && (
        <h3 className="text-balance font-sans text-lg font-semibold leading-snug text-white">
          {title}
        </h3>
      )}
      {sub && <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{sub}</p>}
      {children != null && <div className={title || sub ? "mt-5" : undefined}>{children}</div>}
      {how && <How className="mt-5">{how}</How>}
    </motion.section>
  );
}

export function How({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-lavender/15 bg-indigo-cosmic/30 px-4 py-3 text-[13px] leading-relaxed text-muted-foreground [&_b]:font-semibold [&_b]:text-white",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Table({
  head,
  rows,
  num,
  minWidth = 560,
}: {
  head: ReactNode[];
  rows: ReactNode[][];
  /** Columns to right-align as numbers. */
  num?: number[];
  minWidth?: number;
}) {
  const right = (j: number) => num?.includes(j);
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
      <table className="w-full border-collapse text-left text-[13px]" style={{ minWidth }}>
        <thead>
          <tr className="bg-white/[0.04]">
            {head.map((h, j) => (
              <th
                key={j}
                className={cn(
                  "px-3 py-2.5 align-bottom text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground",
                  right(j) && "text-right",
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className="border-t border-white/[0.06] transition-colors hover:bg-white/[0.025]"
            >
              {r.map((c, j) => (
                <td
                  key={j}
                  className={cn(
                    "px-3 py-2.5 align-top",
                    j === 0 ? "text-white" : "text-muted-foreground",
                    right(j) && "text-right tabular-nums",
                  )}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A value on the risk ramp; the colour follows `level`, the text shows the value. */
export function Score({
  level,
  children,
  className,
}: {
  level: number;
  children?: ReactNode;
  className?: string;
}) {
  const i = step(level);
  return (
    <span
      className={cn(
        "block min-w-12 rounded-lg px-2 py-1 text-center font-semibold tabular-nums",
        className,
      )}
      style={{ background: RISK[i], color: RISK_INK[i] }}
    >
      {children ?? level.toFixed(1)}
    </span>
  );
}

export function Band({ v }: { v: number }) {
  return v >= 3.5 ? (
    <Pill tone="bad">Hotspot</Pill>
  ) : v >= 2.5 ? (
    <Pill tone="warn">Watch</Pill>
  ) : (
    <Pill tone="good">Low</Pill>
  );
}

export function RiskLegend({ low, high }: { low: string; high: string }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-muted-foreground">
      <span className="mr-1">{low}</span>
      {RISK.map((c) => (
        <span key={c} className="h-3 w-7 rounded-[4px]" style={{ background: c }} />
      ))}
      <span className="ml-1">{high}</span>
    </div>
  );
}

export function Bullets({ items, className }: { items: ReactNode[]; className?: string }) {
  return (
    <ul className={cn("space-y-2 text-sm leading-relaxed text-muted-foreground", className)}>
      {items.map((x, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lavender/70" />
          <span className="[&_b]:text-white">{x}</span>
        </li>
      ))}
    </ul>
  );
}

export function Stat({
  label,
  value,
  sub,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 font-display text-2xl leading-tight text-white">{value}</div>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

/** Horizontal bar with a label and a value, used for single-series magnitudes. */
export function BarRow({
  label,
  share,
  value,
}: {
  label: ReactNode;
  share: number;
  value: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(96px,200px)_minmax(0,1fr)_auto] items-center gap-3 py-1.5 text-[13px]">
      <span className="text-muted-foreground">{label}</span>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="h-full rounded-full bg-periwinkle"
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(1, share)) * 100}%` }}
          transition={{ duration: 0.7, ease: EASE }}
        />
      </div>
      <b className="text-right font-semibold tabular-nums text-white">{value}</b>
    </div>
  );
}

export function EventList({ items }: { items: { y: ReactNode; t: ReactNode; d: ReactNode }[] }) {
  return (
    <ol className="relative ml-2 border-l border-lavender/20">
      {items.map((e, i) => (
        <li key={i} className="relative pb-5 pl-6 last:pb-0">
          <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-periwinkle shadow-[0_0_12px_rgb(115_108_237/0.9)]" />
          <p className="text-xs font-semibold tabular-nums text-lavender">
            {e.y} · <span className="text-muted-foreground">{e.t}</span>
          </p>
          <p className="mt-1 text-sm leading-relaxed text-white/90">{e.d}</p>
        </li>
      ))}
    </ol>
  );
}

export function Grid({ cols = 2, children }: { cols?: 2 | 3 | 4; children: ReactNode }) {
  return (
    <div
      className={cn(
        "grid gap-5",
        cols === 2 && "lg:grid-cols-2",
        cols === 3 && "md:grid-cols-2 xl:grid-cols-3",
        cols === 4 && "grid-cols-2 lg:grid-cols-4",
      )}
    >
      {children}
    </div>
  );
}

export function SubHead({ children }: { children: ReactNode }) {
  return (
    <h4 className="mb-3 mt-6 font-sans text-sm font-semibold text-white first:mt-0">{children}</h4>
  );
}

export function ModuleIntro({
  title,
  text,
  note,
}: {
  title: string;
  text: ReactNode;
  note: ReactNode;
}) {
  return (
    <div className="mb-8">
      <h2 className="font-display text-4xl leading-[1.05] text-white sm:text-5xl">{title}</h2>
      <p className="mt-4 max-w-4xl text-base leading-relaxed text-muted-foreground">{text}</p>
      <Callout className="mt-6">{note}</Callout>
    </div>
  );
}
