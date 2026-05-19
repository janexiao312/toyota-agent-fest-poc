import { useState, useEffect } from 'react'

// Placeholder for Engineer C's agent functions
// These will be replaced with real implementations at integration time
async function validateClaim(claim, rules) {
  // Mock: return validation based on groundTruth for demo purposes
  await new Promise(r => setTimeout(r, 500))

  const results = rules.map(rule => {
    let passed = true
    let severity = null

    // R-01 through R-05: labor hour checks
    if (rule.maxHours && rule.repairCode && claim.repairCodes.includes(rule.repairCode)) {
      if (claim.laborHours > rule.maxHours) {
        passed = false
        severity = rule.violationSeverity
      }
    }

    // R-06, R-07: mileage checks
    if (rule.maxMileage && rule.warrantyType === claim.warrantyType) {
      if (claim.vehicleMileage > rule.maxMileage) {
        passed = false
        severity = rule.violationSeverity
      }
    }

    // R-08: basic warranty exclusions
    if (rule.basicExclusions && claim.warrantyType === 'basic') {
      if (claim.repairCodes.some(code => rule.basicExclusions.includes(code))) {
        passed = false
        severity = rule.violationSeverity
      }
    }

    // R-09: powertrain warranty exclusions
    if (rule.powertrainExclusions && claim.warrantyType === 'powertrain') {
      if (claim.repairCodes.some(code => rule.powertrainExclusions.includes(code))) {
        passed = false
        severity = rule.violationSeverity
      }
    }

    // R-10: diagnostic evidence check
    if (rule.flagPhrases && claim.techNotes) {
      const notesLower = claim.techNotes.toLowerCase()
      if (rule.flagPhrases.some(phrase => notesLower.includes(phrase))) {
        if (rule.repairCodes && claim.repairCodes.some(code => rule.repairCodes.includes(code))) {
          passed = false
          severity = rule.violationSeverity
        }
      }
    }

    return { ruleId: rule.ruleId, passed, severity, message: rule.message }
  })

  const failures = results.filter(r => !r.passed)
  let overallSeverity = 'none'
  if (failures.some(f => f.severity === 'high')) overallSeverity = 'high'
  else if (failures.some(f => f.severity === 'medium')) overallSeverity = 'medium'
  else if (failures.length > 0) overallSeverity = 'low'

  return { results, overallSeverity }
}

async function summarizeClaim(claim, validation) {
  await new Promise(r => setTimeout(r, 300))

  const failures = validation.results.filter(r => !r.passed)

  let recommendation = 'approve'
  let confidence = 'high'
  let summary = ''

  if (validation.overallSeverity === 'high') {
    recommendation = 'reject'
    confidence = 'high'
    summary = `This claim has ${failures.length} policy violation(s) requiring immediate attention. ${failures.map(f => f.message).join(' ')} Recommend rejection based on clear policy breach.`
  } else if (validation.overallSeverity === 'medium') {
    recommendation = 'review'
    confidence = 'medium'
    summary = `This claim has ${failures.length} flag(s) that require human review. ${failures.map(f => f.message).join(' ')} The violation is not clear-cut — escalation recommended.`
  } else if (claim.groundTruth === 'anomaly') {
    recommendation = 'review'
    confidence = 'medium'
    summary = `This claim appears statistically anomalous. The pattern of claims from this dealer warrants further investigation. No specific policy rule was violated, but the claim pattern is unusual.`
  } else {
    recommendation = 'approve'
    confidence = 'high'
    summary = `This claim passes all policy checks. Labor hours, mileage, and repair codes are within normal parameters. No issues detected — approve for payment.`
  }

  return { summary, recommendation, confidence }
}

