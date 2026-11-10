import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, type ReactNode } from "react";
import { GhostButton, Kpi, Pill } from "@/components/observatory/ui";
import { cn } from "@/lib/utils";
import { fmt } from "../format";
import { Bullets, Card, Table } from "../ui";
import type { EntCtx } from "./context";
import { CASES, ENTITY_TYPES, FRAMEWORKS, HL, HZ, REGULATION } from "./data";
import { baseline, calc, evl, footprint, ranked, siteRevenue } from "./model";
import { CostBars, HazardIcon, HowToRead } from "./ui";

const OK = <Pill tone="good">Draft from dashboard</Pill>,
  INPUT = <Pill tone="bad">Company input needed</Pill>,
  GAP = <Pill tone="bad">Data gap</Pill>;

function Pillar({ title, refs }: { title: string; refs: string }) {
  return (
    <div className="mb-3 mt-8 first:mt-0">
      <h4 className="font-sans text-base font-semibold text-white">{title}</h4>
      <p className="mt-0.5 text-xs text-muted-foreground">{refs}</p>
    </div>
  );
}

function ListOrNote({ items }: { items?: string[] }) {
  return items?.length ? (
    <Bullets items={items} />
  ) : (
    <p className="text-sm text-muted-foreground">Not available for a pincode-only analysis.</p>
  );
}

