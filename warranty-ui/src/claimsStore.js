import claimsData from '../claims.json'
import rulesData from '../rules.json'

export function getClaims() {
  return claimsData
}

export function getRules() {
  return rulesData
}

export function getClaimById(claimId) {
  return claimsData.find(c => c.claimId === claimId)
}

export function getFlaggedClaims() {
  return claimsData.filter(c => c.groundTruth === 'violation' || c.groundTruth === 'anomaly')
}

export function getStatus(claim, agentResults) {
  const sev = agentResults?.[claim.claimId]?.validation?.overallSeverity
  if (sev === 'high') return 'Flagged'
  if (sev === 'medium') return 'Anomaly'
  if (sev === 'low') return 'Clean'
  if (claim.groundTruth === 'violation') return 'Flagged'
  if (claim.groundTruth === 'anomaly') return 'Anomaly'
  return 'Clean'
}

export function getDealerStats(claims, agentResults = {}) {
  const byDealer = new Map()
  for (const claim of claims) {
    const status = getStatus(claim, agentResults)
    const entry = byDealer.get(claim.dealerId) ?? {
      dealerId: claim.dealerId,
      claimCount: 0,
      totalAmount: 0,
      flagged: 0,
      anomaly: 0,
      clean: 0,
      claims: [],
    }
    entry.claimCount += 1
    entry.totalAmount += claim.claimAmount
    entry[status.toLowerCase()] += 1
    entry.claims.push(claim)
    byDealer.set(claim.dealerId, entry)
  }
  return [...byDealer.values()].map(d => ({
    ...d,
    flagRate: d.claimCount > 0 ? (d.flagged + d.anomaly) / d.claimCount : 0,
    riskScore: d.flagged * 3 + d.anomaly * 1,
  }))
}

export function getStatusMix(claims, agentResults = {}) {
  const mix = { Clean: 0, Flagged: 0, Anomaly: 0 }
  for (const claim of claims) {
    mix[getStatus(claim, agentResults)] += 1
  }
  return mix
}

export function getWarrantyMix(claims) {
  const mix = {}
  for (const claim of claims) {
    mix[claim.warrantyType] = (mix[claim.warrantyType] ?? 0) + 1
  }
  return mix
}

export function doesViolateRule(rule, claim) {
  switch (rule.field) {
    case 'laborHours':
      return claim.repairCodes.includes(rule.repairCode) && claim.laborHours > rule.maxHours
    case 'vehicleMileage':
      return claim.warrantyType === rule.warrantyType && claim.vehicleMileage > rule.maxMileage
    case 'repairCodes':
      if (rule.basicExclusions) {
        return claim.warrantyType === 'basic'
          && claim.repairCodes.some(rc => rule.basicExclusions.includes(rc))
      }
      if (rule.powertrainExclusions) {
        return claim.warrantyType === 'powertrain'
          && claim.repairCodes.some(rc => rule.powertrainExclusions.includes(rc))
      }
      return false
    case 'techNotes': {
      const codesMatch = rule.repairCodes?.some(rc => claim.repairCodes.includes(rc))
      if (!codesMatch) return false
      const notes = (claim.techNotes ?? '').toLowerCase()
      return (rule.flagPhrases ?? []).some(p => notes.includes(p.toLowerCase()))
    }
    default:
      return false
  }
}

export function countRuleTriggers(rule, claims) {
  return claims.filter(c => doesViolateRule(rule, c)).length
}

export function searchClaimsAndDealers(claims, query) {
  const q = (query ?? '').trim().toLowerCase()
  if (!q) return { claims: [], dealers: [] }
  const claimHits = claims
    .filter(c =>
      c.claimId.toLowerCase().includes(q)
      || c.vin.toLowerCase().includes(q)
      || c.dealerId.toLowerCase().includes(q)
      || c.repairCodes.some(rc => rc.toLowerCase().includes(q))
    )
    .slice(0, 8)
  const seenDealers = new Set()
  const dealerHits = []
  for (const c of claims) {
    if (!c.dealerId.toLowerCase().includes(q)) continue
    if (seenDealers.has(c.dealerId)) continue
    seenDealers.add(c.dealerId)
    dealerHits.push(c.dealerId)
    if (dealerHits.length >= 5) break
  }
  return { claims: claimHits, dealers: dealerHits }
}
