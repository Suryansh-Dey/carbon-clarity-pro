import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState, type ReactNode } from "react";
import {
  GhostButton,
  InputField,
  Kpi,
  Pill,
  PrimaryButton,
  SelectField,
} from "@/components/observatory/ui";
import { cn } from "@/lib/utils";
import { buildCities, kmx, loadDistricts, type City } from "../cities/model";
import { fmt } from "../format";
import { Card, Table } from "../ui";
import type { EntCtx, EntTab, EntUi } from "./context";
import {
  CASES,
  CITY_DEFAULTS,
  DAMAGE,
  DAYS,
  DEMO,
  ENTITY_TYPES,
  EXAMPLES,
  HL,
  HZ,
  MONITORS,
  PROV_DEFAULTS,
  PROV_OWNERS,
  SECTORS,
} from "./data";
import { baseline, calc, plan, sectorDefaults, type Site } from "./model";
import { baseA, groundA, isPin, loadPins, nearestPin, pinInfo, type PinData } from "./pins";
import type { Analysis, Coverage, Narrative, PinInfo, Prov, ProvKey } from "./types";
import { CitySystemsTab } from "./tab-city";
import { FinanceTab } from "./tab-finance";
import { DictionaryTab, LiveTab } from "./tab-reference";
import { PresentationTab, ReportTab } from "./tab-report";
import { ResilienceTab } from "./tab-resilience";
import { ChainTab, MediaTab, PolicyTab, RisksTab, SiteTab } from "./tabs-site";

const TABS: [EntTab, string, (x: EntCtx) => ReactNode][] = [
  ["site", "Site & hazards", SiteTab],
  ["chain", "Impact chain", ChainTab],
  ["risks", "Risks & opportunities", RisksTab],
  ["media", "Media assessment", MediaTab],
  ["policy", "Policy, practice & peers", PolicyTab],
  ["finance", "Financial exposure", FinanceTab],
  ["resilience", "Resilience & costs", ResilienceTab],
  ["report", "TCFD / IFRS S2 report", ReportTab],
  ["slides", "Presentation", PresentationTab],
  ["city", "City systems", CitySystemsTab],
  ["live", "Live data & sources", LiveTab],
  ["dict", "Data dictionary", DictionaryTab],
];

type Num =
  | "av"
  | "rv"
  | "em"
  | "ad"
  | "ngva"
  | "ssh"
  | "gvr"
  | "sit"
  | "vc"
  | "rmp"
  | "pen"
  | "cov"
  | "sa"
  | "wk";
const ASSUMPTIONS: [Num, string, string][] = [
  ["ngva", "National GVA (₹ lakh crore)", "0.01"],
  ["ssh", "Sector share of national GVA (%)", "0.1"],
  ["gvr", "GVA-to-output ratio of sector", "0.01"],
  ["sit", "Site share of company revenue (%)", "1"],
  ["vc", "Variable-cost share of revenue", "0.01"],
  ["rmp", "Ramp-up days after restart (at 50% output)", "1"],
  ["pen", "Delay penalties (% of lost revenue)", "0.5"],
  ["cov", "Property insurance cover (%)", "1"],
  ["sa", "Site built-up area (m²)", "1"],
  ["wk", "Workers on site (incl. contract)", "1"],
];
const CHIPS = [
  "CG Power · Bhopal (built-in example)",
  "Tata Steel · Jamshedpur",
  "Reliance · Jamnagar",
  "Infosys · Mysuru",
];
const PROV_KEYS: Partial<Record<Num, ProvKey>> = {
  rv: "rv",
  sit: "sit",
  av: "av",
  em: "em",
  vc: "vc",
  cov: "cov",
};

const str = (o: Record<string, number>) =>
  Object.fromEntries(Object.entries(o).map(([k, x]) => [k, String(x)]));

