export default function ActionBar({ claimId, onDecision }) {
  return (
    <div className="flex gap-3 justify-end py-4 border-t border-gray-200 mt-4">
      <button
        onClick={() => onDecision(claimId, 'approve')}
        className="bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 px-4 py-2 rounded-lg font-medium"
      >
        Approve
      </button>
      <button
        onClick={() => onDecision(claimId, 'escalate')}
        className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 px-4 py-2 rounded-lg font-medium"
      >
        Escalate for Review
      </button>
      <button
        onClick={() => onDecision(claimId, 'reject')}
        className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 px-4 py-2 rounded-lg font-medium"
      >
        Reject
      </button>
    </div>
  )
}
