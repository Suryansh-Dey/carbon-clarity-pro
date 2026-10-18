import { Link, type LinkProps } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./motion";

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-lavender",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-periwinkle shadow-[0_0_12px_2px_rgb(115_108_237/0.8)]" />
      {children}
    </span>
  );
}

/**
 * Two-line editorial heading: first line white, second line gradient italic.
 */
export function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
  align = "left",
  className,
  children,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  accent?: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Reveal
      className={cn("max-w-3xl space-y-5", align === "center" && "mx-auto text-center", className)}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="text-balance font-display text-4xl font-normal leading-[1.08] text-white sm:text-5xl">
        {title}
        {accent && (
          <>
            <br />
            <span className="text-gradient italic">{accent}</span>
          </>
        )}
      </h2>
      {description && (
        <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p>
      )}
      {children}
    </Reveal>
  );
}

export function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn("relative scroll-mt-24 py-24 sm:py-32", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

export function GlassCard({ className, children, ...rest }: ComponentProps<"div">) {
  return (
    <div className={cn("glass glow-border rounded-3xl", className)} {...rest}>
      {children}
    </div>
  );
}

const primaryCls =
  "group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-periwinkle px-7 text-sm font-semibold text-white shadow-[0_12px_40px_-12px_rgb(115_108_237/0.95)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#8580f0] hover:shadow-[0_18px_50px_-12px_rgb(115_108_237/1)] active:translate-y-0";
const ghostCls =
  "group inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-7 text-sm font-semibold text-white backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-lavender/50 hover:bg-white/[0.06]";

type Variant = "primary" | "ghost";

/** Internal CTA link styled as a pill button. */
export function CtaLink({
  to,
  hash,
  variant = "primary",
  className,
  children,
}: {
  to: LinkProps["to"];
  hash?: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      hash={hash}
      className={cn(variant === "primary" ? primaryCls : ghostCls, className)}
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}

/** External CTA link that opens in a new tab. */
export function CtaExternal({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(variant === "primary" ? primaryCls : ghostCls, className)}
    >
      {children}
      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </a>
  );
}

/** Small inline text link with arrow (internal or external). */
export function TextLink({
  to,
  hash,
  href,
  children,
  className,
}: {
  to?: LinkProps["to"];
  hash?: string;
  href?: string;
  children: ReactNode;
  className?: string;
}) {
  const cls = cn(
    "group inline-flex items-center gap-1.5 text-sm font-semibold text-lavender transition-colors hover:text-white",
    className,
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </a>
    );
  }
  return (
    <Link to={to} hash={hash} className={cls}>
      {children}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

/** Small numbered index chip, e.g. "01". */
export function IndexChip({ n, className }: { n: number | string; className?: string }) {
  return (
    <span
      className={cn("font-mono text-xs font-semibold tracking-widest text-lavender/80", className)}
    >
      {typeof n === "number" ? String(n).padStart(2, "0") : n}
    </span>
  );
}

/** Muted disclaimer / note block. */
export function Note({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-xs leading-relaxed text-muted-foreground/80", className)}>{children}</p>
  );
}

/** Hero block for inner pages. */
export function PageHero({
  eyebrow,
  title,
  accent,
  description,
  children,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  accent?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden pb-16 pt-36 sm:pb-24 sm:pt-44">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-indigo-cosmic/70 blur-[120px]"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-4xl space-y-6">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="text-balance font-display text-5xl font-normal leading-[1.04] text-white sm:text-6xl lg:text-7xl">
            {title}
            {accent && (
              <>
                <br />
                <span className="text-gradient italic">{accent}</span>
              </>
            )}
          </h1>
          {description && (
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">{description}</p>
          )}
          {children}
        </Reveal>
      </div>
    </section>
  );
}