/** Inputs of the built-in example, with where each came from. */
function demoValues() {
  const prov: Record<ProvKey, Prov> = { ...PROV_DEFAULTS };
  prov.rv = {
    src: "Public filing",
    basis:
      "CG Power BRSR FY2025-26, CSR note: FY2024-25 standalone turnover ₹9,329 cr. Update with the audited FY2025-26 figure.",
    conf: "high",
  };
  (["sit", "av", "em"] as const).forEach(
    (k) =>
      (prov[k] = {
        src: "Placeholder",
        basis: "Illustrative; the company must supply this",
        conf: "",
      }),
  );
  return { vals: { rv: "9329", sit: "25", av: "1200", em: "15000" }, prov };
}

const INITIAL = (() => {
  const d = demoValues();
  return {
    // Revenue, site share, asset value and emissions come from the built-in example.
    vals: {
      ad: "0",
      ngva: "314.87",
      rmp: "3",
      pen: "2",
      cov: "0",
      sa: "20000",
      wk: "600",
      ...str(sectorDefaults(1)),
      ...d.vals,
    } as Record<Num, string>,
    prov: d.prov,
  };
})();

type Run = { kind: "demo" } | { kind: "pin"; pin: string; name: string; nas: number };
interface Result {
  A: Analysis;
  B?: Narrative;
  C?: Coverage;
  demo: boolean;
}

