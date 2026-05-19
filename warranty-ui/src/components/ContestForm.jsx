import { useState } from 'react'

export default function ContestForm({ claimId, onSubmit }) {
  const [reason, setReason] = useState('')
  const [evidence, setEvidence] = useState('')
  const [context, setContext] = useState('')
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!reason.trim()) return
    const evidenceFiles = evidence.trim() ? evidence.split(',').map(f => f.trim()) : []
    onSubmit(claimId, reason.trim(), evidenceFiles)
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 px-4 py-3 rounded-lg font-medium text-sm"
      >
        I disagree with this decision
      </button>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-1">Contest This Decision</h3>
      <p className="text-xs text-gray-500 mb-4">Provide your reason for contesting and any supporting evidence. We'll review your submission promptly.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Reason for contest <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value.slice(0, 500))}
            placeholder="Explain why you believe this decision should be reconsidered..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none h-24 focus:outline-none focus:border-gray-400"
            required
          />
          <span className="text-xs text-gray-400">{reason.length}/500</span>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Supporting evidence (filenames, comma-separated)
          </label>
          <input
            type="text"
            value={evidence}
            onChange={e => setEvidence(e.target.value)}
            placeholder="e.g., diagnostic_report.pdf, repair_receipt.jpg"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Additional context (optional)
          </label>
          <textarea
            value={context}
            onChange={e => setContext(e.target.value.slice(0, 300))}
            placeholder="Any other relevant information..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none h-16 focus:outline-none focus:border-gray-400"
          />
          <span className="text-xs text-gray-400">{context.length}/300</span>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!reason.trim()}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Contest
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="text-gray-500 px-4 py-2 rounded-lg text-sm hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
