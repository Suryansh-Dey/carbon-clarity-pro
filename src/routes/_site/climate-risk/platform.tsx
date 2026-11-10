import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Building2, Factory, Scale } from "lucide-react";
import { useState } from "react";
import { Reveal } from "@/components/site/motion";
import { Eyebrow } from "@/components/site/ui";
import { ModuleIntro } from "@/components/platform/ui";
import { cn } from "@/lib/utils";
import {
  CITY_TAB_IDS,
  CitiesModule,
  type CityTab,
} from "@/components/platform/cities/cities-module";
import { EntitiesModule } from "@/components/platform/entities/entities-module";
import { StandardsModule } from "@/components/platform/entities/standards-module";

const MODULES = [
  {
    id: "cities",
    icon: Building2,
    name: "Cities & districts",
    blurb: "14 city profiles and all 640 Indian districts",
  },
  {
    id: "entities",
    icon: Factory,
    name: "Entities & sites",
    blurb: "Company sites on 19,550 Indian pincodes",
  },
  {
    id: "standards",
    icon: Scale,
    name: "Standards & regulation",
    blurb: "How the platform maps to ISSB, BRSR and more",
  },
] as const;
type ModuleId = (typeof MODULES)[number]["id"];
const MODULE_IDS = MODULES.map((m) => m.id) as readonly string[];

interface PlatformSearch {
  m?: Exclude<ModuleId, "cities">;
  city?: string;
  tab?: CityTab;
}

export const Route = createFileRoute("/_site/climate-risk/platform")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): PlatformSearch => ({
    ...(typeof s.m === "string" && MODULE_IDS.includes(s.m) && s.m !== "cities"
      ? { m: s.m as PlatformSearch["m"] }
      : {}),
    ...(typeof s.city === "string" && /^[a-z0-9-]{2,80}$/.test(s.city) ? { city: s.city } : {}),
    ...(typeof s.tab === "string" && CITY_TAB_IDS.includes(s.tab) && s.tab !== "profile"
      ? { tab: s.tab as CityTab }
      : {}),
  }),
  head: () => ({
    meta: [
      { title: "Climate Risk Platform — CliSo Tech" },
      {
        name: "description",
        content:
          "City and district climate risk atlas for India, Nepal and Sri Lanka, entity and site climate intelligence on 19,550 Indian pincodes, and a map of climate standards and regulation.",
      },
    ],
  }),
  component: PlatformPage,
});

function savedCity() {
  try {
    return localStorage.getItem("cra_city") || "mumbai";
  } catch {
    return "mumbai";
  }
}

function PlatformPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const mod: ModuleId = search.m ?? "cities";
  const [fallbackCity] = useState(savedCity);
  const [direction, setDirection] = useState(1);

  const setModule = (next: ModuleId) => {
    setDirection(MODULE_IDS.indexOf(next) >= MODULE_IDS.indexOf(mod) ? 1 : -1);
    void navigate({
      search: (s: PlatformSearch) => ({ ...s, m: next === "cities" ? undefined : next }),
      replace: true,
      resetScroll: false,
    });
  };

  return (
    <div className="relative pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(ellipse_60%_80%_at_15%_0%,rgb(31_29_89/0.85),transparent_70%)]"
      />
      <div
        aria-hidden
        className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[560px] opacity-40"
      />

      <section className="relative mx-auto max-w-7xl px-4 pt-32 sm:px-6 sm:pt-36 lg:px-8">
        <Reveal className="max-w-3xl space-y-5">
          <Link
            to="/climate-risk"
            className="flex w-fit items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-white"
          >
            ← Climate risk assessment
          </Link>
          <Eyebrow>CliSo Climate Risk Platform</Eyebrow>
          <h1 className="font-display text-5xl leading-[1.04] text-white sm:text-6xl">
            People first.
            <br />
            <span className="text-gradient italic">Then the price of risk.</span>
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Cities and districts, company sites and the standards they report to, scored for eight
            hazards under three IPCC scenarios and three horizons.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-3 sm:grid-cols-3" role="tablist" aria-label="Platform">
          {MODULES.map((m) => {
            const active = m.id === mod;
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setModule(m.id)}
                className={cn(
                  "group relative flex items-center gap-4 overflow-hidden rounded-3xl border p-5 text-left transition-colors",
                  active
                    ? "border-periwinkle/50"
                    : "border-white/10 bg-white/[0.02] hover:border-lavender/30 hover:bg-white/[0.04]",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="platform-module"
                    className="absolute inset-0 bg-gradient-to-br from-periwinkle/30 via-indigo-cosmic/60 to-midnight"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  />
                )}
                <span
                  className={cn(
                    "relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition-colors",
                    active
                      ? "bg-periwinkle text-white shadow-[0_0_40px_-10px_rgb(115_108_237/1)]"
                      : "bg-white/[0.05] text-lavender",
                  )}
                >
                  <m.icon className="h-5 w-5" />
                </span>
                <span className="relative min-w-0">
                  <span className="block font-semibold text-white">{m.name}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{m.blurb}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div
        className="relative mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8"
        style={{ perspective: 2000 }}
      >
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={mod}
            custom={direction}
            variants={{
              enter: (d: number) => ({ opacity: 0, rotateY: 10 * d, x: 80 * d, z: -160 }),
              center: { opacity: 1, rotateY: 0, x: 0, z: 0 },
              exit: (d: number) => ({ opacity: 0, rotateY: -8 * d, x: -60 * d, z: -160 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "50% 0%" }}
          >
            {mod === "cities" && (
              <>
                <ModuleIntro
                  title="City and District Climate Risk Atlas"
                  text="A city is its people first. For each city this atlas brings together population and vulnerability, geography, the economy and livelihoods, past disasters, government plans and the environmental-clearance regime, then scores eight hazards under three IPCC scenarios and three horizons and prices the impact on people and the economy. India first, with every one of India’s districts, plus Kathmandu and Colombo."
                  note={
                    <>
                      <b>How to use and trust it.</b> Population and age structure are nowcast live
                      from the last census with UN city growth rates (method in each City profile).
                      Other values come from official sources where they exist (census, state
                      economic surveys, NDMA, IMD, national adaptation plans) and from general
                      knowledge where they do not; every value carries its basis and each city a
                      confidence level. City GDP is rarely published officially, so those figures
                      are indicative. Loss figures are screening estimates from transparent formulas
                      explained in each tab and in Sources &amp; method. Edit any key input to match
                      your own data.
                    </>
                  }
                />
                <CitiesModule
                  cityId={search.city ?? fallbackCity}
                  tab={search.tab ?? "profile"}
                  onSelect={({ city, tab }) =>
                    void navigate({
                      search: (s: PlatformSearch) => ({
                        ...s,
                        ...(city ? { city } : {}),
                        ...(tab ? { tab: tab === "profile" ? undefined : tab } : {}),
                      }),
                      replace: true,
                      resetScroll: false,
                    })
                  }
                />
              </>
            )}
            {mod === "entities" && (
              <>
                <ModuleIntro
                  title="Entity & Site Climate Intelligence"
                  text="Enter an organisation and the site you care about. The site pincode sets the measured site profile (location, elevation, distance from the sea and rivers, terrain) and the hazard scores; the platform then adds climate, seismicity, demography, hazard history, impact chain, risks and opportunities, media themes, policies, best practice and peers, then prices the financial exposure under climate scenarios."
                  note={
                    <>
                      <b>How this works and its limits.</b> Enter the site pincode: location,
                      elevation, slope, distance to the coast and major rivers, and the flood,
                      cyclone, heat, landslide and coastal scores then come from a built-in dataset
                      of 19,550 Indian pincodes. The <b>Live data &amp; sources</b> tab lists
                      official sources from IMD, SACHET, CWC, CPCB and others for the site, and the{" "}
                      <b>Data dictionary</b> tab explains every attribute and figure. The built-in{" "}
                      <b>CG Power · Mandideep, Bhopal</b> example, with its history, impacts, media,
                      policy and peers, was assembled from web sources on 31 October 2026 plus
                      general knowledge, and its hazards are grounded on pincode 462046. Other sites
                      get a pincode-only analysis. Treat everything as screening, and verify before
                      disclosure or decisions.
                    </>
                  }
                />
                <EntitiesModule
                  onOpenCity={(id) => {
                    setDirection(-1);
                    void navigate({ search: { city: id }, replace: true });
                  }}
                />
              </>
            )}
            {mod === "standards" && (
              <>
                <ModuleIntro
                  title="Standards and regulation map"
                  text="How the platform lines up with global standards, national regulation and best practice."
                  note="Status as of late 2026; verify the current version of each before relying on it."
                />
                <StandardsModule />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
