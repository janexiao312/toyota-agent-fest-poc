import { AGENTS, AGENT_TONE } from '../agents'
import { getStatus, getDealerStats } from '../claimsStore'

export default function AgentPromptCard({ role, claims, agentResults = {}, decisions = {}, contestData = {}, onSelectClaim, onJumpToDealer }) {
  const prompt = buildPrompt({ role, claims, agentResults, decisions, contestData })
  if (!prompt) return null

  const agent = AGENTS[prompt.agentId] ?? AGENTS.atlas
  const tone = AGENT_TONE[agent.color]

  const handleAction = () => {
    if (!prompt.action) return
    if (prompt.action.kind === 'open-claim') onSelectClaim?.(prompt.action.claimId)
    else if (prompt.action.kind === 'open-dealer') onJumpToDealer?.(prompt.action.dealerId)
  }

  return (
    <section className={`bg-white border ${tone.accentBorder} rounded-xl p-5 mb-4 relative overflow-hidden`}>
      <div className={`absolute top-0 left-0 w-1 h-full ${tone.dot}`} aria-hidden />
      <div className="flex items-start gap-4">
        <AgentAvatar agent={agent} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-semibold text-toyota-ink">{agent.name}</span>
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border ${tone.badge}`}>
              {agent.role}
            </span>
            <span className="text-xs text-toyota-500">· {prompt.headline}</span>
          </div>
          <p className="text-sm text-toyota-700 leading-relaxed">{prompt.body}</p>

          {prompt.bullets?.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {prompt.bullets.map((b, i) => (
                <li key={i} className="text-xs text-toyota-600 flex items-start gap-2">
                  <span className={`mt-1 w-1.5 h-1.5 rounded-full ${tone.dot} shrink-0`} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}

          {prompt.action && (
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleAction}
                className={`text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-md border ${tone.accentBg} ${tone.accentText} ${tone.accentBorder} hover:brightness-95 transition-all`}
              >
                {prompt.action.label} →
              </button>
              {prompt.action.subLabel && (
                <span className="text-xs text-toyota-500">{prompt.action.subLabel}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function AgentAvatar({ agent }) {
  const tone = AGENT_TONE[agent.color]
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 ${tone.badge} border`}>
      {agent.name.slice(0, 1)}
    </div>
  )
}

function buildPrompt({ role, claims, agentResults, decisions, contestData }) {
  switch (role) {
    case 'manager':
      return buildManagerPrompt({ claims, agentResults, decisions })
    case 'investigator':
      return buildInvestigatorPrompt({ claims, agentResults })
    case 'customer':
      return buildCustomerPrompt({ claims, decisions, agentResults, contestData })
    case 'specialist':
      return buildSpecialistPrompt({ claims, contestData })
    case 'reviewer':
    default:
      return buildReviewerPrompt({ claims, decisions, agentResults })
  }
}

