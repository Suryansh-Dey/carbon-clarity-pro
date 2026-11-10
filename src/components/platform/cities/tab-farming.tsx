import { PrimaryButton } from "@/components/observatory/ui";
import { fmt } from "../format";
import { Bullets, Card, Score, Stat, SubHead, Table } from "../ui";
import type { CityCtx } from "./context";
import {
  CROPS,
  HAZARDS,
  HORIZONS,
  SSP_NAMES,
  WARMING,
  WARMING_NOW,
  type Crop,
} from "./data/content";
import { agBase, cropImpact, nearestDistrict, ranked, scen } from "./model";

const label = (s: string) => <b className="font-semibold text-white">{s}</b>;

export function FarmingTab(ctx: CityCtx) {
  const { c, I, hs, si, hi, money, districts, pick } = ctx;
  if (!c.district) {
    if (c.country !== "IN")
      return (
        <Card
          title="Farming, nature and economy"
          sub={`This layer covers India’s districts. For ${c.name}, add district or provincial farm data.`}
        />
      );
    const d = districts && nearestDistrict(districts.list, c);
    return (
      <Card
        title="Farming, nature and economy"
        sub="A city’s food, water and many of its industries depend on the surrounding district. Open the district to see its crops, soils, rainfall, ecosystems, enterprise opportunities and scenario impacts."
      >
        {d ? (
          <PrimaryButton onClick={() => pick(d.id)}>Open {d.name} →</PrimaryButton>
        ) : (
          <p className="text-sm text-muted-foreground">Loading India’s districts…</p>
        )}
      </Card>
    );
  }

  const B = agBase(c),
    agShare = (c.sec[6] || 0) / 100,
    agGDP = I.gdp * agShare;
  const cols = [0, 1, 2].map((h) => {
    const dT = Math.max(0, WARMING[si][h] - WARMING_NOW),
      hh = scen(c, si, h);
    return B.crops.map((x) => cropImpact(x.k, B.irr, dT, hh));
  });
  const wl = (h: number) => B.crops.reduce((a, x, i) => a + (x.sh / 100) * cols[h][i], 0);
  const ent = B.crops
    .slice(0, 5)
    .map((x) => CROPS[x.k])
    .filter(Boolean);
  const loss = (agGDP * wl(hi)) / 100;
  return (
    <div className="space-y-5">
      <Card
        title={`Farming and natural setting · ${c.name}`}
        sub={`Source: ${B.src}. Rainfall and irrigation are state values.`}
        how={
          <>
            <b>Why it matters.</b> Soil, rainfall and water decide what can be grown; farming then
            feeds a chain of mills, cold stores, transport, input dealers and markets. A climate
            shock to the crop is a shock to that whole local economy.
          </>
        }
      >
        <div className="mb-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
          <Stat label="Agro-climatic zone" value={<span className="text-lg">{B.Z.n}</span>} />
          <Stat
            label="Normal rainfall"
            value={<span className="text-lg">{fmt(B.rain, 0)} mm a year</span>}
          />
          <Stat
            label="Irrigated share of farmland"
            value={<span className="text-lg">{fmt(B.irr * 100, 0)}%</span>}
          />
          <Stat
            label="Farm share of the economy"
            value={
              <span className="text-lg">
                {fmt(agShare * 100, 0)}% · {money(agGDP, 0)} a year
              </span>
            }
          />
        </div>
        <Table
          head={["Natural factor", "In this district"]}
          rows={[
            [label("Soils"), B.soil],
            [label("Ecosystems"), <Bullets key="e" items={B.eco} />],
            [
              label("Water"),
              `${c.rivers}. Check block groundwater status with CGWB (safe, semi-critical, critical or over-exploited)`,
            ],
            [
              label("Climate today"),
              `${c.hn[3]}. Rainfall class and drought score ${c.haz[4].toFixed(1)} of 5`,
            ],
          ]}
        />
      </Card>
      <Card
        title={`How the main crops fare under ${SSP_NAMES[si]}`}
        sub="Estimated change in yield from today, if farmers change nothing, for each horizon. Warming above today = scenario warming minus 1.2 °C; drought and flood scores add stress where they rise above 2.5."
        how={
          <>
            <b>Money at stake.</b> At today’s farm output of {money(agGDP, 0)} a year, the{" "}
            {HORIZONS[hi]} loss is about <b>{money(loss, 0)} a year</b>, and roughly a third as much
            again ({money(loss * 0.35, 0)}) in the mills, traders, transport and input dealers that
            depend on it. Sensitivities follow ICAR-NICRA projections (for example rainfed rice −20%
            and wheat −19% by 2050 without adaptation) and IPCC AR6; irrigation softens heat and
            drought losses.
          </>
        }
      >
        <Table
          minWidth={760}
          num={[1]}
          head={["Crop", "Share of area", ...HORIZONS, "Main climate stress"]}
          rows={[
            ...B.crops.map((x, i) => {
              const cr: Partial<Crop> = CROPS[x.k] || { n: x.k };
              const stress = [
                (cr.s ?? 0) >= 15 ? "heat at flowering and grain fill" : "heat",
                (cr.w ?? 0) >= 0.6 ? "dry spells" : "",
                (cr.fl ?? 0) >= 0.5 ? "floods and waterlogging" : "",
              ]
                .filter(Boolean)
                .join(", ");
              return [
                label(cr.n ?? x.k),
                fmt(x.sh, 0) + "%",
                ...[0, 1, 2].map((h) => (
                  <Score key={h} level={1 + cols[h][i] / 10}>
                    −{fmt(cols[h][i], 0)}%
                  </Score>
                )),
                stress,
              ];
            }),
            [
              label("Weighted farm output"),
              "100%",
              ...[0, 1, 2].map((h) => (
                <b key={h} className="block text-center font-semibold text-white">
                  −{fmt(wl(h), 1)}%
                </b>
              )),
              "",
            ],
          ]}
        />
      </Card>
      <Card
        title="Enterprise and industry opportunities"
        sub="How the local farm and nature base can create business for small, medium and large enterprises, and how climate change shifts that."
        how={
          <>
            <b>Climate shift.</b> As heat and water stress grow, value moves toward water-efficient
            crops (millets, pulses, oilseeds), protected horticulture, cold chains that cut food
            loss, and bioenergy from residues. Enterprises that supply these early gain market
            share.
          </>
        }
      >
        <Table
          head={["Enterprise size", "Opportunities here"]}
          rows={[
            [
              label("Micro and small"),
              <Bullets
                key="m"
                items={ent
                  .slice(0, 3)
                  .map((cr) => `${cr.en.split(",")[0]} (${cr.n.toLowerCase()})`)
                  .concat([
                    "Custom hiring centres, drone spraying and micro-irrigation installation",
                    "Solar pump and solar cold-room servicing (PM-KUSUM)",
                  ])}
              />,
            ],
            [
              label("Medium"),
              <Bullets
                key="d"
                items={ent
                  .slice(0, 4)
                  .map((cr) => cr.en)
                  .concat([
                    "Farmer producer organisations with processing and grading",
                    "Bio-inputs: bio-fertiliser, compost and natural farming inputs",
                  ])}
              />,
            ],
            [
              label("Large and listed"),
              <Bullets
                key="l"
                items={[
                  "Food and agro-processing parks (PMKSY), exports through APEDA clusters",
                  "Ethanol, bio-CNG and bioenergy from residues (E20, SATAT, Gobardhan)",
                  "Sourcing programmes that pay for resilient and low-carbon practice (BRSR value-chain disclosure, Scope 3 targets)",
                ]}
              />,
            ],
          ]}
        />
      </Card>
      <Recommendations hs={hs} ent={ent} />
    </div>
  );
}

