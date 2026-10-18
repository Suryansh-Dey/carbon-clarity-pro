import { createFileRoute } from "@tanstack/react-router";
import { Activity, ClipboardCheck, Globe2, LineChart } from "lucide-react";
import { HeroCanvas } from "@/components/site/hero-canvas";
import { Reveal, Stagger, StaggerItem, Tilt } from "@/components/site/motion";
import {
  CtaExternal,
  CtaLink,
  Eyebrow,
  GlassCard,
  Note,
  Section,
  SectionHeading,
} from "@/components/site/ui";
import { CLIMATE_RISK_URL } from "@/components/site/content";
import { ContactBand } from "@/components/site/contact-band";

export const Route = createFileRoute("/_site/climate-risk")({
  head: () => ({
    meta: [
      { title: "Climate Risk Observatory — CliSo Tech" },
      {
        name: "description",
        content:
          "Explore climate risk across countries, economic sectors and communities, with a dedicated India lens: event evidence, SSP scenarios, conditional financial stress tests and risk-management checklists.",
      },
    ],
  }),
  component: ClimateRiskPage,
});

const PILLARS = [
  {
    icon: Activity,
    k: "Event evidence",
    t: "NASA EONET & India alerts",
    d: "Event IDs, observation times, coordinates and reporting sources, alongside SACHET alert retrieval. Check feed status and retrieval time inside the Observatory.",
  },
  {
    icon: Globe2,
    k: "Scenarios & exposure",
    t: "Global context. India detail.",
    d: "SSP scenario comparisons, India regional screening profiles and impact pathways for sectors and livelihoods.",
  },
  {
    icon: LineChart,
    k: "Financial assessment",
    t: "Conditional economic stress tests",
    d: "Explore potential foregone output using Economic Survey sector GVA and explicit exposure, disruption and productivity assumptions.",
  },
  {
    icon: ClipboardCheck,
    k: "Management & sources",
    t: "From screening to action",
    d: "Risk-management checklists, assessment export and a registry of international and Indian climate and disaster resources.",
  },
];

function ClimateRiskPage() {
  return (
    <>
      <section className="relative overflow-hidden pb-20 pt-36 sm:pt-44">
        <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-50" />
        <HeroCanvas className="absolute inset-0 opacity-30 lg:left-1/2 lg:opacity-80" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-3xl space-y-6">
            <Eyebrow>Climate risk assessment / CliSo Observatory</Eyebrow>
            <h1 className="font-display text-5xl leading-[1.04] text-white sm:text-6xl lg:text-7xl">
              Understand the exposure.
              <br />
              <span className="text-gradient italic">Plan for a resilient future.</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Explore climate risk across countries, economic sectors and communities, with a
              dedicated India lens.
            </p>
          </Reveal>
        </div>
      </section>

      <Section className="pt-8 sm:pt-12">
        <div className="grid items-end gap-12 lg:grid-cols-2">
          <SectionHeading
            title="Connect event evidence with"
            accent="scenario-based planning."
            description="The Climate Risk Observatory brings together event metadata, source access points, climate scenarios and conditional financial assessments to support screening and risk-management discussions."
          />
          <Reveal className="space-y-4 lg:justify-self-end">
            <div className="flex flex-col gap-3 sm:flex-row">
              <CtaExternal href={CLIMATE_RISK_URL}>Open Climate Risk Assessment</CtaExternal>
              <CtaLink to="/contact" variant="ghost">
                Discuss a climate risk assessment
              </CtaLink>
            </div>
            <Note>Opens the original assessment directly within the CliSo website.</Note>
          </Reveal>
        </div>

        <Stagger className="mt-16 grid gap-5 md:grid-cols-2">
          {PILLARS.map((p) => (
            <StaggerItem key={p.k}>
              <Tilt className="h-full rounded-3xl">
                <GlassCard className="flex h-full gap-6 p-8">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-periwinkle to-indigo-cosmic text-white shadow-[0_0_40px_-10px_rgb(115_108_237/1)]">
                    <p.icon className="h-6 w-6" />
                  </span>
                  <div className="space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-lavender">
                      {p.k}
                    </p>
                    <h3 className="font-display text-2xl text-white">{p.t}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{p.d}</p>
                  </div>
                </GlassCard>
              </Tilt>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-10">
          <div className="rounded-3xl border border-lavender/20 bg-indigo-cosmic/30 p-8">
            <p className="mb-2 font-semibold text-white">Read results in context.</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Near-real-time event metadata is distinct from SSP projections and modelled impacts.
              Financial estimates are conditional stress tests, not observed losses. Regional
              sensitivity profiles are illustrative; asset-level exposure requires a separate
              assessment. IMD access requires authorisation, and linked agencies or portals are not
              necessarily connected live feeds.
            </p>
          </div>
        </Reveal>
      </Section>

      <ContactBand />
    </>
  );
}
