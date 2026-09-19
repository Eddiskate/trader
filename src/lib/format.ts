const pln = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const qty = new Intl.NumberFormat("pl-PL", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const rateFmt = new Intl.NumberFormat("pl-PL", {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

export function formatPln(value: number) {
  return pln.format(value);
}

export function formatSignedPln(value: number) {
  const formatted = pln.format(Math.abs(value));
  if (Math.abs(value) < 0.005) return pln.format(0);
  return value > 0 ? `+${formatted}` : `−${formatted}`;
}

export function formatQty(value: number) {
  return qty.format(value);
}

export function formatRate(value: number) {
  return rateFmt.format(value);
}

export function todayIso() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
