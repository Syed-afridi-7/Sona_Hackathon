import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, BarChart3, Shield, Users } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: SplashScreen,
})

function SplashScreen() {
  return (
    <div className="min-h-screen bg-bg-dark flex flex-col justify-between items-center px-6 py-12 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-accent/15 blur-[100px] rounded-full" />

      {/* Top logo header */}
      <div className="w-full flex justify-center mt-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-bold text-white shadow-xl shadow-primary/20">
            C
          </div>
          <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Connexion
          </span>
        </div>
      </div>

      {/* Hero content */}
      <div className="max-w-md text-center flex flex-col items-center gap-6 my-auto z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-accent tracking-wide uppercase">
          <Shield className="w-3.5 h-3.5" /> SECURED INVESTMENTS
        </div>
        
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl leading-[1.1] tracking-tight bg-gradient-to-br from-white via-gray-200 to-gray-600 bg-clip-text text-transparent">
          Where Businesses Meet Investors
        </h1>
        
        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
          Pitch, explore, chat, and schedule meetings in one seamless workspace.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm mt-4 text-left">
          <div className="glass-card rounded-xl p-3 flex flex-col gap-1.5">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold">PitchReels</span>
            <span className="text-[10px] text-gray-500">30s video pitches</span>
          </div>
          <div className="glass-card rounded-xl p-3 flex flex-col gap-1.5">
            <BarChart3 className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold">Shark Metrics</span>
            <span className="text-[10px] text-gray-500">Live revenue charts</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="w-full max-w-xs flex flex-col gap-4 z-10">
        <Link 
          to="/auth"
          className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
        >
          Get Started <ArrowRight className="w-4 h-4" />
        </Link>
        <span className="text-[10px] text-gray-600 text-center">
          By continuing, you agree to our Terms and Security Policies.
        </span>
      </div>
    </div>
  )
}
