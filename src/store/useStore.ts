import { create } from 'zustand'

export type UserRole = 'BUSINESS' | 'INVESTOR' | 'ADMIN' | 'MENTOR' | 'ENTREPRENEUR'
export type VerifyStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'
export type MeetingStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED'

export interface Profile {
  id: string
  role: UserRole
  displayName: string
  location: string
  avatarUrl: string
  description: string
  verificationStatus: VerifyStatus
  
  // Business specific
  companyName?: string
  founderName?: string
  industry?: string
  establishedYear?: number
  coverImageUrl?: string
  pitchDeckUrl?: string
  fundingRequired?: number
  equityOffered?: number
  revenue?: number
  profit?: number
  growthRate?: number
  employeeCount?: number
  revenueHistory?: { year: string; revenue: number; profit: number }[]

  // Investor specific
  preferredIndustries?: string[]
  investmentMin?: number
  investmentMax?: number
  preferredStage?: string

  // Mentor specific
  domainExpertise?: string[]
  hourlyRate?: number
  advisoryRolesHeld?: number

  // Entrepreneur specific
  primarySkills?: string[]
  yearsExperience?: number
  equityExpectationRange?: string
}

export interface PitchReel {
  id: string
  businessId: string
  videoUrl: string
  caption: string
  viewCount: number
  interestedCount: number
}

export interface ChatMessage {
  id: string
  senderId: string
  receiverId: string
  content: string
  createdAt: string
}

export interface Meeting {
  id: string
  senderId: string
  receiverId: string
  scheduledTime: string
  isOnline: boolean
  status: MeetingStatus
  meetingLink?: string
  type?: 'INVESTMENT' | 'MENTORSHIP' | 'COFOUNDER'
}

export interface CofounderConnection {
  id: string
  startupId: string
  entrepreneurId: string
  status: 'PENDING' | 'MATCHED' | 'DECLINED'
  createdAt: string
}

interface AppState {
  currentUser: Profile | null
  profiles: Profile[]
  reels: PitchReel[]
  messages: ChatMessage[]
  meetings: Meeting[]
  cofounderConnections: CofounderConnection[]
  interestedBusinessIds: string[]
  
  // Actions
  login: (role: UserRole, email: string) => void
  logout: () => void
  updateProfile: (data: Partial<Profile>) => void
  toggleInterest: (businessId: string) => void
  sendChatMessage: (receiverId: string, content: string) => void
  scheduleMeeting: (meeting: Omit<Meeting, 'id' | 'senderId' | 'status'>) => void
  addPitchReel: (videoUrl: string, caption: string) => void
  uploadVerificationDocs: (businessId: string, docUrls: string[]) => void
  approveVerification: (businessId: string) => void
  rejectVerification: (businessId: string) => void
  requestCofounderConnection: (startupId: string, entrepreneurId: string) => void
  respondToCofounderConnection: (connectionId: string, status: 'MATCHED' | 'DECLINED') => void
}

