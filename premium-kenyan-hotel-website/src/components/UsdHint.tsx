import { parseKes, useKesPerUsd } from "../lib/fx";

/** Small "≈ $6.59" line shown under a KES price, for foreign guests. */
export default function UsdHint({ price, className }: { price: string; className?: string }) {
  const rate = useKesPerUsd();
  const kes = parseKes(price);
  if (!kes || !rate) return null;
  return (
    <span
      className={className ?? "text-[12px] leading-tight text-mute"}
      title="Approximate US-dollar equivalent, updated daily"
    >
      ≈ ${(kes / rate).toFixed(2)}
    </span>
  );
}
