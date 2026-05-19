export default function PartsPanel({ parts }) {
  if (!parts || parts.length === 0) return null

  const formatCurrency = (amount) =>
    `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const total = parts.reduce((sum, p) => sum + p.qty * p.unitCost, 0)

  return (
    <div className="bg-white border border-toyota-200 rounded-lg p-5 mb-4">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-toyota-500 mb-3">
        Parts Detail
      </h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-toyota-50 text-toyota-500 text-[11px] font-semibold uppercase tracking-wider border-y border-toyota-200">
            <th className="px-3 py-2 text-left">Part Code</th>
            <th className="px-3 py-2 text-right">Qty</th>
            <th className="px-3 py-2 text-right">Unit Cost</th>
            <th className="px-3 py-2 text-right">Line Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-toyota-100">
          {parts.map((part, i) => (
            <tr key={i}>
              <td className="px-3 py-2.5 font-mono text-xs text-toyota-700">{part.code}</td>
              <td className="px-3 py-2.5 text-right tabular-nums text-toyota-700">{part.qty}</td>
              <td className="px-3 py-2.5 text-right tabular-nums text-toyota-700">{formatCurrency(part.unitCost)}</td>
              <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-toyota-ink">
                {formatCurrency(part.qty * part.unitCost)}
              </td>
            </tr>
          ))}
          <tr className="bg-toyota-50">
            <td className="px-3 py-2 text-[11px] uppercase tracking-wider text-toyota-500 font-semibold" colSpan={3}>
              Parts Total
            </td>
            <td className="px-3 py-2 text-right tabular-nums font-bold text-toyota-ink">
              {formatCurrency(total)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
