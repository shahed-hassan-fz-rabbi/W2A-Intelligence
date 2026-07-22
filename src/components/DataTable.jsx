export default function DataTable({ columns, rows, empty = "No records found" }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-10 text-center">
        <p className="text-sm text-muted">{empty}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-line bg-surface md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-canvas">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className="px-4 py-3 text-xs font-semibold tracking-wide text-muted uppercase whitespace-nowrap"
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row, i) => (
                <tr key={row.id ?? i} className="transition hover:bg-brand-50/40">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 text-ink-soft whitespace-nowrap">
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {rows.map((row, i) => (
          <div
            key={row.id ?? i}
            className="rounded-xl border border-line bg-surface p-4"
          >
            {columns.map((c) => (
              <div
                key={c.key}
                className="flex items-start justify-between gap-3 py-1.5"
              >
                <span className="text-xs font-medium text-muted">{c.label}</span>
                <span className="text-right text-sm text-ink-soft">
                  {c.render ? c.render(row) : row[c.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}