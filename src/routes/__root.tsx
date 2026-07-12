import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router'
import { Navbar } from '../components/shared/Navbar'
import { BottomNavigation } from '../components/shared/BottomNavigation'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const location = useLocation()
  
  // Hide global shell chrome on landing ("/") and auth onboarding ("/auth")
  const hideNavigation = location.pathname === '/' || location.pathname === '/auth'
  
  // Isolate chat screen to prevent bottom navigation overlaps on mobile viewports
  const isChatPage = location.pathname === '/chat'

  return (
    <div className="min-h-screen bg-bg-dark text-gray-100 flex flex-col font-sans antialiased">
      {/* Top Header/Navbar - Hidden on Landing, Auth, and Chat (for fullscreen layout) */}
      {!hideNavigation && !isChatPage && <Navbar />}

      {/* Main Container - Adjusted paddings dynamically for chat pages */}
      <main className={`flex-1 w-full mx-auto transition-all duration-300 ${
        hideNavigation || isChatPage
          ? 'max-w-full' 
          : 'max-w-md md:max-w-5xl pb-24 md:pb-6 md:pt-4 px-4'
      }`}>
        <Outlet />
      </main>

      {/* Bottom Navigation - Programmatically hidden on landing, auth, and chat */}
      {!hideNavigation && !isChatPage && <BottomNavigation />}
    </div>
  )
}
