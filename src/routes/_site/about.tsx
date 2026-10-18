import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import type { ReactNode } from "react";
import { Reveal, Stagger, StaggerItem, Tilt } from "@/components/site/motion";
import { Eyebrow, GlassCard, PageHero, Section, SectionHeading } from "@/components/site/ui";
import { ContactBand } from "@/components/site/contact-band";

export const Route = createFileRoute("/_site/about")({
  head: () => ({
    meta: [
      { title: "About CliSo Tech — Making sustainability clear" },
      {
        name: "description",
        content:
          "CliSo Tech Private Limited combines technology and deep domain expertise to help businesses translate sustainability commitments into practical, measurable action. Meet our founders and team.",
      },
    ],
  }),
  component: AboutPage,
});

type Founder = {
  name: string;
  role: string;
  meta: string;
  photo: string;
  tagline: string;
  bio: ReactNode[];
  listTitle: string;
  intro?: string;
  list: [string, string][];
  education: string[];
};

const FOUNDERS: Founder[] = [
  {
    name: "Swapnil Choure",
    role: "Founder & Managing Director",
    meta: "CliSo Tech Private Limited · August 2026–Present",
    photo: "/images/swapnil-choure.jpg",
    tagline: "Turning sustainability priorities into practical, technology-enabled outcomes.",
    bio: [
      "Swapnil brings eight years of Big Four and non-profit experience across decarbonization, climate risk, environmental and social due diligence, human rights and corporate social responsibility. He leads CliSo’s technology-enabled sustainability solutions for MSMEs, large listed entities and financial institutions.",
      "His advisory experience spans public sector undertakings (PSUs), multilateral organisations and corporate boards, with work across banking and NBFCs, industry, power, steel, IT, semiconductors, chemicals and FMCG. He brings experience with the EU Corporate Sustainability Reporting Directive (CSRD), IFC and World Bank standards, and SEBI’s Business Responsibility and Sustainability Reporting (BRSR) framework.",
      "Swapnil actively engages with the Confederation of Indian MSME (CIMSME) on sustainable value chains, connecting enterprise sustainability priorities with the needs of smaller businesses.",
    ],
    listTitle: "Leadership at CliSo",
    intro:
      "As Founder and Managing Director, Swapnil combines proprietary technology with specialised consulting to accelerate decarbonization across business sizes, geographies and value chains.",
    list: [
      [
        "ESG & decarbonization technology",
        "Leads accessible Scope 1, 2 and 3 platforms, five-level roadmaps, CapEx visibility and ROI estimates across short-, medium- and long-term horizons.",
      ],
      [
        "Environmental & social due diligence",
        "Develops customised frameworks aligned with IFC standards, ILO guidelines and applicable local regulations for financial institutions, banks and NBFCs.",
      ],
      [
        "End-to-end advisory",
        "Directs climate risk assessments, rating support, disclosures, assurance readiness and regulatory compliance.",
      ],
      [
        "Capacity building",
        "Connects board-level strategy with field implementation through tailored training and feedback from field teams.",
      ],
      [
        "CSR & last-mile impact",
        "Oversees the complete CSR lifecycle to support measurable outcomes at the grassroots level.",
      ],
    ],
    education: ["MBA, Business & Sustainability", "BE, Mechanical Engineering"],
  },
  {
    name: "Praanjal Agarwal",
    role: "Founder & Managing Director",
    meta: "Sustainability · Climate Tech · Innovation · Industry",
    photo: "/images/praanjal-agarwal.jpeg",
    tagline: "Connecting industrial insight, scientific expertise and climate innovation.",
    bio: [
      "Praanjal is a sustainability and innovation professional with over a decade of experience across clean energy, biotechnology, industrial sustainability, decarbonization, climate technology, policy research and business sustainability.",
      "His professional experience spans Reliance Industries Limited, the National Innovation Foundation–India (Government of India), and sustainability- and innovation-led ventures. This brings together perspectives from large industry, government, technology startups and research-driven programmes.",
      "He has worked across oil and gas, manufacturing, electronics, agriculture, food systems, industrial products and climate technology, supporting corporates, startups, governments and academic institutions through technical assessments, strategy, innovation programmes and technology-led sustainability solutions.",
    ],
    listTitle: "Areas of expertise",
    list: [
      [
        "Assessment & data",
        "Life Cycle Assessment, sustainability data and technology assessment.",
      ],
      [
        "Climate strategy",
        "Decarbonization, Net Zero strategy, climate risk and sustainability strategy.",
      ],
      [
        "Technology & innovation",
        "Carbon capture, climate technology and industrial sustainability solutions.",
      ],
      [
        "Learning & reporting",
        "Climate education, capacity building and sustainability reporting.",
      ],
    ],
    education: [
      "MBA, Business Sustainability",
      "PG Diploma, Cellular & Molecular Diagnostics",
      "B.Tech., Biotechnology",
    ],
  },
];

