import type { RateSnapshot, Side } from "./types";

export function quoteRate(rate: RateSnapshot | undefined, side: Side) {
  if (!rate) return 0;
  if (side === "sell" && rate.bid) return rate.bid;
  if (side === "buy" && rate.ask) return rate.ask;
  return rate.current;
}
