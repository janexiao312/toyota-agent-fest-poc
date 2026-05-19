export default function MetadataPanel({ claim }) {
  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`
  }

  return (
    <div className="bg-white border border-toyota-200 rounded-lg p-6 mb-4">
      <div className="flex justify-between items-start gap-8">
        <div className="flex-1">
          <div className="flex gap-1.5 mb-4">
            {claim.repairCodes.map(code => (
              <span
                key={code}
                className="font-mono bg-toyota-100 text-toyota-700 text-xs font-medium px-2 py-0.5 rounded border border-toyota-200"
              >
                {code}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-x-10 gap-y-4 text-sm">
            <Field label="Claim ID" value={claim.claimId} mono />
            <Field label="Dealer" value={claim.dealerId} />
            <Field label="VIN" value={claim.vin} mono small />
            <Field label="Date" value={formatDate(claim.claimDate)} />
            <Field label="Mileage" value={`${claim.vehicleMileage.toLocaleString()} mi`} />
            <Field label="Warranty" value={claim.warrantyType} capitalize />
          </div>
        </div>
        <div className="text-right border-l border-toyota-200 pl-8">
          <span className="text-[11px] uppercase tracking-wider text-toyota-500 font-medium">
            Claim Amount
          </span>
          <p className="text-3xl font-bold text-toyota-ink tabular-nums mt-1">
            ${claim.claimAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, mono = false, small = false, capitalize = false }) {
  return (
    <div>
      <span className="text-[11px] uppercase tracking-wider text-toyota-500 font-medium">{label}</span>
      <p
        className={`mt-0.5 font-medium text-toyota-ink ${mono ? 'font-mono' : ''} ${small ? 'text-xs' : ''} ${capitalize ? 'capitalize' : ''}`}
      >
        {value}
      </p>
    </div>
  )
}
