export default function PartsPanel({ parts }) {
  if (!parts || parts.length === 0) return null

  const formatCurrency = (amount) =>
    `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Parts Detail</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wide">
            <th className="px-3 py-2 text-left">Part Code</th>
            <th className="px-3 py-2 text-right">Qty</th>
            <th className="px-3 py-2 text-right">Unit Cost</th>
            <th className="px-3 py-2 text-right">Line Total</th>
          </tr>
        </thead>
        <tbody>
          {parts.map((part, i) => (
            <tr key={i} className="border-t border-gray-100">
              <td className="px-3 py-2 font-mono text-xs">{part.code}</td>
              <td className="px-3 py-2 text-right">{part.qty}</td>
              <td className="px-3 py-2 text-right">{formatCurrency(part.unitCost)}</td>
              <td className="px-3 py-2 text-right font-medium">{formatCurrency(part.qty * part.unitCost)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
