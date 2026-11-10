import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SelectField } from "@/components/observatory/ui";
import { fmt } from "../format";
import { Card, RiskLegend, Table, riskColor } from "../ui";
import type { CityCtx } from "./context";
import { HAZARDS, HORIZONS, SSP_NAMES } from "./data/content";
import { districtRows, ranked, type DistrictResult } from "./model";

const METRICS: [string, string][] = [
  ["eal", "Expected annual loss (% of GDP)"],
  ["ealv", "Expected annual loss (value)"],
  ["hot", "Number of hotspot hazards"],
  ["vi", "Vulnerability index"],
  ["vuln", "Highly vulnerable people"],
  ["pop", "People today"],
  ["dens", "People per km²"],
  ...HAZARDS.map((n, i): [string, string] => ["h" + i, n + " score"]),
];

const isHazard = (m: string) => m[0] == "h" && m != "hot";
function value(r: DistrictResult, m: string) {
  if (isHazard(m)) return r.hs[+m.slice(1)];
  return r[m as "eal" | "ealv" | "hot" | "vi" | "vuln" | "pop" | "dens"];
}

const loadMap = () =>
  import("./data/district-map.json").then((m) => m.default as unknown as [number, string][]);

const linkCls =
  "text-left font-semibold text-lavender underline decoration-lavender/30 underline-offset-4 hover:text-white";

