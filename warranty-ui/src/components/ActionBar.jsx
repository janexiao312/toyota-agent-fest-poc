export default function ActionBar({ claimId, onDecision, disabled }) {
  const baseDisabled = 'opacity-50 cursor-not-allowed'
  return (
    <div className="flex gap-3 justify-end py-5 border-t border-toyota-200 mt-6">
      <button
        disabled={disabled}
        onClick={() => onDecision(claimId, 'approve')}
        className={`bg-white border border-status-clean-border text-status-clean hover:bg-status-clean-tint px-5 py-2.5 rounded-md text-sm font-semibold uppercase tracking-wider transition-colors ${disabled ? baseDisabled : ''}`}
      >
        Approve
      </button>
      <button
        disabled={disabled}
        onClick={() => onDecision(claimId, 'escalate')}
        className={`bg-white border border-status-anomaly-border text-status-anomaly hover:bg-status-anomaly-tint px-5 py-2.5 rounded-md text-sm font-semibold uppercase tracking-wider transition-colors ${disabled ? baseDisabled : ''}`}
      >
        Escalate for Review
      </button>
      <button
        disabled={disabled}
        onClick={() => onDecision(claimId, 'reject')}
        className={`bg-toyota-red text-white border border-toyota-red hover:bg-toyota-red-hover px-5 py-2.5 rounded-md text-sm font-semibold uppercase tracking-wider transition-colors ${disabled ? baseDisabled : ''}`}
      >
        Reject Claim
      </button>
    </div>
  )
}
