import { Callout, ExtLink, Pill } from "@/components/observatory/ui";
import { cn } from "@/lib/utils";
import { kmx as km } from "../cities/model";
import { fmt } from "../format";
import { Band, Bullets, Card, EventList, Grid, Score, Stat, Table, riskColor } from "../ui";
import type { EntCtx } from "./context";
import { ACT, CASES, HL, HZ, KW } from "./data";
import { ranked } from "./model";
import type { Analysis, Narrative } from "./types";
import { HazardIcon, HowToRead } from "./ui";

const hazardOf = (x: { t: string; d: string }) => {
  const t = (x.t + " " + x.d).toLowerCase();
  return KW.findIndex((a) => a.some((w) => t.includes(w)));
};
const matches = (i: number) => (x: { t: string; d: string }) =>
  KW[i].some((k) => (x.t + " " + x.d).toLowerCase().includes(k));

export function NoNarrative() {
  return (
    <Card title="Narrative not available for a pincode-only analysis">
      <p className="text-sm leading-relaxed text-muted-foreground">
        History, impacts, media, policy and peers are included in the built-in CG Power example. For
        other sites, the site profile, hazards, financial exposure, resilience costs and disclosure
        draft work from the pincode data alone.
      </p>
    </Card>
  );
}

export function SiteTab(x: EntCtx) {
  const { A, B, hs, hv, ci, ui, setUi } = x;
  const e = A.entity,
    g = A.geo;
  const ord = ranked(hs);
  const sel = ui.sel > 6 ? ord[0] : ui.sel;
  const st: [string, string | undefined][] = [
    ["Elevation", g.elev],
    ["Distance to sea", g.coast],
    ["Topography", g.topo],
    ["Climate", g.climate],
    ["Rainfall", g.rain],
    ["Peak temperatures", g.tmax],
    ["Seismicity", g.seismic],
    ["Water bodies / stress", g.water],
    ["Land use around site", g.land],
  ];
  const past = B ? (B.events || []).filter(matches(sel)) : [];
  return (
    <div className="space-y-5">
      <Card
        title={`${e.name} · ${g.place}`}
        sub={
          <>
            {e.sector} · {g.state}, {g.country} · confidence:{" "}
            <b className="text-white">{A.conf || "unknown"}</b>
            {A.note ? " · " + A.note : ""}
          </>
        }
      >
        <p className="text-sm leading-relaxed text-white/90">{e.business}</p>
      </Card>
      <Grid cols={3}>
        {st.map(([l, v]) => (
          <div key={l} className="glass rounded-3xl p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {l}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white">{v}</p>
          </div>
        ))}
      </Grid>
      <Grid>
        <Card title="Demography and people nearby" sub={`${A.demo.pop} · ${A.demo.density}`}>
          <p className="text-sm leading-relaxed text-muted-foreground">{A.demo.notes}</p>
        </Card>
        <Card title="Hazard exposure · tap for detail" sub={`${HL[hv]} · ${CASES[ci].n}`}>
          <div className="space-y-1">
            {ord.map((i) => (
              <button
                key={i}
                type="button"
                aria-pressed={i == sel}
                onClick={() => setUi({ sel: i })}
                className={cn(
                  "grid w-full grid-cols-[minmax(110px,170px)_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-3 py-2 text-left text-[13px] transition-colors",
                  i == sel ? "bg-periwinkle/15 ring-1 ring-periwinkle/40" : "hover:bg-white/[0.04]",
                )}
              >
                <span className="flex items-center gap-2 text-white">
                  <HazardIcon i={i} size={16} />
                  {HZ[i]}
                </span>
                <span className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <span
                    className="block h-full rounded-full transition-[width] duration-500"
                    style={{ width: `${(hs[i] / 5) * 100}%`, background: riskColor(hs[i]) }}
                  />
                </span>
                <b className="w-8 text-right tabular-nums text-white">{hs[i].toFixed(1)}</b>
              </button>
            ))}
          </div>
        </Card>
      </Grid>
      <Card
        title={
          <span className="flex items-center gap-3">
            <HazardIcon i={sel} size={26} />
            {HZ[sel]} · why and what to do
          </span>
        }
      >
        <p className="text-sm leading-relaxed text-white/90">{A.haz[sel][1]}</p>
        {B && (
          <div className="mt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Past events
            </p>
            {past.length ? (
              <EventList items={past} />
            ) : (
              <p className="text-sm text-muted-foreground">
                No matching past events listed for this hazard.
              </p>
            )}
          </div>
        )}
        <p className="mb-3 mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Recommended actions
        </p>
        <Bullets items={ACT[HZ[sel]]} />
      </Card>
      <PinCard A={A} />
      <NearbyCard {...x} />
      <Hotspots {...x} />
      <HowToRead i={0} />
    </div>
  );
}

