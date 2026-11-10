import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Callout, GhostButton, InputField, Kpi, SelectField } from "@/components/observatory/ui";
import { cn } from "@/lib/utils";
import { fmt } from "../format";
import type { CityCtx, CityUi } from "./context";
import { COUNTRIES, HAZARDS, HORIZONS, SSP_NAMES } from "./data/content";
import {
  buildCities,
  dens,
  econ,
  findDistrict,
  loadDistricts,
  makeMoney,
  nowcast,
  rawInputs,
  ranked,
  readInputs,
  scen,
  vulnShare,
  type City,
  type Currency,
  type RawInputs,
} from "./model";
import { ClearanceTab, EconomyTab, PlansTab, SystemsTab } from "./tabs-economy";
import { HazardsTab, PeopleTab, ProfileTab } from "./tabs-profile";
import { CompareTab, ResilienceTab, SourcesTab } from "./tabs-resilience";
import { FarmingTab } from "./tab-farming";
import { DistrictsTab } from "./tab-districts";

export const CITY_TABS = [
  ["profile", "City profile"],
  ["people", "People at risk"],
  ["hazards", "Hazards & hotspots"],
  ["economy", "Economic impact"],
  ["farming", "Farming, nature & economy"],
  ["systems", "City systems"],
  ["plans", "Plans & potential"],
  ["clearance", "Environmental clearance"],
  ["resilience", "Resilience & actions"],
  ["compare", "Compare cities"],
  ["districts", "All-India districts"],
  ["sources", "Sources & method"],
] as const;
export type CityTab = (typeof CITY_TABS)[number][0];
export const CITY_TAB_IDS = CITY_TABS.map(([id]) => id) as readonly string[];

const VIEWS: Record<CityTab, (ctx: CityCtx) => ReactNode> = {
  profile: ProfileTab,
  people: PeopleTab,
  hazards: HazardsTab,
  economy: EconomyTab,
  farming: FarmingTab,
  systems: SystemsTab,
  plans: PlansTab,
  clearance: ClearanceTab,
  resilience: ResilienceTab,
  compare: CompareTab,
  districts: DistrictsTab,
  sources: SourcesTab,
};

const INPUT_FIELDS: [keyof RawInputs, string, number][] = [
  ["pop", "Population (million)", 0.1],
  ["gdp", "GDP (US$ billion per year)", 1],
  ["slum", "Informal settlement share (%)", 1],
  ["a65", "Aged 65+ (%)", 1],
  ["a14", "Aged 0–14 (%)", 1],
  ["inf", "Informal workforce (%)", 1],
  ["fx", "Local currency per US$", 0.1],
];

