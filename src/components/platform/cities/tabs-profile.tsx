import { fmt } from "../format";
import { Band, BarRow, Bullets, Card, EventList, Grid, Score, SubHead, Table } from "../ui";
import type { CityCtx } from "./context";
import { HAZARDS, HORIZONS, SECTORS, SSP_NAMES } from "./data/content";
import { country, dens, grow, nowcast, people, pctx, scen, vulnShare, yearsSince } from "./model";

const label = (s: string) => <b className="font-semibold text-white">{s}</b>;
const basis = (s: string) => <span className="text-xs text-muted-foreground">{s}</span>;

export function ProfileTab({ c, I, money, now }: CityCtx) {
  const geo: [string, string][] = [
    ["Location", `${c.region}, ${country(c).n} · ${c.lat}, ${c.lon}`],
    ["Elevation", c.elev],
    ["Coast", c.coast],
    ["Rivers and water bodies", c.rivers],
    ["Area", `${fmt(c.area, 0)} km² (${c.areaBasis})`],
  ];
  const dem: [string, string, string][] = [
    ["Population (today)", fmt(I.pop, 2) + " million", c.popBasis],
    [
      "Density of the core city",
      fmt(dens(c, I, now), 0) + " per km²",
      c.nc
        ? c.nc.core[2] + " census population grown at the same rate, ÷ its area"
        : "Population ÷ area",
    ],
    ["Informal settlements", fmt(I.slum * 100, 0) + "%", c.slumBasis],
    ["Aged 65 and over", fmt(I.a65 * 100, 0) + "%", "Census age structure, approximate"],
    ["Aged 0–14", fmt(I.a14 * 100, 0) + "%", "Census age structure, approximate"],
    [
      "Informal workforce",
      fmt(I.inf * 100, 0) + "%",
      "Share of workers without formal contracts, approximate (PLFS / labour surveys)",
    ],
  ];
  const top = Math.max(...c.sec, 1);
  return (
    <div className="space-y-5">
      <Grid>
        <Card title={c.name} sub="Geography and physical setting">
          <Table
            minWidth={360}
            head={["Attribute", "Value"]}
            rows={geo.map(([k, v]) => [label(k), v])}
          />
        </Card>
        <Card title="Population and demography" sub="Who lives here and who is most vulnerable">
          <Table
            minWidth={460}
            head={["Indicator", "Value", "Basis"]}
            rows={dem.map(([k, v, b]) => [label(k), v, basis(b)])}
          />
        </Card>
      </Grid>
      <Grid>
        <Card
          title="Economy"
          sub={`${money(I.gdp, 0)} a year (${c.gdpBasis}). Shares are indicative.`}
        >
          {SECTORS.map((n, k) => (
            <BarRow key={n} label={n} share={c.sec[k] / top} value={`${c.sec[k]}%`} />
          ))}
        </Card>
        <Card title="Sources of livelihood">
          <Bullets items={c.liv} />
          <SubHead>Potential</SubHead>
          <Bullets items={c.pot} />
        </Card>
      </Grid>
      <Card
        title="Past disasters and events"
        sub="Documented events, oldest first. These show which hazards have already hit the city and how."
        how={
          <>
            <b>Why this matters.</b> Exposure starts with where people live and work. Density,
            informal settlements and age structure decide how many people a hazard reaches and how
            badly; the sector mix decides how much of the economy stops when it does.
          </>
        }
      >
        {c.ev.length ? (
          <EventList
            items={c.ev
              .slice()
              .sort((a, b) => a[0] - b[0])
              .map((e) => ({ y: e[0], t: e[1], d: e[2] }))}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Event history is not yet compiled for districts. Check the IMD Disastrous Weather Events
            reports, the NDMA and state relief department records, and the Sendai DesInventar
            database.
          </p>
        )}
      </Card>
      <DistrictCard c={c} />
      <PopulationMethod c={c} money={money} now={now} />
    </div>
  );
}

