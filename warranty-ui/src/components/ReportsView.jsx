import { useMemo, useState } from 'react'
import { getStatus, getDealerStats, countRuleTriggers } from '../claimsStore'
import MetricsStrip from './MetricsStrip'

export default function ReportsView({ claims, rules, agentResults, decisions }) {
  const [tab, setTab] = useState('activity')

  const tabs = [
    { id: 'activity', label: 'Weekly activity' },
    { id: 'dealers', label: 'Dealer performance' },
    { id: 'policy', label: 'Policy effectiveness' },
  ]

  return (
    <>
      <MetricsStrip
        contextLabel="Reports · Last 30 days"
        metrics={[
          { label: 'Reports', value: 3 },
          { label: 'Data Window', value: '30 days' },
          { label: 'Last Refresh', value: 'Just now' },
          { label: 'Sources', value: '2 agents · 1 dataset' },
        ]}
      />
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-6 gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-toyota-ink tracking-tight">Reports</h2>
            <p className="text-sm text-toyota-500 mt-1">
              Roll-up views of agent activity, dealer behavior, and policy-rule effectiveness.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="bg-white border border-toyota-200 hover:border-toyota-300 text-toyota-700 px-4 py-2 rounded-md text-sm font-medium">
              Schedule report
            </button>
            <button className="bg-toyota-ink text-white px-4 py-2 rounded-md text-sm font-semibold">
              Export CSV
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6 border-b border-toyota-200">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                tab === t.id
                  ? 'px-4 py-2 text-sm font-semibold text-toyota-ink border-b-2 border-toyota-red -mb-px'
                  : 'px-4 py-2 text-sm font-medium text-toyota-500 hover:text-toyota-ink'
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'activity' && <WeeklyActivity claims={claims} agentResults={agentResults} decisions={decisions} />}
        {tab === 'dealers' && <DealerPerformance claims={claims} agentResults={agentResults} />}
        {tab === 'policy' && <PolicyEffectiveness claims={claims} rules={rules} />}
      </div>
    </>
  )
}

