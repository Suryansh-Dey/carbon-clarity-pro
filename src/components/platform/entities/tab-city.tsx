import { InputField, Kpi, Pill } from "@/components/observatory/ui";
import { fmt } from "../format";
import { Card, Score, Table } from "../ui";
import type { EntCtx } from "./context";
import {
  CITY_ACTIONS,
  CITY_FIELDS,
  MONITORS,
  SCORECARD_THEMES,
  SYSTEM_HAZARDS,
  SYSTEMS,
} from "./data";
import { ALERT_LEVELS, alertLevel, citySystems } from "./model";
import { HowToRead, Slider } from "./ui";

const LEVEL_TONE = ["good", "warn", "bad", "bad"] as const;

export function CitySystemsTab({ plan, ui, setUi }: EntCtx) {
  const c = ui.cityVals,
    R = citySystems(c, plan.hs);
  const levels = MONITORS.map((_, i) => alertLevel(i, ui.monv[i]));
  const worst = Math.max(0, ...levels);
  const thresholds = (m: (typeof MONITORS)[number]) =>
    m[5] > 0
      ? `Watch ≥${m[4][0]}, Alert ≥${m[4][1]}, Emergency ≥${m[4][2]}`
      : `Watch ≤${m[4][0]}, Alert ≤${m[4][1]}, Emergency ≤${m[4][2]}`;
  return (
    <div className="space-y-5">
      <Card
        title="City profile and critical systems"
        sub="Values are placeholders; replace them with census, municipal and utility data. Everything below updates as you type."
      >
        <div className="grid grid-cols-2 items-end gap-4 md:grid-cols-3 xl:grid-cols-5">
          {CITY_FIELDS.map(([k, l]) => (
            <InputField
              key={k}
              label={l}
              type="number"
              step="any"
              value={String(c[k])}
              onChange={(e) => setUi({ cityVals: { ...c, [k]: +e.target.value || 0 } })}
            />
          ))}
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi
          highlight
          label="Expected annual climate cost"
          value={`₹ ${fmt(R.tot, 0)} cr`}
          sub={`${fmt(c.gva > 0 ? (R.tot / c.gva) * 100 : 0, 2)}% of city GVA`}
        />
        <Kpi
          label="Water scarcity premium"
          value={`₹ ${fmt(R.prem, 1)} cr`}
          sub={`reservoirs cover ${fmt(R.cover, 0)} of 240 dry days`}
        />
        <Kpi
          label="Air-quality output loss"
          value={`₹ ${fmt(R.aq, 1)} cr/yr`}
          sub={`${fmt(c.aqd, 0)} severe days a year`}
        />
        <Kpi
          label="People and beds exposed"
          value={`${fmt(R.ex, 1)} lakh people`}
          sub={`${fmt(R.vp, 1)} lakh vulnerable · about ${fmt(R.bd, 0)} beds in hazard zones`}
        />
      </div>
      <Card
        title="Which urban systems each hazard hits"
        sub="Score = system sensitivity (0–3, judgement) scaled by the city hazard score at the chosen horizon (1–5). Darker means more exposure."
      >
        <Table
          minWidth={760}
          head={["System", ...SYSTEM_HAZARDS]}
          rows={[
            [<b key="h">Hazard score</b>, ...R.HS.map((x, j) => <b key={j}>{x.toFixed(1)}</b>)],
            ...SYSTEMS.map((s) => [
              s[0],
              ...s[1].map((v, j) => <Score key={j} level={(v / 3) * R.HS[j]} />),
            ]),
          ]}
        />
      </Card>
      <Card
        title="What a city-wide halt costs"
        sub="City output lost = daily city GVA × days halted × share of each part of the economy that stops. Student-days assume schools close for those days. Probabilities are assumed from hazard scores."
      >
        <Table
          num={[1, 2, 3, 4, 5]}
          head={[
            "Hazard",
            "Days halted",
            "City output lost ₹ cr",
            "Student-days lost (lakh)",
            "Annual probability",
            "Expected annual ₹ cr",
          ]}
          rows={R.E.map((x) => [
            x.n,
            fmt(x.d, 0),
            fmt(x.loss, 0),
            fmt(x.st, 1),
            fmt(x.p * 100, 1) + "%",
            fmt(x.x, 1),
          ])}
        />
      </Card>
      <Card
        title="Water: how long reservoirs can cover demand"
        sub="Dry period assumed 240 days before the next monsoon. A rainfall deficit cuts usable storage by 0.8 times the deficit. The premium is the extra cost of buying the shortfall from tankers or third parties at the price above."
      >
        <Table
          head={["Measure", "Value", "How to read it"]}
          rows={[
            [
              "Demand met from reservoirs",
              fmt(R.rd / 1000, 0) + " MLD",
              "Share of city demand that depends on stored water",
            ],
            [
              "Usable storage in the scenario",
              fmt(R.avail / 1e6, 0) + " MCM",
              "Live storage after the rainfall-deficit haircut",
            ],
            [
              "Days of cover",
              fmt(R.cover, 0) + " days",
              "Below 240 means a shortfall before the next monsoon",
            ],
            [
              "Shortfall",
              `${fmt(R.sh, 0)} days · ${fmt(R.vol, 1)} MCM`,
              "Water that must come from elsewhere",
            ],
            ["Premium cost", `₹ ${fmt(R.prem, 1)} cr`, "Shortfall × (tanker price minus tariff)"],
            [
              "People exposed to cuts",
              fmt(R.aff, 1) + " lakh",
              "Approximate, assumes cuts spread across reservoir-fed areas",
            ],
          ]}
        />
      </Card>
      <Card
        title="Air quality"
        sub="Output lost = daily GVA × severe-AQI days × share of air-sensitive sectors × output lost on those days. Not counted: health costs, flight and rail delay costs borne by others, and school closures."
      >
        <p className="text-sm leading-relaxed text-white/90">
          {fmt(c.aqd, 0)} severe days a year → about ₹ {fmt(R.aq, 1)} cr per year. Hospitality,
          aviation, road and rail transport and construction feel the first impact; schools and
          outdoor work follow.
        </p>
      </Card>
      <Card
        title="Mitigation and adaptation plan by urban system"
        sub="Cost class is relative (Low, Medium, High); size actual budgets with local engineering estimates."
      >
        <Table
          minWidth={900}
          head={["System", "Actions", "Lead agency", "Cost class", "Monitoring KPI"]}
          rows={CITY_ACTIONS}
        />
      </Card>
      <Card
        title="Monitoring: early-warning indicators and triggers"
        sub="Type the current reading. Status moves from Normal to Watch, Alert and Emergency when thresholds are crossed. Thresholds are illustrative; set them with the disaster-management authority."
      >
        <p className="mb-4 flex items-center gap-3 text-sm font-semibold text-white">
          Overall city alert level: <Pill tone={LEVEL_TONE[worst]}>{ALERT_LEVELS[worst]}</Pill>
        </p>
        <Table
          minWidth={1100}
          head={[
            "Indicator",
            "Source",
            "Current",
            "Thresholds",
            "Status",
            "Impact if breached",
            "Action trigger",
          ]}
          rows={MONITORS.map((m, i) => [
            m[0],
            m[1],
            <input
              key="v"
              type="number"
              step="any"
              aria-label={m[0]}
              value={String(ui.monv[i])}
              onChange={(e) => {
                const monv = ui.monv.slice();
                monv[i] = +e.target.value;
                setUi({ monv });
              }}
              className="w-24 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-white outline-none focus:border-periwinkle/60"
            />,
            thresholds(m),
            <Pill key="s" tone={LEVEL_TONE[levels[i]]}>
              {ALERT_LEVELS[levels[i]]}
            </Pill>,
            m[2],
            m[3],
          ])}
        />
      </Card>
      <Card
        title="Climate-smart city scorecard (aligned to MoHUA CSCAF themes)"
        sub="Self-assess 0 (absent) to 4 (leading). The Climate Smart Cities Assessment Framework from MoHUA groups city action into these five themes; verify the current framework version. Other references: Smart Cities Mission outputs, NITI Aayog water and urban work, NCAP and GRAP for air, NDMA guidelines, NAPCC and the state action plan."
      >
        <p className="mb-5 text-sm font-semibold text-white">
          Climate-smart city index (illustrative):{" "}
          {((ui.cs5.reduce((a, b) => a + b, 0) / 20) * 100).toFixed(0)}/100
        </p>
        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {SCORECARD_THEMES.map((t, i) => (
            <Slider
              key={t}
              label={t}
              value={ui.cs5[i]}
              max={4}
              onChange={(v) => {
                const cs5 = ui.cs5.slice();
                cs5[i] = v;
                setUi({ cs5 });
              }}
            />
          ))}
        </div>
      </Card>
      <HowToRead i={9} />
    </div>
  );
}
