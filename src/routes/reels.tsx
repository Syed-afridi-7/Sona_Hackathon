import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import { Heart, MessageSquare, User, Volume2, VolumeX, Eye, ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/reels')({
  component: ReelsComponent,
})

function ReelsComponent() {
  const { reels, profiles, interestedBusinessIds, toggleInterest } = useStore()
  const [muted, setMuted] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({})
  const navigate = useNavigate()
  
  // Track currently active visible reel to enable lazy streaming
  const [activeReelId, setActiveReelId] = useState<string>(reels[0]?.id || '')

  useEffect(() => {
    // Observe reel section wrappers instead of videos directly to control src loading
    const observerOptions = {
      root: containerRef.current,
      threshold: 0.6,
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const reelId = entry.target.getAttribute('data-reel-id')
          if (reelId) {
            setActiveReelId(reelId)
          }
        }
      })
    }, observerOptions)

    const sections = containerRef.current?.querySelectorAll('.reel-section')
    sections?.forEach((sec) => observer.observe(sec))

    return () => {
      sections?.forEach((sec) => observer.unobserve(sec))
    }
  }, [reels])

  // Play/Pause active video and synchronize mute settings without blocking UI threads
  useEffect(() => {
    Object.keys(videoRefs.current).forEach((id) => {
      const vid = videoRefs.current[id]
      if (vid) {
        if (id === activeReelId) {
          vid.muted = muted
          // Load stream metadata if it has just attached
          if (vid.readyState === 0) {
            vid.load()
          }
          vid.play().catch(() => {
            // Autoplay safety fallback
          })
        } else {
          vid.pause()
          vid.currentTime = 0
        }
      }
    })
  }, [activeReelId, muted])

  const toggleMute = () => {
    setMuted(!muted)
    Object.values(videoRefs.current).forEach((video) => {
      if (video) video.muted = !muted
    })
  }

  // Calculate preloading index offsets
  const activeIdx = reels.findIndex(r => r.id === activeReelId)

  return (
    <div className="relative w-full h-[100svh] bg-black overflow-hidden select-none -mx-4 md:max-w-md md:mx-auto md:rounded-3xl md:border md:border-white/10 md:shadow-2xl">
      
      {/* Back button overlay */}
      <Link 
        to="/home" 
        className="absolute top-4 left-4 z-50 p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-all cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>

      {/* Floating global mute toggle */}
      <button 
        onClick={toggleMute}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-all cursor-pointer"
      >
        {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>

      {/* Snapping vertical scroll container */}
      <div 
        ref={containerRef}
        className="reels-container h-full w-full no-scrollbar"
      >
        {reels.map((reel, idx) => {
          const biz = profiles.find(p => p.id === reel.businessId)
          const isInterested = interestedBusinessIds.includes(reel.businessId)

          // Performance Fix: Load video src only if active or adjacent (preloads 1 slide ahead/behind)
          const shouldLoadMedia = Math.abs(idx - activeIdx) <= 1

          return (
            <div 
              key={reel.id} 
              data-reel-id={reel.id}
              className="reel-section w-full h-full relative flex items-center justify-center bg-black"
            >
              {/* HTML5 video tag with dynamic source attachment */}
              <video
                ref={(el) => { videoRefs.current[reel.id] = el }}
                src={shouldLoadMedia ? reel.videoUrl : undefined}
                loop
                muted={muted}
                preload="metadata"
                playsInline
                onClick={toggleMute}
                className="w-full h-full object-cover cursor-pointer transform translate-z-0"
              />

              {/* Black overlay at bottom of video for text legibility */}
              <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10" />

              {/* Floating Right Side Action Column (Optimized layout click triggers) */}
              <div className="absolute right-4 bottom-28 z-20 flex flex-col gap-5 items-center pointer-events-auto">
                
                {/* Interest (Like) Button */}
                <div className="flex flex-col items-center gap-1">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleInterest(reel.businessId)
                    }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 ${
                      isInterested 
                        ? 'bg-primary text-white scale-110 shadow-primary/30' 
                        : 'bg-black/40 text-white border border-white/10 hover:bg-black/60'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isInterested ? 'fill-white' : ''}`} />
                  </button>
                  <span className="text-[10px] font-medium text-white shadow-sm">
                    {reel.interestedCount}
                  </span>
                </div>

                {/* Visit profile button */}
                <div className="flex flex-col items-center gap-1">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate({ to: '/profile/$profileId', params: { profileId: reel.businessId } })
                    }}
                    className="w-12 h-12 rounded-full bg-black/40 text-white border border-white/10 flex items-center justify-center hover:bg-black/60 transition-all cursor-pointer shadow-lg active:scale-95"
                  >
                    <User className="w-5 h-5" />
                  </button>
                  <span className="text-[10px] font-medium text-white shadow-sm">Profile</span>
                </div>

                {/* Chat direct click */}
                <div className="flex flex-col items-center gap-1">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate({ to: '/chat' })
                    }}
                    className="w-12 h-12 rounded-full bg-black/40 text-white border border-white/10 flex items-center justify-center hover:bg-black/60 transition-all cursor-pointer shadow-lg active:scale-95"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                  <span className="text-[10px] font-medium text-white shadow-sm">Chat</span>
                </div>

                {/* Views Counter (Passive indicator) */}
                <div className="flex flex-col items-center gap-0.5">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span className="text-[9px] font-medium text-gray-300">{reel.viewCount}</span>
                </div>

              </div>

              {/* Bottom Video Text details */}
              <div className="absolute left-4 bottom-24 right-20 z-20 text-left flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <img 
                    src={biz?.avatarUrl} 
                    alt={biz?.displayName}
                    className="w-8 h-8 rounded-full border border-white/20 object-cover aspect-square"
                  />
                  <div>
                    <h3 className="font-semibold text-sm text-white">{biz?.displayName}</h3>
                    <span className="text-[10px] text-primary font-medium">{biz?.industry} • {biz?.location}</span>
                  </div>
                  {biz?.verificationStatus === 'VERIFIED' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  )}
                </div>

                <p className="text-xs text-gray-300 leading-normal font-light">
                  {reel.caption}
                </p>

                {/* Financial overview sticky snippet */}
                <div className="flex gap-4 text-[10px] font-semibold text-gray-400 bg-white/5 border border-white/5 px-2.5 py-1.5 rounded-lg w-fit">
                  <span>Req: <strong className="text-white">${((biz?.fundingRequired || 0) / 1000).toFixed(0)}k</strong></span>
                  <span>Equity: <strong className="text-white">{biz?.equityOffered}%</strong></span>
                </div>
              </div>

            </div>
          )
        })}
      </div>
    </div>
  )
}