function PinCard({ A }: { A: Analysis }) {
  const P = A.pin;
  if (!P)
    return (
      <Card
        title="Measured site data"
        sub="No pincode was given. Enter a site pincode and press Analyse to ground the site."
      />
    );
  const F: [string, string][] = [
    ["Pincode", P.pin + " · " + P.name],
    ["District, state", P.district + ", " + P.state],
    ["Coordinates", P.lat.toFixed(3) + ", " + P.lon.toFixed(3)],
    ["Elevation", P.el + " m"],
    ["Above nearby low ground", P.rel + " m"],
    ["Slope / relief", P.sl + "° / " + P.rg + " m"],
    ["Distance to coast", km(P.dc) + " km"],
    ["Distance to major river", km(P.dr) + " km"],
    ["Summer maximum (est.)", P.tmax + " °C"],
    ["Setting", P.cls + " · " + P.nb + " pincodes within 5 km"],
    ["Seismic zone (state)", P.zone],
    ["Post offices", String(P.off)],
  ];
  return (
    <Card
      title={`Measured site data · pincode ${P.pin}`}
      sub="From the India Post pincode directory (average post-office location), a ~300 m global terrain model and Natural Earth coastline and rivers. Heat, rainfall and cyclone inputs are state-level estimates adjusted for elevation and coast."
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-4">
        {F.map(([l, v]) => (
          <div key={l} className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {l}
            </p>
            <p className="mt-1 text-sm font-semibold text-white">{v}</p>
          </div>
        ))}
      </div>
      <h4 className="mb-3 mt-7 text-sm font-semibold text-white">
        Where each hazard score comes from
      </h4>
      <Table
        num={[1, 3]}
        head={["Hazard", "Score today (1–5)", "Source", "AI estimate before grounding"]}
        rows={HZ.map((n, i) => [
          n,
          <b key="s" className="text-white">
            {(+A.haz[i][0]).toFixed(1)}
          </b>,
          <Pill key="p" tone={/AI/.test(A.haz[i][2] || "") ? "warn" : "good"}>
            {A.haz[i][2] || ""}
          </Pill>,
          A.hai && A.hai[i] ? (+A.hai[i]!).toFixed(1) : "—",
        ])}
      />
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        <ExtLink
          href={`https://www.openstreetmap.org/?mlat=${P.lat}&mlon=${P.lon}#map=14/${P.lat}/${P.lon}`}
        >
          Open the site in OpenStreetMap
        </ExtLink>{" "}
        to check the location. The pincode centre can be a few kilometres from the plant; for large
        plants, also check the plant’s own coordinates.
      </p>
    </Card>
  );
}

/** City hazard order used by the Cities module. */
const CITY_HZ = [
  "Flood",
  "Coastal & sea level",
  "Cyclone & storm",
  "Extreme heat",
  "Drought & water stress",
  "Landslide",
  "Earthquake",
  "Air quality",
];