export function ReportTab({ S, A, B, ci, plan: L, ui, et }: EntCtx) {
  const E = S.em,
    cases = [0, 1, 2].map((c) => calc(S, A, c)),
    o = cases[ci],
    sr = siteRevenue(S);
  const rg = (h: number) => {
    const v = cases.map((c) => c[h].tot);
    return fmt(Math.min(...v)) + "–" + fmt(Math.max(...v));
  };
  const top = (h: number) =>
    ranked(o[h].hs)
      .slice(0, 2)
      .map((i) => `${HZ[i]} (${o[h].hs[i].toFixed(1)})`)
      .join(", ");
  const worst = Math.max(...HZ.map((_, i) => evl(S, i, o[1].hs[i]).tot)),
    eal0 = o[1].phys,
    sc = L.A4.reduce((a, x) => a + x.sv, 0),
    ac = L.A4.reduce((a, x) => a + x.cap, 0),
    pc = (x: number) => (sr > 0 ? fmt((x / sr) * 100, 2) + "%" : "n/a");
  const r = REGULATION[et];
  return (
    <div className="space-y-5">
      <Card
        title={`TCFD / IFRS S2 disclosure draft · ${A.entity.name}, ${A.geo.place}`}
        sub="Structured on the four TCFD pillars and IFRS S2 (paragraph references are indicative; verify against the standard). Content is generated from this dashboard; items marked as company input must come from the organisation. Screening-level numbers are not assured and are not for filing."
      >
        <Pillar title="Governance" refs="TCFD Governance (a, b) · IFRS S2 para 6" />
        <Table
          head={["Disclosure", "Draft content", "Status"]}
          rows={[
            [
              "Board oversight of climate risks and opportunities",
              `Describe the committee, mandate, meeting frequency, skills and how scenario results reach the board. Self-assessed maturity: ${ui.rs[0]}/4.`,
              INPUT,
            ],
            [
              "Management role",
              "Roles, reporting lines, incentives and ownership of the resilience index and targets below.",
              INPUT,
            ],
          ]}
        />
        <Pillar title="Strategy" refs="TCFD Strategy (a, b, c) · IFRS S2 paras 8–22" />
        <Table
          minWidth={760}
          num={[2, 3, 4]}
          head={[
            "Horizon",
            "Leading physical hazards",
            "Physical cost ₹ cr/yr",
            "Transition cost ₹ cr/yr",
            "Total ₹ cr/yr (range across 3 scenarios)",
          ]}
          rows={[0, 1, 2].map((h) => [
            HL[h],
            top(h),
            fmt(o[h].phys),
            fmt(o[h].tr),
            <span key="t">
              <b className="text-white">{fmt(o[h].tot)}</b> ({rg(h)})
            </span>,
          ])}
        />
        <div className="my-5 grid gap-4 md:grid-cols-3">
          {(
            [
              ["Physical risks", B?.risks.phys],
              ["Transition risks", B?.risks.trans],
              ["Opportunities", B?.opps],
            ] as const
          ).map(([t, items]) => (
            <div key={t} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
              <p className="mb-3 text-sm font-semibold text-white">{t}</p>
              <ListOrNote items={items as string[] | undefined} />
            </div>
          ))}
        </div>
        <Table
          num={[1, 2]}
          head={[
            `Financial effect (medium term, ${CASES[ci].n.split(" (")[0]})`,
            "Value",
            "Share of site revenue",
          ]}
          rows={[
            [
              "Expected annual physical loss (damage, lost output, penalties)",
              `₹ ${fmt(eal0)} cr`,
              pc(eal0),
            ],
            ["Worst single physical event", `₹ ${fmt(worst)} cr`, pc(worst)],
            ["Carbon cost net of pass-through", `₹ ${fmt(o[1].carbon)} cr`, pc(o[1].carbon)],
            [
              "Market and technology shift cost",
              `₹ ${fmt(o[1].tr - o[1].carbon)} cr`,
              pc(o[1].tr - o[1].carbon),
            ],
            ["Site GVA at stake per halted day", `₹ ${fmt(footprint(S).gd, 2)} cr`, "—"],
          ]}
        />
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Resilience (IFRS S2 para 22): the three scenarios bracket outcomes from orderly to
          hot-house. Adopting the adaptation programme avoids about ₹ {fmt(sc)} cr/yr of expected
          loss for ₹ {fmt(ac)} cr capex, leaving roughly ₹ {fmt(Math.max(0, eal0 - sc))} cr/yr. Key
          assumptions: disruption days, damage ratios, variable-cost share and event probabilities
          in the assumptions panel.
        </p>
        <Pillar
          title="Risk management"
          refs="TCFD Risk management (a, b, c) · IFRS S2 paras 24–26"
        />
        <Table
          head={["Process step", "Draft content", "Status"]}
          rows={[
            [
              "Identification",
              "Seven hazards screened by location and scenario-adjusted to three horizons, plus four transition categories.",
              OK,
            ],
            [
              "Assessment",
              "Probability from hazard score; impact from the event stress test (lost contribution, penalties, property, GVA).",
              OK,
            ],
            ["Prioritisation", "Measures ranked by cost per tCO2e and by benefit-cost ratio.", OK],
            [
              "Integration into enterprise risk management",
              "Link to the risk register, owners and review cycle.",
              INPUT,
            ],
            [
              "Monitoring",
              "Indicators, thresholds and escalation (heat days, rainfall alerts, carbon price).",
              INPUT,
            ],
          ]}
        />
        <Pillar
          title="Metrics and targets"
          refs="TCFD Metrics & targets (a, b, c) · IFRS S2 paras 27–37"
        />
        <Table
          head={["Metric", "Draft value", "Status"]}
          rows={[
            ["Scope 1 + 2 emissions", `${fmt(E, 0)} tCO2e/yr (entered)`, E > 0 ? OK : INPUT],
            ["Scope 3 emissions", "Not modelled", GAP],
            [
              "Transition risk amount",
              `₹ ${fmt(o[1].tr)} cr/yr (${pc(o[1].tr)} of site revenue)`,
              OK,
            ],
            [
              "Physical risk amount",
              `Expected ₹ ${fmt(eal0)} cr/yr; site assets ₹ ${fmt(S.av, 0)} cr`,
              OK,
            ],
            ["Capital deployment", `Mitigation ₹ ${fmt(L.tc)} cr; adaptation ₹ ${fmt(ac)} cr`, OK],
            [
              "Internal carbon price",
              `₹ ${fmt(L.price, 0)}/t scenario shadow price; set the organisation’s own`,
              INPUT,
            ],
            ["Remuneration linkage", "Share of pay linked to climate KPIs", INPUT],
            [
              "Proposed targets",
              `Abate ${fmt(L.tt, 0)} tCO2e/yr${E > 0 ? ` (${fmt((L.tt / E) * 100, 0)}%)` : ""}; cut expected annual physical loss by about ${eal0 > 0 ? fmt(Math.min(100, (sc / eal0) * 100), 0) : "0"}%; raise resilience index from ${L.ix.toFixed(0)} to 80 or more`,
              OK,
            ],
          ]}
        />
      </Card>
      <Card
        title={`Regulatory requirements and expectations · ${ENTITY_TYPES.find((x) => x[0] === et)?.[1]}`}
        sub={`${r.who}. Status as of late 2026; thresholds and dates change, so check the regulator’s latest circular.`}
        how={A.pin ? undefined : "Add a site pincode to tie these requirements to a location."}
      >
        <Table
          head={["Requirement", "What it means"]}
          rows={r.must.map((x) => [<b key="r">{x[0]}</b>, x[1]])}
        />
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold text-white">
              What investors, lenders and customers expect
            </p>
            <Bullets items={r.expect} />
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-white">Finance and support to use</p>
            <Bullets items={r.fin} />
          </div>
        </div>
      </Card>
      <Card
        title="Frameworks used by leading banks and institutions, and how this model maps to them"
        sub="Coverage describes this prototype honestly. Confirm current versions and scope of each framework before relying on it."
      >
        <Table
          minWidth={760}
          head={["Framework", "Used by", "What it asks", "Coverage here"]}
          rows={FRAMEWORKS}
        />
      </Card>
      <HowToRead i={7} />
    </div>
  );
}

