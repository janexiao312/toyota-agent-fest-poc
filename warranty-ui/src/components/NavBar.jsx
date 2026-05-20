import { useEffect, useRef, useState } from 'react'
import NotificationsPopover from './NotificationsPopover'

const ROLES = [
  { id: 'reviewer', label: 'Warranty Reviewer', location: 'Dallas RO' },
  { id: 'manager', label: 'Regional Manager', location: 'South Central' },
  { id: 'investigator', label: 'Compliance Investigator', location: 'TMNA' },
]

export default function NavBar({
  currentView,
  onNavigate,
  role,
  onChangeRole,
  onSignOut,
  notifications,
  onSelectClaim,
  onOpenCmdk,
}) {
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const profileRef = useRef(null)
  const notifRef = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (profileOpen && profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
      if (notifOpen && notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [profileOpen, notifOpen])

  const activeRole = ROLES.find(r => r.id === role) ?? ROLES[0]
  const tabs = [
    { id: 'queue', label: 'Queue' },
    { id: 'reports', label: 'Reports' },
    { id: 'rules', label: 'Rules' },
    { id: 'settings', label: 'Settings' },
  ]
  const activeTab = ['settings', 'reports', 'rules'].includes(currentView) ? currentView : 'queue'

  return (
    <>
      <div className="h-1 bg-toyota-red" />
      <header className="bg-white border-b border-toyota-200 sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center gap-8">

          <button
            onClick={() => onNavigate('queue')}
            className="flex items-center shrink-0"
            title="Toyota Warranty Reviewer"
          >
            <img src="/toyota-logo.svg" alt="Toyota" className="h-8 w-auto" />
            <span className="ml-3 pl-3 border-l border-toyota-300 text-toyota-ink font-semibold text-sm">
              Warranty Reviewer
            </span>
          </button>

          <nav className="flex items-center gap-1 text-sm font-medium">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={
                  tab.id === activeTab
                    ? 'px-3 py-1.5 rounded-md text-toyota-ink bg-toyota-100'
                    : 'px-3 py-1.5 rounded-md text-toyota-600 hover:text-toyota-ink hover:bg-toyota-50'
                }
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <button
            onClick={onOpenCmdk}
            className="flex-1 max-w-md ml-4 group"
            title="Open command palette (⌘K)"
          >
            <div className="relative w-full">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-toyota-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <div className="w-full bg-toyota-50 border border-toyota-200 rounded-md pl-9 pr-12 py-1.5 text-sm text-toyota-400 text-left group-hover:border-toyota-300">
                Search claims, dealers, VIN…
              </div>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-toyota-400 font-mono bg-white border border-toyota-200 rounded px-1.5 py-0.5">⌘K</span>
            </div>
          </button>

          <div className="ml-auto flex items-center gap-2">

            <button
              title="Help"
              className="w-9 h-9 rounded-md border border-toyota-200 hover:border-toyota-300 hover:bg-toyota-50 flex items-center justify-center text-toyota-600"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </button>

            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(o => !o); setProfileOpen(false) }}
                title="Notifications"
                className={`w-9 h-9 rounded-md border flex items-center justify-center text-toyota-600 relative transition-colors ${
                  notifOpen
                    ? 'border-toyota-300 bg-toyota-50'
                    : 'border-toyota-200 hover:border-toyota-300 hover:bg-toyota-50'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10 21a2 2 0 0 0 4 0" />
                </svg>
                {notifications.unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-toyota-red text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {notifications.unread}
                  </span>
                )}
              </button>
              {notifOpen && (
                <NotificationsPopover
                  items={notifications.items}
                  onMarkRead={notifications.markRead}
                  onMarkAllRead={notifications.markAllRead}
                  onSelectClaim={onSelectClaim}
                  onClose={() => setNotifOpen(false)}
                />
              )}
            </div>

            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setProfileOpen(o => !o); setNotifOpen(false) }}
                className={`ml-2 pl-3 border-l border-toyota-200 flex items-center gap-3 group transition-colors ${profileOpen ? 'bg-toyota-50 -m-1 p-1 rounded-md' : ''}`}
                title="Account"
              >
                <div className="w-9 h-9 rounded-full bg-toyota-ink text-white text-sm font-semibold flex items-center justify-center">JD</div>
                <div className="leading-tight text-left">
                  <div className="text-sm font-semibold text-toyota-ink">Jordan Diaz</div>
                  <div className="text-[11px] text-toyota-500">{activeRole.label}</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-toyota-400 group-hover:text-toyota-ink transition-transform ${profileOpen ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {profileOpen && (
                <ProfileMenu
                  activeRole={activeRole}
                  onChangeRole={(id) => { onChangeRole(id); setProfileOpen(false) }}
                  onOpenSettings={() => { onNavigate('settings'); setProfileOpen(false) }}
                  onSignOut={() => { setProfileOpen(false); onSignOut() }}
                />
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

function ProfileMenu({ activeRole, onChangeRole, onOpenSettings, onSignOut }) {
  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-toyota-200 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.08)] z-40">

      <div className="p-4 border-b border-toyota-200 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-toyota-ink text-white text-base font-semibold flex items-center justify-center">JD</div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-toyota-ink">Jordan Diaz</div>
          <div className="text-xs text-toyota-500">jordan.diaz@toyota.com</div>
          <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-toyota-700 bg-toyota-100 border border-toyota-200 rounded-sm px-1.5 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-status-clean" />
            {activeRole.label} · {activeRole.location}
          </div>
        </div>
      </div>

      <div className="p-2 border-b border-toyota-200">
        <div className="px-2 py-1.5 text-[11px] uppercase tracking-wider text-toyota-500 font-semibold">Switch role</div>
        {ROLES.map(role => {
          const active = role.id === activeRole.id
          return (
            <button
              key={role.id}
              onClick={() => onChangeRole(role.id)}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-toyota-50 text-left"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-toyota-red' : 'bg-toyota-300'}`} />
              <span className={`text-sm flex-1 ${active ? 'text-toyota-ink font-medium' : 'text-toyota-700'}`}>{role.label}</span>
              {active && <span className="text-[10px] uppercase tracking-wider text-toyota-500">Current</span>}
            </button>
          )
        })}
      </div>

      <div className="p-2 border-b border-toyota-200">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-toyota-50 text-left"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-toyota-500">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="text-sm text-toyota-ink flex-1">Account settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-toyota-50 text-left">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-toyota-500">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          <span className="text-sm text-toyota-ink flex-1">Activity log</span>
        </button>
      </div>

      <div className="p-2">
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-toyota-red-tint text-left"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-toyota-red">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="text-sm text-toyota-red font-medium flex-1">Sign out</span>
        </button>
      </div>
    </div>
  )
}
