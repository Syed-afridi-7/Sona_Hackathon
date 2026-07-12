import { Link, useNavigate } from '@tanstack/react-router'
import { Bell, Sparkles, UserCheck, Sun, Moon, LogOut } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useStore } from '../../store/useStore'

export function Navbar() {
  const navigate = useNavigate()
  const { currentUser, logout } = useStore()
  const [showNotifications, setShowNotifications] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Initialize theme from DOM state
  useEffect(() => {
    const isLight = document.documentElement.classList.contains('light')
    setTheme(isLight ? 'light' : 'dark')
  }, [])

  const toggleTheme = () => {
    if (theme === 'dark') {
      document.documentElement.classList.add('light')
      setTheme('light')
    } else {
      document.documentElement.classList.remove('light')
      setTheme('dark')
    }
  }

  // Mock notifications matching UIMAP.md requirements
  const mockNotifications = [
    { id: 1, type: 'interest', text: 'Investor Anita Singh marked interest in your Reel!', time: '2m ago', icon: Sparkles, color: 'text-amber-500 dark:text-amber-400 bg-amber-500/10' },
    { id: 2, type: 'verification', text: 'GST Verification successfully approved! Badge active.', time: '1h ago', icon: UserCheck, color: 'text-green-500 dark:text-green-400 bg-green-500/10' },
    { id: 3, type: 'meeting', text: 'Meeting requested by TechCorp Solutions on 15th July.', time: '3h ago', icon: Bell, color: 'text-primary bg-primary/10' },
  ]

  // BUG A FIX: Click-outside logic utilizing refs and events
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-app)] bg-[var(--header-bg)] backdrop-blur-md px-4 py-3 md:px-8 transition-colors duration-350">
      
      {/* Absolute blur-backed screen overlay backdrop for instant dimming and click-away action */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40 bg-black/30 dark:bg-black/50 backdrop-blur-[2px] transition-all duration-200" 
          onClick={() => setShowNotifications(false)}
        />
      )}

      <div className="max-w-5xl mx-auto flex items-center justify-between relative z-50">
        {/* Logo and Tagline */}
        <Link to="/home" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-bold text-white shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform">
            C
          </div>
          <div>
            <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-primary to-accent dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Connexion
            </span>
            <span className="hidden md:inline-block ml-2 text-xs text-[var(--text-muted)] font-light border-l border-[var(--border-app)] pl-2">
              Where Business Meets Capital
            </span>
          </div>
        </Link>

        {/* Notifications, Theme Toggle and Profile Quick Actions */}
        <div className="flex items-center gap-2 relative">
          
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-[var(--card-bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-app)] transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Button */}
          <button 
            ref={buttonRef}
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-[var(--card-bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-app)] transition-colors relative z-50 cursor-pointer"
            aria-label="Toggle notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          </button>

          {/* Dynamic User Status Badge / Login/Logout Trigger */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-app)] animate-in fade-in duration-300">
              <div className="w-7 h-7 rounded-full bg-primary/25 flex items-center justify-center border border-primary/40 text-[10px] font-bold text-primary uppercase">
                {currentUser.displayName ? currentUser.displayName[0] : 'U'}
              </div>
              <span className="hidden md:inline-block text-xs text-[var(--text-app)] font-semibold max-w-[100px] truncate">
                {currentUser.displayName}
              </span>
              <button 
                onClick={() => {
                  logout()
                  navigate({ to: '/auth' })
                }}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 hover:text-red-400 transition-colors cursor-pointer ml-1"
                aria-label="Log out"
                title="Log out of account"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link 
              to="/auth" 
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-xs font-semibold hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shadow-md shadow-primary/10"
            >
              Log In
            </Link>
          )}

          {/* Notification Dropdown Drawer - Enhanced Visibility */}
          {showNotifications && (
            <div 
              ref={dropdownRef}
              className="absolute right-0 top-12 w-80 rounded-xl shadow-2xl p-4 z-50 border border-[var(--border-app)] bg-[var(--dropdown-bg)] animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div className="flex justify-between items-center pb-2.5 border-b border-[var(--border-app)] mb-2.5">
                <h3 className="font-display font-semibold text-sm text-[var(--text-app)]">Notifications</h3>
                <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full font-semibold">3 New</span>
              </div>
              
              <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto no-scrollbar">
                {mockNotifications.map((notif) => {
                  const Icon = notif.icon
                  return (
                    <div 
                      key={notif.id} 
                      className="flex gap-3 p-2.5 rounded-lg hover:bg-[var(--card-bg-hover)] transition-colors cursor-pointer text-left border-b border-[var(--border-app)]/5 last:border-b-0"
                    >
                      <div className={`mt-0.5 p-1.5 rounded-lg flex items-center justify-center h-7 w-7 ${notif.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[var(--text-app)] font-medium leading-normal tracking-wide break-words">{notif.text}</p>
                        <span className="text-[10px] text-[var(--text-muted)] mt-1 block font-mono">{notif.time}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
