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
