import { formatPln, formatQty, formatRate } from "@/lib/format";
import { SIDE_LABEL } from "@/lib/labels";
import type { Trade } from "@/lib/types";

export function Ledger({
  trades,
  onDelete,
}: {
  trades: Trade[];
  onDelete: (id: string) => void;
}) {
  return (
    <section className="flex min-h-0 flex-col bg-black">
      <div className="flex h-9 shrink-0 items-center border-b border-line px-4">
        <h2 className="text-[11px] font-medium tracking-[0.16em] uppercase text-muted">
          Historia
        </h2>
      </div>

      {trades.length === 0 ? (
        <p className="px-4 py-6 text-muted">Brak transakcji.</p>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="sticky top-0 bg-black text-[10px] uppercase tracking-[0.1em] text-muted">
              <tr className="border-b border-line">
                <th className="px-4 py-2 font-medium">Data</th>
                <th className="px-3 py-2 font-medium">Para</th>
                <th className="px-3 py-2 font-medium">Strona</th>
                <th className="px-3 py-2 font-medium">Ilość</th>
                <th className="px-3 py-2 font-medium">Kurs</th>
                <th className="px-3 py-2 font-medium">PLN</th>
                <th className="px-3 py-2 font-medium">Notatka</th>
                <th className="px-4 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.id} className="border-b border-line hover:bg-panel">
                  <td className="tabular px-4 py-2 text-muted">{trade.tradedAt}</td>
                  <td className="tabular px-3 py-2">{trade.currency}/PLN</td>
                  <td className="px-3 py-2 text-muted">{SIDE_LABEL[trade.side]}</td>
                  <td className="tabular px-3 py-2">
                    {formatQty(trade.foreignAmount)} {trade.currency}
                  </td>
                  <td className="tabular px-3 py-2">{formatRate(trade.rate)}</td>
                  <td className="tabular px-3 py-2">{formatPln(trade.plnAmount)}</td>
                  <td className="px-3 py-2 text-muted">{trade.note || "—"}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => onDelete(trade.id)}
                      className="text-[11px] text-muted hover:text-down"
                    >
                      Usuń
                    </button>
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
