import { useNavigate } from 'react-router-dom'

/* Toyota wordmark SVG — supports light and dark backgrounds */
function ToyotaLogo({ className, dark }) {
  const textFill = dark ? '#1A1A1A' : '#FFFFFF'
  return (
    <svg viewBox="74.262 74.262 839.852 224.776" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Toyota">
      <path fill={textFill} d="M848.3,193.7l13.1-34.4l13.1,34.4H848.3z M875,139.8h-27.3l-38.1,93.3h23.6l8.7-22.8h38.9l8.7,22.8h23.6L875,139.8z M682.7,216.9c-15.4,0-27.8-13.9-27.8-31c0-17.1,12.5-31,27.8-31c15.4,0,27.8,13.9,27.8,31C710.5,203,698.1,216.9,682.7,216.9 M682.7,136.6c-27.2,0-49.3,22.1-49.3,49.3c0,27.2,22.1,49.3,49.3,49.3c27.2,0,49.3-22.1,49.3-49.3 C732,158.6,709.9,136.6,682.7,136.6 M488.1,216.9c-15.4,0-27.8-13.9-27.8-31c0-17.1,12.5-31,27.8-31c15.4,0,27.8,13.9,27.8,31 C516,203,503.5,216.9,488.1,216.9 M488.1,136.6c-27.2,0-49.3,22.1-49.3,49.3c0,27.2,22.1,49.3,49.3,49.3c27.2,0,49.3-22.1,49.3-49.3 C537.4,158.6,515.4,136.6,488.1,136.6 M610,139.8l-24.2,37.8l-24.2-37.8H538l37.4,58.5v34.8h20.8v-34.8l37.4-58.5H610z M814.6,139.8 h-79.8v17.9h29.6v75.4h20.8v-75.4h29.4V139.8z M354.7,157.7h29.6v75.4H405v-75.4h29.4v-17.9h-79.8V157.7z"/>
      <rect x="74.7" y="74.7" fill="#EB0A1E" width="224" height="224"/>
      <path fill="#FFFFFF" d="M224,137.8c-10.4-3.3-23.3-5.3-37.4-5.3c-14,0-27,2-37.4,5.3c-27.6,8.9-46.6,27.3-46.6,48.7 c0,30,37.6,54.3,84,54.3c46.4,0,84-24.3,84-54.3C270.7,165.2,251.7,146.7,224,137.8 M186.7,217.5c-6.9,0-12.6-13.6-12.9-30.7 c4.2,0.4,8.5,0.6,12.9,0.6c4.4,0,8.7-0.2,12.9-0.6C199.2,203.9,193.6,217.5,186.7,217.5 M174.6,173.4c1.9-12,6.6-20.5,12-20.5 c5.5,0,10.1,8.5,12,20.5c-3.8,0.3-7.9,0.5-12,0.5C182.5,173.9,178.5,173.7,174.6,173.4 M206.1,172.5c-2.8-18.8-10.4-32.4-19.4-32.4 c-9,0-16.6,13.5-19.4,32.4c-17.1-2.7-29-8.7-29-15.8c0-9.5,21.7-17.2,48.4-17.2c26.7,0,48.4,7.7,48.4,17.2 C235,163.7,223.1,169.8,206.1,172.5 M114.9,184.5c0-9.2,3.5-17.8,9.7-25.2c-0.1,0.5-0.1,1-0.1,1.6c0,11.6,17.4,21.4,41.6,25 c0,0.9,0,1.8,0,2.6c0,21.5,6,39.7,14.2,46C143.7,232.3,114.9,210.7,114.9,184.5 M193,234.5c8.2-6.3,14.2-24.5,14.2-46 c0-0.9,0-1.8,0-2.6c24.2-3.6,41.6-13.5,41.6-25c0-0.5,0-1-0.1-1.6c6.2,7.4,9.7,16,9.7,25.2C258.4,210.7,229.6,232.3,193,234.5"/>
    </svg>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-toyota-50 flex flex-col px-6">
      {/* Red accent bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-toyota-red" />

      {/* Logo */}
      <div className="pt-8 pl-2">
        <ToyotaLogo className="h-7 w-auto" dark />
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm">
        <h2 className="text-xl font-semibold tracking-tight text-toyota-ink mb-1 text-center">Welcome back</h2>
        <p className="text-sm text-toyota-500 mb-8 text-center">Choose your portal to continue.</p>

        <div className="space-y-3">
          {/* Customer entry */}
          <button
            onClick={() => navigate('/customer')}
            className="w-full group flex items-center gap-4 rounded-xl bg-white border border-toyota-200 shadow-sm hover:border-toyota-red/40 hover:shadow-md p-4 text-left transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-toyota-red-tint flex items-center justify-center shrink-0">
              <svg className="w-[18px] h-[18px] text-toyota-red" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-toyota-ink group-hover:text-toyota-red transition-colors">Customer Portal</div>
              <div className="text-xs text-toyota-500 mt-0.5">Warranty claims, status tracking &amp; disputes</div>
            </div>
            <svg className="w-4 h-4 text-toyota-300 group-hover:text-toyota-red group-hover:translate-x-0.5 transition-all shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          {/* Specialist / Agent entry */}
          <button
            onClick={() => navigate('/specialist')}
            className="w-full group flex items-center gap-4 rounded-xl bg-white border border-toyota-200 shadow-sm hover:border-toyota-ink/20 hover:shadow-md p-4 text-left transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-toyota-ink flex items-center justify-center shrink-0">
              <svg className="w-[18px] h-[18px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-toyota-ink group-hover:text-toyota-700 transition-colors">Agent &amp; Specialist</div>
              <div className="text-xs text-toyota-500 mt-0.5">AI validation, claim review &amp; contests</div>
            </div>
            <svg className="w-4 h-4 text-toyota-300 group-hover:text-toyota-ink group-hover:translate-x-0.5 transition-all shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        <p className="mt-8 text-[11px] text-toyota-500 text-center leading-relaxed">
          By continuing you agree to Toyota's{' '}
          <span className="text-toyota-600 hover:text-toyota-red font-medium cursor-pointer">Acceptable Use Policy</span>.
          Access is monitored.
        </p>
        </div>
      </div>
    </div>
  )
}
