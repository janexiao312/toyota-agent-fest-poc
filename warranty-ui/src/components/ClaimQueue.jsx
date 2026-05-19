import { useState } from 'react'
import ClaimRow from './ClaimRow'

export default function ClaimQueue({ claims, decisions, agentResults, contestData, isLoading, onSelectClaim, onDecision }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const getStatus = (claim) => {
    if (contestData?.[claim.claimId]?.status && contestData[claim.claimId].status !== 'none') {
      return 'Contested'
    }
    if (!agentResults?.[claim.claimId]) {
      if (claim.groundTruth === 'violation') return 'Flagged'
      if (claim.groundTruth === 'anomaly') return 'Anomaly'
      return 'Clean'
    }
    const severity = agentResults[claim.claimId]?.validation?.overallSeverity
    if (severity === 'high') return 'Flagged'
    if (severity === 'medium') return 'Anomaly'
    return 'Clean'
  }

  const filtered = claims
    .filter(c => {
      if (filter === 'all') return true
      if (filter === 'escalated') return decisions[c.claimId] === 'escalate'
      const status = getStatus(c).toLowerCase()
      return status === filter
    })
    .filter(c => {
      if (!search) return true
      const s = search.toLowerCase()
      return c.claimId.toLowerCase().includes(s) || c.dealerId.toLowerCase().includes(s)
    })
    .sort((a, b) => {
      const priority = { Flagged: 0, Anomaly: 1, Contested: 1.5, Clean: 2 }
      const pA = priority[getStatus(a)] ?? 2
      const pB = priority[getStatus(b)] ?? 2
      if (pA !== pB) return pA - pB
      return b.claimAmount - a.claimAmount
    })

  const tabs = ['all', 'flagged', 'anomaly', 'clean', 'escalated', 'contested']

  return (
    <div className="p-6">
      <div className="flex gap-2 mb-4">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize ${
              filter === tab
                ? 'bg-gray-800 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
        <input
          type="text"
          placeholder="Search by Claim ID or Dealer..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="ml-auto px-3 py-1.5 border border-gray-200 rounded-lg text-sm w-64"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wide">
              <th className="px-4 py-3">Claim ID</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Dealer</th>
              <th className="px-4 py-3">Repair</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Warranty</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Contest</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(claim => (
              <ClaimRow
                key={claim.claimId}
                claim={claim}
                status={getStatus(claim)}
                decision={decisions[claim.claimId]}
                contestStatus={contestData?.[claim.claimId]?.status}
                isLoading={isLoading?.[claim.claimId]}
                onSelect={() => onSelectClaim(claim.claimId)}
                onDecision={onDecision}
              />
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            All claims reviewed
          </div>
        )}
      </div>
    </div>
  )
}