function WeeklyActivity({ claims, agentResults, decisions }) {
  const byDate = useMemo(() => {
    const map = new Map()
    for (const c of claims) {
      const entry = map.get(c.claimDate) ?? { date: c.claimDate, Clean: 0, Flagged: 0, Anomaly: 0, total: 0 }
      entry[getStatus(c, agentResults)] += 1
      entry.total += 1
      map.set(c.claimDate, entry)
    }
    return [...map.values()].sort((a, b) => a.date.localeCompare(b.date))
  }, [claims, agentResults])

  const maxTotal = Math.max(1, ...byDate.map(d => d.total))
  const totalThisPeriod = claims.length
  const flaggedShare = totalThisPeriod > 0
    ? Math.round((claims.filter(c => getStatus(c, agentResults) !== 'Clean').length / totalThisPeriod) * 100)
    : 0
  const decisionsCount = Object.values(decisions).filter(Boolean).length

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card title="Claim volume by day" subtitle="Stacked status mix, oldest → newest" className="col-span-2">
        <div className="flex items-end gap-1.5 h-48 mt-2">
          {byDate.map(d => (
            <div key={d.date} className="flex-1 flex flex-col-reverse h-full justify-start gap-0.5" title={`${d.date}: ${d.total}`}>
              <div className="bg-status-clean" style={{ height: `${(d.Clean / maxTotal) * 100}%` }} />
              <div className="bg-status-anomaly" style={{ height: `${(d.Anomaly / maxTotal) * 100}%` }} />
              <div className="bg-toyota-red" style={{ height: `${(d.Flagged / maxTotal) * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-[10px] text-toyota-500 mt-2 font-mono">
          <span>{byDate[0]?.date}</span>
          <span>{byDate[byDate.length - 1]?.date}</span>
        </div>
        <div className="mt-4 flex gap-6 text-xs">
          <Legend color="bg-status-clean" label="Clean" />
          <Legend color="bg-status-anomaly" label="Anomaly" />
          <Legend color="bg-toyota-red" label="Flagged" />
        </div>
      </Card>

      <Card title="Period summary" subtitle="Totals across the data window">
        <div className="space-y-4 mt-2">
          <Stat label="Claims processed" value={totalThisPeriod} />
          <Stat label="Decisions logged" value={decisionsCount} />
          <Stat label="% Flagged or anomaly" value={`${flaggedShare}%`} accent={flaggedShare > 20} />
          <Stat label="Avg per day" value={(totalThisPeriod / Math.max(1, byDate.length)).toFixed(1)} />
        </div>
      </Card>
    </div>
  )
}

function DealerPerformance({ claims, agentResults }) {
  const dealers = useMemo(
    () => getDealerStats(claims, agentResults).sort((a, b) => b.flagRate - a.flagRate),
    [claims, agentResults]
  )
  const regionAvg = dealers.length > 0
    ? dealers.reduce((s, d) => s + d.flagRate, 0) / dealers.length
    : 0

  return (
    <div className="bg-white border border-toyota-200 rounded-lg overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="bg-toyota-50 text-toyota-500 text-[11px] font-semibold uppercase tracking-wider border-b border-toyota-200">
            <th className="px-4 py-3">Dealer</th>
            <th className="px-4 py-3 text-right">Claims</th>
            <th className="px-4 py-3 text-right">Flagged</th>
            <th className="px-4 py-3 text-right">Anomalies</th>
            <th className="px-4 py-3 text-right">Total Amount</th>
            <th className="px-4 py-3">Flag Rate</th>
            <th className="px-4 py-3 text-right">vs Region Avg</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-toyota-100">
          {dealers.map(d => {
            const delta = d.flagRate - regionAvg
            const above = delta > 0
            return (
              <tr key={d.dealerId}>
                <td className="px-4 py-3 font-mono text-sm font-semibold text-toyota-red">{d.dealerId}</td>
                <td className="px-4 py-3 text-right tabular-nums text-toyota-700">{d.claimCount}</td>
                <td className="px-4 py-3 text-right tabular-nums text-toyota-700">{d.flagged}</td>
                <td className="px-4 py-3 text-right tabular-nums text-toyota-700">{d.anomaly}</td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold text-toyota-ink">
                  ${d.totalAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-toyota-100 rounded-sm overflow-hidden max-w-[160px]">
                      <div
                        className={above ? 'h-full bg-toyota-red' : 'h-full bg-status-clean'}
                        style={{ width: `${Math.min(100, Math.round(d.flagRate * 100))}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold tabular-nums text-toyota-ink w-10 text-right">
                      {Math.round(d.flagRate * 100)}%
                    </span>
                  </div>
                </td>
                <td className={`px-4 py-3 text-right tabular-nums font-semibold ${above ? 'text-toyota-red' : 'text-status-clean'}`}>
                  {above ? '+' : ''}{Math.round(delta * 100)}pp
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function PolicyEffectiveness({ claims, rules }) {
  const ruleStats = rules.map(r => ({
    rule: r,
    triggers: countRuleTriggers(r, claims),
  })).sort((a, b) => b.triggers - a.triggers)

  const maxTriggers = Math.max(1, ...ruleStats.map(r => r.triggers))
  const totalTriggers = ruleStats.reduce((s, r) => s + r.triggers, 0)
  const activeRules = ruleStats.filter(r => r.triggers > 0).length

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card title="Rule triggers" subtitle="How often each policy rule fired in the data window" className="col-span-2">
        <div className="space-y-2.5 mt-2">
          {ruleStats.map(({ rule, triggers }) => (
            <div key={rule.ruleId} className="grid grid-cols-[60px_1fr_140px_40px] items-center gap-3 text-sm">
              <span className="font-mono text-xs bg-toyota-100 text-toyota-700 px-1.5 py-0.5 rounded border border-toyota-200 w-fit">
                {rule.ruleId}
              </span>
              <span className="text-xs text-toyota-700 truncate" title={rule.description}>{rule.description}</span>
              <div className="h-2 bg-toyota-100 rounded-sm overflow-hidden">
                <div
                  className={rule.violationSeverity === 'high' ? 'h-full bg-toyota-red' : 'h-full bg-status-anomaly'}
                  style={{ width: `${(triggers / maxTriggers) * 100}%` }}
                />
              </div>
              <span className="text-right font-semibold tabular-nums text-toyota-ink">{triggers}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Coverage" subtitle="How much of the queue is policy-covered">
        <div className="space-y-4 mt-2">
          <Stat label="Total rule triggers" value={totalTriggers} accent />
          <Stat label="Rules firing" value={`${activeRules} / ${rules.length}`} />
          <Stat label="Dormant rules" value={rules.length - activeRules} />
        </div>
        <div className="mt-6 pt-4 border-t border-toyota-100">
          <div className="text-[11px] uppercase tracking-wider text-toyota-500 font-semibold mb-2">Recommendation</div>
          <p className="text-xs text-toyota-700 leading-relaxed">
            {rules.length - activeRules > 2
              ? 'Several rules haven\'t fired. Review whether they still apply or need updated thresholds.'
              : 'Rule coverage is healthy across the dataset.'}
          </p>
        </div>
      </Card>
    </div>
  )
}

function Card({ title, subtitle, children, className = '' }) {
  return (
    <section className={`bg-white border border-toyota-200 rounded-lg p-5 ${className}`}>
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-toyota-ink">{title}</h3>
        {subtitle && <p className="text-xs text-toyota-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </section>
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

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-2 text-toyota-600">
      <span className={`w-2 h-2 rounded-sm ${color}`} />
      <span>{label}</span>
    </div>
  )
}
