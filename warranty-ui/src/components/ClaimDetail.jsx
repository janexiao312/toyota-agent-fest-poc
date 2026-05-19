import MetadataPanel from './MetadataPanel'
import AISummaryPanel from './AISummaryPanel'
import PolicyFlagsPanel from './PolicyFlagsPanel'
import PartsPanel from './PartsPanel'
import ActionBar from './ActionBar'

export default function ClaimDetail({ claim, rules, agentResults, onDecision, onBack }) {
  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <button
        onClick={onBack}
        className="mb-6 text-sm text-toyota-500 hover:text-toyota-ink flex items-center gap-1.5 font-medium transition-colors"
      >
        <span aria-hidden>←</span> Back to Queue
      </button>

      <MetadataPanel claim={claim} />
      <AISummaryPanel claim={claim} agentResults={agentResults} />
      <PolicyFlagsPanel agentResults={agentResults} rules={rules} />
      <PartsPanel parts={claim.parts} />
      <ActionBar claimId={claim.claimId} onDecision={onDecision} />
    </div>
  )
}
