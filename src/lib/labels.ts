import type { RateLevel, Side } from "./types";

export const SIDE_LABEL: Record<Side, string> = {
  buy: "Kupno",
  sell: "Sprzedaż",
  inflow: "Wpływ",
  seed: "Stan",
};

export const LEVEL_LABEL: Record<RateLevel, string> = {
  niski: "niski",
  "raczej-niski": "raczej niski",
  sredni: "średni",
  "raczej-wysoki": "raczej wysoki",
  wysoki: "wysoki",
};

export const HINT_LABEL = {
  kupuj: "Dobry moment na zakup waluty",
  sprzedawaj: "Dobry moment na sprzedaż waluty",
  czekaj: "Kurs w środku zakresu — bez presji",
} as const;
