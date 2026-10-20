import { AnimatePresence, motion } from "motion/react";
import { Stagger, StaggerItem, Tilt } from "@/components/site/motion";
import { cn } from "@/lib/utils";
import { CHECKS, SOURCES } from "./data";
import { Callout, Meter, Panel, Pill, TabIntro } from "./ui";

const STEPS: [string, string][] = [
  [
    "Locate & quantify exposure",
    "Geocode assets, population grids and critical services. Overlay hazard footprints at matching resolution. Report exposed people, asset value and data year.",
  ],
  [
    "Model scenario impacts",
    "Use bias-corrected CMIP6 ensembles for each SSP and horizon. Apply sector-specific vulnerability curves and adaptation assumptions; retain ensemble uncertainty.",
  ],
  [
    "Manage & monitor",
    "Prioritize continuity plans, nature-based measures, resilient design and warning response. Assign owners, budgets and review dates; evaluate residual risk.",
  ],
];

const IMPACT_METHOD: [string, string][] = [
  ["Exposure", "intersection of hazard footprint with population, assets and economic activity."],
  [
    "Event loss",
    "exposed asset value × hazard-specific damage ratio, accounting for protection and vulnerability.",
  ],
  [
    "Expected annual loss",
    "integrate losses over exceedance probabilities using a complete event set. Avoid double-counting compound events.",
  ],
  [
    "People",
    "report exposure separately from mortality, health impacts and displacement; each requires a distinct vulnerability model.",
  ],
  [
    "Transition risk",
    "use policy, energy-price and technology scenarios such as NGFS, with Climate TRACE for emissions context. SSP warming alone is insufficient.",
  ],
];

export function ManageTab({ checked, toggle }: { checked: number[]; toggle: (i: number) => void }) {
  return (
    <div className="space-y-6">
      <TabIntro eyebrow="Assessment → Action" title="Turn screening into a resilience plan." />

      <Stagger className="grid gap-5 md:grid-cols-3">
        {STEPS.map(([title, text], i) => (
          <StaggerItem key={title}>
            <Tilt className="h-full rounded-3xl">
              <div className="glass glow-border relative h-full overflow-hidden rounded-3xl p-7">
                <span className="pointer-events-none absolute -right-2 -top-6 font-display text-[110px] leading-none text-periwinkle/10">
                  0{i + 1}
                </span>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-periwinkle/40 bg-periwinkle/15 font-mono text-sm text-lavender">
                  0{i + 1}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            </Tilt>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          title="Assessment readiness"
          badge={
            <Pill tone={checked.length === CHECKS.length ? "good" : "default"}>
              {checked.length} of {CHECKS.length} readiness items complete
            </Pill>
          }
        >
          <Meter value={checked.length} max={CHECKS.length} />
          <div className="mt-5 space-y-2">
            {CHECKS.map((t, i) => {
              const on = checked.includes(i);
              return (
                <label
                  key={t}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-colors",
                    on
                      ? "border-periwinkle/40 bg-periwinkle/10 text-white"
                      : "border-white/[0.07] bg-white/[0.02] text-white/80 hover:border-white/15",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggle(i)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-lavender",
                      on ? "border-periwinkle bg-periwinkle" : "border-white/25",
                    )}
                  >
                    <AnimatePresence>
                      {on && (
                        <motion.svg
                          viewBox="0 0 16 16"
                          className="h-3.5 w-3.5"
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0 }}
                        >
                          <path
                            d="M3 8.5l3 3 7-7"
                            fill="none"
                            stroke="#fff"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </motion.svg>
                      )}
                    </AnimatePresence>
                  </span>
                  {t}
                </label>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Your checklist is saved in this browser. Completed items do not certify model quality.
          </p>
        </Panel>

        <Panel title="How impact should be calculated">
          <div className="mt-3 space-y-3">
            {IMPACT_METHOD.map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  <b className="text-white">{k}:</b> {v}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function SourcesTab() {
  return (
    <div className="space-y-6">
      <TabIntro
        eyebrow="Provenance & model transparency"
        title="Know what is behind each signal."
        text="Sources reviewed on 10 October 2026. Portal availability does not imply API access or permission to redistribute every dataset."
      />

      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SOURCES.map(([name, url, status, desc]) => (
          <StaggerItem key={name}>
            <Tilt max={6} className="h-full rounded-3xl">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass group flex h-full flex-col rounded-3xl p-5 transition-colors hover:border-periwinkle/40"
              >
                <h3 className="font-semibold text-white">
                  {name} <span className="text-lavender">↗</span>
                </h3>
                <Pill tone="muted" className="mt-3 self-start">
                  {status}
                </Pill>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </a>
            </Tilt>
          </StaggerItem>
        ))}
      </Stagger>

      <Panel title="Model contract & production requirements">
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <Callout>
            <b>Current implementation:</b> server-mediated NASA EONET request on load, on refresh
            and every 15 minutes while open, with a 15-minute server cache. Shows retrieval time and
            individual geometry dates. SACHET RSS and on-demand CAP details are retrieved
            server-side with conditional caching; IMD adapters report access status. Financial
            assessment uses Economic Survey GVA with explicit stress assumptions. No background
            ingestion or alert delivery is configured.
          </Callout>
          <Callout>
            <b>Scenario evidence:</b> IPCC AR6 global warming best estimates and very likely ranges
            (5–95%). The chart is a connection of three 20-year averages, not an annual simulation.
            No numerical local SSP hazard projections are provided.
          </Callout>
          <Callout>
            <b>Illustrative sensitivity:</b> manually assigned 1–5 values describe demonstration
            sector sensitivity to hazards; they are not empirical probabilities, composite country
            rankings or loss predictions. Regional descriptions are planning hypotheses.
          </Callout>
          <Callout>
            <b>Production pathway:</b> secure approved feeds server-side; record source issue time,
            retrieval time, validity period, resolution, license and confidence. Version CMIP6
            hazard datasets and vulnerability functions. Add asset/population overlays, historical
            validation, uncertainty bands, audit trails and event-specific trigger rules. Missing or
            stale data must remain unavailable rather than become zero.
          </Callout>
          <Callout className="lg:col-span-2">
            <b>Scope:</b> earthquakes, volcanoes and tsunamis are geophysical hazards and must be
            assessed separately; do not scale them with SSP emissions scenarios. Administrative
            boundaries are display-only and may differ from official national boundaries.
          </Callout>
        </div>
      </Panel>
    </div>
  );
}