export function EntitiesModule({ onOpenCity }: { onOpenCity: (id: string) => void }) {
  const pins = useQuery({ queryKey: ["platform", "pins"], queryFn: loadPins, staleTime: Infinity });
  const [now] = useState(() => Date.now());
  const cities = useMemo(() => buildCities(now), [now]);
  const districts = useQuery({
    queryKey: ["platform", "districts", now],
    queryFn: () => loadDistricts(now),
    staleTime: Infinity,
  }).data;

  const [form, setForm] = useState({
    md: "0",
    et: "listed1000",
    en: EXAMPLES[0][0],
    lc: EXAMPLES[0][1],
    pc: EXAMPLES[0][2],
    cs: "1",
    hv: "1",
  });
  const [vals, setVals] = useState(INITIAL.vals);
  const [nas, setNasState] = useState(1);
  const [dd, setDd] = useState(DAYS.map(String));
  const [dm, setDm] = useState(DAMAGE.map(String));
  const [prov, setProv] = useState(INITIAL.prov);
  const [run, setRun] = useState<Run>({ kind: "demo" });
  const [status, setStatus] = useState("");
  const [tab, setTab] = useState<EntTab>("site");
  const [direction, setDirection] = useState(1);
  const [ui, setUiState] = useState<EntUi>({
    sel: 9,
    rs: Array(8).fill(2),
    slide: 0,
    cityVals: CITY_DEFAULTS,
    monv: MONITORS.map((m) => m[6]),
    cs5: Array(5).fill(2),
  });
  const setUi = (patch: Partial<EntUi>) => setUiState((u) => ({ ...u, ...patch }));

  const setNas = (n: number) => {
    const k = n >= 0 && n < SECTORS.length ? n : 1;
    setNasState(k);
    setVals((v) => ({ ...v, ...str(sectorDefaults(k)) }));
  };
  const userEntered = (k: ProvKey) =>
    setProv((p) => ({
      ...p,
      [k]: { src: "User entered", basis: "Entered by the user", conf: "" },
    }));
  const setVal = (k: Num, x: string) => {
    setVals((v) => ({ ...v, [k]: x }));
    const pk = PROV_KEYS[k];
    if (pk) userEntered(pk);
  };

  const result = useMemo((): Result | null => {
    if (!pins.data) return null;
    if (run.kind === "demo") {
      const A = structuredClone(DEMO.A);
      groundA(pins.data, A, "462046");
      return { A, B: DEMO.B, C: DEMO.C, demo: true };
    }
    const A = baseA(pins.data, run.pin, run.name, run.nas);
    return A ? { A, demo: false } : null;
  }, [pins.data, run]);

  const S: Site = {
    ...(Object.fromEntries(Object.entries(vals).map(([k, x]) => [k, +x || 0])) as Record<
      Num,
      number
    >),
    nas,
    dd: dd.map((x) => +x || 0),
    dm: dm.map((x) => +x || 0),
  };
  const city = form.md == "1",
    ci = +form.cs,
    hv = +form.hv;

  const go = (pv = form.pc.trim(), en = form.en.trim()) => {
    if (!pins.data) return;
    const PI = pinInfo(pins.data, pv);
    if (pv && !PI)
      return setStatus(`Pincode ${pv} is not in the dataset. Fix it or clear the field.`);
    if (!PI)
      return setStatus(
        "Enter a site pincode for a pincode-only analysis, or use the built-in example.",
      );
    setRun({ kind: "pin", pin: pv, name: en, nas });
    setNas(nas);
    setTab("site");
    setUi({ sel: 9 });
    setStatus(
      "Pincode-only analysis: site profile, hazards and costs come from measured data. History, impacts, media, policy and peers are part of the built-in example only.",
    );
  };
  const pickExample = (i: number) => {
    const [en, lc, pc] = EXAMPLES[i];
    setForm((f) => ({ ...f, en, lc, pc }));
    if (i == 0) {
      const d = demoValues();
      setRun({ kind: "demo" });
      setNas(1);
      setVals((v) => ({ ...v, ...str(sectorDefaults(1)), ...d.vals }));
      setProv(d.prov);
      setStatus("Showing the built-in example, grounded on pincode 462046.");
    } else go(pc, en);
  };

  const visible = TABS.filter(([id]) => id != "city" || city);
  const active = visible.some(([id]) => id == tab) ? tab : "site";
  const ids = visible.map(([id]) => id);
  const goTab = (next: EntTab) => {
    setDirection(ids.indexOf(next) >= ids.indexOf(active) ? 1 : -1);
    setTab(next);
  };

  const nearby = useMemo(
    () => (result?.A.pin ? nearCity(cities, districts?.list, result.A.pin) : null),
    [cities, districts, result],
  );

  let body: ReactNode;
  if (pins.isError)
    body = (
      <Card
        title="Could not load the pincode dataset"
        sub="Check your connection and reload the page."
      />
    );
  else if (!result) body = <Card title="Loading 19,550 Indian pincodes…" />;
  else {
    const o = calc(S, result.A, ci);
    const ctx: EntCtx = {
      ...result,
      S,
      ci,
      hv,
      o,
      hs: o[hv].hs,
      city,
      et: form.et,
      plan: plan(S, result.A, ci, hv, ui.rs, city),
      nearby,
      openCity: onOpenCity,
      goTab,
      ui,
      setUi,
    };
    const View = visible.find(([id]) => id == active)![2];
    body = (
      <>
        <Provenance prov={prov} S={S} />
        <Headline {...ctx} onPresent={() => (setUi({ slide: 0 }), goTab("slides"))} />
        <div className="sticky top-[92px] z-30 mt-8">
          <nav
            aria-label="Entity assessment sections"
            className="flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-midnight/95 p-1.5 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.9)] backdrop-blur-xl [scrollbar-width:none]"
          >
            {visible.map(([id, name]) => (
              <button
                key={id}
                type="button"
                onClick={() => goTab(id)}
                aria-current={id == active ? "page" : undefined}
                className={cn(
                  "relative shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
                  id == active ? "text-white" : "text-muted-foreground hover:text-white",
                )}
              >
                {id == active && (
                  <motion.span
                    layoutId="entity-tab"
                    className="absolute inset-0 rounded-xl bg-periwinkle shadow-[0_8px_30px_-8px_rgb(115_108_237/0.9)]"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">{name}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-8" style={{ perspective: 1800 }}>
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={active}
              custom={direction}
              variants={{
                enter: (d: number) => ({ opacity: 0, rotateY: 14 * d, x: 60 * d, z: -120 }),
                center: { opacity: 1, rotateY: 0, x: 0, z: 0 },
                exit: (d: number) => ({ opacity: 0, rotateY: -10 * d, x: -40 * d, z: -120 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "50% 0%" }}
            >
              <View {...ctx} />
            </motion.div>
          </AnimatePresence>
        </div>
      </>
    );
  }

  return (
    <div>
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {(
          [
            ["Enter", "One entity and its site pincode."],
            ["Analyse", "Pincode data sets the site profile and hazards."],
            ["Confirm", "Company owners verify every input tagged as an estimate."],
            ["Act", "Review risks and costs, then plan, disclose and present."],
          ] as const
        ).map(([t, d], i) => (
          <div key={t} className="glass rounded-3xl p-5">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-periwinkle/20 text-sm font-semibold text-lavender">
              {i + 1}
            </span>
            <p className="mt-3 font-semibold text-white">{t}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SelectField
            label="Advisory mode"
            value={form.md}
            onChange={(e) => setForm({ ...form, md: e.target.value })}
          >
            <option value="0">Listed company / entity</option>
            <option value="1">City / local body</option>
          </SelectField>
          <SelectField
            label="Entity type"
            value={form.et}
            onChange={(e) => setForm({ ...form, et: e.target.value })}
          >
            {ENTITY_TYPES.map(([k, n]) => (
              <option key={k} value={k}>
                {n}
              </option>
            ))}
          </SelectField>
          <InputField
            label="Name of entity or city"
            value={form.en}
            onChange={(e) => setForm({ ...form, en: e.target.value })}
          />
          <InputField
            label="Entity location (unit, city, state)"
            value={form.lc}
            onChange={(e) => setForm({ ...form, lc: e.target.value })}
          />
          <div>
            <InputField
              label="Site pincode"
              inputMode="numeric"
              maxLength={6}
              value={form.pc}
              onChange={(e) => setForm({ ...form, pc: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && go()}
            />
            <PinStatus
              pins={pins.data}
              value={form.pc}
              onUse={(p) => setForm((f) => ({ ...f, pc: String(p) }))}
            />
          </div>
          <SelectField
            label="Scenario case"
            value={form.cs}
            onChange={(e) => setForm({ ...form, cs: e.target.value })}
          >
            {CASES.map((c, i) => (
              <option key={c.n} value={i}>
                {c.n}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Horizon"
            value={form.hv}
            onChange={(e) => setForm({ ...form, hv: e.target.value })}
          >
            {HL.map((h, i) => (
              <option key={h} value={i}>
                {h}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="mt-4 grid grid-cols-1 items-end gap-4 border-t border-white/[0.06] pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <InputField
            label="Asset value at site (₹ crore)"
            type="number"
            min={0}
            value={vals.av}
            onChange={(e) => setVal("av", e.target.value)}
          />
          <InputField
            label="Company annual revenue (₹ crore)"
            type="number"
            min={0}
            value={vals.rv}
            onChange={(e) => setVal("rv", e.target.value)}
          />
          <InputField
            label="Scope 1+2 emissions (tCO2e/yr)"
            type="number"
            min={0}
            value={vals.em}
            onChange={(e) => setVal("em", e.target.value)}
          />
          <label className="block text-sm text-muted-foreground">
            <span className="flex items-baseline justify-between gap-3 text-xs font-semibold uppercase tracking-[0.14em]">
              Mitigation & adaptation adopted
              <b className="font-display text-lg normal-case tracking-normal text-white">
                {vals.ad}%
              </b>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={vals.ad}
              onChange={(e) => setVal("ad", e.target.value)}
              className="mt-3 w-full accent-periwinkle"
            />
          </label>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <PrimaryButton onClick={() => go()} disabled={!pins.data}>
            Analyse entity and location
          </PrimaryButton>
          {status && <p className="text-sm text-muted-foreground">{status}</p>}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Try:</span>
          {EXAMPLES.map(([en], i) => (
            <button
              key={en}
              type="button"
              disabled={!pins.data}
              onClick={() => pickExample(i)}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-semibold text-lavender transition-colors hover:border-periwinkle/50 hover:text-white disabled:opacity-50"
            >
              {CHIPS[i]}
            </button>
          ))}
        </div>
        {city && (
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            City mode: enter exposed municipal assets, annual municipal budget and city-wide
            emissions, then press Analyse to regenerate the profile for a city or ward.
          </p>
        )}

        <details className="group mt-5 border-t border-white/[0.06] pt-4">
          <summary className="cursor-pointer list-none text-xs font-semibold text-lavender transition-colors hover:text-white">
            <span className="mr-2 inline-block transition-transform group-open:rotate-90">›</span>
            Economic anchoring and disruption assumptions
          </summary>
          <p className="mt-3 max-w-4xl text-xs leading-relaxed text-muted-foreground">
            Chain: national GVA → sector → company → site → days of lost output. Defaults are
            indicative; replace them with MoSPI statements, ASI or RBI KLEMS ratios, company filings
            and your business-continuity plan. Verified anchors: provisional estimates for FY2025-26
            (2022-23 series) put nominal GDP at ₹346.36 lakh crore and nominal GVA at ₹314.87 lakh
            crore.
          </p>
          <div className="mt-4 grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SelectField
              label="National-accounts sector"
              value={nas}
              onChange={(e) => setNas(+e.target.value)}
            >
              {SECTORS.map((s, i) => (
                <option key={s[0]} value={i}>
                  {s[0]}
                </option>
              ))}
            </SelectField>
            {ASSUMPTIONS.map(([k, l, step]) => (
              <InputField
                key={k}
                label={l}
                type="number"
                step={step}
                min={0}
                value={vals[k]}
                onChange={(e) => setVal(k, e.target.value)}
              />
            ))}
          </div>
          <div className="mt-5">
            <Table
              minWidth={520}
              head={[
                "Hazard",
                "Days halted per event",
                "Property damage per event (% of asset value)",
              ]}
              rows={HZ.map((h, i) => [
                h,
                <NumCell
                  key="d"
                  label={`${h}: days halted`}
                  value={dd[i]}
                  onChange={(x) => (setDd(dd.map((y, j) => (j == i ? x : y))), userEntered("dd"))}
                />,
                <NumCell
                  key="m"
                  label={`${h}: property damage`}
                  step="0.5"
                  value={dm[i]}
                  onChange={(x) => (setDm(dm.map((y, j) => (j == i ? x : y))), userEntered("dd"))}
                />,
              ])}
            />
          </div>
        </details>
      </div>

      <div className="mt-6 space-y-5">{body}</div>

      <p className="mt-14 border-t border-white/[0.08] pt-6 text-center text-xs leading-relaxed text-muted-foreground">
        Screening and education use only. Not investment, legal or engineering advice. Financial
        figures use illustrative coefficients; asset, revenue and emissions values shown are
        placeholders until you enter your own. Emergency decisions should follow IMD, NDMA and local
        authorities.
      </p>
    </div>
  );
}

function NumCell({
  label,
  value,
  step = "1",
  onChange,
}: {
  label: string;
  value: string;
  step?: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="number"
      min={0}
      step={step}
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-28 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-white outline-none focus:border-periwinkle/60"
    />
  );
}

function PinStatus({
  pins,
  value,
  onUse,
}: {
  pins?: PinData;
  value: string;
  onUse: (p: number) => void;
}) {
  const v = value.replace(/\s/g, "");
  let msg: ReactNode;
  if (!pins) msg = "Loading the pincode dataset…";
  else if (!v) msg = "No pincode: enter one to analyse a site.";
  else {
    const P = pinInfo(pins, v);
    if (P)
      msg = `Found: ${P.name}, ${P.district}, ${P.state} · ${P.el} m · ${kmx(P.dc)} km to coast`;
    else if (!isPin(v)) msg = "Enter a 6-digit pincode.";
    else {
      const n = nearestPin(pins, +v);
      msg = (
        <>
          Pincode {v} is not in the dataset.{" "}
          {n && (
            <button
              type="button"
              onClick={() => onUse(n)}
              className="font-semibold text-lavender underline"
            >
              Use nearest, {n}
            </button>
          )}
        </>
      );
    }
  }
  return <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{msg}</p>;
}

function Provenance({ prov, S }: { prov: Record<ProvKey, Prov>; S: Site }) {
  const rows: [ProvKey, string, string][] = [
    ["rv", "Company annual revenue", `₹ ${fmt(S.rv, 0)} cr`],
    ["sit", "Site share of company revenue", `${fmt(S.sit, 0)}%`],
    ["av", "Site asset value", `₹ ${fmt(S.av, 0)} cr`],
    ["em", "Site Scope 1+2 emissions", `${fmt(S.em, 0)} tCO2e/yr`],
    ["vc", "Variable-cost share of revenue", fmt(S.vc, 2)],
    ["dd", "Disruption days and damage per event", "see assumptions"],
    ["cov", "Property insurance cover", `${fmt(S.cov, 0)}%`],
  ];
  const confirmed = (k: ProvKey) => /User|Public/.test(prov[k].src);
  const open = rows.filter((r) => !confirmed(r[0])).length;
  return (
    <details className="glass group rounded-3xl p-5 sm:p-7">
      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
        <span className="font-sans text-lg font-semibold text-white">
          <span className="mr-2 inline-block text-lavender transition-transform group-open:rotate-90">
            ›
          </span>
          Data provenance and who must confirm it
        </span>
        <Pill tone={open ? "warn" : "good"}>
          {open} of {rows.length} inputs are estimates, placeholders or assumptions
        </Pill>
      </summary>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        The company’s finance, sustainability, operations and risk owners should confirm each value
        from internal records before this assessment is relied on. Cross-check against the latest
        annual report and BRSR.
      </p>
      <div className="mt-5">
        <Table
          minWidth={900}
          head={["Input", "Value", "Source tag", "Basis", "Confidence", "Owner to confirm"]}
          rows={rows.map(([k, n, v]) => [
            n,
            v,
            <Pill key="s" tone={confirmed(k) ? "good" : "bad"}>
              {prov[k].src}
            </Pill>,
            prov[k].basis,
            prov[k].conf || "—",
            PROV_OWNERS[k],
          ])}
        />
      </div>
    </details>
  );
}

function Headline({ S, A, o, ci, onPresent }: EntCtx & { onPresent: () => void }) {
  const b = baseline(S, A),
    d = (x: number) => (b > 0 ? (x / b - 1) * 100 : 0);
  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi
          label="Baseline today"
          value={`₹ ${fmt(b, 2)} cr/yr`}
          sub="expected physical loss in the current climate"
        />
        {[0, 1, 2].map((h) => (
          <Kpi
            key={h}
            highlight={h == 1}
            label={HL[h].split(" (")[0]}
            value={`₹ ${fmt(o[h].phys, 2)} cr/yr`}
            sub={`${d(o[h].phys) >= 0 ? "+" : ""}${fmt(d(o[h].phys), 0)}% vs baseline · with transition ₹ ${fmt(o[h].tot, 1)} cr`}
          />
        ))}
      </div>
      <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-3xl p-5 sm:px-7">
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          <b className="text-white">Why this assessment.</b> It turns location, sector and company
          size into rupee exposure and an action plan. The baseline is what today’s climate already
          costs; each horizon shows how that grows under {CASES[ci].n}.
        </p>
        <GhostButton onClick={onPresent}>Open presentation</GhostButton>
      </div>
    </>
  );
}

/** Nearest city profile within 60 km, else the site's own district, else the nearest district within 150 km. */
function nearCity(cities: City[], districts: City[] | undefined, P: PinInfo) {
  const { lat, lon } = P;
  const dk = (c: City) =>
    Math.hypot((c.lat - lat) * 111, (c.lon - lon) * 111 * Math.cos((lat * Math.PI) / 180));
  let best: { c: City; d: number } | null = null;
  for (const c of cities) {
    const d = dk(c);
    if (d < 60 && (!best || d < best.d)) best = { c, d };
  }
  if (best) return best;
  if (!districts) return undefined;
  const m = districts.find(
    (c) =>
      c.district!.dname.toLowerCase() === String(P.district || "").toLowerCase() &&
      c.region === P.state,
  );
  if (m) return { c: m, d: dk(m) };
  for (const c of districts) {
    const d = dk(c);
    if (!best || d < best.d) best = { c, d };
  }
  return best && best.d < 150 ? best : null;
}
