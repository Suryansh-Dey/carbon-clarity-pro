import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  BarChart3,
  CloudLightning,
  FileCheck2,
  GraduationCap,
  HeartHandshake,
  Layers,
  Scale,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { HeroCanvas } from "@/components/site/hero-canvas";
import { Reveal, Stagger, StaggerItem, Tilt } from "@/components/site/motion";
import {
  CtaExternal,
  CtaLink,
  Eyebrow,
  GlassCard,
  IndexChip,
  Note,
  Section,
  SectionHeading,
  TextLink,
} from "@/components/site/ui";
import { PRODUCTS, SECTORS, SMART_DECARB_URL } from "@/components/site/content";
import { ContactBand } from "@/components/site/contact-band";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: "CliSo Tech — Climate ambition, put into action" },
      {
        name: "description",
        content:
          "Technology and specialist advisory to help MSMEs, enterprises and financial institutions measure emissions, prioritise decarbonization and create lasting value for people and the planet.",
      },
      { property: "og:title", content: "CliSo Tech — Sustainability made clear" },
    ],
  }),
  component: HomePage,
});

const PRODUCT_ICONS = [BarChart3, Scale, ShieldCheck, GraduationCap, HeartHandshake];

const TICKER = [
  "Measure with clarity",
  "Act with purpose",
  "Track your impact",
  "SEBI BRSR Core: 9 Essential Indicators & Reasonable Assurance",
  "EU CBAM Regulation 2023/956: Definitive Period Transition Ready",
  "India CEA v19 Baseline: 0.716 kg CO₂/kWh Integrated",
  "ASSA 5010 Alignment: Cryptographic SHA-256 Audit Lineage",
  "GRI 303 & ZLD: Zero Liquid Discharge Tracking",
];

function HomePage() {
  return (
    <>
      <Hero />
      <Ticker />
      <EarthSection />
      <ProductsSection />
      <PlatformTeaser />
      <ClimateRiskTeaser />
      <SectorsSection />
      <AboutTeaser />
      <ContactBand />
    </>
  );
}

function Hero() {
  const words = ["Climate", "ambition"];
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pb-16 pt-32">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-50" />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-48 -top-48 h-[640px] w-[640px] rounded-full bg-indigo-cosmic blur-[140px]"
      />
      <HeroCanvas className="pointer-events-auto absolute inset-0 opacity-40 sm:opacity-60 lg:left-[42%] lg:opacity-100" />

      <div className="relative mx-auto grid w-full max-w-7xl px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="space-y-8 lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Eyebrow>Technology. Sustainability. Shared impact.</Eyebrow>
          </motion.div>

          <div className="space-y-3">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg font-medium text-muted-foreground"
            >
              Sustainability made clear.
            </motion.p>
            <h1 className="font-display text-6xl font-normal leading-[0.98] tracking-tight text-white sm:text-7xl lg:text-8xl">
              <span className="block" style={{ perspective: 800 }}>
                {words.map((w, i) => (
                  <motion.span
                    key={w}
                    className="mr-[0.25em] inline-block"
                    initial={{ opacity: 0, rotateX: -90, y: 30 }}
                    animate={{ opacity: 1, rotateX: 0, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformOrigin: "50% 100%" }}
                  >
                    {w}
                  </motion.span>
                ))}
              </span>
              <motion.span
                className="text-gradient block pb-2 italic"
                initial={{ opacity: 0, rotateX: -60, y: 40 }}
                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformPerspective: 800, transformOrigin: "50% 100%" }}
              >
                put into action.
              </motion.span>
            </h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75 }}
            className="max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            Technology and specialist advisory to help MSMEs, enterprises and financial institutions
            measure emissions, prioritise decarbonization and create lasting value for people and
            the planet.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <CtaExternal href={SMART_DECARB_URL}>Explore Smart Decarbonization</CtaExternal>
            <CtaLink to="/contact" variant="ghost">
              Let’s talk
            </CtaLink>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="grid max-w-xl grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10"
          >
            {[
              ["Measure", "with clarity"],
              ["Act", "with purpose"],
              ["Track", "your impact"],
            ].map(([a, b]) => (
              <div key={a} className="bg-void/80 px-4 py-4 backdrop-blur">
                <div className="font-display text-xl text-white">{a}</div>
                <div className="text-xs text-muted-foreground">{b}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Ticker() {
  const items = [...TICKER, ...TICKER];
  return (
    <div className="relative overflow-hidden border-y border-white/[0.06] bg-midnight/60 py-4">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-void to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-void to-transparent" />
      <div className="animate-marquee gap-10 whitespace-nowrap text-sm">
        {items.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-10">
            <span
              className={cn(
                i % TICKER.length < 3
                  ? "font-display text-base italic text-white"
                  : "text-muted-foreground",
              )}
            >
              {t}
            </span>
            <Sparkles className="h-3.5 w-3.5 text-periwinkle" />
          </span>
        ))}
      </div>
    </div>
  );
}

function EarthSection() {
  return (
    <section className="relative overflow-hidden py-28 sm:py-36">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div
          className="relative mx-auto aspect-square w-full max-w-[520px]"
          style={{ perspective: 1200 }}
        >
          <div className="absolute inset-[-12%] rounded-full bg-periwinkle/20 blur-[90px]" />
          <div className="animate-orbit absolute inset-[-6%] rounded-full border border-dashed border-lavender/25" />
          <div className="absolute inset-[-14%] rounded-full border border-white/[0.06]" />
          {/* Slow full turn in the image plane; the shading overlay stays fixed */}
          <img
            src="/images/earth-nasa.jpg"
            alt="Earth from space, Blue Marble"
            loading="lazy"
            className="animate-earth-spin relative h-full w-full rounded-full object-cover shadow-[0_0_120px_-20px_rgb(115_108_237/0.8)]"
          />
          <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,transparent_45%,rgb(3_3_6/0.85)_75%)]" />
        </div>
        <Reveal className="space-y-6">
          <Eyebrow>Connecting data, decisions & impact</Eyebrow>
          <h2 className="font-display text-4xl leading-tight text-white sm:text-5xl">
            Our world.
            <br />
            <span className="text-gradient italic">Our shared responsibility.</span>
          </h2>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            CliSo / People &amp; Planet
          </p>
          <Note>
              Earth: Blue Marble
          </Note>
        </Reveal>
      </div>
    </section>
  );
}

