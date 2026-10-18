import { AppShell } from "@/components/app/app-shell";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  TrendingUp,
  Award,
  FileText,
  Plus,
  Zap,
  Building2,
  CheckCircle2,
  DollarSign,
  Layers,
  Sparkles,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  CctsEntityRecord,
  CctsSector,
  CEA_REGIONAL_GRIDS,
  SAMPLE_CCTS_RECORDS,
  calculateCctsMetrics,
  exportCctsCompliancePdf,
} from "@/lib/ccts";

export const Route = createFileRoute("/_authenticated/ccts")({
  component: CctsPage,
  head: () => ({
    meta: [
      { title: "Indian CCTS & Carbon Trading Hub — clisomumbai" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function CctsPage() {
  const [records, setRecords] = useState<CctsEntityRecord[]>(SAMPLE_CCTS_RECORDS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [marketPriceInr, setMarketPriceInr] = useState(1800);

  // Form State
  const [facilityName, setFacilityName] = useState("");
  const [dcCode, setDcCode] = useState("DC-MH-ST-199");
  const [sector, setSector] = useState<CctsSector>("iron_steel");
  const [region, setRegion] = useState("western_grid");
  const [complianceYear, setComplianceYear] = useState("FY 2026-27");
  const [baselineIntensity, setBaselineIntensity] = useState(2.05);
  const [targetIntensity, setTargetIntensity] = useState(1.9);
  const [actualIntensity, setActualIntensity] = useState(1.78);
  const [annualProduction, setAnnualProduction] = useState(60000);
  const [auditAgency, setAuditAgency] = useState("BEE Accredited Carbon Verifier");

  const calculatedPreview = useMemo(
    () =>
      calculateCctsMetrics({
        targetIntensity,
        actualIntensity,
        annualProductionTonnes: annualProduction,
        cccMarketPriceInr: marketPriceInr,
      }),
    [targetIntensity, actualIntensity, annualProduction, marketPriceInr],
  );

  const totalCccEarned = records.reduce(
    (s, r) => s + (r.complianceStatus === "SURPLUS_EARNED" ? r.carbonCreditsEarned : 0),
    0,
  );
  const totalMarketValueInr = totalCccEarned * marketPriceInr;

  const handleAddRecord = () => {
    if (!facilityName.trim() || annualProduction <= 0) {
      toast.error("Please provide valid facility name and annual production volume.");
      return;
    }

    const newRec: CctsEntityRecord = {
      id: `ccts-${Date.now().toString().slice(-4)}`,
      facilityName,
      dcCode,
      sector,
      region,
      complianceYear,
      baselineEmissionIntensity: baselineIntensity,
      targetEmissionIntensity: targetIntensity,
      actualVerifiedIntensity: actualIntensity,
      annualProductionTonnes: annualProduction,
      carbonCreditsEarned: calculatedPreview.netCcc,
      complianceStatus: calculatedPreview.complianceStatus,
      estimatedMarketValueInr: calculatedPreview.estimatedMarketValueInr,
      auditAgency,
      verifiedDate: new Date().toISOString().split("T")[0],
    };

    setRecords([newRec, ...records]);
    setIsDialogOpen(false);
    toast.success("Designated Consumer CCTS compliance dossier registered.");

    setFacilityName("");
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(records.filter((r) => r.id !== id));
    toast.info("Deleted CCTS record.");
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl md:text-3xl font-medium tracking-tight">
                    Indian CCTS &amp; Carbon Trading Hub
                  </h1>
                  <Badge
                    variant="outline"
                    className="bg-primary/5 text-primary border-primary/20 text-[11px] font-mono"
                  >
                    BEE PAT / ICM 2026
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Indian Carbon Market (ICM) compliance, Carbon Credit Certificates (CCC), and
                  exchange valuation on IEX/PXIL.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 text-xs font-medium h-9">
                  <Plus className="h-4 w-4" /> Register Designated Consumer (DC)
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 font-display text-xl">
                    <Award className="h-5 w-5 text-primary" /> Register Designated Consumer CCTS
                    Facility
                  </DialogTitle>
                  <DialogDescription>
                    Enter BEE target specific emission intensity and actual audited performance to
                    calculate Carbon Credit Certificates.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Facility Name *</Label>
                      <Input
                        placeholder="e.g. Nagpur Special Steels DC-03"
                        value={facilityName}
                        onChange={(e) => setFacilityName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">BEE DC Registration Code</Label>
                      <Input
                        placeholder="e.g. DC-MH-ST-204"
                        value={dcCode}
                        onChange={(e) => setDcCode(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Industry Sector</Label>
                      <Select value={sector} onValueChange={(v) => setSector(v as CctsSector)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="iron_steel">Iron &amp; Steel</SelectItem>
                          <SelectItem value="cement">Cement</SelectItem>
                          <SelectItem value="aluminium">Aluminium</SelectItem>
                          <SelectItem value="fertilizers">Fertilizers</SelectItem>
                          <SelectItem value="chlor_alkali">Chlor-Alkali</SelectItem>
                          <SelectItem value="thermal_power">Thermal Power</SelectItem>
                          <SelectItem value="textiles">Textiles</SelectItem>
                          <SelectItem value="pulp_paper">Pulp &amp; Paper</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Regional CEA Grid</Label>
                      <Select value={region} onValueChange={setRegion}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CEA_REGIONAL_GRIDS).map(([k, g]) => (
                            <SelectItem key={k} value={k}>
                              {g.region} ({g.gridFactorKgPerKwh} kg/kWh)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[11px]">BEE Baseline (tCO₂e/t)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={baselineIntensity}
                        onChange={(e) => setBaselineIntensity(Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[11px]">BEE Target Cap (tCO₂e/t)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={targetIntensity}
                        onChange={(e) => setTargetIntensity(Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[11px]">Verified Actual (tCO₂e/t)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={actualIntensity}
                        onChange={(e) => setActualIntensity(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Annual Production (MT) *</Label>
                      <Input
                        type="number"
                        value={annualProduction}
                        onChange={(e) => setAnnualProduction(Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Accredited Energy Auditor</Label>
                      <Input value={auditAgency} onChange={(e) => setAuditAgency(e.target.value)} />
                    </div>
                  </div>

                  {/* Calculation Summary Preview */}
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Compliance Outcome</span>
                      <Badge
                        className={
                          calculatedPreview.isSurplus
                            ? "bg-emerald-600 text-white"
                            : "bg-destructive text-destructive-foreground"
                        }
                      >
                        {calculatedPreview.isSurplus
                          ? "Surplus CCCs Earnable"
                          : "Deficit Shortfall"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-xs text-muted-foreground">Carbon Credits (CCC):</span>
                        <div className="font-display text-2xl font-semibold text-primary">
                          {calculatedPreview.netCcc.toLocaleString()}{" "}
                          <span className="text-xs font-normal font-sans text-muted-foreground">
                            Units
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground">
                          IEX Valuation (@ ₹{marketPriceInr}/CCC):
                        </span>
                        <div className="font-display text-xl font-semibold text-emerald-700">
                          ₹{(calculatedPreview.estimatedMarketValueInr / 100000).toFixed(2)} Lakh
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddRecord} className="font-medium text-xs">
                    Issue Compliance Record
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 rounded-2xl border-border bg-card">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block">
              Total Carbon Credit Certificates (CCC)
            </span>
            <div className="font-display text-3xl font-medium text-foreground mt-1">
              {totalCccEarned.toLocaleString()}{" "}
              <span className="text-sm font-sans font-normal text-muted-foreground">tCO₂e</span>
            </div>
            <span className="text-xs text-emerald-700 mt-1 block">
              Surplus units verified under Energy Conservation Act
            </span>
          </Card>

          <Card className="p-5 rounded-2xl border-border bg-card">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block">
              Exchange Monetization Value (IEX/PXIL)
            </span>
            <div className="font-display text-3xl font-medium text-emerald-800 mt-1">
              ₹{(totalMarketValueInr / 100000).toFixed(1)} Lakh
            </div>
            <span className="text-xs text-muted-foreground mt-1 block">
              Calculated at ₹{marketPriceInr} / CCC certificate rate
            </span>
          </Card>

          <Card className="p-5 rounded-2xl border-border bg-card flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Market Carbon Price Index
              </span>
              <Badge variant="secondary" className="text-[10px]">
                LIVE BENCHMARK
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">
                Price (₹/CCC):
              </Label>
              <Input
                type="number"
                className="h-8 w-28 text-xs font-mono font-medium"
                value={marketPriceInr}
                onChange={(e) => setMarketPriceInr(Number(e.target.value))}
              />
            </div>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="registry" className="space-y-6">
          <TabsList className="grid grid-cols-2 max-w-sm">
            <TabsTrigger value="registry">Designated Consumers</TabsTrigger>
            <TabsTrigger value="regional_cea">CEA Regional Grids</TabsTrigger>
          </TabsList>

          {/* Tab 1: Designated Consumers Ledger */}
          <TabsContent value="registry" className="space-y-6">
            <Card className="rounded-2xl border-border bg-card overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="font-display text-lg font-medium">
                    Designated Consumer (DC) Compliance Dossier
                  </CardTitle>
                  <CardDescription>
                    BEE PAT cycle emission performance against gazette targets.
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="font-mono text-xs">
                  {records.length} entities
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Facility &amp; DC Code</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead className="text-right">Target Cap</TableHead>
                      <TableHead className="text-right">Verified Actual</TableHead>
                      <TableHead className="text-right">Credits Earned (CCC)</TableHead>
                      <TableHead className="text-right">Tradeable Value</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Statement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <div className="font-medium text-foreground">{r.facilityName}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {r.dcCode} · {r.complianceYear}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize text-[10px]">
                            {r.sector.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-muted-foreground">
                          {r.targetEmissionIntensity.toFixed(3)} t/t
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-semibold text-primary">
                          {r.actualVerifiedIntensity.toFixed(3)} t/t
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold text-emerald-700">
                          {r.carbonCreditsEarned.toLocaleString()} CCC
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          ₹{(r.estimatedMarketValueInr / 100000).toFixed(1)} L
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={
                              r.complianceStatus === "SURPLUS_EARNED"
                                ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                                : "bg-destructive/10 text-destructive border-destructive/30"
                            }
                          >
                            {r.complianceStatus.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs gap-1"
                              onClick={() => exportCctsCompliancePdf(r)}
                            >
                              <FileText className="h-3.5 w-3.5 text-primary" /> Certificate
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteRecord(r.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: CEA Regional Grids */}
          <TabsContent value="regional_cea" className="space-y-6">
            <Card className="rounded-2xl border-border bg-card">
              <CardHeader>
                <CardTitle className="font-display text-lg font-medium">
                  Central Electricity Authority (CEA) Baseline Database v19
                </CardTitle>
                <CardDescription>
                  Verified regional grid emission factors applicable across Indian states for Scope
                  2 and CCTS accounting.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Regional Grid</TableHead>
                      <TableHead className="text-right">Emission Factor (kg CO₂ / kWh)</TableHead>
                      <TableHead className="text-right">Equivalent (tCO₂ / MWh)</TableHead>
                      <TableHead>Jurisdiction / States Covered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(CEA_REGIONAL_GRIDS).map(([key, g]) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium text-foreground">{g.region}</TableCell>
                        <TableCell className="text-right font-mono font-semibold text-primary">
                          {g.gridFactorKgPerKwh.toFixed(3)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">
                          {g.gridFactorKgPerKwh.toFixed(3)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-sm">
                          {g.states.join(", ")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
