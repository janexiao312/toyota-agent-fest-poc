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
import AgentPromptCard from './components/AgentPromptCard'
import { useAgents } from './useAgents'
import claimsData from '../claims.json'
import rulesData from '../rules.json'

const ROLE_USERS = {
  reviewer: { name: 'Jordan Diaz', role: 'Warranty Reviewer' },
  manager: { name: 'Morgan Pierce', role: 'Regional Manager' },
  investigator: { name: 'Priya Shah', role: 'Compliance Investigator' },
  specialist: { name: 'Alex Tran', role: 'Resolution Specialist' },
  customer: { name: 'Sam Carter', role: 'Vehicle Owner' },
}

const DEALER_NOTES_STORAGE_KEY = 'warranty-ui:dealer-notes:v1'

function loadDealerNotes() {
  try {
    const raw = localStorage.getItem(DEALER_NOTES_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function App() {
  const [authed, setAuthed] = useState(false)
  const [view, setView] = useState('queue')
  const [role, setRole] = useState('reviewer')
  const [claims] = useState(claimsData)
  const [activeClaimId, setActiveClaimId] = useState(null)
  const [activeDealerId, setActiveDealerId] = useState(null)
  const [decisions, setDecisions] = useState({})
  const [reviewerNotes, setReviewerNotes] = useState({})
  const [dealerNotes, setDealerNotes] = useState(() => loadDealerNotes())
  const [lastDecisionId, setLastDecisionId] = useState(null)
  const [cmdkOpen, setCmdkOpen] = useState(false)
  const [contestData, setContestData] = useState({})
  const [toast, setToast] = useState(null)

  const notifications = useNotifications()
  const { agentResults, runAgents } = useAgents(claims, rulesData)
  const currentUser = ROLE_USERS[role] ?? ROLE_USERS.reviewer

  useEffect(() => {
    try {
      localStorage.setItem(DEALER_NOTES_STORAGE_KEY, JSON.stringify(dealerNotes))
    } catch {
      // ignore quota / private-mode errors
    }
  }, [dealerNotes])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

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

  const handleDecision = (claimId, decision, note) => {
    setDecisions(prev => ({ ...prev, [claimId]: decision }))
    if (note?.trim()) {
      setReviewerNotes(prev => ({ ...prev, [claimId]: note.trim() }))
    } else {
      setReviewerNotes(prev => {
        if (!(claimId in prev)) return prev
        const next = { ...prev }
        delete next[claimId]
        return next
      })
    }
    setLastDecisionId(claimId)
    setToast({ kind: 'decision', claimId, decision, undoable: true })

    // Auto-advance only from the queue (not when reviewing detail with a note attached)
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

  const handleUndoDecision = (claimId) => {
    const target = claimId ?? lastDecisionId
    if (!target) return
    setDecisions(prev => {
      if (!(target in prev)) return prev
      const next = { ...prev }
      delete next[target]
      return next
    })
    setReviewerNotes(prev => {
      if (!(target in prev)) return prev
      const next = { ...prev }
      delete next[target]
      return next
    })
    setLastDecisionId(null)
    setToast({ kind: 'info', text: `Decision on ${target} undone` })
  }

  const handleContestSubmit = (claimId, payload) => {
    const { reason, evidence = [], context = '' } = payload ?? {}
    setContestData(prev => ({
      ...prev,
      [claimId]: {
        status: 'submitted',
        reason,
        evidence,
        context,
        resolution: null,
        submittedAt: new Date().toISOString(),
      }
    }))
    setTimeout(() => {
      setContestData(prev => ({
        ...prev,
        [claimId]: { ...prev[claimId], status: 'under_review' }
      }))
    }, 2000)
  }

  const handleWithdrawContest = (claimId) => {
    setContestData(prev => {
      if (!(claimId in prev)) return prev
      const next = { ...prev }
      delete next[claimId]
      return next
    })
    setToast({ kind: 'info', text: `Contest on ${claimId} withdrawn` })
  }

  const handleResolve = (claimId, outcome, notes) => {
    setContestData(prev => ({
      ...prev,
      [claimId]: {
        ...prev[claimId],
        status: 'resolved',
        resolution: notes,
        outcome,
        resolvedBy: currentUser.name,
        resolverRole: currentUser.role,
        resolvedAt: new Date().toISOString(),
      }
    }))
    setToast({ kind: 'info', text: `Resolution issued: ${outcome.toUpperCase()}` })
  }

  const handleRequestMoreInfo = (claimId, question) => {
    setContestData(prev => ({
      ...prev,
      [claimId]: {
        ...prev[claimId],
        status: 'needs_info',
        infoRequest: {
          question,
          requestedBy: currentUser.name,
          requestedAt: new Date().toISOString(),
          response: null,
          respondedAt: null,
        },
      }
    }))
    setToast({ kind: 'info', text: 'Information request sent to customer' })
  }

  const handleSubmitInfoResponse = (claimId, response) => {
    setContestData(prev => {
      const existing = prev[claimId]
      if (!existing?.infoRequest) return prev
      return {
        ...prev,
        [claimId]: {
          ...existing,
          status: 'under_review',
          infoRequest: {
            ...existing.infoRequest,
            response,
            respondedAt: new Date().toISOString(),
          },
        }
      }
    })
    setToast({ kind: 'info', text: 'Response sent — specialist will continue review' })
  }

  const handleSaveDealerNote = (dealerId, note) => {
    setDealerNotes(prev => {
      if (!note?.trim()) {
        if (!(dealerId in prev)) return prev
        const next = { ...prev }
        delete next[dealerId]
        return next
      }
      return {
        ...prev,
        [dealerId]: {
          text: note.trim(),
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser.name,
        }
      }
    })
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
          onWithdrawContest={handleWithdrawContest}
          onSubmitInfoResponse={handleSubmitInfoResponse}
        />
      ) : view === 'specialist' ? (
        <SpecialistWorkspace
          claims={claims}
          agentResults={agentResults}
          contestData={contestData}
          onResolve={handleResolve}
          onRequestMoreInfo={handleRequestMoreInfo}
        />
      ) : activeClaim ? (
        <ClaimDetail
          key={activeClaimId}
          claim={activeClaim}
          rules={rulesData}
          agentResults={agentResults[activeClaimId]}
          decision={decisions[activeClaimId]}
          reviewerNote={reviewerNotes[activeClaimId]}
          onDecision={handleDecision}
          onUndoDecision={handleUndoDecision}
          onBack={() => setActiveClaimId(null)}
        />
      ) : role === 'manager' ? (
        <ManagerDashboard
          claims={claims}
          decisions={decisions}
          agentResults={agentResults}
          onSelectClaim={handleSelectClaim}
          onJumpToDealer={handleJumpToDealer}
        />
      ) : role === 'investigator' ? (
        <InvestigatorView
          claims={claims}
          agentResults={agentResults}
          onSelectClaim={handleSelectClaim}
          activeDealerId={activeDealerId}
          onOpenDealer={setActiveDealerId}
          onCloseDealer={() => setActiveDealerId(null)}
          dealerNotes={dealerNotes}
          onSaveDealerNote={handleSaveDealerNote}
        />
      ) : (
        <ReviewerHome
          claims={claims}
          decisions={decisions}
          reviewerNotes={reviewerNotes}
          agentResults={agentResults}
          contestData={contestData}
          lastDecisionId={lastDecisionId}
          onSelectClaim={handleSelectClaim}
          onDecision={handleDecision}
          onUndoDecision={handleUndoDecision}
        />
      )}

      {toast && (
        <Toast toast={toast} onUndo={handleUndoDecision} onDismiss={() => setToast(null)} />
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

function Toast({ toast, onUndo, onDismiss }) {
  const isDecision = toast.kind === 'decision'
  const label = isDecision
    ? `${toast.claimId}: ${String(toast.decision).toUpperCase()}`
    : toast.text
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-toyota-ink text-white rounded-lg shadow-lg px-4 py-3 flex items-center gap-4 min-w-[280px] animate-[fadeIn_150ms_ease-out]">
      <span className="text-sm font-medium">{label}</span>
      {isDecision && toast.undoable && (
        <button
          onClick={() => { onUndo(toast.claimId); onDismiss() }}
          className="text-toyota-red text-xs font-semibold uppercase tracking-wider hover:text-white transition-colors"
        >
          Undo
        </button>
      )}
      <button
        onClick={onDismiss}
        className="text-toyota-300 hover:text-white text-lg leading-none ml-auto"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}

function ReviewerHome({ claims, decisions, reviewerNotes, agentResults, contestData, lastDecisionId, onSelectClaim, onDecision, onUndoDecision }) {
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
      <div className="px-6 pt-6 max-w-[1400px] mx-auto">
        <AgentPromptCard
          role="reviewer"
          claims={claims}
          decisions={decisions}
          agentResults={agentResults}
          onSelectClaim={onSelectClaim}
        />
      </div>
      <ClaimQueue
        claims={claims}
        decisions={decisions}
        reviewerNotes={reviewerNotes}
        agentResults={agentResults}
        contestData={contestData}
        lastDecisionId={lastDecisionId}
        onSelectClaim={onSelectClaim}
        onDecision={onDecision}
        onUndoDecision={onUndoDecision}
      />
    </>
  )
}

export default App
