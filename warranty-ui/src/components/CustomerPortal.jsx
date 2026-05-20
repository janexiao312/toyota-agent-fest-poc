import { useState, useEffect } from 'react'
import ContestForm from './ContestForm'
import ContestStatusTracker from './ContestStatusTracker'

/* ── Demo vehicle data ── */
const VEHICLES = [
  {
    id: 'v1',
    year: 2023,
    model: 'RAV4 Hybrid',
    trim: 'XLE',
    vin: '4T1B11HK0JU123456',
    mileage: 44100,
    image: '/rav4.png',
    warranties: [
      { type: 'Basic', status: 'active', coverage: '36 mo / 36,000 mi', expires: '2026-08-15' },
      { type: 'Powertrain', status: 'active', coverage: '60 mo / 60,000 mi', expires: '2028-08-15' },
      { type: 'Hybrid Battery', status: 'active', coverage: '10 yr / 150,000 mi', expires: '2033-08-15' },
    ],
    recalls: [
      { id: 'RC-2025-114', title: 'Fuel pump module', status: 'open', date: '2025-02-10',
        description: 'The fuel pump module may stop operating, causing the engine to stall or not start. This can increase the risk of a crash.',
        remedy: 'Your dealer will replace the fuel pump module at no charge. The repair takes approximately 1–2 hours.' },
    ],
  },
  {
    id: 'v2',
    year: 2021,
    model: 'Camry',
    trim: 'SE',
    vin: '4T1BF3EK8AU123456',
    mileage: 34200,
    image: '/camry.png',
    warranties: [
      { type: 'Basic', status: 'expired', coverage: '36 mo / 36,000 mi', expires: '2024-04-01' },
      { type: 'Powertrain', status: 'active', coverage: '60 mo / 60,000 mi', expires: '2026-04-01' },
    ],
    recalls: [],
  },
]