function NearbyCard({ A, nearby, openCity }: EntCtx) {
  if (!A.pin) return null;
  if (nearby === undefined)
    return <Card title="City context" sub="Loading cities and districts…" />;
  if (!nearby)
    return (
      <Card
        title="City context"
        sub="No city profile within 60 km of this site yet. Add the nearest city in the Cities module."
      />
    );
  const { c, d } = nearby,
    dist = !!c.district;
  const top = CITY_HZ.map((h, i): [string, number] => [h, c.haz[i]])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  return (
    <Card
      title={
        (dist ? "District context · " : "City context · ") +
        c.name +
        (dist ? "" : ` (${fmt(d, 0)} km away)`)
      }
      sub="The site depends on the city around it for workers, water, power, roads and markets. City-level risks reach the site even when the plot itself is safe."
    >
      <div className="grid gap-6 md:grid-cols-3">
        <Stat
          label={`${dist ? "District" : "City"} population today`}
          value={`${fmt(c.popM, 1)} million`}
        />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Leading hazards today
          </p>
          <p className="mt-2 text-sm text-white">
            {top.map((t) => `${t[0]} (${t[1]})`).join(", ")}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Local environmental conditions
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            {(c.ec || [])[0] || ""}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => openCity(c.id)}
        className="mt-6 rounded-full bg-periwinkle px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_rgb(115_108_237/0.9)] transition-transform hover:-translate-y-0.5"
      >
        Open the {c.name} assessment
      </button>
    </Card>
  );
}

function Hotspots({ A, B, hs, o }: EntCtx) {
  const cols: [string, number[]][] = [
    ["Today", A.haz.map((x) => x[0])],
    ...[0, 1, 2].map((h): [string, number[]] => [HL[h].split(" (")[0], o[h].hs]),
  ];
  const evs = B?.events || [];
  const top4 = ranked(hs).slice(0, 4);
  return (
    <>
      <Card
        title="Hazard hotspot matrix"
        sub="Scores today and under the selected scenario for each horizon"
      >
        <Table
          minWidth={620}
          head={["Hazard", ...cols.map((c) => c[0])]}
          rows={HZ.map((n, i) => [
            <span key="h" className="flex items-center gap-2">
              <HazardIcon i={i} size={18} />
              {n}
            </span>,
            ...cols.map((c) => <Score key={c[0]} level={+c[1][i]} />),
          ])}
        />
      </Card>
      <Grid>
        {top4.map((i) => {
          const ev = evs.filter(matches(i)).sort((a, b) => b.y - a.y)[0];
          return (
            <Card key={i}>
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-periwinkle/15">
                  <HazardIcon i={i} size={32} />
                </span>
                <div>
                  <p className="font-semibold text-white">{HZ[i]}</p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    score {hs[i].toFixed(1)} <Band v={hs[i]} />
                  </p>
                </div>
              </div>
              <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
                {A.haz[i][1]}
              </p>
              {ev && (
                <p className="mt-3 text-[13px] leading-relaxed text-white/90">
                  <b>Recent event ({ev.y}):</b> {ev.d}
                </p>
              )}
            </Card>
          );
        })}
      </Grid>
      {evs.length > 0 && (
        <Card
          title="Event timeline"
          sub="Newest first. The icon shows the hazard type; a tag marks events that match this site’s current hotspots."
        >
          <Timeline evs={evs} hs={hs} />
        </Card>
      )}
    </>
  );
}

function Timeline({ evs, hs }: { evs: Narrative["events"]; hs: number[] }) {
  const L = evs.filter((x) => +x.y > 0).sort((a, b) => b.y - a.y);
  const cnt = HZ.map((_, i) => L.filter((x) => hazardOf(x) == i).length),
    top = ranked(hs).slice(0, 3);
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        Events by hazard:
        {cnt.map((c, i) =>
          c ? (
            <Pill key={i}>
              {HZ[i]} {c}
            </Pill>
          ) : null,
        )}
      </div>
      <ol className="relative ml-2 border-l border-lavender/20">
        {L.map((x, k) => {
          const i = hazardOf(x);
          return (
            <li key={k} className="relative pb-6 pl-7 last:pb-0">
              <span className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-periwinkle shadow-[0_0_12px_rgb(115_108_237/0.9)]" />
              <div className="flex flex-wrap items-center gap-2">
                <b className="font-display text-xl text-white">{x.y}</b>
                {i >= 0 && <HazardIcon i={i} size={20} />}
                <Pill tone="muted">{x.t}</Pill>
                {i >= 0 && top.includes(i) && <Pill tone="bad">Matches a current hotspot</Pill>}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-white/90">{x.d}</p>
            </li>
          );
        })}
      </ol>
    </>
  );
}

