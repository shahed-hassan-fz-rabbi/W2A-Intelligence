import Icon from "./Icon";

export default function StatCard({ label, value, unit, icon = "box", tone = "brand" }) {
  const tones = {
    brand: "bg-brand-100 text-brand-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    ink: "bg-gray-100 text-ink",
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium tracking-wide text-muted uppercase">
          {label}
        </p>
        <div className={`rounded-lg p-2 ${tones[tone]}`}>
          <Icon name={icon} className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-ink">
        {value}
        {unit && (
          <span className="ml-1 text-sm font-medium text-muted">{unit}</span>
        )}
      </p>
    </div>
  );
}