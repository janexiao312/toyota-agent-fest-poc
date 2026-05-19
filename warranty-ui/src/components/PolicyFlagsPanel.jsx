export default function PolicyFlagsPanel({ agentResults, rules }) {
  if (!agentResults?.validation) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4 animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-1/3 mb-3"></div>
        <div className="h-4 bg-gray-100 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-100 rounded w-1/2"></div>
      </div>
    )
  }

  const { results } = agentResults.validation

  if (!results || results.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Policy Flags</h3>
        <p className="text-green-600 font-medium text-sm">No policy violations detected</p>
      </div>
    )
  }

  const severityBadge = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-amber-100 text-amber-800',
    high: 'bg-red-100 text-red-800',
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Policy Flags</h3>
      <div className="space-y-2">
        {results.map(result => (
          <div key={result.ruleId} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
            <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{result.ruleId}</span>
            <span className="text-sm text-gray-600 flex-1">{result.message}</span>
            <span className={`text-sm font-medium ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
              {result.passed ? 'PASS' : 'FAIL'}
            </span>
            {!result.passed && result.severity && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${severityBadge[result.severity]}`}>
                {result.severity}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