export function CitiesModule({
  cityId,
  tab,
  onSelect,
}: {
  cityId: string;
  tab: CityTab;
  onSelect: (next: { city?: string; tab?: CityTab }) => void;
}) {
  const [now] = useState(() => Date.now());
  const cities = useMemo(() => buildCities(now), [now]);
  const districts = useQuery({
    queryKey: ["platform", "districts", now],
    queryFn: () => loadDistricts(now),
    staleTime: Infinity,
  }).data;

  const c: City | undefined =
    cities.find((x) => x.id === cityId) ?? districts?.list.find((x) => x.id === cityId);

  const [si, setSi] = useState(1);
  const [hi, setHi] = useState(1);
  const [cur, setCur] = useState<Currency>("L");
  const [edits, setEdits] = useState<{ id: string; raw: RawInputs } | null>(null);
  const [ui, setUiState] = useState<CityUi>({
    essentials: Array(10).fill(2),
    mapMetric: "eal",
    mapState: "",
  });
  const [stateSel, setStateSel] = useState("");
  const [direction, setDirection] = useState(1);
  const snapRef = useRef<HTMLDivElement>(null);

  // Keep the State selector on the selected district's state.
  const districtState =
    c?.district && districts ? String(districts.states.indexOf(c.region)) : null;
  useEffect(() => {
    if (districtState != null) setStateSel(districtState);
  }, [districtState]);

  useEffect(() => {
    try {
      localStorage.setItem("cra_city", cityId);
    } catch {
      // Storage can be unavailable (private mode); the selection still lives in the URL.
    }
  }, [cityId]);

  const goTab = (next: CityTab) => {
    setDirection(CITY_TAB_IDS.indexOf(next) >= CITY_TAB_IDS.indexOf(tab) ? 1 : -1);
    onSelect({ tab: next });
  };
  const pick = (id: string, nextTab?: CityTab) => {
    if (nextTab) setDirection(CITY_TAB_IDS.indexOf(nextTab) >= CITY_TAB_IDS.indexOf(tab) ? 1 : -1);
    onSelect({ city: id, tab: nextTab });
    if (nextTab) snapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!c)
    return (
      <div className="glass mt-10 rounded-3xl p-10 text-center text-sm text-muted-foreground">
        {districts ? "That city or district was not found." : "Loading India’s districts…"}
      </div>
    );

  const raw = edits?.id === c.id ? edits.raw : rawInputs(c);
  const setField = (k: keyof RawInputs, v: string) =>
    setEdits({ id: c.id, raw: { ...raw, [k]: v } });
  const fx = parseFloat(raw.fx) || 0;
  const I = readInputs(c, raw);
  const hs = scen(c, si, hi);
  const money = makeMoney(c, cur, fx);
  const inr = makeMoney({ country: "IN" }, cur, c.country === "IN" ? fx : 0);
  const ctx: CityCtx = {
    c,
    I,
    hs,
    si,
    hi,
    money,
    inr,
    now,
    cities,
    districts,
    ui,
    setUi: (patch) => setUiState((u) => ({ ...u, ...patch })),
    pick: (id) => pick(id, tab === "farming" ? undefined : "profile"),
  };

  const stateIdx = stateSel;
  const stateDistricts =
    stateIdx === "" || !districts
      ? []
      : districts.list.filter((d) => d.region === districts.states[+stateIdx]);
  const View = VIEWS[tab];

  return (
    <div>
      <div className="glass rounded-3xl p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SelectField
            label="City"
            value={c.district ? "" : c.id}
            onChange={(e) => e.target.value && pick(e.target.value)}
          >
            <option value="">Choose a city</option>
            {(["IN", "NP", "LK"] as const).map((cc) => (
              <optgroup key={cc} label={COUNTRIES[cc].n}>
                {cities
                  .filter((x) => x.country === cc)
                  .map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </SelectField>
          <SelectField
            label="State or UT"
            value={stateIdx}
            disabled={!districts}
            onChange={(e) => setStateSel(e.target.value)}
          >
            <option value="">{districts ? "Choose a state or UT" : "Loading districts…"}</option>
            {districts?.states.map((n, i) => (
              <option key={n} value={i}>
                {n}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="District"
            value={stateDistricts.some((d) => d.id === c.id) ? c.id : ""}
            disabled={!stateDistricts.length}
            onChange={(e) => e.target.value && pick(e.target.value)}
          >
            <option value="">
              {stateIdx === ""
                ? "Choose a state first"
                : `Choose a district (${stateDistricts.length})`}
            </option>
            {stateDistricts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.district!.dname}
              </option>
            ))}
          </SelectField>
          <FindDistrict districts={districts?.list} onPick={(id) => pick(id)} />
          <SelectField label="Scenario" value={si} onChange={(e) => setSi(Number(e.target.value))}>
            <option value={0}>SSP1-2.6 · low emissions</option>
            <option value={1}>SSP2-4.5 · intermediate</option>
            <option value={2}>SSP5-8.5 · very high emissions</option>
          </SelectField>
          <SelectField label="Horizon" value={hi} onChange={(e) => setHi(Number(e.target.value))}>
            <option value={0}>Near term (≈2030)</option>
            <option value={1}>Mid century (≈2050)</option>
            <option value={2}>End of century (≈2090)</option>
          </SelectField>
          <SelectField
            label="Currency"
            value={cur}
            onChange={(e) => setCur(e.target.value as Currency)}
          >
            <option value="L">Local currency</option>
            <option value="U">US dollars</option>
          </SelectField>
        </div>
        <details className="group mt-5 border-t border-white/[0.06] pt-4">
          <summary className="cursor-pointer list-none text-xs font-semibold text-lavender transition-colors hover:text-white">
            <span className="mr-2 inline-block transition-transform group-open:rotate-90">›</span>
            Edit key inputs for this {c.district ? "district" : "city"} (population, GDP,
            vulnerability, exchange rate)
          </summary>
          <div className="mt-4 grid grid-cols-2 items-end gap-4 md:grid-cols-4">
            {INPUT_FIELDS.map(([k, l, s]) => (
              <InputField
                key={k}
                label={l}
                type="number"
                step={s}
                value={raw[k]}
                onChange={(e) => setField(k, e.target.value)}
              />
            ))}
            <GhostButton onClick={() => setEdits(null)}>Reset to profile values</GhostButton>
          </div>
        </details>
      </div>

      <div ref={snapRef} className="scroll-mt-44">
        <Snapshot c={c} I={I} hs={hs} si={si} hi={hi} money={money} now={now} />
      </div>

      <div className="sticky top-[92px] z-30 mt-8">
        <nav
          aria-label="City assessment sections"
          className="flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-midnight/95 p-1.5 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.9)] backdrop-blur-xl [scrollbar-width:none]"
        >
          {CITY_TABS.map(([id, name]) => {
            const active = id === tab;
            return (
              <button
                key={id}
                type="button"
                onClick={() => goTab(id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
                  active ? "text-white" : "text-muted-foreground hover:text-white",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="city-tab"
                    className="absolute inset-0 rounded-xl bg-periwinkle shadow-[0_8px_30px_-8px_rgb(115_108_237/0.9)]"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">{name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-8" style={{ perspective: 1800 }}>
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={tab}
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
            <View key={c.id} {...ctx} />
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="mt-14 border-t border-white/[0.08] pt-6 text-center text-xs leading-relaxed text-muted-foreground">
        Screening and planning support only. Not engineering, legal or investment advice.
        Environmental-clearance thresholds change; check the current notification with the
        regulator. Emergency decisions should follow IMD, NDMA, Nepal DHM and NDRRMA, Sri Lanka DMC
        and local authorities.
      </p>
    </div>
  );
}

function FindDistrict({ districts, onPick }: { districts?: City[]; onPick: (id: string) => void }) {
  const [text, setText] = useState("");
  const options = useMemo(
    () =>
      districts
        ? [
            ...districts.map((d) => ({ v: `${d.district!.dname}, ${d.region}`, l: "" })),
            ...districts.flatMap((d) =>
              d
                .district!.aka.filter((a) => !d.district!.dname.includes(a))
                .map((a) => ({ v: `${a}, ${d.region}`, l: `in ${d.district!.dname}` })),
            ),
          ]
        : [],
    [districts],
  );
  const commit = (v: string) => {
    const d = districts && findDistrict(districts, v);
    if (d) {
      onPick(d.id);
      setText("");
    }
  };
  return (
    <>
      <InputField
        label="Find a district"
        list="platform-districts"
        placeholder={districts ? "Type a district name" : "Loading districts…"}
        autoComplete="off"
        disabled={!districts}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (options.some((o) => o.v === e.target.value)) commit(e.target.value);
        }}
        onKeyDown={(e) => e.key === "Enter" && commit(text)}
      />
      <datalist id="platform-districts">
        {options.map((o) => (
          <option key={o.v + o.l} value={o.v}>
            {o.l}
          </option>
        ))}
      </datalist>
    </>
  );
}

function Snapshot({
  c,
  I,
  hs,
  si,
  hi,
  money,
  now,
}: Pick<CityCtx, "c" | "I" | "hs" | "si" | "hi" | "money" | "now">) {
  const E = econ(c, hs, I),
    V = vulnShare(I),
    hot = hs.filter((x) => x >= 3.5).length,
    top = ranked(hs).slice(0, 3);
  const live = !!c.nc && Math.abs(I.pop - c.popM) <= 0.005;
  return (
    <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
      <Kpi
        label="People today"
        value={live ? <LiveCount c={c} /> : `${fmt(I.pop, 1)} million`}
        sub={
          c.nc
            ? `Live nowcast from the last census · core density ${fmt(dens(c, I, now), 0)} per km²`
            : `${fmt((I.pop * 1e6) / (c.area || 1), 0)} per km²`
        }
      />
      <Kpi
        label="Highly vulnerable people"
        value={`${fmt(I.pop * V, 1)} million`}
        sub={`${fmt(V * 100, 0)}%: informal settlements, elderly, children, informal workers`}
      />
      <Kpi
        label="Economy"
        value={money(I.gdp, 0)}
        sub={`per year · ${c.conf} confidence profile`}
      />
      <Kpi
        label={`Hotspots ${SSP_NAMES[si]} ${HORIZONS[hi]}`}
        value={`${hot} of 8`}
        sub={top.map((i) => HAZARDS[i]).join(", ")}
      />
      <Kpi
        highlight
        label="Expected annual climate loss"
        value={money(E.tot, 0)}
        sub={`${fmt(E.pct, 2)}% ${c.district ? "of district GDP" : "of city GDP"}`}
      />
    </div>
  );
}

/** Population nowcast that ticks every second. */
function LiveCount({ c }: { c: City }) {
  const [t, setT] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setT(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const k = nowcast(c, t);
  return (
    <span className="tabular-nums">{k ? Math.round(k.pop * 1e6).toLocaleString("en-IN") : ""}</span>
  );
}