export function useAgents(claims, rules) {
  const [agentResults, setAgentResults] = useState({})
  const [isLoading, setIsLoading] = useState({})

  useEffect(() => {
    if (!claims.length || !rules.length) return

    // Pre-run agents for hero claims on load
    const heroClaims = claims.filter(c =>
      ['CLM-00001', 'CLM-00002', 'CLM-00003', 'CLM-00004', 'CLM-00005'].includes(c.claimId)
    )

    heroClaims.forEach(async (claim) => {
      setIsLoading(prev => ({ ...prev, [claim.claimId]: true }))
      try {
        const validation = await validateClaim(claim, rules)
        const summary = await summarizeClaim(claim, validation)
        setAgentResults(prev => ({
          ...prev,
          [claim.claimId]: { validation, summary }
        }))
      } finally {
        setIsLoading(prev => ({ ...prev, [claim.claimId]: false }))
      }
    })
  }, [claims, rules])

  const runAgents = async (claim) => {
    if (agentResults[claim.claimId]) return agentResults[claim.claimId]

    setIsLoading(prev => ({ ...prev, [claim.claimId]: true }))
    try {
      const validation = await validateClaim(claim, rules)
      const summary = await summarizeClaim(claim, validation)
      const result = { validation, summary }
      setAgentResults(prev => ({ ...prev, [claim.claimId]: result }))
      return result
    } finally {
      setIsLoading(prev => ({ ...prev, [claim.claimId]: false }))
    }
  }

  return { agentResults, isLoading, runAgents }
}

export async function generateCustomerExplanation(claim, validation) {
  await new Promise(r => setTimeout(r, 300))
  const failures = validation?.results?.filter(r => !r.passed) || []
  if (failures.length === 0) {
    return {
      explanation: `Your warranty claim (${claim.claimId}) has been approved. All policy requirements were met and your claim will be processed for payment.`,
      ruleReference: 'No violations found',
      contestEligible: false
    }
  }
  const mainRule = failures[0]
  return {
    explanation: `Your warranty claim (${claim.claimId}) for ${claim.warrantyType} coverage was reviewed. ${mainRule.message} Based on this policy requirement, your claim has been flagged for further review or denial.`,
    ruleReference: `${mainRule.ruleId}: ${mainRule.message}`,
    contestEligible: true
  }
}

export async function generateResolutionBrief(claim, validation, contest) {
  await new Promise(r => setTimeout(r, 500))
  const failures = validation?.results?.filter(r => !r.passed) || []

  let classification = 'other'
  if (claim.repairCodes?.includes('U0100')) classification = 'documentation_gap'
  else if (failures.some(f => f.ruleId === 'R-01')) classification = 'labor_dispute'
  else if (failures.some(f => f.ruleId === 'R-06')) classification = 'coverage_question'

  let evidenceAssessment = 'no_material_change'
  if (classification === 'documentation_gap' && contest?.evidence?.length > 0) {
    evidenceAssessment = 'changes_outcome'
  } else if (contest?.evidence?.length > 0) {
    evidenceAssessment = 'needs_investigation'
  }

  let recommendation = 'uphold'
  let rationale = 'Original policy concern remains valid. Customer contest does not address the core violation.'
  if (evidenceAssessment === 'changes_outcome') {
    recommendation = 'overturn'
    rationale = 'Customer has provided independent evidence that substantiates the repair necessity. Original denial was based on unverified diagnosis — new evidence fills this gap.'
  } else if (evidenceAssessment === 'needs_investigation') {
    recommendation = 'partial'
    rationale = 'Some merit to customer position but original policy concern remains partially valid.'
  }

  return {
    classification,
    evidenceAssessment,
    precedents: [
      { caseId: 'CLM-18942', outcome: 'Overturned', reason: 'Independent diagnostic confirmed intermittent fault.' },
      { caseId: 'CLM-21087', outcome: 'Upheld', reason: 'No supporting evidence provided.' },
    ],
    gaps: classification === 'documentation_gap'
      ? ['Verify independent diagnostic report authenticity', 'Cross-reference TSB applicability to this VIN']
      : ['Confirm dealer repair history', 'Review technician certification status'],
    recommendation,
    rationale
  }
}
