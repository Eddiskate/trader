import { paydayAdvice } from "@/lib/advice";
import { formatPln, formatQty, formatRate } from "@/lib/format";
import type { RateSnapshot } from "@/lib/types";
import { SignedPln } from "./SignedPln";

const TONE = {
  wymieniaj: "text-up",
  trzymaj: "text-buy",
  poczekaj: "text-gold",
} as const;

export function PaydayHelper({
  rate,
  amount,
  onAmount,
  onKeep,
  onExchange,
}: {
  rate?: RateSnapshot;
  amount: string;
  onAmount: (value: string) => void;
  onKeep: () => void;
  onExchange: () => void;
}) {
  const qty = Number(amount);
  const advice = rate ? paydayAdvice(rate, qty) : null;

  return (
    <section className="shrink-0 border-b border-line bg-black">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
        <div className="min-w-[140px]">
          <p className="text-[11px] font-medium tracking-[0.16em] uppercase text-muted">
            Pomocnik · wpływ dziś
          </p>
          <label className="mt-1 flex items-center gap-2 text-[11px] text-muted">
            Kwota
            <input
              value={amount}
              onChange={(event) => onAmount(event.target.value)}
              inputMode="decimal"
              className="tabular h-8 w-24 border border-line bg-black px-2 text-[13px] text-ink outline-none"
            />
            <span className="tabular text-ink">{rate?.code ?? "EUR"}</span>
          </label>
        </div>

        {!rate && (
          <p className="text-[12px] text-muted">Wybierz walutę z kursami NBP.</p>
        )}

        {advice && (
          <>
            <div className="min-w-[220px] flex-1">
              <p className={`text-[15px] ${TONE[advice.verdict]}`}>{advice.title}</p>
              <p className="mt-1 max-w-3xl text-[12px] text-muted">{advice.reason}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-[11px] text-muted">
              <div>
                <p>Dziś ~</p>
                <p className="tabular text-[13px] text-ink">{formatPln(advice.nowPln)}</p>
                <p className="tabular">@ {formatRate(advice.sellRate)}</p>
              </div>
              <div>
                <p>vs średnia 67 sesji</p>
                <SignedPln value={advice.vsAvg} className="text-[13px]" />
              </div>
              <div>
                <p>do niedawnego max</p>
                <p className="tabular text-[13px] text-ink">
                  {advice.vsMax > 0.5 ? formatPln(advice.vsMax) : formatPln(0)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onKeep}
                className="h-8 border border-line px-3 text-[12px] text-ink hover:bg-panel"
              >
                Zapisz wpływ {formatQty(qty)} {rate?.code}
              </button>
              <button
                type="button"
                onClick={onExchange}
                className={`h-8 px-3 text-[12px] ${
                  advice.verdict === "wymieniaj"
                    ? "bg-[#f2f2f2] text-[#000]"
                    : "border border-line text-ink hover:bg-panel"
                }`}
              >
                Przygotuj sprzedaż
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
