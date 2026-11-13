import { ExtLink } from "@/components/observatory/ui";
import { fmt } from "../format";
import { Bullets, Card, Score, Stat, Table } from "../ui";
import type { CityCtx } from "./context";
import { HAZARDS, HORIZONS, SECTORS, SECTOR_STOP, SOURCES, SSP_NAMES } from "./data/content";
import { MEASURES, annuity, country, econ, profileInputs, ranked, scen, vulnShare } from "./model";

const label = (s: string) => <b className="font-semibold text-white">{s}</b>;

const ESSENTIALS = [
  "Organise for resilience",
  "Identify and use risk scenarios",
  "Strengthen financial capacity",
  "Resilient urban development and design",
  "Protect natural buffers",
  "Strengthen institutional capacity",
  "Strengthen societal capacity",
  "Increase infrastructure resilience",
  "Effective disaster response",
  "Expedite recovery and build back better",
];

export function ResilienceTab({ c, I, hs, money, ui, setUi }: CityCtx) {
  const E = econ(c, hs, I),
    eal = (i: number) => E.rows.find((r) => r.i == i)?.eal ?? 0,
    top = ranked(hs)
      .filter((i) => hs[i] >= 2.5)
      .slice(0, 5);
  const rows = MEASURES.filter((m) => top.includes(m[0]))
    .map((m) => {
      const [q, u] = m[3](c, I),
        lo = (q * m[4]) / 1e9,
        hi = (q * m[5]) / 1e9,
        mid = (lo + hi) / 2,
        av = eal(m[0]) * m[6],
        bcr = mid > 0 ? (av * annuity(0.08, 20)) / mid : 0;
      return { m, q, u, lo, hi, mid, av, bcr };
    })
    .sort((a, b) => b.bcr - a.bcr);
  const ue = ui.essentials;
  const ix = (ue.reduce((a, b) => a + b, 0) / 50) * 100;
  const weakest = ESSENTIALS.map((n, i) => [n, ue[i]] as const)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3);
  return (
    <div className="space-y-5">
      <Card
        title={`Tangible resilience measures for ${c.name}`}
        sub="For hazards at watch or hotspot level in this scenario. Quantities are sized from the city’s area and population; costs are indicative international and Indian programme ranges in US dollars converted to the chosen currency. Validate with project estimates."
        how={
          <>
            <b>How to read.</b> Avoided loss is the share of that hazard’s expected annual loss the
            measure removes. Benefit-cost above 1 pays back on avoided economic loss alone; heat
            plans, shelters and school retrofits also save lives, which this ratio does not count.
            Ratios above 25 are shown as “over 25”: low-cost early warning and planning measures
            score very high on any assumption, and the exact figure is not meaningful.
          </>
        }
      >
        <div className="mb-6 grid gap-5 sm:grid-cols-3">
          <Stat
            label="Programme capex (midpoint)"
            value={money(
              rows.reduce((a, r) => a + r.mid, 0),
              0,
            )}
          />
          <Stat
            label="Expected loss avoided per year"
            value={money(
              rows.reduce((a, r) => a + r.av, 0),
              0,
            )}
          />
          <Stat
            label="Measures with benefit-cost ≥ 1"
            value={`${rows.filter((r) => r.bcr >= 1).length} of ${rows.length}`}
          />
        </div>
        <Table
          minWidth={1080}
          num={[2, 4, 5]}
          head={[
            "Measure and specification",
            "Hazard",
            "Quantity",
            "Capex range",
            "Avoided loss / yr",
            "Benefit-cost (20 yrs, 8%)",
            "KPI",
            "Reference",
          ]}
          rows={rows.map((r) => [
            <div key="m">
              {label(r.m[1])}
              <p className="mt-1 text-xs text-muted-foreground">{r.m[2]}</p>
            </div>,
            HAZARDS[r.m[0]],
            fmt(r.q, 0) + " " + r.u,
            money(r.lo, 1) + " – " + money(r.hi, 1),
            money(r.av, 1),
            <b key="b" className={r.bcr >= 1 ? "text-emerald-300" : "text-amber-300"}>
              {r.bcr > 25 ? "over 25" : r.bcr.toFixed(2)}
            </b>,
            r.m[7],
            r.m[8],
          ])}
        />
      </Card>
      <Card
        title="City resilience self-assessment (UNDRR Ten Essentials)"
        sub={`Score each essential 0 (absent) to 5 (leading), based on the UNDRR Disaster Resilience Scorecard for Cities. Index: ${fmt(ix, 0)}/100.`}
        how={
          <>
            <b>Weakest essentials:</b> {weakest.map((x) => `${x[0]} (${x[1]})`).join(", ")}. Start
            capacity building there.
          </>
        }
      >
        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {ESSENTIALS.map((n, i) => (
            <label key={n} className="block text-sm text-muted-foreground">
              <span className="flex items-baseline justify-between gap-3">
                <span>
                  {i + 1}. {n}
                </span>
                <b className="font-display text-lg text-white">{ue[i]}</b>
              </span>
              <input
                type="range"
                min={0}
                max={5}
                value={ue[i]}
                onChange={(e) => {
                  const next = ue.slice();
                  next[i] = Number(e.target.value);
                  setUi({ essentials: next });
                }}
                className="mt-2 w-full accent-periwinkle"
              />
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function CompareTab({ cities, si, hi, pick }: CityCtx) {
  const rows = cities
    .map((c) => {
      const I = profileInputs(c),
        hs = scen(c, si, hi),
        E = econ(c, hs, I);
      return { c, I, hs, E, top: ranked(hs).slice(0, 2), v: vulnShare(I) };
    })
    .sort((a, b) => b.E.pct - a.E.pct);
  return (
    <Card
      title={`Compare cities · ${SSP_NAMES[si]} ${HORIZONS[hi]}`}
      sub="Profile values (not your edits). Sorted by expected annual loss as a share of GDP."
    >
      <Table
        minWidth={960}
        num={[2, 3, 4, 7]}
        head={[
          "City",
          "Country",
          "People (m)",
          "Highly vulnerable",
          "Hotspots",
          "Leading hazards",
          "Loss % of GDP",
          "Loss (US$ m)",
          "Confidence",
        ]}
        rows={rows.map((r) => [
          <button
            key="c"
            type="button"
            onClick={() => pick(r.c.id)}
            className="font-semibold text-lavender underline decoration-lavender/30 underline-offset-4 hover:text-white"
          >
            {r.c.name}
          </button>,
          country(r.c).n,
          fmt(r.I.pop, 1),
          fmt(r.v * 100, 0) + "%",
          r.hs.filter((x) => x >= 3.5).length,
          r.top.map((i) => HAZARDS[i]).join(", "),
          <Score key="s" level={1 + r.E.pct * 1.6}>
            {fmt(r.E.pct, 2)}%
          </Score>,
          fmt(r.E.tot * 1000, 0),
          r.c.conf,
        ])}
      />
    </Card>
  );
}

const METHOD = [
  "Scenarios: SSP1-2.6, SSP2-4.5, SSP5-8.5; warming from IPCC AR6 WG1 (+1.5/1.5/1.6 °C near term, +1.7/2.0/2.4 mid century, +1.8/2.7/4.4 end of century); today taken as +1.2 °C.",
  "Hazard scaling per °C above today: heat 35%, coastal 30% plus sea-level rise, flood 25%, drought 20%, cyclone and landslide 15%, air quality 10%, earthquake 0%.",
  "People exposed: share of population in the hazard footprint, 0.025 × score², capped at 85%; heat and air quality city-wide once the score reaches 2.5.",
  "Vulnerable share: informal settlement share + half of elderly and children + 30% of informal workers outside settlements, capped at 90%.",
  "Event loss: daily GDP × days × sector stoppage + built assets (2.5 × GDP) × exposure × damage ratio; probability from the score.",
  "Chronic loss: heat 0.6%, drought 0.25% and air quality 0.2% of the relevant GDP per score point above 1.",
  "Benefit-cost of measures: avoided loss × 20-year annuity at 8% ÷ capex.",
];

const DISTRICT_SOURCES: [string, string | null, string][] = [
  [
    "Census of India 2011",
    "https://censusindia.gov.in/census.website/data/census-tables",
    "District population, age groups, workers by type, household amenities, SC/ST, literacy (district primary census abstract and houselisting tables)",
  ],
  [
    "MoHFW Technical Group on Population Projections (2020)",
    "https://main.mohfw.gov.in/sites/default/files/Population%20Projection%20Report%202011-2036%20-%20upload_compressed_0.pdf",
    "State populations for 2021, used to set each state’s growth rate since 2011",
  ],
  [
    "India Post pincode directory",
    null,
    "Today’s districts and 19,550 pincode locations; post-office counts allocate 2011 census districts to today’s districts",
  ],
  [
    "DataMeet 2011 district boundaries",
    "https://github.com/datameet/maps",
    "District areas and the map; India’s outline from DataMeet’s Survey of India boundary",
  ],
  [
    "AWS Terrain Tiles (SRTM-based) and Natural Earth 1:10m",
    null,
    "Elevation, slope, relief, distance to the coast and to major rivers for each pincode",
  ],
  [
    "MoSPI national and state accounts",
    "https://mospi.gov.in/",
    "India GDP 2024-25 and state per-capita NSDP used to model district GDP",
  ],
  [
    "IS 1893 seismic zoning, IMD climatology, CPCB / NCAP",
    null,
    "State-level seismic zone, heat and rainfall classes, and the air-quality proxy",
  ],
];

export function SourcesTab({ c }: CityCtx) {
  const cc = c.country === "IN" || c.country === "NP" || c.country === "LK" ? c.country : null;
  const list = (cc ? SOURCES[cc] : []).concat(SOURCES.G);
  return (
    <div className="space-y-5">
      <Card
        title={`Official and research sources for ${c.name}`}
        sub="Use these to verify and replace profile values."
      >
        <Table
          head={["Source", "What it provides"]}
          rows={list.map((s) => [
            <ExtLink key="l" href={s[2]}>
              {s[0]}
            </ExtLink>,
            s[1],
          ])}
        />
      </Card>
      <Card
        title="Basis of this city’s profile"
        sub={`Confidence: ${c.conf}. Low means mostly general knowledge; verify before external use.`}
      >
        <Table
          head={["Field", "Basis"]}
          rows={(
            [
              ["Population", c.popBasis],
              ["Area", c.areaBasis],
              ["Informal settlements", c.slumBasis],
              ["GDP", c.gdpBasis],
              ["Hazard scores", "Documented events and physical setting, see Hazards tab"],
              ["Plans and events", "Public records; check the latest version of each plan"],
            ] as [string, string][]
          ).map(([k, v]) => [label(k), v])}
        />
      </Card>
      <Card title="Method in brief">
        <Bullets items={METHOD} />
      </Card>
      <Card
        title="Sector stoppage assumptions"
        sub="Share of each sector’s daily output that stops during an event."
      >
        <Table
          minWidth={960}
          num={[1, 2, 3, 4, 5, 6, 7, 8]}
          head={["Sector", ...HAZARDS]}
          rows={SECTORS.map((n, k) => [
            label(n),
            ...SECTOR_STOP[k].map((v) => fmt(v * 100, 0) + "%"),
          ])}
        />
      </Card>
      {c.district && (
        <Card
          title="District data sources and method"
          sub="How the district profile is built. Each value is a screening estimate; replace it with state or district data where you have it."
          how={
            <>
              <b>When better data arrives.</b> India’s next census has a reference date of 1 March
              2027. States that publish District Domestic Product (for example Maharashtra,
              Karnataka, Tamil Nadu and Uttar Pradesh) can replace the modelled GDP.
            </>
          }
        >
          <Table
            head={["Source", "Used for"]}
            rows={DISTRICT_SOURCES.map(([n, u, d]) => [
              u ? (
                <ExtLink key="l" href={u}>
                  {n}
                </ExtLink>
              ) : (
                label(n)
              ),
              d,
            ])}
          />
        </Card>
      )}
    </div>
  );
}
