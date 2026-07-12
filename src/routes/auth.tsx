import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Briefcase, Coins, ArrowRight, ArrowLeft, ShieldCheck, Mail, Lock, User, MapPin, Shield, Compass, Users } from 'lucide-react'

export const Route = createFileRoute('/auth')({
  component: AuthComponent,
})

type UserRole = 'BUSINESS' | 'INVESTOR' | 'ADMIN' | 'MENTOR' | 'ENTREPRENEUR' | null
type AuthMode = 'LOGIN' | 'SIGNUP'

function AuthComponent() {
  const navigate = useNavigate()
  const { login, updateProfile } = useStore()
  const [role, setRole] = useState<UserRole>(null)
  const [mode, setMode] = useState<AuthMode>('LOGIN')
  const [step, setStep] = useState<number>(1) // 1: Role, 2: Credentials, 3: Profile Info (only for Sign Up)

  // Auth & Profile Form States
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [location, setLocation] = useState('')
  const [industry, setIndustry] = useState('')
  const [description, setDescription] = useState('')
  const [investmentMin, setInvestmentMin] = useState('')
  const [investmentMax, setInvestmentMax] = useState('')
  
  // Validation Error Display State
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleNextStep = () => {
    if (step === 1 && role) {
      setStep(2)
    } else if (step === 2) {
      if (mode === 'LOGIN') {
        // Execute mock Login with role check
        login(role || 'BUSINESS', email)
        if (role === 'ADMIN' || role === 'MENTOR' || role === 'ENTREPRENEUR') {
          navigate({ to: '/dashboard' })
        } else {
          navigate({ to: '/home' })
        }
      } else {
        // Admins don't need signup details, redirect directly
        if (role === 'ADMIN') {
          login('ADMIN', email)
          navigate({ to: '/dashboard' })
        } else {
          setStep(3)
        }
      }
    }
  }

  const handlePrevStep = () => {
    if (step > 1) {
      setValidationError(null)
      setStep(step - 1)
    }
  }

  const handleFinishSignup = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    // Dynamic Range validation & sanitize for investor onboarding
    if (role === 'INVESTOR') {
      const min = Number(investmentMin)
      const max = Number(investmentMax)

      if (isNaN(min) || isNaN(max)) {
        setValidationError('Investment boundaries must be valid numeric values.')
        return
      }

      if (min <= 0) {
        setValidationError('Minimum investment must be greater than zero.')
        return
      }

      if (min >= max) {
        setValidationError('Minimum investment range must be strictly less than maximum range.')
        return
      }
    }

    // Sanitize comma-separated target industries array tags
    const sanitizedIndustries = industry
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)

    if ((role === 'INVESTOR' || role === 'MENTOR' || role === 'ENTREPRENEUR') && sanitizedIndustries.length === 0) {
      setValidationError('Please specify at least one target tag/industry/skill.')
      return
    }

    // Complete Onboarding transaction
    login(role || 'BUSINESS', email)
    
    if (role === 'BUSINESS') {
      updateProfile({
        displayName: name,
        location,
        companyName,
        description,
        industry,
        verificationStatus: 'PENDING'
      })
      navigate({ to: '/home' })
    } else if (role === 'INVESTOR') {
      updateProfile({
        displayName: name,
        location,
        companyName,
        description: `Managing Partner at ${companyName || 'Venture Capital'}. Focus: ${sanitizedIndustries.join(', ')}.`,
        preferredIndustries: sanitizedIndustries,
        investmentMin: Number(investmentMin),
        investmentMax: Number(investmentMax),
        verificationStatus: 'VERIFIED'
      })
      navigate({ to: '/home' })
    } else if (role === 'MENTOR') {
      updateProfile({
        displayName: name,
        location,
        description,
        domainExpertise: sanitizedIndustries,
        hourlyRate: Number(investmentMin) || 0,
        advisoryRolesHeld: 0,
        verificationStatus: 'VERIFIED'
      })
      navigate({ to: '/dashboard' })
    } else if (role === 'ENTREPRENEUR') {
      updateProfile({
        displayName: name,
        location,
        description,
        primarySkills: sanitizedIndustries,
        yearsExperience: Number(investmentMin) || 0,
        equityExpectationRange: companyName || '5% - 15%',
        verificationStatus: 'VERIFIED'
      })
      navigate({ to: '/dashboard' })
    } else {
      navigate({ to: '/dashboard' })
    }
  }

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 blur-[130px] rounded-full" />

      <div className="w-full max-w-md glass-card rounded-2xl p-6 md:p-8 shadow-2xl relative z-10 border border-white/10">
        
        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-6">
          {step > 1 ? (
            <button onClick={handlePrevStep} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-all cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-8" /> // Spacer
          )}
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
            Onboarding • Step {step} of {mode === 'LOGIN' ? '2' : '3'}
          </span>
          <div className="w-8" />
        </div>

        {/* Step 1: Select User Type */}
        {step === 1 && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="text-center">
              <h2 className="font-display font-extrabold text-2xl text-white">Join the Ecosystem</h2>
              <p className="text-xs text-gray-400 mt-1">Select your account type to proceed</p>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-[360px] overflow-y-auto no-scrollbar pr-1">
              <button 
                onClick={() => setRole('BUSINESS')}
                className={`flex gap-4 p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  role === 'BUSINESS' 
                    ? 'border-primary bg-primary/10 shadow-lg shadow-primary/5' 
                    : 'border-white/5 bg-white/5 hover:border-white/15'
                }`}
              >
                <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 h-11 w-11 ${role === 'BUSINESS' ? 'bg-primary text-white' : 'bg-white/5 text-gray-400'}`}>
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-white leading-none">I am a Startup</h3>
                  <p className="text-[10px] text-gray-400 mt-1 leading-snug">Looking for capital investment, mentors, and operator talent.</p>
                </div>
              </button>

              <button 
                onClick={() => setRole('INVESTOR')}
                className={`flex gap-4 p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  role === 'INVESTOR' 
                    ? 'border-accent bg-accent/10 shadow-lg shadow-accent/5' 
                    : 'border-white/5 bg-white/5 hover:border-white/15'
                }`}
              >
                <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 h-11 w-11 ${role === 'INVESTOR' ? 'bg-accent text-white' : 'bg-white/5 text-gray-400'}`}>
                  <Coins className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-white leading-none">I am an Investor</h3>
                  <p className="text-[10px] text-gray-400 mt-1 leading-snug">Looking to fund high-growth businesses and early-stage startups.</p>
                </div>
              </button>

              <button 
                onClick={() => setRole('MENTOR')}
                className={`flex gap-4 p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  role === 'MENTOR' 
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/5' 
                    : 'border-white/5 bg-white/5 hover:border-white/15'
                }`}
              >
                <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 h-11 w-11 ${role === 'MENTOR' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-400'}`}>
                  <Compass className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-white leading-none">I am a Mentor</h3>
                  <p className="text-[10px] text-gray-400 mt-1 leading-snug">Helping startups scale with consulting advice and audits.</p>
                </div>
              </button>

              <button 
                onClick={() => setRole('ENTREPRENEUR')}
                className={`flex gap-4 p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  role === 'ENTREPRENEUR' 
                    ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/5' 
                    : 'border-white/5 bg-white/5 hover:border-white/15'
                }`}
              >
                <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 h-11 w-11 ${role === 'ENTREPRENEUR' ? 'bg-cyan-500 text-white' : 'bg-white/5 text-gray-400'}`}>
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-white leading-none">I am an Entrepreneur</h3>
                  <p className="text-[10px] text-gray-400 mt-1 leading-snug">Looking to join a scaling startup as a builder or co-founder.</p>
                </div>
              </button>

              <button 
                onClick={() => setRole('ADMIN')}
                className={`flex gap-4 p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  role === 'ADMIN' 
                    ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/5' 
                    : 'border-white/5 bg-white/5 hover:border-white/15'
                }`}
              >
                <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 h-11 w-11 ${role === 'ADMIN' ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-400'}`}>
                  <Shield className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-white leading-none">Administrator Access</h3>
                  <p className="text-[10px] text-gray-400 mt-1 leading-snug">Access console auditing tools, document checks, and badges.</p>
                </div>
              </button>
            </div>

            <button
              onClick={handleNextStep}
              disabled={!role}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none cursor-pointer"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Login or SignUp credentials */}
        {step === 2 && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="text-center">
              <h2 className="font-display font-extrabold text-2xl text-white">
                {mode === 'LOGIN' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Access your {role === 'BUSINESS' ? 'Startup' : role === 'INVESTOR' ? 'Investor' : role === 'MENTOR' ? 'Mentor' : role === 'ENTREPRENEUR' ? 'Entrepreneur' : 'Admin'} portal
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white placeholder-gray-500"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white placeholder-gray-500"
                />
              </div>
            </div>

            <button
              onClick={handleNextStep}
              disabled={!email || !password}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none cursor-pointer"
            >
              {mode === 'LOGIN' ? 'Login' : 'Set Up Profile'} <ArrowRight className="w-4 h-4" />
            </button>

            {role !== 'ADMIN' && (
              <div className="text-center">
                <button 
                  onClick={() => setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')}
                  className="text-xs text-primary hover:text-accent font-medium underline transition-all cursor-pointer"
                >
                  {mode === 'LOGIN' ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Setup Profile Details */}
        {step === 3 && (
          <form onSubmit={handleFinishSignup} className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="text-center">
              <h2 className="font-display font-extrabold text-2xl text-white">Create Profile</h2>
              <p className="text-xs text-gray-400 mt-1">Configure your marketplace presence</p>
            </div>

            <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
              {role === 'BUSINESS' && (
                <>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Business/Company Name" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white placeholder-gray-500"
                    />
                  </div>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Founder Name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white placeholder-gray-500"
                    />
                  </div>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Industry (e.g. Biotech, AI, SaaS)" 
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white placeholder-gray-500"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Location (e.g. Bangalore, India)" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white placeholder-gray-500"
                    />
                  </div>
                  <textarea 
                    placeholder="Short Business Description" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={3}
                    className="w-full p-4 rounded-xl glass-input text-sm text-white placeholder-gray-500 resize-none"
                  />
                </>
              )}

              {role === 'INVESTOR' && (
                <>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Investor Full Name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white placeholder-gray-500"
                    />
                  </div>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Company / VC Name" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white placeholder-gray-500"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Location" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white placeholder-gray-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="Min Invest ($)" 
                      value={investmentMin}
                      onChange={(e) => setInvestmentMin(e.target.value)}
                      required
                      className="w-1/2 px-4 py-3 rounded-xl glass-input text-sm text-white placeholder-gray-500"
                    />
                    <input 
                      type="number" 
                      placeholder="Max Invest ($)" 
                      value={investmentMax}
                      onChange={(e) => setInvestmentMax(e.target.value)}
                      required
                      className="w-1/2 px-4 py-3 rounded-xl glass-input text-sm text-white placeholder-gray-500"
                    />
                  </div>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Target Industries (e.g. Biotech, AI)" 
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white placeholder-gray-500"
                    />
                  </div>
                </>
              )}

              {role === 'MENTOR' && (
                <>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Mentor Full Name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white placeholder-gray-500"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Location" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white placeholder-gray-500"
                    />
                  </div>
                  <div className="relative">
                    <Compass className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Domain Expertises (e.g. GTM, Fintech, ScaleUp)" 
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white placeholder-gray-500"
                    />
                  </div>
                  <div className="relative">
                    <Coins className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input 
                      type="number" 
                      placeholder="Hourly Consulting Rate ($)" 
                      value={investmentMin}
                      onChange={(e) => setInvestmentMin(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white placeholder-gray-500"
                    />
                  </div>
                  <textarea 
                    placeholder="Short Description of Expertise & Background" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={3}
                    className="w-full p-4 rounded-xl glass-input text-sm text-white placeholder-gray-500 resize-none"
                  />
                </>
              )}

              {role === 'ENTREPRENEUR' && (
                <>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white placeholder-gray-500"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Location" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white placeholder-gray-500"
                    />
                  </div>
                  <div className="relative">
                    <Users className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Primary Skills (e.g. React, GTM, Sales)" 
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white placeholder-gray-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="Years Experience" 
                      value={investmentMin}
                      onChange={(e) => setInvestmentMin(e.target.value)}
                      required
                      className="w-1/2 px-4 py-3 rounded-xl glass-input text-sm text-white placeholder-gray-500"
                    />
                    <input 
                      type="text" 
                      placeholder="Equity Expected (e.g. 5-15%)" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      className="w-1/2 px-4 py-3 rounded-xl glass-input text-sm text-white placeholder-gray-500"
                    />
                  </div>
                  <textarea 
                    placeholder="Short Operator Bio / What kind of startup are you looking to join?" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={3}
                    className="w-full p-4 rounded-xl glass-input text-sm text-white placeholder-gray-500 resize-none"
                  />
                </>
              )}
            </div>

            {/* Validation alert banner */}
            {validationError && (
              <div className="p-3 text-xs bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl mb-1 font-medium animate-in fade-in">
                {validationError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-medium flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/10 cursor-pointer"
            >
              Complete Sign Up <ShieldCheck className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
