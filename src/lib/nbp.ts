import { currencyName } from "./currencies";
import type { RateLevel, RateSnapshot } from "./types";

type NbpRate = {
  code: string;
  currency: string;
  mid: number;
};

type NbpTable = {
  effectiveDate: string;
  rates: NbpRate[];
};

const NBP_TABLE = "https://api.nbp.pl/api/exchangerates/tables/A/last/67/?format=json";

function levelFromPercentile(percentile: number): RateLevel {
  if (percentile <= 20) return "niski";
  if (percentile <= 35) return "raczej-niski";
  if (percentile <= 65) return "sredni";
  if (percentile <= 80) return "raczej-wysoki";
  return "wysoki";
}

function hintFromLevel(level: RateLevel): RateSnapshot["hint"] {
  if (level === "niski" || level === "raczej-niski") return "kupuj";
  if (level === "wysoki" || level === "raczej-wysoki") return "sprzedawaj";
  return "czekaj";
}

function snapshot(code: string, name: string, series: { date: string; mid: number }[]): RateSnapshot | null {
  if (series.length === 0) return null;
  const current = series[series.length - 1];
  const values = series.map((row) => row.mid);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
  const below = values.filter((value) => value < current.mid).length;
  const percentile = values.length <= 1 ? 50 : (below / (values.length - 1)) * 100;
  const level = levelFromPercentile(percentile);

  return {
    code,
    name,
    current: current.mid,
    date: current.date,
    min,
    max,
    avg,
    percentile,
    level,
    hint: hintFromLevel(level),
  };
}

export async function loadNbpRates(codes: string[]) {
  const response = await fetch(NBP_TABLE, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 * 60 },
  });

  if (!response.ok) {
    throw new Error(`NBP zwróciło ${response.status}`);
  }

  const tables = (await response.json()) as NbpTable[];
  const wanted = new Set(codes.map((code) => code.toUpperCase()));
  const series = new Map<string, { date: string; mid: number }[]>();
  const available = new Map<string, string>();

  for (const table of tables) {
    for (const rate of table.rates) {
      available.set(rate.code, currencyName(rate.code) || rate.currency);
      if (!wanted.has(rate.code)) continue;
      const list = series.get(rate.code) ?? [];
      list.push({ date: table.effectiveDate, mid: rate.mid });
      series.set(rate.code, list);
    }
  }

  const rates = codes
    .map((code) => {
      const rows = series.get(code);
      if (!rows) return null;
      return snapshot(code, available.get(code) ?? currencyName(code), rows);
    })
    .filter((row): row is RateSnapshot => row !== null);

  const asOf = tables.at(-1)?.effectiveDate ?? null;

  return {
    asOf,
    rates,
    available: [...available.entries()]
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.code.localeCompare(b.code)),
  };
}
