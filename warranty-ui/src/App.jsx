import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import SavingsCounter from './components/SavingsCounter'
import ClaimQueue from './components/ClaimQueue'
import ClaimDetail from './components/ClaimDetail'
import CustomerPortal from './components/CustomerPortal'
import SpecialistWorkspace from './components/SpecialistWorkspace'
import LandingPage from './components/LandingPage'
import { useAgents } from './useAgents'
import claimsData from '../claims.json'
import rulesData from '../rules.json'

function SpecialistRoute() {
  const navigate = useNavigate()
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
    const getStatus = (c) => {
      if (agentResults[c.claimId]?.validation?.overallSeverity === 'high') return 'flagged'
      if (agentResults[c.claimId]?.validation?.overallSeverity === 'medium') return 'anomaly'
      if (c.groundTruth === 'violation') return 'flagged'
      if (c.groundTruth === 'anomaly') return 'anomaly'
      return 'clean'
    }
    const nextClaim = claims.find(c =>
      c.claimId !== claimId &&
      !decisions[c.claimId] &&
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
    <div className="bg-toyota-50 min-h-screen">
      {/* Red stripe */}
      <div className="h-1 bg-toyota-red" />

      {/* App nav bar */}
      <header className="bg-white border-b border-toyota-200">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center gap-8">
          {/* Logo + label */}
          <button onClick={() => navigate('/')} className="flex items-center shrink-0 group" title="Back to Home">
            <svg viewBox="74.262 74.262 300 224.776" xmlns="http://www.w3.org/2000/svg" className="h-7 w-auto" aria-label="Toyota">
              <rect x="74.7" y="74.7" fill="#EB0A1E" width="224" height="224"/>
              <path fill="#FFFFFF" d="M224,137.8c-10.4-3.3-23.3-5.3-37.4-5.3c-14,0-27,2-37.4,5.3c-27.6,8.9-46.6,27.3-46.6,48.7 c0,30,37.6,54.3,84,54.3c46.4,0,84-24.3,84-54.3C270.7,165.2,251.7,146.7,224,137.8 M186.7,217.5c-6.9,0-12.6-13.6-12.9-30.7 c4.2,0.4,8.5,0.6,12.9,0.6c4.4,0,8.7-0.2,12.9-0.6C199.2,203.9,193.6,217.5,186.7,217.5 M174.6,173.4c1.9-12,6.6-20.5,12-20.5 c5.5,0,10.1,8.5,12,20.5c-3.8,0.3-7.9,0.5-12,0.5C182.5,173.9,178.5,173.7,174.6,173.4 M206.1,172.5c-2.8-18.8-10.4-32.4-19.4-32.4 c-9,0-16.6,13.5-19.4,32.4c-17.1-2.7-29-8.7-29-15.8c0-9.5,21.7-17.2,48.4-17.2c26.7,0,48.4,7.7,48.4,17.2 C235,163.7,223.1,169.8,206.1,172.5 M114.9,184.5c0-9.2,3.5-17.8,9.7-25.2c-0.1,0.5-0.1,1-0.1,1.6c0,11.6,17.4,21.4,41.6,25 c0,0.9,0,1.8,0,2.6c0,21.5,6,39.7,14.2,46C143.7,232.3,114.9,210.7,114.9,184.5 M193,234.5c8.2-6.3,14.2-24.5,14.2-46 c0-0.9,0-1.8,0-2.6c24.2-3.6,41.6-13.5,41.6-25c0-0.5,0-1-0.1-1.6c6.2,7.4,9.7,16,9.7,25.2C258.4,210.7,229.6,232.3,193,234.5"/>
            </svg>
            <span className="ml-3 pl-3 border-l border-toyota-300 text-toyota-ink font-semibold text-sm">
              Warranty Reviewer
            </span>
          </button>

          {/* Nav tabs */}
          <nav className="flex items-center gap-1 text-sm font-medium">
            {['reviewer', 'specialist'].map(view => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeView === view
                    ? 'text-toyota-ink bg-toyota-100'
                    : 'text-toyota-600 hover:text-toyota-ink'
                }`}
              >
                {view === 'reviewer' ? 'Queue' : 'Specialist'}
              </button>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Profile chip */}
          <div className="ml-auto pl-3 border-l border-toyota-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-toyota-ink text-white text-sm font-semibold flex items-center justify-center">JD</div>
            <div className="leading-tight text-left hidden sm:block">
              <div className="text-sm font-semibold text-toyota-ink">Jordan Diaz</div>
              <div className="text-[11px] text-toyota-500">Senior Reviewer</div>
            </div>
          </div>
        </div>
      </header>

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

function CustomerRoute() {
  const navigate = useNavigate()
  const [claims, setClaims] = useState([])
  const [decisions, setDecisions] = useState({})
  const [contestData, setContestData] = useState({})

  const { agentResults, runAgents } = useAgents(claims, rulesData)

  useEffect(() => {
    setClaims(claimsData)
    // Pre-run agents on the demo claim (CLM-00005) so results are ready
    const demoClaim = claimsData.find(c => c.claimId === 'CLM-00005')
    if (demoClaim) {
      // Small delay to ensure state is set
      setTimeout(() => runAgents(demoClaim), 300)
      // Simulate agent decision after processing
      setTimeout(() => {
        setDecisions(prev => ({ ...prev, 'CLM-00005': 'reject' }))
      }, 4000)
    }
  }, [])

  const handleContestSubmit = (claimId, reason, evidence) => {
    setContestData(prev => ({
      ...prev,
      [claimId]: { status: 'submitted', reason, evidence, resolution: null }
    }))
    setTimeout(() => {
      setContestData(prev => ({
        ...prev,
        [claimId]: { ...prev[claimId], status: 'under_review' }
      }))
    }, 2000)
  }

  return (
    <div className="bg-toyota-50 min-h-screen">
      {/* Red stripe */}
      <div className="h-1 bg-toyota-red" />

      {/* App nav bar */}
      <header className="bg-white border-b border-toyota-200">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center gap-8">
          <button onClick={() => navigate('/')} className="flex items-center shrink-0 group" title="Back to Home">
            <svg viewBox="74.262 74.262 300 224.776" xmlns="http://www.w3.org/2000/svg" className="h-7 w-auto" aria-label="Toyota">
              <rect x="74.7" y="74.7" fill="#EB0A1E" width="224" height="224"/>
              <path fill="#FFFFFF" d="M224,137.8c-10.4-3.3-23.3-5.3-37.4-5.3c-14,0-27,2-37.4,5.3c-27.6,8.9-46.6,27.3-46.6,48.7 c0,30,37.6,54.3,84,54.3c46.4,0,84-24.3,84-54.3C270.7,165.2,251.7,146.7,224,137.8 M186.7,217.5c-6.9,0-12.6-13.6-12.9-30.7 c4.2,0.4,8.5,0.6,12.9,0.6c4.4,0,8.7-0.2,12.9-0.6C199.2,203.9,193.6,217.5,186.7,217.5 M174.6,173.4c1.9-12,6.6-20.5,12-20.5 c5.5,0,10.1,8.5,12,20.5c-3.8,0.3-7.9,0.5-12,0.5C182.5,173.9,178.5,173.7,174.6,173.4 M206.1,172.5c-2.8-18.8-10.4-32.4-19.4-32.4 c-9,0-16.6,13.5-19.4,32.4c-17.1-2.7-29-8.7-29-15.8c0-9.5,21.7-17.2,48.4-17.2c26.7,0,48.4,7.7,48.4,17.2 C235,163.7,223.1,169.8,206.1,172.5 M114.9,184.5c0-9.2,3.5-17.8,9.7-25.2c-0.1,0.5-0.1,1-0.1,1.6c0,11.6,17.4,21.4,41.6,25 c0,0.9,0,1.8,0,2.6c0,21.5,6,39.7,14.2,46C143.7,232.3,114.9,210.7,114.9,184.5 M193,234.5c8.2-6.3,14.2-24.5,14.2-46 c0-0.9,0-1.8,0-2.6c24.2-3.6,41.6-13.5,41.6-25c0-0.5,0-1-0.1-1.6c6.2,7.4,9.7,16,9.7,25.2C258.4,210.7,229.6,232.3,193,234.5"/>
            </svg>
            <span className="ml-3 pl-3 border-l border-toyota-300 text-toyota-ink font-semibold text-sm">
              Customer Portal
            </span>
          </button>

          <div className="flex-1" />

          {/* Profile chip */}
          <div className="ml-auto pl-3 border-l border-toyota-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-toyota-red-tint text-toyota-red text-sm font-semibold flex items-center justify-center">TK</div>
            <div className="leading-tight text-left hidden sm:block">
              <div className="text-sm font-semibold text-toyota-ink">Tom K.</div>
              <div className="text-[11px] text-toyota-500">Vehicle Owner</div>
            </div>
          </div>
        </div>
      </header>

      <CustomerPortal
        claims={claims}
        decisions={decisions}
        agentResults={agentResults}
        contestData={contestData}
        onContestSubmit={handleContestSubmit}
        rules={rulesData}
      />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/customer" element={<CustomerRoute />} />
      <Route path="/specialist" element={<SpecialistRoute />} />
    </Routes>
  )
}

export default App
