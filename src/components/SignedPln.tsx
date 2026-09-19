import { formatSignedPln } from "@/lib/format";

export function SignedPln({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const tone =
    Math.abs(value) < 0.005
      ? "text-muted"
      : value > 0
        ? "text-up"
        : "text-down";

  return (
    <span className={`tabular ${tone} ${className}`}>{formatSignedPln(value)}</span>
  );
}