function DistrictCard({ c }: { c: CityCtx["c"] }) {
  const d = c.district;
  if (!d) return null;
  const I = d.I;
  const rows: [string, string, string][] = [
    [
      "Vulnerability index",
      d.vi + " / 100",
      "Percentile rank among India’s districts (100 = most vulnerable), from literacy, SC/ST share, farm dependence, marginal work, sanitation, tap water, electricity, clean cooking fuel and housing condition",
    ],
    ["Literacy", pctx(I.lit), "Share of all residents"],
    ["Scheduled Castes / Scheduled Tribes", pctx(I.sc) + " / " + pctx(I.st), "Share of residents"],
    ["Urban households", pctx(I.urb), ""],
    ["Electric lighting", pctx(I.elec), "Households"],
    ["LPG or piped gas for cooking", pctx(I.lpg), "Households"],
    ["Tap water as main source", pctx(I.tap), "Households"],
    ["Latrine within the premises", pctx(I.lat), "Households"],
    ["Dilapidated houses", pctx(I.dil), "Households"],
    ["Internet / computer", pctx(I.net) + " / " + pctx(I.comp), "Households"],
    ["Car, jeep or van", pctx(I.car), "Households; a marker of affluence"],
    ["Graduates", pctx(I.grad), "Share of people with any education level recorded"],
    ["Females per 1,000 males", fmt(I.fem * 1000, 0), ""],
  ];
  return (
    <Card
      title={`Census indicators and vulnerability for ${c.name}`}
      sub="Census 2011 is the latest district-level source. Household amenities have improved since then (for example Saubhagya electricity, Swachh Bharat latrines, Ujjwala LPG and Jal Jeevan tap water), so treat these as the 2011 baseline and the ranking as relative."
    >
      <Table
        head={["Indicator", "Value", "Basis"]}
        rows={rows.map(([k, v, b]) => [label(k), v, basis(b)])}
      />
      <SubHead>Today’s districts in this area</SubHead>
      <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
        The unit is the 2011 census district, which has official population and boundaries. Many
        districts have been split or renamed since; these are today’s districts (India Post
        directory) found inside it.
      </p>
      <Table
        minWidth={320}
        head={["Today’s district", "Share of this area’s pincodes"]}
        num={[1]}
        rows={d.par.map((p) => [p[0], p[1] + "%"])}
      />
      <p className="mt-3 text-xs text-muted-foreground">
        Built from {d.pins} pincodes and {d.offs} post offices. Hazard scores average the district’s
        typical pincode and its 90th-percentile pincode, so local hotspots count.
      </p>
    </Card>
  );
}

function PopulationMethod({ c, money, now }: Pick<CityCtx, "c" | "money" | "now">) {
  const k = nowcast(c, now);
  if (!k || !c.base) return null;
  const n = k.n,
    b = c.base;
  // Projection to 1 July of each year on the same growth path.
  const years = [2030, 2040, 2050].map((y) => [
    String(y),
    fmt(n.b * grow(n, yearsSince(n.bd, Date.parse(y + "-07-01"))), 2) + " million",
  ]);
  const steps: [string, string, string][] = [
    ["1. Census base", fmt(n.b, 2) + " million on " + n.bd, n.bs],
    [
      "2. Annual growth rate",
      (n.r * 100).toFixed(2) +
        "%" +
        (n.r2 != null ? " to 2021, then " + (n.r2 * 100).toFixed(2) + "%" : ""),
      n.rs,
    ],
    ["3. Years since census", fmt(k.y, 2), "Counted to this second"],
    [
      "4. Population today",
      fmt(k.pop, 2) + " million",
      "Base × (1 + rate)^years; uncertainty about ±" + fmt(k.unc * 100, 0) + "%",
    ],
    [
      "5. Range today",
      fmt(k.pop * (1 - k.unc), 2) + "–" + fmt(k.pop * (1 + k.unc), 2) + " million",
      "Widens about 0.7% for each year since the census",
    ],
    [
      "6. Aged 65 and over",
      fmt(k.a65 * 100, 1) + "% (base " + fmt(b.a65 * 100, 1) + "%)",
      "Shifted " +
        n.age[0] +
        " points a year, following the ageing trend in the MoHFW Technical Group projections (2020) and UN World Population Prospects",
    ],
    [
      "7. Aged 0–14",
      fmt(k.a14 * 100, 1) + "% (base " + fmt(b.a14 * 100, 1) + "%)",
      "Shifted " + n.age[1] + " points a year as fertility falls",
    ],
    [
      "8. Informal settlement share",
      fmt(c.slum * 100, 0) + "%",
      "Held at the census value; no newer official count. Municipal surveys often show more",
    ],
    ["9. City GDP today", money(c.gdp, 0), c.gdpBasis],
  ];
  return (
    <Card
      title="How today’s population and demography are estimated"
      sub="The last census in India was in 2011 (Nepal 2021, Sri Lanka 2012), so figures are nowcast with a standard cohort-free growth projection and updated live."
      how={
        <>
          <b>Why this method.</b> UN World Urbanization Prospects is the standard source for city
          growth and is used by the World Bank and IPCC; applying its rate to the official census
          base keeps the boundary consistent. India’s next census has a reference date of 1 March
          2027; replace the base when its results are published. Telecom, electoral-roll and
          satellite night-light estimates can refine the nowcast and can be added as data feeds.
        </>
      }
    >
      <Table
        head={["Step", "Value", "Source or rule"]}
        rows={steps.map(([s, v, r]) => [label(s), v, basis(r)])}
      />
      <SubHead>Projection</SubHead>
      <Table
        minWidth={320}
        head={["Year", "Population on the same growth path"]}
        rows={years.map(([y, v]) => [label(y), v])}
      />
    </Card>
  );
}

