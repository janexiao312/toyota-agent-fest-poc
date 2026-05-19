import { useState } from 'react'

export default function AISummaryPanel({ claim, agentResults }) {
  const [showNotes, setShowNotes] = useState(false)

  if (!agentResults?.summary) {
    return (
      <div className="bg-white border border-toyota-200 border-l-4 border-l-toyota-red rounded-lg p-5 mb-4 animate-pulse">
        <div className="h-3 bg-toyota-100 rounded w-1/4 mb-3"></div>
        <div className="h-3 bg-toyota-100 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-toyota-100 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-toyota-100 rounded w-2/3"></div>
      </div>
    )
  }

  const { summary, recommendation, confidence } = agentResults.summary

  const recBadge = {
    approve: 'bg-status-clean-tint text-status-clean border-status-clean-border',
    review: 'bg-status-anomaly-tint text-status-anomaly border-status-anomaly-border',
    reject: 'bg-status-flagged-tint text-status-flagged border-status-flagged-border',
  }

  const confLabel = {
    low: 'text-toyota-500',
    medium: 'text-status-anomaly',
    high: 'text-status-clean',
  }

  return (
    <div className="bg-white border border-toyota-200 border-l-4 border-l-toyota-red rounded-lg p-5 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[11px] uppercase tracking-wider text-toyota-500 font-semibold">
          AI Reviewer Summary
        </span>
        <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-sm border ${recBadge[recommendation]}`}>
          {recommendation}
        </span>
        <span className={`text-xs font-medium capitalize ${confLabel[confidence]}`}>
          {confidence} confidence
        </span>
      </div>
      <p className="text-[15px] text-toyota-ink leading-relaxed">{summary}</p>

      <button
        onClick={() => setShowNotes(!showNotes)}
        className="mt-4 text-xs text-toyota-600 hover:text-toyota-red font-medium uppercase tracking-wider transition-colors"
      >
        {showNotes ? '▾ Hide source notes' : '▸ Show source notes'}
      </button>
      {showNotes && (
        <div className="mt-2 bg-toyota-50 border border-toyota-200 rounded-md p-3 text-xs text-toyota-600 italic leading-relaxed">
          {claim.techNotes}
        </div>
      )}
    </div>
  )
}
