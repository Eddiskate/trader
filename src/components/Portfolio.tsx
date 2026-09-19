import { formatPln, formatQty, formatRate } from "@/lib/format";
import type { CurrencySummary } from "@/lib/types";
import { SignedPln } from "./SignedPln";

export function Portfolio({
  summaries,
  onSelect,
}: {
  summaries: CurrencySummary[];
  onSelect: (code: string) => void;
}) {
  return (
    <section className="flex min-h-0 flex-col border-b border-line bg-black">
      <div className="flex h-9 shrink-0 items-center border-b border-line px-4">
        <h2 className="text-[11px] font-medium tracking-[0.16em] uppercase text-muted">
          Portfel
        </h2>
      </div>

      {summaries.length === 0 ? (
        <p className="px-4 py-6 text-muted">
          Brak pozycji. Dodaj wpływ z wypłaty, kupno albo stan.
        </p>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[880px] text-left">
            <thead className="sticky top-0 bg-black text-[10px] uppercase tracking-[0.1em] text-muted">
              <tr className="border-b border-line">
                <th className="px-4 py-2 font-medium">Para</th>
                <th className="px-3 py-2 font-medium">POS</th>
                <th className="px-3 py-2 font-medium">AVG</th>
                <th className="px-3 py-2 font-medium">Wydane</th>
                <th className="px-3 py-2 font-medium">Sprzedaż</th>
                <th className="px-3 py-2 font-medium">P&L</th>
                <th className="px-4 py-2 font-medium">Mark / uPnL</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((row) => (
                <tr key={row.currency} className="border-b border-line hover:bg-panel">
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => onSelect(row.currency)}
                      className="tabular text-ink"
                    >
                      {row.currency}/PLN
                    </button>
                    {row.oversold && (
                      <p className="text-[10px] text-down">sprzedaż bez zakupu</p>
                    )}
                  </td>
                  <td className="tabular px-3 py-2">
                    {formatQty(row.holding)} {row.currency}
                  </td>
                  <td className="tabular px-3 py-2">
                    {row.holding > 0 ? formatRate(row.avgCost) : "—"}
                  </td>
                  <td className="tabular px-3 py-2">{formatPln(row.spentPln)}</td>
                  <td className="tabular px-3 py-2">{formatPln(row.receivedPln)}</td>
                  <td className="px-3 py-2">
                    <SignedPln value={row.realized} />
                  </td>
                  <td className="px-4 py-2">
                    <p className="tabular">{formatPln(row.marketValue)}</p>
                    <SignedPln value={row.unrealized} className="text-[11px]" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