const TEAM = [
  { initials: "KT", name: "Kabirr Talade", role: "Senior Digital Sustainability Expert" },
  { initials: "AS", name: "Abhinav Sohani", role: "Advisor, Digital Sustainability Program" },
];

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About CliSo Tech"
        title="Making sustainability clear."
        accent="Turning ambition into action."
        description="CliSo Tech Private Limited combines technology and deep domain expertise to help businesses translate sustainability commitments into practical, measurable action."
      />

      <Section className="pt-0 sm:pt-0">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <GlassCard className="h-full space-y-5 p-8 sm:p-10">
              <Eyebrow>Our mission</Eyebrow>
              <p className="text-lg leading-relaxed text-white">
                Our mission is to simplify sustainability and accelerate decarbonization across
                businesses of every size. We place a special emphasis on empowering micro, small and
                medium enterprises (MSMEs), while supporting large listed entities and their value
                chains.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                We bring together proprietary digital tools, strategic advisory and capacity
                building to help organisations understand their environmental and social
                responsibilities, prioritise investment and implement effective solutions.
              </p>
            </GlassCard>
          </Reveal>
          <Reveal delay={0.1}>
            <GlassCard className="relative h-full space-y-5 overflow-hidden p-8 sm:p-10">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-periwinkle/25 blur-[80px]" />
              <Eyebrow>Our objective & guiding philosophy</Eyebrow>
              <h2 className="font-display text-3xl text-white">
                Positive impact for{" "}
                <span className="text-gradient italic">people and the planet.</span>
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                Our objective is to create positive impact for people and the planet by encouraging
                harmonious living and responsible growth. Guided by the ethos of{" "}
                <em className="text-white">Vasudhaiva Kutumbakam</em> — “the world is one family” —
                we recognise the shared well-being of communities, businesses and the natural
                environment.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                Whether an organisation is beginning its ESG journey or pursuing complex
                decarbonization goals across its value chain, CliSo brings together the technology,
                strategy and capacity to deliver results across geographies.
              </p>
            </GlassCard>
          </Reveal>
        </div>
      </Section>

      <Section id="leadership">
        <SectionHeading
          eyebrow="Founders & leadership"
          title="Experience that connects"
          accent="sustainability with execution."
        />
        <div className="mt-16 space-y-10">
          {FOUNDERS.map((f, idx) => (
            <FounderCard key={f.name} founder={f} flip={idx % 2 === 1} />
          ))}
        </div>
      </Section>

      <Section id="team" className="pt-0 sm:pt-0">
        <SectionHeading eyebrow="Our team & advisors" title="Digital sustainability expertise." />
        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2">
          {TEAM.map((m) => (
            <StaggerItem key={m.name}>
              <Tilt className="rounded-3xl">
                <GlassCard className="flex items-center gap-6 p-7">
                  <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-periwinkle to-indigo-cosmic font-display text-xl text-white shadow-[0_0_30px_-8px_rgb(115_108_237/1)]">
                    {m.initials}
                  </span>
                  <div>
                    <h4 className="font-sans text-lg font-semibold text-white">{m.name}</h4>
                    <p className="text-sm text-muted-foreground">{m.role}</p>
                  </div>
                </GlassCard>
              </Tilt>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      <ContactBand />
    </>
  );
}

function FounderCard({ founder: f, flip }: { founder: Founder; flip: boolean }) {
  return (
    <Reveal>
      <GlassCard
        className={`grid gap-10 p-6 sm:p-10 ${flip ? "lg:grid-cols-[1fr_320px]" : "lg:grid-cols-[320px_1fr]"}`}
      >
        <div className={flip ? "lg:order-2" : undefined}>
          <Tilt max={12} className="rounded-3xl">
            <div className="relative overflow-hidden rounded-3xl border border-white/10">
              <img
                src={f.photo}
                alt={`${f.name}, ${f.role}`}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="font-display text-2xl text-white">{f.name}</h3>
                <p className="text-sm text-lavender">{f.role}</p>
              </div>
            </div>
          </Tilt>
          <div className="mt-6 space-y-2">
            <p className="text-xs text-muted-foreground">{f.meta}</p>
            <p className="flex items-center gap-2 pt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-lavender">
              <GraduationCap className="h-4 w-4" /> Education
            </p>
            <ul className="space-y-1 text-sm text-white/90">
              {f.education.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className={`space-y-6 ${flip ? "lg:order-1" : ""}`}>
          <p className="font-display text-2xl italic leading-snug text-white sm:text-3xl">
            {f.tagline}
          </p>
          <div className="space-y-4 text-muted-foreground">
            {f.bio.map((p, i) => (
              <p key={i} className="leading-relaxed">
                {p}
              </p>
            ))}
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-lavender">
              {f.listTitle}
            </p>
            {f.intro && <p className="mb-4 text-sm text-muted-foreground">{f.intro}</p>}
            <ul className="grid gap-4 sm:grid-cols-2">
              {f.list.map(([k, v]) => (
                <li key={k} className="text-sm leading-relaxed text-muted-foreground">
                  <strong className="block font-semibold text-white">{k}</strong>
                  {v}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </GlassCard>
    </Reveal>
  );
}
