export default function ClaimRow({ claim, status, decision, contestStatus, isLoading, onSelect, onDecision }) {
  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`
  }

  const formatCurrency = (amount) =>
    `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const statusBadge = {
    Clean: 'bg-status-clean-tint text-status-clean border-status-clean-border',
    Flagged: 'bg-status-flagged-tint text-status-flagged border-status-flagged-border',
    Anomaly: 'bg-status-anomaly-tint text-status-anomaly border-status-anomaly-border',
    Contested: 'bg-orange-100 text-orange-700 border-orange-200',
  }

  const decisionBadge = {
    approve: 'bg-status-clean-tint text-status-clean border-status-clean-border',
    reject: 'bg-status-flagged-tint text-status-flagged border-status-flagged-border',
    escalate: 'bg-status-anomaly-tint text-status-anomaly border-status-anomaly-border',
  }

  const warrantyBadge = {
    basic: 'bg-toyota-100 text-toyota-600 border-toyota-200',
    powertrain: 'bg-toyota-ink text-white border-toyota-ink',
    extended: 'bg-white text-toyota-ink border-toyota-ink',
  }

  return (
    <tr
      className="border-t border-toyota-100 hover:bg-toyota-50 group cursor-pointer transition-colors"
      onClick={onSelect}
    >
      <td className="px-4 py-3 font-mono text-sm font-semibold text-toyota-red">{claim.claimId}</td>
      <td className="px-4 py-3 text-toyota-600 tabular-nums">{formatDate(claim.claimDate)}</td>
      <td className="px-4 py-3 text-toyota-600">{claim.dealerId}</td>
      <td className="px-4 py-3">
        <span className="font-mono bg-toyota-100 text-toyota-700 text-xs font-medium px-2 py-0.5 rounded border border-toyota-200">
          {claim.repairCodes[0]}
        </span>
        {claim.repairCodes.length > 1 && (
          <span className="ml-1.5 text-xs text-toyota-400">+{claim.repairCodes.length - 1}</span>
        )}
      </td>
      <td className="px-4 py-3 text-right font-semibold tabular-nums text-toyota-ink">
        {formatCurrency(claim.claimAmount)}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-sm border capitalize ${
            warrantyBadge[claim.warrantyType] || 'bg-toyota-100 text-toyota-700 border-toyota-200'
          }`}
        >
          {claim.warrantyType}
        </span>
      </td>
      <td className="px-4 py-3">
        {isLoading ? (
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-sm border bg-toyota-50 text-toyota-400 border-toyota-200 animate-pulse">
            Analysing…
          </span>
        ) : decision ? (
          <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-sm border ${decisionBadge[decision]}`}>
            {decision}
          </span>
        ) : (
          <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-sm border ${statusBadge[status]}`}>
            {status}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        {contestStatus && contestStatus !== 'none' ? (
          <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full capitalize">
            {contestStatus.replace('_', ' ')}
          </span>
        ) : (
          <span className="text-gray-300 text-xs">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        {!decision && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
            <button
              onClick={e => { e.stopPropagation(); onDecision(claim.claimId, 'approve') }}
              title="Approve"
              className="text-xs w-7 h-7 rounded-md border border-status-clean-border bg-white text-status-clean hover:bg-status-clean-tint flex items-center justify-center font-semibold"
            >
              ✓
            </button>
            <button
              onClick={e => { e.stopPropagation(); onDecision(claim.claimId, 'reject') }}
              title="Reject"
              className="text-xs w-7 h-7 rounded-md border border-toyota-red-border bg-white text-toyota-red hover:bg-toyota-red-tint flex items-center justify-center font-semibold"
            >
              ✗
            </button>
          </div>
        )}
      </td>
    </tr>
  )
}