// High-Fidelity Mock Seed Data
const mockProfiles: Profile[] = [
  {
    id: 'p-1',
    role: 'BUSINESS',
    displayName: 'Aura Biotech',
    companyName: 'Aura Biotech Labs Inc.',
    founderName: 'Dr. Siddharth Sen',
    location: 'Bangalore, India',
    avatarUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=150&h=150&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=800&q=80',
    description: 'Developing next-generation targeted immunotherapies for oncology using CRISPR technology. Our proprietary platform reduces therapeutic side-effects by 70%.',
    verificationStatus: 'VERIFIED',
    industry: 'Biotech',
    establishedYear: 2023,
    pitchDeckUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fundingRequired: 750000,
    equityOffered: 8.5,
    revenue: 120000,
    profit: -45000,
    growthRate: 145,
    employeeCount: 12,
    revenueHistory: [
      { year: '2023', revenue: 20000, profit: -80000 },
      { year: '2024', revenue: 50000, profit: -60000 },
      { year: '2025', revenue: 120000, profit: -45000 }
    ]
  },
  {
    id: 'p-2',
    role: 'BUSINESS',
    displayName: 'Solaris Grid',
    companyName: 'Solaris Decentralized Energy',
    founderName: 'Rohan Mehta',
    location: 'Mumbai, India',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    description: 'Decentralized peer-to-peer solar energy trading networks powered by smart contracts. Enabling local communities to sell excess grid storage to nearby enterprises.',
    verificationStatus: 'PENDING',
    industry: 'CleanTech',
    establishedYear: 2024,
    pitchDeckUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fundingRequired: 1200000,
    equityOffered: 12,
    revenue: 450000,
    profit: 85000,
    growthRate: 210,
    employeeCount: 24,
    revenueHistory: [
      { year: '2024', revenue: 150000, profit: -10000 },
      { year: '2025', revenue: 450000, profit: 85000 }
    ]
  },
  {
    id: 'p-3',
    role: 'BUSINESS',
    displayName: 'ByteFlow AI',
    companyName: 'ByteFlow Software Systems',
    founderName: 'Neha Nair',
    location: 'Chennai, India',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    description: 'Autonomous AI agents for hyper-personalized marketing and sales funnels. Integrating directly with CRM architectures to automate cold outreach and conversions.',
    verificationStatus: 'VERIFIED',
    industry: 'SaaS',
    establishedYear: 2022,
    pitchDeckUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fundingRequired: 500000,
    equityOffered: 5,
    revenue: 680000,
    profit: 210000,
    growthRate: 85,
    employeeCount: 18,
    revenueHistory: [
      { year: '2023', revenue: 220000, profit: 40000 },
      { year: '2024', revenue: 410000, profit: 110000 },
      { year: '2025', revenue: 680000, profit: 210000 }
    ]
  },
  {
    id: 'p-inv',
    role: 'INVESTOR',
    displayName: 'Anita Singh',
    location: 'Bangalore, India',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    description: 'Managing Partner at VentureScale Capital. Focused on Seed to Series A CleanTech and HealthTech companies. Supporting founders with enterprise go-to-market strategies.',
    verificationStatus: 'VERIFIED',
    companyName: 'VentureScale Capital',
    preferredIndustries: ['Biotech', 'CleanTech', 'SaaS'],
    investmentMin: 250000,
    investmentMax: 2000000,
    preferredStage: 'Seed / Series A'
  },
  {
    id: 'p-admin',
    role: 'ADMIN',
    displayName: 'Admin Console',
    location: 'Global Control Room',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
    description: 'Connexion platform master administrator. Authorizes verified startup badges, monitors system metrics, and oversees compliance documents audit.',
    verificationStatus: 'VERIFIED'
  },
  {
    id: 'p-mentor',
    role: 'MENTOR',
    displayName: 'Vikram Malhotra',
    location: 'Mumbai, India',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    description: 'Former VP of Product at Razorpay. Helping fintech and SaaS startups scale from 0 to 10M ARR. Specialize in GTM strategy and pricing optimization.',
    verificationStatus: 'VERIFIED',
    preferredIndustries: ['Fintech', 'SaaS'],
    domainExpertise: ['Product Strategy', 'Fintech ScaleUp', 'Pricing Models'],
    hourlyRate: 150,
    advisoryRolesHeld: 8
  },
  {
    id: 'p-entrepreneur',
    role: 'ENTREPRENEUR',
    displayName: 'Devendra Sharma',
    location: 'Delhi, India',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    description: 'Full-Stack developer and serial builder. Built and sold an edtech micro-SaaS. Looking to join a CleanTech or BioTech startup as technical co-founder.',
    verificationStatus: 'VERIFIED',
    primarySkills: ['React', 'Node.js', 'Solidity', 'System Architecture'],
    yearsExperience: 8,
    equityExpectationRange: '5% - 15%'
  }
]

const mockReels: PitchReel[] = [
  {
    id: 'r-1',
    businessId: 'p-1',
    videoUrl: 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054ba208d130a055307a008db64d5eb&profile_id=139&oauth2_token_id=57447761',
    caption: 'Curious how we cure cancers? Dr. Siddharth breaks down our CRISPR delivery vehicle in 45 seconds. 🧬 #biotech #seedround',
    viewCount: 1240,
    interestedCount: 38
  },
  {
    id: 'r-2',
    businessId: 'p-2',
    videoUrl: 'https://player.vimeo.com/external/481977759.sd.mp4?s=d001eb7054bf93f545a90ee9a9ad8f553a067570&profile_id=165&oauth2_token_id=57447761',
    caption: 'Selling excess energy to your local factory on-demand. Here is how Solaris is disrupting clean energy grids. ☀️🔋 #cleanenergy #sharktank',
    viewCount: 940,
    interestedCount: 15
  },
  {
    id: 'r-3',
    businessId: 'p-3',
    videoUrl: 'https://player.vimeo.com/external/435649392.sd.mp4?s=564ab10fa4a8b7c7fa6e2dc0883f3e1291ecda53&profile_id=165&oauth2_token_id=57447761',
    caption: 'Watch an AI agent close a $10k enterprise deal autonomously using ByteFlow. 🚀🤖 #futureofwork #saas',
    viewCount: 3400,
    interestedCount: 82
  }
]

const mockMessages: ChatMessage[] = [
  {
    id: 'm-1',
    senderId: 'p-1',
    receiverId: 'p-inv',
    content: 'Hi Anita, thanks for connecting! Let me know if you would like me to share our full clinical trials timeline.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'm-2',
    senderId: 'p-inv',
    receiverId: 'p-1',
    content: 'Dr. Siddharth, the science looks solid. I am especially interested in your CRISPR delivery efficiency. Let us schedule a chat next week.',
    createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString()
  }
]

