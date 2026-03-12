import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { messageAPI, partnerAPI } from '../../services/api'
import useAuthStore from '../../store/authStore'
import { Avatar, avatarBg } from '../shared/UI'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api'

/* ── Rating Modal ────────────────────────────────────────────────────────── */
function RatingModal({ partner, onClose, onRated }) {
  const [stars, setStars] = useState(0)
  const [hover, setHover] = useState(0)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!stars) return toast.error('Pick a rating first')
    setLoading(true)
    try {
      await api.post(`/users/${partner.partnerId}/rate`, { rating: stars })
      toast.success('Thanks for rating! ⭐')
      onRated()
      onClose()
    } catch {
      toast.error('Failed to submit rating')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.4)',backdropFilter:'blur(8px)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'white',borderRadius:20,padding:'28px 24px',width:'100%',maxWidth:360,textAlign:'center',boxShadow:'0 24px 60px rgba(0,0,0,.18)' }}>
        <Avatar name={partner.name} color={partner.avatarColor} size={52} style={{ margin:'0 auto 12px' }}/>
        <h3 style={{ fontSize:20,fontWeight:600,color:'#111110',marginBottom:4 }}>Rate {partner.name}</h3>
        <p style={{ fontSize:13,color:'#A8A7A2',marginBottom:20 }}>How was your study session?</p>
        <div style={{ display:'flex',justifyContent:'center',gap:8,marginBottom:22 }}>
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={()=>setStars(n)} onMouseEnter={()=>setHover(n)} onMouseLeave={()=>setHover(0)}
              style={{ background:'none',border:'none',cursor:'pointer',fontSize:32,transition:'transform .1s',transform:(hover||stars)>=n?'scale(1.2)':'scale(1)',filter:(hover||stars)>=n?'none':'grayscale(1)' }}>
              ⭐
            </button>
          ))}
        </div>
        <div style={{ display:'flex',gap:8 }}>
          <button onClick={onClose} style={{ flex:1,padding:'10px',borderRadius:10,border:'1px solid rgba(0,0,0,.1)',background:'white',color:'#706F6C',cursor:'pointer',fontSize:13 }}>Skip</button>
          <button onClick={submit} disabled={!stars||loading} style={{ flex:2,padding:'10px',borderRadius:10,border:'none',background:stars?'#1A5C3A':'#D1D0CC',color:'white',cursor:stars?'pointer':'default',fontSize:13,fontWeight:500 }}>
            {loading ? 'Submitting…' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Message Bubble ──────────────────────────────────────────────────────── */
function Bubble({ msg, isMine }) {
  const time = msg.sentAt || msg.createdAt
  return (
    <div style={{ display:'flex',justifyContent:isMine?'flex-end':'flex-start',marginBottom:4 }}>
      <div style={{
        maxWidth:'75%',padding:'9px 13px',borderRadius:isMine?'16px 16px 4px 16px':'16px 16px 16px 4px',
        background:isMine?'#1A5C3A':'white',
        color:isMine?'white':'#111110',
        fontSize:13.5,lineHeight:1.55,
        boxShadow:'0 1px 4px rgba(0,0,0,.07)',
        wordBreak:'break-word',whiteSpace:'pre-wrap',
      }}>
        {msg.content}
        <div style={{ fontSize:10,marginTop:4,opacity:.65,textAlign:'right' }}>
          {time ? format(new Date(time),'h:mm a') : ''}
        </div>
      </div>
    </div>
  )
}

/* ── Date Divider ────────────────────────────────────────────────────────── */
function DateDivider({ date }) {
  const d = new Date(date)
  const label = isToday(d) ? 'Today' : isYesterday(d) ? 'Yesterday' : format(d, 'MMM d, yyyy')
  return (
    <div style={{ display:'flex',alignItems:'center',gap:10,margin:'16px 0 8px' }}>
      <div style={{ flex:1,height:1,background:'rgba(0,0,0,.07)' }}/>
      <span style={{ fontSize:11,color:'#A8A7A2',fontWeight:500 }}>{label}</span>
      <div style={{ flex:1,height:1,background:'rgba(0,0,0,.07)' }}/>
    </div>
  )
}

/* ── Chat Window ─────────────────────────────────────────────────────────── */
function ChatWindow({ active, user, onSessionComplete, onBack, isMobile }) {
  const [messages,   setMessages]  = useState([])
  const [text,       setText]      = useState('')
  const [loading,    setLoading]   = useState(true)
  const [sending,    setSending]   = useState(false)
  const [completing, setCompleting]= useState(false)
  const [showRating, setShowRating]= useState(false)
  const endRef   = useRef(null)
  const inputRef = useRef(null)
  const pollRef  = useRef(null)

  const failCount = useRef(0)

  const loadMessages = async (silent=false) => {
    if (!silent) setLoading(true)
    try {
      const { data } = await messageAPI.getConversation(active.partnerId)
      setMessages(data||[])
      failCount.current = 0  // reset on success
    } catch {
      failCount.current += 1
      // Stop polling after 3 consecutive failures (backend offline)
      if (failCount.current >= 3 && pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
    finally { if (!silent) setLoading(false) }
  }

  useEffect(() => {
    setMessages([])
    failCount.current = 0
    loadMessages()
    inputRef.current?.focus()
    pollRef.current = setInterval(() => loadMessages(true), 3000)
    return () => clearInterval(pollRef.current)
  }, [active.partnerId])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages])

  const send = async () => {
    const t = text.trim()
    if (!t || sending) return
    setText('')
    setSending(true)
    try {
      const { data } = await messageAPI.send({ receiverId: active.partnerId, content: t })
      setMessages(m => [...m, data])
    } catch {
      toast.error('Failed to send')
      setText(t)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const completeSession = async () => {
    setCompleting(true)
    try {
      await api.post('/users/sessions/complete', { partnerId: active.partnerId })
      toast.success('Session complete! +1 🎉')
      setShowRating(true)
      onSessionComplete?.()
    } catch {
      toast.error('Failed to complete session')
    } finally {
      setCompleting(false)
    }
  }

  const grouped = messages.reduce((acc, msg) => {
    const day = (msg.sentAt||msg.createdAt||'').slice(0,10)
    if (!acc[day]) acc[day] = []
    acc[day].push(msg)
    return acc
  }, {})

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100%' }}>

      {/* Header */}
      <div style={{ padding:'10px 14px',borderBottom:'1px solid rgba(0,0,0,.07)',background:'white',display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,flexShrink:0 }}>
        <div style={{ display:'flex',alignItems:'center',gap:10 }}>
          {/* Back button — mobile only */}
          {isMobile && (
            <button onClick={onBack} style={{
              background:'none',border:'none',cursor:'pointer',padding:'4px 8px 4px 0',
              color:'#1A5C3A',fontSize:22,lineHeight:1,flexShrink:0,fontWeight:300,
            }}>‹</button>
          )}

          <div style={{ position:'relative' }}>
            <Avatar name={active.name} color={active.avatarColor} size={38}/>
            {active.isOnline && <span style={{ position:'absolute',bottom:0,right:0,width:10,height:10,borderRadius:'50%',background:'#22C55E',border:'2px solid white' }}/>}
          </div>
          <div>
            <p style={{ fontWeight:600,fontSize:14,color:'#111110',lineHeight:1.2 }}>{active.name}</p>
            <p style={{ fontSize:11,color:active.isOnline?'#16A34A':'#A8A7A2' }}>
              {active.isOnline ? '● Online' : 'Offline'}
            </p>
          </div>
        </div>
        <button onClick={completeSession} disabled={completing} style={{
          padding:'6px 12px',borderRadius:99,border:'none',
          background:completing?'#D1D0CC':'#1A5C3A',
          color:'white',fontSize:11.5,fontWeight:500,
          cursor:completing?'not-allowed':'pointer',
          boxShadow:'0 2px 8px rgba(26,92,58,.2)',
          display:'flex',alignItems:'center',gap:4,flexShrink:0,whiteSpace:'nowrap',
        }}>
          {completing ? 'Saving…' : '✓ Complete Session'}
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex:1,overflowY:'auto',padding:'16px 14px',background:'#F7F6F3' }}>
        {loading ? (
          <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100%',gap:10 }}>
            <span style={{ width:18,height:18,border:'2px solid rgba(26,92,58,.15)',borderTopColor:'#1A5C3A',borderRadius:'50%',animation:'spin .75s linear infinite',display:'inline-block' }}/>
            <span style={{ fontSize:13,color:'#A8A7A2' }}>Loading messages…</span>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:10 }}>
            <div style={{ fontSize:40 }}>👋</div>
            <p style={{ fontWeight:600,fontSize:16,color:'#111110' }}>Say hello to {active.name}!</p>
            <p style={{ fontSize:13,color:'#A8A7A2' }}>This is the start of your conversation</p>
          </div>
        ) : (
          Object.entries(grouped).map(([day, msgs]) => (
            <div key={day}>
              <DateDivider date={day}/>
              {msgs.map((msg,i) => (
                <Bubble key={msg.id||i} msg={msg} isMine={msg.sender?.id===user?.id || msg.senderId===user?.id}/>
              ))}
            </div>
          ))
        )}
        <div ref={endRef}/>
      </div>

      {/* Input */}
      <div style={{ padding:'10px 12px',borderTop:'1px solid rgba(0,0,0,.07)',background:'white',flexShrink:0 }}>
        <div style={{ display:'flex',gap:8,alignItems:'flex-end' }}>
          <textarea
            ref={inputRef}
            rows={1}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()} }}
            placeholder={`Message ${active.name}…`}
            style={{
              flex:1,padding:'10px 14px',borderRadius:12,
              border:'1px solid rgba(0,0,0,.09)',
              background:'#F7F6F3',fontSize:13.5,color:'#111110',
              outline:'none',resize:'none',fontFamily:'inherit',
              lineHeight:1.5,maxHeight:120,overflowY:'auto',
              transition:'border-color .15s',
              fieldSizing:'content',
            }}
            onFocus={e=>e.target.style.borderColor='#1A5C3A'}
            onBlur={e=>e.target.style.borderColor='rgba(0,0,0,.09)'}
          />
          <button onClick={send} disabled={!text.trim()||sending} style={{
            width:40,height:40,borderRadius:12,border:'none',flexShrink:0,
            background:text.trim()?'#1A5C3A':'#D1D0CC',
            color:'white',cursor:text.trim()?'pointer':'default',
            display:'flex',alignItems:'center',justifyContent:'center',
            boxShadow:text.trim()?'0 2px 8px rgba(26,92,58,.25)':'none',
            transition:'all .15s',
          }}>
            {sending
              ? <span style={{ width:14,height:14,border:'2px solid rgba(255,255,255,.4)',borderTopColor:'white',borderRadius:'50%',animation:'spin .6s linear infinite',display:'inline-block' }}/>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/></svg>
            }
          </button>
        </div>
        <p style={{ fontSize:10.5,color:'#C8C7C2',marginTop:5,textAlign:'center' }}>Enter to send · Shift+Enter for new line</p>
      </div>

      {showRating && (
        <RatingModal partner={active} onClose={()=>setShowRating(false)} onRated={()=>{}}/>
      )}
    </div>
  )
}

