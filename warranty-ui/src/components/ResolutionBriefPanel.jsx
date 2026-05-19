export default function ResolutionBriefPanel({ claim, validation, contest }) {
  // Generate mock resolution brief based on claim data
  const getClassification = () => {
    if (!claim) return 'other'
    if (claim.repairCodes?.includes('U0100')) return 'documentation_gap'
    if (validation?.results?.some(r => !r.passed && r.ruleId === 'R-01')) return 'labor_dispute'
    if (validation?.results?.some(r => !r.passed && r.ruleId === 'R-06')) return 'coverage_question'
    return 'other'
  }

  const classification = getClassification()

  const classificationLabels = {
    labor_dispute: 'Labor Dispute',
    coverage_question: 'Coverage Question',
    documentation_gap: 'Documentation Gap',
    other: 'Other',
  }

  const classificationColors = {
    labor_dispute: 'bg-red-100 text-red-700',
    coverage_question: 'bg-amber-100 text-amber-700',
    documentation_gap: 'bg-purple-100 text-purple-700',
    other: 'bg-gray-100 text-gray-700',
  }

  // Mock evidence assessment
  const getEvidenceAssessment = () => {
    if (classification === 'documentation_gap') return 'changes_outcome'
    if (contest?.evidence?.length > 0) return 'needs_investigation'
    return 'no_material_change'
  }

  const evidenceAssessment = getEvidenceAssessment()
  const evidenceLabels = {
    changes_outcome: 'New evidence may change outcome',
    no_material_change: 'No material change to findings',
    needs_investigation: 'Requires further investigation',
  }
  const evidenceColors = {
    changes_outcome: 'text-green-700',
    no_material_change: 'text-gray-600',
    needs_investigation: 'text-amber-700',
  }

  // Mock precedents
  const precedents = [
    { caseId: 'CLM-18942', outcome: 'Overturned', reason: 'Independent diagnostic confirmed intermittent fault not reproducible at dealer.' },
    { caseId: 'CLM-21087', outcome: 'Upheld', reason: 'No supporting evidence provided. Original tech notes insufficient.' },
  ]

  // Mock gaps
  const gaps = classification === 'documentation_gap'
    ? ['Verify independent diagnostic report authenticity', 'Cross-reference TSB-0142-21 applicability to this VIN']
    : ['Confirm dealer repair history for this vehicle', 'Review technician certification status']

  // Mock recommendation
  const getRecommendation = () => {
    if (classification === 'documentation_gap' && evidenceAssessment === 'changes_outcome') {
      return { action: 'overturn', rationale: 'Customer has provided independent diagnostic evidence that substantiates the ECM fault. TSB reference is applicable. Original denial was based on unverified diagnosis — new evidence fills this gap.' }
    }
    if (classification === 'labor_dispute') {
      return { action: 'uphold', rationale: 'Labor hours significantly exceed policy cap. Customer contest does not address the core policy violation.' }
    }
    return { action: 'partial', rationale: 'Some merit to customer position but original policy concern remains partially valid.' }
  }

  const recommendation = getRecommendation()

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">AI Resolution Brief</h3>
        <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded">Agent Generated</span>
      </div>

      {/* Classification */}
      <div className="mb-4">
        <span className="text-xs text-gray-500 block mb-1">Contest Classification</span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${classificationColors[classification]}`}>
          {classificationLabels[classification]}
        </span>
      </div>

      {/* Evidence assessment */}
      <div className="mb-4">
        <span className="text-xs text-gray-500 block mb-1">New Evidence Assessment</span>
        <p className={`text-sm font-medium ${evidenceColors[evidenceAssessment]}`}>
          {evidenceLabels[evidenceAssessment]}
        </p>
      </div>

      {/* Precedent cases */}
      <div className="mb-4">
        <span className="text-xs text-gray-500 block mb-2">Precedent Cases</span>
        <div className="space-y-2">
          {precedents.map(p => (
            <div key={p.caseId} className="bg-gray-50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-mono text-xs text-gray-600">{p.caseId}</span>
                <span className={`text-xs font-medium ${p.outcome === 'Overturned' ? 'text-green-600' : 'text-red-600'}`}>
                  {p.outcome}
                </span>
              </div>
              <p className="text-xs text-gray-500">{p.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Identified gaps */}
      <div className="mb-4">
        <span className="text-xs text-gray-500 block mb-2">Identified Gaps</span>
        <ul className="space-y-1">
          {gaps.map((gap, i) => (
            <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">⚠</span>
              {gap}
            </li>
          ))}
        </ul>
      </div>

      {/* Agent recommendation */}
      <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-xl">
        <span className="text-xs text-gray-500 block mb-1">Agent Recommendation</span>
        <p className={`text-sm font-semibold capitalize mb-1 ${
          recommendation.action === 'overturn' ? 'text-green-700' :
          recommendation.action === 'uphold' ? 'text-red-700' :
          'text-amber-700'
        }`}>
          {recommendation.action}
        </p>
        <p className="text-xs text-gray-600 leading-relaxed">{recommendation.rationale}</p>
      </div>
    </div>
  )
}
