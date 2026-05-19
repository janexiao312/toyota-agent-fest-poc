import { useState } from 'react'
import ClaimRow from './ClaimRow'

export default function ClaimQueue({ claims, decisions, agentResults, onSelectClaim, onDecision }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const getStatus = (claim) => {
    if (!agentResults[claim.claimId]) {
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
      const status = getStatus(c).toLowerCase()
      return status === filter
    })
    .filter(c => {
      if (!search) return true
      const s = search.toLowerCase()
      return c.claimId.toLowerCase().includes(s) || c.dealerId.toLowerCase().includes(s)
    })
    .sort((a, b) => {
      const priority = { Flagged: 0, Anomaly: 1, Clean: 2 }
      const pA = priority[getStatus(a)] ?? 2
      const pB = priority[getStatus(b)] ?? 2
      if (pA !== pB) return pA - pB
      return b.claimAmount - a.claimAmount
    })

  const tabs = ['all', 'flagged', 'anomaly', 'clean']
  const counts = {
    all: claims.length,
    flagged: claims.filter(c => getStatus(c) === 'Flagged').length,
    anomaly: claims.filter(c => getStatus(c) === 'Anomaly').length,
    clean: claims.filter(c => getStatus(c) === 'Clean').length,
  }

  return (
    <div className="px-6 py-8 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-toyota-ink tracking-tight">Claim Queue</h2>
        <p className="text-sm text-toyota-500 mt-1">
          Review AI-flagged warranty claims. Flagged and anomalous items surface first.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
              filter === tab
                ? 'bg-toyota-ink text-white'
                : 'bg-white border border-toyota-200 text-toyota-600 hover:border-toyota-300 hover:text-toyota-ink'
            }`}
          >
            {tab}
            <span className={`ml-2 text-xs ${filter === tab ? 'text-toyota-300' : 'text-toyota-400'}`}>
              {counts[tab]}
            </span>
          </button>
        ))}
        <input
          type="text"
          placeholder="Search by Claim ID or Dealer…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="ml-auto px-3 py-2 bg-white border border-toyota-200 rounded-md text-sm w-72 placeholder:text-toyota-400 focus:outline-none focus:border-toyota-red focus:ring-1 focus:ring-toyota-red"
        />
      </div>

      <div className="bg-white border border-toyota-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-toyota-50 text-toyota-500 text-[11px] font-semibold uppercase tracking-wider border-b border-toyota-200">
              <th className="px-4 py-3">Claim ID</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Dealer</th>
              <th className="px-4 py-3">Repair</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Warranty</th>
              <th className="px-4 py-3">Status</th>
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
                onSelect={() => onSelectClaim(claim.claimId)}
                onDecision={onDecision}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
