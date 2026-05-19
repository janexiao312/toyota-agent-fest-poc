export default function MetricsStrip({ metrics, contextLabel }) {
  return (
    <div className="bg-white border-b border-toyota-200">
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex gap-10 items-center">
        {contextLabel && (
          <div className="text-[11px] uppercase tracking-wider text-toyota-500 font-semibold border-r border-toyota-200 pr-6">
            {contextLabel}
          </div>
        )}
        <div className="flex gap-10 text-sm">
          {metrics.map(m => (
            <div key={m.label} className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider text-toyota-500 font-medium">{m.label}</span>
              <span className={`text-base font-semibold tabular-nums ${m.accent ? 'text-toyota-red' : 'text-toyota-ink'}`}>
                {m.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
