import { useState } from "react";
import { Kpi, Pill, SelectField } from "@/components/observatory/ui";
import { fmt } from "../format";
import { BarRow, Bullets, Card, Grid, Score, Table } from "../ui";
import type { CityCtx } from "./context";
import {
  ACTIVITIES,
  ACTIVITY_ROUTES,
  CLEARANCE,
  CLIMATE_PROOFING,
  HAZARDS,
  HORIZONS,
  SECTORS,
  SSP_NAMES,
  SYSTEMS,
} from "./data/content";
import { country, econ, ranked, scen } from "./model";

const label = (s: string) => <b className="font-semibold text-white">{s}</b>;

export function EconomyTab({ c, I, hs, si, hi, money }: CityCtx) {
  const E = econ(c, hs, I),
    E0 = econ(c, c.haz, I);
  const gdpOf = c.district ? "of district GDP" : "of city GDP";
  const worst = Math.max(...E.rows.map((r) => (r.type === "event" ? r.ev : 0)));
  const mx = [0, 1, 2].map((s) => [0, 1, 2].map((h) => econ(c, scen(c, s, h), I)));
  const sm = Math.max(...E.bySec, 1e-9);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi
          label="Expected annual loss · Today"
          value={money(E0.tot, 0)}
          sub={`${fmt(E0.pct, 2)}% ${gdpOf}`}
        />
        <Kpi
          highlight
          label="Expected annual loss · This scenario"
          value={money(E.tot, 0)}
          sub={`${fmt(E.pct, 2)}% ${gdpOf}`}
        />
        <Kpi
          label="Increase from climate change"
          value={`${fmt((E.tot / E0.tot - 1) * 100, 0)}%`}
          sub={`${SSP_NAMES[si]} ${HORIZONS[hi]} versus today`}
        />
        <Kpi
          label="Worst single event"
          value={money(worst, 0)}
          sub="output lost plus asset damage"
        />
      </div>
      <Card
        title="Impact by hazard"
        sub="Event hazards: probability × (output lost + asset damage). Chronic hazards: share of GDP lost every year."
        how={
          <>
            <b>Formulas.</b> Output lost per event = daily GDP × days of disruption × share of each
            sector that stops (sector sensitivity table in Sources &amp; method). Asset damage =
            built assets (2.5 × GDP) × share exposed × damage ratio (flood 1.5%, coast 2%, cyclone
            1.5%, landslide 0.5%, earthquake 6%) × score ÷ 3. Annual probability rises with the
            score (flood: 0.4% at score 1, 2.7% at 3, 18% at 5). Heat: outdoor and industrial labour
            loses 0.6% of output per score point above 1 (in line with ILO estimates of lost working
            hours). Drought: water premium and lost output, 0.25% per point. Air quality: 0.2% of
            GDP per point (the Lancet Planetary Health 2020 study put India’s lost output from air
            pollution at 1.4% of GDP). These are screening coefficients; calibrate with local loss
            data.
          </>
        }
      >
        <Table
          minWidth={820}
          num={[2, 3, 4, 5, 6]}
          head={[
            "Hazard",
            "Score",
            "Annual probability",
            "Days of disruption",
            "Cost per event",
            "Expected annual loss",
            "% of GDP",
          ]}
          rows={E.rows.map((r) => [
            label(HAZARDS[r.i]),
            <Score key="s" level={hs[r.i]} />,
            r.type == "event" ? fmt(r.p * 100, 1) + "%" : "Every year",
            r.type == "event" ? fmt(r.days, 1) : "—",
            r.type == "event" ? money(r.ev, 0) : "—",
            money(r.eal, 0),
            fmt((r.eal / I.gdp) * 100, 3) + "%",
          ])}
        />
      </Card>
      <Card
        title="Scenario and horizon matrix"
        sub="Expected annual loss as % of city GDP, and value."
      >
        <Table
          head={["Scenario", ...HORIZONS]}
          rows={[0, 1, 2].map((s) => [
            label(SSP_NAMES[s]),
            ...mx[s].map((e, h) => (
              <Score key={h} level={1 + e.pct * 1.6}>
                {fmt(e.pct, 2)}%
                <span className="block text-[11px] font-normal">{money(e.tot, 0)}</span>
              </Score>
            )),
          ])}
        />
      </Card>
      <Card
        title="Which parts of the economy lose most"
        sub="Expected annual output and income loss by sector, all hazards (asset damage is shown in the hazard table)."
        how={
          <>
            <b>Livelihoods.</b> Sectors with many daily-wage and informal workers (construction,
            trade, tourism, small manufacturing) lose income first and recover last. Combine this
            view with People at risk to target support.
          </>
        }
      >
        {SECTORS.map((n, k) => (
          <BarRow key={n} label={n} share={E.bySec[k] / sm} value={money(E.bySec[k], 0)} />
        ))}
      </Card>
    </div>
  );
}

const CASCADES = [
  "Flood → power and pumping stations fail → water supply and hospitals lose service",
  "Heat → peak power demand → outages → cooling fails for hospitals, elderly and slum homes",
  "Cyclone → trees and lines down → transport and telecoms cut → relief delayed",
  "Drought → tanker dependence → water prices rise → informal settlements pay most",
  "Earthquake → building collapse and blocked roads → hospitals overwhelmed",
];

