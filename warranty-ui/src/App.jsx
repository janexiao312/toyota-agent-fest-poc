import { useState, useEffect } from 'react'
import LoginScreen from './components/LoginScreen'
import NavBar from './components/NavBar'
import MetricsStrip from './components/MetricsStrip'
import ClaimQueue from './components/ClaimQueue'
import ClaimDetail from './components/ClaimDetail'
import ProfileManager from './components/ProfileManager'
import ManagerDashboard from './components/ManagerDashboard'
import InvestigatorView from './components/InvestigatorView'
import ReportsView from './components/ReportsView'
import RulesView from './components/RulesView'
import CommandPalette from './components/CommandPalette'
import { useNotifications } from './components/NotificationsPopover'
import CustomerPortal from './components/CustomerPortal'
import SpecialistWorkspace from './components/SpecialistWorkspace'
import { useAgents } from './useAgents'
import claimsData from '../claims.json'
import rulesData from '../rules.json'

function App() {
  const [authed, setAuthed] = useState(false)
  const [view, setView] = useState('queue')
  const [role, setRole] = useState('reviewer')
  const [claims, setClaims] = useState([])
  const [activeClaimId, setActiveClaimId] = useState(null)
  const [activeDealerId, setActiveDealerId] = useState(null)
  const [decisions, setDecisions] = useState({})
  const [cmdkOpen, setCmdkOpen] = useState(false)
  const [contestData, setContestData] = useState({})

  const notifications = useNotifications()
  const { agentResults, runAgents } = useAgents(claims, rulesData)

  useEffect(() => {
    setClaims(claimsData)
  }, [])

  useEffect(() => {
    if (!authed) return
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCmdkOpen(o => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [authed])

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

  const handleNavigate = (target) => {
    setActiveClaimId(null)
    setActiveDealerId(null)
    setView(target)
  }

  const handleSignOut = () => {
    setAuthed(false)
    setActiveClaimId(null)
    setActiveDealerId(null)
    setView('queue')
  }

  const handleChangeRole = (newRole) => {
    setRole(newRole)
    setActiveClaimId(null)
    setActiveDealerId(null)
    setView('queue')
  }

  const handleJumpToDealer = (dealerId) => {
    setRole('investigator')
    setView('queue')
    setActiveClaimId(null)
    setActiveDealerId(dealerId)
  }

  if (!authed) {
    return <LoginScreen onSignIn={() => setAuthed(true)} />
  }

  return (
    <div className="bg-toyota-50 min-h-screen text-toyota-ink">
      <NavBar
        currentView={view}
        onNavigate={handleNavigate}
        role={role}
        onChangeRole={handleChangeRole}
        onSignOut={handleSignOut}
        notifications={notifications}
        onSelectClaim={handleSelectClaim}
        onOpenCmdk={() => setCmdkOpen(true)}
      />

      {view === 'settings' ? (
        <ProfileManager
          role={role}
          onChangeRole={handleChangeRole}
          onBack={() => setView('queue')}
          onSignOut={handleSignOut}
        />
      ) : view === 'reports' ? (
        <ReportsView claims={claims} rules={rulesData} agentResults={agentResults} decisions={decisions} />
      ) : view === 'rules' ? (
        <RulesView claims={claims} rules={rulesData} role={role} />
      ) : view === 'customer' ? (
        <CustomerPortal
          claims={claims}
          decisions={decisions}
          agentResults={agentResults}
          contestData={contestData}
          onContestSubmit={handleContestSubmit}
          rules={rulesData}
        />
      ) : view === 'specialist' ? (
        <SpecialistWorkspace
          claims={claims}
          decisions={decisions}
          agentResults={agentResults}
          contestData={contestData}
          rules={rulesData}
          onResolve={handleResolve}
        />
      ) : activeClaim ? (
        <ClaimDetail
          claim={activeClaim}
          rules={rulesData}
          agentResults={agentResults[activeClaimId]}
          onDecision={handleDecision}
          onBack={() => setActiveClaimId(null)}
        />
      ) : role === 'manager' ? (
        <ManagerDashboard
          claims={claims}
          decisions={decisions}
          agentResults={agentResults}
          onSelectClaim={handleSelectClaim}
        />
      ) : role === 'investigator' ? (
        <InvestigatorView
          claims={claims}
          agentResults={agentResults}
          onSelectClaim={handleSelectClaim}
          activeDealerId={activeDealerId}
          onOpenDealer={setActiveDealerId}
          onCloseDealer={() => setActiveDealerId(null)}
        />
      ) : (
        <ReviewerHome
          claims={claims}
          decisions={decisions}
          agentResults={agentResults}
          contestData={contestData}
          onSelectClaim={handleSelectClaim}
          onDecision={handleDecision}
        />
      )}

      <CommandPalette
        open={cmdkOpen}
        claims={claims}
        onClose={() => setCmdkOpen(false)}
        onSelectClaim={handleSelectClaim}
        onNavigate={handleNavigate}
        onJumpToDealer={handleJumpToDealer}
      />
    </div>
  )
}

function ReviewerHome({ claims, decisions, agentResults, contestData, onSelectClaim, onDecision }) {
  const reviewed = Object.values(decisions).filter(Boolean).length
  const rejectedFlagged = claims.filter(
    c => decisions[c.claimId] === 'reject' && (c.groundTruth === 'violation' || c.groundTruth === 'anomaly')
  )
  const flagsCaught = rejectedFlagged.length
  const leakagePrevented = rejectedFlagged.reduce((sum, c) => sum + c.claimAmount, 0)
  const totalFlaggedProcessed = claims.filter(
    c => decisions[c.claimId] && (c.groundTruth === 'violation' || c.groundTruth === 'anomaly')
  ).length
  const accuracy = totalFlaggedProcessed > 0
    ? Math.round((flagsCaught / totalFlaggedProcessed) * 100)
    : 0

  return (
    <>
      <MetricsStrip
        contextLabel="My day · Dallas RO"
        metrics={[
          { label: 'Claims Reviewed', value: reviewed },
          { label: 'Flags Caught', value: flagsCaught },
          {
            label: 'Leakage Prevented',
            value: `$${leakagePrevented.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            accent: true,
          },
          { label: 'Accuracy', value: `${accuracy}%` },
        ]}
      />
      <ClaimQueue
        claims={claims}
        decisions={decisions}
        agentResults={agentResults}
        contestData={contestData}
        onSelectClaim={onSelectClaim}
        onDecision={onDecision}
      />
    </>
  )
}

export default App
