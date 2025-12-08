import { Bug, XCircle } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 bg-coral-500/20 rounded-full flex items-center justify-center">
              <Bug className="w-12 h-12 text-coral-500" />
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-coral-400 mb-6">
          BugRadar is Not Available
        </h2>
        <p className="text-slate-400 text-lg max-w-md mx-auto mb-8">
          This project has been discontinued. The service is no longer operational.
        </p>

        <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span>Service Offline</span>
        </div>
      </div>
    </div>
  )
}
