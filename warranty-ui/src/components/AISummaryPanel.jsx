import { useState } from 'react'

export default function AISummaryPanel({ claim, agentResults }) {
  const [showNotes, setShowNotes] = useState(false)

  if (!agentResults?.summary) {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl mb-4 animate-pulse">
        <div className="h-4 bg-blue-100 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-blue-100 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-blue-100 rounded w-2/3"></div>
      </div>
    )
  }

  const { summary, recommendation, confidence } = agentResults.summary

  const recBadge = {
    approve: 'bg-green-100 text-green-800 border-green-200',
    review: 'bg-amber-100 text-amber-800 border-amber-200',
    reject: 'bg-red-100 text-red-800 border-red-200',
  }

  const confBadge = {
    low: 'text-gray-500',
    medium: 'text-amber-600',
    high: 'text-green-600',
  }

  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl mb-4">
      <div className="flex items-center gap-3 mb-2">
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border capitalize ${recBadge[recommendation]}`}>
          {recommendation}
        </span>
        <span className={`text-xs font-medium capitalize ${confBadge[confidence]}`}>
          {confidence} confidence
        </span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>

      <button
        onClick={() => setShowNotes(!showNotes)}
        className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium"
      >
        {showNotes ? '▾ Hide source notes' : '▸ Show source notes'}
      </button>
      {showNotes && (
        <div className="mt-2 bg-white/60 rounded p-3 text-xs text-gray-600 italic">
          {claim.techNotes}
        </div>
      )}
    </div>
  )
}
