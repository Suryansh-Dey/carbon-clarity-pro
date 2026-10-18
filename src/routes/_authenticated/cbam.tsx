import { AppShell } from "@/components/app/app-shell";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Globe,
  FileCode2,
  FileText,
  Plus,
  Shield,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Layers,
  Sparkles,
  Download,
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
  HSN_CN_DATABASE,
  SAMPLE_CBAM_DECLARATIONS,
  CbamQuarterlyDeclaration,
  calculateCbamMetrics,
  downloadCbamXmlFile,
  exportCbamDeclarationPdf,
} from "@/lib/cbam";

export const Route = createFileRoute("/_authenticated/cbam")({
  component: CbamPage,
  head: () => ({
    meta: [
      { title: "EU CBAM Hub & XML Generator — clisomumbai" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function CbamPage() {
  const [declarations, setDeclarations] =
    useState<CbamQuarterlyDeclaration[]>(SAMPLE_CBAM_DECLARATIONS);
  const [hsnSearch, setHsnSearch] = useState("");
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);

  // Form State
  const [selectedHsn, setSelectedHsn] = useState("7208");
  const [quarter, setQuarter] = useState("Q2");
  const [year, setYear] = useState(2026);
  const [declarantName, setDeclarantName] = useState("EuroTrade Import Logistics BV");
  const [declarantEori, setDeclarantEori] = useState("NL987654321000");
  const [installationName, setInstallationName] = useState("Maharashtra Steel Works Plant 2");
  const [unlocode, setUnlocode] = useState("INBOM");
  const [quantityTonnes, setQuantityTonnes] = useState(5000);
  const [productionRoute, setProductionRoute] = useState(
    "Blast Furnace - Basic Oxygen Furnace (BF-BOF)",
  );
  const [directScope1, setDirectScope1] = useState(6250);
  const [powerMWh, setPowerMWh] = useState(2500);
  const [precursorCO2e, setPrecursorCO2e] = useState(1250);
  const [cctsPaidInr, setCctsPaidInr] = useState(2500000);

  // Filtered HSN database
  const filteredHsnList = useMemo(() => {
    if (!hsnSearch.trim()) return HSN_CN_DATABASE;
    const q = hsnSearch.toLowerCase();
    return HSN_CN_DATABASE.filter(
      (m) =>
        m.hsnCode.includes(q) ||
        m.cnCode.toLowerCase().includes(q) ||
        m.productName.toLowerCase().includes(q) ||
        m.sector.toLowerCase().includes(q),
    );
  }, [hsnSearch]);

  const selectedMapping = useMemo(
    () => HSN_CN_DATABASE.find((m) => m.hsnCode === selectedHsn) || HSN_CN_DATABASE[0],
    [selectedHsn],
  );

  const calculatedPreview = useMemo(
    () =>
      calculateCbamMetrics({
        quantityTonnes,
        directScope1Tonnes: directScope1,
        electricityMWh: powerMWh,
        precursorTonnesCO2e: precursorCO2e,
        carbonPricePaidInr: cctsPaidInr,
      }),
    [quantityTonnes, directScope1, powerMWh, precursorCO2e, cctsPaidInr],
  );

  const handleCreateDeclaration = () => {
    if (!declarantName.trim() || quantityTonnes <= 0) {
      toast.error("Please provide valid declarant details and export quantity.");
      return;
    }

    const newDecl: CbamQuarterlyDeclaration = {
      id: `cbam-${year}-${quarter.toLowerCase()}-${Date.now().toString().slice(-4)}`,
      quarter,
      year,
      declarantName,
      declarantEori,
      installationName,
      installationCountry: "IN",
      installationUnlocode: unlocode,
      cnCode: selectedMapping.cnCode,
      hsnCode: selectedMapping.hsnCode,
      productName: selectedMapping.productName,
      quantityTonnes,
      productionRoute,
      directEmissionsTCO2e: calculatedPreview.directScope1Tonnes,
      indirectEmissionsTCO2e: calculatedPreview.indirectScope2Tonnes,
      precursorEmissionsTCO2e: calculatedPreview.precursorTonnesCO2e,
      totalSpecificEmbeddedEmissions: calculatedPreview.specificEmbeddedEmissions,
      carbonPricePaidInOriginInr: cctsPaidInr,
      carbonPriceDeductionEur: calculatedPreview.carbonPriceDeductionEur,
      effectiveCbamLiabilityEur: calculatedPreview.netCbamLiabilityEur,
      status: "VALIDATED",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setDeclarations([newDecl, ...declarations]);
    setIsNewDialogOpen(false);
    toast.success("Created and validated new quarterly CBAM declaration.");
  };

  const handleDeleteDeclaration = (id: string) => {
    setDeclarations(declarations.filter((d) => d.id !== id));
    toast.info("Deleted declaration from register.");
  };

  const totalExportedTonnes = declarations.reduce((s, d) => s + d.quantityTonnes, 0);
  const totalLiabilityEur = declarations.reduce((s, d) => s + d.effectiveCbamLiabilityEur, 0);
  const totalCctsSavedEur = declarations.reduce((s, d) => s + d.carbonPriceDeductionEur, 0);

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header & Controls */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl md:text-3xl font-medium tracking-tight">
                    EU CBAM Hub &amp; XML Declarations
                  </h1>
                  <Badge
                    variant="outline"
                    className="bg-primary/5 text-primary border-primary/20 text-[11px] font-mono"
                  >
                    DG TAXUD v1.0
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Calculate specific embedded emissions ($SEE$), map Indian HSN to European CN
                  codes, and export compliant XMLs.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 text-xs font-medium h-9">
                  <Plus className="h-4 w-4" /> New Quarterly Declaration
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 font-display text-xl">
                    <Globe className="h-5 w-5 text-primary" /> Create CBAM Quarterly Report
                  </DialogTitle>
                  <DialogDescription>
                    Enter factory shipment data and precursor activity to generate a validated DG
                    TAXUD XML declaration.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Product &amp; HSN Mapping *</Label>
                      <Select value={selectedHsn} onValueChange={setSelectedHsn}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {HSN_CN_DATABASE.map((m) => (
                            <SelectItem key={m.hsnCode} value={m.hsnCode}>
                              HSN {m.hsnCode} → CN {m.cnCode} ({m.productName.slice(0, 32)}…)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Reporting Period</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Select value={quarter} onValueChange={setQuarter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Q1">Q1 (Jan-Mar)</SelectItem>
                            <SelectItem value="Q2">Q2 (Apr-Jun)</SelectItem>
                            <SelectItem value="Q3">Q3 (Jul-Sep)</SelectItem>
                            <SelectItem value="Q4">Q4 (Oct-Dec)</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          value={year}
                          onChange={(e) => setYear(Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">EU Importer / Declarant Name *</Label>
                      <Input
                        placeholder="e.g. EuroSteel Logistics NV"
                        value={declarantName}
                        onChange={(e) => setDeclarantName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Declarant EORI Number *</Label>
                      <Input
                        placeholder="e.g. NL123456789012"
                        value={declarantEori}
                        onChange={(e) => setDeclarantEori(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Manufacturing Installation Name</Label>
                      <Input
                        value={installationName}
                        onChange={(e) => setInstallationName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">UN/LOCODE</Label>
                      <Input value={unlocode} onChange={(e) => setUnlocode(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Export Quantity (Metric Tonnes) *</Label>
                      <Input
                        type="number"
                        value={quantityTonnes}
                        onChange={(e) => setQuantityTonnes(Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Production Technology Route</Label>
                      <Input
                        value={productionRoute}
                        onChange={(e) => setProductionRoute(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Embedded Emissions Activity Inputs */}
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                      Embedded Emissions Input Ledger
                    </span>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[11px]">Direct Scope 1 (tCO₂e)</Label>
                        <Input
                          type="number"
                          className="h-8 text-xs"
                          value={directScope1}
                          onChange={(e) => setDirectScope1(Number(e.target.value))}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px]">Electricity (MWh)</Label>
                        <Input
                          type="number"
                          className="h-8 text-xs"
                          value={powerMWh}
                          onChange={(e) => setPowerMWh(Number(e.target.value))}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px]">Precursor Carbon (tCO₂e)</Label>
                        <Input
                          type="number"
                          className="h-8 text-xs"
                          value={precursorCO2e}
                          onChange={(e) => setPrecursorCO2e(Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-[11px]">India CCTS Carbon Price Paid (₹)</Label>
                        <Input
                          type="number"
                          className="h-8 w-44 text-xs font-mono"
                          value={cctsPaidInr}
                          onChange={(e) => setCctsPaidInr(Number(e.target.value))}
                        />
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-muted-foreground block">
                          Specific Embedded Intensity ($SEE$)
                        </span>
                        <span className="font-display text-lg font-semibold text-primary">
                          {calculatedPreview.specificEmbeddedEmissions}{" "}
                          <span className="text-xs font-normal font-sans text-muted-foreground">
                            tCO₂e / t
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateDeclaration} className="font-medium text-xs">
                    Generate &amp; Validate Declaration
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* KPI Top Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 rounded-2xl border-border bg-card">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block">
              Total Declared Shipments
            </span>
            <div className="font-display text-3xl font-medium text-foreground mt-1">
              {totalExportedTonnes.toLocaleString()}{" "}
              <span className="text-sm font-sans text-muted-foreground font-normal">MT</span>
            </div>
            <span className="text-xs text-muted-foreground mt-1 block">
              Across {declarations.length} active EU filings
            </span>
          </Card>

          <Card className="p-5 rounded-2xl border-border bg-card">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block">
              Net CBAM Certificate Payable
            </span>
            <div className="font-display text-3xl font-medium text-foreground mt-1">
              €{totalLiabilityEur.toLocaleString()}
            </div>
            <span className="text-xs text-muted-foreground mt-1 block">
              At €69 / t EU ETS benchmark rate
            </span>
          </Card>

          <Card className="p-5 rounded-2xl border-border bg-card">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block">
              CCTS Domestic Deduction (Art. 9)
            </span>
            <div className="font-display text-3xl font-medium text-emerald-700 mt-1">
              €{totalCctsSavedEur.toLocaleString()}
            </div>
            <span className="text-xs text-emerald-700/80 mt-1 block">
              Credited from Indian carbon price
            </span>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="declarations" className="space-y-6">
          <TabsList className="grid grid-cols-2 max-w-sm">
            <TabsTrigger value="declarations">Quarterly Declarations</TabsTrigger>
            <TabsTrigger value="hsn">HSN ↔ CN Catalog</TabsTrigger>
          </TabsList>

          {/* Tab 1: Declarations Register */}
          <TabsContent value="declarations" className="space-y-6">
            <Card className="rounded-2xl border-border bg-card overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="font-display text-lg font-medium">
                    Active EU CBAM Filings Register
                  </CardTitle>
                  <CardDescription>
                    Validated quarterly declarations with 1-click XML download.
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="font-mono text-xs">
                  {declarations.length} declarations
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period &amp; Product</TableHead>
                      <TableHead>Declarant (EORI)</TableHead>
                      <TableHead className="text-right">Export Qty</TableHead>
                      <TableHead className="text-right">SEE (t/t)</TableHead>
                      <TableHead className="text-right">Net Liability</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Exports</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {declarations.map((decl) => (
                      <TableRow key={decl.id}>
                        <TableCell>
                          <div className="font-medium text-foreground">{decl.productName}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {decl.quarter} {decl.year} · CN {decl.cnCode}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-medium">{decl.declarantName}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {decl.declarantEori}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {decl.quantityTonnes.toLocaleString()} MT
                        </TableCell>
                        <TableCell className="text-right font-mono text-primary font-semibold">
                          {decl.totalSpecificEmbeddedEmissions.toFixed(3)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          €{decl.effectiveCbamLiabilityEur.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={
                              decl.status === "VALIDATED"
                                ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                                : "bg-muted text-muted-foreground"
                            }
                          >
                            {decl.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs gap-1"
                              onClick={() => downloadCbamXmlFile(decl)}
                            >
                              <FileCode2 className="h-3.5 w-3.5 text-primary" /> XML
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs gap-1"
                              onClick={() => exportCbamDeclarationPdf(decl)}
                            >
                              <FileText className="h-3.5 w-3.5 text-primary" /> PDF
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteDeclaration(decl.id)}
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

          {/* Tab 2: HSN ↔ CN Code Mapping Catalog */}
          <TabsContent value="hsn" className="space-y-6">
            <Card className="rounded-2xl border-border bg-card">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="font-display text-lg font-medium">
                    Indian HSN ↔ European Combined Nomenclature (CN) Mapping Engine
                  </CardTitle>
                  <CardDescription>
                    Official European Commission commodity codes and benchmark comparison.
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
                  <Input
                    placeholder="Search HSN / CN / Product..."
                    className="pl-9 h-9 text-xs"
                    value={hsnSearch}
                    onChange={(e) => setHsnSearch(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Indian HSN</TableHead>
                      <TableHead>EU CN Code</TableHead>
                      <TableHead>Commodity Description</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead className="text-right">EU Default Benchmark</TableHead>
                      <TableHead className="text-right">Typical Indian Factory</TableHead>
                      <TableHead className="text-center">Precursors</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHsnList.map((m) => (
                      <TableRow key={m.hsnCode + m.cnCode}>
                        <TableCell className="font-mono font-semibold text-primary">
                          {m.hsnCode}
                        </TableCell>
                        <TableCell className="font-mono font-medium">{m.cnCode}</TableCell>
                        <TableCell className="max-w-xs text-xs">{m.productName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize text-[10px]">
                            {m.sector.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-muted-foreground">
                          {m.defaultEuBenchmarkSEE.toFixed(2)} t/t
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-emerald-700 font-semibold">
                          {m.typicalIndianSEE.toFixed(2)} t/t
                        </TableCell>
                        <TableCell className="text-center text-xs">
                          {m.precursorRequired ? (
                            <Badge variant="secondary" className="text-[10px]">
                              Required
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
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
