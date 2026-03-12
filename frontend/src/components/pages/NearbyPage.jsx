import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userAPI, partnerAPI } from '../../services/api'
import { Avatar, ProgressBar } from '../shared/UI'
import { inputCss, onFocus, onBlur } from '../shared/UI'
import toast from 'react-hot-toast'
import banner from '../../assets/nearby-banner.png'

/* ── Connect Sheet ───────────────────────────────────────────────────────── */
function ConnectSheet({ u, onClose, onSent }) {
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const match = 60 + (u.id % 38)

  const send = async () => {
    setLoading(true)
    try {
      await partnerAPI.sendRequest({ receiverId: u.id, message: msg })
      toast.success(`Request sent to ${u.name}!`)
      onSent(u.id)
      onClose()
    } catch(err) {
      toast.error(err.response?.data?.message || 'Already sent')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.4)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,padding:'0 16px' }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'white',borderRadius:20,width:'100%',maxWidth:440,padding:'28px 24px',boxShadow:'0 24px 60px rgba(0,0,0,.18)' }}>
        <div style={{ display:'flex',gap:14,marginBottom:18 }}>
          <Avatar name={u.name} color={u.avatarColor} size={52}/>
          <div style={{ flex:1 }}>
            <h3 style={{ fontSize:22,fontWeight:600,color:'#111110',marginBottom:2 }}>{u.name}</h3>
            <p style={{ fontSize:12,color:'#A8A7A2' }}>📍 {u.city||'—'}</p>
            <div style={{ display:'flex',alignItems:'center',gap:8,marginTop:6 }}>
              <div style={{ flex:1 }}><ProgressBar value={match}/></div>
              <span style={{ fontSize:12,color:'#1A5C3A',fontWeight:600 }}>{match}% match</span>
            </div>
          </div>
        </div>
        <textarea rows={2} value={msg} placeholder="Add a note… (optional)" onChange={e=>setMsg(e.target.value)}
          style={{ ...inputCss,resize:'none',marginBottom:12 }} onFocus={onFocus} onBlur={onBlur}/>
        <div style={{ display:'flex',gap:8 }}>
          <button onClick={onClose} style={{ padding:'10px 18px',borderRadius:10,border:'1px solid rgba(0,0,0,.1)',background:'white',color:'#706F6C',fontSize:13,cursor:'pointer' }}>Cancel</button>
          <button disabled={loading} onClick={send} style={{ flex:1,padding:'10px',borderRadius:10,border:'none',background:'#1A5C3A',color:'white',fontSize:13.5,fontWeight:500,cursor:loading?'not-allowed':'pointer',boxShadow:'0 4px 18px rgba(26,92,58,.25)' }}>
            {loading ? 'Sending…' : 'Send Request →'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── User Card ───────────────────────────────────────────────────────────── */
function UserCard({ u, status, onConnect }) {
  const navigate = useNavigate()
  const isNone = status === 'NONE'
  const isPartner = status === 'ACCEPTED'
  const isPending = status === 'PENDING'

  return (
    <div style={{
      background:'white', border:'1px solid rgba(0,0,0,.07)', borderRadius:16,
      overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,.06)',
      transition:'transform .18s, box-shadow .18s', display:'flex', flexDirection:'column',
    }}
    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 10px 32px rgba(0,0,0,.10)'}}
    onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,.06)'}}>

      <div style={{ padding:'18px 18px 14px',flex:1 }}>
        {/* Avatar + name */}
        <div style={{ display:'flex',alignItems:'flex-start',gap:12,marginBottom:12 }}>
          <div style={{ position:'relative',flexShrink:0 }}>
            <Avatar name={u.name} color={u.avatarColor} size={46}/>
            {u.isOnline && <span style={{ position:'absolute',bottom:1,right:1,width:11,height:11,borderRadius:'50%',background:'#22C55E',border:'2.5px solid white' }}/>}
          </div>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',gap:6,marginBottom:2 }}>
              <span onClick={e=>{e.stopPropagation();navigate(`/app/user/${u.id}`)}} style={{ fontWeight:600,fontSize:15,color:'#111110',letterSpacing:'-.01em',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',cursor:'pointer' }}
                onMouseEnter={e=>e.currentTarget.style.color='#1A5C3A'}
                onMouseLeave={e=>e.currentTarget.style.color='#111110'}>{u.name}</span>
              <span style={{ fontSize:11,color:u.isOnline?'#16A34A':'#A8A7A2',flexShrink:0,fontWeight:u.isOnline?500:400 }}>
                {u.isOnline ? '● Online' : 'Offline'}
              </span>
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:6 }}>
              <p style={{ fontSize:12,color:'#A8A7A2' }}>📍 {u.city||'—'}</p>
              {u.distanceKm != null && (
                <span style={{
                  fontSize:11,fontWeight:600,padding:'1px 7px',borderRadius:99,
                  background: u.distanceKm < 10 ? '#EDF4F0' : u.distanceKm < 50 ? '#FEF3C7' : '#F2F1EE',
                  color: u.distanceKm < 10 ? '#1A5C3A' : u.distanceKm < 50 ? '#D97706' : '#706F6C',
                }}>
                  {u.distanceKm < 1 ? '<1 km' : `${Math.round(u.distanceKm)} km`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {u.bio && (
          <p style={{ fontSize:12.5,color:'#706F6C',lineHeight:1.6,marginBottom:12,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden' }}>
            {u.bio}
          </p>
        )}

        {/* Skills */}
        {((u.teachesSkills?.length||0)+(u.learnsSkills?.length||0)) > 0 && (
          <div style={{ display:'flex',flexWrap:'wrap',gap:5,marginBottom:12 }}>
            {(u.teachesSkills||[]).slice(0,3).map(s=>(
              <span key={s} style={{ padding:'3px 10px',borderRadius:99,fontSize:11,fontWeight:500,background:'#EDF4F0',color:'#1A5C3A',border:'1px solid #C8DED4' }}>{s}</span>
            ))}
            {(u.learnsSkills||[]).slice(0,2).map(s=>(
              <span key={s} style={{ padding:'3px 10px',borderRadius:99,fontSize:11,fontWeight:500,background:'#FDF3E3',color:'#7C4A00',border:'1px solid #F0D9A8' }}>{s}</span>
            ))}
          </div>
        )}

        {/* Rating */}
        <div style={{ display:'flex',alignItems:'center',gap:5 }}>
          <span style={{ color:'#F59E0B',fontSize:13 }}>★</span>
          <span style={{ fontSize:13,fontWeight:500,color:'#111110' }}>{u.averageRating?.toFixed(1)||'—'}</span>
          <span style={{ fontSize:12,color:'#A8A7A2' }}>· {u.totalSessions||0} sessions</span>
        </div>
      </div>

      {/* Action */}
      <div style={{ padding:'0 18px 18px' }}>
        <button onClick={()=>isNone && onConnect(u)} style={{
          width:'100%',padding:'10px 16px',borderRadius:10,border:'none',
          fontSize:13.5,fontWeight:500,letterSpacing:'-.01em',
          cursor:isNone?'pointer':'default',
          background:isPartner?'#EDF4F0':isPending?'#F2F1EE':'#1A5C3A',
          color:isPartner?'#1A5C3A':isPending?'#A8A7A2':'white',
          boxShadow:isNone?'0 2px 10px rgba(26,92,58,.18)':'none',
          transition:'all .15s',
        }}>
          {isPartner ? '✓ Partners' : isPending ? 'Request Sent' : 'Send Request'}
        </button>
      </div>
    </div>
  )
}

/* ── Category Tab ────────────────────────────────────────────────────────── */
function Tab({ label, count, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display:'flex',alignItems:'center',gap:6,
      padding:'7px 14px',borderRadius:99,border:'none',
      background:active?'#1A5C3A':'white',
      color:active?'white':'#706F6C',
      fontSize:13,fontWeight:active?500:400,
      cursor:'pointer',
      border:`1px solid ${active?'#1A5C3A':'rgba(0,0,0,.09)'}`,
      transition:'all .15s',
      whiteSpace:'nowrap',
      boxShadow:active?'0 2px 8px rgba(26,92,58,.2)':'none',
    }}>
      {label}
      {count != null && (
        <span style={{
          minWidth:18,height:18,borderRadius:99,
          background:active?'rgba(255,255,255,.25)':'#F2F1EE',
          color:active?'white':'#706F6C',
          fontSize:10,fontWeight:600,
          display:'flex',alignItems:'center',justifyContent:'center',padding:'0 5px',
        }}>{count}</span>
      )}
    </button>
  )
}

/* ── Nearby Page ─────────────────────────────────────────────────────────── */
export default function NearbyPage() {
  const [users,      setUsers]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [selected,   setSelected]   = useState(null)
  const [reqSet,     setReqSet]     = useState(new Set())
  const [search,     setSearch]     = useState('')
  const [onlineOnly, setOnlineOnly] = useState(false)
  const [activeTab,  setActiveTab]  = useState('nearby') // 'nearby' | 'all' | city name
  const [showCityDrop, setShowCityDrop] = useState(false)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = () => setShowCityDrop(false)
    if (showCityDrop) document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [showCityDrop])

  useEffect(() => {
    userAPI.getNearby()
      .then(r => {
        setUsers(r.data||[])
        setReqSet(new Set((r.data||[]).filter(u=>u.requestStatus!=='NONE').map(u=>u.id)))
      })
      .catch(()=>toast.error('Failed to load'))
      .finally(()=>setLoading(false))
  }, [])

  const getStatus = u =>
    (reqSet.has(u.id) && u.requestStatus!=='ACCEPTED') ? 'PENDING' : (u.requestStatus||'NONE')

  // Unique cities from DB results
  const cities = [...new Set(users.map(u=>u.city).filter(Boolean))]

  // "Nearby" = has distanceKm (GPS-based results) or first city group
  const nearbyUsers = users.filter(u => u.distanceKm != null ? u.distanceKm <= 50 : true)

  const tabUsers = activeTab === 'nearby'
    ? nearbyUsers
    : activeTab === 'all'
    ? users
    : users.filter(u => u.city === activeTab)

  // Search filters on top of tab
  const filtered = tabUsers.filter(u => {
    const q = search.toLowerCase().trim()
    if (!q) return true
    return (
      u.name?.toLowerCase().includes(q) ||
      u.city?.toLowerCase().includes(q) ||
      u.bio?.toLowerCase().includes(q) ||
      u.teachesSkills?.some(s => s.toLowerCase().includes(q)) ||
      u.learnsSkills?.some(s => s.toLowerCase().includes(q))
    )
  }).filter(u => !onlineOnly || u.isOnline)

  const onlineCount = users.filter(u=>u.isOnline).length

  return (
    <div style={{ background:'#F7F6F3',minHeight:'100%',overflowY:'auto' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ maxWidth:1200,margin:'0 auto',padding:'24px clamp(16px,4vw,32px)' }}>

        {/* ── Banner ── */}
        <div style={{ width:'100%',borderRadius:18,overflow:'hidden',marginBottom:10,boxShadow:'0 8px 24px rgba(0,0,0,.08)' }}>
          <img src={banner} alt="StudyBuddy" style={{ width:'100%',height:'auto',display:'block',objectFit:'cover' }}/>
        </div>

        {/* ── Stats pills ── */}
        <div style={{ display:'flex',justifyContent:'center',gap:12,flexWrap:'wrap',marginBottom:24 }}>
          {[
            { icon:'👥', label:`${users.length} learners nearby` },
            { icon:'🟢', label:`${onlineCount} online now` },
            { icon:'⭐', label:'4.6 avg rating' },
          ].map(({ icon, label }) => (
            <span key={label} style={{ display:'flex',alignItems:'center',gap:6,background:'#F7F6F3',border:'1px solid rgba(0,0,0,.06)',padding:'6px 12px',borderRadius:999,fontSize:12.5,color:'#111110',fontWeight:500 }}>
              {icon} {label}
            </span>
          ))}
        </div>

        {/* ── Header ── */}
        <div style={{ marginBottom:18 }}>
          <h1 style={{ fontSize:28,fontWeight:700,color:'#111110',letterSpacing:'-.3px',marginBottom:4 }}>
            Find Your Perfect Study Partner
          </h1>
          <p style={{ color:'#706F6C',fontSize:14 }}>Learn together. Grow faster.</p>
        </div>

        {/* ── Search box ── */}
        <div style={{ background:'white',borderRadius:14,padding:14,marginBottom:14,border:'1px solid rgba(0,0,0,.07)',boxShadow:'0 1px 4px rgba(0,0,0,.04)' }}>
          <div style={{ display:'flex',gap:10,flexWrap:'wrap' }}>
            <div style={{ flex:1,minWidth:180,position:'relative' }}>
              <svg style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',pointerEvents:'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A8A7A2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                value={search}
                onChange={e=>setSearch(e.target.value)}
                placeholder="Search by name, city, or skill…"
                style={{ width:'100%',padding:'10px 12px 10px 36px',borderRadius:9,border:'1px solid rgba(0,0,0,.09)',background:'#F7F6F3',fontSize:13.5,color:'#111110',outline:'none',boxSizing:'border-box',fontFamily:'inherit',transition:'all .15s' }}
                onFocus={e=>{e.target.style.borderColor='#1A5C3A';e.target.style.background='white'}}
                onBlur={e=>{e.target.style.borderColor='rgba(0,0,0,.09)';e.target.style.background='#F7F6F3'}}
              />
              {search && (
                <button onClick={()=>setSearch('')} style={{ position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#A8A7A2',fontSize:16,lineHeight:1,padding:2 }}>×</button>
              )}
            </div>
            <button
              onClick={()=>{setSearch('');setOnlineOnly(false);setActiveTab('nearby')}}
              style={{ padding:'10px 20px',borderRadius:9,border:'none',background:'#1A5C3A',color:'white',fontSize:13.5,fontWeight:500,cursor:'pointer',boxShadow:'0 2px 8px rgba(26,92,58,.2)',transition:'opacity .15s',letterSpacing:'-.01em' }}
              onMouseEnter={e=>e.currentTarget.style.opacity='.88'}
              onMouseLeave={e=>e.currentTarget.style.opacity='1'}
            >
              Find Partner
            </button>
          </div>
        </div>

        {/* ── Category tabs ── */}
        <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:20,alignItems:'center' }}>
          <Tab
            label="📍 Nearby"
            count={nearbyUsers.length}
            active={activeTab==='nearby'}
            onClick={()=>{setActiveTab('nearby');setShowCityDrop(false)}}
          />
          <Tab
            label="🌐 All"
            count={users.length}
            active={activeTab==='all'}
            onClick={()=>{setActiveTab('all');setShowCityDrop(false)}}
          />

          {/* City dropdown */}
          {cities.length > 0 && (
            <div style={{ position:'relative' }}>
              <button
                onClick={e=>{e.stopPropagation();setShowCityDrop(p=>!p)}}
                style={{
                  display:'flex',alignItems:'center',gap:6,
                  padding:'7px 14px',borderRadius:99,border:'none',
                  background:cities.includes(activeTab)?'#1A5C3A':'white',
                  color:cities.includes(activeTab)?'white':'#706F6C',
                  fontSize:13,fontWeight:cities.includes(activeTab)?500:400,
                  cursor:'pointer',
                  border:`1px solid ${cities.includes(activeTab)?'#1A5C3A':'rgba(0,0,0,.09)'}`,
                  transition:'all .15s',
                  boxShadow:cities.includes(activeTab)?'0 2px 8px rgba(26,92,58,.2)':'none',
                }}
              >
                🏙 {cities.includes(activeTab) ? activeTab : 'By City'}
                {cities.includes(activeTab) && (
                  <span style={{ minWidth:18,height:18,borderRadius:99,background:'rgba(255,255,255,.25)',color:'white',fontSize:10,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 5px' }}>
                    {users.filter(u=>u.city===activeTab).length}
                  </span>
                )}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform:showCityDrop?'rotate(180deg)':'rotate(0)',transition:'transform .15s' }}>
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>

              {/* Dropdown menu */}
              {showCityDrop && (
                <div onClick={e=>e.stopPropagation()} style={{
                  position:'absolute',top:'calc(100% + 6px)',left:0,
                  background:'white',borderRadius:12,
                  border:'1px solid rgba(0,0,0,.09)',
                  boxShadow:'0 8px 24px rgba(0,0,0,.12)',
                  zIndex:50,minWidth:180,overflow:'hidden',
                  animation:'fadeIn .12s ease',
                }}>
                  <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>
                  {cities.map(city => (
                    <button
                      key={city}
                      onClick={e=>{e.stopPropagation();setActiveTab(city);setShowCityDrop(false)}}
                      style={{
                        width:'100%',padding:'9px 14px',border:'none',
                        background:activeTab===city?'#EDF4F0':'white',
                        color:activeTab===city?'#1A5C3A':'#111110',
                        fontSize:13,fontWeight:activeTab===city?500:400,
                        cursor:'pointer',textAlign:'left',
                        display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,
                        transition:'background .1s',
                      }}
                      onMouseEnter={e=>{if(activeTab!==city)e.currentTarget.style.background='#F7F6F3'}}
                      onMouseLeave={e=>{if(activeTab!==city)e.currentTarget.style.background='white'}}
                    >
                      <span>🏙 {city}</span>
                      <span style={{ fontSize:11,color:'#A8A7A2',background:'#F2F1EE',padding:'1px 7px',borderRadius:99 }}>
                        {users.filter(u=>u.city===city).length}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Online only toggle
          <button
            onClick={()=>setOnlineOnly(p=>!p)}
            style={{
              marginLeft:'auto',display:'flex',alignItems:'center',gap:6,
              padding:'7px 12px',borderRadius:99,fontSize:12,fontWeight:500,
              border:`1px solid ${onlineOnly?'#C8DED4':'rgba(0,0,0,.09)'}`,
              background:onlineOnly?'#EDF4F0':'white',
              color:onlineOnly?'#1A5C3A':'#706F6C',
              cursor:'pointer',transition:'all .15s',
            }}
          >
            <span style={{ width:7,height:7,borderRadius:'50%',background:'#22C55E',display:'inline-block' }}/>
            Online Only
            {onlineOnly && <span style={{ fontSize:10 }}>✓</span>}
          </button> */}
        </div>

        {/* ── Result count ── */}
        {!loading && (
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14 }}>
            <p style={{ fontSize:13,color:'#706F6C' }}>
              {search
                ? <><strong style={{ color:'#111110' }}>{filtered.length}</strong> results for "<strong style={{ color:'#1A5C3A' }}>{search}</strong>"</>
                : <><strong style={{ color:'#111110' }}>{filtered.length}</strong> {activeTab==='nearby'?'nearby learners':activeTab==='all'?'total learners':`learners in ${activeTab}`}</>
              }
            </p>
          </div>
        )}

        {/* ── Cards Grid ── */}
        {loading ? (
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',paddingTop:60,gap:14 }}>
            <span style={{ width:24,height:24,border:'2px solid rgba(26,92,58,.15)',borderTopColor:'#1A5C3A',borderRadius:'50%',animation:'spin .75s linear infinite',display:'inline-block' }}/>
            <p style={{ fontSize:13,color:'#A8A7A2' }}>Finding partners near you…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background:'white',border:'1px solid rgba(0,0,0,.07)',borderRadius:16,padding:'60px 24px',textAlign:'center' }}>
            <p style={{ fontSize:40,marginBottom:12 }}>🔍</p>
            <p style={{ fontFamily:'"Instrument Serif",serif',fontSize:22,color:'#111110',marginBottom:6 }}>No learners found</p>
            <p style={{ fontSize:13,color:'#A8A7A2',marginBottom:16 }}>
              {search ? `No one matches "${search}"` : `No learners in this category yet`}
            </p>
            <button onClick={()=>{setSearch('');setActiveTab('all');setOnlineOnly(false)}} style={{ padding:'8px 20px',borderRadius:99,border:'none',background:'#1A5C3A',color:'white',fontSize:13,cursor:'pointer',fontWeight:500 }}>
              Show all learners
            </button>
          </div>
        ) : (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16 }}>
            {filtered.map(u => (
              <UserCard key={u.id} u={u} status={getStatus(u)} onConnect={setSelected}/>
            ))}
          </div>
        )}

      </div>

      {selected && (
        <ConnectSheet
          u={selected}
          onClose={()=>setSelected(null)}
          onSent={id=>setReqSet(s=>new Set([...s,id]))}
        />
      )}
    </div>
  )
}
