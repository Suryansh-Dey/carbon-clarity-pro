import { CalculationRow } from "./calculations.functions";

export type BrsrCoreMetrics = {
  companyName: string;
  financialYear: string;
  scope1Tonnes: number;
  scope2Tonnes: number;
  scope3Tonnes: number;
  totalGhgTonnes: number;
  totalEnergyMWh: number;
  renewableEnergyMWh: number;
  renewablePercentage: number;
  ghgIntensityPerCroreTurnover: number; // t CO2e / ₹ Crore
  ghgIntensityPerTonneOutput: number; // t CO2e / MT physical product
  cbamSpecificEmbeddedEmissions: number; // t CO2e / tonne steel/aluminium
};

/**
 * Calculates SEBI BRSR Principle 6 Core Metrics and CBAM embedded emission factors
 * from the organization's verified activity ledger.
 */
export function calculateBrsrMetrics(
  rows: CalculationRow[],
  turnoverCrores: number = 100,
  annualOutputTonnes: number = 5000,
): BrsrCoreMetrics {
  let s1Kg = 0;
  let s2Kg = 0;
  let s3Kg = 0;
  let totalEnergyKwh = 0;
  let renewableKwh = 0;
  let materialTonnes = 0;

  for (const r of rows) {
    const kg = Number(r.co2e_kg) || 0;
    const scopeStr = (r.scope || "").toLowerCase();
    const prodLower = (r.product_name || "").toLowerCase();

    if (
      scopeStr.includes("stationary") ||
      scopeStr.includes("mobile") ||
      scopeStr.includes("fugitive") ||
      scopeStr === "scope 1"
    ) {
      s1Kg += kg;
      // Convert fuel volume to energy (approx 10 kWh/litre for diesel)
      if (r.unit === "litre") {
        totalEnergyKwh += (r.quantity || 0) * 10;
      }
    } else if (scopeStr.includes("electricity") || scopeStr === "scope 2") {
      s2Kg += kg;
      if (r.unit === "kWh") {
        totalEnergyKwh += r.quantity || 0;
        if (prodLower.includes("solar") || prodLower.includes("wind") || prodLower.includes("renewable") || prodLower.includes("green")) {
          renewableKwh += r.quantity || 0;
        }
      }
    } else {
      s3Kg += kg;
      if (r.unit === "tonne" && (prodLower.includes("steel") || prodLower.includes("aluminium") || prodLower.includes("metal"))) {
        materialTonnes += r.quantity || 0;
      }
    }
  }

  const s1T = s1Kg / 1000;
  const s2T = s2Kg / 1000;
  const s3T = s3Kg / 1000;
  const totalT = s1T + s2T + s3T;

  const totalMWh = totalEnergyKwh / 1000;
  const renMWh = renewableKwh / 1000;
  const renPct = totalMWh > 0 ? (renMWh / totalMWh) * 100 : 0;

  const intensityTurnover = turnoverCrores > 0 ? totalT / turnoverCrores : 0;
  const intensityOutput = annualOutputTonnes > 0 ? totalT / annualOutputTonnes : 0;
  const cbamEmbedded = materialTonnes > 0 ? (s1T + s2T) / materialTonnes : intensityOutput;

  return {
    companyName: rows[0]?.company || "Climate Social Mumbai",
    financialYear: `FY 2026-27`,
    scope1Tonnes: parseFloat(s1T.toFixed(2)),
    scope2Tonnes: parseFloat(s2T.toFixed(2)),
    scope3Tonnes: parseFloat(s3T.toFixed(2)),
    totalGhgTonnes: parseFloat(totalT.toFixed(2)),
    totalEnergyMWh: parseFloat(totalMWh.toFixed(2)),
    renewableEnergyMWh: parseFloat(renMWh.toFixed(2)),
    renewablePercentage: parseFloat(renPct.toFixed(1)),
    ghgIntensityPerCroreTurnover: parseFloat(intensityTurnover.toFixed(3)),
    ghgIntensityPerTonneOutput: parseFloat(intensityOutput.toFixed(3)),
    cbamSpecificEmbeddedEmissions: parseFloat(cbamEmbedded.toFixed(3)),
  };
}

/**
 * Generates and triggers download of the SEBI BRSR Principle 6 Core Disclosures CSV file.
 */
export function downloadBrsrCoreCsv(metrics: BrsrCoreMetrics) {
  const csvContent = `========================================================================================
SEBI BRSR CORE DISCLOSURES — PRINCIPLE 6 (ENVIRONMENT & GHG EMISSIONS)
Platform: clisomumbai.com (Climate Social Mumbai)
Reporting Entity: ${metrics.companyName}
Reporting Financial Year: ${metrics.financialYear}
Date of Generation: ${new Date().toISOString().split("T")[0]}
Assurance Alignment: ASSA 5010 / SEBI Circular SEBI/HO/CFD/CFD-SEC-2/P/CIR/2023/122
========================================================================================

PARAMETER,DISCLOSURE VALUE,UNIT,METHODOLOGY / STANDARD
1. Scope 1 Direct Emissions,${metrics.scope1Tonnes},Metric Tonnes CO2e,IPCC 2006 / GHG Protocol
2. Scope 2 Indirect Electricity Emissions,${metrics.scope2Tonnes},Metric Tonnes CO2e,India CEA Baseline Database v22.0 (0.675 kg CO2/kWh)
3. Scope 3 Value Chain Emissions,${metrics.scope3Tonnes},Metric Tonnes CO2e,DEFRA 2024 / GHG Protocol Scope 3 Standard
4. TOTAL CORPORATE GHG INVENTORY,${metrics.totalGhgTonnes},Metric Tonnes CO2e,Verified ASSA 5010 Physical Trail
5. Total Energy Consumption,${metrics.totalEnergyMWh},Megawatt-Hours (MWh),Fuel & Grid Invoices
6. Total Renewable Energy Consumption,${metrics.renewableEnergyMWh},Megawatt-Hours (MWh),Solar PPA / Rooftop Captive
7. Renewable Energy Share,${metrics.renewablePercentage},%,(Renewable MWh / Total MWh) * 100
8. GHG Emission Intensity (Turnover Basis),${metrics.ghgIntensityPerCroreTurnover},t CO2e / ₹ Crore Turnover,SEBI BRSR Core Key Performance Indicator
9. GHG Emission Intensity (Physical Output Basis),${metrics.ghgIntensityPerTonneOutput},t CO2e / MT Finished Product,SEBI BRSR Core Key Performance Indicator
10. EU CBAM Specific Embedded Emissions,${metrics.cbamSpecificEmbeddedEmissions},t CO2e / MT Product,EU Regulation 2023/956 (CBAM)
`;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `SEBI-BRSR-Core-Principle-6-${metrics.companyName.replace(/\s+/g, "_")}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