const STAKEHOLDERS = (top: string): [string, string][] => [
  [
    "District administration",
    `Put the leading risks (${top}) into the District Disaster Management Plan and the district plan; build heat and flood early warning to village level; protect wetlands, floodplains and commons; steer new industry to low-risk land`,
  ],
  [
    "Farmers and FPOs",
    "Diversify crops and income (livestock, fish, horticulture); adopt water-saving and low-methane practice; join FPOs for storage, processing and better prices",
  ],
  [
    "MSMEs",
    "Climate-proof sites (plinth height, cool roofs, backup water and power); cut energy cost with solar and efficiency; use ZED certification and green finance (SIDBI); offer local resilient products and services",
  ],
  [
    "Large and listed companies",
    "Map supply-chain exposure to these hazards; disclose under BRSR Core and IFRS S2; set science-based targets including Scope 3; co-invest with suppliers in resilient, low-carbon farming",
  ],
  [
    "Banks, NBFCs and insurers",
    "Price physical risk in agri and MSME lending (RBI climate risk disclosure guidance); expand crop, parametric and MSME insurance; finance solar pumps, cold chains and micro-irrigation",
  ],
  [
    "Citizens",
    "Mission LiFE habits: save water and energy, cut food waste, choose local and seasonal food, travel by public transport; know your local heat and flood warnings",
  ],
];

function Recommendations({ hs, ent }: { hs: number[]; ent: Crop[] }) {
  const top = ranked(hs)
    .slice(0, 3)
    .map((i) => HAZARDS[i].toLowerCase());
  return (
    <Card
      title="Adaptation, mitigation and recommendations"
      sub="What each group can do for a resilient local economy, and how it adds up to India’s net-zero goal."
      how={
        <>
          <b>Toward net zero.</b> India aims for net zero by 2070, a 45% cut in emissions intensity
          of GDP from 2005 by 2030, and 50% of power capacity from non-fossil sources (reached in
          2025). Farm methane and nitrous oxide, diesel pumping and MSME energy are the levers a
          district controls. Resilience and decarbonisation go together: solar pumps, water-saving
          rice and residue-to-energy cut emissions and protect income at the same time.
        </>
      }
    >
      <SubHead>Adaptation on the farm</SubHead>
      <Bullets
        items={[
          ...ent.map((cr) => (
            <>
              <b>{cr.n}:</b> {cr.ad}
            </>
          )),
          <>
            <b>All crops:</b> follow the District Agriculture Contingency Plan; use IMD block-level
            agromet advisories (Gramin Krishi Mausam Sewa); insure under PMFBY; harvest rainwater in
            farm ponds and Amrit Sarovars; use soil health cards to cut excess fertiliser
          </>,
        ]}
      />
      <SubHead>Mitigation and decarbonisation</SubHead>
      <Bullets
        items={[
          ...ent.map((cr) => (
            <>
              <b>{cr.n}:</b> {cr.mi}
            </>
          )),
          <>
            <b>Energy:</b> solarise pumps and feeders (PM-KUSUM), rooftop solar for homes and MSMEs
            (PM Surya Ghar), energy-efficiency audits in MSME clusters (BEE)
          </>,
          <>
            <b>Land:</b> agroforestry and restored commons earn credits under the Green Credit
            Programme and the Carbon Credit Trading Scheme offset mechanism
          </>,
        ]}
      />
      <SubHead>Recommendations by stakeholder</SubHead>
      <Table
        head={["Who", "Priority actions"]}
        rows={STAKEHOLDERS(top.join(", ")).map(([w, a]) => [label(w), a])}
      />
    </Card>
  );
}