export function PeopleTab({ c, I, hs, si, hi }: CityCtx) {
  const P = people(hs, I),
    P0 = people(c.haz, I),
    V = vulnShare(I);
  const seg: [string, number, string][] = [
    [
      "People in informal settlements",
      I.pop * I.slum,
      "Flood, landslide, heat, sanitation and disease; weak housing and tenure",
    ],
    ["Elderly (65+)", I.pop * I.a65, "Heat stress, mobility during evacuation, health-care access"],
    [
      "Children (0–14)",
      I.pop * I.a14,
      "Heat, air pollution, school closures, disease after floods",
    ],
    [
      "Informal workers",
      I.pop * 0.4 * I.inf,
      "Lost days of income during floods, heat and pollution episodes; no paid leave (workforce taken as 40% of population)",
    ],
  ];
  return (
    <div className="space-y-5">
      <Card
        title="People exposed and vulnerable by hazard"
        sub={`${SSP_NAMES[si]}, ${HORIZONS[hi]}. Millions of people.`}
        how={
          <>
            <b>How to read.</b> “Exposed” is the share of residents living or working in the
            hazard’s footprint, which grows with the score (about 2.5% at score 1, 22% at 3, 62% at
            5). Heat and air quality reach the whole city once the score is 2.5 or more. “Highly
            vulnerable” applies the city’s vulnerable share ({fmt(V * 100, 0)}%), raised by 30% for
            flood, coastal and landslide because informal settlements cluster on floodplains, creeks
            and slopes. Replace with ward-level hazard maps when available.
          </>
        }
      >
        <Table
          minWidth={820}
          num={[3, 4, 5]}
          head={[
            "Hazard",
            "Score today",
            "Score in scenario",
            "People exposed today",
            "People exposed in scenario",
            "Of whom highly vulnerable",
            "Level",
          ]}
          rows={HAZARDS.map((n, i) => [
            label(n),
            <Score key="a" level={c.haz[i]} />,
            <Score key="b" level={hs[i]} />,
            fmt(P0[i].e, 2),
            fmt(P[i].e, 2),
            fmt(P[i].v, 2),
            <Band key="c" v={hs[i]} />,
          ])}
        />
      </Card>
      <Card
        title="Who is most at risk"
        sub="Population segments and the climate risks that fall on them hardest."
      >
        <Table
          num={[1]}
          head={["Segment", "People (million)", "Main climate risks"]}
          rows={seg.map(([s, p, r]) => [label(s), fmt(p, 2), r])}
        />
      </Card>
    </div>
  );
}

export function HazardsTab({ c, si }: CityCtx) {
  const cols: [string, number[]][] = [["Today", c.haz]].concat(
    [0, 1, 2].map((h) => [HORIZONS[h], scen(c, si, h)] as [string, number[]]),
  ) as [string, number[]][];
  const all = [0, 1, 2].flatMap((s) => [0, 1, 2].map((h) => scen(c, s, h)));
  return (
    <div className="space-y-5">
      <Card
        title={`Hazard hotspot matrix · ${SSP_NAMES[si]}`}
        sub="Score 1 (very low) to 5 (very high). 3.5 or more is a hotspot; 2.5–3.4 a watch item."
        how={
          <>
            <b>How it is built.</b> Today’s scores come from the city’s documented hazard history
            and setting (see Why). Each horizon scales them with global warming above today’s +1.2
            °C: heat rises fastest (35% per °C), then coastal (30% plus sea-level rise), drought and
            flood (20–25%), cyclone and landslide (15%), air quality (10%); earthquake does not
            change. Warming values are from IPCC AR6.
          </>
        }
      >
        <Table
          minWidth={720}
          head={["Hazard", ...cols.map((x) => x[0]), "Why"]}
          rows={HAZARDS.map((n, i) => [
            label(n),
            ...cols.map((x, j) => <Score key={j} level={x[1][i]} />),
            basis(c.hn[i]),
          ])}
        />
      </Card>
      <Card
        title="All scenarios and horizons"
        sub="Every combination, so you can see the range rather than a single future."
      >
        <Table
          minWidth={960}
          head={["Hazard", ...SSP_NAMES.flatMap((s) => HORIZONS.map((h) => `${s} ${h}`))]}
          rows={HAZARDS.map((n, i) => [
            label(n),
            ...all.map((v, j) => <Score key={j} level={v[i]} />),
          ])}
        />
      </Card>
    </div>
  );
}