function buildReviewerPrompt({ claims, decisions, agentResults }) {
  const pending = claims.filter(c => !decisions[c.claimId])
  const flagged = pending.filter(c => getStatus(c, agentResults) === 'Flagged')
  const anomaly = pending.filter(c => getStatus(c, agentResults) === 'Anomaly')
  const totalActionable = flagged.length + anomaly.length

  if (totalActionable === 0) {
    return {
      agentId: 'atlas',
      headline: 'All clear',
      body: 'Atlas finished triaging the queue and no flagged or anomalous claims are awaiting your decision. The clean queue continues to process automatically.',
      bullets: [],
    }
  }

  const priority = [...flagged, ...anomaly].sort((a, b) => b.claimAmount - a.claimAmount)[0]
  const exposure = [...flagged, ...anomaly].reduce((s, c) => s + c.claimAmount, 0)

  return {
    agentId: 'atlas',
    headline: 'Queue triage complete',
    body: `Atlas validated ${claims.length} claims and surfaced ${totalActionable} that require human review. Suggested starting point: ${priority.claimId} (highest exposure at $${priority.claimAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}).`,
    bullets: [
      `${flagged.length} flagged (clear policy violation) · ${anomaly.length} anomalous (pattern requires judgment)`,
      `Combined exposure across actionable items: $${exposure.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      `Clean claims auto-cleared by Atlas: ${claims.length - totalActionable - Object.keys(decisions).length}`,
    ],
    action: priority ? {
      kind: 'open-claim',
      claimId: priority.claimId,
      label: `Open ${priority.claimId}`,
      subLabel: `${priority.dealerId} · ${priority.repairCodes.join(', ')}`,
    } : null,
  }
}

function buildManagerPrompt({ claims, agentResults, decisions }) {
  const dealerStats = getDealerStats(claims, agentResults).sort((a, b) => b.riskScore - a.riskScore)
  const topDealer = dealerStats[0]
  const flaggedAmount = claims
    .filter(c => getStatus(c, agentResults) !== 'Clean')
    .reduce((s, c) => s + c.claimAmount, 0)
  const decisionsToday = Object.keys(decisions).length

  return {
    agentId: 'atlas',
    headline: 'Regional snapshot',
    body: `Atlas processed ${claims.length} claims this period and surfaced ${dealerStats.filter(d => d.riskScore >= 4).length} dealers above the watch threshold. Total exposure on non-clean claims: $${flaggedAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}.`,
    bullets: [
      `${decisionsToday} reviewer decisions logged this session`,
      topDealer ? `Highest-risk dealer: ${topDealer.dealerId} (risk score ${topDealer.riskScore}, ${topDealer.flagged} flagged + ${topDealer.anomaly} anomalous)` : null,
      `Region flag rate average: ${Math.round((dealerStats.reduce((s, d) => s + d.flagRate, 0) / Math.max(1, dealerStats.length)) * 100)}%`,
    ].filter(Boolean),
    action: topDealer ? {
      kind: 'open-dealer',
      dealerId: topDealer.dealerId,
      label: `Investigate ${topDealer.dealerId}`,
      subLabel: 'Opens dealer case file',
    } : null,
  }
}

function buildInvestigatorPrompt({ claims, agentResults }) {
  const dealerStats = getDealerStats(claims, agentResults).sort((a, b) => b.riskScore - a.riskScore)
  const highRisk = dealerStats.filter(d => d.riskScore >= 7)
  const watch = dealerStats.filter(d => d.riskScore >= 4 && d.riskScore < 7)
  const topDealer = dealerStats[0]

  return {
    agentId: 'atlas',
    headline: 'Pattern scan',
    body: `Atlas ranked ${dealerStats.length} dealers by composite risk score. ${highRisk.length} sit in the high-risk band (score ≥ 7); ${watch.length} are on watch (4–6).`,
    bullets: [
      topDealer ? `Top focus: ${topDealer.dealerId} — flag rate ${Math.round(topDealer.flagRate * 100)}%, ${topDealer.flagged} hard violations` : null,
      `Total flagged + anomalous claims under investigation: ${dealerStats.reduce((s, d) => s + d.flagged + d.anomaly, 0)}`,
      `Region exposure across non-clean claims: $${(dealerStats.reduce((s, d) => s + d.claims.filter(c => getStatus(c, agentResults) !== 'Clean').reduce((ss, c) => ss + c.claimAmount, 0), 0) / 1000).toFixed(0)}K`,
    ].filter(Boolean),
    action: topDealer ? {
      kind: 'open-dealer',
      dealerId: topDealer.dealerId,
      label: `Open ${topDealer.dealerId} case file`,
    } : null,
  }
}

function buildCustomerPrompt({ claims, decisions, agentResults, contestData }) {
  const customerClaim = claims.find(c => c.claimId === 'CLM-00005') ?? claims[0]
  if (!customerClaim) return null
  const decision = decisions[customerClaim.claimId]
  const contest = contestData[customerClaim.claimId]

  if (contest?.status === 'resolved') {
    return {
      agentId: 'sage',
      headline: 'Case closed',
      body: `Sage has logged the final resolution from the warranty specialist. The outcome (${String(contest.outcome).toUpperCase()}) is recorded below with the specialist's reasoning.`,
      bullets: [],
    }
  }

  if (contest?.status === 'needs_info') {
    return {
      agentId: 'sage',
      headline: 'Action required',
      body: `Sage relayed a question from the resolution specialist. Your response is needed to keep the contest moving — see the message below.`,
      bullets: [`Asked by ${contest.infoRequest?.requestedBy ?? 'Resolution Specialist'}`],
    }
  }

  if (contest) {
    return {
      agentId: 'sage',
      headline: 'Contest in progress',
      body: `Sage routed your contest to a warranty specialist for human review. Atlas is re-validating with the additional evidence you provided; you'll be notified when a decision is made.`,
      bullets: [`Status: ${String(contest.status).replace('_', ' ')}`],
    }
  }

  if (!decision) {
    return {
      agentId: 'sage',
      headline: 'Claim received',
      body: `Sage is tracking your warranty claim. Atlas is currently validating coverage, repair codes, and labor hours against policy. Most claims are decided within 2–3 business days.`,
      bullets: [`Reference ${customerClaim.claimId} · ${customerClaim.warrantyType} warranty`],
    }
  }

  if (decision === 'reject' || decision === 'escalate') {
    const validation = agentResults?.[customerClaim.claimId]?.validation
    const failure = validation?.results?.find(r => !r.passed)
    return {
      agentId: 'sage',
      headline: decision === 'reject' ? 'Claim denied' : 'Under specialist review',
      body: `Sage prepared a plain-language explanation of the decision below. ${failure ? `The primary concern flagged by Atlas: ${failure.message}` : ''} If you disagree, you can submit a contest and the case will be handed to a resolution specialist.`,
      bullets: [],
    }
  }

  return null
}

function buildSpecialistPrompt({ claims, contestData }) {
  const active = claims.filter(c => contestData[c.claimId] && !['resolved', 'none'].includes(contestData[c.claimId]?.status))
  const needsInfo = active.filter(c => contestData[c.claimId]?.status === 'needs_info')

  if (active.length === 0) {
    return {
      agentId: 'ember',
      headline: 'Queue clear',
      body: 'No active contests in your workspace. Ember will draft a resolution brief automatically when a new contest arrives from Sage.',
      bullets: [],
    }
  }

  const priority = active[0]
  return {
    agentId: 'ember',
    headline: 'Resolution briefs ready',
    body: `Ember prepared briefs on ${active.length} active contest${active.length === 1 ? '' : 's'}. Each brief includes contest classification, evidence assessment, precedents, and a recommended action.`,
    bullets: [
      needsInfo.length > 0 ? `${needsInfo.length} awaiting customer response to your info request` : null,
      priority ? `Suggested first review: ${priority.claimId} (select via dropdown above)` : null,
    ].filter(Boolean),
  }
}
