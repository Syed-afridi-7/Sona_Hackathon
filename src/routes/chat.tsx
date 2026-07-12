import { createFileRoute, Link } from '@tanstack/react-router'
import { useStore } from '../store/useStore'
import { useState, useRef, useEffect } from 'react'
import { Send, Calendar, Video, MapPin, User, ChevronRight, ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/chat')({
  component: ChatComponent,
})

function ChatComponent() {
  const { currentUser, profiles, messages, meetings, sendChatMessage } = useStore()
  
  // Find contacts (the other profiles)
  const contacts = profiles.filter(p => p.id !== currentUser?.id)
  
  // Set default active contact to Aura Biotech (p-1)
  const [activeContactId, setActiveContactId] = useState<string>(contacts[0]?.id || '')
  const [chatInput, setChatInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeContact = profiles.find(p => p.id === activeContactId)
  
  // Filter messages between currentUser and activeContact
  const conversationMessages = messages.filter(
    (msg) => 
      (msg.senderId === currentUser?.id && msg.receiverId === activeContactId) ||
      (msg.senderId === activeContactId && msg.receiverId === currentUser?.id)
  )

  // Filter meetings involving active contact
  const conversationMeetings = meetings.filter(
    (meet) => 
      (meet.senderId === currentUser?.id && meet.receiverId === activeContactId) ||
      (meet.senderId === activeContactId && meet.receiverId === currentUser?.id)
  )

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !activeContactId) return

    sendChatMessage(activeContactId, chatInput)
    setChatInput('')
  }

  // Scroll to bottom of message logs automatically
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationMessages])

  return (
    <div className="h-screen w-full grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in duration-300 text-left p-4 overflow-hidden bg-bg-dark">
      
      {/* 1. Contacts Sidebar List (Left Column) - Height isolated, scrollable */}
      <div className="md:col-span-1 glass-card rounded-2xl p-4 border border-white/5 flex flex-col gap-3 h-full overflow-y-auto no-scrollbar">
        <h3 className="font-semibold text-xs text-gray-500 uppercase tracking-wider mb-2 border-b border-white/5 pb-2">Conversations</h3>
        
        <div className="flex flex-col gap-2">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setActiveContactId(contact.id)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer text-left transition-all ${
                activeContactId === contact.id 
                  ? 'bg-primary/10 border border-primary/20 shadow-inner' 
                  : 'bg-white/5 border border-transparent hover:bg-white/10'
              }`}
            >
              <img 
                src={contact.avatarUrl} 
                alt={contact.displayName} 
                className="w-9 h-9 rounded-full object-cover border border-white/10 bg-white/5 aspect-square"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-xs text-white truncate">{contact.displayName}</h4>
                <span className="text-[10px] text-gray-400 font-light block truncate">
                  {contact.role === 'BUSINESS' ? contact.companyName : contact.role}
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            </button>
          ))}
        </div>
      </div>

      {/* 2. Primary Chat Frame (Middle Columns) - clamped h-full */}
      <div className="md:col-span-2 glass-card rounded-2xl border border-white/5 flex flex-col h-full overflow-hidden relative">
        
        {/* Chat partner header - Fixed Height */}
        {activeContact && (
          <div className="flex items-center gap-3 p-4 border-b border-white/5 bg-white/[0.02] h-[72px] shrink-0">
            <Link 
              to="/home" 
              className="p-1.5 mr-1 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-all cursor-pointer animate-in fade-in slide-in-from-left-2 duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            
            <img 
              src={activeContact.avatarUrl} 
              alt={activeContact.displayName}
              className="w-10 h-10 rounded-full object-cover border border-white/10 aspect-square"
            />
            <div>
              <h3 className="font-semibold text-sm text-white leading-none">{activeContact.displayName}</h3>
              <span className="text-[10px] text-primary font-medium mt-1 inline-block">
                {activeContact.role === 'BUSINESS' ? 'Business Founder' : 'Verified Investor'}
              </span>
            </div>
          </div>
        )}

        {/* Message logs - Height isolated & scrollable */}
        <div className="flex-1 p-4 overflow-y-auto no-scrollbar flex flex-col gap-3">
          {conversationMessages.length > 0 ? (
            conversationMessages.map((msg) => {
              const isMe = msg.senderId === currentUser?.id
              return (
                <div 
                  key={msg.id}
                  className={`flex flex-col max-w-[75%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                >
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    isMe 
                      ? 'bg-gradient-to-r from-primary to-accent text-white rounded-tr-none' 
                      : 'bg-white/5 text-gray-300 rounded-tl-none border border-white/5'
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-[9px] text-gray-500 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )
            })
          ) : (
            <div className="my-auto flex flex-col items-center gap-2 text-center text-gray-500">
              <User className="w-8 h-8 text-gray-700" />
              <span className="text-xs">No message history. Say hi to {activeContact?.displayName}!</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Messaging action input - Sticky Bottom Dock with Solid Opaque Background */}
        <form 
          onSubmit={handleSendMessage} 
          className="sticky bottom-0 bg-[#0f0c1b] border-t border-white/5 p-4 flex gap-2 shrink-0 z-10 w-full"
        >
          <input 
            type="text"
            placeholder="Type your message..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl glass-input text-xs text-white placeholder-gray-500"
          />
          <button 
            type="submit"
            className="p-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

      {/* 3. Meetings Calendar Side Panel (Right Column) - Height isolated, scrollable */}
      <div className="md:col-span-1 glass-card rounded-2xl p-4 border border-white/5 flex flex-col gap-3 h-full overflow-y-auto no-scrollbar">
        <h3 className="font-semibold text-xs text-gray-500 uppercase tracking-wider border-b border-white/5 pb-2 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-accent" /> Scheduled Meetings</h3>

        <div className="flex flex-col gap-3">
          {conversationMeetings.length > 0 ? (
            conversationMeetings.map((meet) => (
              <div key={meet.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2.5">
                <div className="flex justify-between items-center">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border ${
                    meet.status === 'PENDING' 
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                      : 'bg-green-500/10 border-green-500/30 text-green-400'
                  }`}>
                    {meet.status}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {new Date(meet.scheduledTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <div className="text-[10px] text-gray-300 leading-normal flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  {new Date(meet.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>

                {meet.isOnline ? (
                  <a 
                    href={meet.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[9px] text-primary hover:text-accent font-medium flex items-center gap-1.5 underline cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" /> Launch Video Call
                  </a>
                ) : (
                  <div className="text-[9px] text-gray-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" /> {meet.meetingLink}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-xs text-gray-600 flex flex-col items-center gap-2">
              <Calendar className="w-6 h-6 text-gray-700" />
              <span>No meetings scheduled.</span>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
