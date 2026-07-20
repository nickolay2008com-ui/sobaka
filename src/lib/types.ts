export type Fit = "qualified" | "conditional" | "not_fit";

export type LeadPayload = {
  sessionId: string;
  name: string;
  email: string;
  messenger?: string;
  niche: string;
  projectSummary: string;
  proof?: string;
  currentClients?: string;
  budgetReady: boolean;
  roleReady: boolean;
  longTermReady: boolean;
  timeReady: boolean;
  ethicsConfirmed: boolean;
  consent: boolean;
  answers?: Record<string, unknown>;
};

export type DashboardResponse = {
  rangeDays: number;
  metrics: {
    visitors: number;
    partnershipViews: number;
    applyStarts: number;
    submissions: number;
    qualified: number;
    conversion: number;
  };
  funnel: Array<{ label: string; value: number; rate: number }>;
  sources: Array<{ source: string; visitors: number; leads: number }>;
  daily: Array<{ day: string; visitors: number; leads: number }>;
  leads: Array<{
    id: string;
    createdAt: string;
    name: string;
    email: string;
    messenger: string;
    niche: string;
    projectSummary: string;
    score: number;
    fit: Fit;
    status: string;
    adminNotes: string;
  }>;
};
