import { Callout, ExtLink, Pill } from "@/components/observatory/ui";
import { Card, Table } from "../ui";
import type { EntCtx } from "./context";
import { DICTIONARY, FEEDED, SOURCES } from "./data";

export function LiveTab({ A }: EntCtx) {
  const P = A.pin;
  return (
    <div className="space-y-5">
      <Card
        title="Live data and authorised sources"
        sub="Official sources for live readings at the site pincode: alerts, weather, river levels, air quality and earthquakes. Nothing on this tab is simulated."
      >
        {P ? (
          <Callout>
            <b>Live feed not connected here.</b> The scheduled data feed is not part of this
            version, so check the official links below for current alerts and readings at the site.
          </Callout>
        ) : (
          <p className="text-sm text-muted-foreground">
            Enter a site pincode and press Analyse to see live data for the site.
          </p>
        )}
      </Card>
      {P && (
        <Card
          title="Authorised data sources for this site"
          sub={
            <>
              Official Indian sources first, then global scientific services. “In scheduled feed”
              sources are read automatically once the feed is connected; the rest are links to check
              by hand. Coordinates for this site:{" "}
              <b className="text-white">
                {P.lat},{P.lon}
              </b>
              .
            </>
          }
        >
          <Table
            minWidth={980}
            head={["Source", "Authority", "What it provides", "Updates", "Access", "Feed"]}
            rows={SOURCES.map((s) => [
              <ExtLink key="l" href={s[5]}>
                {s[0]}
              </ExtLink>,
              s[1],
              s[2],
              s[3],
              s[4],
              FEEDED.includes(s[6]) ? (
                <Pill key="f" tone="good">
                  In scheduled feed
                </Pill>
              ) : (
                <Pill key="f" tone="muted">
                  Link
                </Pill>
              ),
            ])}
          />
        </Card>
      )}
    </div>
  );
}

const GROUPS: Record<string, string> = {
  Site: "Site attributes",
  Hazard: "Hazard scores",
  Scenario: "Scenarios",
  Financial: "Financial figures",
  Resilience: "Resilience and mitigation figures",
  Live: "Live data",
};

export function DictionaryTab() {
  return (
    <div className="space-y-5">
      <Card
        title="Data dictionary and methods"
        sub="Every attribute, score and figure on this dashboard: what it means, its unit, where it comes from, how to read it and its limits."
      />
      {[...new Set(DICTIONARY.map((d) => d[0]))].map((g) => (
        <Card key={g} title={GROUPS[g]}>
          <Table
            minWidth={1100}
            head={[
              "Attribute",
              "What it means",
              "Unit / scale",
              "Source and method",
              "How to read it",
              "Limits",
            ]}
            rows={DICTIONARY.filter((d) => d[0] === g).map((d) => [
              <b key="a">{d[1]}</b>,
              d[2],
              d[3],
              d[4],
              d[5],
              d[6],
            ])}
          />
        </Card>
      ))}
    </div>
  );
}