const SLIDES = 9;

export function PresentationTab({ S, A, ci, plan: L, ui, setUi }: EntCtx) {
  const [dir, setDir] = useState(1);
  const o = calc(S, A, ci),
    sr = siteRevenue(S),
    hs = o[1].hs,
    b = baseline(S, A);
  const ord = ranked(hs).slice(0, 3),
    evs = HZ.map((n, i) => ({ n, e: evl(S, i, hs[i]) }))
      .sort((x, y) => y.e.tot - x.e.tot)
      .slice(0, 3);
  const slide = Math.min(SLIDES - 1, Math.max(0, ui.slide));
  const go = (n: number) => {
    setDir(n >= slide ? 1 : -1);
    setUi({ slide: Math.min(SLIDES - 1, Math.max(0, n)) });
  };
  const S3 = (children: ReactNode) => <div className="grid gap-4 md:grid-cols-3">{children}</div>;
  const slides: [string, ReactNode][] = [
    [
      `${A.entity.name} · ${A.geo.place}`,
      <>
        <p className="mb-6 text-muted-foreground">
          Climate risk and resilience assessment · {CASES[ci].n}
        </p>
        {S3(
          <>
            <Kpi
              highlight
              label="Medium-term annual cost"
              value={`₹ ${fmt(o[1].tot)} cr`}
              sub={`${fmt(sr > 0 ? (o[1].tot / sr) * 100 : 0, 2)}% of site revenue`}
            />
            <Kpi
              label="Baseline today"
              value={`₹ ${fmt(b, 2)} cr/yr`}
              sub="expected physical loss now"
            />
            <Kpi label="Resilience index" value={`${L.ix.toFixed(0)}/100`} sub="self-assessed" />
          </>,
        )}
        <p className="mt-6 text-xs text-muted-foreground">
          Screening-level assessment; figures are illustrative until calibrated with company data.
        </p>
      </>,
    ],
    [
      "Why we are doing this, and how",
      <Bullets
        key="b"
        className="text-base"
        items={[
          "Climate shocks and policy shifts change what a site is worth and what it costs to run",
          "We locate the site, score seven hazards and price them against the site’s share of company and national output",
          "We compare today’s baseline with three scenarios and three horizons",
          "We cost the actions (mitigation and adaptation) and turn them into a plan that supports TCFD and IFRS S2 disclosure",
        ]}
      />,
    ],
    [
      "Where the site sits and its hotspots",
      <>
        <p className="mb-6 text-muted-foreground">
          {A.geo.elev} · {A.geo.coast} · {A.geo.climate}
        </p>
        {S3(
          ord.map((i) => (
            <div key={i} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
              <HazardIcon i={i} size={36} />
              <p className="mt-3 font-semibold text-white">{HZ[i]}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                score {hs[i].toFixed(1)} medium term
              </p>
            </div>
          )),
        )}
      </>,
    ],
    [
      "Today versus the future",
      <>
        <CostBars
          label="Annual cost today and at each horizon"
          bars={[
            { name: "Today", phys: b, tr: 0 },
            ...[0, 1, 2].map((h) => ({ name: HL[h].split(" (")[0], phys: o[h].phys, tr: o[h].tr })),
          ]}
        />
        <p className="mt-3 text-xs text-muted-foreground">
          Physical and transition cost in ₹ crore per year. The first bar is today’s physical
          baseline; the gap to later bars is the extra cost from climate change and policy.
        </p>
      </>,
    ],
    [
      "What a halted site costs",
      <Bullets
        key="b"
        className="text-base"
        items={evs.map(
          (x) =>
            `${x.n}: ${fmt(x.e.d, 0)} days halted costs about ₹ ${fmt(x.e.tot, 1)} cr to the company; ₹ ${fmt(x.e.gva, 1)} cr of GVA is not produced`,
        )}
      />,
    ],
    [
      "Cost of action",
      S3(
        <>
          <Kpi
            label="Mitigation programme"
            value={`₹ ${fmt(L.tc)} cr`}
            sub={`abates ${fmt(L.tt, 0)} tCO2e/yr`}
          />
          <Kpi
            label="Adaptation programme"
            value={`₹ ${fmt(L.A4.reduce((a, x) => a + x.cap, 0))} cr`}
            sub={`avoids ₹ ${fmt(L.A4.reduce((a, x) => a + x.sv, 0))} cr/yr`}
          />
          <Kpi
            label="Cheapest measure"
            value={L.M[0].n}
            sub={`₹ ${fmt(L.M[0].mac, 0)} per tCO2e`}
          />
        </>,
      ),
    ],
    [
      "Resilience and capacity building",
      <Bullets
        key="b"
        className="text-base"
        items={["Weakest areas: " + L.low.join(", ")].concat(
          L.cb
            .filter((c) => ui.rs[c[3]] <= 1)
            .slice(0, 3)
            .map((c) => `Train ${c[0]}: ${c[1]}`),
        )}
      />,
    ],
    [
      "Decisions and expected outcomes",
      S3(
        (
          [
            ["0–12 months", L.now],
            ["1–3 years", L.nxt.length ? L.nxt : ["Refine inputs"]],
            ["3–7 years", L.lat],
          ] as const
        ).map(([t, items]) => (
          <div key={t} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
            <p className="mb-3 font-semibold text-white">{t}</p>
            <Bullets items={items as string[]} />
          </div>
        )),
      ),
    ],
    [
      "Disclosure readiness and limits",
      <Bullets
        key="b"
        className="text-base"
        items={[
          "Governance and risk-management integration need company input",
          "Strategy, scenarios and financial effects have a draft from this dashboard",
          "Scope 1+2 is entered; Scope 3 is not modelled",
          "Numbers are screening-level and not assured",
        ]}
      />,
    ],
  ];
  const [title, body] = slides[slide];
  return (
    <div className="space-y-5">
      <div style={{ perspective: 1600 }}>
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.section
            key={slide}
            custom={dir}
            variants={{
              enter: (d: number) => ({ opacity: 0, rotateY: 35 * d, z: -200 }),
              center: { opacity: 1, rotateY: 0, z: 0 },
              exit: (d: number) => ({ opacity: 0, rotateY: -35 * d, z: -200 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            aria-roledescription="slide"
            aria-label={`Slide ${slide + 1} of ${SLIDES}`}
            className="glass glow-border relative min-h-[420px] overflow-hidden rounded-3xl p-6 sm:p-10"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-cosmic/70 blur-3xl"
            />
            <p className="relative text-[10px] font-semibold uppercase tracking-[0.2em] text-lavender">
              Slide {slide + 1} of {SLIDES}
            </p>
            <h3 className="relative mb-6 mt-3 text-balance font-display text-3xl leading-tight text-white sm:text-4xl">
              {title}
            </h3>
            <div className="relative">{body}</div>
          </motion.section>
        </AnimatePresence>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <GhostButton onClick={() => go(slide - 1)} disabled={slide == 0}>
          <ChevronLeft className="h-4 w-4" /> Previous
        </GhostButton>
        <div
          className="order-last flex w-full justify-center gap-2 sm:order-none sm:w-auto"
          role="tablist"
          aria-label="Slides"
        >
          {slides.map((s, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i == slide}
              aria-label={`Slide ${i + 1}: ${s[0]}`}
              onClick={() => go(i)}
              className={cn(
                "h-2.5 rounded-full transition-all",
                i == slide ? "w-8 bg-periwinkle" : "w-2.5 bg-white/20 hover:bg-white/40",
              )}
            />
          ))}
        </div>
        <GhostButton onClick={() => go(slide + 1)} disabled={slide == SLIDES - 1}>
          Next <ChevronRight className="h-4 w-4" />
        </GhostButton>
      </div>
      <HowToRead i={8} />
    </div>
  );
}
