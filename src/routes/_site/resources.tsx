import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Compass, Factory, Globe2, Landmark, Leaf, Wind } from "lucide-react";
import { Reveal, Stagger, StaggerItem, Tilt } from "@/components/site/motion";
import {
  CtaExternal,
  Eyebrow,
  GlassCard,
  Note,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/site/ui";
import { GLOBAL_RISK_URL } from "@/components/site/content";

export const Route = createFileRoute("/_site/resources")({
  head: () => ({
    meta: [
      { title: "Knowledge & Official Resources — CliSo Tech" },
      {
        name: "description",
        content:
          "India Tracker (NAPCC, PARIVESH, CPCB), NITI Aayog SDG India Index, UNEP and the WEF Global Risks Report 2026 — climate, environmental and SDG resources in one place.",
      },
    ],
  }),
  component: ResourcesPage,
});

const INDIA_TRACKER = [
  {
    icon: Wind,
    k: "Climate action",
    t: "NAPCC",
    sub: "India’s National Action Plan on Climate Change Tracker",
    d: "Explore the official NAPCC portal for information on India’s National Action Plan on Climate Change.",
    cta: "Open NAPCC portal",
    href: "https://napccindia.moef.gov.in/",
    domain: "napccindia.moef.gov.in",
  },
  {
    icon: Leaf,
    k: "Environmental portal",
    t: "PARIVESH",
    sub: "Official PARIVESH portal",
    d: "Access the portal’s information and online services. Sign-in and submissions take place on its official website.",
    cta: "Open PARIVESH portal",
    href: "https://parivesh.nic.in/",
    domain: "parivesh.nic.in",
  },
  {
    icon: Factory,
    k: "Pollution control",
    t: "CPCB",
    sub: "Central Pollution Control Board",
    d: "Visit the official CPCB website for published information, resources and access to its services.",
    cta: "Open CPCB portal",
    href: "https://cpcb.gov.in/index.php",
    domain: "cpcb.gov.in",
  },
];

function ResourcesPage() {
  return (
    <>
      <PageHero
        eyebrow="Knowledge & official resources"
        title="Connect global context"
        accent="with local action."
        description="Explore India’s climate, environmental and SDG portals alongside global environmental insights. Official resources open in a new tab; their data is maintained by the respective institutions."
      />

      <Section id="india-tracker" className="pt-0 sm:pt-0">
        <SectionHeading
          eyebrow="India Tracker / Official government portals"
          title="India Tracker"
          description="Access India’s climate action, environmental and pollution-control portals in one place."
        />
        <Stagger className="mt-12 grid gap-5 md:grid-cols-3">
          {INDIA_TRACKER.map((p) => (
            <StaggerItem key={p.t}>
              <Tilt className="h-full rounded-3xl">
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block h-full"
                >
                  <GlassCard className="flex h-full flex-col gap-5 p-8">
                    <div className="flex items-center justify-between">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-cosmic/80 text-lavender">
                        <p.icon className="h-5 w-5" />
                      </span>
                      <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white" />
                    </div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-lavender">
                      {p.k}
                    </p>
                    <div>
                      <h3 className="font-display text-3xl text-white">{p.t}</h3>
                      <p className="mt-1 text-sm font-medium text-white/80">{p.sub}</p>
                    </div>
                    <p className="flex-1 text-sm text-muted-foreground">{p.d}</p>
                    <div className="flex items-center justify-between border-t border-white/[0.08] pt-4 text-sm">
                      <span className="font-semibold text-lavender group-hover:text-white">
                        {p.cta}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">{p.domain}</span>
                    </div>
                  </GlassCard>
                </a>
              </Tilt>
            </StaggerItem>
          ))}
        </Stagger>
        <Note className="mt-6">
          All links open the official government websites in a new tab. Updates and services are
          provided directly by those portals.
        </Note>
      </Section>

      <Section id="sdg">
        <div className="grid gap-6 lg:grid-cols-2">
          <ResourcePanel
            icon={Compass}
            eyebrow="Sustainable development / Official dashboard"
            title={
              <>
                India Sustainable Development
                <br />
                <span className="text-gradient italic">Goals Tracker</span>
              </>
            }
            lead="SDG India Index & Dashboard"
            body="Connect to the NITI Aayog SDG India Index portal to explore India’s Sustainable Development Goals dashboard."
            cta="Open SDG India Index dashboard"
            href="https://sdgindiaindex.niti.gov.in/#/"
            note="Opens the official dashboard in a new tab."
            source="NITI Aayog SDG India Index"
            sourceSub="sdgindiaindex.niti.gov.in"
            sourceNote="Dashboard data and updates are viewed directly on the official portal."
          />
          <div id="unep" className="scroll-mt-28">
            <ResourcePanel
              icon={Globe2}
              eyebrow="Global environment / Official resource"
              title={
                <>
                  United Nations
                  <br />
                  <span className="text-gradient italic">Environment Programme</span>
                </>
              }
              lead="Explore UNEP’s global environmental work."
              body="Visit the official UNEP website for climate action, nature and land action, chemicals and pollution action, and environmental publications."
              cta="Open the official UNEP website"
              href="https://www.unep.org/"
              note="Opens unep.org in a new tab."
              source="UNEP"
              sourceSub="United Nations Environment Programme"
              sourceNote="Read news, explore events and access publications directly from the official website."
            />
          </div>
        </div>
      </Section>

      <Section id="global-risk" className="pt-0 sm:pt-0">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-cosmic/80 via-midnight to-void p-8 sm:p-16">
            <div aria-hidden className="bg-grid absolute inset-0 opacity-40" />
            <Landmark className="absolute -right-10 -top-10 h-72 w-72 text-periwinkle/10" />
            <div className="relative max-w-2xl space-y-6">
              <Eyebrow>Global risk report / World Economic Forum</Eyebrow>
              <h2 className="font-display text-4xl leading-tight text-white sm:text-5xl">
                Understand global risks.
                <br />
                <span className="text-gradient italic">Prepare for local impacts.</span>
              </h2>
              <p className="text-muted-foreground">
                Explore our visual overview of the World Economic Forum’s Global Risks Report 2026,
                with reported risk rankings and implications for countries, economic sectors and
                people.
              </p>
              <CtaExternal href={GLOBAL_RISK_URL}>Explore the Global Risk Report</CtaExternal>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}

function ResourcePanel(props: {
  icon: typeof Globe2;
  eyebrow: string;
  title: React.ReactNode;
  lead: string;
  body: string;
  cta: string;
  href: string;
  note: string;
  source: string;
  sourceSub: string;
  sourceNote: string;
}) {
  const Icon = props.icon;
  return (
    <Reveal className="h-full">
      <GlassCard className="flex h-full flex-col gap-6 p-8 sm:p-10">
        <Eyebrow>{props.eyebrow}</Eyebrow>
        <h2 className="font-display text-3xl leading-tight text-white sm:text-4xl">
          {props.title}
        </h2>
        <div className="space-y-2">
          <p className="font-semibold text-white">{props.lead}</p>
          <p className="text-muted-foreground">{props.body}</p>
        </div>
        <div className="space-y-2">
          <CtaExternal href={props.href}>{props.cta}</CtaExternal>
          <Note>{props.note}</Note>
        </div>
        <div className="mt-auto flex gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
          <Icon className="h-6 w-6 shrink-0 text-lavender" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-lavender">
              Source
            </p>
            <h3 className="font-sans text-base font-semibold text-white">{props.source}</h3>
            <p className="text-xs text-muted-foreground">{props.sourceSub}</p>
            <p className="mt-2 text-xs text-muted-foreground">{props.sourceNote}</p>
          </div>
        </div>
      </GlassCard>
    </Reveal>
  );
}
