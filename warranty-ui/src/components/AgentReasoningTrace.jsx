import { useState } from 'react'
import { AGENTS, AGENT_TONE, buildReasoningTrace } from '../agents'

export default function AgentReasoningTrace({ claim, rules, validation, summary }) {
  const [expanded, setExpanded] = useState(false)
  const [showSkipped, setShowSkipped] = useState(false)

  const trace = buildReasoningTrace(claim, rules, validation)
  if (trace.length === 0) {
    return null
  }

  const agent = AGENTS.atlas
  const tone = AGENT_TONE[agent.color]
  const failures = trace.filter(t => t.status === 'fail')
  const passes = trace.filter(t => t.status === 'pass')
  const skips = trace.filter(t => t.status === 'skip')

  const recommendation = summary?.recommendation ?? (failures.length > 0 ? 'review' : 'approve')
  const confidence = summary?.confidence ?? (failures.length > 0 ? 'medium' : 'high')

  const visible = expanded
    ? (showSkipped ? trace : trace.filter(t => t.status !== 'skip'))
    : [...failures, ...passes.slice(0, 1)]

  return (
    <section className={`bg-white border ${tone.accentBorder} rounded-lg mb-4 overflow-hidden`}>
      <header className={`flex items-center justify-between gap-4 px-5 py-4 ${tone.accentBg}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border ${tone.badge}`}>
            {agent.name.slice(0, 1)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-toyota-ink">{agent.name}'s reasoning</span>
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border ${tone.badge}`}>
                {agent.role}
              </span>
            </div>
            <div className="text-xs text-toyota-500 mt-0.5">
              Checked {trace.length} rule{trace.length === 1 ? '' : 's'} · {failures.length} failure{failures.length === 1 ? '' : 's'} · {passes.length} pass{passes.length === 1 ? '' : 'es'} · {skips.length} skipped
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-xs font-semibold uppercase tracking-wider ${
            recommendation === 'reject' ? 'text-toyota-red' :
            recommendation === 'review' ? 'text-status-anomaly' :
            'text-status-clean'
          }`}>
            Recommends: {recommendation}
          </div>
          <div className="text-[11px] text-toyota-500 mt-0.5">{confidence} confidence</div>
        </div>
      </header>

      <ol className="divide-y divide-toyota-100">
        {visible.map(item => (
          <li key={item.ruleId} className="flex items-start gap-3 px-5 py-3">
            <StatusGlyph status={item.status} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-toyota-400 tabular-nums">#{String(item.step).padStart(2, '0')}</span>
                <span className="font-mono text-[11px] bg-toyota-100 text-toyota-700 px-1.5 py-0.5 rounded border border-toyota-200">{item.ruleId}</span>
                <span className="text-sm font-medium text-toyota-ink truncate">{item.label}</span>
                {item.severity && (
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border ${
                    item.severity === 'high'
                      ? 'bg-status-flagged-tint text-status-flagged border-status-flagged-border'
                      : 'bg-status-anomaly-tint text-status-anomaly border-status-anomaly-border'
                  }`}>
                    {item.severity}
                  </span>
                )}
              </div>
              <p className="text-xs text-toyota-600 mt-1 leading-relaxed">{item.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      {(passes.length > 1 || skips.length > 0) && (
        <footer className="flex items-center justify-between gap-3 px-5 py-2.5 border-t border-toyota-100 bg-toyota-50 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-toyota-700 hover:text-toyota-ink font-medium"
            >
              {expanded ? '− Collapse trace' : `+ Show full trace (${passes.length + (showSkipped ? skips.length : 0) - (expanded ? 0 : 1)} more)`}
            </button>
            {expanded && skips.length > 0 && (
              <label className="flex items-center gap-1.5 text-toyota-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showSkipped}
                  onChange={e => setShowSkipped(e.target.checked)}
                  className="accent-toyota-red"
                />
                Include {skips.length} skipped rule{skips.length === 1 ? '' : 's'}
              </label>
            )}
          </div>
          {summary?.summary && (
            <span className="text-toyota-500 italic truncate max-w-md" title={summary.summary}>
              "{summary.summary.slice(0, 90)}{summary.summary.length > 90 ? '…' : ''}"
            </span>
          )}
        </footer>
      )}
    </section>
  )
}

function StatusGlyph({ status }) {
  if (status === 'fail') {
    return (
      <span className="w-5 h-5 rounded-full bg-toyota-red text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5" aria-label="fail">
        ✗
      </span>
    )
  }
  if (status === 'pass') {
    return (
      <span className="w-5 h-5 rounded-full bg-status-clean text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5" aria-label="pass">
        ✓
      </span>
    )
  }
  return (
    <span className="w-5 h-5 rounded-full bg-toyota-100 text-toyota-400 text-[11px] font-medium flex items-center justify-center shrink-0 mt-0.5" aria-label="skipped">
      –
    </span>
  )
}
