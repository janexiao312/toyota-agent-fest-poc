export default function ContestStatusTracker({ status }) {
  const includeNeedsInfo = status === 'needs_info'
  const steps = includeNeedsInfo
    ? [
        { key: 'submitted', label: 'Contest Received' },
        { key: 'under_review', label: 'Under Review' },
        { key: 'needs_info', label: 'Information Requested' },
        { key: 'resolved', label: 'Decision Made' },
      ]
    : [
        { key: 'submitted', label: 'Contest Received' },
        { key: 'under_review', label: 'Under Review' },
        { key: 'resolved', label: 'Decision Made' },
      ]

  const currentIndex = steps.findIndex(s => s.key === status)

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Contest Status</h3>

      {/* Progress pills */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {steps.map((step, i) => (
          <div key={step.key} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
              i <= currentIndex
                ? 'bg-orange-100 text-orange-800'
                : 'bg-gray-100 text-gray-400'
            }`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                i < currentIndex ? 'bg-orange-500 text-white' :
                i === currentIndex ? 'bg-orange-500 text-white' :
                'bg-gray-300 text-white'
              }`}>
                {i < currentIndex ? '✓' : i + 1}
              </span>
              {step.label}
            </div>
            {i < steps.length - 1 && (
              <div className={`w-6 h-0.5 ${i < currentIndex ? 'bg-orange-300' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Status message — journey-aware empathetic copy */}
      <div className="text-sm text-gray-600">
        {status === 'submitted' && (
          <p>Your contest has been received and logged. Our AI agent is re-validating your claim with the additional evidence you provided. A warranty specialist will review shortly.</p>
        )}
        {status === 'under_review' && (
          <p>A warranty specialist is now reviewing your case alongside an AI-generated brief. They have access to your evidence and the original decision context. You'll be notified once a resolution is reached.</p>
        )}
        {status === 'needs_info' && (
          <p>The specialist needs additional information to complete your review. See the message below and provide a response to keep the review moving.</p>
        )}
        {status === 'resolved' && (
          <p>Your contest has been resolved. See the decision below — thank you for your patience throughout this process.</p>
        )}
      </div>
    </div>
  )
}
