import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useStore } from '../store/useStore'
import { useState, useEffect } from 'react'
import { BarChart3, Users, Eye, Sparkles, Calendar, Shield, Upload, FileText, CheckCircle, Coins, Briefcase } from 'lucide-react'

export const Route = createFileRoute('/dashboard')({
  component: DashboardComponent,
})

// 1. Metric Loader Card
const MetricSkeletonCard = () => (
  <div className="glass-card rounded-xl p-4 flex flex-col justify-between border border-white/5 bg-white/[0.01] h-[98px]">
    <div className="w-5 h-5 bg-white/10 rounded" />
    <div className="h-3 w-20 bg-white/10 rounded mt-2" />
    <div className="h-5 w-12 bg-white/10 rounded mt-1" />
  </div>
)

// 2. High-Fidelity Skeletons matching exact layout bounds
const MetricsSkeletonGrid = () => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse">
    <MetricSkeletonCard />
    <MetricSkeletonCard />
    <MetricSkeletonCard />
    <MetricSkeletonCard />
  </div>
)

const BusinessDashboardSkeleton = () => (
  <div className="flex flex-col gap-6 animate-pulse text-left">
    <div>
      <div className="h-8 w-56 bg-white/10 rounded-lg" />
      <div className="h-3 w-80 bg-white/10 rounded mt-2" />
    </div>
    <MetricsSkeletonGrid />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 flex flex-col gap-6">
        <div className="glass-card rounded-xl p-5 border border-white/5 bg-white/[0.01] h-[340px]" />
        <div className="glass-card rounded-xl p-5 border border-white/5 bg-white/[0.01] h-[190px]" />
      </div>
      <div className="md:col-span-1 glass-card rounded-xl p-5 border border-white/5 bg-white/[0.01] h-[180px]" />
    </div>
  </div>
)

const InvestorDashboardSkeleton = () => (
  <div className="flex flex-col gap-6 animate-pulse text-left">
    <div>
      <div className="h-8 w-56 bg-white/10 rounded-lg" />
      <div className="h-3 w-80 bg-white/10 rounded mt-2" />
    </div>
    <div className="flex flex-col gap-3">
      <div className="h-4 w-40 bg-white/10 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-white/5 bg-white/[0.01] h-[122px]" />
        <div className="glass-card rounded-2xl p-4 border border-white/5 bg-white/[0.01] h-[122px]" />
      </div>
    </div>
    <div className="flex flex-col gap-3">
      <div className="h-4 w-40 bg-white/10 rounded" />
      <div className="glass-card rounded-xl p-4 border border-white/5 bg-white/[0.01] h-[142px]" />
    </div>
  </div>
)

