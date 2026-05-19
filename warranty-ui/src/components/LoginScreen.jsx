import { useState } from 'react'

export default function LoginScreen({ onSignIn }) {
  const [email, setEmail] = useState('jordan.diaz@toyota.com')
  const [password, setPassword] = useState('demoaccess')

  return (
    <div className="min-h-screen grid grid-cols-2 bg-toyota-50">

      <div className="bg-toyota-ink text-white relative overflow-hidden flex flex-col justify-between p-12">
        <div className="absolute top-0 left-0 w-full h-1 bg-toyota-red" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-toyota-red opacity-10" />

        <div>
          <ToyotaLogoDark className="h-10 w-auto" />
        </div>

        <div className="space-y-6 relative z-10">
          <h1 className="text-4xl font-bold leading-tight tracking-tight max-w-md">
            Warranty claims, reviewed at machine speed.
          </h1>
          <p className="text-base text-toyota-300 max-w-md leading-relaxed">
            AI agents pre-screen every claim against policy rules and dealer patterns
            so reviewers spend their time on the ones that matter.
          </p>
          <div className="flex gap-8 pt-4 text-sm">
            <Stat value="94%" label="Flagging Accuracy" />
            <Stat value="12s" label="Avg Review Time" />
            <Stat value="$2.4M" label="Leakage Prevented YTD" accent />
          </div>
        </div>

        <div className="text-[11px] text-toyota-500 uppercase tracking-wider relative z-10">
          v0.1 · Internal POC · Toyota Motor North America
        </div>
      </div>

      <div className="bg-white flex items-center justify-center p-12">
        <form
          className="w-full max-w-sm"
          onSubmit={e => { e.preventDefault(); onSignIn() }}
        >
          <h2 className="text-2xl font-semibold tracking-tight text-toyota-ink mb-2">Sign in</h2>
          <p className="text-sm text-toyota-500 mb-8">Use your Toyota SSO credentials to continue.</p>

          <button
            type="button"
            onClick={onSignIn}
            className="w-full mb-6 bg-white border border-toyota-300 hover:border-toyota-ink text-toyota-ink px-4 py-2.5 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Continue with Toyota SSO
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-toyota-200" />
            <span className="text-[11px] uppercase tracking-wider text-toyota-400 font-semibold">or sign in with email</span>
            <div className="flex-1 h-px bg-toyota-200" />
          </div>

          <label className="block mb-4">
            <span className="text-[11px] uppercase tracking-wider text-toyota-500 font-semibold">Email</span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1.5 w-full bg-white border border-toyota-200 rounded-md px-3 py-2.5 text-sm placeholder:text-toyota-400 focus:outline-none focus:border-toyota-red focus:ring-1 focus:ring-toyota-red"
            />
          </label>

          <label className="block mb-2">
            <span className="text-[11px] uppercase tracking-wider text-toyota-500 font-semibold">Password</span>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1.5 w-full bg-white border border-toyota-200 rounded-md px-3 py-2.5 text-sm placeholder:text-toyota-400 focus:outline-none focus:border-toyota-red focus:ring-1 focus:ring-toyota-red"
            />
          </label>

          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center gap-2 text-sm text-toyota-600 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-toyota-red" />
              Remember this device
            </label>
            <a className="text-sm text-toyota-600 hover:text-toyota-red font-medium cursor-pointer">Forgot password?</a>
          </div>

          <button
            type="submit"
            className="w-full bg-toyota-red text-white border border-toyota-red hover:bg-toyota-red-hover px-4 py-2.5 rounded-md text-sm font-semibold uppercase tracking-wider transition-colors"
          >
            Sign in
          </button>

          <p className="mt-8 text-xs text-toyota-500 text-center leading-relaxed">
            By signing in you agree to Toyota's
            <a className="text-toyota-700 hover:text-toyota-red font-medium cursor-pointer"> Acceptable Use Policy</a>.
            Access is monitored for compliance.
          </p>
        </form>
      </div>
    </div>
  )
}

