import { useState, useEffect } from 'react'
import SavingsCounter from './components/SavingsCounter'
import ClaimQueue from './components/ClaimQueue'
import ClaimDetail from './components/ClaimDetail'
import { useAgents } from './useAgents'
import claimsData from '../claims.json'
import rulesData from '../rules.json'

function App() {
  const [claims, setClaims] = useState([])
  const [activeClaimId, setActiveClaimId] = useState(null)
  const [decisions, setDecisions] = useState({})

  const { agentResults, isLoading, runAgents } = useAgents(claims, rulesData)

  useEffect(() => {
    setClaims(claimsData)
  }, [])

  const activeClaim = claims.find(c => c.claimId === activeClaimId)

  const handleSelectClaim = (claimId) => {
    setActiveClaimId(claimId)
    const claim = claims.find(c => c.claimId === claimId)
    if (claim && !agentResults[claimId]) {
      runAgents(claim)
    }
  }

  const handleDecision = (claimId, decision) => {
    setDecisions(prev => ({ ...prev, [claimId]: decision }))
    setActiveClaimId(null)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <SavingsCounter claims={claims} decisions={decisions} />
      {activeClaimId && activeClaim ? (
        <ClaimDetail
          claim={activeClaim}
          rules={rulesData}
          agentResults={agentResults[activeClaimId]}
          onDecision={handleDecision}
          onBack={() => setActiveClaimId(null)}
        />
      ) : (
        <ClaimQueue
          claims={claims}
          decisions={decisions}
          agentResults={agentResults}
          onSelectClaim={handleSelectClaim}
          onDecision={handleDecision}
        />
      )}
    </div>
  )
}

export default App