export const useStore = create<AppState>((set) => ({
  currentUser: mockProfiles[3], // Defaults logged in as Anita Singh (Investor)
  profiles: mockProfiles,
  reels: mockReels,
  messages: mockMessages,
  meetings: [],
  cofounderConnections: [],
  interestedBusinessIds: ['p-1'], // Initially marked interested in Aura Biotech

  login: (role, email) => {
    // If logging in, fetch matched role user from mock profiles
    const matched = mockProfiles.find(p => p.role === role) || {
      id: `p-${Math.random().toString(36).substr(2, 9)}`,
      role,
      displayName: email.split('@')[0],
      location: 'New Delhi, India',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
      description: 'New platform member.',
      verificationStatus: 'PENDING'
    }
    set({ currentUser: matched })
  },
  
  logout: () => set({ currentUser: null }),
  
  updateProfile: (data) => set((state) => {
    if (!state.currentUser) return {}
    const updatedUser = { ...state.currentUser, ...data }
    const updatedProfiles = state.profiles.map(p => p.id === state.currentUser?.id ? updatedUser : p)
    return { currentUser: updatedUser, profiles: updatedProfiles }
  }),

  toggleInterest: (businessId) => set((state) => {
    const interested = state.interestedBusinessIds.includes(businessId)
    const newInterested = interested 
      ? state.interestedBusinessIds.filter(id => id !== businessId)
      : [...state.interestedBusinessIds, businessId]
    
    const updatedReels = state.reels.map(reel => {
      if (reel.businessId === businessId) {
        return {
          ...reel,
          interestedCount: reel.interestedCount + (interested ? -1 : 1)
        }
      }
      return reel
    })

    return {
      interestedBusinessIds: newInterested,
      reels: updatedReels
    }
  }),

  sendChatMessage: (receiverId, content) => set((state) => {
    if (!state.currentUser) return {}
    const newMsg: ChatMessage = {
      id: `m-${Math.random().toString(36).substr(2, 9)}`,
      senderId: state.currentUser.id,
      receiverId,
      content,
      createdAt: new Date().toISOString()
    }
    return {
      messages: [...state.messages, newMsg]
    }
  }),

  scheduleMeeting: (meetingData) => set((state) => {
    if (!state.currentUser) return {}
    const newMeeting: Meeting = {
      id: `meet-${Math.random().toString(36).substr(2, 9)}`,
      senderId: state.currentUser.id,
      status: 'PENDING',
      ...meetingData
    }
    return {
      meetings: [...state.meetings, newMeeting]
    }
  }),

  addPitchReel: (videoUrl, caption) => set((state) => {
    if (!state.currentUser) return {}
    const newReel: PitchReel = {
      id: `r-${Math.random().toString(36).substr(2, 9)}`,
      businessId: state.currentUser.id,
      videoUrl,
      caption,
      viewCount: 0,
      interestedCount: 0
    }
    return {
      reels: [newReel, ...state.reels]
    }
  }),

  uploadVerificationDocs: (businessId, _docUrls) => set((state) => {
    const updatedProfiles = state.profiles.map(p => {
      if (p.id === businessId) {
        return { ...p, verificationStatus: 'PENDING' as VerifyStatus }
      }
      return p
    })
    
    const updatedUser = state.currentUser?.id === businessId 
      ? { ...state.currentUser, verificationStatus: 'PENDING' as VerifyStatus }
      : state.currentUser

    return {
      profiles: updatedProfiles,
      currentUser: updatedUser
    }
  }),

  approveVerification: (businessId) => set((state) => {
    const updatedProfiles = state.profiles.map(p => 
      p.id === businessId ? { ...p, verificationStatus: 'VERIFIED' as VerifyStatus } : p
    )
    const updatedUser = state.currentUser?.id === businessId 
      ? { ...state.currentUser, verificationStatus: 'VERIFIED' as VerifyStatus }
      : state.currentUser
    return { profiles: updatedProfiles, currentUser: updatedUser }
  }),

  rejectVerification: (businessId) => set((state) => {
    const updatedProfiles = state.profiles.map(p => 
      p.id === businessId ? { ...p, verificationStatus: 'REJECTED' as VerifyStatus } : p
    )
    const updatedUser = state.currentUser?.id === businessId 
      ? { ...state.currentUser, verificationStatus: 'REJECTED' as VerifyStatus }
      : state.currentUser
    return { profiles: updatedProfiles, currentUser: updatedUser }
  }),

  requestCofounderConnection: (startupId, entrepreneurId) => set((state) => {
    const exists = state.cofounderConnections.some(
      c => c.startupId === startupId && c.entrepreneurId === entrepreneurId
    )
    if (exists) return {}

    const newConnection: CofounderConnection = {
      id: `cf-${Math.random().toString(36).substr(2, 9)}`,
      startupId,
      entrepreneurId,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    }
    return {
      cofounderConnections: [...state.cofounderConnections, newConnection]
    }
  }),

  respondToCofounderConnection: (connectionId, status) => set((state) => {
    const updated = state.cofounderConnections.map(c => 
      c.id === connectionId ? { ...c, status } : c
    )
    return {
      cofounderConnections: updated
    }
  })
}))
