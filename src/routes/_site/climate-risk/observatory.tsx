import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Reveal } from "@/components/site/motion";
import { Eyebrow } from "@/components/site/ui";
import { getEonetEvents, EONET_URL } from "@/lib/climate-feeds.functions";
import { cn } from "@/lib/utils";
import {
  ALL_HAZARDS,
  CHECKS,
  GEOGRAPHIES,
  HAZARDS,
  HORIZON_OPTIONS,
  RANGES,
  REGIONS,
  SOURCES,
  SSP_OPTIONS,
  TEMPS,
  type FinanceInputs,
} from "@/components/observatory/data";
import { Callout, GhostButton, PrimaryButton, SelectField } from "@/components/observatory/ui";
import { OverviewTab } from "@/components/observatory/overview";
import { IndiaTab } from "@/components/observatory/india";
import { WarningsTab } from "@/components/observatory/warnings";
import { FinanceTab } from "@/components/observatory/finance";
import { ManageTab, SourcesTab } from "@/components/observatory/manage";
import {
  downloadJson,
  useChecklist,
  useFinance,
  type Filters,
} from "@/components/observatory/logic";

const TABS = [
  ["overview", "Overview"],
  ["india", "India focus"],
  ["warnings", "India warnings"],
  ["finance", "Financial assessment"],
  ["manage", "Risk management"],
  ["sources", "Data & methodology"],
] as const;
type Tab = (typeof TABS)[number][0];
const TAB_IDS = TABS.map(([id]) => id) as readonly string[];

export const Route = createFileRoute("/_site/climate-risk/observatory")({
  validateSearch: (s: Record<string, unknown>): { tab?: Tab } =>
    typeof s.tab === "string" && TAB_IDS.includes(s.tab) && s.tab !== "overview"
      ? { tab: s.tab as Tab }
      : {},
  head: () => ({
    meta: [
      { title: "Climate Risk Observatory — CliSo Tech" },
      {
        name: "description",
        content:
          "Global event intelligence, India warning evidence and transparent economic stress testing: NASA EONET events, IPCC SSP scenarios, NDMA SACHET alerts and Economic Survey GVA stress tests.",
      },
    ],
  }),
  component: ObservatoryPage,
});

