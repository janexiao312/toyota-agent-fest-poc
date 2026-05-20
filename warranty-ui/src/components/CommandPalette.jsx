import { useEffect, useMemo, useRef, useState } from 'react'
import { searchClaimsAndDealers } from '../claimsStore'

export default function CommandPalette({ open, claims, onClose, onSelectClaim, onNavigate, onJumpToDealer }) {
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef(null)

  const results = useMemo(() => {
    const { claims: claimHits, dealers: dealerHits } = searchClaimsAndDealers(claims, query)
    const items = []
    for (const c of claimHits) {
      items.push({
        kind: 'claim',
        id: c.claimId,
        title: c.claimId,
        subtitle: `${c.dealerId} · ${c.repairCodes.join(', ')} · $${c.claimAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      })
    }
    for (const d of dealerHits) {
      items.push({
        kind: 'dealer',
        id: d,
        title: d,
        subtitle: 'Open dealer profile',
      })
    }
    if (!query.trim()) {
      items.push(
        { kind: 'nav', id: 'queue', title: 'Go to Queue', subtitle: 'Default reviewer view', icon: '➜' },
        { kind: 'nav', id: 'reports', title: 'Go to Reports', subtitle: 'Weekly activity · dealer · policy', icon: '➜' },
        { kind: 'nav', id: 'rules', title: 'Go to Rules', subtitle: 'View and toggle policy rules', icon: '➜' },
        { kind: 'nav', id: 'settings', title: 'Open Settings', subtitle: 'Profile and preferences', icon: '➜' },
      )
    }
    return items
  }, [claims, query])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setActiveIdx(0)
    const t = setTimeout(() => inputRef.current?.focus(), 30)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    setActiveIdx(0)
  }, [query])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIdx(i => Math.min(i + 1, results.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIdx(i => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        const item = results[activeIdx]
        if (item) activate(item)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, results, activeIdx])

  const activate = (item) => {
    if (item.kind === 'claim') {
      onSelectClaim(item.id)
      onClose()
    } else if (item.kind === 'dealer') {
      onJumpToDealer(item.id)
      onClose()
    } else if (item.kind === 'nav') {
      onNavigate(item.id)
      onClose()
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-32" onClick={onClose}>
      <div className="absolute inset-0 bg-toyota-ink/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl bg-white border border-toyota-200 rounded-xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-toyota-200">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-toyota-400">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search claims, dealers, VIN, repair codes…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm placeholder:text-toyota-400 focus:outline-none"
          />
          <span className="text-[10px] text-toyota-400 font-mono bg-toyota-50 border border-toyota-200 rounded px-1.5 py-0.5">Esc</span>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-8 text-center text-sm text-toyota-500">
              No matches for "<span className="font-mono text-toyota-700">{query}</span>".
            </div>
          ) : (
            <div className="py-2">
              {!query.trim() && (
                <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-toyota-400 font-semibold">Jump to</div>
              )}
              {results.map((item, i) => (
                <button
                  key={`${item.kind}-${item.id}`}
                  onClick={() => activate(item)}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    activeIdx === i ? 'bg-toyota-50' : ''
                  }`}
                >
                  <KindIcon kind={item.kind} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${item.kind === 'claim' || item.kind === 'dealer' ? 'font-mono text-toyota-red' : 'text-toyota-ink'}`}>
                      {item.title}
                    </div>
                    <div className="text-xs text-toyota-500 truncate">{item.subtitle}</div>
                  </div>
                  {activeIdx === i && (
                    <span className="text-[10px] text-toyota-400 font-mono bg-white border border-toyota-200 rounded px-1.5 py-0.5">↵</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 px-4 py-2 border-t border-toyota-200 bg-toyota-50 text-[11px] text-toyota-500">
          <Hint label="↑ ↓" desc="navigate" />
          <Hint label="↵" desc="open" />
          <Hint label="esc" desc="close" />
          <span className="ml-auto">{results.length} results</span>
        </div>
      </div>
    </div>
  )
}

function KindIcon({ kind }) {
  if (kind === 'claim') {
    return (
      <div className="w-7 h-7 rounded-md bg-toyota-red-tint text-toyota-red flex items-center justify-center shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
        </svg>
      </div>
    )
  }
  if (kind === 'dealer') {
    return (
      <div className="w-7 h-7 rounded-md bg-toyota-100 text-toyota-700 flex items-center justify-center shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 21h18M5 21V7l8-4 8 4v14M9 9v.01M9 13v.01M9 17v.01M15 9v.01M15 13v.01M15 17v.01" />
        </svg>
      </div>
    )
  }
  return (
    <div className="w-7 h-7 rounded-md bg-toyota-100 text-toyota-600 flex items-center justify-center shrink-0">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
      </svg>
    </div>
  )
}

function Hint({ label, desc }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono bg-white border border-toyota-200 rounded px-1.5 py-0.5">{label}</span>
      <span>{desc}</span>
    </div>
  )
}
