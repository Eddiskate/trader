export type Side = "buy" | "sell" | "seed" | "inflow";

export type Trade = {
  id: string;
  currency: string;
  side: Side;
  foreignAmount: number;
  rate: number;
  plnAmount: number;
  tradedAt: string;
  note: string;
  createdAt: string;
};

export type Store = {
  watched: string[];
  trades: Trade[];
};

export type RateLevel = "niski" | "raczej-niski" | "sredni" | "raczej-wysoki" | "wysoki";

export type RateSnapshot = {
  code: string;
  name: string;
  current: number;
  date: string;
  min: number;
  max: number;
  avg: number;
  percentile: number;
  level: RateLevel;
  hint: "kupuj" | "sprzedawaj" | "czekaj";
};

export type CurrencySummary = {
  currency: string;
  holding: number;
  avgCost: number;
  spentPln: number;
  receivedPln: number;
  realized: number;
  unrealized: number;
  marketValue: number;
  remainingCost: number;
  boughtForeign: number;
  soldForeign: number;
  oversold: boolean;
};

export type Totals = {
  spentPln: number;
  receivedPln: number;
  realized: number;
  unrealized: number;
  marketValue: number;
  remainingCost: number;
};

export type SellPreview = {
  proceeds: number;
  profit: number | null;
  avgCost: number | null;
  covered: number;
  warning: "ok" | "no-inventory" | "partial";
};

export type DashboardPayload = {
  asOf: string | null;
  rates: RateSnapshot[];
  available: { code: string; name: string }[];
  watched: string[];
  summaries: CurrencySummary[];
  totals: Totals;
  trades: Trade[];
  error?: string;
};
