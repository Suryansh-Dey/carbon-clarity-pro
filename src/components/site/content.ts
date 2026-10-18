import type { LinkProps } from "@tanstack/react-router";

/** Pages hosted on the original CliSo website that are not part of this app. */
const REF = "https://cliso-tech.masgptp.chatgpt.site";
export const SMART_DECARB_URL = `${REF}/smart.html`;
export const CLIMATE_RISK_URL = `${REF}/climate-risk/`;
export const GLOBAL_RISK_URL = `${REF}/global-risk.html`;

export type Product = {
  title: string;
  body: string;
  cta: string;
  to?: LinkProps["to"];
  hash?: string;
  href?: string;
};

export const PRODUCTS: Product[] = [
  {
    title: "ESG & Decarbonization Technology",
    body: "Scope 1, 2 and 3 accounting across business units and locations, with five-level roadmaps, investment visibility and projected returns.",
    cta: "Explore the interactive tool",
    href: SMART_DECARB_URL,
  },
  {
    title: "Environmental & Social Due Diligence",
    body: "Risk screening, gap assessments and action plans aligned with applicable law, lender requirements and international frameworks.",
    cta: "Explore E&S frameworks",
    to: "/services",
    hash: "esdd",
  },
  {
    title: "Climate & ESG Advisory",
    body: "Climate risk, sustainability disclosures, rating support, assurance readiness and regulatory compliance, connected to a practical delivery plan.",
    cta: "Explore consulting services",
    to: "/services",
    hash: "consulting",
  },
  {
    title: "Capacity Building",
    body: "Tailored learning from board to field and field to board, connecting strategic direction, operational skills and stakeholder feedback.",
    cta: "Build organisational capacity",
    to: "/services",
    hash: "consulting",
  },
  {
    title: "CSR & Last-Mile Impact",
    body: "Programme design, implementation, monitoring and impact assessment to support meaningful outcomes for communities.",
    cta: "Discuss your impact goals",
    to: "/services",
    hash: "consulting",
  },
];

export const SECTORS = [
  {
    key: "enterprise",
    tab: "MSMEs & value chains",
    title: "MSMEs & value chains",
    body: "Make sustainability accessible through proportionate emissions accounting, practical roadmaps, supplier engagement and capacity building.",
  },
  {
    key: "finance",
    tab: "Banking & NBFCs",
    title: "Banking, NBFCs & financial institutions",
    body: "Connect environmental and social due diligence with financing decisions, climate risk assessment and portfolio action plans.",
  },
  {
    key: "tech",
    tab: "IT & semiconductors",
    title: "IT, electronics & semiconductors",
    body: "Assess energy, resource use and value-chain emissions, with lifecycle perspectives and evidence for sustainability disclosures.",
  },
  {
    key: "retail",
    tab: "FMCG & retail",
    title: "FMCG, retail & food systems",
    body: "Understand emissions across manufacturing, logistics, stores and suppliers; prioritise resource efficiency and sustainable value-chain practices.",
  },
  {
    key: "industry",
    tab: "Industry & energy",
    title: "Industry, manufacturing & energy",
    body: "Support decarbonization and climate risk assessment across power, steel, chemicals, oil and gas, and industrial operations.",
  },
  {
    key: "public",
    tab: "Public & development",
    title: "Public sector & development institutions",
    body: "Connect project safeguards, capacity building and stakeholder engagement with resilient development and measurable community impact.",
  },
] as const;
