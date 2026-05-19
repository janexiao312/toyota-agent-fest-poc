export default function PolicyFlagsPanel({ agentResults, rules }) {
  if (!agentResults?.validation) {
    return (
      <div className="bg-white border border-toyota-200 rounded-lg p-5 mb-4 animate-pulse">
        <div className="h-3 bg-toyota-100 rounded w-1/3 mb-3"></div>
        <div className="h-3 bg-toyota-100 rounded w-2/3 mb-2"></div>
        <div className="h-3 bg-toyota-100 rounded w-1/2"></div>
      </div>
    )
  }

  const { results } = agentResults.validation

  if (!results || results.length === 0) {
    return (
      <div className="bg-white border border-toyota-200 rounded-lg p-5 mb-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-toyota-500 mb-3">
          Policy Flags
        </h3>
        <p className="text-status-clean font-medium text-sm">✓ No policy violations detected</p>
      </div>
    )
  }

  const severityBadge = {
    low: 'bg-toyota-100 text-toyota-700 border-toyota-200',
    medium: 'bg-status-anomaly-tint text-status-anomaly border-status-anomaly-border',
    high: 'bg-status-flagged-tint text-status-flagged border-status-flagged-border',
  }

  return (
    <div className="bg-white border border-toyota-200 rounded-lg p-5 mb-4">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-toyota-500 mb-3">
        Policy Flags
      </h3>
      <div className="divide-y divide-toyota-100">
        {results.map(result => (
          <div key={result.ruleId} className="flex items-center gap-3 py-2.5">
            <span className="font-mono text-xs bg-toyota-100 text-toyota-700 px-2 py-0.5 rounded border border-toyota-200">
              {result.ruleId}
            </span>
            <span className="text-sm text-toyota-700 flex-1">{result.message}</span>
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                result.passed ? 'text-status-clean' : 'text-status-flagged'
              }`}
            >
              {result.passed ? 'Pass' : 'Fail'}
            </span>
            {!result.passed && result.severity && (
              <span
                className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm border capitalize ${severityBadge[result.severity]}`}
              >
                {result.severity}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
