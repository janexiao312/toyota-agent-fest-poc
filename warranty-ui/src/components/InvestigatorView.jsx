import { useMemo, useState, useEffect } from 'react'
import { getStatus, getDealerStats } from '../claimsStore'
import MetricsStrip from './MetricsStrip'
import AgentPromptCard from './AgentPromptCard'

const OPEN_CASES_STORAGE_KEY = 'warranty-ui:open-cases:v1'

function loadOpenCases() {
  try {
    const raw = localStorage.getItem(OPEN_CASES_STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

export default function InvestigatorView({ claims, agentResults, onSelectClaim, activeDealerId, onOpenDealer, onCloseDealer, dealerNotes = {}, onSaveDealerNote }) {
  const dealerStats = useMemo(
    () => getDealerStats(claims, agentResults).sort((a, b) => b.riskScore - a.riskScore),
    [claims, agentResults]
  )

  const [openCases, setOpenCases] = useState(() => loadOpenCases())

  useEffect(() => {
    try {
      localStorage.setItem(OPEN_CASES_STORAGE_KEY, JSON.stringify([...openCases]))
    } catch {
      // ignore
    }
  }, [openCases])

  const toggleCase = (dealerId) => {
    setOpenCases(prev => {
      const next = new Set(prev)
      if (next.has(dealerId)) next.delete(dealerId)
      else next.add(dealerId)
      return next
    })
  }

  const activeDealer = activeDealerId ? dealerStats.find(d => d.dealerId === activeDealerId) : null
  const regionAvgFlagRate = dealerStats.length > 0
    ? dealerStats.reduce((s, d) => s + d.flagRate, 0) / dealerStats.length
    : 0

  const watchedDealers = dealerStats.filter(d => d.riskScore >= 4).length
  const totalFlagged = dealerStats.reduce((s, d) => s + d.flagged + d.anomaly, 0)
  const totalExposure = dealerStats.reduce(
    (s, d) => s + d.claims.filter(c => getStatus(c, agentResults) !== 'Clean').reduce((ss, c) => ss + c.claimAmount, 0),
    0
  )

  return (
    <>
      <MetricsStrip
        contextLabel="Compliance · TMNA"
        metrics={[
          { label: 'Dealers Under Watch', value: watchedDealers },
          { label: 'Open Patterns', value: totalFlagged },
          { label: 'Active Cases', value: openCases.size },
          { label: 'Exposure Tracked', value: `$${(totalExposure / 1000).toFixed(0)}K`, accent: true },
        ]}
      />

      {activeDealer ? (
        <DealerProfile
          key={activeDealer.dealerId}
          dealer={activeDealer}
          regionAvgFlagRate={regionAvgFlagRate}
          agentResults={agentResults}
          onBack={onCloseDealer}
          onSelectClaim={onSelectClaim}
          note={dealerNotes[activeDealer.dealerId]}
          onSaveNote={(text) => onSaveDealerNote?.(activeDealer.dealerId, text)}
          caseOpen={openCases.has(activeDealer.dealerId)}
          onToggleCase={() => toggleCase(activeDealer.dealerId)}
        />
      ) : (
        <>
          <div className="max-w-[1400px] mx-auto px-6 pt-6">
            <AgentPromptCard
              role="investigator"
              claims={claims}
              agentResults={agentResults}
              onJumpToDealer={onOpenDealer}
            />
          </div>
          <DealerLeaderboard
            dealers={dealerStats}
            regionAvgFlagRate={regionAvgFlagRate}
            onOpenDealer={onOpenDealer}
            dealerNotes={dealerNotes}
            openCases={openCases}
          />
        </>
      )}
    </>
  )
}

function DealerLeaderboard({ dealers, regionAvgFlagRate, onOpenDealer, dealerNotes = {}, openCases = new Set() }) {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-toyota-ink tracking-tight">Dealer Risk Watch</h2>
        <p className="text-sm text-toyota-500 mt-1">
          Dealers ranked by composite risk score. Region average flag rate is{' '}
          <span className="font-semibold text-toyota-ink">{Math.round(regionAvgFlagRate * 100)}%</span>.
          Click any dealer to open the case file.
        </p>
      </div>

      <div className="bg-white border border-toyota-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-toyota-50 text-toyota-500 text-[11px] font-semibold uppercase tracking-wider border-b border-toyota-200">
              <th className="px-4 py-3">Dealer</th>
              <th className="px-4 py-3 text-right">Claims</th>
              <th className="px-4 py-3 text-right">Flagged</th>
              <th className="px-4 py-3 text-right">Anomalies</th>
              <th className="px-4 py-3 text-right">Total Amount</th>
              <th className="px-4 py-3">Flag Rate vs Region</th>
              <th className="px-4 py-3 text-right">Risk Score</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {dealers.map(d => {
              const above = d.flagRate > regionAvgFlagRate
              const risk = d.riskScore >= 7 ? 'high' : d.riskScore >= 4 ? 'medium' : 'low'
              return (
                <tr
                  key={d.dealerId}
                  className="border-t border-toyota-100 hover:bg-toyota-50 cursor-pointer transition-colors"
                  onClick={() => onOpenDealer(d.dealerId)}
                >
                  <td className="px-4 py-3 font-mono text-sm font-semibold text-toyota-red">
                    <span className="inline-flex items-center gap-1.5">
                      {d.dealerId}
                      {openCases.has(d.dealerId) && (
                        <span title="Open case" className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border bg-toyota-red text-white border-toyota-red">case</span>
                      )}
                      {dealerNotes[d.dealerId]?.text && (
                        <span title={dealerNotes[d.dealerId].text} aria-label="Has investigator note">📝</span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-toyota-700">{d.claimCount}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-toyota-700">{d.flagged}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-toyota-700">{d.anomaly}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold text-toyota-ink">
                    ${d.totalAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-toyota-100 rounded-sm relative overflow-hidden">
                        <div
                          className={above ? 'h-full bg-toyota-red' : 'h-full bg-status-clean'}
                          style={{ width: `${Math.min(100, Math.round(d.flagRate * 100))}%` }}
                        />
                        <div
                          className="absolute top-0 h-full w-px bg-toyota-ink"
                          style={{ left: `${Math.round(regionAvgFlagRate * 100)}%` }}
                          title={`Region avg: ${Math.round(regionAvgFlagRate * 100)}%`}
                        />
                      </div>
                      <span className={`text-xs font-semibold tabular-nums w-10 text-right ${above ? 'text-toyota-red' : 'text-status-clean'}`}>
                        {Math.round(d.flagRate * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold text-toyota-ink">{d.riskScore}</td>
                  <td className="px-4 py-3">
                    <RiskBadge risk={risk} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DealerProfile({ dealer, regionAvgFlagRate, agentResults, onBack, onSelectClaim, note, onSaveNote, caseOpen, onToggleCase }) {
  const [draftNote, setDraftNote] = useState(note?.text ?? '')
  const [savedAt, setSavedAt] = useState(null)

  const handleSaveNote = () => {
    onSaveNote?.(draftNote)
    setSavedAt(new Date())
  }

  const handleExportEvidence = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      dealerId: dealer.dealerId,
      summary: {
        claimCount: dealer.claimCount,
        flagged: dealer.flagged,
        anomaly: dealer.anomaly,
        flagRate: dealer.flagRate,
        riskScore: dealer.riskScore,
        totalAmount: dealer.totalAmount,
      },
      investigatorNote: note ?? null,
      claims: dealer.claims.map(c => ({
        claimId: c.claimId,
        claimDate: c.claimDate,
        vin: c.vin,
        repairCodes: c.repairCodes,
        laborHours: c.laborHours,
        vehicleMileage: c.vehicleMileage,
        warrantyType: c.warrantyType,
        claimAmount: c.claimAmount,
        techNotes: c.techNotes,
        agentVerdict: agentResults?.[c.claimId]?.summary?.recommendation ?? null,
        violations: agentResults?.[c.claimId]?.validation?.results?.filter(r => !r.passed).map(r => r.ruleId) ?? [],
      })),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${dealer.dealerId}-evidence-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const above = dealer.flagRate > regionAvgFlagRate
  const claimsByDate = [...dealer.claims].sort((a, b) => a.claimDate.localeCompare(b.claimDate))
  const repairCodeCount = new Map()
  for (const c of dealer.claims) {
    for (const code of c.repairCodes) {
      repairCodeCount.set(code, (repairCodeCount.get(code) ?? 0) + 1)
    }
  }
  const topCodes = [...repairCodeCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <button
        onClick={onBack}
        className="mb-4 text-sm text-toyota-500 hover:text-toyota-ink flex items-center gap-1.5 font-medium transition-colors"
      >
        <span aria-hidden>←</span> Back to dealer watch
      </button>

      <div className="bg-white border border-toyota-200 rounded-lg p-6 mb-4">
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-2xl font-bold text-toyota-ink font-mono">{dealer.dealerId}</h2>
              <RiskBadge risk={dealer.riskScore >= 7 ? 'high' : dealer.riskScore >= 4 ? 'medium' : 'low'} />
            </div>
            <p className="text-sm text-toyota-500 max-w-xl">
              Composite risk score <span className="font-semibold text-toyota-ink">{dealer.riskScore}</span>.
              Flag rate <span className={`font-semibold ${above ? 'text-toyota-red' : 'text-status-clean'}`}>
                {Math.round(dealer.flagRate * 100)}%
              </span> {above ? 'above' : 'at or below'} regional average of {Math.round(regionAvgFlagRate * 100)}%.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportEvidence}
              className="bg-white border border-toyota-200 hover:border-toyota-300 text-toyota-700 px-4 py-2 rounded-md text-sm font-medium"
            >
              Export evidence
            </button>
            <button
              onClick={onToggleCase}
              className={caseOpen
                ? 'bg-white border border-toyota-red text-toyota-red hover:bg-toyota-red-tint px-4 py-2 rounded-md text-sm font-semibold uppercase tracking-wider'
                : 'bg-toyota-red text-white border border-toyota-red hover:bg-toyota-red-hover px-4 py-2 rounded-md text-sm font-semibold uppercase tracking-wider'}
            >
              {caseOpen ? 'Close case' : 'Open case'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-8 mt-6 pt-6 border-t border-toyota-200">
          <Stat label="Total Claims" value={dealer.claimCount} />
          <Stat label="Flagged" value={dealer.flagged} accent={dealer.flagged > 0} />
          <Stat label="Anomalies" value={dealer.anomaly} />
          <Stat label="Total Exposure" value={`$${dealer.totalAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} />
        </div>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-4">

        <section className="bg-white border border-toyota-200 rounded-lg p-5">
          <h3 className="text-[11px] uppercase tracking-wider text-toyota-500 font-semibold mb-4">
            Claim Timeline · {dealer.claimCount} claims
          </h3>
          <div className="space-y-2">
            {claimsByDate.map(c => {
              const status = getStatus(c, agentResults)
              const isAttn = status !== 'Clean'
              return (
                <button
                  key={c.claimId}
                  onClick={() => onSelectClaim(c.claimId)}
                  className="w-full flex items-center gap-4 py-2 px-3 -mx-3 rounded hover:bg-toyota-50 text-left transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full ${
                    status === 'Flagged' ? 'bg-toyota-red'
                      : status === 'Anomaly' ? 'bg-status-anomaly'
                      : 'bg-toyota-300'
                  }`} />
                  <span className="text-xs text-toyota-500 tabular-nums w-24">{c.claimDate}</span>
                  <span className="font-mono text-xs font-semibold text-toyota-red w-24">{c.claimId}</span>
                  <span className="text-xs text-toyota-600 flex-1 truncate">
                    {c.repairCodes.join(', ')} · {c.vehicleMileage.toLocaleString()} mi
                  </span>
                  <span className="text-sm tabular-nums font-semibold text-toyota-ink">
                    ${c.claimAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                  {isAttn && (
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border ${
                      status === 'Flagged'
                        ? 'bg-status-flagged-tint text-status-flagged border-status-flagged-border'
                        : 'bg-status-anomaly-tint text-status-anomaly border-status-anomaly-border'
                    }`}>
                      {status}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="bg-white border border-toyota-200 rounded-lg p-5">
            <h3 className="text-[11px] uppercase tracking-wider text-toyota-500 font-semibold mb-3">
              Repeat Repair Codes
            </h3>
            <div className="space-y-2">
              {topCodes.map(([code, count]) => (
                <div key={code} className="flex items-center justify-between text-sm">
                  <span className="font-mono bg-toyota-100 text-toyota-700 text-xs font-medium px-2 py-0.5 rounded border border-toyota-200">
                    {code}
                  </span>
                  <span className="tabular-nums text-toyota-700">{count} claim{count > 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-toyota-200 rounded-lg p-5">
            <h3 className="text-[11px] uppercase tracking-wider text-toyota-500 font-semibold mb-3">
              Pattern Callouts
            </h3>
            <ul className="space-y-3 text-sm text-toyota-700">
              {dealer.flagged >= 2 && (
                <li className="flex gap-2">
                  <span className="text-toyota-red mt-0.5">●</span>
                  <span>{dealer.flagged} hard violations in this window — consistent with a process gap, not a one-off.</span>
                </li>
              )}
              {above && (
                <li className="flex gap-2">
                  <span className="text-toyota-red mt-0.5">●</span>
                  <span>Flag rate {Math.round((dealer.flagRate - regionAvgFlagRate) * 100)}pp above regional average.</span>
                </li>
              )}
              {topCodes[0] && topCodes[0][1] >= 2 && (
                <li className="flex gap-2">
                  <span className="text-status-anomaly mt-0.5">●</span>
                  <span>Repeat repair code <span className="font-mono">{topCodes[0][0]}</span> appears in {topCodes[0][1]} claims.</span>
                </li>
              )}
              {!above && dealer.flagged === 0 && (
                <li className="flex gap-2">
                  <span className="text-status-clean mt-0.5">●</span>
                  <span>No patterns of concern. Dealer trending healthier than region.</span>
                </li>
              )}
            </ul>
          </section>

          <section className="bg-white border border-toyota-200 rounded-lg p-5">
            <h3 className="text-[11px] uppercase tracking-wider text-toyota-500 font-semibold mb-3">
              Investigation Notes
            </h3>
            <textarea
              value={draftNote}
              onChange={e => setDraftNote(e.target.value.slice(0, 1000))}
              onBlur={handleSaveNote}
              placeholder="Add note for case file…"
              className="w-full text-sm border border-toyota-200 rounded-md p-2 placeholder:text-toyota-400 focus:outline-none focus:border-toyota-red focus:ring-1 focus:ring-toyota-red"
              rows="4"
            />
            <div className="flex items-center justify-between mt-1.5 text-xs">
              <span className="text-toyota-400">{draftNote.length}/1000</span>
              {savedAt ? (
                <span className="text-status-clean">Saved {savedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
              ) : note?.updatedAt ? (
                <span className="text-toyota-500">Last saved {new Date(note.updatedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} by {note.updatedBy}</span>
              ) : (
                <span className="text-toyota-400 italic">Auto-saves on blur</span>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function RiskBadge({ risk }) {
  const map = {
    low: 'bg-status-clean-tint text-status-clean border-status-clean-border',
    medium: 'bg-status-anomaly-tint text-status-anomaly border-status-anomaly-border',
    high: 'bg-status-flagged-tint text-status-flagged border-status-flagged-border',
  }
  return (
    <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-sm border ${map[risk]}`}>
      {risk} risk
    </span>
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
