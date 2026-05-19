import { useState } from 'react'

const ROLES = [
  {
    id: 'reviewer',
    label: 'Warranty Reviewer',
    description: 'Approve, reject, escalate claims. Cannot edit rules.',
    state: 'active',
  },
  {
    id: 'manager',
    label: 'Regional Manager (Dallas)',
    description: 'Dashboard view + reviewer throughput. Read-only on claims.',
    state: 'switchable',
  },
  {
    id: 'investigator',
    label: 'Compliance Investigator',
    description: 'Requires additional approval. Contact your manager.',
    state: 'locked',
  },
]

const NOTIFICATIONS = [
  { key: 'severity', label: 'High-severity claim assigned', desc: 'Email + in-app when an R-01 or R-06 violation lands in your queue.', on: true },
  { key: 'anomaly', label: 'Dealer anomaly pattern detected', desc: "In-app only. The anomaly agent surfaces a cluster involving a dealer you've reviewed before.", on: true },
  { key: 'digest', label: 'Daily summary', desc: 'Morning digest of reviewed/pending/escalated counts.', on: false },
  { key: 'maint', label: 'System maintenance', desc: 'Planned downtime and policy-rule updates.', on: true },
]

export default function ProfileManager({ role, onChangeRole, onBack, onSignOut }) {
  const [name, setName] = useState('Jordan Diaz')
  const [display, setDisplay] = useState('Jordan')
  const [phone, setPhone] = useState('+1 (469) 555-0118')
  const [prefs, setPrefs] = useState(
    Object.fromEntries(NOTIFICATIONS.map(n => [n.key, n.on]))
  )

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">

      <div className="text-sm text-toyota-500 mb-6 flex items-center gap-2">
        <button onClick={onBack} className="hover:text-toyota-ink">Queue</button>
        <span className="text-toyota-300">/</span>
        <span className="text-toyota-500">Settings</span>
        <span className="text-toyota-300">/</span>
        <span className="text-toyota-ink font-medium">Profile</span>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-toyota-ink mb-1">Profile</h1>
      <p className="text-sm text-toyota-500 mb-8">Manage how you appear in the reviewer workspace and which notifications you receive.</p>

      <div className="grid grid-cols-[200px_1fr] gap-12">

        <aside className="text-sm">
          <div className="flex flex-col gap-0.5">
            <a className="px-3 py-2 rounded-md bg-toyota-100 text-toyota-ink font-medium">Profile</a>
            <a className="px-3 py-2 rounded-md text-toyota-600 hover:bg-toyota-50 cursor-pointer">Notifications</a>
            <a className="px-3 py-2 rounded-md text-toyota-600 hover:bg-toyota-50 cursor-pointer">Sessions & devices</a>
            <a className="px-3 py-2 rounded-md text-toyota-600 hover:bg-toyota-50 cursor-pointer">API tokens</a>
            <a className="px-3 py-2 rounded-md text-toyota-600 hover:bg-toyota-50 cursor-pointer">Activity log</a>
          </div>
        </aside>

        <div className="space-y-8 min-w-0">

          <section className="bg-white border border-toyota-200 rounded-lg p-6">
            <h2 className="text-[11px] uppercase tracking-wider text-toyota-500 font-semibold mb-4">Identity</h2>
            <div className="flex items-start gap-6">
              <div className="shrink-0 text-center">
                <div className="w-20 h-20 rounded-full bg-toyota-ink text-white text-2xl font-semibold flex items-center justify-center">JD</div>
                <button className="mt-3 text-xs text-toyota-600 hover:text-toyota-red font-medium uppercase tracking-wider">Change</button>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-4">
                <TextField label="Full name" value={name} onChange={setName} />
                <TextField label="Display name" value={display} onChange={setDisplay} />
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-toyota-500 font-semibold">Email</label>
                  <input
                    type="email"
                    value="jordan.diaz@toyota.com"
                    disabled
                    className="mt-1.5 w-full bg-toyota-50 border border-toyota-200 rounded-md px-3 py-2 text-sm text-toyota-500"
                  />
                  <span className="block mt-1 text-[11px] text-toyota-500">Managed by Toyota SSO</span>
                </div>
                <TextField label="Phone (for escalation)" value={phone} onChange={setPhone} />
              </div>
            </div>
          </section>

          <section className="bg-white border border-toyota-200 rounded-lg p-6">
            <h2 className="text-[11px] uppercase tracking-wider text-toyota-500 font-semibold mb-4">Role & assignments</h2>
            <div className="space-y-4">
              {ROLES.map(r => {
                const active = r.id === role
                return (
                  <div
                    key={r.id}
                    className={`flex items-center justify-between border rounded-md p-4 ${
                      r.state === 'locked'
                        ? 'border-toyota-200 opacity-60'
                        : active
                          ? 'border-toyota-red-border bg-toyota-red-tint/30'
                          : 'border-toyota-200'
                    }`}
                  >
                    <div>
                      <div className={`text-sm font-semibold ${active ? 'text-toyota-ink' : 'text-toyota-700'}`}>{r.label}</div>
                      <div className="text-xs text-toyota-500 mt-0.5">{r.description}</div>
                    </div>
                    {active ? (
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-status-clean bg-status-clean-tint border border-status-clean-border rounded-sm px-2 py-1">
                        Active
                      </span>
                    ) : r.state === 'locked' ? (
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-toyota-500">Locked</span>
                    ) : (
                      <button
                        onClick={() => onChangeRole(r.id)}
                        className="text-[11px] uppercase tracking-wider font-semibold text-toyota-600 hover:text-toyota-red border border-toyota-200 hover:border-toyota-red-border rounded-sm px-2 py-1 transition-colors"
                      >
                        Switch to
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          <section className="bg-white border border-toyota-200 rounded-lg p-6">
            <h2 className="text-[11px] uppercase tracking-wider text-toyota-500 font-semibold mb-4">Notifications</h2>
            <div className="divide-y divide-toyota-100">
              {NOTIFICATIONS.map(n => (
                <div key={n.key} className="flex items-center justify-between py-3 gap-6">
                  <div>
                    <div className="text-sm font-medium text-toyota-ink">{n.label}</div>
                    <div className="text-xs text-toyota-500 mt-0.5 max-w-md">{n.desc}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPrefs(p => ({ ...p, [n.key]: !p[n.key] }))}
                    className={`shrink-0 relative w-10 h-6 rounded-full transition-colors ${prefs[n.key] ? 'bg-toyota-red' : 'bg-toyota-200'}`}
                    aria-pressed={prefs[n.key]}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${prefs[n.key] ? 'left-[18px]' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-toyota-200 rounded-lg p-6">
            <h2 className="text-[11px] uppercase tracking-wider text-toyota-500 font-semibold mb-4">Session</h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-toyota-ink">You're signed in on <span className="font-semibold">MacBook Pro · Dallas</span></div>
                <div className="text-xs text-toyota-500 mt-0.5">Active since 8:42 AM CT · 3 other sessions across devices</div>
              </div>
              <div className="flex gap-2">
                <button className="bg-white border border-toyota-200 hover:border-toyota-300 text-toyota-700 px-4 py-2 rounded-md text-sm font-medium">
                  Sign out other devices
                </button>
                <button
                  onClick={onSignOut}
                  className="bg-toyota-red text-white border border-toyota-red hover:bg-toyota-red-hover px-4 py-2 rounded-md text-sm font-semibold uppercase tracking-wider transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function TextField({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-toyota-500 font-semibold">{label}</span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="mt-1.5 w-full bg-white border border-toyota-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-toyota-red focus:ring-1 focus:ring-toyota-red"
      />
    </label>
  )
}