function DashboardComponent() {
  const { currentUser, profiles, interestedBusinessIds, meetings, uploadVerificationDocs, approveVerification, rejectVerification, cofounderConnections, respondToCofounderConnection } = useStore()
  const navigate = useNavigate()

  // Layout Shift Prevention State
  const [isLoading, setIsLoading] = useState(true)
  const [gstFile, setGstFile] = useState<string>('')
  const [msmeFile, setMsmeFile] = useState<string>('')
  const [docsSubmitted, setDocsSubmitted] = useState(false)

  useEffect(() => {
    // Mimic API network latency
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 450)
    return () => clearTimeout(timer)
  }, [])

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-gray-400">Please log in to access the dashboard.</p>
        <Link to="/auth" className="px-4 py-2 bg-primary rounded-xl text-xs font-semibold">Go to Auth</Link>
      </div>
    )
  }

  const isInvestor = currentUser.role === 'INVESTOR'
  
  // Filter all business profiles
  const businesses = profiles.filter(p => p.role === 'BUSINESS')

  // Get saved businesses for investor
  const savedBusinesses = businesses.filter(b => interestedBusinessIds.includes(b.id))

  // Get meetings involving current user
  const userMeetings = meetings.filter(
    (meet) => meet.senderId === currentUser.id || meet.receiverId === currentUser.id
  )

  const handleDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    uploadVerificationDocs(currentUser.id, [gstFile, msmeFile])
    setDocsSubmitted(true)
    setTimeout(() => {
      setDocsSubmitted(false)
    }, 3000)
  }

  // Render Skeleton Loaders to prevent Layout Shifts during startup data hydration
  if (isLoading) {
    return isInvestor ? <InvestorDashboardSkeleton /> : <BusinessDashboardSkeleton />
  }

  // 1. RENDER ADMIN COMPLIANCE AUDIT COCKPIT
  if (currentUser.role === 'ADMIN') {
    const totalStartups = profiles.filter(p => p.role === 'BUSINESS').length
    const verifiedStartups = profiles.filter(p => p.role === 'BUSINESS' && p.verificationStatus === 'VERIFIED').length
    const pendingStartups = profiles.filter(p => p.role === 'BUSINESS' && p.verificationStatus === 'PENDING').length
    const totalInvestors = profiles.filter(p => p.role === 'INVESTOR').length

    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-300 text-left">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-[var(--text-app)]">Compliance & Audit Console</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">Review startup filings, verify corporate documents, and manage platform badge authorizations</p>
        </div>

        {/* Admin metrics cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-4 flex flex-col justify-between border border-[var(--border-app)] bg-[var(--card-bg)]">
            <div className="p-2 w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider mt-3">Total Startups</span>
            <span className="text-2xl font-bold text-[var(--text-app)] mt-1">{totalStartups}</span>
          </div>

          <div className="glass-card rounded-xl p-4 flex flex-col justify-between border border-[var(--border-app)] bg-[var(--card-bg)]">
            <div className="p-2 w-8 h-8 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider mt-3">Verified Badges</span>
            <span className="text-2xl font-bold text-[var(--text-app)] mt-1">{verifiedStartups}</span>
          </div>

          <div className="glass-card rounded-xl p-4 flex flex-col justify-between border border-[var(--border-app)] bg-[var(--card-bg)]">
            <div className="p-2 w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider mt-3">Pending Audits</span>
            <span className="text-2xl font-bold text-[var(--text-app)] mt-1 animate-pulse">{pendingStartups}</span>
          </div>

          <div className="glass-card rounded-xl p-4 flex flex-col justify-between border border-[var(--border-app)] bg-[var(--card-bg)]">
            <div className="p-2 w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider mt-3">Total Investors</span>
            <span className="text-2xl font-bold text-[var(--text-app)] mt-1">{totalInvestors}</span>
          </div>
        </div>

        {/* Corporate Filings Audit Queue */}
        <section className="flex flex-col gap-4">
          <h3 className="font-semibold text-xs text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-primary" /> Startup Corporate Filings Queue
          </h3>

          <div className="flex flex-col gap-4">
            {profiles.filter(p => p.role === 'BUSINESS').map((biz) => {
              return (
                <div key={biz.id} className="glass-card rounded-2xl p-5 border border-[var(--border-app)] flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img 
                      src={biz.avatarUrl} 
                      alt={biz.displayName}
                      className="w-12 h-12 rounded-xl object-cover border border-[var(--border-app)] bg-white/5 aspect-square"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[var(--text-app)]">{biz.displayName}</h4>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border ${
                          biz.verificationStatus === 'VERIFIED'
                            ? 'bg-green-500/10 border-green-500/30 text-green-500'
                            : biz.verificationStatus === 'PENDING'
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 animate-pulse'
                            : biz.verificationStatus === 'REJECTED'
                            ? 'bg-red-500/10 border-red-500/30 text-red-500'
                            : 'bg-gray-500/10 border-gray-500/30 text-gray-500'
                        }`}>
                          {biz.verificationStatus}
                        </span>
                      </div>
                      <span className="text-[10px] text-primary font-medium block mt-0.5">{biz.companyName} • {biz.industry}</span>
                      <p className="text-xs text-[var(--text-muted)] mt-1.5 max-w-xl">{biz.description}</p>
                    </div>
                  </div>

                  {/* Audit Actions */}
                  <div className="w-full md:w-auto flex flex-col gap-3 justify-end items-stretch md:items-end border-t md:border-t-0 pt-4 md:pt-0 border-[var(--border-app)]">
                    {biz.verificationStatus === 'PENDING' && (
                      <div className="flex flex-col gap-2">
                        {/* Mock PDF document links */}
                        <div className="flex items-center gap-2 mb-1.5 justify-end">
                          <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" /> GST-Filings.pdf
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" /> MSME-Certificate.pdf
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveVerification(biz.id)}
                            className="px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white font-medium text-xs transition-all cursor-pointer shadow-lg shadow-green-600/10"
                          >
                            Approve Verify
                          </button>
                          <button
                            onClick={() => rejectVerification(biz.id)}
                            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-xs transition-all cursor-pointer shadow-lg shadow-red-600/10"
                          >
                            Reject Filings
                          </button>
                        </div>
                      </div>
                    )}

                    {biz.verificationStatus === 'VERIFIED' && (
                      <div className="flex items-center gap-2.5">
                        <span className="text-[11px] text-green-500 flex items-center gap-1 font-semibold">
                          <CheckCircle className="w-4 h-4 text-green-500" /> Active Verified Badge
                        </span>
                        <button
                          onClick={() => rejectVerification(biz.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-[var(--border-app)] hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 text-[var(--text-muted)] text-[10px] transition-all cursor-pointer"
                        >
                          Revoke Badge
                        </button>
                      </div>
                    )}

                    {(biz.verificationStatus === 'REJECTED' || (biz.verificationStatus !== 'PENDING' && biz.verificationStatus !== 'VERIFIED')) && (
                      <div className="flex items-center gap-2.5">
                        <span className="text-[11px] text-red-500 flex items-center gap-1 font-semibold">
                          <Shield className="w-4 h-4 text-red-500" /> Audit Rejected
                        </span>
                        <button
                          onClick={() => approveVerification(biz.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-primary/20 border border-primary/30 hover:bg-primary/30 text-primary text-[10px] transition-all cursor-pointer"
                        >
                          Verify Manually
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    )
  }

  // 2. RENDER MENTOR ADVISORY COCKPIT
  if (currentUser.role === 'MENTOR') {
    const mentorMeetings = meetings.filter(
      (meet) => meet.senderId === currentUser.id || meet.receiverId === currentUser.id
    )
    const activeAudits = profiles.filter(p => p.role === 'BUSINESS' && p.verificationStatus === 'PENDING')

    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-300 text-left">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-[var(--text-app)]">Mentor Advisory Console</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">Review scheduled office hours, inspect pitch decks, and manage your advisory consulting sessions</p>
        </div>

        {/* Mentor metrics cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-4 flex flex-col justify-between border border-[var(--border-app)] bg-[var(--card-bg)]">
            <div className="p-2 w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider mt-3 font-display">Total Bookings</span>
            <span className="text-2xl font-bold text-[var(--text-app)] mt-1">{mentorMeetings.length}</span>
          </div>

          <div className="glass-card rounded-xl p-4 flex flex-col justify-between border border-[var(--border-app)] bg-[var(--card-bg)]">
            <div className="p-2 w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider mt-3 font-display">Advisory Rating</span>
            <span className="text-2xl font-bold text-[var(--text-app)] mt-1">4.9 / 5</span>
          </div>

          <div className="glass-card rounded-xl p-4 flex flex-col justify-between border border-[var(--border-app)] bg-[var(--card-bg)]">
            <div className="p-2 w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider mt-3 font-display">Audits Pending</span>
            <span className="text-2xl font-bold text-[var(--text-app)] mt-1">{activeAudits.length}</span>
          </div>

          <div className="glass-card rounded-xl p-4 flex flex-col justify-between border border-[var(--border-app)] bg-[var(--card-bg)]">
            <div className="p-2 w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider mt-3 font-display">Consulting Rate</span>
            <span className="text-2xl font-bold text-[var(--text-app)] mt-1">${currentUser.hourlyRate || 150}/Hr</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Office Hours Booking slots */}
          <div className="md:col-span-2 glass-card rounded-xl p-5 border border-[var(--border-app)] flex flex-col gap-4">
            <h3 className="font-semibold text-sm border-b border-[var(--border-app)] pb-2 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-emerald-400" /> Mentorship Appointments</h3>
            {mentorMeetings.length > 0 ? (
              <div className="flex flex-col gap-3">
                {mentorMeetings.map((meet) => {
                  const partner = profiles.find(p => p.id === (meet.senderId === currentUser.id ? meet.receiverId : meet.senderId))
                  return (
                    <div key={meet.id} className="p-3 rounded-xl bg-white/5 border border-[var(--border-app)] flex justify-between items-center h-[68px]">
                      <div className="flex items-center gap-3">
                        <img 
                          src={partner?.avatarUrl} 
                          alt={partner?.displayName} 
                          className="w-9 h-9 rounded-full object-cover border border-white/10 bg-white/5 aspect-square"
                        />
                        <div className="text-left">
                          <span className="font-semibold text-[var(--text-app)] text-xs block">{partner?.displayName}</span>
                          <span className="text-[9px] text-[var(--text-muted)]">{partner?.companyName}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[var(--text-app)] text-xs font-semibold block">{new Date(meet.scheduledTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        <span className="text-[9px] text-[var(--text-muted)]">{new Date(meet.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-[var(--text-muted)] flex items-center justify-center flex-1">
                No mentorship appointments scheduled.
              </div>
            )}
          </div>

          {/* Right Column: Pitches requesting Mentor audit */}
          <div className="md:col-span-1 glass-card rounded-xl p-5 border border-[var(--border-app)] flex flex-col gap-4">
            <h3 className="font-semibold text-sm border-b border-[var(--border-app)] pb-2 flex items-center gap-1.5"><FileText className="w-4 h-4 text-amber-400" /> Pitch Deck Audit Inquiries</h3>
            <div className="flex flex-col gap-3">
              {activeAudits.length > 0 ? (
                activeAudits.map((biz) => (
                  <div key={biz.id} className="p-3 rounded-xl bg-white/5 border border-[var(--border-app)] flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <img 
                        src={biz.avatarUrl} 
                        alt={biz.displayName}
                        className="w-7 h-7 rounded-lg object-cover aspect-square"
                      />
                      <span className="text-xs font-semibold text-[var(--text-app)] truncate">{biz.displayName}</span>
                    </div>
                    <a 
                      href={biz.pitchDeckUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-primary hover:underline font-semibold flex items-center gap-1 mt-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" /> Download Deck PDF
                    </a>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-[var(--text-muted)]">
                  No pending audit requests.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 3. RENDER ENTREPRENEUR CO-FOUNDER COCKPIT
  if (currentUser.role === 'ENTREPRENEUR') {
    const myConnections = cofounderConnections.filter(c => c.entrepreneurId === currentUser.id)
    const myMeetings = meetings.filter(
      (meet) => meet.senderId === currentUser.id || meet.receiverId === currentUser.id
    )

    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-300 text-left">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-[var(--text-app)]">Co-founder Match Console</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">Track executive requests, manage startup matches, and schedule operator interviews</p>
        </div>

        {/* Entrepreneur metrics cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-4 flex flex-col justify-between border border-[var(--border-app)] bg-[var(--card-bg)]">
            <div className="p-2 w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider mt-3 font-display">Matches</span>
            <span className="text-2xl font-bold text-[var(--text-app)] mt-1">{myConnections.length}</span>
          </div>

          <div className="glass-card rounded-xl p-4 flex flex-col justify-between border border-[var(--border-app)] bg-[var(--card-bg)]">
            <div className="p-2 w-8 h-8 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider mt-3 font-display">Promised Equity</span>
            <span className="text-2xl font-bold text-[var(--text-app)] mt-1">Avg 12%</span>
          </div>

          <div className="glass-card rounded-xl p-4 flex flex-col justify-between border border-[var(--border-app)] bg-[var(--card-bg)]">
            <div className="p-2 w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider mt-3 font-display">Interviews</span>
            <span className="text-2xl font-bold text-[var(--text-app)] mt-1">{myMeetings.length}</span>
          </div>

          <div className="glass-card rounded-xl p-4 flex flex-col justify-between border border-[var(--border-app)] bg-[var(--card-bg)]">
            <div className="p-2 w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider mt-3 font-display">My Experience</span>
            <span className="text-2xl font-bold text-[var(--text-app)] mt-1">{currentUser.yearsExperience || 8} Yrs</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Cofounder Match Requests */}
          <div className="md:col-span-2 glass-card rounded-xl p-5 border border-[var(--border-app)] flex flex-col gap-4">
            <h3 className="font-semibold text-sm border-b border-[var(--border-app)] pb-2 flex items-center gap-1.5"><Users className="w-4 h-4 text-cyan-400" /> Active Startup Invitations</h3>
            {myConnections.length > 0 ? (
              <div className="flex flex-col gap-4">
                {myConnections.map((conn) => {
                  const startup = profiles.find(p => p.id === conn.startupId)
                  return (
                    <div key={conn.id} className="p-4 rounded-xl bg-white/5 border border-[var(--border-app)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-3 text-left">
                        <img 
                          src={startup?.avatarUrl} 
                          alt={startup?.displayName} 
                          className="w-10 h-10 rounded-xl object-cover border border-white/10 aspect-square"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[var(--text-app)] text-sm">{startup?.displayName}</span>
                            <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              conn.status === 'MATCHED' 
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                : conn.status === 'DECLINED'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                            }`}>
                              {conn.status}
                            </span>
                          </div>
                          <span className="text-[10px] text-primary font-medium block mt-0.5">{startup?.companyName} • {startup?.industry}</span>
                        </div>
                      </div>

                      {conn.status === 'PENDING' && (
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => respondToCofounderConnection(conn.id, 'MATCHED')}
                            className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-[10px] transition-all cursor-pointer"
                          >
                            Accept Match
                          </button>
                          <button
                            onClick={() => respondToCofounderConnection(conn.id, 'DECLINED')}
                            className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-white/5 border border-[var(--border-app)] hover:bg-red-500/10 hover:text-red-400 font-semibold text-[10px] transition-all cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-[var(--text-muted)] flex items-center justify-center flex-1">
                No active invitations yet. Startups can request to join you from the Discover tab.
              </div>
            )}
          </div>

          {/* Right Column: Scheduled Interviews */}
          <div className="md:col-span-1 glass-card rounded-xl p-5 border border-[var(--border-app)] flex flex-col gap-4">
            <h3 className="font-semibold text-sm border-b border-[var(--border-app)] pb-2 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary" /> Interview Calendar</h3>
            <div className="flex flex-col gap-3">
              {myMeetings.length > 0 ? (
                myMeetings.map((meet) => {
                  const partner = profiles.find(p => p.id === (meet.senderId === currentUser.id ? meet.receiverId : meet.senderId))
                  return (
                    <div key={meet.id} className="p-3 rounded-xl bg-white/5 border border-[var(--border-app)] flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <img 
                          src={partner?.avatarUrl} 
                          alt={partner?.displayName}
                          className="w-7 h-7 rounded-full object-cover aspect-square"
                        />
                        <span className="text-xs font-semibold text-[var(--text-app)] truncate">{partner?.displayName}</span>
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] block font-mono">
                        {new Date(meet.scheduledTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-6 text-xs text-[var(--text-muted)]">
                  No interview slots booked.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 2. RENDER INVESTOR COCKPIT
  if (isInvestor) {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in duration-300 text-left">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-white">Investor Dashboard</h2>
          <p className="text-xs text-gray-400 mt-1">Review your matches, tracked deals, and appointments</p>
        </div>

        {/* Saved Companies Section */}
        <section className="flex flex-col gap-3">
          <h3 className="font-semibold text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-primary" /> Tracked Businesses ({savedBusinesses.length})</h3>
          {savedBusinesses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedBusinesses.map((biz) => (
                <div key={biz.id} className="glass-card rounded-2xl p-4 flex gap-4 border border-white/5 relative min-h-[122px] max-h-[122px] overflow-hidden">
                  <img 
                    src={biz.avatarUrl} 
                    alt={biz.displayName} 
                    className="w-12 h-12 rounded-xl object-cover bg-white/5 border border-white/10 aspect-square"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-white truncate leading-snug">{biz.displayName}</h4>
                      <span className="text-[10px] text-primary font-medium block">{biz.industry} • {biz.location}</span>
                      <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{biz.description}</p>
                    </div>
                    
                    <div className="flex justify-between items-center pt-1.5 border-t border-white/5">
                      <span className="text-[10px] font-bold text-white">${biz.fundingRequired?.toLocaleString()} required</span>
                      <Link to="/profile/$profileId" params={{ profileId: biz.id }} className="text-[10px] text-accent font-semibold underline">View Profile</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-8 text-center text-gray-500 border border-white/10 min-h-[122px] flex items-center justify-center">
              <div>
                No businesses tracked yet. Go to <Link to="/reels" className="text-primary underline">PitchReels</Link> to discover startups!
              </div>
            </div>
          )}
        </section>

        {/* Upcoming Meetings Section */}
        <section className="flex flex-col gap-3">
          <h3 className="font-semibold text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><Calendar className="w-4 h-4 text-accent" /> Upcoming Meetings</h3>
          {userMeetings.length > 0 ? (
            <div className="flex flex-col gap-3">
              {userMeetings.map((meet) => {
                const partner = profiles.find(p => p.id === (meet.senderId === currentUser.id ? meet.receiverId : meet.senderId))
                return (
                  <div key={meet.id} className="glass-card rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-white/5 min-h-[72px]">
                    <div className="flex items-center gap-3">
                      <img 
                        src={partner?.avatarUrl} 
                        alt={partner?.displayName} 
                        className="w-9 h-9 rounded-full object-cover border border-white/10 bg-white/5 aspect-square"
                      />
                      <div>
                        <h4 className="font-semibold text-sm text-white">{partner?.displayName}</h4>
                        <span className="text-[10px] text-gray-400 block">{partner?.companyName}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-1">
                      <span className="text-xs font-semibold text-white">{new Date(meet.scheduledTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-[10px] text-gray-500">{meet.isOnline ? 'Online Video Meeting' : 'Physical Location'}</span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      {meet.status}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-8 text-center text-gray-500 border border-white/10 min-h-[142px] flex items-center justify-center">
              <div>
                No meetings scheduled. Start a conversation in <Link to="/chat" className="text-primary underline">Chat</Link> to invite founders.
              </div>
            </div>
          )}
        </section>
      </div>
    )
  }

  // 2. RENDER BUSINESS COCKPIT
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 text-left">
      <div>
        <h2 className="font-display font-extrabold text-2xl text-white">Business Dashboard</h2>
        <p className="text-xs text-gray-400 mt-1">Monitor profile views, investor engagements, and compliance badges</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-xl p-4 flex flex-col justify-between border border-white/5 bg-white/[0.01] h-[98px]">
          <Eye className="w-5 h-5 text-primary" />
          <div className="mt-1">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold block">Profile Views</span>
            <span className="text-lg font-extrabold text-white">1,240</span>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4 flex flex-col justify-between border border-white/5 bg-white/[0.01] h-[98px]">
          <BarChart3 className="w-5 h-5 text-accent" />
          <div className="mt-1">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold block">Reel Views</span>
            <span className="text-lg font-extrabold text-white">3,400</span>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4 flex flex-col justify-between border border-white/5 bg-white/[0.01] h-[98px]">
          <Users className="w-5 h-5 text-green-400" />
          <div className="mt-1">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold block">Interested Investors</span>
            <span className="text-lg font-extrabold text-white">12</span>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4 flex flex-col justify-between border border-white/5 bg-white/[0.01] h-[98px]">
          <Shield className="w-5 h-5 text-amber-400" />
          <div className="mt-1">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold block">Badge Status</span>
            <span className={`text-xs font-extrabold uppercase ${
              currentUser.verificationStatus === 'VERIFIED' ? 'text-green-400' : 'text-amber-400'
            }`}>
              {currentUser.verificationStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column Verification & Meetings, Right Column Investor List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Area: Document Verification Form & Meetings */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Compliance & Verification Portal */}
          <div className="glass-card rounded-xl p-5 border border-white/5 flex flex-col gap-4 min-h-[340px] justify-between">
            <div>
              <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-3">
                <Shield className="w-5 h-5 text-green-400" />
                <h3 className="font-semibold text-sm text-white">Document Compliance Portal</h3>
              </div>
              
              {currentUser.verificationStatus === 'VERIFIED' ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
                  <CheckCircle className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <span className="font-bold block">Company Verified Badge Active!</span>
                    <span>GST registration, MSME filings, and Startup certification checked successfully.</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleDocumentSubmit} className="flex flex-col gap-4">
                  <p className="text-xs text-gray-400">
                    Upload PDF scan documents to acquire the <strong>Verified Badge</strong> on your public cards.
                  </p>

                  {docsSubmitted && (
                    <div className="p-3 rounded-lg bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                      <CheckCircle className="w-4 h-4" /> Files uploaded. Verification status changed to Pending.
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                      <input 
                        type="text" 
                        placeholder="GST Number (e.g. 29AAAAA0000A1Z5)"
                        value={gstFile}
                        onChange={(e) => setGstFile(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-gray-500"
                      />
                    </div>

                    <div className="relative">
                      <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                      <input 
                        type="text" 
                        placeholder="MSME / Startup India Registration ID"
                        value={msmeFile}
                        onChange={(e) => setMsmeFile(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-gray-500"
                      />
                    </div>

                    <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:bg-white/[0.02] transition-colors cursor-pointer flex flex-col items-center gap-2">
                      <Upload className="w-6 h-6 text-gray-500" />
                      <span className="text-xs font-medium text-gray-300">Upload Incorporation Certs (PDF)</span>
                      <span className="text-[10px] text-gray-500">Max file size 5MB</span>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-primary/10"
                  >
                    <Shield className="w-4 h-4" /> Submit Documents for Audit
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Upcoming Meetings List */}
          <div className="glass-card rounded-xl p-5 border border-white/5 flex flex-col gap-4 min-h-[190px]">
            <h3 className="font-semibold text-sm border-b border-white/5 pb-2">Calendar Appointments</h3>
            {userMeetings.length > 0 ? (
              <div className="flex flex-col gap-3">
                {userMeetings.map((meet) => {
                  const partner = profiles.find(p => p.id === (meet.senderId === currentUser.id ? meet.receiverId : meet.senderId))
                  return (
                    <div key={meet.id} className="p-3 rounded-lg bg-white/5 border border-white/5 flex justify-between items-center text-xs h-[52px]">
                      <div>
                        <span className="font-semibold text-white block">{partner?.displayName}</span>
                        <span className="text-[10px] text-gray-400">{partner?.companyName}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-medium block">{new Date(meet.scheduledTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        <span className="text-[10px] text-gray-500">{new Date(meet.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-gray-600 flex items-center justify-center flex-1">
                No scheduled meetings.
              </div>
            )}
          </div>

        </div>

        {/* Right Area: Interested Investors List */}
        <div className="md:col-span-1 glass-card rounded-xl p-5 border border-white/5 flex flex-col gap-4 min-h-[180px]">
          <h3 className="font-semibold text-sm border-b border-white/5 pb-2">Interested Investors</h3>
          
          <div className="flex flex-col gap-3">
            {/* Show Anita Singh as the mock interested investor */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3 h-[68px]">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80" 
                alt="Anita Singh" 
                className="w-9 h-9 rounded-full object-cover border border-white/10 aspect-square"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-xs text-white truncate">Anita Singh</h4>
                <span className="text-[9px] text-primary font-medium block truncate">VentureScale Capital</span>
                <span className="text-[9px] text-gray-500">Seed / Series A</span>
              </div>
              <button 
                onClick={() => navigate({ to: '/chat' })}
                className="p-2 rounded-lg bg-primary/20 text-primary border border-primary/20 hover:bg-primary/30 transition-colors cursor-pointer"
              >
                Chat
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
