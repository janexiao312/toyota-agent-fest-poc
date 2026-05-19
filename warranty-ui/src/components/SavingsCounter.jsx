export default function SavingsCounter({ claims, decisions }) {
  const reviewed = Object.values(decisions).filter(Boolean).length
  const rejectedFlagged = claims.filter(
    c => decisions[c.claimId] === 'reject' && (c.groundTruth === 'violation' || c.groundTruth === 'anomaly')
  )
  const flagsCaught = rejectedFlagged.length
  const leakagePrevented = rejectedFlagged.reduce((sum, c) => sum + c.claimAmount, 0)
  const totalFlaggedProcessed = claims.filter(
    c => decisions[c.claimId] && (c.groundTruth === 'violation' || c.groundTruth === 'anomaly')
  ).length
  const accuracy = totalFlaggedProcessed > 0 ? Math.round((flagsCaught / totalFlaggedProcessed) * 100) : 0

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex gap-8 items-center">
      <h1 className="text-lg font-semibold text-gray-800">Warranty Reviewer</h1>
      <div className="flex gap-8 ml-auto text-sm">
        <div>
          <span className="text-gray-500">Claims Reviewed</span>
          <span className="ml-2 font-semibold text-gray-800">{reviewed}</span>
        </div>
        <div>
          <span className="text-gray-500">Flags Caught</span>
          <span className="ml-2 font-semibold text-gray-800">{flagsCaught}</span>
        </div>
        <div>
          <span className="text-gray-500">Leakage Prevented</span>
          <span className="ml-2 font-semibold text-green-700">${leakagePrevented.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
        <div>
          <span className="text-gray-500">Accuracy</span>
          <span className="ml-2 font-semibold text-gray-800">{accuracy}%</span>
        </div>
      </div>
    </div>
  )
}
