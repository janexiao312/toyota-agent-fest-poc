// Named agents that handle distinct parts of the warranty workflow.
// Surfaced consistently across the UI so users learn which agent owns what.

export const AGENTS = {
  atlas: {
    id: 'atlas',
    name: 'Atlas',
    role: 'Validation Agent',
    blurb: 'Checks every claim against policy rules and dealer-pattern signals.',
    color: 'purple',
  },
  sage: {
    id: 'sage',
    name: 'Sage',
    role: 'Communications Agent',
    blurb: 'Translates verdicts into plain-language explanations for customers.',
    color: 'blue',
  },
  ember: {
    id: 'ember',
    name: 'Ember',
    role: 'Resolution Agent',
    blurb: 'Drafts resolution briefs with precedents and identified gaps.',
    color: 'amber',
  },
}

export const AGENT_TONE = {
  // Tailwind class fragments per agent color
  purple: {
    badge: 'bg-purple-100 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
    accentText: 'text-purple-700',
    accentBg: 'bg-purple-50',
    accentBorder: 'border-purple-200',
  },
  blue: {
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    accentText: 'text-blue-700',
    accentBg: 'bg-blue-50',
    accentBorder: 'border-blue-200',
  },
  amber: {
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    accentText: 'text-amber-700',
    accentBg: 'bg-amber-50',
    accentBorder: 'border-amber-200',
  },
}

// Build a reasoning trace for a claim: ordered list of rule checks that Atlas performed.
// Returns an array of { step, ruleId, label, detail, status: 'pass' | 'fail' | 'skip' }.
export function buildReasoningTrace(claim, rules, validation) {
  if (!claim || !rules) return []
  const failuresByRule = new Map(
    (validation?.results ?? []).filter(r => !r.passed).map(r => [r.ruleId, r])
  )
  const passesByRule = new Map(
    (validation?.results ?? []).filter(r => r.passed).map(r => [r.ruleId, r])
  )

  const trace = []
  let step = 1
  for (const rule of rules) {
    const ruleApplies = doesRuleApply(rule, claim)
    if (!ruleApplies) {
      trace.push({
        step: step++,
        ruleId: rule.ruleId,
        label: rule.description ?? rule.ruleId,
        detail: ruleNotApplicableDetail(rule, claim),
        status: 'skip',
      })
      continue
    }
    const failure = failuresByRule.get(rule.ruleId)
    if (failure) {
      trace.push({
        step: step++,
        ruleId: rule.ruleId,
        label: rule.description ?? failure.message ?? rule.ruleId,
        detail: ruleFailureDetail(rule, claim, failure),
        status: 'fail',
        severity: failure.severity,
      })
    } else if (passesByRule.has(rule.ruleId)) {
      trace.push({
        step: step++,
        ruleId: rule.ruleId,
        label: rule.description ?? rule.ruleId,
        detail: rulePassDetail(rule, claim),
        status: 'pass',
      })
    }
  }
  return trace
}

function doesRuleApply(rule, claim) {
  if (rule.maxHours && rule.repairCode) {
    return claim.repairCodes?.includes(rule.repairCode)
  }
  if (rule.maxMileage && rule.warrantyType) {
    return claim.warrantyType === rule.warrantyType
  }
  if (rule.basicExclusions) {
    return claim.warrantyType === 'basic'
  }
  if (rule.powertrainExclusions) {
    return claim.warrantyType === 'powertrain'
  }
  if (rule.flagPhrases) {
    return rule.repairCodes?.some(rc => claim.repairCodes?.includes(rc))
  }
  return false
}

function ruleNotApplicableDetail(rule, claim) {
  if (rule.maxHours && rule.repairCode) {
    return `Repair code ${rule.repairCode} not present on this claim — rule does not apply.`
  }
  if (rule.maxMileage && rule.warrantyType) {
    return `Claim warranty is "${claim.warrantyType}" — rule applies to "${rule.warrantyType}" only.`
  }
  if (rule.basicExclusions) {
    return `Claim warranty is "${claim.warrantyType}" — basic-warranty exclusions don't apply.`
  }
  if (rule.powertrainExclusions) {
    return `Claim warranty is "${claim.warrantyType}" — powertrain exclusions don't apply.`
  }
  if (rule.flagPhrases) {
    return `None of the gating repair codes on the claim — diagnostic phrase check skipped.`
  }
  return 'Rule not applicable to this claim.'
}

function rulePassDetail(rule, claim) {
  if (rule.maxHours) {
    return `Labor hours ${claim.laborHours} ≤ policy cap of ${rule.maxHours} for ${rule.repairCode}.`
  }
  if (rule.maxMileage) {
    return `Vehicle mileage ${claim.vehicleMileage?.toLocaleString()} ≤ ${rule.maxMileage.toLocaleString()} mi cap.`
  }
  if (rule.basicExclusions) {
    return `No excluded repair codes present (${rule.basicExclusions.join(', ')}).`
  }
  if (rule.powertrainExclusions) {
    return `No excluded repair codes present (${rule.powertrainExclusions.join(', ')}).`
  }
  if (rule.flagPhrases) {
    return `Tech notes do not contain any flag phrases (${rule.flagPhrases.join(', ')}).`
  }
  return 'Passed.'
}

function ruleFailureDetail(rule, claim, failure) {
  if (rule.maxHours) {
    return `Labor hours ${claim.laborHours} exceed policy cap of ${rule.maxHours} for ${rule.repairCode}. ${failure.message ?? ''}`.trim()
  }
  if (rule.maxMileage) {
    return `Vehicle mileage ${claim.vehicleMileage?.toLocaleString()} exceeds ${rule.maxMileage.toLocaleString()} mi cap for ${claim.warrantyType} warranty. ${failure.message ?? ''}`.trim()
  }
  if (rule.basicExclusions) {
    const hits = claim.repairCodes.filter(rc => rule.basicExclusions.includes(rc))
    return `Repair codes ${hits.join(', ')} not covered by basic warranty. ${failure.message ?? ''}`.trim()
  }
  if (rule.powertrainExclusions) {
    const hits = claim.repairCodes.filter(rc => rule.powertrainExclusions.includes(rc))
    return `Repair codes ${hits.join(', ')} not covered by powertrain warranty. ${failure.message ?? ''}`.trim()
  }
  if (rule.flagPhrases) {
    return `Tech notes match a flag phrase suggesting documentation gap. ${failure.message ?? ''}`.trim()
  }
  return failure.message ?? 'Rule violated.'
}
