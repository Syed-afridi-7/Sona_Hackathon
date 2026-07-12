import { createFileRoute, Link } from '@tanstack/react-router'
import { useStore } from '../store/useStore'
import { useState } from 'react'
import { Search, SlidersHorizontal, MapPin, BarChart4, Briefcase, CheckCircle } from 'lucide-react'

export const Route = createFileRoute('/discover')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      category: search.category as string | undefined,
    }
  },
  component: DiscoverComponent,
})

type TabType = 'BUSINESS' | 'INVESTOR' | 'MENTOR' | 'ENTREPRENEUR'

function DiscoverComponent() {
  const { category: urlCategory } = Route.useSearch()
  const { profiles, cofounderConnections, requestCofounderConnection } = useStore()
  
  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>('BUSINESS')

  // Common Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<string>('All')

  // Startup Filter States
  const [selectedIndustry, setSelectedIndustry] = useState<string>(urlCategory || 'All')
  const [fundingMax, setFundingMax] = useState<number>(2000000)
  const [minGrowth, setMinGrowth] = useState<number>(0)

  // Mentor Filter States
  const [selectedDomain, setSelectedDomain] = useState<string>('All')
  const [mentorHourlyMax, setMentorHourlyMax] = useState<number>(250)

  // Entrepreneur Filter States
  const [selectedSkill, setSelectedSkill] = useState<string>('All')
  const [minExperience, setMinExperience] = useState<number>(0)

  // Derive unique locations
  const locations = ['All', ...new Set(profiles.map(p => p.location?.split(',')[1]?.trim()).filter(Boolean))]

  // Derive unique values for dropdowns
  const businesses = profiles.filter(p => p.role === 'BUSINESS')
  const industries = ['All', ...new Set(businesses.map(b => b.industry).filter(Boolean) as string[])]

  const mentors = profiles.filter(p => p.role === 'MENTOR')
  const domains = ['All', ...new Set(mentors.flatMap(m => m.domainExpertise || []).filter(Boolean))]

  const entrepreneurs = profiles.filter(p => p.role === 'ENTREPRENEUR')
  const skills = ['All', ...new Set(entrepreneurs.flatMap(e => e.primarySkills || []).filter(Boolean))]

  // Filter profiles based on current active tab
  const filteredProfiles = profiles.filter((profile) => {
    if (profile.role !== activeTab) return false

    const matchesSearch = 
      profile.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (profile.companyName && profile.companyName.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesLocation = 
      selectedLocation === 'All' || 
      profile.location.toLowerCase().includes(selectedLocation.toLowerCase())

    if (!matchesSearch || !matchesLocation) return false

    // Role-specific filters
    if (activeTab === 'BUSINESS') {
      const matchesIndustry = selectedIndustry === 'All' || profile.industry === selectedIndustry
      const matchesFunding = (profile.fundingRequired || 0) <= fundingMax
      const matchesGrowth = (profile.growthRate || 0) >= minGrowth
      return matchesIndustry && matchesFunding && matchesGrowth
    }

    if (activeTab === 'MENTOR') {
      const matchesDomain = selectedDomain === 'All' || (profile.domainExpertise || []).includes(selectedDomain)
      const matchesHourly = (profile.hourlyRate || 0) <= mentorHourlyMax
      return matchesDomain && matchesHourly
    }

    if (activeTab === 'ENTREPRENEUR') {
      const matchesSkill = selectedSkill === 'All' || (profile.primarySkills || []).includes(selectedSkill)
      const matchesExperience = (profile.yearsExperience || 0) >= minExperience
      return matchesSkill && matchesExperience
    }

    return true
  })

  // Check if active startup is matching with cofounder
  const handleCofounderRequest = (startupId: string, entrepreneurId: string) => {
    requestCofounderConnection(startupId, entrepreneurId)
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-[var(--text-app)] text-left">Discover Ecosystem</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1 text-left">Explore and connect with verified startups, investors, mentors, and builders</p>
        </div>

        {/* Dynamic Pillar Tab Switcher */}
        <div className="flex bg-[var(--card-bg)] border border-[var(--border-app)] p-1 rounded-xl h-fit">
          {(['BUSINESS', 'INVESTOR', 'MENTOR', 'ENTREPRENEUR'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab)
                setSearchTerm('')
                setSelectedLocation('All')
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-app)]'
              }`}
            >
              {tab === 'BUSINESS' ? 'Startups' : tab === 'INVESTOR' ? 'Investors' : tab === 'MENTOR' ? 'Mentors' : 'Builders'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Left Filters, Right Results */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left Side: Filter Control Board */}
        <div className="md:col-span-1 glass-card rounded-2xl p-5 border border-[var(--border-app)] flex flex-col gap-5 text-left h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-app)]">
            <span className="font-semibold text-sm flex items-center gap-1.5"><SlidersHorizontal className="w-4 h-4 text-primary" /> Filters</span>
            <button 
              onClick={() => {
                setSearchTerm('')
                setSelectedLocation('All')
                setSelectedIndustry('All')
                setSelectedDomain('All')
                setSelectedSkill('All')
                setFundingMax(2000000)
                setMinGrowth(0)
                setMentorHourlyMax(250)
                setMinExperience(0)
              }}
              className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-app)] transition-colors cursor-pointer"
            >
              Clear All
            </button>
          </div>

          {/* Search Term input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Keywords</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-3 w-3.5 h-3.5 text-gray-500" />
              <input 
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl glass-input text-xs text-[var(--text-app)] placeholder-gray-500"
              />
            </div>
          </div>

          {/* Location selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Region</label>
            <select 
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs text-[var(--text-app)] bg-[var(--bg-app)] cursor-pointer border border-[var(--border-app)]"
            >
              {locations.map(loc => (
                <option key={loc} value={loc} className="text-[var(--text-app)] bg-[var(--bg-app)]">{loc}</option>
              ))}
            </select>
          </div>

          {/* Startup specific filters */}
          {activeTab === 'BUSINESS' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Industry</label>
                <select 
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-[var(--text-app)] bg-[var(--bg-app)] cursor-pointer border border-[var(--border-app)]"
                >
                  {industries.map(ind => (
                    <option key={ind} value={ind} className="text-[var(--text-app)] bg-[var(--bg-app)]">{ind}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                  <span>Max Funding</span>
                  <span className="text-[var(--text-app)] font-bold">${(fundingMax / 1000).toFixed(0)}k</span>
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

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                  <span>Min Growth</span>
                  <span className="text-[var(--text-app)] font-bold">+{minGrowth}%</span>
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
            </>
          )}

          {/* Mentor specific filters */}
          {activeTab === 'MENTOR' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Domain</label>
                <select 
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-[var(--text-app)] bg-[var(--bg-app)] cursor-pointer border border-[var(--border-app)]"
                >
                  {domains.map(dom => (
                    <option key={dom} value={dom} className="text-[var(--text-app)] bg-[var(--bg-app)]">{dom}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                  <span>Max Rate/Hr</span>
                  <span className="text-[var(--text-app)] font-bold">${mentorHourlyMax}</span>
                </div>
                <input 
                  type="range" 
                  min={0} 
                  max={250} 
                  step={25}
                  value={mentorHourlyMax}
                  onChange={(e) => setMentorHourlyMax(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-white/5 h-1 rounded-lg cursor-pointer"
                />
              </div>
            </>
          )}

          {/* Entrepreneur specific filters */}
          {activeTab === 'ENTREPRENEUR' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Skill</label>
                <select 
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs text-[var(--text-app)] bg-[var(--bg-app)] cursor-pointer border border-[var(--border-app)]"
                >
                  {skills.map(sk => (
                    <option key={sk} value={sk} className="text-[var(--text-app)] bg-[var(--bg-app)]">{sk}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                  <span>Min Experience</span>
                  <span className="text-[var(--text-app)] font-bold">{minExperience} Yrs</span>
                </div>
                <input 
                  type="range" 
                  min={0} 
                  max={15} 
                  step={1}
                  value={minExperience}
                  onChange={(e) => setMinExperience(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-white/5 h-1 rounded-lg cursor-pointer"
                />
              </div>
            </>
          )}

        </div>

        {/* Right Side: Results Grid */}
        <div className="md:col-span-3 flex flex-col gap-4">
          <div className="text-xs text-[var(--text-muted)] text-left font-medium">
            Showing {filteredProfiles.length} active matching profiles
          </div>

          {filteredProfiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* RENDER STARTUPS (BUSINESS) */}
              {activeTab === 'BUSINESS' && filteredProfiles.map((biz) => (
                <Link 
                  key={biz.id}
                  to="/profile/$profileId"
                  params={{ profileId: biz.id }}
                  className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col gap-4 text-left cursor-pointer border border-[var(--border-app)]"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={biz.avatarUrl} 
                      alt={biz.displayName} 
                      className="w-11 h-11 rounded-lg object-cover bg-white/5 border border-white/10 aspect-square"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-sm text-[var(--text-app)]">{biz.displayName}</h3>
                        {biz.verificationStatus === 'VERIFIED' && <CheckCircle className="w-3.5 h-3.5 text-green-500 fill-green-500/10" />}
                      </div>
                      <span className="text-[10px] text-primary font-medium flex items-center gap-1">
                        <Briefcase className="w-3 h-3" /> {biz.industry}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed h-[36px]">
                    {biz.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                    <div>
                      <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider block">Req Funding</span>
                      <span className="text-xs font-bold text-[var(--text-app)]">${((biz.fundingRequired || 0) / 1000).toFixed(0)}k</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider block">YoY Growth</span>
                      <span className="text-xs font-bold text-green-500">+{biz.growthRate}%</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] mt-1 pt-1.5 border-t border-[var(--border-app)]">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {biz.location}</span>
                    <span className="font-semibold text-primary flex items-center gap-0.5">Explore <BarChart4 className="w-3.5 h-3.5" /></span>
                  </div>
                </Link>
              ))}

              {/* RENDER INVESTORS */}
              {activeTab === 'INVESTOR' && filteredProfiles.map((inv) => (
                <div 
                  key={inv.id}
                  className="glass-card rounded-2xl p-5 flex flex-col justify-between border border-[var(--border-app)] min-h-[220px]"
                >
                  <div className="flex flex-col gap-3 text-left">
                    <div className="flex items-center gap-3">
                      <img 
                        src={inv.avatarUrl} 
                        alt={inv.displayName} 
                        className="w-11 h-11 rounded-full object-cover bg-white/5 border border-white/10 aspect-square"
                      />
                      <div>
                        <h3 className="font-semibold text-sm text-[var(--text-app)] leading-none">{inv.displayName}</h3>
                        <span className="text-[9px] text-accent font-medium mt-1.5 inline-block">{inv.companyName || 'Private Syndicate'}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                      {inv.description}
                    </p>

                    {/* Preferred Industries tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {inv.preferredIndustries?.map((ind) => (
                        <span key={ind} className="text-[9px] font-semibold bg-white/5 border border-[var(--border-app)] px-2 py-0.5 rounded-full text-[var(--text-muted)]">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] mt-3 pt-3 border-t border-[var(--border-app)]">
                    <span className="flex items-center gap-1 font-mono">${((inv.investmentMin || 0) / 1000).toFixed(0)}k - ${((inv.investmentMax || 0) / 1000000).toFixed(1)}M</span>
                    <Link to="/chat" className="text-xs text-accent font-semibold hover:underline">Connect</Link>
                  </div>
                </div>
              ))}

              {/* RENDER MENTORS */}
              {activeTab === 'MENTOR' && filteredProfiles.map((men) => (
                <div 
                  key={men.id}
                  className="glass-card rounded-2xl p-5 flex flex-col justify-between border border-[var(--border-app)] min-h-[220px]"
                >
                  <div className="flex flex-col gap-3 text-left">
                    <div className="flex items-center gap-3">
                      <img 
                        src={men.avatarUrl} 
                        alt={men.displayName} 
                        className="w-11 h-11 rounded-full object-cover bg-white/5 border border-white/10 aspect-square"
                      />
                      <div>
                        <h3 className="font-semibold text-sm text-[var(--text-app)] leading-none">{men.displayName}</h3>
                        <span className="text-[9px] text-emerald-500 font-semibold mt-1.5 inline-block">Verified Mentor</span>
                      </div>
                    </div>

                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                      {men.description}
                    </p>

                    {/* Expertise tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {men.domainExpertise?.map((exp) => (
                        <span key={exp} className="text-[9px] font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-emerald-400">
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] mt-3 pt-3 border-t border-[var(--border-app)]">
                    <span className="flex items-center gap-1 font-mono font-bold">${men.hourlyRate}/Hr Consulting</span>
                    <Link 
                      to="/chat" 
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all text-[10px] font-bold cursor-pointer"
                    >
                      Book Session
                    </Link>
                  </div>
                </div>
              ))}

              {/* RENDER ENTREPRENEURS (BUILDERS) */}
              {activeTab === 'ENTREPRENEUR' && filteredProfiles.map((ent) => {
                // Check if cofounder request already exists
                const connection = cofounderConnections.find(c => c.entrepreneurId === ent.id)
                const isRequested = !!connection
                const isMatched = connection?.status === 'MATCHED'

                return (
                  <div 
                    key={ent.id}
                    className="glass-card rounded-2xl p-5 flex flex-col justify-between border border-[var(--border-app)] min-h-[220px]"
                  >
                    <div className="flex flex-col gap-3 text-left">
                      <div className="flex items-center gap-3">
                        <img 
                          src={ent.avatarUrl} 
                          alt={ent.displayName} 
                          className="w-11 h-11 rounded-full object-cover bg-white/5 border border-white/10 aspect-square"
                        />
                        <div>
                          <h3 className="font-semibold text-sm text-[var(--text-app)] leading-none">{ent.displayName}</h3>
                          <span className="text-[9px] text-cyan-500 font-semibold mt-1.5 inline-block">{ent.yearsExperience} Yrs Exp • {ent.equityExpectationRange} Eq</span>
                        </div>
                      </div>

                      <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                        {ent.description}
                      </p>

                      {/* Skills tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {ent.primarySkills?.map((skill) => (
                          <span key={skill} className="text-[9px] font-semibold bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full text-cyan-400">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] mt-3 pt-3 border-t border-[var(--border-app)]">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {ent.location}</span>
                      
                      {isRequested ? (
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                          isMatched 
                            ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>
                          {isMatched ? 'Matched Co-founder' : 'Request Pending'}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCofounderRequest('p-1', ent.id)} // Mock request from Aura Biotech
                          className="px-3 py-1.5 rounded-lg bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all text-[10px] font-bold cursor-pointer"
                        >
                          Request Co-founder Join
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}

            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center text-gray-400 flex flex-col items-center gap-3 border border-white/10">
              <SlidersHorizontal className="w-8 h-8 text-gray-600" />
              <p className="text-sm">No profiles match your exact filter configuration.</p>
              <button 
                onClick={() => {
                  setSelectedIndustry('All')
                  setSelectedLocation('All')
                  setSelectedDomain('All')
                  setSelectedSkill('All')
                  setFundingMax(2000000)
                  setMinGrowth(0)
                  setMentorHourlyMax(250)
                  setMinExperience(0)
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
