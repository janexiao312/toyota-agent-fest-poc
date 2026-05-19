import { useState } from 'react'
import { countRuleTriggers } from '../claimsStore'
import MetricsStrip from './MetricsStrip'

export default function RulesView({ claims, rules, role }) {
  const [enabled, setEnabled] = useState(
    Object.fromEntries(rules.map(r => [r.ruleId, true]))
  )
  const [filter, setFilter] = useState('all')

  const canEdit = role === 'reviewer' || role === 'manager'

  const triggerCounts = Object.fromEntries(
    rules.map(r => [r.ruleId, countRuleTriggers(r, claims)])
  )
  const totalTriggers = Object.values(triggerCounts).reduce((a, b) => a + b, 0)
  const activeCount = Object.values(enabled).filter(Boolean).length
  const highCount = rules.filter(r => r.violationSeverity === 'high').length

  const filtered = rules.filter(r => {
    if (filter === 'all') return true
    if (filter === 'enabled') return enabled[r.ruleId]
    if (filter === 'disabled') return !enabled[r.ruleId]
    return r.violationSeverity === filter
  })

  const tabs = [
    { id: 'all', label: 'All', count: rules.length },
    { id: 'enabled', label: 'Enabled', count: activeCount },
    { id: 'high', label: 'High severity', count: highCount },
    { id: 'medium', label: 'Medium severity', count: rules.length - highCount },
  ]

  return (
    <>
      <MetricsStrip
        contextLabel="Policy rules"
        metrics={[
          { label: 'Active Rules', value: `${activeCount} / ${rules.length}` },
          { label: 'High Severity', value: highCount },
          { label: 'Triggers This Period', value: totalTriggers, accent: totalTriggers > 0 },
          { label: 'Last Updated', value: 'Mar 12' },
        ]}
      />

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-6 gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-toyota-ink tracking-tight">Policy Rules</h2>
            <p className="text-sm text-toyota-500 mt-1 max-w-2xl">
              The validation agent checks every claim against these rules. Disable a rule to suppress its findings
              {canEdit ? '' : ' (read-only for your role)'}.
            </p>
          </div>
          {canEdit && (
            <button className="bg-toyota-ink text-white px-4 py-2 rounded-md text-sm font-semibold whitespace-nowrap">
              + New rule
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={
                filter === t.id
                  ? 'px-4 py-2 rounded-md text-sm font-medium bg-toyota-ink text-white'
                  : 'px-4 py-2 rounded-md text-sm font-medium bg-white border border-toyota-200 text-toyota-600 hover:border-toyota-300 hover:text-toyota-ink'
              }
            >
              {t.label}
              <span className={`ml-2 text-xs ${filter === t.id ? 'text-toyota-300' : 'text-toyota-400'}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        <div className="bg-white border border-toyota-200 rounded-lg divide-y divide-toyota-100">
          {filtered.map(rule => (
            <RuleRow
              key={rule.ruleId}
              rule={rule}
              enabled={enabled[rule.ruleId]}
              onToggle={() => canEdit && setEnabled(e => ({ ...e, [rule.ruleId]: !e[rule.ruleId] }))}
              canEdit={canEdit}
              triggerCount={triggerCounts[rule.ruleId]}
            />
          ))}
        </div>
      </div>
    </>
  )
}

function RuleRow({ rule, enabled, onToggle, canEdit, triggerCount }) {
  const [open, setOpen] = useState(false)
  const sevBadge = rule.violationSeverity === 'high'
    ? 'bg-status-flagged-tint text-status-flagged border-status-flagged-border'
    : 'bg-status-anomaly-tint text-status-anomaly border-status-anomaly-border'

  return (
    <div className={`p-5 ${enabled ? '' : 'opacity-60'}`}>
      <div className="flex items-center gap-4">
        <span className="font-mono text-xs bg-toyota-100 text-toyota-700 px-2 py-1 rounded border border-toyota-200">
          {rule.ruleId}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-toyota-ink">{rule.description}</div>
          <div className="text-xs text-toyota-500 mt-0.5">{rule.message}</div>
        </div>
        <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm border capitalize ${sevBadge}`}>
          {rule.violationSeverity}
        </span>
        <div className="text-right">
          <div className="text-base font-semibold tabular-nums text-toyota-ink">{triggerCount}</div>
          <div className="text-[10px] uppercase tracking-wider text-toyota-500">Triggers</div>
        </div>
        <button
          onClick={onToggle}
          disabled={!canEdit}
          className={`shrink-0 relative w-10 h-6 rounded-full transition-colors ${
            enabled ? 'bg-toyota-red' : 'bg-toyota-200'
          } ${!canEdit ? 'cursor-not-allowed' : ''}`}
          aria-pressed={enabled}
          title={canEdit ? (enabled ? 'Disable rule' : 'Enable rule') : 'Read-only'}
        >
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${enabled ? 'left-[18px]' : 'left-0.5'}`} />
        </button>
        <button
          onClick={() => setOpen(o => !o)}
          className="text-xs text-toyota-500 hover:text-toyota-ink font-medium uppercase tracking-wider px-2"
        >
          {open ? 'Hide' : 'Details'}
        </button>
      </div>
      {open && (
        <div className="mt-4 ml-12 grid grid-cols-3 gap-6 pt-4 border-t border-toyota-100 text-xs">
          <Field label="Condition" value={rule.condition} mono />
          {rule.repairCode && <Field label="Repair Code" value={rule.repairCode} mono />}
          {rule.maxHours && <Field label="Max Hours" value={`${rule.maxHours} hrs`} />}
          {rule.maxMileage && <Field label="Max Mileage" value={`${rule.maxMileage.toLocaleString()} mi`} />}
          {rule.warrantyType && <Field label="Applies To" value={rule.warrantyType} capitalize />}
          {rule.basicExclusions && <Field label="Excluded Codes" value={rule.basicExclusions.join(', ')} mono />}
          {rule.powertrainExclusions && <Field label="Excluded Codes" value={rule.powertrainExclusions.join(', ')} mono />}
          {rule.flagPhrases && <Field label="Flag Phrases" value={rule.flagPhrases.join(' / ')} />}
          <div className="col-span-3">
            <div className="text-[11px] uppercase tracking-wider text-toyota-500 font-medium">Example violation</div>
            <p className="mt-1 text-toyota-700 italic">{rule.exampleViolation}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, mono = false, capitalize = false }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-toyota-500 font-medium">{label}</div>
      <div className={`mt-1 text-toyota-700 ${mono ? 'font-mono' : ''} ${capitalize ? 'capitalize' : ''}`}>{value}</div>
    </div>
  )
}
