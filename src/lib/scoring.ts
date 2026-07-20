import type { Fit, LeadPayload } from "@/lib/types";

export function scoreLead(payload: LeadPayload): { score: number; fit: Fit } {
  let score = 0;
  if (payload.budgetReady) score += 25;
  if (payload.roleReady) score += 25;
  if (payload.longTermReady) score += 20;
  if (payload.timeReady) score += 10;
  if (payload.ethicsConfirmed) score += 10;
  if (payload.proof && payload.proof.length >= 20) score += 5;
  if (payload.currentClients && payload.currentClients.length >= 10) score += 5;

  const fit: Fit = score >= 75 ? "qualified" : score >= 50 ? "conditional" : "not_fit";
  return { score, fit };
}
