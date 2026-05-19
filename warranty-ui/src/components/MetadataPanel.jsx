export default function MetadataPanel({ claim }) {
  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex gap-2 mb-3">
            {claim.repairCodes.map(code => (
              <span key={code} className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded">
                {code}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-x-8 gap-y-2 text-sm">
            <div>
              <span className="text-gray-500">Claim ID</span>
              <p className="font-mono font-medium">{claim.claimId}</p>
            </div>
            <div>
              <span className="text-gray-500">Dealer</span>
              <p className="font-medium">{claim.dealerId}</p>
            </div>
            <div>
              <span className="text-gray-500">VIN</span>
              <p className="font-mono text-xs">{claim.vin}</p>
            </div>
            <div>
              <span className="text-gray-500">Date</span>
              <p className="font-medium">{formatDate(claim.claimDate)}</p>
            </div>
            <div>
              <span className="text-gray-500">Mileage</span>
              <p className="font-medium">{claim.vehicleMileage.toLocaleString()} mi</p>
            </div>
            <div>
              <span className="text-gray-500">Warranty</span>
              <p className="font-medium capitalize">{claim.warrantyType}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-gray-500 text-sm">Claim Amount</span>
          <p className="text-2xl font-bold text-gray-800">
            ${claim.claimAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  )
}