function ProductsSection() {
  return (
    <Section id="products">
      <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <SectionHeading
          eyebrow="Our products & services"
          title="Measure. Prioritise. Act."
          accent="Create lasting impact."
          description="Connected technology and advisory, from your first ESG assessment to implementation across your value chain."
        />
        <Reveal>
          <CtaLink to="/services" variant="ghost">
            All services
          </CtaLink>
        </Reveal>
      </div>

      <Stagger className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-6">
        {PRODUCTS.map((p, i) => {
          const Icon = PRODUCT_ICONS[i];
          return (
            <StaggerItem key={p.title} className={cn(i < 2 ? "lg:col-span-3" : "lg:col-span-2")}>
              <Tilt className="h-full rounded-3xl">
                <GlassCard className="flex h-full flex-col justify-between gap-10 p-8">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-indigo-cosmic/70 text-lavender shadow-[0_0_30px_-8px_rgb(115_108_237/0.8)]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <IndexChip n={i + 1} />
                    </div>
                    <h3 className="font-display text-2xl text-white">{p.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                  </div>
                  <TextLink to={p.to} hash={p.hash} href={p.href}>
                    {p.cta}
                  </TextLink>
                </GlassCard>
              </Tilt>
            </StaggerItem>
          );
        })}
      </Stagger>
    </Section>
  );
}

function PlatformTeaser() {
  const steps = [
    {
      icon: Upload,
      t: "Collect",
      d: "Bring together electricity bills, fuel records and operational activity data.",
    },
    {
      icon: Layers,
      t: "Calculate",
      d: "Organise emissions and resource information into connected ledgers.",
    },
    { icon: FileCheck2, t: "Report", d: "Prepare disclosures and supporting evidence for review." },
  ];
  return (
    <Section id="platform" className="overflow-hidden">
      <div className="grid items-center gap-16 lg:grid-cols-2">
        <SectionHeading
          eyebrow="Featured digital tool / Climate Social Mumbai"
          title="Carbon & resource intelligence."
          accent="One connected platform."
        >
          <p className="text-lg leading-relaxed text-muted-foreground">
            Meet <strong className="font-semibold text-white">clisomumbai</strong> — our digital
            platform for enterprise greenhouse-gas accounting, sustainability reporting and resource
            management.
          </p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <CtaLink to="/platform">Explore the digital platform</CtaLink>
            <CtaLink to="/calculator" variant="ghost">
              Open the calculator
            </CtaLink>
          </div>
          <Note>The calculator workspace requires Google sign-in.</Note>
        </SectionHeading>

        <div className="relative" style={{ perspective: 1400 }}>
          <div className="absolute -inset-10 rounded-full bg-periwinkle/15 blur-[100px]" />
          <Reveal tilt={25} className="relative">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-lavender">
              From activity to evidence
            </p>
            <div className="space-y-4" style={{ transformStyle: "preserve-3d" }}>
              {steps.map((s, i) => (
                <motion.div
                  key={s.t}
                  initial={{ opacity: 0, rotateY: -30, x: 60, z: -100 }}
                  whileInView={{ opacity: 1, rotateY: -8, x: i * 24, z: 0 }}
                  whileHover={{ rotateY: 0, x: i * 24 + 6, scale: 1.02 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.15 * i, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformPerspective: 1200 }}
                >
                  <GlassCard className="flex items-start gap-5 p-6">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-periwinkle text-white shadow-[0_0_30px_-6px_rgb(115_108_237/1)]">
                      <s.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-3">
                        <IndexChip n={i + 1} />
                        <h3 className="font-sans text-lg font-semibold text-white">{s.t}</h3>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

function ClimateRiskTeaser() {
  const items = [
    "Event evidence",
    "Scenarios & exposure",
    "Financial assessment",
    "Management & sources",
  ];
  return (
    <Section>
      <Reveal>
        <GlassCard className="relative overflow-hidden p-8 sm:p-14">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-periwinkle/25 blur-[100px]" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-5">
              <Eyebrow>Climate risk assessment / CliSo Observatory</Eyebrow>
              <h2 className="font-display text-4xl leading-tight text-white sm:text-5xl">
                Understand the exposure.
                <br />
                <span className="text-gradient italic">Plan for a resilient future.</span>
              </h2>
              <p className="max-w-xl text-muted-foreground">
                Explore climate risk across countries, economic sectors and communities, with a
                dedicated India lens.
              </p>
              <CtaLink to="/climate-risk">Explore the Observatory</CtaLink>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {items.map((t, i) => (
                <motion.div
                  key={t}
                  initial={{ opacity: 0, rotateX: 60 }}
                  whileInView={{ opacity: 1, rotateX: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i, duration: 0.7 }}
                  style={{ transformPerspective: 800 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <CloudLightning className="mb-3 h-5 w-5 text-lavender" />
                  <p className="text-sm font-semibold text-white">{t}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </GlassCard>
      </Reveal>
    </Section>
  );
}

function SectorsSection() {
  const [active, setActive] = useState<string>(SECTORS[0].key);
  const sector = SECTORS.find((s) => s.key === active)!;

  function onKey(e: React.KeyboardEvent, i: number) {
    let next: number | undefined;
    if (e.key === "ArrowRight") next = (i + 1) % SECTORS.length;
    if (e.key === "ArrowLeft") next = (i - 1 + SECTORS.length) % SECTORS.length;
    if (next !== undefined) {
      e.preventDefault();
      setActive(SECTORS[next].key);
      document.getElementById(`sector-tab-${next}`)?.focus();
    }
  }

  return (
    <Section id="sectors">
      <SectionHeading
        eyebrow="Sector presence"
        title="Different industries."
        accent="Shared ambition."
        description="Sustainability expertise across industry, finance and development, with a dedicated focus on MSMEs and sustainable value chains."
        align="center"
      />
      <Reveal className="mt-12">
        <div
          role="tablist"
          aria-label="Sectors"
          className="mx-auto flex max-w-4xl flex-wrap justify-center gap-2"
        >
          {SECTORS.map((s, i) => {
            const selected = s.key === active;
            return (
              <button
                key={s.key}
                id={`sector-tab-${i}`}
                role="tab"
                aria-selected={selected}
                aria-controls="sector-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(s.key)}
                onKeyDown={(e) => onKey(e, i)}
                className={cn(
                  "relative rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
                  selected ? "text-white" : "text-muted-foreground hover:text-white",
                )}
              >
                {selected && (
                  <motion.span
                    layoutId="sector-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-periwinkle shadow-[0_8px_30px_-8px_rgb(115_108_237/1)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {s.tab}
              </button>
            );
          })}
        </div>

        <div
          id="sector-panel"
          role="tabpanel"
          className="mx-auto mt-10 max-w-3xl"
          style={{ perspective: 1200 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={sector.key}
              initial={{ opacity: 0, rotateY: -35, x: 40 }}
              animate={{ opacity: 1, rotateY: 0, x: 0 }}
              exit={{ opacity: 0, rotateY: 35, x: -40 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <GlassCard className="p-10 text-center sm:p-14">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-lavender">
                  Industry perspective
                </p>
                <h3 className="mt-4 font-display text-3xl text-white sm:text-4xl">
                  {sector.title}
                </h3>
                <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{sector.body}</p>
              </GlassCard>
            </motion.div>
          </AnimatePresence>
        </div>
      </Reveal>
    </Section>
  );
}

function AboutTeaser() {
  return (
    <Section>
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <SectionHeading
          eyebrow="About CliSo Tech"
          title="Making sustainability clear."
          accent="Turning ambition into action."
          description="CliSo Tech Private Limited combines technology and deep domain expertise to help businesses translate sustainability commitments into practical, measurable action."
        >
          <CtaLink to="/about" variant="ghost">
            Meet the team
          </CtaLink>
        </SectionHeading>
        <Reveal>
          <Tilt className="rounded-3xl">
            <GlassCard className="space-y-5 p-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-lavender">
                Our guiding philosophy
              </p>
              <p className="font-display text-3xl italic leading-snug text-white">
                Vasudhaiva Kutumbakam
              </p>
              <p className="text-lg text-lavender">“the world is one family”</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We recognise the shared well-being of communities, businesses and the natural
                environment.
              </p>
            </GlassCard>
          </Tilt>
        </Reveal>
      </div>
    </Section>
  );
}
