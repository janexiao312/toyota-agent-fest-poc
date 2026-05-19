export default function ClaimRow({ claim, status, decision, onSelect, onDecision }) {
  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`
  }

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const statusBadge = {
    Clean: 'bg-blue-100 text-blue-800',
    Flagged: 'bg-red-100 text-red-800',
    Anomaly: 'bg-amber-100 text-amber-800',
  }

  const decisionBadge = {
    approve: 'bg-green-100 text-green-800',
    reject: 'bg-red-100 text-red-800',
    escalate: 'bg-amber-100 text-amber-800',
  }

  const warrantyBadge = {
    basic: 'bg-gray-100 text-gray-700',
    powertrain: 'bg-purple-100 text-purple-700',
    extended: 'bg-indigo-100 text-indigo-700',
  }

  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50 group cursor-pointer" onClick={onSelect}>
      <td className="px-4 py-3 font-mono text-sm font-medium text-blue-700">{claim.claimId}</td>
      <td className="px-4 py-3 text-gray-600">{formatDate(claim.claimDate)}</td>
      <td className="px-4 py-3 text-gray-600">{claim.dealerId}</td>
      <td className="px-4 py-3">
        <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-0.5 rounded">
          {claim.repairCodes[0]}
        </span>
        {claim.repairCodes.length > 1 && (
          <span className="ml-1 text-xs text-gray-400">+{claim.repairCodes.length - 1}</span>
        )}
      </td>
      <td className="px-4 py-3 text-right font-medium">{formatCurrency(claim.claimAmount)}</td>
      <td className="px-4 py-3">
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${warrantyBadge[claim.warrantyType] || 'bg-gray-100 text-gray-700'}`}>
          {claim.warrantyType}
        </span>
      </td>
      <td className="px-4 py-3">
        {decision ? (
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${decisionBadge[decision]}`}>
            {decision}
          </span>
        ) : (
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusBadge[status]}`}>
            {status}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        {!decision && (
          <div className="opacity-0 group-hover:opacity-100 flex gap-1">
            <button
              onClick={e => { e.stopPropagation(); onDecision(claim.claimId, 'approve') }}
              className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
            >
              ✓
            </button>
            <button
              onClick={e => { e.stopPropagation(); onDecision(claim.claimId, 'reject') }}
              className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
            >
              ✗
            </button>
          </div>
        )}
      </td>
    </tr>
  )
}
