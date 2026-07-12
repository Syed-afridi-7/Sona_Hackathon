import { Link } from '@tanstack/react-router'
import { Home, Compass, Play, MessageSquare, User } from 'lucide-react'

export function BottomNavigation() {
  const tabs = [
    { to: '/home', label: 'Home', icon: Home },
    { to: '/discover', label: 'Discover', icon: Compass },
    { to: '/reels', label: 'Pitch', icon: Play },
    { to: '/chat', label: 'Chat', icon: MessageSquare },
    { to: '/dashboard', label: 'Profile', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-5 pt-2 md:pb-6 md:pt-4 bg-gradient-to-t from-bg-dark via-bg-dark/95 to-transparent">
      <div className="max-w-md mx-auto glass-card rounded-2xl p-1.5 flex items-center justify-around shadow-2xl shadow-black/60 border border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon
          
          return (
            <Link
              key={tab.to}
              to={tab.to}
              activeProps={{
                className: 'text-primary bg-primary/10 font-semibold scale-105 shadow-inner shadow-primary/10',
              }}
              inactiveProps={{
                className: 'text-gray-400 hover:text-gray-200 hover:bg-white/5',
              }}
              className="flex flex-col items-center gap-1 py-2 px-3.5 rounded-xl transition-all duration-300 group cursor-pointer"
            >
              {/* Dynamic Active Indicator Dot & Glowing Icon */}
              <div className="relative flex items-center justify-center">
                <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                {/* Glow behind icon when parent is active (controlled by CSS selectors on active class) */}
                <div className="absolute inset-0 bg-primary/30 blur-md rounded-full opacity-0 group-[.text-primary]:opacity-100 transition-opacity" />
              </div>
              <span className="text-[10px] tracking-wide font-medium font-display transition-colors">
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
