"use client";

import { formatPln, todayIso } from "@/lib/format";
import { quoteRate } from "@/lib/quotes";
import type { DashboardPayload, RateSnapshot, Side } from "@/lib/types";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Ledger } from "./Ledger";
import { Portfolio } from "./Portfolio";
import { RateCards } from "./RateCards";
import { SignedPln } from "./SignedPln";
import { TradeForm } from "./TradeForm";

function roundRate(value: number) {
  return (Math.round(value * 10000) / 10000).toFixed(4);
}

function roundMoney(value: number) {
  return (Math.round(value * 100) / 100).toFixed(2);
}

export function Dashboard() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState("EUR");
  const [side, setSide] = useState<Side>("buy");
  const [amount, setAmount] = useState("1000");
  const [rate, setRate] = useState("");
  const [plnAmount, setPlnAmount] = useState("");
  const [tradedAt, setTradedAt] = useState(todayIso);
  const [note, setNote] = useState("");
  const [syncField, setSyncField] = useState<"rate" | "pln">("rate");
  const [submitting, setSubmitting] = useState(false);
  const [adding, setAdding] = useState("");

  async function refresh(next?: DashboardPayload) {
    if (next) {
      setData(next);
      setError(next.error ?? null);
      return;
    }
    const response = await fetch("/api/dashboard");
    const payload = (await response.json()) as DashboardPayload;
    setData(payload);
    setError(payload.error ?? null);
  }

  useEffect(() => {
    refresh().catch(() => setError("Nie udało się wczytać danych."));
  }, []);

  const selectedRate = data?.rates.find((item) => item.code === currency);

  function fillQuote(nbp: RateSnapshot, nextSide: Side = side) {
    const quoted = quoteRate(nbp, nextSide);
    setRate(roundRate(quoted));
    const qty = Number(amount);
    if (qty > 0) setPlnAmount(roundMoney(qty * quoted));
    setSyncField("rate");
  }

  useEffect(() => {
    if (!selectedRate || rate) return;
    fillQuote(selectedRate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRate, rate]);

  const summary = data?.summaries.find((item) => item.currency === currency);

  const available = useMemo(() => {
    const list = data?.available ?? [];
    if (list.length > 0) return list;
    return (data?.watched ?? []).map((code) => ({ code, name: code }));
  }, [data]);

  function applyCurrency(code: string) {
    setCurrency(code);
    const nbp = data?.rates.find((item) => item.code === code);
    if (!nbp) return;
    fillQuote(nbp);
  }

  function changeSide(next: Side) {
    setSide(next);
    if (selectedRate) fillQuote(selectedRate, next);
  }

  function changeAmount(value: string) {
    setAmount(value);
    const qty = Number(value);
    const current = Number(rate);
    if (qty > 0 && current > 0 && syncField === "rate") {
      setPlnAmount(roundMoney(qty * current));
    }
  }

  function changeRate(value: string) {
    setRate(value);
    setSyncField("rate");
    const qty = Number(amount);
    const current = Number(value);
    if (qty > 0 && current > 0) setPlnAmount(roundMoney(qty * current));
  }

  function changePln(value: string) {
    setPlnAmount(value);
    setSyncField("pln");
    const qty = Number(amount);
    const pln = Number(value);
    if (qty > 0 && pln > 0) setRate(roundRate(pln / qty));
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currency,
          side,
          foreignAmount: Number(amount),
          rate: Number(rate),
          plnAmount: Number(plnAmount),
          tradedAt,
          note,
        }),
      });
      const payload = (await response.json()) as DashboardPayload & { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Nie udało się zapisać wymiany.");
        return;
      }
      await refresh(payload);
      setNote("");
      if (side === "sell") setSide("buy");
    } catch {
      setError("Nie udało się zapisać wymiany.");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeTrade(id: string) {
    if (!confirm("Usunąć tę wymianę z historii?")) return;
    const response = await fetch(`/api/trades/${id}`, { method: "DELETE" });
    const payload = (await response.json()) as DashboardPayload;
    await refresh(payload);
  }

  async function updateWatched(next: string[]) {
    const response = await fetch("/api/watched", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ watched: next }),
    });
    const payload = (await response.json()) as DashboardPayload;
    await refresh(payload);
    if (!next.includes(currency) && next[0]) applyCurrency(next[0]);
  }

  async function addWatched() {
    const code = adding.trim().toUpperCase();
    if (!code || !data) return;
    if (!data.watched.includes(code)) {
      await updateWatched([...data.watched, code]);
    }
    applyCurrency(code);
    setAdding("");
  }

  if (!data) {
    return (
      <main className="flex h-full w-full items-center justify-center bg-black text-sm text-muted">
        Ładowanie kursów NBP…
      </main>
    );
  }

  return (
    <main className="flex h-full w-full flex-col bg-black text-[13px]">
      <header className="shrink-0 border-b border-line">
        <div className="flex h-9 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <span className="tabular text-[12px] font-medium tracking-[0.2em] text-ink">
              FX DESK
            </span>
            <span className="text-muted">base PLN</span>
          </div>
          <span className="tabular text-[11px] text-muted">
            NBP {data.asOf ?? "—"} · wycena po kursie sprzedaży (tabela C)
          </span>
        </div>
        <div className="grid grid-cols-2 border-t border-line lg:grid-cols-5">
          <Metric label="Zysk z wymian" value={<SignedPln value={data.totals.realized} />} />
          <Metric
            label="Niezrealizowane"
            value={<SignedPln value={data.totals.unrealized} />}
          />
          <Metric label="Wydane" value={formatPln(data.totals.spentPln)} />
          <Metric label="Ze sprzedaży" value={formatPln(data.totals.receivedPln)} />
          <Metric
            label="Portfel teraz"
            value={formatPln(data.totals.marketValue)}
            className="col-span-2 lg:col-span-1"
          />
        </div>
      </header>

      {error && (
        <p className="shrink-0 border-b border-down/40 bg-black px-4 py-2 text-down">
          {error}
        </p>
      )}

      <section className="shrink-0 border-b border-line">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <h2 className="text-[11px] font-medium tracking-[0.16em] uppercase text-muted">
              Kurs / 67 sesji
            </h2>
            <div className="flex flex-wrap items-center gap-1">
              {data.watched.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() =>
                    updateWatched(data.watched.filter((item) => item !== code))
                  }
                  className="border border-line bg-panel px-2 py-0.5 text-[11px] tabular text-muted hover:text-down"
                  title="Usuń z obserwowanych"
                >
                  {code} ×
                </button>
              ))}
              <select
                value={adding}
                onChange={(event) => setAdding(event.target.value)}
                className="border border-line bg-black px-2 py-0.5 text-[11px] outline-none"
              >
                <option value="">Dodaj</option>
                {available
                  .filter((item) => !data.watched.includes(item.code))
                  .map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.code} — {item.name}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={addWatched}
                className="border border-line bg-panel-2 px-2 py-0.5 text-[11px] text-ink"
              >
                +
              </button>
            </div>
          </div>
          <p className="hidden text-[11px] text-muted lg:block">
            Kliknij parę, aby wystawić wymianę
          </p>
        </div>
        <RateCards rates={data.rates} selected={currency} onSelect={applyCurrency} />
      </section>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)]">
        <TradeForm
          currency={currency}
          onCurrency={applyCurrency}
          side={side}
          onSide={changeSide}
          amount={amount}
          onAmount={changeAmount}
          rate={rate}
          onRate={changeRate}
          plnAmount={plnAmount}
          onPlnAmount={changePln}
          tradedAt={tradedAt}
          onTradedAt={setTradedAt}
          note={note}
          onNote={setNote}
          available={available}
          summary={summary}
          currentRate={selectedRate}
          submitting={submitting}
          onSubmit={submit}
        />
        <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
          <Portfolio summaries={data.summaries} onSelect={applyCurrency} />
          <Ledger trades={data.trades} onDelete={removeTrade} />
        </div>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  className = "",
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex h-10 items-center justify-between gap-3 border-line bg-black px-4 not-first:border-l ${className}`}
    >
      <span className="text-[10px] tracking-[0.12em] uppercase text-muted">{label}</span>
      <span className="tabular text-[13px] text-ink">{value}</span>
    </div>
  );
}
