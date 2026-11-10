import { Kpi, Pill } from "@/components/observatory/ui";
import { fmt } from "../format";
import { Bullets, Card, Grid, Stat, Table } from "../ui";
import type { EntCtx } from "./context";
import { AWARENESS, CASES, FINANCE_OPTIONS, GAPS, HZ } from "./data";
import { tangible } from "./model";
import { HowToRead, Slider } from "./ui";

export function ResilienceTab(x: EntCtx) {
  const { plan: L, ui, setUi, city, ci, S } = x;
  const E = S.em;
  const adCap = L.A4.reduce((a, r) => a + r.cap, 0),
    adSave = L.A4.reduce((a, r) => a + r.sv, 0);
  return (
    <div className="space-y-5">
      <Card
        title={`${city ? "City" : "Organisation"} resilience maturity self-assessment`}
        sub="0 = absent, 4 = leading practice. Sets the resilience index and the capacity-building priorities below."
      >
        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {L.dm.map((d, i) => (
            <Slider
              key={d}
              label={d}
              value={ui.rs[i]}
              max={4}
              onChange={(v) => {
                const rs = ui.rs.slice();
                rs[i] = v;
                setUi({ rs });
              }}
            />
          ))}
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi
          highlight
          label="Resilience index"
          value={`${L.ix.toFixed(0)}/100`}
          sub={`${L.band} · illustrative leader benchmark ≈ 80`}
        />
        <Kpi
          label="Mitigation programme"
          value={`₹ ${fmt(L.tc)} cr`}
          sub={`abates ${fmt(L.tt, 0)} tCO2e/yr${E > 0 ? ` (${fmt((L.tt / E) * 100, 0)}% of Scope 1+2)` : ""}`}
        />
        <Kpi
          label="Adaptation programme (top 4 hazards)"
          value={`₹ ${fmt(adCap)} cr`}
          sub={`avoids ₹ ${fmt(adSave)} cr per year`}
        />
        <Kpi
          label="Carbon price used (medium term)"
          value={`₹ ${fmt(L.price, 0)}/t`}
          sub={CASES[ci].n.split(" (")[0]}
        />
      </div>
      <Card
        title="Cost of mitigation"
        sub="Marginal abatement cost = annualised capex minus annual saving, per tCO2e. Negative cost means the measure pays for itself. Illustrative unit coefficients."
      >
        <Table
          minWidth={760}
          num={[1, 2, 3, 4]}
          head={[
            "Measure",
            "Abates tCO2e/yr",
            "Capex ₹ cr",
            "Net annual saving ₹ cr",
            "Cost per tCO2e (₹)",
            "Versus carbon price",
          ]}
          rows={L.M.map((m) => [
            m.n,
            fmt(m.t, 0),
            fmt(m.cap, 2),
            fmt(m.net, 2),
            fmt(m.mac, 0),
            m.mac < 0 ? (
              <Pill key="v" tone="good">
                Pays for itself
              </Pill>
            ) : m.mac < L.price ? (
              <Pill key="v">Cheaper than carbon cost</Pill>
            ) : (
              <Pill key="v" tone="warn">
                Above carbon price
              </Pill>
            ),
          ])}
        />
      </Card>
      <Card
        title="Cost and benefit of adaptation"
        sub="Top four hazards at the chosen horizon. Capex scales with asset value and hazard score; measures assumed to avoid 60% of expected loss; 20 years at 8%."
      >
        <Table
          minWidth={720}
          num={[2, 3, 4, 5]}
          head={[
            "Hazard",
            "Measure",
            "Capex ₹ cr",
            "Avoided loss ₹ cr/yr",
            "Benefit-cost",
            "Payback",
          ]}
          rows={L.A4.map((r) => [
            r.n,
            r.m,
            fmt(r.cap, 2),
            fmt(r.sv, 2),
            <b key="b" className={r.bcr >= 1 ? "text-emerald-300" : "text-amber-300"}>
              {r.bcr.toFixed(1)}
            </b>,
            r.pb ? fmt(r.pb) + " yrs" : "n/a",
          ])}
        />
      </Card>
      <Card
        title="Capacity building plan"
        sub="Priority follows your self-assessment: scores of 0–1 are high priority."
      >
        <Table
          head={["Audience", "Module", "Format", "Priority"]}
          rows={L.cb.map((c) => [
            c[0],
            c[1],
            c[2],
            ui.rs[c[3]] <= 1 ? (
              <Pill key="p" tone="bad">
                High
              </Pill>
            ) : ui.rs[c[3]] == 2 ? (
              <Pill key="p" tone="warn">
                Medium
              </Pill>
            ) : (
              <Pill key="p" tone="good">
                Maintain
              </Pill>
            ),
          ])}
        />
      </Card>
      <Grid>
        <Card title="Awareness programme" sub="Matched to the three leading hazards">
          <Bullets
            items={L.ord
              .slice(0, 3)
              .flatMap((i) => AWARENESS[HZ[i]].map((a) => HZ[i] + ": " + a))
              .concat([
                "Annual climate-risk briefing and public report of resilience actions",
                "Feedback channel for workers, residents and suppliers to report hazards and near-misses",
              ])}
          />
        </Card>
        <Card
          title="Financing and insurance options"
          sub="Availability and terms vary; confirm with providers"
        >
          <Bullets items={FINANCE_OPTIONS} />
        </Card>
      </Grid>
      <Grid cols={3}>
        <Card title="Roadmap · 0–12 months">
          <Bullets items={L.now} />
        </Card>
        <Card title="Roadmap · 1–3 years">
          <Bullets
            items={
              L.nxt.length
                ? L.nxt
                : ["No adaptation measure clears benefit-cost 1 on these inputs; refine inputs"]
            }
          />
        </Card>
        <Card title="Roadmap · 3–7 years">
          <Bullets items={L.lat} />
        </Card>
      </Grid>
      <Card title="Known gaps in this dashboard" sub="Remaining work before external use">
        <Bullets items={GAPS} />
      </Card>
      <Tangible {...x} />
      <HowToRead i={6} />
    </div>
  );
}

