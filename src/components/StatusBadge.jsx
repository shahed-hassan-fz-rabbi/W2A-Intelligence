const STYLES = {
  Pending:       "bg-amber-50 text-amber-700 ring-amber-200",
  "In Progress": "bg-blue-50 text-blue-700 ring-blue-200",
  Completed:     "bg-brand-50 text-brand-700 ring-brand-200",
  Failed:        "bg-red-50 text-red-700 ring-red-200",
  Unassigned:    "bg-red-50 text-red-700 ring-red-200",
  Plastic:       "bg-blue-50 text-blue-700 ring-blue-200",
  Organic:       "bg-brand-50 text-brand-700 ring-brand-200",
  Metal:         "bg-gray-100 text-ink-soft ring-gray-300",
};

export default function StatusBadge({ value }) {
  const cls = STYLES[value] || "bg-gray-100 text-ink-soft ring-gray-300";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap ${cls}`}
    >
      {value}
    </span>
  );
}