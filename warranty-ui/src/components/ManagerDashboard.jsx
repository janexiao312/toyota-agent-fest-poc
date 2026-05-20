import { getStatus, getDealerStats, getStatusMix, getWarrantyMix } from '../claimsStore'
import MetricsStrip from './MetricsStrip'
import AgentPromptCard from './AgentPromptCard'

export default function ManagerDashboard({ claims, decisions, agentResults, onSelectClaim, onJumpToDealer }) {
  const totalClaims = claims.length
  const mix = getStatusMix(claims, agentResults)
  const warrantyMix = getWarrantyMix(claims)
  const dealerStats = getDealerStats(claims, agentResults)
    .sort((a, b) => b.flagRate - a.flagRate)
    .slice(0, 5)

  const totalAmount = claims.reduce((s, c) => s + c.claimAmount, 0)
  const flaggedAmount = claims
    .filter(c => getStatus(c, agentResults) !== 'Clean')
    .reduce((s, c) => s + c.claimAmount, 0)

  const decisionsCount = Object.values(decisions).filter(Boolean).length
  const queueDepth = totalClaims - decisionsCount

  const recentDecisions = Object.entries(decisions)
    .filter(([, d]) => d)
    .slice(-6)
    .reverse()
    .map(([claimId, decision]) => ({ claimId, decision, claim: claims.find(c => c.claimId === claimId) }))
    .filter(d => d.claim)

  return (
    <>
      <MetricsStrip
        contextLabel="Team · South Central"
        metrics={[
          { label: 'Queue Depth', value: queueDepth },
          { label: 'Reviewed Today', value: decisionsCount },
          { label: 'Avg Review Time', value: '14s' },
          { label: 'Exposure At Risk', value: `$${flaggedAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, accent: true },
        ]}
      />

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <AgentPromptCard
          role="manager"
          claims={claims}
          decisions={decisions}
          agentResults={agentResults}
          onJumpToDealer={onJumpToDealer}
        />
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-toyota-ink tracking-tight">Regional Overview</h2>
          <p className="text-sm text-toyota-500 mt-1">
            Patterns across {totalClaims} claims and {new Set(claims.map(c => c.dealerId)).size} dealers in South Central this period.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">

          <Card title="Status Mix" subtitle="Distribution of AI verdicts across the queue">
            <StatusBar mix={mix} total={totalClaims} />
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <Legend color="bg-status-clean" label="Clean" count={mix.Clean} total={totalClaims} />
              <Legend color="bg-status-anomaly" label="Anomaly" count={mix.Anomaly} total={totalClaims} />
              <Legend color="bg-toyota-red" label="Flagged" count={mix.Flagged} total={totalClaims} />
            </div>
          </Card>

          <Card title="Dealer Flag-Rate Leaderboard" subtitle="Top 5 dealers by share of flagged + anomalous claims. Click a row to open the dealer case file.">
            <div className="space-y-1 mt-1">
              {dealerStats.map(d => (
                <button
                  key={d.dealerId}
                  onClick={() => onJumpToDealer?.(d.dealerId)}
                  disabled={!onJumpToDealer}
                  className="w-full grid grid-cols-[80px_1fr_70px] items-center gap-3 text-sm py-2 px-2 -mx-2 rounded hover:bg-toyota-50 disabled:hover:bg-transparent disabled:cursor-default transition-colors text-left"
                >
                  <span className="font-mono text-toyota-700">{d.dealerId}</span>
                  <div className="h-2 bg-toyota-100 rounded-sm overflow-hidden">
                    <div className="h-full bg-toyota-red" style={{ width: `${Math.round(d.flagRate * 100)}%` }} />
                  </div>
                  <span className="text-right font-semibold tabular-nums text-toyota-ink">
                    {Math.round(d.flagRate * 100)}%
                  </span>
                </button>
              ))}
            </div>
          </Card>

          <Card title="Warranty Mix" subtitle="Claims by warranty type">
            <div className="space-y-3 mt-1">
              {Object.entries(warrantyMix).map(([type, count]) => {
                const pct = totalClaims > 0 ? count / totalClaims : 0
                return (
                  <div key={type} className="grid grid-cols-[100px_1fr_60px] items-center gap-3 text-sm">
                    <span className="capitalize text-toyota-700">{type}</span>
                    <div className="h-2 bg-toyota-100 rounded-sm overflow-hidden">
                      <div className="h-full bg-toyota-ink" style={{ width: `${Math.round(pct * 100)}%` }} />
                    </div>
                    <span className="text-right tabular-nums text-toyota-600">{count}</span>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card title="Recent Reviewer Activity" subtitle="Last decisions across the team">
            {recentDecisions.length === 0 ? (
              <div className="text-sm text-toyota-500 italic mt-1">No decisions yet this session.</div>
            ) : (
              <div className="divide-y divide-toyota-100">
                {recentDecisions.map(({ claimId, decision, claim }) => (
                  <button
                    key={claimId}
                    onClick={() => onSelectClaim(claimId)}
                    className="w-full flex items-center gap-3 py-2.5 text-left hover:bg-toyota-50 -mx-2 px-2 rounded transition-colors"
                  >
                    <span className="font-mono text-xs text-toyota-red font-semibold">{claimId}</span>
                    <span className="text-xs text-toyota-500 flex-1">{claim.dealerId} · ${claim.claimAmount.toLocaleString()}</span>
                    <DecisionPill decision={decision} />
                  </button>
                ))}
              </div>
            )}
          </Card>

        </div>

        <Card title="Region Totals" subtitle="Aggregate exposure across all claims and dealers">
          <div className="grid grid-cols-4 gap-8 mt-2">
            <Stat label="Total Claims" value={totalClaims} />
            <Stat label="Total Dealers" value={new Set(claims.map(c => c.dealerId)).size} />
            <Stat label="Total Amount" value={`$${(totalAmount / 1000).toFixed(0)}K`} />
            <Stat label="At-Risk Amount" value={`$${(flaggedAmount / 1000).toFixed(0)}K`} accent />
          </div>
        </Card>
      </div>
    </>
  )
}

function Card({ title, subtitle, children }) {
  return (
    <section className="bg-white border border-toyota-200 rounded-lg p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-toyota-ink">{title}</h3>
        {subtitle && <p className="text-xs text-toyota-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}

function StatusBar({ mix, total }) {
  const segments = [
    { key: 'Clean', value: mix.Clean, color: 'bg-status-clean' },
    { key: 'Anomaly', value: mix.Anomaly, color: 'bg-status-anomaly' },
    { key: 'Flagged', value: mix.Flagged, color: 'bg-toyota-red' },
  ]
  return (
    <div className="flex h-3 rounded-sm overflow-hidden border border-toyota-200">
      {segments.map(s => (
        <div
          key={s.key}
          className={s.color}
          style={{ width: total > 0 ? `${(s.value / total) * 100}%` : '0%' }}
          title={`${s.key}: ${s.value}`}
        />
      ))}
    </div>
  )
}

function Legend({ color, label, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-sm ${color}`} />
      <div className="leading-tight">
        <div className="text-xs text-toyota-600">{label}</div>
        <div className="text-sm font-semibold text-toyota-ink tabular-nums">{count} <span className="text-toyota-500 font-normal">· {pct}%</span></div>
      </div>
    </div>
  )
}

function Stat({ label, value, accent }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-toyota-500 font-medium">{label}</div>
      <div className={`text-2xl font-bold tabular-nums ${accent ? 'text-toyota-red' : 'text-toyota-ink'} mt-1`}>{value}</div>
    </div>
  )
}

function DecisionPill({ decision }) {
  const map = {
    approve: 'bg-status-clean-tint text-status-clean border-status-clean-border',
    reject: 'bg-status-flagged-tint text-status-flagged border-status-flagged-border',
    escalate: 'bg-status-anomaly-tint text-status-anomaly border-status-anomaly-border',
  }
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${map[decision]}`}>
      {decision}
    </span>
  )
}
