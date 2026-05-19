import { useState } from 'react'
import ContestForm from './ContestForm'
import ContestStatusTracker from './ContestStatusTracker'

export default function CustomerPortal({ claims, decisions, agentResults, contestData, onContestSubmit, rules }) {
  const [selectedClaimId, setSelectedClaimId] = useState('CLM-00005')

  // Show claims that are decided OR pending (for the demo, all claims are "submitted")
  const decidedClaims = claims.filter(c =>
    decisions[c.claimId] === 'reject' || decisions[c.claimId] === 'escalate'
  )

  // Default to CLM-00005 for demo
  const demoClaim = claims.find(c => c.claimId === 'CLM-00005')
  const activeClaim = claims.find(c => c.claimId === selectedClaimId) || demoClaim
  const claimId = activeClaim?.claimId
  const decision = decisions[claimId]
  const contest = contestData[claimId]
  const validation = agentResults?.[claimId]?.validation
  const isPending = !decision

  // Generate customer explanation
  const getExplanation = () => {
    if (!validation || !activeClaim) return null
    const failures = validation.results?.filter(r => !r.passed) || []
    if (failures.length === 0) return null
    const mainRule = failures[0]
    return {
      explanation: `Your warranty claim (${claimId}) for ${activeClaim.warrantyType} coverage was reviewed and a concern was identified. ${mainRule.message} Based on this policy requirement, your claim requires further review or has been denied.`,
      ruleReference: `${mainRule.ruleId}: ${mainRule.message}`,
      contestEligible: decision === 'reject' || decision === 'escalate'
    }
  }

  const customerExplanation = getExplanation()

  // Decision banner style
  const getBanner = () => {
    if (contest?.status === 'resolved') {
      if (contest.outcome === 'overturn') return { text: 'Decision Overturned', style: 'bg-green-50 border-green-200 text-green-800' }
      if (contest.outcome === 'uphold') return { text: 'Decision Upheld', style: 'bg-red-50 border-red-200 text-red-800' }
      return { text: 'Partially Approved', style: 'bg-amber-50 border-amber-200 text-amber-800' }
    }
    if (decision === 'reject') return { text: 'Claim Denied', style: 'bg-red-50 border-red-200 text-red-800' }
    if (decision === 'escalate') return { text: 'Under Review', style: 'bg-amber-50 border-amber-200 text-amber-800' }
    if (decision === 'approve') return { text: 'Claim Approved', style: 'bg-green-50 border-green-200 text-green-800' }
    return { text: 'Pending Review', style: 'bg-gray-50 border-gray-200 text-gray-600' }
  }

  const banner = getBanner()

  if (!activeClaim) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Customer Portal</h2>
          <p className="text-sm text-gray-500">No claims found. Claims will appear here once submitted.</p>
        </div>
      </div>
    )
  }

  // Format helper
  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Claim selector for demo */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xs text-gray-500">Viewing as customer for:</span>
        <select
          value={selectedClaimId}
          onChange={e => setSelectedClaimId(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-2 py-1"
        >
          {decidedClaims.map(c => (
            <option key={c.claimId} value={c.claimId}>{c.claimId}</option>
          ))}
          {!decidedClaims.find(c => c.claimId === 'CLM-00005') && (
            <option value="CLM-00005">CLM-00005 (Demo)</option>
          )}
        </select>
      </div>

      {/* === PENDING REVIEW STATE === */}
      {isPending && (
        <>
          {/* Status banner */}
          <div className="border border-blue-200 bg-blue-50 rounded-xl p-5 mb-4">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xl font-bold text-blue-800">Claim Under Review</span>
              <span className="animate-pulse bg-blue-200 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Processing</span>
            </div>
            <div className="text-sm text-blue-700">
              Claim {claimId} • {activeClaim.warrantyType} warranty • ${activeClaim.claimAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Review progress tracker */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Review Progress</h3>
            <div className="flex items-center gap-2 mb-5">
              {[
                { label: 'Received', done: true },
                { label: 'Verifying Coverage', done: true },
                { label: 'Reviewing Details', active: true },
                { label: 'Decision', done: false },
              ].map((step, i, arr) => (
                <div key={step.label} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                    step.done ? 'bg-green-100 text-green-800' :
                    step.active ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      step.done ? 'bg-green-500 text-white' :
                      step.active ? 'bg-blue-500 text-white animate-pulse' :
                      'bg-gray-300 text-white'
                    }`}>
                      {step.done ? '✓' : i + 1}
                    </span>
                    {step.label}
                  </div>
                  {i < arr.length - 1 && (
                    <div className={`w-6 h-0.5 ${step.done ? 'bg-green-300' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              Our team is currently reviewing the details of your repair claim. This includes verifying policy coverage, inspecting repair codes, and confirming labor documentation.
            </p>
          </div>

          {/* What we're checking */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">What we're verifying</h3>
            <ul className="space-y-2">
              {[
                { text: 'Warranty coverage is active for your vehicle and repair type', icon: '🛡️' },
                { text: 'Repair codes and labor hours are within policy guidelines', icon: '🔧' },
                { text: 'Vehicle mileage is within warranty limits', icon: '📏' },
                { text: 'Diagnostic evidence supports the repair performed', icon: '📋' },
              ].map(item => (
                <li key={item.text} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Claim details recap */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Your submitted claim details</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <span className="text-gray-500 text-xs">Reference</span>
                <p className="font-mono font-medium">{activeClaim.claimId}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Submitted</span>
                <p className="font-medium">{formatDate(activeClaim.claimDate)}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Vehicle (VIN)</span>
                <p className="font-mono text-xs">{activeClaim.vin}</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Mileage at service</span>
                <p className="font-medium">{activeClaim.vehicleMileage?.toLocaleString()} miles</p>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Repair performed</span>
                <div className="flex gap-1 mt-0.5">
                  {activeClaim.repairCodes.map(code => (
                    <span key={code} className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-0.5 rounded">{code}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-gray-500 text-xs">Claim amount</span>
                <p className="font-medium">${activeClaim.claimAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>

          {/* Timeline & next steps */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">What happens next</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-700 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">1</span>
                <p>Our review team will complete their assessment of your claim. <span className="text-gray-500">Most claims are reviewed within 2–3 business days.</span></p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-gray-100 text-gray-500 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">2</span>
                <p>You'll receive a notification here with the decision and a plain-language explanation.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-gray-100 text-gray-500 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">3</span>
                <p>If approved, payment will be issued to your servicing dealer. If denied, you'll have the option to contest the decision.</p>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-600">Have questions? Contact Toyota Warranty Support at <span className="font-medium">1-800-331-4331</span> with your reference number <span className="font-mono font-medium">{claimId}</span>.</p>
          </div>
        </>
      )}

      {/* === DECIDED STATE === */}
      {!isPending && (
        <>
          {/* Decision banner */}
          <div className={`border rounded-xl p-5 mb-4 ${banner.style}`}>
            <div className="text-xl font-bold mb-1">{banner.text}</div>
            <div className="text-sm">
              Claim {claimId} • {activeClaim.warrantyType} warranty • ${activeClaim.claimAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            {/* Empathetic journey guidance based on current state */}
            {decision === 'reject' && !contest && (
              <p className="text-sm mt-3 opacity-80">
                We understand this may not be the outcome you expected. You have the right to contest this decision — we'll review your case with a specialist.
              </p>
            )}
            {contest?.status === 'resolved' && contest.outcome === 'overturn' && (
              <p className="text-sm mt-3 opacity-80">
                Thank you for providing additional information. After specialist review, your claim has been approved.
              </p>
            )}
          </div>

          {/* Plain-language explanation */}
          {customerExplanation && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">What happened with your claim</h3>
              <p className="text-base text-gray-700 leading-relaxed mb-3">
                {customerExplanation.explanation}
              </p>
              <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500">
                <span className="font-semibold">Policy reference:</span> {customerExplanation.ruleReference}
              </div>
            </div>
          )}

          {/* Contest status tracker (if contest exists) */}
          {contest && contest.status !== 'none' && (
            <ContestStatusTracker status={contest.status} resolution={contest.resolution} outcome={contest.outcome} />
          )}

          {/* Resolution notification */}
          {contest?.status === 'resolved' && (
            <div className={`border rounded-xl p-5 mb-4 ${
              contest.outcome === 'overturn' ? 'bg-green-50 border-green-200' :
              contest.outcome === 'uphold' ? 'bg-red-50 border-red-200' :
              'bg-amber-50 border-amber-200'
            }`}>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Resolution</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-2">{contest.resolution}</p>
              <p className="text-xs text-gray-500 mt-3">This case is now closed. No further action is required.</p>
            </div>
          )}

          {/* Contest form (if eligible and not yet submitted) */}
          {customerExplanation?.contestEligible && !contest && (
            <div className="mt-4">
              <ContestForm claimId={claimId} onSubmit={onContestSubmit} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
