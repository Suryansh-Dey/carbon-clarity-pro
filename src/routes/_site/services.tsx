import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { Building2, Landmark, Leaf, Users } from "lucide-react";
import { Reveal, Stagger, StaggerItem, Tilt } from "@/components/site/motion";
import {
  CtaLink,
  Eyebrow,
  GlassCard,
  IndexChip,
  Note,
  PageHero,
  Section,
  SectionHeading,
  TextLink,
} from "@/components/site/ui";
import { ContactBand } from "@/components/site/contact-band";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_site/services")({
  head: () => ({
    meta: [
      { title: "Consulting & E&S Due Diligence — CliSo Tech" },
      {
        name: "description",
        content:
          "Climate & Net Zero strategy, ESG disclosures, E&S risk and due diligence aligned with IFC Performance Standards and the World Bank ESF, capacity building and CSR impact.",
      },
    ],
  }),
  component: ServicesPage,
});

const CONSULTING = [
  {
    t: "Climate & Net Zero strategy",
    d: "Assess climate risks, establish emissions baselines and prioritise decarbonization pathways, investment needs and realistic target-setting.",
  },
  {
    t: "ESG disclosures & assurance readiness",
    d: "Organise evidence, strengthen reporting processes and support sustainability disclosures, ratings and readiness for independent assurance.",
  },
  {
    t: "E&S risk & due diligence",
    d: "Identify environmental and social gaps, develop management frameworks and monitor action plans for businesses and financiers.",
  },
  {
    t: "Board-to-field capacity building",
    d: "Equip leaders and operational teams with tailored learning, practical tools and feedback loops that connect strategy with execution.",
  },
  {
    t: "CSR & measurable community impact",
    d: "Plan and manage the CSR lifecycle, including implementation, stakeholder engagement, monitoring and impact assessment.",
  },
];

const IFC_PS = [
  ["PS1", "Risk assessment and management"],
  ["PS2", "Worker rights and working conditions"],
  ["PS3", "Resource efficiency and pollution prevention"],
  ["PS4", "Community health, safety and security"],
  ["PS5", "Land acquisition and displacement"],
  ["PS6", "Biodiversity and living natural resources"],
  ["PS7", "Indigenous Peoples"],
  ["PS8", "Cultural heritage"],
];

const WB_ESS = [
  ["ESS1", "Project risk assessment, management and monitoring"],
  ["ESS2", "Labour and working conditions"],
  ["ESS3", "Resource use and pollution management"],
  ["ESS4", "Community health and safety"],
  ["ESS5", "Land-use restrictions, acquisition and resettlement"],
  ["ESS6", "Biodiversity and natural resource stewardship"],
  ["ESS7", "Indigenous Peoples and specified historically underserved traditional communities"],
  ["ESS8", "Cultural heritage"],
  ["ESS9", "Financial intermediaries and portfolio risk"],
  ["ESS10", "Stakeholder engagement and information disclosure"],
];

const AUDIENCES = [
  {
    icon: Landmark,
    t: "Governments & public institutions",
    d: "Use clear responsibilities and evidence to strengthen project oversight and implementation capacity.",
  },
  {
    icon: Building2,
    t: "Development institutions & financiers",
    d: "Connect risk screening with financing decisions, action plans and portfolio monitoring.",
  },
  {
    icon: Users,
    t: "Companies & project developers",
    d: "Address operational gaps early and integrate safeguards into project design and delivery.",
  },
  {
    icon: Leaf,
    t: "People & ecosystems",
    d: "Build protection, inclusion and meaningful participation into the development process.",
  },
];

