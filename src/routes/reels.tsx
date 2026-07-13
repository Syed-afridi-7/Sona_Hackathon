import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import { Heart, MessageSquare, User, Volume2, VolumeX, Eye, ArrowLeft, Plus, X, Upload } from 'lucide-react'

export const Route = createFileRoute('/reels')({
  component: ReelsComponent,
})

function ReelsComponent() {
  const { reels, profiles, interestedBusinessIds, toggleInterest, currentUser, addPitchReel } = useStore()
  const [muted, setMuted] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({})
  const navigate = useNavigate()
  
  // Track currently active visible reel to enable lazy streaming
  const [activeReelId, setActiveReelId] = useState<string>(reels[0]?.id || '')

  // Create Reel Modal states
  const [showPostModal, setShowPostModal] = useState(false)
  const [newCaption, setNewCaption] = useState('')
  const [uploadType, setUploadType] = useState<'preset' | 'file'>('preset')
  const [newVideoUrl, setNewVideoUrl] = useState('https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054ba208d130a055307a008db64d5eb&profile_id=139&oauth2_token_id=57447761')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // Handle file selection from local gallery
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  // Handle uploading/posting of new PitchReel
  const handlePostReel = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCaption.trim()) return

    let finalVideoUrl = newVideoUrl

    // If uploading from local gallery, create an object URL
    if (uploadType === 'file' && selectedFile) {
      finalVideoUrl = URL.createObjectURL(selectedFile)
    }

    addPitchReel(finalVideoUrl, newCaption)
    setNewCaption('')
    setSelectedFile(null)
    setShowPostModal(false)
    
    // Alert the browser to auto-align to the newly published reel
    setTimeout(() => {
      if (reels.length > 0) {
        setActiveReelId(reels[0].id)
      }
    }, 100)
  }

  return (
    <div className="relative w-full h-[100svh] bg-black overflow-hidden select-none -mx-4 md:max-w-md md:mx-auto md:rounded-3xl md:border md:border-white/10 md:shadow-2xl">
      
      {/* Back button overlay */}
      <Link 
        to="/home" 
        className="absolute top-4 left-4 z-50 p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-all cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>

      {/* Floating post reel trigger - Visible for all logged-in accounts */}
      {currentUser && (
        <button 
          onClick={() => setShowPostModal(true)}
          className="absolute top-4 left-16 z-50 p-2 rounded-full bg-primary/80 backdrop-blur-md text-white hover:bg-primary transition-all cursor-pointer flex items-center justify-center gap-1 text-xs px-3 font-semibold shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Post Reel
        </button>
      )}

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
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
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

      {/* Post Reel Overlay Modal */}
      {showPostModal && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#0f0c1b] rounded-2xl p-6 border border-white/15 text-left flex flex-col gap-4 relative animate-in zoom-in-95 duration-200 text-white">
            <button 
              onClick={() => setShowPostModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            <div>
              <h3 className="font-display font-extrabold text-lg text-white">Post a PitchReel</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Publish your elevator pitch to start matchmaking.</p>
            </div>

            {/* Toggle between preset video or custom gallery file */}
            <div className="grid grid-cols-2 gap-2 bg-[#17132a] p-1 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setUploadType('preset')}
                className={`py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                  uploadType === 'preset' 
                    ? 'bg-primary text-white shadow' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Stock Presets
              </button>
              <button
                type="button"
                onClick={() => setUploadType('file')}
                className={`py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                  uploadType === 'file' 
                    ? 'bg-primary text-white shadow' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Upload File
              </button>
            </div>

            <form onSubmit={handlePostReel} className="flex flex-col gap-4">
              
              {uploadType === 'preset' ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-gray-300 font-bold">Select Stock Pitch Video</label>
                  <select 
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#17132a] text-white text-xs border border-white/15 outline-none cursor-pointer focus:border-primary"
                  >
                    <option value="https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054ba208d130a055307a008db64d5eb&profile_id=139&oauth2_token_id=57447761" className="bg-[#130f26] text-white">Preset 1: Laboratory Biotech Pitch</option>
                    <option value="https://player.vimeo.com/external/481977759.sd.mp4?s=d001eb7054bf93f545a90ee9a9ad8f553a067570&profile_id=165&oauth2_token_id=57447761" className="bg-[#130f26] text-white">Preset 2: CleanTech Solar Farm Pitch</option>
                    <option value="https://player.vimeo.com/external/435649392.sd.mp4?s=564ab10fa4a8b7c7fa6e2dc0883f3e1291ecda53&profile_id=165&oauth2_token_id=57447761" className="bg-[#130f26] text-white">Preset 3: SaaS / AI Agents Demo Pitch</option>
                  </select>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-wider text-gray-300 font-bold">Choose Video File</label>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="video/*" 
                    onChange={handleFileChange}
                    className="hidden" 
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 border border-dashed border-white/20 hover:border-primary/50 bg-[#17132a] hover:bg-[#1f1938] rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group text-center px-4"
                  >
                    <Upload className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] text-gray-300 font-semibold truncate max-w-full">
                      {selectedFile ? selectedFile.name : "Select Video from Gallery"}
                    </span>
                    <span className="text-[8px] text-gray-500">Supports .mp4, .mov, etc.</span>
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase tracking-wider text-gray-300 font-bold">Pitch Caption</label>
                <textarea 
                  placeholder="Introduce your project and what you're seeking (e.g. Raising $200k for our decentralized health network...) #finance #growth"
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  required
                  rows={3}
                  className="w-full p-3 rounded-xl bg-[#17132a] text-white placeholder-gray-500 border border-white/15 outline-none focus:border-primary resize-none text-xs leading-normal"
                />
              </div>

              <button
                type="submit"
                disabled={uploadType === 'file' && !selectedFile}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 cursor-pointer mt-2 disabled:opacity-40 disabled:pointer-events-none"
              >
                Post PitchReel
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
