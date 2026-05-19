import { useState } from 'react'
import ResolutionBriefPanel from './ResolutionBriefPanel'

export default function SpecialistWorkspace({ claims, decisions, agentResults, contestData, rules, onResolve }) {
  const [notes, setNotes] = useState('')
  const [selectedClaimId, setSelectedClaimId] = useState('CLM-00005')

  // Filter to claims with active contests
  const contestedClaims = claims.filter(c =>
    contestData[c.claimId] && contestData[c.claimId].status !== 'none' && contestData[c.claimId].status !== 'resolved'
  )

  const activeClaim = claims.find(c => c.claimId === selectedClaimId)
  const contest = contestData[selectedClaimId]
  const validation = agentResults?.[selectedClaimId]?.validation
  const summary = agentResults?.[selectedClaimId]?.summary

  const handleAction = (outcome) => {
    if (!notes.trim()) return
    onResolve(selectedClaimId, outcome, notes.trim())
    setNotes('')
  }

  if (!activeClaim) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Specialist Workspace</h2>
          <p className="text-sm text-gray-500">No contested claims to review. Contests will appear here when customers submit them through the Customer Portal.</p>
        </div>
      </div>
    )
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Claim selector */}
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Specialist Resolution Workspace</h2>
        {contestedClaims.length > 0 && (
          <select
            value={selectedClaimId}
            onChange={e => setSelectedClaimId(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1"
          >
            {contestedClaims.map(c => (
              <option key={c.claimId} value={c.claimId}>{c.claimId} — {contestData[c.claimId]?.status}</option>
            ))}
            {!contestedClaims.find(c => c.claimId === 'CLM-00005') && (
              <option value="CLM-00005">CLM-00005 (Demo)</option>
            )}
          </select>
        )}
        {contest?.status === 'resolved' && (
          <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">Resolved</span>
        )}
      </div>

      <div className="grid grid-cols-5 gap-5">
        {/* Left column — 60% — Claim and contest context */}
        <div className="col-span-3 space-y-4">
          {/* Original claim metadata */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Original Claim</h3>
            <div className="grid grid-cols-3 gap-x-6 gap-y-2 text-sm">
              <div><span className="text-gray-500">Claim ID</span><p className="font-mono font-medium">{activeClaim.claimId}</p></div>
              <div><span className="text-gray-500">Dealer</span><p className="font-medium">{activeClaim.dealerId}</p></div>
              <div><span className="text-gray-500">VIN</span><p className="font-mono text-xs">{activeClaim.vin}</p></div>
              <div><span className="text-gray-500">Date</span><p className="font-medium">{formatDate(activeClaim.claimDate)}</p></div>
              <div><span className="text-gray-500">Mileage</span><p className="font-medium">{activeClaim.vehicleMileage?.toLocaleString()} mi</p></div>
              <div><span className="text-gray-500">Amount</span><p className="font-medium">${activeClaim.claimAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p></div>
            </div>
            <div className="mt-3 flex gap-2">
              {activeClaim.repairCodes.map(code => (
                <span key={code} className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded">{code}</span>
              ))}
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${activeClaim.warrantyType === 'powertrain' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                {activeClaim.warrantyType}
              </span>
            </div>
          </div>

          {/* Original AI decision */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Original AI Decision</h3>
            {summary && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border capitalize ${
                    summary.recommendation === 'reject' ? 'bg-red-100 text-red-800 border-red-200' :
                    summary.recommendation === 'review' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                    'bg-green-100 text-green-800 border-green-200'
                  }`}>
                    {summary.recommendation}
                  </span>
                  <span className="text-xs text-gray-500">{summary.confidence} confidence</span>
                </div>
                <p className="text-sm text-gray-700">{summary.summary}</p>
              </div>
            )}
            {validation && (
              <div className="space-y-1">
                {validation.results?.filter(r => !r.passed).map(rule => (
                  <div key={rule.ruleId} className="flex items-center gap-2 text-sm">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{rule.ruleId}</span>
                    <span className="text-red-600 font-medium text-xs">FAIL</span>
                    <span className="text-gray-500 text-xs">{rule.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer contest */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Customer Contest</h3>
            {contest ? (
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500">Reason for contest:</span>
                  <p className="text-sm text-gray-700 mt-1">{contest.reason || 'The diagnostic report from my independent mechanic confirms the ECM fault was present and required replacement. The intermittent connection issue is well-documented in Toyota TSB-0142-21.'}</p>
                </div>
                {(contest.evidence?.length > 0 || !contest.reason) && (
                  <div>
                    <span className="text-xs text-gray-500">Supporting evidence:</span>
                    <div className="flex gap-2 mt-1">
                      {(contest.evidence?.length > 0 ? contest.evidence : ['independent_diagnostic_report.pdf', 'TSB-0142-21_reference.pdf']).map((file, i) => (
                        <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded flex items-center gap-1">
                          📎 {file}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No contest submitted yet. Use the Customer Portal to submit a contest for this claim.</p>
            )}
          </div>
        </div>

        {/* Right column — 40% — AI brief + actions */}
        <div className="col-span-2 space-y-4">
          <ResolutionBriefPanel claim={activeClaim} validation={validation} contest={contest} />

          {/* Resolution action bar */}
          {contest?.status !== 'resolved' && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Resolution</h3>

              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Resolution notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value.slice(0, 500))}
                  placeholder="Enter your resolution reasoning..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:border-gray-400"
                />
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">{notes.length}/500</span>
                  {!notes.trim() && (
                    <span className="text-xs text-amber-600">Notes required before issuing a decision</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleAction('overturn')}
                  disabled={!notes.trim()}
                  className="bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Overturn Decision
                </button>
                <button
                  onClick={() => handleAction('uphold')}
                  disabled={!notes.trim()}
                  className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Uphold Decision
                </button>
                <button
                  onClick={() => handleAction('partial')}
                  disabled={!notes.trim()}
                  className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Partial Approval
                </button>
                <button
                  onClick={() => {
                    if (!notes.trim()) return
                    // Request more info just resets status
                  }}
                  disabled={!notes.trim()}
                  className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Request More Info
                </button>
              </div>
            </div>
          )}

          {contest?.status === 'resolved' && (
            <div className={`border rounded-xl p-5 ${
              contest.outcome === 'overturn' ? 'bg-green-50 border-green-200' :
              contest.outcome === 'uphold' ? 'bg-red-50 border-red-200' :
              'bg-amber-50 border-amber-200'
            }`}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Resolution Issued</h3>
              <p className="text-sm text-gray-700 font-medium capitalize mb-1">{contest.outcome}</p>
              <p className="text-sm text-gray-600">{contest.resolution}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
