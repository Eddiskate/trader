import { formatRate } from "@/lib/format";
import { HINT_LABEL, LEVEL_LABEL } from "@/lib/labels";
import type { RateSnapshot } from "@/lib/types";

const LEVEL_TONE: Record<RateSnapshot["level"], string> = {
  niski: "text-up",
  "raczej-niski": "text-up",
  sredni: "text-muted",
  "raczej-wysoki": "text-down",
  wysoki: "text-down",
};

export function RateCards({
  rates,
  selected,
  onSelect,
}: {
  rates: RateSnapshot[];
  selected: string;
  onSelect: (code: string) => void;
}) {
  if (rates.length === 0) {
    return (
      <p className="border-t border-line px-4 py-6 text-muted">
        Brak kursów. Dodaj walutę albo poczekaj na NBP.
      </p>
    );
  }

  return (
    <div className="grid auto-cols-[minmax(240px,1fr)] grid-flow-col overflow-x-auto border-t border-line lg:grid-flow-row lg:grid-cols-4 lg:overflow-visible">
      {rates.map((rate) => {
        const span = Math.max(rate.max - rate.min, 0.0001);
        const position = ((rate.current - rate.min) / span) * 100;

        return (
          <button
            key={rate.code}
            type="button"
            onClick={() => onSelect(rate.code)}
            className={`min-w-0 border-r border-b border-line px-4 py-3 text-left transition ${
              selected === rate.code
                ? "bg-panel-2 ring-1 ring-inset ring-ink"
                : "bg-black hover:bg-panel"
            }`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <p className="tabular text-[12px] font-medium tracking-[0.16em] text-ink">
                  {rate.code}/PLN
                </p>
                <p className="mt-0.5 text-[11px] text-muted">{rate.name}</p>
              </div>
              <p className="tabular text-[22px] leading-none text-ink">
                {formatRate(rate.current)}
              </p>
            </div>
            {rate.bid != null && rate.ask != null && (
              <p className="mt-2 text-[11px] text-muted">
                sprzedaż {formatRate(rate.bid)}
                <span className="mx-1">·</span>
                kupno {formatRate(rate.ask)}
                <span className="ml-1">NBP C</span>
              </p>
            )}

            <div className="mt-3 flex items-center justify-between text-[11px]">
              <span className={`uppercase tracking-[0.08em] ${LEVEL_TONE[rate.level]}`}>
                {LEVEL_LABEL[rate.level]}
              </span>
              <span className="tabular text-muted">
                {Math.round(rate.percentile)}p
              </span>
            </div>

            <div className="mt-2 h-px overflow-hidden bg-line">
              <div
                className="h-full bg-ink"
                style={{ width: `${Math.min(100, Math.max(0, position))}%` }}
              />
            </div>

            <div className="mt-2 grid grid-cols-3 gap-2 text-[10px] text-muted">
              <div>
                <p>MIN</p>
                <p className="tabular text-ink">{formatRate(rate.min)}</p>
              </div>
              <div>
                <p>AVG</p>
                <p className="tabular text-ink">{formatRate(rate.avg)}</p>
              </div>
              <div className="text-right">
                <p>MAX</p>
                <p className="tabular text-ink">{formatRate(rate.max)}</p>
              </div>
            </div>

            <p className="mt-2 hidden text-[11px] text-muted lg:block">
              {HINT_LABEL[rate.hint]}
            </p>
          </button>
        );
      })}
    </div>
  );
}
