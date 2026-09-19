import { DEFAULT_WATCHED } from "./currencies";
import { loadNbpRates } from "./nbp";
import { summarizeAll } from "./pnl";
import { getStore } from "./store";
import type { DashboardPayload } from "./types";

export async function buildDashboard(): Promise<DashboardPayload> {
  const store = await getStore();
  const watched = store.watched.length > 0 ? store.watched : [...DEFAULT_WATCHED];
  const needed = [...new Set([...watched, ...store.trades.map((trade) => trade.currency)])];

  try {
    const { asOf, rates, available } = await loadNbpRates(needed);
    const rateMap = Object.fromEntries(rates.map((rate) => [rate.code, rate.current]));
    const { summaries, totals } = summarizeAll(store.trades, rateMap);

    return {
      asOf,
      rates: rates.filter((rate) => watched.includes(rate.code)),
      available,
      watched,
      summaries,
      totals,
      trades: [...store.trades].sort((a, b) => {
        if (a.tradedAt !== b.tradedAt) return b.tradedAt.localeCompare(a.tradedAt);
        return b.createdAt.localeCompare(a.createdAt);
      }),
    };
  } catch (error) {
    const { summaries, totals } = summarizeAll(store.trades, {});
    return {
      asOf: null,
      rates: [],
      available: watched.map((code) => ({ code, name: code })),
      watched,
      summaries,
      totals,
      trades: [...store.trades].sort((a, b) => b.tradedAt.localeCompare(a.tradedAt)),
      error: error instanceof Error ? error.message : "Nie udało się pobrać kursów NBP",
    };
  }
}
