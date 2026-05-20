import { useState } from 'react'
import MetadataPanel from './MetadataPanel'
import AISummaryPanel from './AISummaryPanel'
import AgentReasoningTrace from './AgentReasoningTrace'
import PartsPanel from './PartsPanel'
import ActionBar from './ActionBar'

export default function ClaimDetail({ claim, rules, agentResults, decision, reviewerNote, onDecision, onUndoDecision, onBack }) {
  const [note, setNote] = useState(reviewerNote ?? '')
  const [feedback, setFeedback] = useState(null)

  const summary = agentResults?.summary

  const handleSubmit = (action) => {
    onDecision(claim.claimId, action, note)
  }

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <button
        onClick={onBack}
        className="mb-6 text-sm text-toyota-500 hover:text-toyota-ink flex items-center gap-1.5 font-medium transition-colors"
      >
        <span aria-hidden>←</span> Back to Queue
      </button>

      {decision && (
        <div className="mb-4 bg-toyota-50 border border-toyota-200 rounded-md px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-toyota-700">
            Decided: <span className="font-semibold uppercase tracking-wider text-toyota-ink">{decision}</span>
            {reviewerNote && <span className="ml-3 text-toyota-500">Note: <span className="italic">"{reviewerNote}"</span></span>}
          </div>
          <button
            onClick={() => onUndoDecision?.(claim.claimId)}
            className="text-xs font-semibold uppercase tracking-wider text-toyota-red hover:text-toyota-red-hover"
          >
            ↩ Undo
          </button>
        </div>
      )}

      <MetadataPanel claim={claim} />
      <AISummaryPanel claim={claim} agentResults={agentResults} />

      {summary && !decision && (
        <div className="mb-4 bg-white border border-toyota-200 rounded-md px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-toyota-700">
              Was this AI recommendation helpful?
            </span>
            <div className="flex items-center gap-2">
              {feedback ? (
                <span className="text-xs text-toyota-500 italic">Thanks — feedback recorded</span>
              ) : (
                <>
                  <button
                    onClick={() => setFeedback('agree')}
                    className="text-xs px-3 py-1.5 rounded-md border border-status-clean-border text-status-clean hover:bg-status-clean-tint font-medium"
                  >
                    👍 Agree
                  </button>
                  <button
                    onClick={() => setFeedback('disagree')}
                    className="text-xs px-3 py-1.5 rounded-md border border-toyota-red-border text-toyota-red hover:bg-toyota-red-tint font-medium"
                  >
                    👎 Disagree
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <AgentReasoningTrace
        claim={claim}
        rules={rules}
        validation={agentResults?.validation}
        summary={summary}
      />
      <PartsPanel parts={claim.parts} />

      {!decision && (
        <div className="mb-4 bg-white border border-toyota-200 rounded-md p-4">
          <label className="block text-[11px] uppercase tracking-wider text-toyota-500 font-semibold mb-1.5">
            Reviewer Note <span className="text-toyota-400 normal-case font-normal">(optional, attaches to your decision)</span>
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value.slice(0, 400))}
            placeholder="Why are you approving / rejecting / escalating this claim?"
            className="w-full text-sm border border-toyota-200 rounded-md p-2 placeholder:text-toyota-400 focus:outline-none focus:border-toyota-red focus:ring-1 focus:ring-toyota-red"
            rows="2"
          />
          <div className="text-right text-xs text-toyota-400 mt-1">{note.length}/400</div>
        </div>
      )}

      <ActionBar claimId={claim.claimId} disabled={!!decision} onDecision={handleSubmit} />
    </div>
  )
}
