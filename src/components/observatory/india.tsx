import { AnimatePresence, motion } from "motion/react";
import { Stagger, StaggerItem } from "@/components/site/motion";
import { REGIONS } from "./data";
import { Callout, DataTable, ExtLink, Panel, Pill, SelectField, TabIntro } from "./ui";

export function IndiaTab({
  region,
  setRegion,
}: {
  region: number;
  setRegion: (i: number) => void;
}) {
  const r = REGIONS[region];
  return (
    <div className="space-y-6">
      <TabIntro
        eyebrow="India · Regional screening"
        title="Resilience at the local level."
        text="Planning hypotheses for validation with IMD, NRSC/ISRO, ICED and district-level data."
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel>
          <SelectField
            label="Region"
            value={region}
            onChange={(e) => setRegion(Number(e.target.value))}
            className="max-w-md"
          >
            {REGIONS.map((x, i) => (
              <option key={x.name} value={i}>
                {x.name}
              </option>
            ))}
          </SelectField>
          <AnimatePresence mode="wait">
            <motion.div
              key={r.name}
              initial={{ opacity: 0, rotateY: -12, x: 24 }}
              animate={{ opacity: 1, rotateY: 0, x: 0 }}
              exit={{ opacity: 0, rotateY: 12, x: -24 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformPerspective: 1200 }}
              className="mt-6"
            >
              <h2 className="font-display text-3xl text-white">{r.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {r.states}. {r.summary}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {r.hazards.map((h) => (
                  <Pill key={h}>{h}</Pill>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
                <h3 className="font-semibold text-white">People &amp; economic exposure</h3>
                <p className="mt-2 text-sm text-muted-foreground">{r.exposure}</p>
                <p className="mt-3 text-xs text-muted-foreground/80">
                  No district population or asset overlay has been performed. These are qualitative
                  screening profiles, not official hazard classifications.
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </Panel>

        <Panel title="Priority resilience measures">
          <AnimatePresence mode="wait">
            <motion.div
              key={r.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Stagger className="mt-3 space-y-3">
                {r.actions.map((a, i) => (
                  <StaggerItem key={a}>
                    <div className="flex gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                      <b className="font-mono text-sm text-periwinkle">0{i + 1}</b>
                      <span className="text-sm text-white/90">{a}</span>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </motion.div>
          </AnimatePresence>
          <Callout className="mt-5">
            <h3 className="mb-2 font-semibold text-white">India evidence stack</h3>
            <p>
              <ExtLink href="https://mausam.imd.gov.in/">IMD</ExtLink> — authoritative weather
              warnings and cyclone information.{" "}
              <ExtLink href="https://bhuvan.nrsc.gov.in/">Bhuvan / NRSC</ExtLink> —
              satellite-derived disaster and geospatial products.{" "}
              <ExtLink href="https://iced.niti.gov.in/climate-and-environment/environment/natural-disaster">
                NITI Aayog ICED
              </ExtLink>{" "}
              — disaster vulnerability context.
            </p>
            <Pill tone="muted" className="mt-3">
              Linked official portals · not connected feeds
            </Pill>
          </Callout>
        </Panel>
      </div>

      <Panel title="India: what each hazard can affect">
        <div className="mt-3">
          <DataTable
            head={[
              "Planning region",
              "Hazards to investigate",
              "Sector exposure",
              "Evidence required",
            ]}
            rows={REGIONS.map((x) => [x.name, x.hazards.join(", "), x.exposure, x.evidence])}
          />
        </div>
      </Panel>
    </div>
  );
}
