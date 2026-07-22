export default function BarRow({ label, value, max, unit = "kg", sub, tone = "brand" }) {
  const pct = max > 0 ? Math.max((value / max) * 100, 1.5) : 0;
  const tones = {
    brand: "bg-brand-500",
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    ink: "bg-ink",
  };

  return (
    <div className="py-2.5">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="truncate text-sm font-medium text-ink">{label}</span>
        <span className="shrink-0 text-sm text-ink-soft">
          {Number(value).toLocaleString()} <span className="text-xs text-muted">{unit}</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all ${tones[tone]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}