function ObservatoryPage() {
  const { tab = "overview" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const qc = useQueryClient();
  const [direction, setDirection] = useState(1);

  const [filters, setFilters] = useState<Filters>({
    geo: "World",
    ssp: 1,
    horizon: 1,
    hazard: ALL_HAZARDS,
  });
  const [region, setRegion] = useState(0);
  const [finance, setFinance] = useState<Record<keyof FinanceInputs, string>>({
    exposure: "10",
    days: "7",
    damage: "30",
    adaptation: "0",
  });
  const { checked, toggle } = useChecklist();
  const { assessment } = useFinance(finance, filters.ssp, filters.horizon);

  const eonet = useQuery({
    queryKey: ["observatory", "eonet"],
    queryFn: () => getEonetEvents(),
    refetchInterval: 15 * 60 * 1000,
    staleTime: 60_000,
  });

  const setGeo = (geo: string) => setFilters((f) => ({ ...f, geo }));
  const go = (next: Tab) => {
    setDirection(TAB_IDS.indexOf(next) >= TAB_IDS.indexOf(tab) ? 1 : -1);
    if (next === "india") setGeo("India");
    void navigate({
      search: next === "overview" ? {} : { tab: next },
      replace: true,
      resetScroll: false,
    });
  };

  const exportAssessment = () => {
    const { geo, ssp, horizon, hazard } = filters;
    const feed = eonet.data;
    const status = (key: string[]) => {
      const d = qc.getQueryData<{ status: string; retrievedAt: string }>(key);
      return d ? { status: d.status, retrievedAt: d.retrievedAt } : null;
    };
    downloadJson("climate-risk-assessment.json", {
      title: "Climate Risk Observatory screening assessment",
      exportedAt: new Date().toISOString(),
      geography: geo,
      hazard,
      scenario: SSP_OPTIONS[ssp],
      horizon: HORIZON_OPTIONS[horizon],
      globalWarming: {
        bestEstimateC: TEMPS[ssp][horizon],
        veryLikelyRangeC: RANGES[ssp][horizon],
        baseline: "1850–1900",
        source: SOURCES[10][1],
      },
      peopleExposed: null,
      economicLoss: null,
      limitations:
        "Exposure and impact not calculated. Sector sensitivity and regional profiles are illustrative. Country event filters are bounding windows. SSP values are global, not local.",
      indiaRegion: REGIONS[region],
      eventFeed: {
        endpoint: EONET_URL,
        refreshIntervalMinutes: 15,
        state: !feed ? "Connecting" : feed.status === "connected" ? "Connected" : "Unavailable",
        retrievedAt: feed?.retrievedAt ?? null,
        events: feed?.status === "connected" ? feed.data : [],
      },
      readiness: CHECKS.map((item, i) => ({ item, complete: checked.includes(i) })),
      sources: SOURCES,
      financialAssessment: assessment,
      indiaFeedStatus: {
        sachet: status(["observatory", "sachet"]),
        warnings: status(["observatory", "imd-warnings"]),
      },
    });
  };

  const showFilters = tab === "overview" || tab === "finance";

  return (
    <div className="relative pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_60%_80%_at_15%_0%,rgb(31_29_89/0.85),transparent_70%)]"
      />
      <div
        aria-hidden
        className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[520px] opacity-40"
      />

      <section className="relative mx-auto max-w-7xl px-4 pt-32 sm:px-6 sm:pt-36 lg:px-8">
        <Reveal className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-5">
            <Link
              to="/climate-risk"
              className="flex w-fit items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-white"
            >
              ← Climate risk assessment
            </Link>
            <Eyebrow>Global intelligence · Local resilience</Eyebrow>
            <h1 className="font-display text-5xl leading-[1.04] text-white sm:text-6xl">
              Climate intelligence.
              <br />
              <span className="text-gradient italic">Resilience decisions.</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Global event intelligence, India warning evidence and transparent economic stress
              testing.
            </p>
          </div>
          <PrimaryButton onClick={exportAssessment} className="self-start lg:self-auto">
            ↓ Export assessment
          </PrimaryButton>
        </Reveal>

        <Reveal delay={0.1}>
          <Callout className="mt-10">
            <b>Evidence first.</b> Near-real-time natural-event metadata comes directly from{" "}
            <a href="https://eonet.gsfc.nasa.gov/docs/v3" target="_blank" rel="noopener noreferrer">
              NASA EONET v3
            </a>
            . Every event exposes its NASA record, reporting sources, observation geometry and time
            stamps. SSP warming values are IPCC projections. Regional profiles and sensitivity
            scores are illustrative screening inputs, not measured exposure or predicted losses.
            India warnings use SACHET’s official RSS and CAP records. IMD API adapters report access
            restrictions. Financial estimates are conditional stress tests, not observed disaster
            losses.
          </Callout>
        </Reveal>
      </section>

      <div className="sticky top-[84px] z-30 mt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Observatory sections"
            className="flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-midnight/95 p-1.5 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.9)] backdrop-blur-xl [scrollbar-width:none]"
          >
            {TABS.map(([id, label]) => {
              const active = id === tab;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => go(id)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
                    active ? "text-white" : "text-muted-foreground hover:text-white",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="observatory-tab"
                      className="absolute inset-0 rounded-xl bg-periwinkle shadow-[0_8px_30px_-8px_rgb(115_108_237/0.9)]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">{label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatePresence initial={false}>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="glass mt-6 grid grid-cols-2 items-end gap-4 rounded-3xl p-5 md:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
                <SelectField
                  label="Geography"
                  value={filters.geo}
                  onChange={(e) => setGeo(e.target.value)}
                >
                  {GEOGRAPHIES.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </SelectField>
                <SelectField
                  label="Climate scenario"
                  value={filters.ssp}
                  onChange={(e) => setFilters((f) => ({ ...f, ssp: Number(e.target.value) }))}
                >
                  {SSP_OPTIONS.map((o, i) => (
                    <option key={o} value={i}>
                      {o}
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  label="Time horizon"
                  value={filters.horizon}
                  onChange={(e) => setFilters((f) => ({ ...f, horizon: Number(e.target.value) }))}
                >
                  {HORIZON_OPTIONS.map((o, i) => (
                    <option key={o} value={i}>
                      {o}
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  label="Hazard"
                  value={filters.hazard}
                  onChange={(e) => setFilters((f) => ({ ...f, hazard: e.target.value }))}
                >
                  {[ALL_HAZARDS, ...HAZARDS].map((h) => (
                    <option key={h}>{h}</option>
                  ))}
                </SelectField>
                <GhostButton
                  className="col-span-2 md:col-span-1"
                  disabled={eonet.isFetching}
                  onClick={() => void eonet.refetch()}
                >
                  <motion.span
                    className="inline-block"
                    animate={eonet.isFetching ? { rotate: 360 } : { rotate: 0 }}
                    transition={
                      eonet.isFetching
                        ? { duration: 1, repeat: Infinity, ease: "linear" }
                        : { duration: 0 }
                    }
                  >
                    ↻
                  </motion.span>
                  {eonet.isFetching ? "Connecting…" : "Refresh events"}
                </GhostButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8" style={{ perspective: 1800 }}>
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={tab}
              custom={direction}
              variants={{
                enter: (d: number) => ({ opacity: 0, rotateY: 14 * d, x: 60 * d, z: -120 }),
                center: { opacity: 1, rotateY: 0, x: 0, z: 0 },
                exit: (d: number) => ({ opacity: 0, rotateY: -10 * d, x: -40 * d, z: -120 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "50% 0%" }}
            >
              {tab === "overview" && (
                <OverviewTab
                  filters={filters}
                  setGeo={setGeo}
                  feed={eonet.data}
                  onOpenFinance={() => go("finance")}
                />
              )}
              {tab === "india" && <IndiaTab region={region} setRegion={setRegion} />}
              {tab === "warnings" && <WarningsTab />}
              {tab === "finance" && (
                <FinanceTab
                  raw={finance}
                  setRaw={setFinance}
                  ssp={filters.ssp}
                  horizon={filters.horizon}
                />
              )}
              {tab === "manage" && <ManageTab checked={checked} toggle={toggle} />}
              {tab === "sources" && <SourcesTab />}
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="mt-14 border-t border-white/[0.08] pt-6 text-center text-xs text-muted-foreground">
          Climate Risk Observatory · Screening and planning workspace · Official emergency decisions
          should follow national and local authorities.
        </p>
      </div>
    </div>
  );
}
