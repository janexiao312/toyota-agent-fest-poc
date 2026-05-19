import { useState } from 'react'

const SEED = [
  {
    id: 'n1',
    type: 'flagged',
    title: 'New high-severity claim assigned',
    body: 'CLM-00042 from DLR-TX-047 — labor hours 4× over R-01 limit.',
    time: '4m ago',
    target: 'CLM-00042',
    unread: true,
  },
  {
    id: 'n2',
    type: 'anomaly',
    title: 'Dealer anomaly cluster detected',
    body: 'DLR-TX-047 submitted 6 identical claims in 14 days. Pattern statistically improbable.',
    time: '32m ago',
    target: 'DLR-TX-047',
    unread: true,
  },
  {
    id: 'n3',
    type: 'system',
    title: 'Rule R-10 updated',
    body: 'Diagnostic-evidence rule now also flags "preventative replacement" phrasing.',
    time: '2h ago',
    target: null,
    unread: true,
  },
  {
    id: 'n4',
    type: 'flagged',
    title: 'Reviewer escalated claim',
    body: 'CLM-00028 was escalated by Maya Chen — awaiting your review.',
    time: 'Yesterday',
    target: 'CLM-00028',
    unread: false,
  },
  {
    id: 'n5',
    type: 'system',
    title: 'Weekly summary ready',
    body: '127 claims reviewed this week. $42,318 leakage prevented.',
    time: '2d ago',
    target: null,
    unread: false,
  },
]

export function useNotifications() {
  const [items, setItems] = useState(SEED)
  const unread = items.filter(i => i.unread).length
  const markRead = (id) => setItems(prev => prev.map(i => i.id === id ? { ...i, unread: false } : i))
  const markAllRead = () => setItems(prev => prev.map(i => ({ ...i, unread: false })))
  return { items, unread, markRead, markAllRead }
}

export default function NotificationsPopover({ items, onMarkRead, onMarkAllRead, onSelectClaim, onClose }) {
  const handleClick = (n) => {
    onMarkRead(n.id)
    if (n.target?.startsWith('CLM-')) {
      onSelectClaim(n.target)
      onClose()
    }
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-toyota-200 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.08)] z-40 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-toyota-200">
        <div>
          <div className="text-sm font-semibold text-toyota-ink">Notifications</div>
          <div className="text-xs text-toyota-500 mt-0.5">{items.filter(i => i.unread).length} unread</div>
        </div>
        <button
          onClick={onMarkAllRead}
          className="text-xs text-toyota-600 hover:text-toyota-red font-medium uppercase tracking-wider"
        >
          Mark all read
        </button>
      </div>

      <div className="max-h-[420px] overflow-y-auto divide-y divide-toyota-100">
        {items.map(n => (
          <button
            key={n.id}
            onClick={() => handleClick(n)}
            className={`w-full text-left p-4 hover:bg-toyota-50 transition-colors flex gap-3 ${n.unread ? 'bg-toyota-red-tint/30' : ''}`}
          >
            <NotifIcon type={n.type} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-3">
                <div className={`text-sm ${n.unread ? 'font-semibold text-toyota-ink' : 'text-toyota-700'}`}>
                  {n.title}
                </div>
                <span className="text-[11px] text-toyota-500 shrink-0">{n.time}</span>
              </div>
              <div className="text-xs text-toyota-600 mt-0.5 leading-relaxed">{n.body}</div>
              {n.target && (
                <div className="mt-1.5 font-mono text-[11px] text-toyota-red font-medium">{n.target} →</div>
              )}
            </div>
            {n.unread && <span className="w-2 h-2 rounded-full bg-toyota-red shrink-0 mt-1.5" />}
          </button>
        ))}
      </div>

      <div className="p-2 border-t border-toyota-200 text-center">
        <button className="text-xs text-toyota-600 hover:text-toyota-ink font-medium uppercase tracking-wider px-2 py-1">
          View all notifications
        </button>
      </div>
    </div>
  )
}

function NotifIcon({ type }) {
  const map = {
    flagged: { bg: 'bg-toyota-red-tint', fg: 'text-toyota-red' },
    anomaly: { bg: 'bg-status-anomaly-tint', fg: 'text-status-anomaly' },
    system: { bg: 'bg-toyota-100', fg: 'text-toyota-600' },
  }
  const s = map[type] ?? map.system
  return (
    <div className={`w-8 h-8 rounded-md ${s.bg} ${s.fg} flex items-center justify-center shrink-0`}>
      {type === 'flagged' && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 22V4a2 2 0 0 1 2-2h10l4 4v6H6" /><line x1="4" y1="22" x2="4" y2="15" />
        </svg>
      )}
      {type === 'anomaly' && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      )}
      {type === 'system' && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )}
    </div>
  )
}
