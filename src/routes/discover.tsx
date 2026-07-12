import { createFileRoute, Link } from '@tanstack/react-router'
import { useStore } from '../store/useStore'
import { useState } from 'react'
import { Search, SlidersHorizontal, MapPin, BarChart4, Briefcase } from 'lucide-react'

// Define type-safe search parameters validation without external Zod dependency
export const Route = createFileRoute('/discover')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      category: search.category as string | undefined,
    }
  },
  component: DiscoverComponent,
})

function DiscoverComponent() {
  const { category: urlCategory } = Route.useSearch()
  const { profiles } = useStore()
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState<string>(urlCategory || 'All')
  const [fundingMax, setFundingMax] = useState<number>(2000000)
  const [minGrowth, setMinGrowth] = useState<number>(0)
  const [selectedLocation, setSelectedLocation] = useState<string>('All')

  // Derive unique locations and industries for filter dropdowns
  const businesses = profiles.filter(p => p.role === 'BUSINESS')
  
  const industries = ['All', ...new Set(businesses.map(b => b.industry).filter(Boolean) as string[])]
  const locations = ['All', ...new Set(businesses.map(b => b.location?.split(',')[1]?.trim()).filter(Boolean))]

  // Filtering Logic
  const filteredBusinesses = businesses.filter((biz) => {
    const matchesSearch = 
      biz.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      biz.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      biz.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesIndustry = selectedIndustry === 'All' || biz.industry === selectedIndustry
    const matchesFunding = (biz.fundingRequired || 0) <= fundingMax
    const matchesGrowth = (biz.growthRate || 0) >= minGrowth
    
    const matchesLocation = 
      selectedLocation === 'All' || 
      biz.location.toLowerCase().includes(selectedLocation.toLowerCase())

    return matchesSearch && matchesIndustry && matchesFunding && matchesGrowth && matchesLocation
  })

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Search Header */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-white text-left">Discover Companies</h2>
        <p className="text-xs text-gray-400 mt-1 text-left">Filter through investment opportunities on the marketplace</p>
      </div>

      {/* Grid: Left Filters, Right Results */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left Side: Filter Control Board */}
        <div className="md:col-span-1 glass-card rounded-2xl p-5 border border-white/10 flex flex-col gap-5 text-left h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <span className="font-semibold text-sm flex items-center gap-1.5"><SlidersHorizontal className="w-4 h-4 text-primary" /> Filters</span>
            <button 
              onClick={() => {
                setSearchTerm('')
                setSelectedIndustry('All')
                setFundingMax(2000000)
                setMinGrowth(0)
                setSelectedLocation('All')
              }}
              className="text-[10px] text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              Clear All
            </button>
          </div>

          {/* Search Term input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Keywords</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-3 w-3.5 h-3.5 text-gray-500" />
              <input 
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl glass-input text-xs text-white placeholder-gray-500"
              />
            </div>
          </div>

          {/* Industry dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Industry</label>
            <select 
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white bg-bg-dark cursor-pointer border border-white/10"
            >
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          {/* Funding required slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
              <span>Max Funding</span>
              <span className="text-white font-bold">${(fundingMax / 1000).toFixed(0)}k</span>
            </div>
            <input 
              type="range" 
              min={100000} 
              max={2000000} 
              step={50000}
              value={fundingMax}
              onChange={(e) => setFundingMax(Number(e.target.value))}
              className="w-full accent-primary bg-white/5 h-1 rounded-lg cursor-pointer"
            />
          </div>

          {/* YoY Growth slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
              <span>Min Growth Rate</span>
              <span className="text-white font-bold">+{minGrowth}%</span>
            </div>
            <input 
              type="range" 
              min={0} 
              max={300} 
              step={10}
              value={minGrowth}
              onChange={(e) => setMinGrowth(Number(e.target.value))}
              className="w-full accent-accent bg-white/5 h-1 rounded-lg cursor-pointer"
            />
          </div>

          {/* Location selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Region</label>
            <select 
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white bg-bg-dark cursor-pointer border border-white/10"
            >
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Right Side: Grid of Matches */}
        <div className="md:col-span-3 flex flex-col gap-4">
          <div className="text-xs text-gray-500 text-left font-medium">
            Showing {filteredBusinesses.length} active opportunities
          </div>

          {filteredBusinesses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredBusinesses.map((biz) => (
                <Link 
                  key={biz.id}
                  to="/profile/$profileId"
                  params={{ profileId: biz.id }}
                  className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col gap-4 text-left cursor-pointer border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={biz.avatarUrl} 
                      alt={biz.displayName} 
                      className="w-11 h-11 rounded-lg object-cover bg-white/5 border border-white/10"
                    />
                    <div>
                      <h3 className="font-semibold text-sm text-white">{biz.displayName}</h3>
                      <span className="text-[10px] text-primary font-medium flex items-center gap-1">
                        <Briefcase className="w-3 h-3" /> {biz.industry}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {biz.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                    <div>
                      <span className="text-[8px] text-gray-500 uppercase tracking-wider block">Req Funding</span>
                      <span className="text-xs font-bold text-white">${((biz.fundingRequired || 0) / 1000).toFixed(0)}k</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-gray-500 uppercase tracking-wider block">YoY Growth</span>
                      <span className="text-xs font-bold text-green-400">+{biz.growthRate}%</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-gray-500 mt-1 pt-1.5 border-t border-white/5">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {biz.location}</span>
                    <span className="font-semibold text-primary flex items-center gap-0.5">Explore <BarChart4 className="w-3.5 h-3.5" /></span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center text-gray-400 flex flex-col items-center gap-3 border border-white/10">
              <SlidersHorizontal className="w-8 h-8 text-gray-600" />
              <p className="text-sm">No businesses match your exact filter configuration.</p>
              <button 
                onClick={() => {
                  setSelectedIndustry('All')
                  setFundingMax(2000000)
                  setMinGrowth(0)
                  setSelectedLocation('All')
                  setSearchTerm('')
                }}
                className="text-xs text-primary underline mt-2 hover:text-accent transition-colors cursor-pointer"
              >
                Clear all filters and search again
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
