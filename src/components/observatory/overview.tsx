import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useMemo } from "react";
import type { EonetEvent, FeedResult } from "@/lib/climate-feeds.functions";
import { EONET_URL } from "@/lib/climate-feeds.functions";
import { Tilt } from "@/components/site/motion";
import { cn } from "@/lib/utils";
import {
  ALL_HAZARDS,
  COUNTRIES,
  HAZARDS,
  HORIZON_YEARS,
  IMPACTS,
  RANGES,
  SECTORS,
  SSP_SHORT,
  TEMPS,
  project,
  safeHttpsUrl,
} from "./data";
import { filterEvents, type Filters } from "./logic";
import { Callout, DataTable, ExtLink, Kpi, Meter, Panel, Pill } from "./ui";

const SSP_COLORS = ["#9FA2E8", "#736CED", "#FFFFFF"];

export function OverviewTab({
  filters,
  setGeo,
  feed,
  onOpenFinance,
}: {
  filters: Filters;
  setGeo: (g: string) => void;
  feed: FeedResult<EonetEvent[]> | undefined;
  onOpenFinance: () => void;
}) {
  const { geo, ssp, horizon, hazard } = filters;
  const connected = feed?.status === "connected";
  const allEvents = useMemo(() => (connected ? (feed.data ?? []) : []), [connected, feed]);
  const events = useMemo(() => filterEvents(allEvents, hazard, geo), [allEvents, hazard, geo]);
  const feedState = !feed ? "Connecting" : connected ? "Connected" : "Unavailable";
  const country = COUNTRIES.find((c) => c[0] === geo);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi
          highlight
          label="Global mean warming"
          value={`+${TEMPS[ssp][horizon].toFixed(1)}°C`}
          sub={`${RANGES[ssp][horizon]}°C · very likely range`}
        />
        <Kpi
          label="People exposed"
          value="Not calculated"
          sub="Requires population × hazard overlay"
        />
        <Kpi
          label="Financial assessment"
          value="India stress test"
          sub={
            <button
              type="button"
              onClick={onOpenFinance}
              className="font-semibold text-lavender hover:text-white"
            >
              Explore output disruption →
            </button>
          }
        />
        <Kpi
          label="Event feed"
          value={connected ? String(events.length) : feedState}
          sub={connected ? `Retrieved ${feed.retrievedAt}` : "NASA EONET · last 30 days"}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <Panel
          title="Global exposure explorer"
          badge={<Pill>{geo}</Pill>}
          subtitle="Choose a location to explore potential impact pathways."
        >
          <WorldMap geo={geo} setGeo={setGeo} events={events} />
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <i className="h-2 w-2 rounded-full bg-periwinkle" /> Illustrative country profiles
            </span>
            <span className="flex items-center gap-1.5">
              <i className="h-2 w-2 rounded-full bg-lavender ring-2 ring-white/60" /> Selected
              geography
            </span>
            <span className="flex items-center gap-1.5">
              <i className="h-2 w-2 rounded-full bg-white shadow-[0_0_8px_#fff]" /> NASA event
              locations
            </span>
          </div>
          <div className="mt-5 border-t border-white/[0.08] pt-5">
            <p className="font-semibold text-white">{geo}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {country
                ? country[3]
                : "Country examples identify potential impact pathways. Select a geography for a qualitative profile; this is not a global country risk ranking."}
            </p>
          </div>
        </Panel>

        <Panel
          title="Event monitor"
          badge={
            <Pill tone={connected ? "good" : feed ? "warn" : "muted"}>
              NASA EONET · {feedState}
            </Pill>
          }
        >
          <p className="text-sm text-muted-foreground">
            Curated natural-event metadata, not an exhaustive warning service. Events do not
            establish climate attribution.
          </p>
          <Callout className="my-4 text-xs">
            {connected
              ? `Evidence: NASA API data via server cache. Source retrieval/check time ${feed.retrievedAt}. ${allEvents.length} open records returned before category/location filters; ${events.length} matching climate-related records. Automatic refresh every 15 minutes while this page is open.`
              : feed
                ? "NASA response unavailable. No event count or synthetic records are substituted."
                : "Connecting directly to NASA EONET v3…"}
          </Callout>
          <div className="max-h-[430px] space-y-2 overflow-y-auto pr-1" aria-live="polite">
            {!connected ? (
              <p className="py-4 text-sm text-muted-foreground">
                {feed
                  ? "Feed unavailable. Use official warning portals; no cached or invented events are displayed."
                  : "Requesting curated event metadata…"}
              </p>
            ) : events.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">
                No matching events returned. This does not mean no hazard is present.
              </p>
            ) : (
              events.map((e) => <EventItem key={e.id} e={e} />)
            )}
            {connected && geo !== "World" && (
              <p className="pt-2 text-xs text-muted-foreground">
                Location filter uses a ±12° bounding window around the country locator, not national
                borders. Neighboring events may appear.
              </p>
            )}
          </div>
          <div className="mt-4 space-y-1 text-xs">
            <p>
              <ExtLink href={EONET_URL}>Inspect the NASA API response</ExtLink> ·{" "}
              <ExtLink href="https://eonet.gsfc.nasa.gov/">About EONET</ExtLink>
            </p>
            <p>
              <ExtLink href="https://mausam.imd.gov.in/">
                India: check official IMD warnings
              </ExtLink>
            </p>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <Panel
          title="Scenario trajectories"
          subtitle="Global temperature change relative to 1850–1900 · IPCC AR6 Table 4.5"
        >
          <ScenarioChart ssp={ssp} />
          <div className="mt-2 flex flex-wrap gap-5 text-[11px]">
            {SSP_SHORT.map((s, i) => (
              <span key={s} className="flex items-center gap-1.5" style={{ color: SSP_COLORS[i] }}>
                <i className="h-2 w-2 rounded-full" style={{ background: SSP_COLORS[i] }} /> {s}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Scenarios describe possible futures; they are not assigned probabilities. Global warming
            is not the local temperature change for India.
          </p>
        </Panel>
        <Panel
          title="Sector sensitivity explorer"
          subtitle="Illustrative sensitivity only · SSP selection does not generate local impacts"
        >
          <div className="divide-y divide-white/[0.06]">
            {SECTORS.map(([name, vals]) => {
              const n =
                hazard === ALL_HAZARDS
                  ? Math.max(...vals)
                  : vals[HAZARDS.indexOf(hazard as (typeof HAZARDS)[number])];
              return (
                <div key={name} className="flex items-end justify-between gap-4 py-3">
                  <div className="w-full text-sm text-white">
                    {name}
                    <Meter value={n} max={5} />
                  </div>
                  <b className="font-mono text-sm text-lavender">{n}/5</b>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <Panel title="From climate events to economic & human impacts">
        <div className="mt-3">
          <DataTable
            head={["Hazard", "Exposed systems", "Economic impact pathway", "People & livelihoods"]}
            rows={IMPACTS.filter((x) => hazard === ALL_HAZARDS || x[0] === hazard)}
          />
        </div>
      </Panel>
    </div>
  );
}

function EventItem({ e }: { e: EonetEvent }) {
  const g = e.latest;
  const coords = g?.coordinates;
  const magnitude =
    g?.magnitudeValue != null ? `${g.magnitudeValue} ${g.magnitudeUnit ?? ""}` : "Not supplied";
  return (
    <details className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 transition-colors open:border-periwinkle/40 open:bg-periwinkle/[0.06] hover:border-white/15">
      <summary className="cursor-pointer list-none">
        <span className="block text-sm font-semibold text-white">{e.title}</span>
        <span className="mt-1 block text-xs text-muted-foreground">
          {e.categories.map((c) => c.title).join(", ")} · observation {g?.date ?? "not supplied"}
        </span>
      </summary>
      <div className="mt-3 space-y-3 text-xs leading-relaxed text-muted-foreground [&_b]:text-white">
        <p>
          <b>NASA record:</b> {e.id}
          <br />
          <b>Event status:</b> {e.closed ? `Closed ${e.closed}` : "Open in NASA feed"}
          <br />
          <b>Latest geometry time (UTC):</b> {g?.date ?? "Not supplied"}
          <br />
          <b>Location:</b>{" "}
          {coords
            ? `${coords[1].toFixed(3)}° latitude, ${coords[0].toFixed(3)}° longitude`
            : (g?.type ?? "Not supplied")}
          <br />
          <b>Magnitude:</b> {magnitude}
          <br />
          <b>Geometry records:</b> {e.geometryCount}
        </p>
        <p>{e.description || "No description supplied by NASA."}</p>
        <p>
          <ExtLink href={safeHttpsUrl(e.link)}>NASA event metadata</ExtLink>
        </p>
        {e.sources.length > 0 && (
          <p>
            <b>Reporting sources:</b>{" "}
            {e.sources.map((s, i) => (
              <span key={s.id + i}>
                {i > 0 && " · "}
                <ExtLink href={safeHttpsUrl(s.url)}>{s.id}</ExtLink>
              </span>
            ))}
          </p>
        )}
        <p className="text-[11px] opacity-80">
          Retrieval time is distinct from the observation time. Source category does not prove
          climate attribution or severity.
        </p>
      </div>
    </details>
  );
}

function WorldMap({
  geo,
  setGeo,
  events,
}: {
  geo: string;
  setGeo: (g: string) => void;
  events: EonetEvent[];
}) {
  const { data: land, isError } = useQuery({
    queryKey: ["observatory", "world-paths"],
    queryFn: async () => {
      const r = await fetch("/data/world-paths.json");
      if (!r.ok) throw new Error("Boundaries unavailable");
      return (await r.json()) as { n: string; d: string }[];
    },
    staleTime: Infinity,
  });

  const graticule = useMemo(() => {
    const lines: string[] = [];
    for (let lon = -180; lon <= 180; lon += 30) lines.push(`M${project(lon, 0)[0]} 0V420`);
    for (let lat = -60; lat <= 60; lat += 30) lines.push(`M0 ${project(0, lat)[1]}H900`);
    return lines;
  }, []);

  return (
    <Tilt max={4} glare={false} className="mt-4 rounded-2xl">
      <div className="relative h-[260px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[radial-gradient(ellipse_at_30%_20%,rgb(31_29_89/0.7),rgb(5_6_15/0.9)_70%)] sm:h-[340px]">
        <svg viewBox="0 0 900 420" className="h-full w-full" aria-label="Global geographic locator">
          <g stroke="rgb(159 162 232 / 0.08)" strokeWidth={0.7}>
            {graticule.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
          <g>
            {land?.map((c) => (
              <path
                key={c.n + c.d.length}
                d={c.d}
                className="fill-lavender/[0.10] stroke-lavender/30 transition-colors duration-300 hover:fill-lavender/25"
                strokeWidth={0.5}
              >
                <title>{c.n}</title>
              </path>
            ))}
          </g>
          <g>
            {events.map((e) => {
              const p = e.latest?.coordinates;
              if (!p) return null;
              const [x, y] = project(p[0], p[1]);
              return (
                <circle
                  key={e.id}
                  cx={x}
                  cy={y}
                  r={2.6}
                  fill="#fff"
                  style={{ filter: "drop-shadow(0 0 4px #fff)" }}
                >
                  <title>{e.title}</title>
                </circle>
              );
            })}
          </g>
          <g>
            {COUNTRIES.map(([name, lon, lat]) => {
              const [x, y] = project(lon, lat);
              const selected = name === geo;
              const choose = () => setGeo(name);
              return (
                <g
                  key={name}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${name}`}
                  onClick={choose}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter" || ev.key === " ") {
                      ev.preventDefault();
                      choose();
                    }
                  }}
                  className="cursor-pointer outline-none"
                >
                  {selected && (
                    <motion.circle
                      cx={x}
                      cy={y}
                      r={7}
                      fill="none"
                      stroke="#9FA2E8"
                      initial={{ r: 7, opacity: 0.9 }}
                      animate={{ r: 20, opacity: 0 }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={selected ? 8 : 6.5}
                    className={cn(selected ? "fill-lavender" : "fill-periwinkle")}
                    stroke="#fff"
                    strokeWidth={selected ? 2.5 : 1.5}
                  />
                  <text x={x + 12} y={y + 4} fill="#fff" fontSize={12} fontWeight={600}>
                    {name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
        <span className="absolute bottom-3 left-3 rounded-lg border border-white/10 bg-void/80 px-3 py-1.5 text-[11px] text-muted-foreground backdrop-blur">
          {isError
            ? "Boundaries unavailable · geographic locator only"
            : land
              ? "Display boundaries · GeoJSON · not an official boundary map"
              : "Geographic locator · loading boundaries"}
        </span>
      </div>
    </Tilt>
  );
}

function ScenarioChart({ ssp }: { ssp: number }) {
  const xAt = (i: number) => 90 + i * 240;
  const yAt = (v: number) => 185 - v * 32;
  return (
    <svg viewBox="0 0 620 220" className="h-[220px] w-full">
      {[0, 1, 2, 3, 4, 5].map((t) => (
        <g key={t}>
          <path d={`M55 ${yAt(t)}H575`} stroke="rgb(142 146 170 / 0.15)" />
          <text x={22} y={yAt(t) + 4} fontSize={11} fill="#8E92AA">
            {t}°
          </text>
        </g>
      ))}
      {HORIZON_YEARS.map((year, i) => (
        <text key={year} x={xAt(i) - 15} y={210} fontSize={11} fill="#8E92AA">
          {year}
        </text>
      ))}
      {TEMPS.map((series, s) => {
        const active = s === ssp;
        return (
          <g key={s} opacity={active ? 1 : 0.45}>
            <motion.polyline
              points={series.map((v, i) => `${xAt(i)},${yAt(v)}`).join(" ")}
              fill="none"
              stroke={SSP_COLORS[s]}
              strokeWidth={active ? 3 : 1.5}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, delay: s * 0.15, ease: "easeInOut" }}
              style={active ? { filter: `drop-shadow(0 0 6px ${SSP_COLORS[s]})` } : undefined}
            />
            {series.map((v, i) => (
              <circle key={i} cx={xAt(i)} cy={yAt(v)} r={active ? 5 : 3.5} fill={SSP_COLORS[s]}>
                <title>{`${SSP_SHORT[s]} · ${HORIZON_YEARS[i]}: +${v.toFixed(1)}°C`}</title>
              </circle>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
