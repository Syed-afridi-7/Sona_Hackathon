import { createFileRoute, Link } from '@tanstack/react-router'
import { useStore } from '../store/useStore'
import { Search, Star, Play, MapPin, ArrowUpRight, TrendingUp, Sparkles } from 'lucide-react'

export const Route = createFileRoute('/home')({
  component: HomeComponent,
})

function HomeComponent() {
  const { profiles, reels } = useStore()
  
  // Filter only business profiles
  const businesses = profiles.filter(p => p.role === 'BUSINESS')
  
  // Star Business is Aura Biotech (p-1)
  const starBusiness = businesses.find(b => b.id === 'p-1') || businesses[0]
  
  // Other recommended businesses
  const recommended = businesses.filter(b => b.id !== starBusiness?.id)

  const categories = ['All', 'Biotech', 'CleanTech', 'SaaS', 'Fintech', 'DeepTech']

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* 1. Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
        <Link to="/discover" search={{ category: undefined }}>
          <div className="w-full pl-10 pr-4 py-3 rounded-xl glass-card text-sm text-gray-400 flex items-center cursor-pointer hover:bg-white/5 transition-all">
            Search industries, valuations, locations...
          </div>
        </Link>
      </div>

      {/* 2. Categories Slider */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat, idx) => (
          <Link
            key={cat}
            to="/discover"
            search={{ category: cat === 'All' ? undefined : cat }}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border border-white/5 transition-all cursor-pointer ${
              idx === 0 
                ? 'bg-primary text-white' 
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* 3. Star Business of the Week */}
      {starBusiness && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Star className="w-4 h-4 fill-amber-400" /> Star Business of the Week
          </div>
          
          <div className="relative glass-card rounded-2xl overflow-hidden border border-white/10 group shadow-lg">
            {/* Cover image overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/70 to-transparent z-10" />
            <img 
              src={starBusiness.coverImageUrl} 
              alt={starBusiness.displayName} 
              className="w-full h-44 object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
            />
            
            {/* Content overlay */}
            <div className="relative p-5 z-20 flex flex-col gap-3 mt-16 text-left">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-display font-extrabold text-xl text-white tracking-tight">{starBusiness.displayName}</h3>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                    <MapPin className="w-3 h-3 text-gray-500" /> {starBusiness.location}
                  </div>
                </div>
                <span className="text-[10px] bg-green-500/25 border border-green-500/50 text-green-400 px-2 py-0.5 rounded-full font-medium tracking-wide uppercase">
                  Verified
                </span>
              </div>
              
              <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                {starBusiness.description}
              </p>

              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-2 bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                <div>
                  <span className="text-[9px] text-gray-500 block">Required</span>
                  <span className="text-xs font-bold text-white">${(starBusiness.fundingRequired || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-500 block">Equity</span>
                  <span className="text-xs font-bold text-primary">{starBusiness.equityOffered}%</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-500 block">YoY Growth</span>
                  <span className="text-xs font-bold text-green-400">+{starBusiness.growthRate}%</span>
                </div>
              </div>

              {/* Action Button */}
              <Link 
                to="/profile/$profileId"
                params={{ profileId: starBusiness.id }}
                className="w-full py-2.5 rounded-xl bg-white text-bg-dark font-medium text-xs flex items-center justify-center gap-1.5 hover:bg-gray-200 active:scale-95 transition-all"
              >
                View Pitch Profile <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 4. Trending PitchReels Horizontal list */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
          <TrendingUp className="w-4 h-4 text-primary" /> Trending PitchReels
        </div>
        
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-1">
          {reels.map((reel) => {
            const biz = profiles.find(p => p.id === reel.businessId)
            return (
              <Link 
                key={reel.id}
                to="/reels"
                className="flex-shrink-0 w-36 aspect-[9/16] rounded-xl overflow-hidden bg-white/5 border border-white/10 relative group cursor-pointer shadow-md"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-10" />
                <video 
                  src={reel.videoUrl} 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Reel Play CTA */}
                <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-primary/80 flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Video text details */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 text-left">
                  <span className="text-[9px] bg-primary/25 border border-primary/40 text-primary px-1.5 py-0.5 rounded font-medium block w-fit mb-1">
                    {biz?.industry}
                  </span>
                  <h4 className="font-semibold text-xs text-white truncate">{biz?.displayName}</h4>
                  <span className="text-[9px] text-gray-400 block mt-0.5">{reel.viewCount} views</span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* 5. Recommended Businesses list */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-accent" /> Recommended for You
        </div>

        <div className="flex flex-col gap-3">
          {recommended.map((biz) => (
            <Link 
              key={biz.id}
              to="/profile/$profileId"
              params={{ profileId: biz.id }}
              className="glass-card glass-card-hover rounded-xl p-4 flex gap-4 text-left border border-white/5 cursor-pointer"
            >
              <img 
                src={biz.avatarUrl} 
                alt={biz.displayName} 
                className="w-12 h-12 rounded-xl object-cover bg-white/5 border border-white/10"
              />
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-sm text-white">{biz.displayName}</h4>
                    <span className="text-[10px] text-primary font-medium">{biz.industry} • {biz.location}</span>
                  </div>
                  <span className="text-xs font-bold text-white">${((biz.fundingRequired || 0) / 1000).toFixed(0)}k</span>
                </div>
                
                <p className="text-xs text-gray-400 line-clamp-1">
                  {biz.description}
                </p>

                <div className="flex justify-between items-center text-[10px] text-gray-500 pt-1 border-t border-white/5 mt-0.5">
                  <span>Req: ${biz.fundingRequired?.toLocaleString()}</span>
                  <span>Equity: {biz.equityOffered}%</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  )
}
