import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { Stagger, StaggerItem, Tilt } from "@/components/site/motion";
import {
  getCapRecord,
  getImdForecast,
  getImdWarnings,
  getSachetAlerts,
  type CapRecord,
  type FeedResult,
  type ImdRecord,
  type SachetAlert,
} from "@/lib/climate-feeds.functions";
import { AGENCIES, IMD_COLORS, IMD_WARNINGS } from "./data";
import {
  Callout,
  ExtLink,
  GhostButton,
  InputField,
  Panel,
  Pill,
  PrimaryButton,
  TabIntro,
} from "./ui";

const REFRESH_MS = 15 * 60 * 1000;

function useSachetFeed() {
  return useQuery({
    queryKey: ["observatory", "sachet"],
    queryFn: () => getSachetAlerts(),
    refetchInterval: REFRESH_MS,
    staleTime: 60_000,
  });
}

export function WarningsTab() {
  const sachet = useSachetFeed();
  const [stationInput, setStationInput] = useState("42182");
  const [station, setStation] = useState("42182");
  const stationValid = /^\d{1,8}$/.test(station);
  const forecast = useQuery({
    queryKey: ["observatory", "imd-forecast", station],
    queryFn: () => getImdForecast({ data: { id: station } }),
    enabled: stationValid,
    refetchInterval: REFRESH_MS,
    staleTime: 60_000,
  });
  const warnings = useQuery({
    queryKey: ["observatory", "imd-warnings"],
    queryFn: () => getImdWarnings(),
    refetchInterval: REFRESH_MS,
    staleTime: 60_000,
  });
  const busy = sachet.isFetching || forecast.isFetching || warnings.isFetching;

  return (
    <div className="space-y-6">
      <TabIntro
        eyebrow="India · Official warning evidence"
        title="Warnings with provenance."
        text="IMD weather and cyclone services, SACHET dissemination, CWC rivers, INCOIS oceans, FSI forest fire and IITM Damini lightning. Retrieve CAP details to inspect issuer, validity and instructions."
        action={
          <GhostButton
            disabled={busy}
            onClick={() => {
              void sachet.refetch();
              void warnings.refetch();
              if (stationValid) void forecast.refetch();
            }}
          >
            <motion.span
              animate={busy ? { rotate: 360 } : { rotate: 0 }}
              transition={
                busy ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 0 }
              }
              className="inline-block"
            >
              ↻
            </motion.span>
            {busy ? "Connecting…" : "Refresh India feeds"}
          </GhostButton>
        }
      />

      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {AGENCIES.map(([name, desc, url, status]) => (
          <StaggerItem key={name}>
            <Tilt max={6} className="h-full rounded-3xl">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass group flex h-full flex-col rounded-3xl p-5 transition-colors hover:border-periwinkle/40"
              >
                <h3 className="font-semibold text-white">
                  {name}{" "}
                  <span className="text-lavender transition-transform group-hover:translate-x-0.5">
                    ↗
                  </span>
                </h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{desc}</p>
                <Pill tone="muted" className="mt-4 self-start">
                  {status}
                </Pill>
              </a>
            </Tilt>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <SachetPanel feed={sachet.data} loading={sachet.isPending} />

        <div className="space-y-6">
          <Panel title="IMD forecast & district warnings">
            <p className="text-sm text-muted-foreground">
              Official API adapters with transparent access status. Station code 42182 is the
              documented example; confirm the returned station before interpreting results.
            </p>
            <form
              className="mt-5 flex items-end gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                const next = stationInput.trim();
                if (next === station) void forecast.refetch();
                else setStation(next);
              }}
            >
              <InputField
                label="Forecast station code"
                inputMode="numeric"
                value={stationInput}
                onChange={(e) => setStationInput(e.target.value)}
                className="flex-1"
              />
              <PrimaryButton type="submit" disabled={forecast.isFetching}>
                Retrieve forecast
              </PrimaryButton>
            </form>
            <div className="mt-5 space-y-4" aria-live="polite">
              <ImdResult
                kind="forecast"
                loading={stationValid && forecast.isPending}
                feed={forecast.data}
                error={stationValid ? undefined : "Enter a valid numeric station code"}
              />
              <ImdResult kind="warnings" loading={warnings.isPending} feed={warnings.data} />
            </div>
            <p className="mt-5 text-xs">
              <ExtLink href="https://mausam.imd.gov.in/">IMD Mausam</ExtLink> ·{" "}
              <ExtLink href="https://imdgeospatial.imd.gov.in/">Geospatial services</ExtLink>
            </p>
          </Panel>

          <Panel title="Coverage and interpretation">
            <p className="text-sm leading-relaxed text-muted-foreground">
              SACHET records may carry IMD, CWC, INCOIS or state-agency messages; the issuing
              authority is shown per record. Portal links do not imply a standalone feed connection.
              INCOIS, FSI, CWC and Damini direct feeds are not configured. Seismic and tsunami
              hazards are assessed separately from SSP climate pathways.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function SachetPanel({
  feed,
  loading,
}: {
  feed: FeedResult<SachetAlert[]> | undefined;
  loading: boolean;
}) {
  const [term, setTerm] = useState("");
  const connected = feed?.status === "connected";
  const alerts = connected ? (feed.data ?? []) : [];
  const q = term.toLowerCase();
  const shown = alerts.filter((a) => `${a.title} ${a.author}`.toLowerCase().includes(q));
  const status = loading
    ? "Connecting"
    : connected
      ? `${alerts.length} published records`
      : "Unavailable";

  return (
    <Panel
      title="NDMA SACHET · Alert publications"
      badge={<Pill tone={connected ? "good" : loading ? "muted" : "warn"}>{status}</Pill>}
    >
      <p className="text-xs text-muted-foreground">
        {loading
          ? "Connecting to SACHET RSS…"
          : connected
            ? `Retrieved ${feed.retrievedAt} · ${feed.cacheState ?? "retrieved"} · refresh every 15 minutes while open`
            : feed?.message}
      </p>
      <InputField
        label="Search published alerts"
        type="search"
        placeholder="Filter by title or issuer"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="mt-5"
      />
      <Callout className="mt-4 text-xs">
        RSS lists published records and may include expired messages. Only CAP metadata establishes
        alert validity. This dashboard does not send emergency notifications.
      </Callout>
      <div className="mt-4 max-h-[720px] space-y-3 overflow-y-auto pr-1">
        {loading ? (
          <p className="py-4 text-sm text-muted-foreground">Requesting published records…</p>
        ) : !connected ? (
          <p className="py-4 text-sm text-muted-foreground">
            No warning status can be inferred.{" "}
            <ExtLink href="https://sachet.ndma.gov.in/">Check official SACHET</ExtLink>
          </p>
        ) : shown.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            No matching published records. This does not establish absence of hazards.
          </p>
        ) : (
          shown.map((a) => <AlertCard key={a.id} a={a} />)
        )}
      </div>
    </Panel>
  );
}

type CapState = { loading: boolean; result?: FeedResult<CapRecord>; error?: string };

function capValidity(r: CapRecord) {
  const effective = r.effective || r.sent;
  const exp = Date.parse(r.expires);
  const eff = Date.parse(effective);
  const validExpiry = !!r.expires && Number.isFinite(exp);
  if (r.msgType === "Cancel") return { label: "Cancellation", tone: "muted" as const, effective };
  if (r.status !== "Actual")
    return { label: `Non-operational CAP status: ${r.status}`, tone: "muted" as const, effective };
  if (validExpiry && exp < Date.now())
    return { label: "Expired", tone: "muted" as const, effective };
  if (effective && Number.isFinite(eff) && eff > Date.now())
    return { label: "Not yet effective", tone: "warn" as const, effective };
  if (validExpiry)
    return { label: "Within stated validity · confirm updates", tone: "bad" as const, effective };
  return {
    label: "Expiry unavailable or invalid · validity unknown",
    tone: "warn" as const,
    effective,
  };
}

function AlertCard({ a }: { a: SachetAlert }) {
  const [cap, setCap] = useState<CapState | null>(null);
  const inspect = async () => {
    setCap({ loading: true });
    try {
      const result = await getCapRecord({ data: { id: a.id } });
      if (result.status !== "connected" || !result.data)
        throw new Error(result.message ?? "CAP unavailable");
      setCap({ loading: false, result });
    } catch (e) {
      setCap({ loading: false, error: e instanceof Error ? e.message : "CAP unavailable" });
    }
  };

  return (
    <article className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 transition-colors hover:border-white/15">
      <h3 className="text-sm font-semibold text-white">{a.title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground [&_b]:text-white/90">
        <b>Issuer in RSS:</b> {a.author || "Not supplied"}
        <br />
        <b>Published:</b> {a.published || "Not supplied"}
        <br />
        <b>Identifier:</b> {a.id}
        <br />
        <b>Status:</b> Published record; CAP validity not yet checked
      </p>
      <GhostButton className="mt-3 h-9 px-4 text-xs" disabled={cap?.loading} onClick={inspect}>
        {cap?.loading ? "Retrieving…" : "Inspect CAP validity & instructions"}
      </GhostButton>
      <AnimatePresence>
        {cap && (
          <motion.div
            initial={{ opacity: 0, height: 0, rotateX: -20 }}
            animate={{ opacity: 1, height: "auto", rotateX: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformPerspective: 900, transformOrigin: "top" }}
            className="overflow-hidden"
          >
            <div className="mt-4 border-t border-white/[0.08] pt-4 text-xs leading-relaxed text-muted-foreground [&_b]:text-white/90">
              {cap.loading ? (
                <p>Retrieving authoritative CAP metadata…</p>
              ) : cap.error || !cap.result?.data ? (
                <p>CAP unavailable: {cap.error}. Open SACHET for current guidance.</p>
              ) : (
                <CapDetails result={cap.result} record={cap.result.data} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

function CapDetails({ result, record: r }: { result: FeedResult<CapRecord>; record: CapRecord }) {
  const v = capValidity(r);
  const fields: [string, string][] = [
    ["Validity", v.label],
    ["CAP status", r.status],
    ["Message type", r.msgType],
    ["Sender", r.sender],
    ["Sent", r.sent],
    ["Effective", v.effective],
    ["Expires", r.expires || "Not supplied"],
    ["Event", r.event],
    ["Severity", r.severity],
    ["Urgency", r.urgency],
    ["Certainty", r.certainty],
    ["Area", r.areaDesc],
  ];
  return (
    <div className="space-y-3">
      <Pill tone={v.tone}>{v.label}</Pill>
      {r.headline && <p className="text-sm font-semibold text-white">{r.headline}</p>}
      <p>
        {fields.map(([k, val], i) => (
          <span key={k}>
            {i > 0 && <br />}
            <b>{k}:</b> {val || "Not supplied"}
          </span>
        ))}
      </p>
      {r.description && <p>{r.description}</p>}
      <p>
        <b>Issuer instructions:</b> {r.instruction || "Not supplied"}
      </p>
      <p className="text-[11px] opacity-80">
        Retrieved {result.retrievedAt} · {result.cacheState ?? "retrieved"}
      </p>
      <p>
        <ExtLink href={result.sourceUrl}>Official CAP record</ExtLink>
      </p>
      {r.msgType === "Update" && (
        <p>This is an update; review CAP references and any later messages on SACHET.</p>
      )}
    </div>
  );
}

const str = (v: unknown) => (v == null ? "" : String(v));

function ImdResult({
  kind,
  loading,
  feed,
  error,
}: {
  kind: "forecast" | "warnings";
  loading: boolean;
  feed: FeedResult<ImdRecord[]> | undefined;
  error?: string;
}) {
  const label = kind === "forecast" ? "City forecast" : "District warnings";
  let body: ReactNode;

  if (error || (!loading && feed && feed.status !== "connected")) {
    const restricted = feed?.status === "access_required";
    body = (
      <>
        <Pill tone="warn">{restricted && !error ? "Access required" : "Unavailable"}</Pill>
        <p className="mt-2">{error ?? feed?.message}</p>
        <p className="mt-1 text-[11px] opacity-80">
          No forecast or warning severity is substituted. Use IMD’s official portal.
        </p>
      </>
    );
  } else if (loading || !feed) {
    body = <p>Checking IMD API access…</p>;
  } else {
    const records = feed.data ?? [];
    const head = (
      <>
        <Pill tone="good">IMD response retrieved</Pill>
        <p className="mt-2 text-[11px]">
          Retrieved {feed.retrievedAt} · {records.length} records. Source issue dates remain
          authoritative.
        </p>
      </>
    );
    if (kind === "forecast") {
      const r = records[0];
      body =
        r && r.Station_Name ? (
          <>
            {head}
            <h4 className="mt-3 font-semibold text-white">
              {str(r.Station_Name)} · {str(r.Date)}
            </h4>
            <p className="mt-1">
              Day 1: {str(r.Todays_Forecast)} · {str(r.Todays_Forecast_Min_temp)}–
              {str(r.Todays_Forecast_Max_Temp)}°C
            </p>
            <div className="mt-2 divide-y divide-white/[0.06]">
              {[2, 3, 4, 5, 6, 7].map((d) => (
                <div key={d} className="flex justify-between gap-3 py-1.5">
                  <span>Day {d}</span>
                  <span className="text-right text-white/80">
                    {str(r[`Day_${d}_Forecast`])} · {str(r[`Day_${d}_Min_temp`])}–
                    {str(r[`Day_${d}_Max_Temp`])}°C
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <Pill tone="warn">Unavailable</Pill>
            <p className="mt-2">Unexpected forecast format</p>
          </>
        );
    } else {
      body = (
        <>
          {head}
          <div className="mt-3 max-h-64 divide-y divide-white/[0.06] overflow-y-auto">
            {records.slice(0, 300).map((r, i) => (
              <div key={i} className="flex justify-between gap-3 py-2">
                <span className="text-white/90">
                  {str(r.District)}
                  <small className="block text-muted-foreground">
                    Issue {str(r.Date)} {str(r.UTC)} UTC
                  </small>
                </span>
                <span className="text-right">
                  {IMD_COLORS[str(r.Day1_Color)] ?? "Unknown color"} ·{" "}
                  {str(r.Day_1)
                    .split(",")
                    .map((c) => IMD_WARNINGS[c.trim()] ?? c)
                    .join(", ")}
                </span>
              </div>
            ))}
          </div>
        </>
      );
    }
  }

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 text-xs leading-relaxed text-muted-foreground">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
        {label}
      </p>
      {body}
    </div>
  );
}
