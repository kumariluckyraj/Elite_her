export type Insurer = {
  id: string;
  name: string;
  short: string;
  accent: string;
};

export const INSURERS: Insurer[] = [
  { id: "star-health", name: "Star Health and Allied Insurance", short: "Star Health", accent: "#E11D48" },
  { id: "hdfc-ergo", name: "HDFC ERGO General Insurance", short: "HDFC ERGO", accent: "#004C8F" },
  { id: "icici-lombard", name: "ICICI Lombard General Insurance", short: "ICICI Lombard", accent: "#A6192E" },
  { id: "niva-bupa", name: "Niva Bupa Health Insurance", short: "Niva Bupa", accent: "#0072CE" },
  { id: "care-health", name: "Care Health Insurance", short: "Care Health", accent: "#00A551" },
  { id: "tata-aig", name: "Tata AIG General Insurance", short: "Tata AIG", accent: "#1E4DA1" },
  { id: "bajaj-allianz", name: "Bajaj Allianz General Insurance", short: "Bajaj Allianz", accent: "#003DA5" },
  { id: "new-india", name: "The New India Assurance", short: "New India Assurance", accent: "#0066B3" },
  { id: "oriental", name: "Oriental Insurance", short: "Oriental Insurance", accent: "#C8102E" },
  { id: "united-india", name: "United India Insurance", short: "United India", accent: "#1B458F" },
  { id: "national", name: "National Insurance", short: "National Insurance", accent: "#005DAA" },
  { id: "manipal-cigna", name: "ManipalCigna Health Insurance", short: "ManipalCigna", accent: "#0033A0" },
  { id: "aditya-birla", name: "Aditya Birla Health Insurance", short: "Aditya Birla Health", accent: "#E0182D" },
  { id: "reliance-general", name: "Reliance General Insurance", short: "Reliance General", accent: "#00529B" },
  { id: "sbi-general", name: "SBI General Insurance", short: "SBI General", accent: "#22409A" },
];

export function findInsurer(id: string): Insurer | undefined {
  return INSURERS.find((i) => i.id === id);
}

export const POLICY_DOC_TYPES = [
  { id: "primary", label: "Policy document (primary)", required: true },
  { id: "endorsement", label: "Endorsement / addendum", required: false },
  { id: "previous_year", label: "Previous-year policy (for continuity)", required: false },
] as const;

export const CASE_DOC_TYPES = [
  { id: "discharge_summary", label: "Discharge summary", required: true },
  { id: "hospital_bill", label: "Hospital bill / final invoice", required: true },
  { id: "diagnostic_reports", label: "Diagnostic reports (lab, scans)", required: false },
  { id: "prescription", label: "Doctor's prescription", required: false },
  { id: "preauth", label: "Pre-authorization form", required: false },
] as const;

export type PolicyDocTypeId = (typeof POLICY_DOC_TYPES)[number]["id"];
export type CaseDocTypeId = (typeof CASE_DOC_TYPES)[number]["id"];
