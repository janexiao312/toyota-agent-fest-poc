import { useState, useRef } from 'react'

export default function ContestForm({ claimId, onSubmit }) {
  const [reason, setReason] = useState('')
  const [files, setFiles] = useState([])
  const [context, setContext] = useState('')
  const [showForm, setShowForm] = useState(false)
  const fileInputRef = useRef(null)

  const handleFiles = (fileList) => {
    const incoming = Array.from(fileList ?? []).map(f => ({ name: f.name, size: f.size }))
    setFiles(prev => {
      const seen = new Set(prev.map(f => f.name))
      const merged = [...prev]
      for (const f of incoming) {
        if (!seen.has(f.name)) merged.push(f)
      }
      return merged
    })
  }

  const removeFile = (name) => {
    setFiles(prev => prev.filter(f => f.name !== name))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!reason.trim()) return
    onSubmit(claimId, {
      reason: reason.trim(),
      evidence: files,
      context: context.trim(),
    })
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 px-4 py-3 rounded-lg font-medium text-sm"
      >
        I disagree with this decision
      </button>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-1">Contest This Decision</h3>
      <p className="text-xs text-gray-500 mb-4">Provide your reason for contesting and any supporting evidence. We'll review your submission promptly.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Reason for contest <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value.slice(0, 500))}
            placeholder="Explain why you believe this decision should be reconsidered..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none h-24 focus:outline-none focus:border-gray-400"
            required
          />
          <span className="text-xs text-gray-400">{reason.length}/500</span>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Supporting evidence
          </label>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={e => handleFiles(e.target.files)}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-white border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600 transition-colors"
          >
            📎 Attach files (diagnostic reports, receipts, photos)
          </button>
          {files.length > 0 && (
            <ul className="mt-2 space-y-1">
              {files.map(f => (
                <li key={f.name} className="flex items-center justify-between bg-gray-50 rounded px-2.5 py-1.5 text-xs">
                  <span className="text-gray-700 truncate">📎 {f.name} <span className="text-gray-400">({(f.size / 1024).toFixed(0)} KB)</span></span>
                  <button
                    type="button"
                    onClick={() => removeFile(f.name)}
                    className="text-gray-400 hover:text-red-500 ml-2"
                    aria-label={`Remove ${f.name}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Additional context (optional)
          </label>
          <textarea
            value={context}
            onChange={e => setContext(e.target.value.slice(0, 300))}
            placeholder="Any other relevant information..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none h-16 focus:outline-none focus:border-gray-400"
          />
          <span className="text-xs text-gray-400">{context.length}/300</span>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!reason.trim()}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Contest
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="text-gray-500 px-4 py-2 rounded-lg text-sm hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
