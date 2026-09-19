import { buildDashboard } from "@/lib/dashboard";
import { addTrade } from "@/lib/store";
import type { Side } from "@/lib/types";

export const runtime = "nodejs";

const SIDES: Side[] = ["buy", "sell", "seed", "inflow"];

export async function POST(request: Request) {
  const body = (await request.json()) as {
    currency?: string;
    side?: Side;
    foreignAmount?: number;
    rate?: number;
    plnAmount?: number;
    tradedAt?: string;
    note?: string;
  };

  const currency = body.currency?.trim().toUpperCase();
  const side = body.side;
  const foreignAmount = Number(body.foreignAmount);
  const rate = Number(body.rate);
  const plnAmount = Number(body.plnAmount ?? foreignAmount * rate);
  const tradedAt = body.tradedAt?.trim();
  const note = body.note?.trim() ?? "";

  if (!currency || !/^[A-Z]{3}$/.test(currency)) {
    return Response.json({ error: "Podaj kod waluty, np. EUR." }, { status: 400 });
  }
  if (!side || !SIDES.includes(side)) {
    return Response.json({ error: "Wybierz kupno, sprzedaż, wpływ albo stan." }, { status: 400 });
  }
  if (!Number.isFinite(foreignAmount) || foreignAmount <= 0) {
    return Response.json({ error: "Kwota waluty musi być większa od zera." }, { status: 400 });
  }
  if (!Number.isFinite(rate) || rate <= 0) {
    return Response.json({ error: "Kurs musi być większy od zera." }, { status: 400 });
  }
  if (!Number.isFinite(plnAmount) || plnAmount <= 0) {
    return Response.json({ error: "Kwota w PLN musi być większa od zera." }, { status: 400 });
  }
  if (!tradedAt || !/^\d{4}-\d{2}-\d{2}$/.test(tradedAt)) {
    return Response.json({ error: "Podaj datę wymiany." }, { status: 400 });
  }

  await addTrade({
    currency,
    side,
    foreignAmount,
    rate,
    plnAmount,
    tradedAt,
    note,
  });

  return Response.json(await buildDashboard());
}
