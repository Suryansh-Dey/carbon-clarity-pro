import { Bullets, Card, Grid, Table } from "../ui";
import { ENTITY_TYPES, REGULATION, STANDARDS } from "./data";

export function StandardsModule() {
  return (
    <div className="space-y-5">
      <Card>
        <Table
          minWidth={980}
          head={[
            "Standard or regulation",
            "Jurisdiction",
            "Applies to",
            "What it asks for",
            "Where the platform covers it",
          ]}
          rows={STANDARDS.map((s) => [<b key="s">{s[0]}</b>, s[1], s[2], s[3], s[4]])}
        />
      </Card>
      <Grid cols={3}>
        {ENTITY_TYPES.map(([k, n]) => (
          <Card key={k} title={n} sub={REGULATION[k].who}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Must do
            </p>
            <Bullets items={REGULATION[k].must.map((x) => x[0])} />
          </Card>
        ))}
      </Grid>
    </div>
  );
}