function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Consulting services"
        title="Strategy grounded in evidence."
        accent="Delivery built around people."
        description="We connect climate, environmental and social priorities with clear responsibilities, implementation plans and measurable outcomes."
      >
        <CtaLink to="/contact">Discuss your sustainability goals</CtaLink>
      </PageHero>

      <Section id="consulting" className="pt-8 sm:pt-12">
        <Stagger className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {CONSULTING.map((c, i) => (
            <StaggerItem key={c.t}>
              <motion.div
                whileHover={{ x: 12 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="group grid gap-4 py-8 sm:grid-cols-[80px_1fr_1.2fr] sm:items-center sm:gap-10"
              >
                <IndexChip n={i + 1} className="text-base" />
                <h3 className="font-display text-2xl text-white transition-colors group-hover:text-lavender sm:text-3xl">
                  {c.t}
                </h3>
                <p className="text-muted-foreground">{c.d}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      <Section id="esdd">
        <div className="grid gap-12 lg:grid-cols-2">
          <SectionHeading
            eyebrow="Environmental & social due diligence"
            title="Protect people and nature."
            accent="Strengthen development outcomes."
            description="Effective due diligence turns environmental and social commitments into accountable decisions, practical safeguards and measurable follow-through."
          />
          <Reveal className="self-end">
            <p className="leading-relaxed text-muted-foreground">
              CliSo supports organisations, governments, development institutions and companies in
              assessing project risks, identifying gaps and building action plans. Our approach
              connects applicable legal requirements and financing conditions with operational
              controls, stakeholder engagement and ongoing monitoring.
            </p>
          </Reveal>
        </div>

        <FrameworkExplorer />
      </Section>

      <Section className="pt-0 sm:pt-0">
        <SectionHeading
          title="From safeguards to"
          accent="resilience and adaptation."
          description="Risk assessment, responsive management and stakeholder feedback help projects adapt as conditions change. The ESF also supports institutional capacity, transparent consultation and accessible grievance mechanisms."
        />
        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCES.map((a) => (
            <StaggerItem key={a.t}>
              <Tilt className="h-full rounded-3xl">
                <GlassCard className="h-full space-y-4 p-7">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-cosmic/80 text-lavender">
                    <a.icon className="h-5 w-5" />
                  </span>
                  <h4 className="font-sans text-base font-semibold text-white">{a.t}</h4>
                  <p className="text-sm text-muted-foreground">{a.d}</p>
                </GlassCard>
              </Tilt>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-10">
          <GlassCard className="space-y-6 p-8 sm:p-10">
            <p className="text-lg leading-relaxed text-white">
              <strong className="text-lavender">CliSo’s practical application:</strong> assess
              physical climate exposure, community vulnerability and resource dependencies;
              prioritise protective measures; assign owners, budgets and indicators; then review
              outcomes as project conditions evolve.
            </p>
            <Note>
              Framework alignment supports due diligence; it does not certify compliance or
              guarantee funding. Applicable law, lender conditions and project-specific requirements
              must be assessed separately. IFC and World Bank requirements are distinct and are not
              interchangeable.
            </Note>
            <CtaLink to="/contact">Discuss an E&amp;S due diligence engagement</CtaLink>
          </GlassCard>
        </Reveal>
      </Section>

      <ContactBand />
    </>
  );
}

function FrameworkExplorer() {
  const [tab, setTab] = useState<"ifc" | "wb">("ifc");
  return (
    <Reveal className="mt-16">
      <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/[0.03] p-1">
        {(
          [
            ["ifc", "IFC Performance Standards"],
            ["wb", "World Bank ESF"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={cn(
              "relative rounded-full px-5 py-2 text-sm font-medium transition-colors",
              tab === k ? "text-white" : "text-muted-foreground hover:text-white",
            )}
          >
            {tab === k && (
              <motion.span
                layoutId="fw-pill"
                className="absolute inset-0 -z-10 rounded-full bg-periwinkle"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            {label}
          </button>
        ))}
      </div>

      <div style={{ perspective: 1400 }}>
        <motion.div
          key={tab}
          initial={{ opacity: 0, rotateX: -20, y: 30 }}
          animate={{ opacity: 1, rotateX: 0, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "50% 0%" }}
        >
          {tab === "ifc" ? (
            <GlassCard className="grid gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_1.3fr]">
              <div className="space-y-5">
                <Eyebrow>Private-sector projects</Eyebrow>
                <h3 className="font-display text-3xl text-white">IFC Performance Standards</h3>
                <p className="text-muted-foreground">
                  The eight standards guide IFC clients in identifying and managing project impacts,
                  including engagement and disclosure. They provide a structured reference for due
                  diligence and environmental and social management systems.
                </p>
                <TextLink href="https://www.ifc.org/en/insights-reports/2012/ifc-performance-standards">
                  Read IFC Performance Standards
                </TextLink>
                <Note>
                  2012 standards reference. IFC is updating its Sustainability Framework; confirm
                  the applicable version for each engagement.
                </Note>
              </div>
              <StandardsList items={IFC_PS} />
            </GlassCard>
          ) : (
            <GlassCard className="grid gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_1.3fr]">
              <div className="space-y-5">
                <Eyebrow>World Bank investment project financing</Eyebrow>
                <h3 className="font-display text-3xl text-white">
                  Environmental and Social Framework
                </h3>
                <p className="text-muted-foreground">
                  The ESF combines a development vision, borrower standards and Bank policy. It
                  applies to World Bank Investment Project Financing projects initiated on or after
                  1 October 2018, using risk-proportionate oversight and adaptive management.
                </p>
                <TextLink href="https://www.worldbank.org/en/projects-operations/environmental-and-social-framework">
                  Explore the World Bank ESF
                </TextLink>
                <Note>
                  Summarised topics.{" "}
                  <a
                    href="https://www.worldbank.org/en/projects-operations/environmental-and-social-framework/brief/environmental-and-social-standards"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lavender underline underline-offset-4 hover:text-white"
                  >
                    Read the full ESS requirements
                  </a>
                  .
                </Note>
              </div>
              <div>
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-lavender">
                  The Environmental and Social Standards (ESS)
                </p>
                <StandardsList items={WB_ESS} />
              </div>
            </GlassCard>
          )}
        </motion.div>
      </div>
    </Reveal>
  );
}

function StandardsList({ items }: { items: string[][] }) {
  return (
    <ol className="grid gap-2 sm:grid-cols-2">
      {items.map(([code, label], i) => (
        <motion.li
          key={code}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.04 * i }}
          className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 transition-colors hover:border-periwinkle/40 hover:bg-periwinkle/[0.06]"
        >
          <span className="shrink-0 rounded-md bg-periwinkle/15 px-2 py-0.5 font-mono text-xs font-semibold text-lavender">
            {code}
          </span>
          <span className="text-sm text-white/90">{label}</span>
        </motion.li>
      ))}
    </ol>
  );
}