function Stat({ value, label, accent = false }) {
  return (
    <div>
      <div className={`text-3xl font-bold tabular-nums ${accent ? 'text-toyota-red' : 'text-white'}`}>{value}</div>
      <div className="text-toyota-400 text-xs uppercase tracking-wider mt-1">{label}</div>
    </div>
  )
}

function ToyotaLogoDark({ className }) {
  return (
    <svg viewBox="74.262 74.262 839.852 224.776" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Toyota">
      <path fill="#FFFFFF" d="M848.3,193.7l13.1-34.4l13.1,34.4H848.3z M875,139.8h-27.3l-38.1,93.3h23.6l8.7-22.8h38.9l8.7,22.8h23.6L875,139.8z M682.7,216.9c-15.4,0-27.8-13.9-27.8-31c0-17.1,12.5-31,27.8-31c15.4,0,27.8,13.9,27.8,31C710.5,203,698.1,216.9,682.7,216.9 M682.7,136.6c-27.2,0-49.3,22.1-49.3,49.3c0,27.2,22.1,49.3,49.3,49.3c27.2,0,49.3-22.1,49.3-49.3 C732,158.6,709.9,136.6,682.7,136.6 M488.1,216.9c-15.4,0-27.8-13.9-27.8-31c0-17.1,12.5-31,27.8-31c15.4,0,27.8,13.9,27.8,31 C516,203,503.5,216.9,488.1,216.9 M488.1,136.6c-27.2,0-49.3,22.1-49.3,49.3c0,27.2,22.1,49.3,49.3,49.3c27.2,0,49.3-22.1,49.3-49.3 C537.4,158.6,515.4,136.6,488.1,136.6 M610,139.8l-24.2,37.8l-24.2-37.8H538l37.4,58.5v34.8h20.8v-34.8l37.4-58.5H610z M814.6,139.8 h-79.8v17.9h29.6v75.4h20.8v-75.4h29.4V139.8z M354.7,157.7h29.6v75.4H405v-75.4h29.4v-17.9h-79.8V157.7z"/>
      <rect x="74.7" y="74.7" fill="#EB0A1E" width="224" height="224"/>
      <path fill="#FFFFFF" d="M224,137.8c-10.4-3.3-23.3-5.3-37.4-5.3c-14,0-27,2-37.4,5.3c-27.6,8.9-46.6,27.3-46.6,48.7 c0,30,37.6,54.3,84,54.3c46.4,0,84-24.3,84-54.3C270.7,165.2,251.7,146.7,224,137.8 M186.7,217.5c-6.9,0-12.6-13.6-12.9-30.7 c4.2,0.4,8.5,0.6,12.9,0.6c4.4,0,8.7-0.2,12.9-0.6C199.2,203.9,193.6,217.5,186.7,217.5 M174.6,173.4c1.9-12,6.6-20.5,12-20.5 c5.5,0,10.1,8.5,12,20.5c-3.8,0.3-7.9,0.5-12,0.5C182.5,173.9,178.5,173.7,174.6,173.4 M206.1,172.5c-2.8-18.8-10.4-32.4-19.4-32.4 c-9,0-16.6,13.5-19.4,32.4c-17.1-2.7-29-8.7-29-15.8c0-9.5,21.7-17.2,48.4-17.2c26.7,0,48.4,7.7,48.4,17.2 C235,163.7,223.1,169.8,206.1,172.5 M114.9,184.5c0-9.2,3.5-17.8,9.7-25.2c-0.1,0.5-0.1,1-0.1,1.6c0,11.6,17.4,21.4,41.6,25 c0,0.9,0,1.8,0,2.6c0,21.5,6,39.7,14.2,46C143.7,232.3,114.9,210.7,114.9,184.5 M193,234.5c8.2-6.3,14.2-24.5,14.2-46 c0-0.9,0-1.8,0-2.6c24.2-3.6,41.6-13.5,41.6-25c0-0.5,0-1-0.1-1.6c6.2,7.4,9.7,16,9.7,25.2C258.4,210.7,229.6,232.3,193,234.5"/>
    </svg>
  )
}
