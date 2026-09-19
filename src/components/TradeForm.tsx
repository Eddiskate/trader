import { formatPln, formatQty, formatRate } from "@/lib/format";
import { SIDE_LABEL } from "@/lib/labels";
import { previewSell } from "@/lib/pnl";
import type { CurrencySummary, RateSnapshot, Side } from "@/lib/types";
import { SignedPln } from "./SignedPln";

const field =
  "h-9 w-full border border-line bg-black px-2.5 tabular text-[13px] outline-none";

export function TradeForm({
  currency,
  onCurrency,
  side,
  onSide,
  amount,
  onAmount,
  rate,
  onRate,
  plnAmount,
  onPlnAmount,
  tradedAt,
  onTradedAt,
  note,
  onNote,
  available,
  summary,
  currentRate,
  submitting,
  onSubmit,
}: {
  currency: string;
  onCurrency: (value: string) => void;
  side: Side;
  onSide: (value: Side) => void;
  amount: string;
  onAmount: (value: string) => void;
  rate: string;
  onRate: (value: string) => void;
  plnAmount: string;
  onPlnAmount: (value: string) => void;
  tradedAt: string;
  onTradedAt: (value: string) => void;
  note: string;
  onNote: (value: string) => void;
  available: { code: string; name: string }[];
  summary?: CurrencySummary;
  currentRate?: RateSnapshot;
  submitting: boolean;
  onSubmit: () => void;
}) {
  const qty = Number(amount);
  const sellRate = Number(rate);
  const preview = side === "sell" ? previewSell(summary, qty, sellRate) : null;

  return (
    <section className="flex min-h-0 flex-col border-line bg-black lg:border-r">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-line px-4">
        <h2 className="text-[11px] font-medium tracking-[0.16em] uppercase text-muted">
          Zlecenie
        </h2>
        {currentRate && (
          <p className="tabular text-[11px] text-muted">
            NBP śr. {formatRate(currentRate.current)}
            {currentRate.bid != null && (
              <>
                {" "}
                · sprzedasz ~{" "}
                <span className="text-ink">{formatRate(currentRate.bid)}</span>
              </>
            )}
          </p>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="grid gap-3">
          <div className="grid gap-1 text-[11px] uppercase tracking-[0.08em] text-muted">
            Strona
            <div className="grid grid-cols-2">
              {(["inflow", "buy", "sell", "seed"] as Side[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onSide(value)}
                  className={`-mt-px -ml-px h-9 border border-line text-[12px] normal-case tracking-normal first:ml-0 first:mt-0 ${
                    side === value
                      ? "bg-[#f2f2f2] text-[#000]"
                      : "bg-black text-muted"
                  }`}
                >
                  {SIDE_LABEL[value]}
                </button>
              ))}
            </div>
          </div>

          <label className="grid gap-1 text-[11px] uppercase tracking-[0.08em] text-muted">
            Waluta
            <select
              value={currency}
              onChange={(event) => onCurrency(event.target.value)}
              className={field}
            >
              {available.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.code} — {item.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="grid gap-1 text-[11px] uppercase tracking-[0.08em] text-muted">
              Kwota {currency}
              <input
                value={amount}
                onChange={(event) => onAmount(event.target.value)}
                inputMode="decimal"
                className={field}
              />
            </label>
            <label className="grid gap-1 text-[11px] uppercase tracking-[0.08em] text-muted">
              Kurs PLN
              <input
                value={rate}
                onChange={(event) => onRate(event.target.value)}
                inputMode="decimal"
                className={field}
              />
            </label>
          </div>

          <label className="grid gap-1 text-[11px] uppercase tracking-[0.08em] text-muted">
            Kwota PLN
            <input
              value={plnAmount}
              onChange={(event) => onPlnAmount(event.target.value)}
              inputMode="decimal"
              className={field}
            />
          </label>

          <label className="grid gap-1 text-[11px] uppercase tracking-[0.08em] text-muted">
            Data
            <input
              type="date"
              value={tradedAt}
              onChange={(event) => onTradedAt(event.target.value)}
              className={field}
            />
          </label>

          <label className="grid gap-1 text-[11px] uppercase tracking-[0.08em] text-muted">
            Notatka
            <input
              value={note}
              onChange={(event) => onNote(event.target.value)}
              placeholder={
                side === "inflow"
                  ? "wypłata, odkładane 500 EUR…"
                  : "kantor, Revolut, faktura…"
              }
              className={field}
            />
          </label>
        </div>

        {side === "sell" && preview && (
          <div className="mt-4 border border-line bg-panel px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted">
              Przy tej sprzedaży
            </p>
            <p className="mt-2">
              WPŁYW{" "}
              <span className="tabular text-ink">{formatPln(preview.proceeds)}</span>
            </p>
            <p className="mt-1 text-[11px] text-muted">
              Podgląd po NBP C (kupno banku). Kantor ING bywa inny — wklej kurs z
              Mojego ING przed zapisem.
            </p>
            {preview.warning === "no-inventory" ? (
              <p className="mt-2 text-[12px] text-muted">
                Brak {currency} w portfelu. Dodaj wpływ, kupno albo stan.
              </p>
            ) : (
              <>
                <p className="mt-1 text-[12px] text-muted">
                  AVG koszt{" "}
                  <span className="tabular text-ink">
                    {formatRate(preview.avgCost ?? 0)}
                  </span>
                  {summary && (
                    <>
                      {" "}
                      · POS {formatQty(summary.holding)} {currency}
                    </>
                  )}
                </p>
                <p className="mt-2 text-[15px]">
                  P&L <SignedPln value={preview.profit ?? 0} />
                </p>
                {preview.warning === "partial" && (
                  <p className="mt-2 text-[12px] text-down">
                    Zysk tylko od {formatQty(preview.covered)} {currency} w portfelu.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {side === "inflow" && (
          <p className="mt-4 text-[12px] text-muted">
            Wypłata albo odkładane euro. Kurs = NBP / Revolut z dnia wpływu — ile
            te pieniądze były warte w PLN, gdy wpadły. Potem sprzedaż porówna, czy
            wyszedłeś lepiej.
          </p>
        )}

        {side === "seed" && (
          <p className="mt-4 text-[12px] text-muted">
            Ile waluty już masz i po jakim kursie ją wtedy wyceniasz. Gotówki PLN
            nie dodajesz.
          </p>
        )}

        {side === "buy" && (
          <p className="mt-4 text-[12px] text-muted">
            Kupno za złotówki w kantorze albo Revolucie.
          </p>
        )}

        {side !== "sell" && summary && summary.holding > 0 && (
          <p className="mt-4 text-[12px] text-muted">
            POS {formatQty(summary.holding)} {currency} @{" "}
            <span className="tabular text-ink">{formatRate(summary.avgCost)}</span>
          </p>
        )}

        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="mt-5 h-10 w-full bg-[#f2f2f2] text-[13px] font-medium text-[#000] disabled:opacity-50"
        >
          {submitting
            ? "ZAPIS…"
            : side === "inflow"
              ? "DODAJ WPŁYW"
              : side === "seed"
                ? "USTAW STAN"
                : "ZAPISZ WYMIANĘ"}
        </button>
      </div>
    </section>
  );
}
