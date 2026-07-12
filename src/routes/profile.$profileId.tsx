import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useStore } from '../store/useStore'
import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { 
  ArrowLeft, Heart, MessageSquare, Calendar, MapPin, Briefcase, FileText, 
  ExternalLink, TrendingUp, Users, Building, ShieldCheck 
} from 'lucide-react'

export const Route = createFileRoute('/profile/$profileId')({
  component: ProfileDetailsComponent,
})

function ProfileDetailsComponent() {
  const { profileId } = Route.useParams()
  const { profiles, interestedBusinessIds, toggleInterest, scheduleMeeting } = useStore()
  const navigate = useNavigate()

  const biz = profiles.find(p => p.id === profileId)
  const isInterested = interestedBusinessIds.includes(profileId)

  // Booking Modal State
  const [showScheduler, setShowScheduler] = useState(false)
  const [scheduledTime, setScheduledTime] = useState('')
  const [isOnline, setIsOnline] = useState(true)
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/abc-defg-hij')
  const [bookingSuccess, setBookingSuccess] = useState(false)

  if (!biz) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-gray-400">Business profile not found.</p>
        <Link to="/home" className="text-xs text-primary underline">Back to home</Link>
      </div>
    )
  }

  const handleBookMeeting = (e: React.FormEvent) => {
    e.preventDefault()
    if (!scheduledTime) return

    scheduleMeeting({
      receiverId: biz.id,
      scheduledTime: new Date(scheduledTime).toISOString(),
      isOnline,
      meetingLink: isOnline ? meetingLink : '12th Floor, MG Road Tech Park, Bangalore',
    })

    setBookingSuccess(true)
    setTimeout(() => {
      setBookingSuccess(false)
      setShowScheduler(false)
      setScheduledTime('')
    }, 2000)
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 pb-12 text-left">
      
      {/* 1. Header Back & Action Buttons */}
      <div className="flex justify-between items-center">
        <Link to="/home" className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        
        <div className="flex items-center gap-2">
          {/* Interest Toggle Button */}
          <button 
            onClick={() => toggleInterest(biz.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
              isInterested 
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isInterested ? 'fill-white' : ''}`} />
            {isInterested ? 'Interested' : 'Mark Interest'}
          </button>
        </div>
      </div>

      {/* 2. Hero Header Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-white/5 h-44 bg-white/5">
        <img 
          src={biz.coverImageUrl} 
          alt={biz.displayName} 
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/40 to-transparent" />
        
        {/* Avatar Position */}
        <div className="absolute bottom-4 left-4 flex gap-3 items-end">
          <img 
            src={biz.avatarUrl} 
            alt={biz.displayName} 
            className="w-16 h-16 rounded-xl object-cover border-2 border-white/10 bg-bg-dark shadow-xl"
          />
          <div className="mb-1">
            <h1 className="font-display font-extrabold text-xl leading-none text-white">{biz.displayName}</h1>
            <span className="text-[10px] text-gray-400 font-medium">{biz.companyName}</span>
          </div>
        </div>
      </div>

      {/* 3. Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-xl p-3.5 flex flex-col gap-0.5">
          <span className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">Funding Required</span>
          <span className="text-sm font-extrabold text-white">${biz.fundingRequired?.toLocaleString()}</span>
        </div>
        <div className="glass-card rounded-xl p-3.5 flex flex-col gap-0.5">
          <span className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">Equity Offered</span>
          <span className="text-sm font-extrabold text-primary">{biz.equityOffered}%</span>
        </div>
        <div className="glass-card rounded-xl p-3.5 flex flex-col gap-0.5">
          <span className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">Annual Revenue</span>
          <span className="text-sm font-extrabold text-green-400">${biz.revenue?.toLocaleString()}</span>
        </div>
        <div className="glass-card rounded-xl p-3.5 flex flex-col gap-0.5">
          <span className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">YoY growth</span>
          <span className="text-sm font-extrabold text-accent">+{biz.growthRate}%</span>
        </div>
      </div>

      {/* 4. Core Details & Performance Chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Bio & Documents */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <div className="glass-card rounded-xl p-5 border border-white/5 flex flex-col gap-4">
            <h3 className="font-semibold text-sm border-b border-white/5 pb-2">Business Overview</h3>
            <p className="text-xs text-gray-300 leading-relaxed font-light">{biz.description}</p>
            
            <div className="flex flex-col gap-2 text-xs text-gray-400 mt-2">
              <span className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-gray-500" /> Industry: <strong className="text-white">{biz.industry}</strong></span>
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-500" /> Headquarters: <strong className="text-white">{biz.location}</strong></span>
              <span className="flex items-center gap-2"><Building className="w-4 h-4 text-gray-500" /> Estd Year: <strong className="text-white">{biz.establishedYear}</strong></span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4 text-gray-500" /> Employees: <strong className="text-white">{biz.employeeCount}</strong></span>
            </div>
          </div>

          {/* Pitch Deck Section */}
          <div className="glass-card rounded-xl p-5 border border-white/5 flex flex-col gap-3">
            <h3 className="font-semibold text-sm border-b border-white/5 pb-2">Documents</h3>
            <a 
              href={biz.pitchDeckUrl}
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 text-xs text-gray-300 hover:bg-white/10 transition-colors"
            >
              <span className="flex items-center gap-2 text-red-400 font-semibold"><FileText className="w-4 h-4" /> Pitch_Deck_v2.pdf</span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
            </a>
            
            <div className="flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-1.5 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5" /> Registered GST / MSME Verified
            </div>
          </div>
        </div>

        {/* Right Column: Performance Graph */}
        <div className="md:col-span-2 glass-card rounded-xl p-5 border border-white/5 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h3 className="font-semibold text-sm flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-accent" /> Financial Performance</h3>
            <span className="text-[10px] text-gray-500 font-mono">YoY Area Revenue Chart</span>
          </div>

          <div className="w-full h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={biz.revenueHistory || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="year" stroke="#4b5563" fontSize={10} tickLine={false} />
                <YAxis stroke="#4b5563" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 12, 25, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px' }}
                  labelClassName="text-white text-xs font-bold"
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} name="Revenue ($)" />
                <Area type="monotone" dataKey="profit" stroke="var(--color-accent)" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={2} name="Profit ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 5. Sticky Action Footer Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-bg-dark via-bg-dark/95 to-transparent px-4 pb-5 pt-2">
        <div className="max-w-md mx-auto flex gap-3">
          <button 
            onClick={() => navigate({ to: '/chat' })}
            className="w-1/3 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 font-semibold text-xs flex items-center justify-center gap-1.5 text-white transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-primary" /> Start Chat
          </button>
          
          <button 
            onClick={() => setShowScheduler(true)}
            className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-primary/10 transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4" /> Book Pitch Meeting
          </button>
        </div>
      </div>

      {/* 6. Calendar Booking Scheduler Modal */}
      {showScheduler && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-sm glass-card rounded-2xl p-6 border border-white/10 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <h3 className="font-display font-extrabold text-lg text-white mb-1">Book Meeting</h3>
            <p className="text-xs text-gray-400 mb-4">Set up a session with the founder of {biz.displayName}</p>

            {bookingSuccess ? (
              <div className="py-8 flex flex-col items-center gap-3 text-center animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold text-white">Meeting Proposal Sent!</span>
                <span className="text-[10px] text-gray-500">Wait for approval on your dashboard.</span>
              </div>
            ) : (
              <form onSubmit={handleBookMeeting} className="flex flex-col gap-4">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Select Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    required
                    className="w-full p-3 rounded-xl glass-input text-xs text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Meeting Format</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsOnline(true)}
                      className={`w-1/2 py-2 rounded-lg text-xs font-semibold transition-all border ${
                        isOnline 
                          ? 'bg-primary/20 border-primary text-white' 
                          : 'bg-white/5 border-white/5 text-gray-400'
                      }`}
                    >
                      Video Call
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsOnline(false)}
                      className={`w-1/2 py-2 rounded-lg text-xs font-semibold transition-all border ${
                        !isOnline 
                          ? 'bg-primary/20 border-primary text-white' 
                          : 'bg-white/5 border-white/5 text-gray-400'
                      }`}
                    >
                      In Person
                    </button>
                  </div>
                </div>

                {isOnline && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Conference Link</label>
                    <input 
                      type="text" 
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      className="w-full p-3 rounded-xl glass-input text-xs text-white"
                    />
                  </div>
                )}

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowScheduler(false)}
                    className="w-1/3 py-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-medium text-gray-400 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-xs font-semibold text-white shadow-lg cursor-pointer"
                  >
                    Confirm Proposal
                  </button>
                </div>

              </form>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