export function ChainTab({ B }: EntCtx) {
  return (
    <div className="space-y-5">
      {B ? (
        <>
          <Card title="Hazard and incident history">
            <EventList items={B.events.slice().sort((a, b) => a.y - b.y)} />
          </Card>
          <Grid cols={3}>
            <Card title="Impact on operations">
              <Bullets items={B.ops} />
            </Card>
            <Card title="Impact on neighbours and environment">
              <Bullets items={B.ext} />
            </Card>
            <Card title="Value chain impact">
              <Bullets items={B.vc} />
            </Card>
          </Grid>
        </>
      ) : (
        <NoNarrative />
      )}
      <HowToRead i={1} />
    </div>
  );
}

export function RisksTab({ A, B }: EntCtx) {
  const e = A.entity;
  return (
    <div className="space-y-5">
      {B ? (
        <>
          <Grid>
            <Card title="Physical risks">
              <Bullets items={B.risks.phys} />
            </Card>
            <Card
              title="Transition risks"
              how={
                <>
                  Transition exposure (policy, technology, market, reputation):{" "}
                  <b>{e.trans.join(" / ")}</b> out of 5
                  {e.cbam == 1
                    ? " · direct CBAM exposure"
                    : e.cbam == 2
                      ? " · indirect CBAM exposure"
                      : ""}
                </>
              }
            >
              <Bullets items={B.risks.trans} />
            </Card>
          </Grid>
          <Card title="Opportunities">
            <Bullets items={B.opps} />
          </Card>
        </>
      ) : (
        <NoNarrative />
      )}
      <HowToRead i={2} />
    </div>
  );
}

export function MediaTab({ A, C, demo }: EntCtx) {
  return (
    <div className="space-y-5">
      {C ? (
        <>
          <Grid>
            {C.media.map((m) => (
              <Card key={m.t}>
                <Pill
                  tone={
                    /risk/i.test(m.tone) ? "bad" : /positive/i.test(m.tone) ? "good" : "default"
                  }
                >
                  {m.tone}
                </Pill>
                <h3 className="mt-3 text-balance font-sans text-lg font-semibold leading-snug text-white">
                  {m.t}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.d}</p>
                <p className="mt-4 flex flex-wrap gap-4 text-xs">
                  {m.u && /^https:\/\//.test(m.u) && <ExtLink href={m.u}>Source</ExtLink>}
                  <ExtLink
                    href={`https://news.google.com/search?q=${encodeURIComponent(A.entity.name + " " + A.geo.place + " " + m.t)}`}
                  >
                    Search live news
                  </ExtLink>
                </p>
              </Card>
            ))}
          </Grid>
          <p className="text-xs text-muted-foreground">
            {demo
              ? "Items for the built-in example were drawn from the linked news and company sources."
              : "Themes are recollections of past coverage, not live news. Use the search links to confirm."}
          </p>
        </>
      ) : (
        <NoNarrative />
      )}
      <HowToRead i={3} />
    </div>
  );
}

export function PolicyTab({ C }: EntCtx) {
  return (
    <div className="space-y-5">
      {C ? (
        <>
          <Card title="Government policies and measures">
            <Table
              head={["Policy", "Level", "Relevance"]}
              rows={C.policy.map((p) => [<b key="n">{p.n}</b>, p.l, p.d])}
            />
          </Card>
          <Grid>
            <Card title="Best practices already in use">
              <div className="space-y-4">
                {C.practices.map((p) => (
                  <p key={p.c + p.d} className="text-sm leading-relaxed text-muted-foreground">
                    <b className="text-white">{p.c}</b>
                    <br />
                    {p.d}
                  </p>
                ))}
              </div>
            </Card>
            <Card title="Peers and what they are doing">
              <div className="space-y-4">
                {C.peers.map((p) => (
                  <p key={p.n} className="text-sm leading-relaxed text-muted-foreground">
                    <b className="text-white">{p.n}</b>
                    <br />
                    {p.d}
                  </p>
                ))}
              </div>
              <Callout className="mt-5">
                Peer actions are from general knowledge; confirm in each company’s latest
                sustainability report.
              </Callout>
            </Card>
          </Grid>
        </>
      ) : (
        <NoNarrative />
      )}
      <HowToRead i={4} />
    </div>
  );
}