export function DistrictsTab({ districts, si, hi, inr, pick, ui, setUi }: CityCtx) {
  const map = useQuery({
    queryKey: ["platform", "district-map"],
    queryFn: loadMap,
    staleTime: Infinity,
  });
  const IM = ui.mapMetric,
    IS = ui.mapState;
  const rows = useMemo(
    () => (districts ? districtRows(districts.list, si, hi) : []),
    [districts, si, hi],
  );
  const [hover, setHover] = useState<number | null>(null);

  const states = useMemo(() => districts?.states ?? [], [districts]);
  const isH = isHazard(IM);
  const lbl = METRICS.find((m) => m[0] == IM)?.[1] ?? "";
  const fmtV = (v: number) =>
    IM == "eal"
      ? fmt(v, 2) + "%"
      : IM == "ealv"
        ? inr(v, 0)
        : IM == "vuln" || IM == "pop"
          ? fmt(v, 2) + " m"
          : IM == "dens" || IM == "vi"
            ? fmt(v, 0)
            : IM == "hot"
              ? String(v)
              : v.toFixed(1);

  // Hazard scores map directly; other metrics map by quintile across India's districts.
  const level = useMemo(() => {
    const sorted = rows.map((r) => value(r, IM)).sort((a, b) => a - b);
    const q = (v: number) => {
      let lo = 0,
        h = sorted.length;
      while (lo < h) {
        const m = (lo + h) >> 1;
        if (sorted[m] < v) lo = m + 1;
        else h = m;
      }
      return lo / sorted.length;
    };
    return (v: number) => (isH ? v : 1 + 4 * q(v));
  }, [rows, IM, isH]);

  const paths = useMemo(
    () =>
      map.data && rows.length
        ? map.data.map(([i, d]) => {
            const r = rows[i];
            const dim = IS !== "" && r.c.region !== states[+IS];
            return (
              <path
                key={i}
                d={d}
                data-i={i}
                fill={riskColor(level(value(r, IM)))}
                stroke="#0a0b1a"
                strokeWidth={0.4}
                opacity={dim ? 0.22 : 1}
                className="cursor-pointer transition-opacity hover:opacity-80"
              >
                <title>{`${r.c.district!.dname}, ${r.c.region}`}</title>
              </path>
            );
          })
        : null,
    [map.data, rows, IM, IS, level, states],
  );

  if (!districts)
    return <Card title="All-India district risk map" sub="Loading India’s 640 districts…" />;

  const tot = rows.reduce((a, r) => a + r.pop, 0),
    totE = rows.reduce((a, r) => a + r.ealv, 0),
    totG = rows.reduce((a, r) => a + r.I.gdp, 0);
  const flt = rows
    .filter((r) => IS === "" || r.c.region === states[+IS])
    .sort((a, b) => value(b, IM) - value(a, IM));
  const byState = states
    .map((n, i) => {
      const L = rows.filter((r) => r.c.region == n);
      return {
        n,
        i,
        k: L.length,
        p: L.reduce((a, r) => a + r.pop, 0),
        e: L.reduce((a, r) => a + r.ealv, 0),
        g: L.reduce((a, r) => a + r.I.gdp, 0),
        vu: L.reduce((a, r) => a + r.vuln, 0),
      };
    })
    .sort((a, b) => b.e - a.e);
  const hv = hover != null ? rows[hover] : null;

  return (
    <div className="space-y-5">
      <Card
        title={`All-India district risk map · ${SSP_NAMES[si]} ${HORIZONS[hi]}`}
        sub="All 640 census districts of India, scored with the same method as the cities. Tap a district to open its full assessment. Districts created since 2011 are shown inside their 2011 parent and can be found by name."
        how={
          <>
            <b>India today.</b> {fmt(tot / 1000, 3)} billion people in {rows.length} districts;
            modelled expected annual climate loss {inr(totE, 0)} a year,{" "}
            {fmt((totE / totG) * 100, 2)}% of GDP, under this scenario and horizon.
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Show"
            value={IM}
            onChange={(e) => setUi({ mapMetric: e.target.value })}
          >
            {METRICS.map(([k, n]) => (
              <option key={k} value={k}>
                {n}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="State or UT"
            value={IS}
            onChange={(e) => setUi({ mapState: e.target.value })}
          >
            <option value="">All India</option>
            {states.map((n, i) => (
              <option key={n} value={i}>
                {n}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="relative mx-auto mt-6 max-w-[560px]">
          {map.data ? (
            <svg
              viewBox="0 0 520 600"
              className="block h-auto w-full"
              role="img"
              aria-label={`Map of India districts by ${lbl}`}
              onMouseOver={(e) => {
                const i = (e.target as Element).getAttribute("data-i");
                setHover(i == null ? null : Number(i));
              }}
              onMouseLeave={() => setHover(null)}
              onClick={(e) => {
                const i = (e.target as Element).getAttribute("data-i");
                if (i != null) pick(rows[Number(i)].c.id);
              }}
            >
              {paths}
            </svg>
          ) : (
            <div className="grid aspect-[52/60] place-items-center text-sm text-muted-foreground">
              Loading the map…
            </div>
          )}
          {hv && (
            <div className="pointer-events-none absolute left-0 top-0 rounded-2xl border border-white/10 bg-midnight/95 px-4 py-3 text-xs shadow-[0_20px_50px_-20px_rgb(0_0_0/0.9)] backdrop-blur">
              <p className="font-semibold text-white">{hv.c.district!.dname}</p>
              <p className="text-muted-foreground">{hv.c.region}</p>
              <p className="mt-1.5 text-muted-foreground">
                {lbl}: <b className="text-white">{fmtV(value(hv, IM))}</b>
              </p>
            </div>
          )}
        </div>
        <div className="mt-4">
          <RiskLegend low={isH ? "Score 1" : "Lowest fifth"} high={isH ? "5" : "Highest fifth"} />
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Shows census districts with data. Not an authoritative depiction of India’s external
            boundaries; see Survey of India maps.
          </p>
        </div>
      </Card>
      <Card
        title={`${IS === "" ? "Top 25 districts in India" : "Districts of " + states[+IS]} by ${lbl}`}
        sub="Tap a name to open the district."
      >
        <Table
          minWidth={820}
          num={[0, 3, 4, 5]}
          head={["#", "District", "State", "Value", "People today", "Vulnerability", "Top hazards"]}
          rows={flt.slice(0, IS === "" ? 25 : 200).map((r, k) => [
            k + 1,
            <button key="d" type="button" className={linkCls} onClick={() => pick(r.c.id)}>
              {r.c.district!.dname}
            </button>,
            r.c.region,
            fmtV(value(r, IM)),
            fmt(r.pop, 2) + " m",
            r.vi,
            ranked(r.hs)
              .slice(0, 2)
              .map((i) => HAZARDS[i] + " " + r.hs[i].toFixed(1))
              .join(", "),
          ])}
        />
      </Card>
      <Card
        title="States and union territories"
        sub="Totals across each state’s districts, sorted by expected annual loss."
        how={
          <>
            <b>Method.</b> Hazards come from the pincode model (elevation, relief, slope, distance
            to coast and rivers, urban density) with state heat, rainfall, cyclone and seismic
            inputs. Population is nowcast from Census 2011 with state growth rates. GDP is modelled.
            Use the ranking to set priorities, then confirm with state and district data.
          </>
        }
      >
        <Table
          minWidth={900}
          num={[1, 2, 3, 4, 5, 6]}
          head={[
            "State or UT",
            "Districts",
            "People today",
            "Highly vulnerable people",
            "GDP (modelled)",
            "Expected annual loss",
            "% of GDP",
          ]}
          rows={byState.map((s) => [
            <button
              key="s"
              type="button"
              className={linkCls}
              onClick={() => setUi({ mapState: String(s.i) })}
            >
              {s.n}
            </button>,
            s.k,
            fmt(s.p, 1) + " m",
            fmt(s.vu, 1) + " m",
            inr(s.g, 0),
            inr(s.e, 0),
            fmt((s.e / s.g) * 100, 2) + "%",
          ])}
        />
      </Card>
    </div>
  );
}
