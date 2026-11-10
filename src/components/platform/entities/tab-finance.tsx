import { Pill } from "@/components/observatory/ui";
import { fmt } from "../format";
import { Card, Grid, Score, Stat, Table } from "../ui";
import type { EntCtx } from "./context";
import { CASES, HL, HZ } from "./data";
import { calc, evl, footprint, prob, siteRevenue } from "./model";
import { CellBar, CostBars, HowToRead } from "./ui";

const reading = (v: number, a: number, b: number) =>
  v < a ? (
    <Pill tone="good">Low</Pill>
  ) : v < b ? (
    <Pill tone="warn">Moderate</Pill>
  ) : (
    <Pill tone="bad">High</Pill>
  );

export function FinanceTab({ S, A, o, hs, hv, ci }: EntCtx) {
  const sr = siteRevenue(S),
    O = o[hv],
    worst = Math.max(...HZ.map((_, i) => evl(S, i, hs[i]).tot)),
    p1 = sr > 0 ? (O.phys / sr) * 100 : 0,
    p2 = sr > 0 ? (O.tr / sr) * 100 : 0,
    p3 = S.av > 0 ? (worst / S.av) * 100 : 0,
    hn = hs.filter((x) => x >= 3.5).length;
  const F = footprint(S);
  const rows = HZ.map((h, i) => {
    const e = evl(S, i, hs[i]),
      p = prob(hs[i]);
    return { h, s: hs[i], p, e, x: p * e.tot };
  });
  const mx = Math.max(...rows.map((r) => r.e.tot), 1e-9),
    tot = rows.reduce((a, r) => a + r.x, 0);
  const pct = (x: number) => (sr > 0 ? (x / sr) * 100 : 0);
  return (
    <div className="space-y-5">
      <Card
        title="Lender and investor lens"
        sub="How a bank or investor would first read this site. Bands are illustrative screening thresholds, not a credit rating; use them to decide where to ask for more evidence."
      >
        <Table
          head={["Indicator", "Value", "Reading", "Typical use"]}
          rows={[
            [
              "Expected annual physical loss",
              fmt(p1, 2) + "% of site revenue",
              reading(p1, 0.5, 1.5),
              "Pricing, covenants, insurance negotiation",
            ],
            [
              "Transition cost at this horizon",
              fmt(p2, 2) + "% of site revenue",
              reading(p2, 1, 3),
              "Margin pressure and capex needs",
            ],
            [
              "Worst single event vs site assets",
              fmt(p3, 1) + "% of site asset value",
              reading(p3, 10, 25),
              "Collateral and business-interruption cover",
            ],
            [
              "Hazards scoring 3.5 or above",
              hn + " of 7",
              reading(hn, 1, 3),
              "Site selection and concentration limits",
            ],
          ]}
        />
      </Card>
      <Grid>
        <Card
          title="Annual cost by horizon"
          sub={`₹ crore per year: physical plus transition · ${CASES[ci].n}`}
        >
          <CostBars
            label="Annual cost by horizon"
            bars={o.map((x, i) => ({
              name: HL[i].split(" (")[0],
              sub: `+${x.t}°C`,
              phys: x.phys,
              tr: x.tr,
            }))}
          />
        </Card>
        <Card title="Scenario comparison" sub="Total annual cost, ₹ crore and % of site revenue">
          <Table
            minWidth={460}
            head={["Case", ...HL.map((x) => x.split(" (")[0])]}
            rows={CASES.map((c, i) => [
              <b key="c">{c.n}</b>,
              ...calc(S, A, i).map((x, h) => (
                <Score key={h} level={1 + pct(x.tot) * 1.2}>
                  ₹ {fmt(x.tot)}
                  <span className="block text-[11px] font-normal">{fmt(pct(x.tot), 2)}%</span>
                </Score>
              )),
            ])}
          />
        </Card>
      </Grid>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Illustrative coefficients; enter real asset value, revenue and emissions above. Physical =
        expected damage plus business interruption; transition = net carbon cost plus market and
        technology shift cost.
      </p>
      <Card
        title="Economic footprint: how much this site matters"
        sub="From national GVA down to the site. Replace indicative shares with MoSPI figures in the assumptions panel."
      >
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          <Stat
            label="Sector share of national GVA"
            value={fmt(S.ssh, 1) + "%"}
            sub={`₹ ${fmt(F.sec / 1e5, 1)} lakh crore`}
          />
          <Stat
            label="Company share of sector output"
            value={fmt(F.cs, 4) + "%"}
            sub={`revenue ₹ ${fmt(F.cr, 0)} cr of ₹ ${fmt(F.out / 1e5, 1)} lakh crore output`}
          />
          <Stat
            label="Site revenue"
            value={`₹ ${fmt(F.sr, 0)} cr`}
            sub={`${fmt(S.sit, 0)}% of company revenue`}
          />
          <Stat
            label="Site GVA"
            value={`₹ ${fmt(F.sg, 0)} cr/yr`}
            sub={`${fmt(F.sn, 5)}% of national GVA · ₹ ${fmt(F.gd, 2)} cr per day`}
          />
        </div>
      </Card>
      <Card
        title="Event stress test: cost of a halted site"
        sub="Loss per event = lost contribution (revenue lost minus variable costs saved, including ramp-up) + 10% recovery expense + delay penalties + uninsured property damage. GVA is the national-accounts value not produced. Edit days and damage in the assumptions panel."
        how={
          <>
            Expected annual physical loss <b>₹ {fmt(tot, 2)} cr</b> = {fmt(pct(tot), 2)}% of site
            revenue. Probabilities are assumed from hazard scores; replace with return periods from
            hazard maps.
          </>
        }
      >
        <Table
          minWidth={1040}
          num={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
          head={[
            "Hazard",
            "Score",
            "Days halted",
            "Lost revenue ₹ cr",
            "Lost contribution ₹ cr",
            "Property (net) ₹ cr",
            "Total company loss ₹ cr",
            "GVA not produced ₹ cr",
            "Annual probability",
            "Expected annual loss ₹ cr",
          ]}
          rows={rows.map((r) => [
            r.h,
            r.s.toFixed(1),
            fmt(r.e.d, 1),
            fmt(r.e.lr, 2),
            fmt(r.e.lc, 2),
            fmt(r.e.np, 2),
            <div key="t">
              <b className="text-white">{fmt(r.e.tot, 2)}</b>
              <CellBar share={r.e.tot / mx} />
            </div>,
            fmt(r.e.gva, 2),
            fmt(r.p * 100, 1) + "%",
            fmt(r.x, 3),
          ])}
        />
      </Card>
      <HowToRead i={5} />
    </div>
  );
}