export function SystemsTab({ hs }: CityCtx) {
  return (
    <div className="space-y-5">
      <Card
        title="Which urban systems each hazard hits"
        sub="Cell = system sensitivity (0–3, expert judgement) × hazard score ÷ 3. Darker means a system is both sensitive and exposed."
        how={
          <>
            <b>Why systems.</b> A city fails as a system: a flooded substation stops water pumping,
            which closes hospitals and schools. Read across a row for a system’s weak points and
            down a column for everything one hazard can knock out. The cascade most worth testing is
            power → water → health.
          </>
        }
      >
        <Table
          minWidth={980}
          head={["System", ...HAZARDS]}
          rows={[
            [
              label("Hazard score"),
              ...hs.map((x, j) => (
                <b key={j} className="block text-center font-semibold tabular-nums text-white">
                  {x.toFixed(1)}
                </b>
              )),
            ],
            ...SYSTEMS.map(([name, sens]) => [
              label(name),
              ...sens.map((v, j) => {
                const x = (v / 3) * hs[j];
                return <Score key={j} level={x} />;
              }),
            ]),
          ]}
        />
      </Card>
      <Card title="Cascading effects to plan for">
        <Bullets items={CASCADES} />
      </Card>
    </div>
  );
}

const PLAN_KEYWORDS = [
  ["flood", "drain", "storm", "sponge", "wetland"],
  ["coast", "sea", "mangrove"],
  ["cyclone", "shelter", "early warning"],
  ["heat"],
  ["water", "drought", "reuse", "desal"],
  ["landslide", "slope"],
  ["earthquake", "seismic", "retrofit", "building code"],
  ["air", "clean", "pollution"],
];

export function PlansTab({ c, hs }: CityCtx) {
  const top = ranked(hs).slice(0, 4);
  const txt = c.plans
    .map((p) => p.join(" "))
    .join(" ")
    .toLowerCase();
  return (
    <div className="space-y-5">
      <Card
        title="Government plans and future programmes"
        sub="Plans, projects and strategies on record for the city."
      >
        <Table
          head={["Plan or programme", "Year", "What it covers"]}
          rows={c.plans.map((p) => [label(p[0]), p[1], p[2]])}
        />
      </Card>
      <Grid>
        <Card title="City potential">
          <Bullets items={c.pot} />
        </Card>
        <Card
          title="Do plans cover the hotspots?"
          sub="Keyword check of the listed plans against the top four hazards in this scenario. A gap means the plan list here does not show it, not that no action exists."
        >
          <Table
            minWidth={380}
            num={[1]}
            head={["Hazard", "Score", "Coverage"]}
            rows={top.map((i) => [
              label(HAZARDS[i]),
              hs[i].toFixed(1),
              PLAN_KEYWORDS[i].some((k) => txt.includes(k)) ? (
                <Pill tone="good">Addressed in listed plans</Pill>
              ) : (
                <Pill tone="bad">Not visible in listed plans</Pill>
              ),
            ])}
          />
        </Card>
      </Grid>
    </div>
  );
}

export function ClearanceTab({ c, hs }: CityCtx) {
  const [act, setAct] = useState(0);
  const cc = CLEARANCE[c.country] ? c.country : "XX";
  const top = ranked(hs).filter((i) => hs[i] >= 2.5);
  return (
    <div className="space-y-5">
      <Card
        title={`Environmental clearance regime · ${country({ ...c, country: cc }).n}`}
        sub="Approvals usually needed before economic activity starts. Thresholds change: check the current notification."
      >
        <Table
          head={["Instrument", "What it requires"]}
          rows={CLEARANCE[cc].map((x) => [label(x[0]), x[1]])}
        />
      </Card>
      <Card
        title={`Local environmental conditions in ${c.name}`}
        sub="Area-specific restrictions that shape what can be built and where."
      >
        <Bullets items={c.ec} />
      </Card>
      <Card
        title="Clearance screening for an activity"
        sub="Pick an activity to see the usual approval path in this country."
      >
        <SelectField
          label="Activity"
          className="max-w-sm"
          value={act}
          onChange={(e) => setAct(Number(e.target.value))}
        >
          {ACTIVITIES.map((a, i) => (
            <option key={a} value={i}>
              {a}
            </option>
          ))}
        </SelectField>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          <b className="text-white">{ACTIVITIES[act]}:</b> {ACTIVITY_ROUTES[cc][act]}
        </p>
      </Card>
      <Card
        title="Climate-proofing checklist for clearance applications"
        sub="Items to include for this city’s watch and hotspot hazards, so the application addresses physical climate risk."
        how={
          <>
            <b>Why.</b> Regulators increasingly expect disaster risk in EIA reports, and lenders
            apply the EU Taxonomy, IFC Performance Standards and Equator Principles, which ask for a
            climate risk assessment. Doing it at clearance stage is far cheaper than retrofitting.
          </>
        }
      >
        <Table
          num={[1]}
          head={["Hazard", "Score", "Include in the application"]}
          rows={top.map((i) => [label(HAZARDS[i]), hs[i].toFixed(1), CLIMATE_PROOFING[i][1]])}
        />
      </Card>
    </div>
  );
}
