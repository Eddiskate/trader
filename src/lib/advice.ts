import type { RateSnapshot } from "./types";

export type PaydayVerdict = "wymieniaj" | "trzymaj" | "poczekaj";

export type PaydayAdvice = {
  verdict: PaydayVerdict;
  title: string;
  reason: string;
  sellRate: number;
  nowPln: number;
  vsAvg: number;
  vsMax: number;
  percentile: number;
};

export function paydayAdvice(
  rate: RateSnapshot,
  amount: number,
): PaydayAdvice | null {
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const sellRate = rate.bid ?? rate.current;
  const nowPln = amount * sellRate;
  const vsAvg = nowPln - amount * rate.avg;
  const vsMax = amount * rate.max - nowPln;
  const percentile = Math.round(rate.percentile);

  if (rate.percentile >= 75) {
    return {
      verdict: "wymieniaj",
      title: "Wymieniaj dziś",
      reason: `${rate.code}/PLN jest wysoko (${percentile}. percentyl z 67 sesji). Za te euro dostaniesz więcej złotych niż zwykle — składując czekasz na jeszcze wyższy kurs, którego może nie być.`,
      sellRate,
      nowPln,
      vsAvg,
      vsMax,
      percentile,
    };
  }

  if (rate.percentile <= 35) {
    return {
      verdict: "trzymaj",
      title: "Składuj na koncie euro",
      reason: `Kurs jest niski (${percentile}. percentyl). Wymiana dziś da mniej PLN niż średnia z ~3 miesięcy. Trzymaj euro i sprzedaj, gdy karty pokażą wysoki.`,
      sellRate,
      nowPln,
      vsAvg,
      vsMax,
      percentile,
    };
  }

  return {
    verdict: "poczekaj",
    title: "Bez presji — możesz trzymać",
    reason: `Kurs w środku zakresu (${percentile}. percentyl). Wymień tylko tyle, ile potrzebujesz w złotówkach. Resztę zostaw w euro na lepszy moment.`,
    sellRate,
    nowPln,
    vsAvg,
    vsMax,
    percentile,
  };
}
