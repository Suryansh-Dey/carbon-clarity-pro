import { motion } from "motion/react";
import { useState } from "react";
import {
  ECONOMIC_SURVEY_URL,
  GVA_TOTAL,
  HORIZON_OPTIONS,
  SSP_OPTIONS,
  crore,
  type FinanceInputs,
} from "./data";
import { downloadJson, useFinance } from "./logic";
import { Callout, DataTable, ExtLink, InputField, Kpi, Panel, PrimaryButton, TabIntro } from "./ui";

const FIELDS: { key: keyof FinanceInputs; label: string; max: number }[] = [
  { key: "exposure", label: "Exposed output share (%)", max: 100 },
  { key: "days", label: "Disruption duration (days)", max: 365 },
  { key: "damage", label: "Productivity reduction (%)", max: 100 },
  { key: "adaptation", label: "Adaptation loss reduction (%)", max: 100 },
];

const num = (v: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(v);

export function FinanceTab({
  raw,
  setRaw,
  ssp,
  horizon,
}: {
  raw: Record<keyof FinanceInputs, string>;
  setRaw: (r: Record<keyof FinanceInputs, string>) => void;
  ssp: number;
  horizon: number;
}) {
  const { assessment: m, low, high, error } = useFinance(raw, ssp, horizon);
  const [hover, setHover] = useState<number | null>(null);
  const max = m ? Math.max(...m.rows.map((r) => r.residual), 1) : 1;

  return (
    <div className="space-y-6">
      <TabIntro
        eyebrow="India · Economic Survey 2025–26 baseline"
        title="Put a financial value on disruption."
        text="An auditable conditional stress test of annual economic output, using official nominal GVA and editable event assumptions. This estimates foregone output; it does not estimate physical asset damage, insured loss or fatalities."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi
          highlight
          label="Baseline India GVA · FY2025–26"
          value="₹323.48 lakh crore"
          sub="1st advance estimate · current prices"
        />
        <Kpi
          label="Assumed exposed annual output"
          value={m ? crore(m.exposed) : "Invalid inputs"}
          sub="GVA × selected exposure share"
        />
        <Kpi
          label="Gross output disruption"
          value={m ? crore(m.gross) : "Invalid inputs"}
          sub="Conditional event estimate"
        />
        <Kpi
          label="Residual output disruption"
          value={m ? crore(m.residual) : "Invalid inputs"}
          sub="After assumed adaptation"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.3fr]">
        <Panel
          title="Event stress assumptions"
          subtitle={`${SSP_OPTIONS[ssp]} · ${HORIZON_OPTIONS[horizon]} · context only`}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <InputField
                key={f.key}
                label={f.label}
                type="number"
                min={0}
                max={f.max}
                step="any"
                value={raw[f.key]}
                onChange={(e) => setRaw({ ...raw, [f.key]: e.target.value })}
                aria-invalid={!!error}
              />
            ))}
          </div>
          {error && (
            <p role="alert" className="mt-3 text-sm font-medium text-rose-300">
              {error}
            </p>
          )}
          <Callout className="mt-5 text-xs">
            <b>Assumptions, not hazard estimates:</b> default inputs (10%, 7 days, 30%, 0%) are an
            illustrative nationwide stress test. Official warning severity does not set these
            inputs. SSP and horizon selections are retained as assessment context; no calibrated
            local SSP-to-loss function is available.
          </Callout>
          <PrimaryButton
            className="mt-5"
            disabled={!m}
            onClick={() =>
              m &&
              downloadJson("india-financial-stress-assessment.json", {
                exportedAt: new Date().toISOString(),
                assessment: m,
              })
            }
          >
            ↓ Export financial assessment
          </PrimaryButton>
        </Panel>

        <Panel title="Sector contribution to disruption">
          <div className="mt-3 space-y-4">
            {m?.rows.map((r, i) => (
              <div
                key={r.name}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                className="group"
              >
                <div className="flex items-baseline justify-between gap-4 text-sm">
                  <span className={hover === i ? "text-white" : "text-white/80"}>{r.name}</span>
                  <b className="shrink-0 font-mono text-xs text-lavender">{crore(r.residual)}</b>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/[0.05]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-cosmic via-periwinkle to-lavender"
                    initial={{ width: 0 }}
                    animate={{ width: `${(r.residual / max) * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      boxShadow: hover === i ? "0 0 18px rgb(159 162 232 / 0.8)" : undefined,
                    }}
                  />
                </div>
              </div>
            ))}
            {!m && (
              <p className="text-sm text-muted-foreground">
                Correct the inputs to view sector results.
              </p>
            )}
          </div>

          <div className="mt-7 border-t border-white/[0.08] pt-6">
            <h3 className="font-semibold text-white">
              Assessment result &amp; management implications
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/85">
              {m
                ? `Under the entered assumptions, gross foregone output is ${crore(m.gross)} and residual foregone output is ${crore(m.residual)} (${((m.residual / GVA_TOTAL) * 100).toFixed(3)}% of the baseline annual GVA). Assumed avoided disruption is ${crore(m.avoided)}. This is a conditional stress estimate, not an official loss forecast.`
                : "Assessment unavailable until inputs are corrected."}
            </p>
            {m && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Assumption sensitivity: varying productivity reduction by ±10 percentage points
                gives {crore(low)}–{crore(high)}. This is an input sensitivity range, not a
                statistical confidence interval.
              </p>
            )}
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Use exposed output share from a district or asset footprint study; use sector-specific
              interruption days and productivity reductions from validated historical events.
              Adaptation effectiveness requires evidence. No people-at-risk count is inferred from
              monetary output. Economic Survey Table 1.4 ·{" "}
              <ExtLink href={ECONOMIC_SURVEY_URL}>source figures</ExtLink>
            </p>
          </div>
        </Panel>
      </div>

      <Panel title="Audit table · INR crore">
        <div className="mt-3">
          <DataTable
            head={[
              "Economic Survey industry group",
              "Annual GVA",
              "Exposed annual output",
              "Gross disruption",
              "Residual disruption",
            ]}
            rows={(m?.rows ?? []).map((r) => [
              r.name,
              ...[r.gva, r.exposed, r.gross, r.residual].map((v, j) => (
                <span key={j} className="font-mono text-white/80">
                  {num(v)}
                </span>
              )),
            ])}
          />
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Groups reproduce Table 1.4 categories, including mining with agriculture/forestry/fishing.
          Group rows sum to ₹32,347,873 crore. GDP at market prices is ₹35,713,886 crore (Table
          1.6); GDP and GVA must not be added together. Values are the Survey’s 2011–12-series
          vintage, not a claim of the latest revised national accounts.
        </p>
      </Panel>

      <Panel title="Financial model & limits">
        <div className="mt-3 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-periwinkle/25 bg-periwinkle/[0.07] p-5 font-mono text-xs leading-relaxed text-white/85">
            <p>Exposed annual output = annual GVA × exposure share.</p>
            <p className="mt-2">
              Gross disruption = exposed annual output × days / 365 × productivity reduction.
            </p>
            <p className="mt-2">
              Residual disruption = gross disruption × (1 − adaptation reduction).
            </p>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The selected SSP does not automatically modify exposure or productivity. Results hold
            FY2025–26 nominal output fixed; they are not 2050 or 2090 economic forecasts. Exposure
            is not an asset inventory. Uniform daily output omits seasonality, nonlinear damage and
            recovery, supply-chain propagation, price effects and fiscal impacts. Separate hazard
            losses must not be summed without overlap treatment.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            True expected annual loss needs an event-probability set and validated vulnerability
            functions. Net present value additionally needs annual cash-flow paths, a discount rate
            and adaptation costs. These are not fabricated here.
          </p>
        </div>
      </Panel>
    </div>
  );
}
