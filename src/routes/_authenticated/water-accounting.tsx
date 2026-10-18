import { AppShell } from "@/components/app/app-shell";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Droplets,
  Download,
  FileSpreadsheet,
  FileText,
  Plus,
  Waves,
  RefreshCw,
  Gauge,
  Sparkles,
  Building2,
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
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import {
  WaterLogEntry,
  WaterSourceType,
  WaterDischargeType,
  WatershedStressLevel,
  WATER_SOURCE_LABELS,
  WATER_DISCHARGE_LABELS,
  WATER_STRESS_LABELS,
  SAMPLE_WATER_PRESETS,
  calculateWaterOverview,
  downloadBrsrWaterCsv,
  exportWaterStewardshipPdf,
} from "@/lib/water-accounting";

export const Route = createFileRoute("/_authenticated/water-accounting")({
  component: WaterAccountingPage,
  head: () => ({
    meta: [
      { title: "Water Accounting & BRSR Principle 6 — clisomumbai" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function WaterAccountingPage() {
  const [selectedPreset, setSelectedPreset] = useState<string>("steel_manufacturing");
  const [entries, setEntries] = useState<WaterLogEntry[]>(
    SAMPLE_WATER_PRESETS.steel_manufacturing.entries,
  );
  const [turnoverCrores, setTurnoverCrores] = useState<number>(185);
  const [annualOutputMT, setAnnualOutputMT] = useState<number>(32000);
  const [companyName, setCompanyName] = useState<string>("Climate Social Mumbai Ltd.");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State for new entry
  const [facility, setFacility] = useState("");
  const [location, setLocation] = useState("");
  const [period, setPeriod] = useState("FY 2026-27");
  const [sourceType, setSourceType] = useState<WaterSourceType>("surface_water");
  const [withdrawalKL, setWithdrawalKL] = useState<number>(5000);
  const [metered, setMetered] = useState<boolean>(true);
  const [dischargeType, setDischargeType] = useState<WaterDischargeType>("etp_treated_reuse");
  const [dischargeKL, setDischargeKL] = useState<number>(1200);
  const [recycledKL, setRecycledKL] = useState<number>(1800);
  const [watershedStress, setWatershedStress] = useState<WatershedStressLevel>("medium_high");
  const [codMgL, setCodMgL] = useState<number>(35);
  const [bodMgL, setBodMgL] = useState<number>(8);
  const [tdsMgL, setTdsMgL] = useState<number>(650);
  const [ph, setPh] = useState<number>(7.2);
  const [notes, setNotes] = useState("");

  const overview = useMemo(
    () => calculateWaterOverview(entries, turnoverCrores, annualOutputMT),
    [entries, turnoverCrores, annualOutputMT],
  );

  const handleApplyPreset = (presetKey: string) => {
    setSelectedPreset(presetKey);
    const preset = SAMPLE_WATER_PRESETS[presetKey];
    if (preset) {
      setEntries(preset.entries);
      toast.success(`Applied ${preset.label} water profile`);
    }
  };

  const handleAddEntry = () => {
    if (!facility.trim() || withdrawalKL <= 0) {
      toast.error("Please provide a valid facility name and withdrawal volume.");
      return;
    }

    const newEntry: WaterLogEntry = {
      id: `wat-${Date.now().toString().slice(-4)}`,
      facility,
      location: location || "India Facility",
      period,
      sourceType,
      withdrawalKL: Number(withdrawalKL),
      metered,
      dischargeType,
      dischargeKL: Number(dischargeKL),
      recycledKL: Number(recycledKL),
      watershedStress,
      codMgL: Number(codMgL),
      bodMgL: Number(bodMgL),
      tdsMgL: Number(tdsMgL),
      ph: Number(ph),
      notes,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setEntries([newEntry, ...entries]);
    setIsDialogOpen(false);
    toast.success("Water log entry added to ledger");

    // Reset fields
    setFacility("");
    setLocation("");
    setNotes("");
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
    toast.info("Removed entry from water ledger");
  };

  // Chart data transforms
  const sourceChartData = Object.entries(overview.bySource)
    .filter(([, val]) => val > 0)
    .map(([key, val]) => ({
      name: WATER_SOURCE_LABELS[key as WaterSourceType]?.label || key,
      value: val,
      color: WATER_SOURCE_LABELS[key as WaterSourceType]?.color || "#0ea5e9",
    }));

  const dischargeChartData = Object.entries(overview.byDischarge)
    .filter(([, val]) => val > 0)
    .map(([key, val]) => ({
      name: WATER_DISCHARGE_LABELS[key as WaterDischargeType]?.label || key,
      value: val,
      color: WATER_DISCHARGE_LABELS[key as WaterDischargeType]?.color || "#10b981",
    }));

  const facilityBalanceData = overview.facilitySummaries.map((f) => ({
    name: f.facility.length > 18 ? f.facility.slice(0, 16) + "…" : f.facility,
    Withdrawal: f.totalWithdrawalKL,
    Consumption: f.totalConsumptionKL,
    Recycled: f.totalRecycledKL,
    Discharge: f.totalDischargeKL,
  }));

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header & Controls */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-500/10 text-sky-500 ring-1 ring-sky-500/20">
                <Droplets className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
                    Water & Resource Accounting
                  </h1>
                  <Badge
                    variant="outline"
                    className="bg-sky-500/10 text-sky-600 border-sky-500/20 font-mono text-[11px]"
                  >
                    BRSR Principle 6 · GRI 303
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Multi-facility water intake, circular recycling, discharge quality, and basin
                  stress analytics.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-sky-600 hover:bg-sky-700 text-white shadow-sm">
                  <Plus className="h-4 w-4" /> Log Water Activity
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-sky-500" />
                    Add Facility Water Ingestion Entry
                  </DialogTitle>
                  <DialogDescription>
                    Record meter readings, utility water bills, effluent discharge, and effluent
                    quality parameters.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="fac-name">Facility Name *</Label>
                    <Input
                      id="fac-name"
                      placeholder="e.g. Navi Mumbai Unit II"
                      value={facility}
                      onChange={(e) => setFacility(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="fac-loc">Location / Industrial Zone</Label>
                    <Input
                      id="fac-loc"
                      placeholder="e.g. Taloja MIDC, Maharashtra"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Water Source Type</Label>
                    <Select
                      value={sourceType}
                      onValueChange={(v) => setSourceType(v as WaterSourceType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(WATER_SOURCE_LABELS).map(([k, meta]) => (
                          <SelectItem key={k} value={k}>
                            {meta.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="w-kl">Total Withdrawal Volume (kL) *</Label>
                    <Input
                      id="w-kl"
                      type="number"
                      min="0"
                      value={withdrawalKL}
                      onChange={(e) => setWithdrawalKL(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Discharge Destination / Method</Label>
                    <Select
                      value={dischargeType}
                      onValueChange={(v) => setDischargeType(v as WaterDischargeType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(WATER_DISCHARGE_LABELS).map(([k, meta]) => (
                          <SelectItem key={k} value={k}>
                            {meta.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="d-kl">Total Discharge Volume (kL)</Label>
                    <Input
                      id="d-kl"
                      type="number"
                      min="0"
                      value={dischargeKL}
                      onChange={(e) => setDischargeKL(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="r-kl">Recycled / Reused Volume (kL)</Label>
                    <Input
                      id="r-kl"
                      type="number"
                      min="0"
                      value={recycledKL}
                      onChange={(e) => setRecycledKL(Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Watershed Stress Level (CGWB / WRI)</Label>
                    <Select
                      value={watershedStress}
                      onValueChange={(v) => setWatershedStress(v as WatershedStressLevel)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(WATER_STRESS_LABELS).map(([k, meta]) => (
                          <SelectItem key={k} value={k}>
                            {meta.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Water Quality Section */}
                <div className="rounded-lg border bg-muted/30 p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Effluent Quality & Treatment Assurance (Optional)
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      CPCB Standard Norms
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2.5">
                    <div className="space-y-1">
                      <Label className="text-[11px]">COD (mg/L)</Label>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        value={codMgL}
                        onChange={(e) => setCodMgL(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">BOD (mg/L)</Label>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        value={bodMgL}
                        onChange={(e) => setBodMgL(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">TDS (mg/L)</Label>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        value={tdsMgL}
                        onChange={(e) => setTdsMgL(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">pH Value</Label>
                      <Input
                        type="number"
                        step="0.1"
                        className="h-8 text-xs"
                        value={ph}
                        onChange={(e) => setPh(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddEntry}
                    className="bg-sky-600 hover:bg-sky-700 text-white"
                  >
                    Save Water Entry
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              className="gap-2"
              onClick={() => downloadBrsrWaterCsv(overview, companyName, "FY 2026-27")}
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> BRSR Water CSV
            </Button>

            <Button
              variant="outline"
              className="gap-2"
              onClick={() => exportWaterStewardshipPdf(overview, companyName, "FY 2026-27")}
            >
              <FileText className="h-4 w-4 text-sky-600" /> Stewardship PDF
            </Button>
          </div>
        </div>

        {/* Preset Profiles & Enterprise Parameters */}
        <Card className="bg-card/50 border-sky-500/10">
          <CardContent className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-4 w-4 text-amber-500" /> Industry Benchmark Preset:
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(SAMPLE_WATER_PRESETS).map(([key, p]) => (
                  <Button
                    key={key}
                    size="sm"
                    variant={selectedPreset === key ? "default" : "outline"}
                    className={
                      selectedPreset === key ? "bg-sky-600 hover:bg-sky-700 text-white" : ""
                    }
                    onClick={() => handleApplyPreset(key)}
                  >
                    {p.sector}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 lg:pt-0 border-t lg:border-t-0">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="turnover"
                  className="text-xs text-muted-foreground whitespace-nowrap"
                >
                  Turnover (₹ Cr):
                </Label>
                <Input
                  id="turnover"
                  type="number"
                  className="h-8 w-24 text-xs font-medium"
                  value={turnoverCrores}
                  onChange={(e) => setTurnoverCrores(Number(e.target.value))}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="output" className="text-xs text-muted-foreground whitespace-nowrap">
                  Output (MT):
                </Label>
                <Input
                  id="output"
                  type="number"
                  className="h-8 w-28 text-xs font-medium"
                  value={annualOutputMT}
                  onChange={(e) => setAnnualOutputMT(Number(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Hero KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Withdrawal */}
          <Card className="relative overflow-hidden border-sky-500/20 bg-gradient-to-br from-card to-sky-950/10">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Water Withdrawal
                </span>
                <div className="p-1.5 rounded-md bg-sky-500/10 text-sky-500">
                  <Waves className="h-4 w-4" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold font-display tracking-tight text-foreground mt-1">
                {overview.totalWithdrawalKL.toLocaleString()}{" "}
                <span className="text-sm font-sans font-normal text-muted-foreground">kL</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                <span>Metered Coverage</span>
                <span className="font-semibold text-sky-600">{overview.meteredPercentage}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Net Water Consumption */}
          <Card className="relative overflow-hidden border-blue-500/20 bg-gradient-to-br from-card to-blue-950/10">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Net Consumption
                </span>
                <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
                  <Droplets className="h-4 w-4" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold font-display tracking-tight text-foreground mt-1">
                {overview.netConsumptionKL.toLocaleString()}{" "}
                <span className="text-sm font-sans font-normal text-muted-foreground">kL</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                <span>Discharged Effluent</span>
                <span className="font-semibold text-blue-600">
                  {overview.totalDischargeKL.toLocaleString()} kL
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Recycling & Circularity */}
          <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-card to-emerald-950/10">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Recycling & Circularity
                </span>
                <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500">
                  <RefreshCw className="h-4 w-4" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold font-display tracking-tight text-foreground mt-1">
                {overview.recycledPercentage}%{" "}
                <span className="text-sm font-sans font-normal text-muted-foreground">reused</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                <span>Reused Volume</span>
                <span className="font-semibold text-emerald-600">
                  {overview.totalRecycledKL.toLocaleString()} kL
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Basin Water Stress */}
          <Card className="relative overflow-hidden border-amber-500/20 bg-gradient-to-br from-card to-amber-950/10">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Stressed Basin Exposure
                </span>
                <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500">
                  <Gauge className="h-4 w-4" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold font-display tracking-tight text-foreground mt-1">
                {overview.highStressPercentage}%{" "}
                <span className="text-sm font-sans font-normal text-muted-foreground">at risk</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                <span>High Stress Intake</span>
                <span className="font-semibold text-amber-600">
                  {overview.highStressWithdrawalKL.toLocaleString()} kL
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analysis Tabs */}
        <Tabs defaultValue="balance" className="space-y-6">
          <TabsList className="grid grid-cols-3 max-w-md">
            <TabsTrigger value="balance">Water Balance</TabsTrigger>
            <TabsTrigger value="sources">Source Split</TabsTrigger>
            <TabsTrigger value="facilities">Facility Matrix</TabsTrigger>
          </TabsList>

          {/* Tab 1: Water Balance & Flows */}
          <TabsContent value="balance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Facility Balance Comparison Bar Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center justify-between">
                    <span>Facility Water Flow & Balance (kL)</span>
                    <Badge variant="outline" className="text-xs font-mono">
                      Withdrawal vs Recycled vs Discharged
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Comparison of intake, direct consumption, and circular effluent recovery across
                    sites.
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[320px] pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={facilityBalanceData}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "rgba(15, 23, 42, 0.9)",
                          borderColor: "rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="Withdrawal" fill="#0284c7" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Recycled" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Discharge" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Intensity & Compliance KPIs */}
              <Card className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    SEBI BRSR Core Intensity
                  </CardTitle>
                  <CardDescription>Mandatory water intensity ratios</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3.5 rounded-lg border bg-muted/40 space-y-1">
                    <div className="text-xs font-medium text-muted-foreground uppercase">
                      Water Intensity per Turnover
                    </div>
                    <div className="text-xl font-bold font-display text-sky-600">
                      {overview.intensityPerCroreTurnover}{" "}
                      <span className="text-xs font-sans font-normal text-muted-foreground">
                        kL / ₹ Cr Turnover
                      </span>
                    </div>
                    <Progress
                      value={Math.min(100, overview.intensityPerCroreTurnover * 20)}
                      className="h-1.5 mt-2"
                    />
                  </div>

                  <div className="p-3.5 rounded-lg border bg-muted/40 space-y-1">
                    <div className="text-xs font-medium text-muted-foreground uppercase">
                      Water Intensity per Output
                    </div>
                    <div className="text-xl font-bold font-display text-emerald-600">
                      {overview.intensityPerTonneOutput}{" "}
                      <span className="text-xs font-sans font-normal text-muted-foreground">
                        kL / MT Finished Good
                      </span>
                    </div>
                    <Progress
                      value={Math.min(100, overview.intensityPerTonneOutput * 30)}
                      className="h-1.5 mt-2"
                    />
                  </div>

                  <div className="p-3.5 rounded-lg border bg-muted/40 space-y-1">
                    <div className="text-xs font-medium text-muted-foreground uppercase">
                      Zero Liquid Discharge (ZLD)
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="default"
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        ZLD Certified Facilities Active
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 2: Source & Discharge Breakdown */}
          <TabsContent value="sources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Water Withdrawal by Source */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    Water Withdrawal by Source
                  </CardTitle>
                  <CardDescription>
                    Surface, Groundwater, Municipal & Rainwater share
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sourceChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={50}
                        paddingAngle={3}
                      >
                        {sourceChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "rgba(15, 23, 42, 0.9)",
                          borderColor: "rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Discharge Destination Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    Discharge Destinations & Treatment
                  </CardTitle>
                  <CardDescription>
                    ETP recycling, CETP conduits & greenbelt irrigation
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dischargeChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={50}
                        paddingAngle={3}
                      >
                        {dischargeChartData.map((entry, index) => (
                          <Cell key={`cell-d-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "rgba(15, 23, 42, 0.9)",
                          borderColor: "rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 3: Facility Risk & Audit Matrix */}
          <TabsContent value="facilities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Facility Water Audit Trail & Basin Stress
                </CardTitle>
                <CardDescription>
                  Auditable facility-by-facility intake, circular recovery, and CGWB aquifer stress
                  status.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Facility & Location</TableHead>
                      <TableHead>Basin Stress</TableHead>
                      <TableHead className="text-right">Withdrawal (kL)</TableHead>
                      <TableHead className="text-right">Discharge (kL)</TableHead>
                      <TableHead className="text-right">Recycled (kL)</TableHead>
                      <TableHead className="text-center">ZLD Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overview.facilitySummaries.map((f, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <div className="font-medium text-foreground">{f.facility}</div>
                          <div className="text-xs text-muted-foreground">{f.location}</div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              f.watershedStress.includes("high")
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            }
                          >
                            {WATER_STRESS_LABELS[f.watershedStress]?.label || f.watershedStress}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {f.totalWithdrawalKL.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">
                          {f.totalDischargeKL.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-emerald-600 font-semibold">
                          {f.totalRecycledKL.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          {f.zldCompliant ? (
                            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px]">
                              ZLD Compliant
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground text-[11px]">
                              ETP Treated
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Activity Ingestion Log Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base font-semibold">Live Water Activity Log</CardTitle>
                  <CardDescription>Individual meter & invoice ledger records</CardDescription>
                </div>
                <Badge variant="secondary">{entries.length} records</Badge>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Facility</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">Withdrawal (kL)</TableHead>
                      <TableHead className="text-right">Recycled (kL)</TableHead>
                      <TableHead>Effluent Quality</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">
                          <div>{entry.facility}</div>
                          <div className="text-xs text-muted-foreground">{entry.location}</div>
                        </TableCell>
                        <TableCell className="text-xs">{entry.period}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {WATER_SOURCE_LABELS[entry.sourceType]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {entry.withdrawalKL.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-emerald-600 font-medium">
                          {entry.recycledKL.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {entry.codMgL ? `COD: ${entry.codMgL} | BOD: ${entry.bodMgL}` : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteEntry(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
