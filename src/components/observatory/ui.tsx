import { motion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  badge,
  subtitle,
  className,
  children,
}: {
  title?: ReactNode;
  badge?: ReactNode;
  subtitle?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("glass glow-border rounded-3xl p-6 sm:p-7", className)}>
      {(title || badge) && (
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className="font-sans text-lg font-semibold text-white">{title}</h2>}
          {badge}
        </div>
      )}
      {subtitle && <p className="mb-4 text-xs text-muted-foreground">{subtitle}</p>}
      {children}
    </div>
  );
}

type Tone = "default" | "good" | "warn" | "bad" | "muted";
const TONES: Record<Tone, string> = {
  default: "border-periwinkle/30 bg-periwinkle/15 text-lavender",
  good: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  warn: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  bad: "border-rose-400/30 bg-rose-400/10 text-rose-300",
  muted: "border-white/10 bg-white/[0.04] text-muted-foreground",
};

export function Pill({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Kpi({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border p-6",
        highlight
          ? "border-periwinkle/40 bg-gradient-to-br from-periwinkle/30 via-indigo-cosmic/60 to-midnight shadow-[0_20px_60px_-30px_rgb(115_108_237/0.9)]"
          : "glass",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <motion.div
        key={String(value)}
        initial={{ opacity: 0, rotateX: -60, y: 8 }}
        animate={{ opacity: 1, rotateX: 0, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformPerspective: 600, transformOrigin: "50% 100%" }}
        className="mt-3 font-display text-2xl leading-tight text-white sm:text-3xl"
      >
        {value}
      </motion.div>
      {sub && <div className="mt-2 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

const fieldCls =
  "mt-2 block h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-white outline-none transition-colors focus:border-periwinkle focus:bg-white/[0.05]";

export function SelectField({
  label,
  className,
  children,
  ...rest
}: { label: string } & ComponentProps<"select">) {
  return (
    <label className={cn("block min-w-0", className)}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <select className={cn(fieldCls, "flex items-center justify-between gap-2 pr-3")} {...rest}>
        {children}
      </select>
    </label>
  );
}

export function InputField({
  label,
  className,
  ...rest
}: { label: string } & ComponentProps<"input">) {
  return (
    <label className={cn("block min-w-0", className)}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <input className={fieldCls} {...rest} />
    </label>
  );
}

export function GhostButton({ className, children, ...rest }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-5 text-sm font-semibold text-white transition-all hover:border-lavender/50 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function PrimaryButton({ className, children, ...rest }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-periwinkle px-5 text-sm font-semibold text-white shadow-[0_12px_40px_-12px_rgb(115_108_237/0.95)] transition-all hover:-translate-y-0.5 hover:bg-[#8580f0] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Meter({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-periwinkle to-lavender shadow-[0_0_12px_rgb(115_108_237/0.8)]"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

export function Callout({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-lavender/20 bg-indigo-cosmic/30 p-4 text-sm leading-relaxed text-muted-foreground [&_a]:text-lavender [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-white [&_b]:text-white",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DataTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-white/[0.04]">
            {head.map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
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
              className="border-t border-white/[0.06] transition-colors hover:bg-white/[0.02]"
            >
              {r.map((c, j) => (
                <td
                  key={j}
                  className={cn(
                    "px-4 py-3.5 align-top",
                    j === 0 ? "text-white" : "text-muted-foreground",
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

export function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-lavender underline decoration-lavender/30 underline-offset-4 transition-colors hover:text-white"
    >
      {children} ↗
    </a>
  );
}

export function TabIntro({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 pb-2 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-lavender">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-4xl leading-[1.05] text-white sm:text-5xl">
          {title}
        </h2>
        {text && <p className="mt-4 text-base leading-relaxed text-muted-foreground">{text}</p>}
      </div>
      {action}
    </div>
  );
}
