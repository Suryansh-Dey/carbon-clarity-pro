import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { ChevronDown, Newspaper } from "lucide-react";
import { Reveal, Stagger, StaggerItem, Tilt } from "@/components/site/motion";
import {
  CtaExternal,
  CtaLink,
  Eyebrow,
  GlassCard,
  IndexChip,
  Note,
  PageHero,
  Section,
} from "@/components/site/ui";

export const Route = createFileRoute("/_site/insights")({
  head: () => ({
    meta: [
      { title: "Blog & Media — CliSo Tech" },
      {
        name: "description",
        content:
          "Climate action. Social impact. Shared perspectives. Ideas and stories connecting sustainability strategy with outcomes for people and the planet.",
      },
    ],
  }),
  component: InsightsPage,
});

const CATEGORIES = [
  {
    hash: "climate-stories",
    t: "Climate",
    d: "Emissions, decarbonization and practical climate action.",
  },
  {
    hash: "social-stories",
    t: "Social",
    d: "Community voices, inclusion and responsible development.",
  },
  {
    hash: "media",
    t: "Media & Press",
    d: "Company announcements, media resources and press updates.",
  },
];

function InsightsPage() {
  return (
    <>
      <PageHero
        eyebrow="Blog & media"
        title="Climate action."
        accent="Social impact. Shared perspectives."
        description="Ideas and stories connecting sustainability strategy with outcomes for people and the planet."
      >
        <div className="flex flex-wrap gap-2 pt-2">
          {CATEGORIES.map((c) => (
            <Link
              key={c.hash}
              to="/insights"
              hash={c.hash}
              className="rounded-full border border-white/15 bg-white/[0.03] px-5 py-2 text-sm font-medium text-white transition-colors hover:border-periwinkle hover:bg-periwinkle/15"
            >
              {c.t}
            </Link>
          ))}
        </div>
      </PageHero>

      <Section className="pt-0 sm:pt-0">
        <Stagger className="grid gap-5 md:grid-cols-3">
          {CATEGORIES.map((c, i) => (
            <StaggerItem key={c.hash}>
              <Link to="/insights" hash={c.hash} className="block h-full">
                <Tilt className="h-full rounded-3xl">
                  <GlassCard className="h-full space-y-3 p-7">
                    <IndexChip n={i + 1} />
                    <h3 className="font-display text-2xl text-white">{c.t}</h3>
                    <p className="text-sm text-muted-foreground">{c.d}</p>
                  </GlassCard>
                </Tilt>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      <Section id="climate-stories" className="pt-0 sm:pt-0">
        <Reveal>
          <GlassCard className="grid gap-10 p-8 sm:p-12 lg:grid-cols-[1fr_1.4fr]">
            <div className="space-y-4">
              <Eyebrow>Climate / CliSo perspective</Eyebrow>
              <h2 className="font-display text-3xl leading-tight text-white sm:text-4xl">
                From an emissions inventory
                <br />
                <span className="text-gradient italic">to a practical action plan.</span>
              </h2>
            </div>
            <div className="space-y-5">
              <p className="text-lg leading-relaxed text-white/90">
                An inventory is a starting point. Decisions become actionable when emissions
                hotspots are connected to ownership, investment and measurable progress.
              </p>
              <Expandable label="Read perspective">
                <p className="leading-relaxed text-muted-foreground">
                  Start by defining organisational boundaries and checking activity data across
                  Scope 1, 2 and 3. Identify material hotspots, then compare reduction measures
                  using implementation time, capital costs, projected savings and operational
                  constraints. Assign owners, establish evidence requirements and review performance
                  as new data becomes available. Separate estimated reductions from verified results
                  to keep the roadmap credible.
                </p>
              </Expandable>
            </div>
          </GlassCard>
        </Reveal>
      </Section>

      <Section id="social-stories" className="pt-0 sm:pt-0">
        <Reveal>
          <GlassCard className="relative overflow-hidden p-8 sm:p-12">
            <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-periwinkle/20 blur-[100px]" />
            <div className="relative grid gap-10 lg:grid-cols-[1fr_1.4fr]">
              <div className="space-y-6">
                <Eyebrow>Social / Featured story</Eyebrow>
                <h2 className="font-display text-3xl leading-tight text-white sm:text-4xl">
                  Connecting Policy with People:
                  <br />
                  <span className="text-gradient italic">The Future of ESG</span>
                </h2>
                <div className="flex items-center gap-4">
                  <img
                    src="/images/swapnil-choure.jpg"
                    alt="Swapnil Choure"
                    loading="lazy"
                    className="h-14 w-14 rounded-full border border-white/15 object-cover"
                  />
                  <div>
                    <p className="font-semibold text-white">Swapnil Choure</p>
                    <p className="text-xs text-muted-foreground">
                      Originally published on LinkedIn · 10 June 2026
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-5">
                <p className="leading-relaxed text-white/90">
                  Swapnil explores how ESG strategies can become more meaningful when workers, small
                  businesses and grassroots communities help shape the decisions affecting their
                  lives.
                </p>
                <p className="leading-relaxed text-muted-foreground">
                  The story calls for listening before policy design, transparent collaboration and
                  attention to social and ecological outcomes, helping organisations respond to
                  uncertainty with inclusive, adaptable strategies.
                </p>
                <Expandable label="Explore the key ideas">
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {[
                      [
                        "Listen to lived experience",
                        "bring community perspectives into sustainability planning.",
                      ],
                      [
                        "Connect ambition with accountability",
                        "focus on tangible outcomes for people and ecosystems.",
                      ],
                      [
                        "Build shared ownership",
                        "strengthen trust through transparency and participation.",
                      ],
                      [
                        "Plan for change",
                        "keep strategies responsive to evolving risks and local realities.",
                      ],
                    ].map(([k, v]) => (
                      <li
                        key={k}
                        className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-sm text-muted-foreground"
                      >
                        <strong className="block text-white">{k}:</strong> {v}
                      </li>
                    ))}
                  </ul>
                </Expandable>
                <div className="space-y-2 pt-2">
                  <CtaExternal href="https://www.linkedin.com/pulse/connecting-policy-people-future-esg-swapnil-choure-csm3f/">
                    Read the full story on LinkedIn
                  </CtaExternal>
                  <Note>
                    CliSo editorial summary of the linked article. Opens LinkedIn in a new tab.
                  </Note>
                </div>
              </div>
            </div>
          </GlassCard>
        </Reveal>
      </Section>

      <Section id="media" className="pt-0 sm:pt-0">
        <Reveal>
          <GlassCard className="flex flex-col items-start gap-8 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-6">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-indigo-cosmic/80 text-lavender">
                <Newspaper className="h-6 w-6" />
              </span>
              <div className="space-y-3">
                <Eyebrow>Media & press</Eyebrow>
                <h2 className="font-display text-3xl text-white">
                  The CliSo Tech <span className="text-gradient italic">newsroom.</span>
                </h2>
                <p className="max-w-xl text-muted-foreground">
                  Company announcements, media resources and press updates will be shared here as
                  they become available.
                </p>
              </div>
            </div>
            <CtaLink to="/contact" variant="ghost">
              Media enquiries
            </CtaLink>
          </GlassCard>
        </Reveal>
      </Section>
    </>
  );
}

function Expandable({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-lavender hover:text-white"
      >
        {label}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0, rotateX: -20 }}
            animate={{ height: "auto", opacity: 1, rotateX: 0 }}
            exit={{ height: 0, opacity: 0, rotateX: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformPerspective: 800, transformOrigin: "50% 0%" }}
            className="overflow-hidden"
          >
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