function Tangible({ S, plan }: EntCtx) {
  const { site, top, rows } = tangible(S, plan.hs);
  const tc = rows.reduce((a, r) => a + r.mid, 0),
    ta = rows.reduce((a, r) => a + r.av, 0);
  return (
    <Card
      title="Tangible resilience measures for this site"
      sub={`Each measure has a specification, a quantity sized from the site area (${fmt(site.a, 0)} m²) and workforce (${fmt(site.w, 0)}), an indicative cost range, the loss it avoids and a KPI to track. Unit rates are indicative 2025 Indian market ranges; validate them against the CPWD Delhi Schedule of Rates and vendor quotes before budgeting. Avoided loss is the share of this hazard’s expected annual loss (from the event stress test) the measure removes; benefit-cost uses an 8% discount rate over the measure’s life.`}
      how={
        <>
          <b>How to read.</b> Payback is capex divided by avoided loss net of running cost.
          Benefit-cost above 1 means the measure saves more than it costs over its life on these
          inputs. A low ratio does not make a measure pointless: life-safety measures (heat
          programme, structural retrofit) are justified by duty of care and regulation, not only by
          avoided loss. Avoided loss rises with the scenario, so re-check under SSP5-8.5.
        </>
      }
    >
      <div className="mb-6 grid grid-cols-2 gap-6 lg:grid-cols-4">
        <Stat
          label="Measures listed"
          value={rows.length}
          sub={`for ${top.map((i) => HZ[i]).join(", ")}`}
        />
        <Stat
          label="Capex (midpoint)"
          value={`₹ ${fmt(tc, 2)} cr`}
          sub={`range ₹ ${fmt(
            rows.reduce((a, r) => a + r.lo, 0),
            2,
          )}–${fmt(
            rows.reduce((a, r) => a + r.hi, 0),
            2,
          )} cr`}
        />
        <Stat
          label="Expected loss avoided"
          value={`₹ ${fmt(ta, 2)} cr/yr`}
          sub="before running costs"
        />
        <Stat
          label="Measures with benefit-cost ≥ 1"
          value={`${rows.filter((r) => r.bcr >= 1).length} of ${rows.length}`}
          sub="do these first"
        />
      </div>
      <Table
        minWidth={1280}
        num={[3, 4, 5, 6, 7, 8]}
        head={[
          "Measure and specification",
          "Hazard",
          "Quantity",
          "Unit rate ₹",
          "Capex ₹ cr",
          "Avoided loss ₹ cr/yr",
          "Running cost ₹ cr/yr",
          "Payback",
          "Benefit-cost",
          "KPI to track",
          "Standard",
        ]}
        rows={rows.map((r) => [
          <div key="m" className="min-w-56">
            <b>{r.m[1]}</b>
            <p className="mt-1 text-xs text-muted-foreground">{r.m[2]}</p>
          </div>,
          HZ[r.m[0]],
          fmt(r.q, 0) + " " + r.u,
          fmt(r.m[4], 0) + "–" + fmt(r.m[5], 0),
          fmt(r.lo, 2) + "–" + fmt(r.hi, 2),
          fmt(r.av, 3),
          fmt(r.ox, 3),
          r.pb ? fmt(r.pb, 1) + " yrs" : "n/a",
          <b key="b" className={r.bcr >= 1 ? "text-emerald-300" : "text-amber-300"}>
            {r.bcr.toFixed(2)}
          </b>,
          r.m[9],
          r.m[10],
        ])}
      />
    </Card>
  );
}
