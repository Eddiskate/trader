import type { CurrencySummary, SellPreview, Totals, Trade } from "./types";

function sortTrades(trades: Trade[]) {
  return [...trades].sort((a, b) => {
    if (a.tradedAt !== b.tradedAt) return a.tradedAt.localeCompare(b.tradedAt);
    return a.createdAt.localeCompare(b.createdAt);
  });
}

export function summarizeCurrency(
  trades: Trade[],
  currentRate: number | null,
): CurrencySummary {
  const currency = trades[0]?.currency ?? "";
  let qty = 0;
  let remainingCost = 0;
  let spentPln = 0;
  let receivedPln = 0;
  let realized = 0;
  let boughtForeign = 0;
  let soldForeign = 0;

  for (const trade of sortTrades(trades)) {
    if (trade.side === "buy" || trade.side === "seed" || trade.side === "inflow") {
      qty += trade.foreignAmount;
      remainingCost += trade.plnAmount;
      spentPln += trade.plnAmount;
      boughtForeign += trade.foreignAmount;
      continue;
    }

    receivedPln += trade.plnAmount;
    soldForeign += trade.foreignAmount;

    if (qty <= 1e-12) {
      qty -= trade.foreignAmount;
      remainingCost = 0;
      continue;
    }

    if (trade.foreignAmount <= qty + 1e-12) {
      const avg = remainingCost / qty;
      const cost = trade.foreignAmount * avg;
      realized += trade.plnAmount - cost;
      remainingCost -= cost;
      qty -= trade.foreignAmount;
      if (qty < 1e-10) {
        qty = 0;
        remainingCost = 0;
      }
      continue;
    }

    const avg = remainingCost / qty;
    const knownCost = qty * avg;
    const knownShare = qty / trade.foreignAmount;
    realized += trade.plnAmount * knownShare - knownCost;
    qty -= trade.foreignAmount;
    remainingCost = 0;
  }

  const holding = Math.max(qty, 0);
  const avgCost = holding > 0 ? remainingCost / holding : 0;
  const marketValue =
    currentRate != null && holding > 0 ? holding * currentRate : 0;
  const unrealized =
    currentRate != null && holding > 0 ? marketValue - remainingCost : 0;

  return {
    currency,
    holding,
    avgCost,
    spentPln,
    receivedPln,
    realized,
    unrealized,
    marketValue,
    remainingCost,
    boughtForeign,
    soldForeign,
    oversold: qty < -1e-10,
  };
}

export function summarizeAll(
  trades: Trade[],
  rates: Record<string, number>,
): { summaries: CurrencySummary[]; totals: Totals } {
  const byCurrency = new Map<string, Trade[]>();
  for (const trade of trades) {
    const list = byCurrency.get(trade.currency) ?? [];
    list.push(trade);
    byCurrency.set(trade.currency, list);
  }

  const summaries = [...byCurrency.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([code, list]) => summarizeCurrency(list, rates[code] ?? null));

  const totals = summaries.reduce<Totals>(
    (acc, row) => ({
      spentPln: acc.spentPln + row.spentPln,
      receivedPln: acc.receivedPln + row.receivedPln,
      realized: acc.realized + row.realized,
      unrealized: acc.unrealized + row.unrealized,
      marketValue: acc.marketValue + row.marketValue,
      remainingCost: acc.remainingCost + row.remainingCost,
    }),
    {
      spentPln: 0,
      receivedPln: 0,
      realized: 0,
      unrealized: 0,
      marketValue: 0,
      remainingCost: 0,
    },
  );

  return { summaries, totals };
}

export function previewSell(
  summary: CurrencySummary | undefined,
  amount: number,
  rate: number,
): SellPreview | null {
  if (!Number.isFinite(amount) || !Number.isFinite(rate) || amount <= 0 || rate <= 0) {
    return null;
  }

  const proceeds = amount * rate;
  if (!summary || summary.holding <= 1e-12) {
    return {
      proceeds,
      profit: null,
      avgCost: null,
      covered: 0,
      warning: "no-inventory",
    };
  }

  const covered = Math.min(amount, summary.holding);
  const profit = covered * (rate - summary.avgCost);

  return {
    proceeds,
    profit,
    avgCost: summary.avgCost,
    covered,
    warning: covered + 1e-12 < amount ? "partial" : "ok",
  };
}
