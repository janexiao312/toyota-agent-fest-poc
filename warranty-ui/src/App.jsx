import { useState, useEffect } from 'react'
import SavingsCounter from './components/SavingsCounter'
import ClaimQueue from './components/ClaimQueue'
import ClaimDetail from './components/ClaimDetail'
import CustomerPortal from './components/CustomerPortal'
import SpecialistWorkspace from './components/SpecialistWorkspace'
import { useAgents } from './useAgents'
import claimsData from '../claims.json'
import rulesData from '../rules.json'

function App() {
  const [claims, setClaims] = useState([])
  const [activeClaimId, setActiveClaimId] = useState(null)
  const [decisions, setDecisions] = useState({})
  const [activeView, setActiveView] = useState('reviewer')
  const [contestData, setContestData] = useState({})

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
    // Auto-advance: select next flagged/anomaly claim (J1 blueprint: "Next claim auto-selected")
    const getStatus = (c) => {
      if (agentResults[c.claimId]?.validation?.overallSeverity === 'high') return 'flagged'
      if (agentResults[c.claimId]?.validation?.overallSeverity === 'medium') return 'anomaly'
      if (c.groundTruth === 'violation') return 'flagged'
      if (c.groundTruth === 'anomaly') return 'anomaly'
      return 'clean'
    }
    const nextClaim = claims.find(c =>
      c.claimId !== claimId &&
      !decisions[c.claimId] && // not already decided
      (getStatus(c) === 'flagged' || getStatus(c) === 'anomaly')
    )
    if (nextClaim) {
      setActiveClaimId(nextClaim.claimId)
      if (!agentResults[nextClaim.claimId]) runAgents(nextClaim)
    } else {
      setActiveClaimId(null)
    }
  }

  const handleContestSubmit = (claimId, reason, evidence) => {
    setContestData(prev => ({
      ...prev,
      [claimId]: { status: 'submitted', reason, evidence, resolution: null }
    }))
    // Simulate agent re-validation after short delay
    setTimeout(() => {
      setContestData(prev => ({
        ...prev,
        [claimId]: { ...prev[claimId], status: 'under_review' }
      }))
    }, 2000)
  }

  const handleResolve = (claimId, outcome, notes) => {
    setContestData(prev => ({
      ...prev,
      [claimId]: { ...prev[claimId], status: 'resolved', resolution: notes, outcome }
    }))
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Demo view toggle header */}
      <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center gap-4">
        <span className="text-sm font-semibold text-gray-800">Toyota Warranty Claims Engine</span>
        <span className="text-xs text-gray-400 mr-auto">POC Demo</span>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {['reviewer', 'customer', 'specialist'].map(view => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                activeView === view
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {view === 'reviewer' ? 'Reviewer' : view === 'customer' ? 'Customer View' : 'Specialist View'}
            </button>
          ))}
        </div>
      </div>

      {/* Reviewer view */}
      {activeView === 'reviewer' && (
        <>
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
              contestData={contestData}
              isLoading={isLoading}
              onSelectClaim={handleSelectClaim}
              onDecision={handleDecision}
            />
          )}
        </>
      )}

      {/* Customer view */}
      {activeView === 'customer' && (
        <CustomerPortal
          claims={claims}
          decisions={decisions}
          agentResults={agentResults}
          contestData={contestData}
          onContestSubmit={handleContestSubmit}
          rules={rulesData}
        />
      )}

      {/* Specialist view */}
      {activeView === 'specialist' && (
        <SpecialistWorkspace
          claims={claims}
          decisions={decisions}
          agentResults={agentResults}
          contestData={contestData}
          rules={rulesData}
          onResolve={handleResolve}
        />
      )}
    </div>
  )
}

export default App