export default function CustomerPortal({ claims, decisions, agentResults, contestData, onContestSubmit, onSubmitClaim, rules }) {
  /*
    Journey steps:
      'dashboard'  → view vehicles, warranties, recalls
      'select-warranty' → pick which warranty to claim against
      'submit-claim' → fill in claim details
      'processing' → agent is processing (auto-advances)
      'results'    → approved / rejected
      'dispute'    → contest form (if rejected)
  */
  const [step, setStep] = useState('dashboard')
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [selectedWarranty, setSelectedWarranty] = useState(null)
  const [claimForm, setClaimForm] = useState({ repairCode: '', description: '', mileage: '' })
  const [submittedClaimId, setSubmittedClaimId] = useState(null)
  const [issueDescription, setIssueDescription] = useState('')
  const [expandedRecall, setExpandedRecall] = useState(null)
  const [identifiedWarranty, setIdentifiedWarranty] = useState(null)
  const [isIdentifying, setIsIdentifying] = useState(false)
  const [activeTab, setActiveTab] = useState('vehicles') // 'vehicles' | 'claims'
  const [tabKey, setTabKey] = useState(0)
  const [customerClaims, setCustomerClaims] = useState([
    { id: 'CLM-00005', vehicle: '2023 RAV4 Hybrid XLE', warranty: 'Powertrain', date: '2026-05-20', issue: 'Transmission is slipping when shifting between gears at highway speeds', status: 'in_review', amount: '$0.00' },
    { id: 'CLM-00001', vehicle: '2021 Camry SE', warranty: 'Basic', date: '2025-03-12', issue: 'Front brake pad replacement — noise on deceleration', status: 'approved', amount: '$187.50' },
    { id: 'CLM-00008', vehicle: '2023 RAV4 Hybrid XLE', warranty: 'Hybrid Battery', date: '2025-04-22', issue: 'Battery warning light on dashboard, reduced EV range', status: 'in_review', amount: '$0.00' },
    { id: 'CLM-00003', vehicle: '2021 Camry SE', warranty: 'Basic', date: '2024-11-05', issue: 'AC compressor not engaging — no cold air', status: 'approved', amount: '$425.00' },
    { id: 'CLM-00006', vehicle: '2023 RAV4 Hybrid XLE', warranty: 'Powertrain', date: '2024-08-18', issue: 'Engine stalling intermittently at idle', status: 'rejected', amount: '$0.00' },
  ])
  const switchTab = (tab) => { setActiveTab(tab); setTabKey(k => k + 1) }

  // For demo — match to an existing claim to show agent results
  const activeClaim = submittedClaimId
    ? claims.find(c => c.claimId === submittedClaimId)
    : null
  const decision = activeClaim ? decisions[activeClaim.claimId] : null
  const contest = activeClaim ? contestData[activeClaim.claimId] : null
  const validation = activeClaim ? agentResults?.[activeClaim.claimId]?.validation : null

  // Auto-advance from processing → results when a decision arrives
  useEffect(() => {
    if (step === 'processing' && decision) {
      const t = setTimeout(() => setStep('results'), 1500)
      return () => clearTimeout(t)
    }
  }, [step, decision])

  // Update submitted claim status when a decision arrives
  useEffect(() => {
    if (submittedClaimId && decision) {
      setCustomerClaims(prev => prev.map(c =>
        c.id === submittedClaimId
          ? { ...c, status: decision.decision === 'approved' ? 'approved' : 'rejected' }
          : c
      ))
    }
  }, [submittedClaimId, decision])

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Generate customer explanation
  const getExplanation = () => {
    if (!validation || !activeClaim) return null
    const failures = validation.results?.filter(r => !r.passed) || []
    if (failures.length === 0) return null
    const mainRule = failures[0]
    return {
      explanation: `Your warranty claim (${activeClaim.claimId}) for ${activeClaim.warrantyType} coverage was reviewed and a concern was identified. ${mainRule.message}`,
      ruleReference: `${mainRule.ruleId}: ${mainRule.message}`,
      contestEligible: decision === 'reject' || decision === 'escalate'
    }
  }

  const customerExplanation = getExplanation()

  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle)
    setIssueDescription('')
    setIdentifiedWarranty(null)
    setStep('describe-issue')
  }

  /* Simple keyword-based warranty identification for demo.
     In production this would call an LLM / classification agent. */
  const identifyWarranty = (description) => {
    const lower = description.toLowerCase()
    const keywords = {
      'Hybrid Battery': ['battery', 'hybrid', 'ev', 'charge', 'charging', 'cell', 'high voltage', 'hv battery', 'traction battery', 'battery pack'],
      'Powertrain': ['engine', 'transmission', 'drivetrain', 'motor', 'ecm', 'ecu', 'throttle', 'turbo', 'fuel injection', 'cylinder', 'piston', 'crankshaft', 'torque converter', 'gearbox', 'power loss', 'won\'t start', 'stalling', 'misfire', 'check engine', 'acceleration', 'axle', 'differential', 'drive shaft'],
      'Basic': ['brake', 'light', 'sensor', 'window', 'door', 'ac', 'air conditioning', 'heater', 'radio', 'speaker', 'seat', 'mirror', 'wiper', 'horn', 'lock', 'key', 'noise', 'squeal', 'rattle', 'leak', 'warning light', 'dash', 'display', 'steering', 'suspension', 'shock', 'strut'],
    }
    for (const [warrantyType, words] of Object.entries(keywords)) {
      if (words.some(w => lower.includes(w))) {
        return warrantyType
      }
    }
    return 'Basic' // default fallback
  }

  const handleDescribeSubmit = (e) => {
    e.preventDefault()
    if (!issueDescription.trim()) return
    setIsIdentifying(true)
    // Simulate AI identification delay
    setTimeout(() => {
      const matched = identifyWarranty(issueDescription)
      const warranty = selectedVehicle.warranties.find(w => w.type === matched && w.status === 'active')
        || selectedVehicle.warranties.find(w => w.status === 'active') // fallback to first active
      setIdentifiedWarranty({ type: warranty.type, warranty, reason: getWarrantyReason(matched, issueDescription) })
      setIsIdentifying(false)
    }, 1800)
  }

  const getWarrantyReason = (type, description) => {
    const reasons = {
      'Hybrid Battery': 'Your description mentions hybrid or battery-related components, which fall under the Hybrid Battery warranty coverage.',
      'Powertrain': 'Based on your description, this issue relates to the engine, transmission, or drivetrain — covered by your Powertrain warranty.',
      'Basic': 'This issue appears to involve general vehicle components covered under the Basic warranty.',
    }
    return reasons[type] || reasons['Basic']
  }

  const handleAcceptWarranty = () => {
    setSelectedWarranty(identifiedWarranty.warranty)
    setClaimForm(prev => ({ ...prev, mileage: String(selectedVehicle.mileage), description: issueDescription }))
    setStep('submit-claim')
  }

  const handleSubmitClaim = (e) => {
    e.preventDefault()
    // For demo, map to CLM-00005 (powertrain ECM claim) to show agent results
    const demoClaimId = 'CLM-00005'
    setSubmittedClaimId(demoClaimId)

    // Update the existing demo claim with the user's actual input
    const vehicleLabel = `${selectedVehicle.year} ${selectedVehicle.model} ${selectedVehicle.trim}`
    const warrantyType = identifiedWarranty?.type || selectedWarranty?.type || 'Basic'
    const today = new Date().toISOString().slice(0, 10)
    setCustomerClaims(prev => {
      const exists = prev.some(c => c.id === demoClaimId)
      if (exists) {
        return prev.map(c => c.id === demoClaimId ? { ...c, vehicle: vehicleLabel, warranty: warrantyType, date: today, issue: issueDescription || claimForm.description, status: 'in_review' } : c)
      }
      return [{ id: demoClaimId, vehicle: vehicleLabel, warranty: warrantyType, date: today, issue: issueDescription || claimForm.description, status: 'in_review', amount: '$0.00' }, ...prev]
    })

    setStep('processing')
  }

  const handleDisputeClick = () => {
    setStep('dispute')
  }

  const handleContestSubmitLocal = (claimId, reason, evidence) => {
    onContestSubmit(claimId, reason, evidence)
    setStep('results') // Go back to results to show tracker
  }

  /* ──────────────────────────────────────────────────────
     STEP 1: DASHBOARD — vehicles, warranties, recalls
  ────────────────────────────────────────────────────── */

  /* Demo claims history for this customer */

  const statusStyles = {
    approved: 'bg-emerald-50 text-emerald-700',
    in_review: 'bg-blue-50 text-blue-700',
    rejected: 'bg-red-50 text-red-700',
  }
  const statusLabels = { approved: 'Approved', in_review: 'In Review', rejected: 'Rejected' }

  if (step === 'dashboard') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Tab navigation */}
        <div className="flex items-center gap-6 border-b border-toyota-200 mb-6">
          <button
            onClick={() => switchTab('vehicles')}
            className={`pb-3 text-sm font-semibold transition-colors cursor-pointer ${activeTab === 'vehicles' ? 'text-toyota-ink border-b-2 border-toyota-red' : 'text-toyota-400 hover:text-toyota-600'}`}
          >
            My Vehicles
          </button>
          <button
            onClick={() => switchTab('claims')}
            className={`pb-3 text-sm font-semibold transition-colors cursor-pointer relative ${activeTab === 'claims' ? 'text-toyota-ink border-b-2 border-toyota-red' : 'text-toyota-400 hover:text-toyota-600'}`}
          >
            My Claims
            <span className="ml-1.5 text-[10px] bg-toyota-100 text-toyota-600 rounded-full px-1.5 py-0.5 font-bold">{customerClaims.length}</span>
          </button>
        </div>

        {activeTab === 'vehicles' && (
          <div key={tabKey} className="animate-fade-in">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-toyota-ink tracking-tight">My Vehicles &amp; Warranties</h1>
              <p className="text-sm text-toyota-500 mt-1">Select a vehicle to view coverage details or report an issue.</p>
            </div>

            <div className="space-y-6">
          {VEHICLES.map(vehicle => (
            <div key={vehicle.id} className="bg-white border border-toyota-200 rounded-lg overflow-hidden">
              {/* Vehicle header */}
              <div className="px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-16 rounded-lg bg-toyota-50 overflow-hidden flex items-center justify-center">
                    <img src={vehicle.image} alt={`${vehicle.year} ${vehicle.model}`} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-toyota-ink">
                      {vehicle.year} Toyota {vehicle.model}
                      <span className="text-toyota-500 font-medium text-sm ml-2">{vehicle.trim}</span>
                    </div>
                    <div className="text-xs text-toyota-500 font-mono mt-0.5">VIN: {vehicle.vin}</div>
                    <div className="text-xs text-toyota-500 mt-0.5">{vehicle.mileage.toLocaleString()} miles</div>
                  </div>
                </div>
                <button
                  onClick={() => handleSelectVehicle(vehicle)}
                  className="bg-toyota-red text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-toyota-red-hover transition-colors uppercase tracking-wider"
                >
                  Report an Issue
                </button>
              </div>

              {/* Active warranties */}
              <div className="border-t border-toyota-200 px-6 py-4">
                <h3 className="text-[11px] uppercase tracking-wider text-toyota-500 font-semibold mb-3">Active Warranties</h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  {vehicle.warranties.map(w => (
                    <div
                      key={w.type}
                      className={`border rounded-md px-4 py-3 ${
                        w.status === 'active'
                          ? 'border-status-clean-tint bg-status-clean-tint/30'
                          : 'border-toyota-200 bg-toyota-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${w.status === 'active' ? 'bg-status-clean' : 'bg-toyota-400'}`} />
                        <span className="text-sm font-semibold text-toyota-ink">{w.type}</span>
                      </div>
                      <div className="text-xs text-toyota-500">{w.coverage}</div>
                      <div className="text-xs text-toyota-500 mt-0.5">
                        {w.status === 'active' ? `Expires ${formatDate(w.expires)}` : 'Expired'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recalls */}
              {vehicle.recalls.length > 0 && (
                <div className="border-t border-toyota-200 px-6 py-4">
                  <h3 className="text-[11px] uppercase tracking-wider text-toyota-500 font-semibold mb-3">Open Recalls</h3>
                  {vehicle.recalls.map(recall => {
                    const isExpanded = expandedRecall === recall.id
                    return (
                      <div key={recall.id} className="border border-status-anomaly-tint rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedRecall(isExpanded ? null : recall.id)}
                          className="w-full flex items-center gap-3 bg-status-anomaly-tint/30 px-4 py-3 text-left hover:bg-status-anomaly-tint/50 transition-colors cursor-pointer"
                        >
                          <svg className="w-5 h-5 text-status-anomaly shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-toyota-ink">{recall.title}</div>
                            <div className="text-xs text-toyota-500">{recall.id} · Issued {formatDate(recall.date)}</div>
                          </div>
                          <svg className={`w-4 h-4 text-toyota-400 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>
                        {isExpanded && (
                          <div className="px-4 py-3 bg-white border-t border-status-anomaly-tint/60 space-y-2">
                            <p className="text-xs text-toyota-700"><span className="font-semibold text-toyota-600">Risk:</span> {recall.description}</p>
                            <p className="text-xs text-toyota-700"><span className="font-semibold text-toyota-600">Remedy:</span> {recall.remedy}</p>
                            <div className="flex items-center gap-2 pt-0.5">
                              <a href="https://www.toyota.com/owners/schedule-service/" target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-toyota-red text-white text-xs font-semibold rounded hover:bg-red-700 transition-colors">
                                Schedule Service
                              </a>
                              <span className="text-[11px] text-toyota-600">No charge at any Toyota dealer</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
          </div>
        )}

        {activeTab === 'claims' && (
          <div key={tabKey} className="animate-fade-in">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-toyota-ink tracking-tight">My Claims</h1>
              <p className="text-sm text-toyota-500 mt-1">Track current and past warranty claims across all your vehicles.</p>
            </div>

            <div className="bg-white border border-toyota-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-toyota-200 bg-toyota-50/60">
                    <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-toyota-500 font-semibold">Claim</th>
                    <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-toyota-500 font-semibold">Vehicle</th>
                    <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-toyota-500 font-semibold">Issue</th>
                    <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-toyota-500 font-semibold">Date</th>
                    <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wider text-toyota-500 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customerClaims.map(claim => (
                    <tr key={claim.id} className="border-b border-toyota-100 last:border-b-0 hover:bg-toyota-50/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs font-semibold text-toyota-ink">{claim.id}</div>
                        <div className="text-[11px] text-toyota-400 mt-0.5">{claim.warranty}</div>
                      </td>
                      <td className="px-4 py-3 text-toyota-700">{claim.vehicle}</td>
                      <td className="px-4 py-3 text-toyota-600 max-w-[260px]">
                        <div className="truncate">{claim.issue}</div>
                      </td>
                      <td className="px-4 py-3 text-toyota-500 whitespace-nowrap">{formatDate(claim.date)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] uppercase tracking-wider font-semibold rounded-full px-2.5 py-1 ${statusStyles[claim.status]}`}>
                          {statusLabels[claim.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )
  }

  /* ──────────────────────────────────────────────────────
     STEP 2: DESCRIBE ISSUE — AI identifies warranty
  ────────────────────────────────────────────────────── */
  if (step === 'describe-issue') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-toyota-500 mb-6 flex items-center gap-2">
          <button onClick={() => setStep('dashboard')} className="hover:text-toyota-ink">My Vehicles</button>
          <span className="text-toyota-300">/</span>
          <span className="text-toyota-ink font-medium">{selectedVehicle.year} {selectedVehicle.model}</span>
        </div>

        <h2 className="text-xl font-bold text-toyota-ink mb-1">What's going on with your vehicle?</h2>
        <p className="text-sm text-toyota-500 mb-6">Describe the issue in your own words and we'll identify which warranty covers it.</p>

        {/* Vehicle context */}
        <div className="bg-toyota-50 border border-toyota-200 rounded-lg p-4 mb-6 flex items-center gap-4">
          <div className="w-20 h-13 rounded-md bg-toyota-50 overflow-hidden flex items-center justify-center">
            <img src={selectedVehicle.image} alt={`${selectedVehicle.year} ${selectedVehicle.model}`} className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="text-sm font-semibold text-toyota-ink">{selectedVehicle.year} Toyota {selectedVehicle.model} {selectedVehicle.trim}</div>
            <div className="text-xs text-toyota-500 font-mono">{selectedVehicle.vin} · {selectedVehicle.mileage.toLocaleString()} mi</div>
          </div>
        </div>

        {/* Issue description form */}
        {!identifiedWarranty && (
          <form onSubmit={handleDescribeSubmit}>
            <div className="bg-white border border-toyota-200 rounded-lg p-6 mb-4">
              <label className="block">
                <span className="text-[11px] uppercase tracking-wider text-toyota-500 font-semibold">Describe the issue</span>
                <textarea
                  value={issueDescription}
                  onChange={e => setIssueDescription(e.target.value)}
                  placeholder='e.g. "My engine is making a knocking sound and the check engine light came on" or "The brakes are squealing when I slow down"'
                  rows={5}
                  className="mt-1.5 w-full bg-white border border-toyota-200 rounded-md px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-toyota-red focus:ring-1 focus:ring-toyota-red"
                  required
                  disabled={isIdentifying}
                />
              </label>

              {/* Helpful prompts */}
              <div className="mt-3">
                <span className="text-[11px] uppercase tracking-wider text-toyota-400 font-semibold">Common issues:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    'Check engine light is on',
                    'Brakes are making noise',
                    'Hybrid battery warning',
                    'Car won\'t start',
                    'Warning light on dashboard',
                    'Transmission is slipping',
                  ].map(prompt => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setIssueDescription(prompt)}
                      className="text-xs bg-toyota-50 border border-toyota-200 hover:border-toyota-400 text-toyota-600 px-3 py-1.5 rounded-md transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep('dashboard')}
                className="bg-white border border-toyota-200 hover:border-toyota-300 text-toyota-700 px-5 py-2.5 rounded-md text-sm font-medium"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isIdentifying || !issueDescription.trim()}
                className="bg-toyota-ink text-white px-5 py-2.5 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isIdentifying ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Identifying coverage…
                  </>
                ) : (
                  'Identify My Warranty'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Warranty identification result */}
        {identifiedWarranty && (
          <div className="space-y-4">
            {/* What you described */}
            <div className="bg-white border border-toyota-200 rounded-lg p-5">
              <h3 className="text-[11px] uppercase tracking-wider text-toyota-500 font-semibold mb-2">What you described</h3>
              <p className="text-sm text-toyota-ink italic">"{issueDescription}"</p>
            </div>

            {/* Identified warranty */}
            <div className="bg-status-clean-tint/30 border border-status-clean-tint rounded-lg p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-status-clean flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-[11px] uppercase tracking-wider text-status-clean font-semibold mb-1">Warranty Identified</div>
                  <div className="text-lg font-bold text-toyota-ink mb-1">{identifiedWarranty.type} Warranty</div>
                  <p className="text-sm text-toyota-600 leading-relaxed">{identifiedWarranty.reason}</p>
                  <div className="text-xs text-toyota-500 mt-2">
                    Coverage: {identifiedWarranty.warranty.coverage} · Expires {formatDate(identifiedWarranty.warranty.expires)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => { setIdentifiedWarranty(null); setIssueDescription('') }}
                className="bg-white border border-toyota-200 hover:border-toyota-300 text-toyota-700 px-5 py-2.5 rounded-md text-sm font-medium"
              >
                Try a different description
              </button>
              <button
                onClick={handleAcceptWarranty}
                className="bg-toyota-red text-white border border-toyota-red hover:bg-toyota-red-hover px-5 py-2.5 rounded-md text-sm font-semibold uppercase tracking-wider transition-colors"
              >
                Continue with {identifiedWarranty.type} Warranty
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  /* ──────────────────────────────────────────────────────
     STEP 3: SUBMIT CLAIM — claim form
  ────────────────────────────────────────────────────── */
  if (step === 'submit-claim') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-toyota-500 mb-6 flex items-center gap-2">
          <button onClick={() => setStep('dashboard')} className="hover:text-toyota-ink">My Vehicles</button>
          <span className="text-toyota-300">/</span>
          <button onClick={() => setStep('describe-issue')} className="hover:text-toyota-ink">{selectedVehicle.year} {selectedVehicle.model}</button>
          <span className="text-toyota-300">/</span>
          <span className="text-toyota-ink font-medium">{selectedWarranty.type} Claim</span>
        </div>

        <h2 className="text-xl font-bold text-toyota-ink mb-1">Submit Warranty Claim</h2>
        <p className="text-sm text-toyota-500 mb-6">Provide details about the repair performed under your {selectedWarranty.type} warranty.</p>

        {/* Vehicle summary card */}
        <div className="bg-toyota-50 border border-toyota-200 rounded-lg p-4 mb-6 flex items-center gap-4">
          <div className="w-20 h-13 rounded-md bg-toyota-50 overflow-hidden flex items-center justify-center">
            <img src={selectedVehicle.image} alt={`${selectedVehicle.year} ${selectedVehicle.model}`} className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="text-sm font-semibold text-toyota-ink">{selectedVehicle.year} Toyota {selectedVehicle.model} {selectedVehicle.trim}</div>
            <div className="text-xs text-toyota-500 font-mono">{selectedVehicle.vin} · {selectedWarranty.type} Warranty</div>
          </div>
        </div>

        <form onSubmit={handleSubmitClaim} className="space-y-5">
          <div className="bg-white border border-toyota-200 rounded-lg p-6 space-y-5">
            <label className="block">
              <span className="text-[11px] uppercase tracking-wider text-toyota-500 font-semibold">Mileage at Service</span>
              <input
                type="number"
                value={claimForm.mileage}
                onChange={e => setClaimForm(prev => ({ ...prev, mileage: e.target.value }))}
                placeholder="e.g. 34200"
                className="mt-1.5 w-full bg-white border border-toyota-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-toyota-red focus:ring-1 focus:ring-toyota-red"
                required
              />
            </label>

            <label className="block">
              <span className="text-[11px] uppercase tracking-wider text-toyota-500 font-semibold">Description of Repair</span>
              <textarea
                value={claimForm.description}
                onChange={e => setClaimForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the issue and the repair performed…"
                rows={4}
                className="mt-1.5 w-full bg-white border border-toyota-200 rounded-md px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-toyota-red focus:ring-1 focus:ring-toyota-red"
                required
              />
            </label>

            <label className="block">
              <span className="text-[11px] uppercase tracking-wider text-toyota-500 font-semibold">Upload Supporting Documents</span>
              <div className="mt-1.5 border-2 border-dashed border-toyota-200 rounded-md px-4 py-6 text-center text-sm text-toyota-500 hover:border-toyota-400 transition-colors cursor-pointer">
                <svg className="w-6 h-6 mx-auto mb-2 text-toyota-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                Drop files here or click to browse
                <div className="text-xs text-toyota-400 mt-1">Invoices, photos, diagnostic reports</div>
              </div>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep('describe-issue')}
              className="bg-white border border-toyota-200 hover:border-toyota-300 text-toyota-700 px-5 py-2.5 rounded-md text-sm font-medium"
            >
              Back
            </button>
            <button
              type="submit"
              className="bg-toyota-red text-white border border-toyota-red hover:bg-toyota-red-hover px-5 py-2.5 rounded-md text-sm font-semibold uppercase tracking-wider transition-colors"
            >
              Submit Claim
            </button>
          </div>
        </form>
      </div>
    )
  }

  /* ──────────────────────────────────────────────────────
     STEP 4: PROCESSING — agent is reviewing
  ────────────────────────────────────────────────────── */
  if (step === 'processing') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white border border-toyota-200 rounded-lg p-8 text-center">
          {/* Animated spinner */}
          <div className="mx-auto mb-6 w-16 h-16 rounded-full border-4 border-toyota-200 border-t-toyota-red animate-spin" />

          <h2 className="text-xl font-bold text-toyota-ink mb-2">Processing Your Claim</h2>
          <p className="text-sm text-toyota-500 max-w-md mx-auto mb-8">
            Our AI agent is reviewing your claim against warranty policy rules, verifying coverage, and checking repair documentation.
          </p>

          {/* Step progress */}
          <div className="max-w-sm mx-auto space-y-3 text-left">
            {[
              { label: 'Received claim submission', done: true },
              { label: 'Verifying warranty coverage', done: true },
              { label: 'Checking repair codes against policy', active: true },
              { label: 'Generating decision', done: false },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                  s.done ? 'bg-status-clean text-white' :
                  s.active ? 'bg-toyota-red text-white animate-pulse' :
                  'bg-toyota-200 text-toyota-400'
                }`}>
                  {s.done ? '✓' : s.active ? '…' : i + 1}
                </div>
                <span className={`text-sm ${s.done ? 'text-toyota-ink' : s.active ? 'text-toyota-ink font-medium' : 'text-toyota-400'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  /* ──────────────────────────────────────────────────────
     STEP 5: RESULTS — approved / rejected
  ────────────────────────────────────────────────────── */
  if (step === 'results' && activeClaim) {
    const isApproved = decision === 'approve'
    const isRejected = decision === 'reject'
    const isEscalated = decision === 'escalate'

    const getBanner = () => {
      if (contest?.status === 'resolved') {
        if (contest.outcome === 'overturn') return { text: 'Decision Overturned — Claim Approved', icon: '✓', style: 'border-status-clean-tint bg-status-clean-tint/30 text-status-clean' }
        if (contest.outcome === 'uphold') return { text: 'Decision Upheld — Claim Denied', icon: '✕', style: 'border-toyota-red-border bg-toyota-red-tint text-toyota-red' }
        return { text: 'Partially Approved', icon: '~', style: 'border-status-anomaly-tint bg-status-anomaly-tint/30 text-status-anomaly' }
      }
      if (isApproved) return { text: 'Claim Approved', icon: '✓', style: 'border-status-clean-tint bg-status-clean-tint/30 text-status-clean' }
      if (isRejected) return { text: 'Claim Denied', icon: '✕', style: 'border-toyota-red-border bg-toyota-red-tint text-toyota-red' }
      if (isEscalated) return { text: 'Under Review', icon: '⟳', style: 'border-status-anomaly-tint bg-status-anomaly-tint/30 text-status-anomaly' }
      return { text: 'Pending', icon: '…', style: 'border-toyota-200 bg-toyota-50 text-toyota-600' }
    }

    const banner = getBanner()

    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Back to dashboard */}
        <button onClick={() => { setStep('dashboard'); setSubmittedClaimId(null) }} className="text-sm text-toyota-500 hover:text-toyota-ink mb-6 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
          Back to My Vehicles
        </button>

        {/* Decision banner */}
        <div className={`border rounded-lg p-5 mb-5 ${banner.style}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{banner.icon}</span>
            <div>
              <div className="text-lg font-bold">{banner.text}</div>
              <div className="text-sm opacity-80 mt-0.5">
                {activeClaim.claimId} · {activeClaim.warrantyType} warranty · ${activeClaim.claimAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
          {isApproved && (
            <p className="text-sm mt-3 opacity-80">
              Your claim has been approved. Payment will be issued to your servicing dealer within 5–7 business days.
            </p>
          )}
          {isRejected && !contest && (
            <p className="text-sm mt-3 opacity-80">
              We understand this may not be the outcome you expected. You have the right to dispute this decision.
            </p>
          )}
        </div>

        {/* Explanation */}
        {customerExplanation && (isRejected || isEscalated) && (
          <div className="bg-white border border-toyota-200 rounded-lg p-5 mb-5">
            <h3 className="text-[11px] uppercase tracking-wider text-toyota-500 font-semibold mb-3">What Happened</h3>
            <p className="text-sm text-toyota-ink leading-relaxed mb-3">{customerExplanation.explanation}</p>
            <div className="bg-toyota-50 rounded-md px-3 py-2 text-xs text-toyota-500">
              <span className="font-semibold">Policy reference:</span> {customerExplanation.ruleReference}
            </div>
          </div>
        )}

        {/* Claim details */}
        <div className="bg-white border border-toyota-200 rounded-lg p-5 mb-5">
          <h3 className="text-[11px] uppercase tracking-wider text-toyota-500 font-semibold mb-3">Claim Details</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <span className="text-toyota-500 text-xs">Reference</span>
              <p className="font-mono font-medium text-toyota-ink">{activeClaim.claimId}</p>
            </div>
            <div>
              <span className="text-toyota-500 text-xs">Submitted</span>
              <p className="font-medium text-toyota-ink">{formatDate(activeClaim.claimDate)}</p>
            </div>
            <div>
              <span className="text-toyota-500 text-xs">Vehicle (VIN)</span>
              <p className="font-mono text-xs text-toyota-ink">{activeClaim.vin}</p>
            </div>
            <div>
              <span className="text-toyota-500 text-xs">Mileage at Service</span>
              <p className="font-medium text-toyota-ink">{activeClaim.vehicleMileage?.toLocaleString()} mi</p>
            </div>
            <div>
              <span className="text-toyota-500 text-xs">Repair Codes</span>
              <div className="flex gap-1 mt-0.5">
                {activeClaim.repairCodes.map(code => (
                  <span key={code} className="bg-toyota-100 text-toyota-700 text-xs font-medium px-2 py-0.5 rounded font-mono">{code}</span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-toyota-500 text-xs">Claim Amount</span>
              <p className="font-semibold text-toyota-ink">${activeClaim.claimAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        {/* Contest tracker */}
        {contest && contest.status !== 'none' && (
          <ContestStatusTracker status={contest.status} resolution={contest.resolution} outcome={contest.outcome} />
        )}

        {/* Resolution detail */}
        {contest?.status === 'resolved' && (
          <div className={`border rounded-lg p-5 mb-5 ${
            contest.outcome === 'overturn' ? 'bg-status-clean-tint/30 border-status-clean-tint' :
            contest.outcome === 'uphold' ? 'bg-toyota-red-tint border-toyota-red-border' :
            'bg-status-anomaly-tint/30 border-status-anomaly-tint'
          }`}>
            <h3 className="text-[11px] uppercase tracking-wider text-toyota-500 font-semibold mb-2">Specialist Resolution</h3>
            <p className="text-sm text-toyota-ink leading-relaxed">{contest.resolution}</p>
            <p className="text-xs text-toyota-500 mt-3">This case is now closed.</p>
          </div>
        )}

        {/* Dispute button (if rejected and no contest yet) */}
        {(isRejected || isEscalated) && !contest && (
          <button
            onClick={handleDisputeClick}
            className="w-full bg-white border border-toyota-red text-toyota-red hover:bg-toyota-red-tint px-4 py-3 rounded-lg font-semibold text-sm transition-colors"
          >
            Dispute This Decision
          </button>
        )}

        {isApproved && !contest && (
          <button
            onClick={() => { setStep('dashboard'); setSubmittedClaimId(null) }}
            className="w-full bg-toyota-ink text-white px-4 py-3 rounded-lg font-semibold text-sm hover:bg-toyota-700 transition-colors"
          >
            Done — Back to My Vehicles
          </button>
        )}
      </div>
    )
  }

  /* ──────────────────────────────────────────────────────
     STEP 6: DISPUTE — contest form
  ────────────────────────────────────────────────────── */
  if (step === 'dispute' && activeClaim) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button onClick={() => setStep('results')} className="text-sm text-toyota-500 hover:text-toyota-ink mb-6 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
          Back to Results
        </button>

        <h2 className="text-xl font-bold text-toyota-ink mb-1">Dispute Decision</h2>
        <p className="text-sm text-toyota-500 mb-6">
          Provide your reason for disputing and any supporting evidence. Your case will be reviewed by a warranty specialist.
        </p>

        <ContestForm
          claimId={activeClaim.claimId}
          onSubmit={handleContestSubmitLocal}
        />
      </div>
    )
  }

  // Fallback
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="bg-white border border-toyota-200 rounded-lg p-8 text-center">
        <h2 className="text-lg font-semibold text-toyota-ink mb-2">Customer Portal</h2>
        <p className="text-sm text-toyota-500">Loading your warranty information…</p>
      </div>
    </div>
  )
}
