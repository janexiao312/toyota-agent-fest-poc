import MetadataPanel from './MetadataPanel'
import AISummaryPanel from './AISummaryPanel'
import PolicyFlagsPanel from './PolicyFlagsPanel'
import PartsPanel from './PartsPanel'
import ActionBar from './ActionBar'

export default function ClaimDetail({ claim, rules, agentResults, onDecision, onBack }) {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button
        onClick={onBack}
        className="mb-4 text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1"
      >
        ← Back to Queue
      </button>

      <MetadataPanel claim={claim} />
      <AISummaryPanel claim={claim} agentResults={agentResults} />
      <PolicyFlagsPanel agentResults={agentResults} rules={rules} />
      <PartsPanel parts={claim.parts} />
      <ActionBar claimId={claim.claimId} onDecision={onDecision} />
    </div>
  )
}