/* ── Main ChatPage ───────────────────────────────────────────────────────── */
export default function ChatPage() {
  const { user }   = useAuthStore()
  const { id }     = useParams()
  const navigate   = useNavigate()

  const [partners, setPartners] = useState([])
  const [active,   setActive]   = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [pR, cR] = await Promise.allSettled([
          partnerAPI.getMyPartners(),
          messageAPI.getConversations(),
        ])
        const accepted = pR.status==='fulfilled' ? pR.value.data : []
        const convos   = cR.status==='fulfilled' ? cR.value.data : []

        const list = accepted.map(pr => {
          const other = pr.sender.id===user?.id ? pr.receiver : pr.sender
          const convo = convos.find(c => c.partnerId===other.id)
          return {
            partnerId:       other.id,
            name:            other.name||'Partner',
            avatarColor:     other.avatarColor||avatarBg(other.name||''),
            isOnline:        other.isOnline,
            lastMessage:     convo?.lastMessage||'Tap to start chatting',
            lastMessageTime: convo?.lastMessageTime||pr.createdAt,
            unreadCount:     convo?.unreadCount||0,
          }
        })

        setPartners(list)
        if (id) {
          const found = list.find(p => p.partnerId===Number(id))
          if (found) setActive(found)
        }
      } catch(e) { console.error(e) }
      finally { setLoading(false) }
    }
    if (user) load()
  }, [user])

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 640)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const openChat = (p) => {
    setActive(p)
    navigate(`/app/chat/${p.partnerId}`, { replace:true })
  }

  const filtered = partners.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  // On mobile: show sidebar OR chat, not both
  const showSidebar = !isMobile || !active
  const showChat    = !isMobile || !!active

  return (
    <div style={{ height:'100%',background:'#F7F6F3',display:'flex' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      <div style={{ maxWidth:1200,width:'100%',margin:'0 auto',display:'flex',height:'100%' }}>

        {/* ── Sidebar ── */}
        {showSidebar && <div
          style={{ width:isMobile?'100%':300,borderRight:'1px solid rgba(0,0,0,.07)',background:'white',display:'flex',flexDirection:'column',flexShrink:0 }}
        >
          <div style={{ padding:'16px',borderBottom:'1px solid rgba(0,0,0,.07)',flexShrink:0 }}>
            <p style={{ fontSize:16,fontWeight:600,color:'#111110',marginBottom:10 }}>Messages</p>
            <div style={{ display:'flex',alignItems:'center',background:'#F7F6F3',border:'1px solid rgba(0,0,0,.07)',borderRadius:9,padding:'7px 12px',gap:6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A8A7A2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search" style={{ border:'none',background:'transparent',outline:'none',flex:1,fontSize:13,color:'#111110' }}/>
            </div>
          </div>

          <div style={{ flex:1,overflowY:'auto' }}>
            {loading ? (
              <div style={{ display:'flex',justifyContent:'center',alignItems:'center',height:120,gap:8 }}>
                <span style={{ width:16,height:16,border:'2px solid rgba(26,92,58,.15)',borderTopColor:'#1A5C3A',borderRadius:'50%',animation:'spin .75s linear infinite',display:'inline-block' }}/>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign:'center',padding:'40px 16px' }}>
                <p style={{ fontSize:32,marginBottom:8 }}>💬</p>
                <p style={{ fontSize:13,color:'#706F6C',fontWeight:500,marginBottom:4 }}>No conversations yet</p>
                <p style={{ fontSize:12,color:'#A8A7A2' }}>Accept a partner request to start chatting</p>
              </div>
            ) : filtered.map(p => {
              const isAct = active?.partnerId===p.partnerId
              return (
                <div key={p.partnerId} onClick={()=>openChat(p)} style={{
                  display:'flex',alignItems:'center',gap:10,
                  padding:'12px 14px',cursor:'pointer',
                  background:isAct?'#EDF4F0':'transparent',
                  borderLeft:isAct?'3px solid #1A5C3A':'3px solid transparent',
                  transition:'background .12s',
                }}
                onMouseEnter={e=>{if(!isAct)e.currentTarget.style.background='#F7F6F3'}}
                onMouseLeave={e=>{if(!isAct)e.currentTarget.style.background='transparent'}}>
                  <div style={{ position:'relative',flexShrink:0 }}>
                    <Avatar name={p.name} color={p.avatarColor} size={40}/>
                    {p.isOnline && <span style={{ position:'absolute',bottom:0,right:0,width:10,height:10,borderRadius:'50%',background:'#22C55E',border:'2px solid white' }}/>}
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',gap:4,marginBottom:2 }}>
                      <span style={{ fontSize:13.5,fontWeight:500,color:'#111110',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{p.name}</span>
                      {p.unreadCount > 0 && (
                        <span style={{ minWidth:18,height:18,borderRadius:99,background:'#1A5C3A',color:'white',fontSize:10,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 5px',flexShrink:0 }}>{p.unreadCount}</span>
                      )}
                    </div>
                    <p style={{ fontSize:12,color:'#A8A7A2',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{p.lastMessage}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>}

        {/* ── Chat area ── */}
        {showChat && <div style={{ flex:1,display:'flex',flexDirection:'column',minWidth:0,width:isMobile?'100%':'auto' }}>
          {active ? (
            <ChatWindow
              key={active.partnerId}
              active={active}
              user={user}
              isMobile={isMobile}
              onSessionComplete={()=>{}}
              onBack={()=>setActive(null)}
            />
          ) : (
            <div style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:14,padding:16 }}>
              <div style={{ width:64,height:64,borderRadius:18,background:'#EDF4F0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28 }}>💬</div>
              <p style={{ fontSize:20,fontWeight:600,color:'#111110',textAlign:'center' }}>Select a conversation</p>
              <p style={{ fontSize:13,color:'#A8A7A2',textAlign:'center' }}>Choose a partner from the left to start chatting</p>
              <button onClick={()=>navigate('/app/nearby')} style={{ padding:'8px 18px',borderRadius:99,border:'none',background:'#1A5C3A',color:'white',cursor:'pointer',fontSize:13,fontWeight:500 }}>
                Find study partner
              </button>
            </div>
          )}
        </div>}

      </div>
    </div>
  )
}
