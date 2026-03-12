import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { userAPI, partnerAPI, postAPI } from '../../services/api'
import { Avatar, avatarBg, ProgressBar, Tag, inputCss, onFocus, onBlur } from '../shared/UI'
import toast from 'react-hot-toast'

const SKILLS = ['Python','JavaScript','English','DSA','Design','Java','ML/AI','React','SpringBoot','C++','Math','French','Spanish','Ruby']

/* ── Edit Sheet ──────────────────────────────────────────────────────────── */
function EditSheet({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: user?.name||'',
    bio: user?.bio||'',
    city: user?.city||'',
    teachesSkills: user?.teachesSkills ? [...user.teachesSkills] : [],
    learnsSkills:  user?.learnsSkills  ? [...user.learnsSkills]  : [],
  })
  const [loading, setLoading] = useState(false)
  const [newTeachSkill, setNewTeachSkill] = useState('')
  const [newLearnSkill, setNewLearnSkill] = useState('')
  const [showTeachInput, setShowTeachInput] = useState(false)
  const [showLearnInput, setShowLearnInput] = useState(false)

  const toggle = (k, s) => setForm(f => ({
    ...f, [k]: f[k].includes(s) ? f[k].filter(x => x !== s) : [...f[k], s]
  }))
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    setLoading(true)
    try {
      const { data } = await userAPI.updateProfile(form)
      onSaved(data)
      toast.success('Profile updated!')
      onClose()
    } catch {
      toast.error('Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.35)',backdropFilter:'blur(6px)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }} onClick={onClose}>
      <div style={{ background:'white',borderRadius:18,width:'100%',maxWidth:520,padding:'26px 22px',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,.15)' }} onClick={e=>e.stopPropagation()}>
        <h3 style={{ fontSize:22,marginBottom:18,fontFamily:'"Instrument Serif",serif',color:'#111110' }}>Edit profile</h3>

        {[['name','Name'],['city','City']].map(([k,lbl])=>(
          <div key={k} style={{ marginBottom:14 }}>
            <p style={{ fontSize:12,color:'#706F6C',marginBottom:6 }}>{lbl}</p>
            <input value={form[k]} onChange={e=>set(k,e.target.value)} style={{ ...inputCss,width:'100%',boxSizing:'border-box' }} onFocus={onFocus} onBlur={onBlur}/>
          </div>
        ))}

        <div style={{ marginBottom:14 }}>
          <p style={{ fontSize:12,color:'#706F6C',marginBottom:6 }}>Bio</p>
          <textarea rows={3} value={form.bio} onChange={e=>set('bio',e.target.value)} style={{ ...inputCss,width:'100%',resize:'none',boxSizing:'border-box' }} onFocus={onFocus} onBlur={onBlur}/>
        </div>

        {/* Skills Teach */}
        {[
          { key:'teachesSkills', label:'Skills you teach', accent:'#1A5C3A', bg:'#EDF4F0', newVal:newTeachSkill, setNew:setNewTeachSkill, show:showTeachInput, setShow:setShowTeachInput },
          { key:'learnsSkills',  label:'Skills you learn',  accent:'#7C4A00', bg:'#FDF3E3', newVal:newLearnSkill, setNew:setNewLearnSkill, show:showLearnInput, setShow:setShowLearnInput },
        ].map(({ key, label, accent, bg, newVal, setNew, show, setShow }) => (
          <div key={key} style={{ marginBottom:18 }}>
            <p style={{ fontSize:12,color:'#706F6C',marginBottom:8 }}>{label}</p>
            <div style={{ display:'flex',flexWrap:'wrap',gap:6,marginBottom:8 }}>
              {SKILLS.map(s => {
                const on = form[key].includes(s)
                return (
                  <button key={s} onClick={()=>toggle(key,s)} style={{ padding:'5px 11px',borderRadius:99,fontSize:12,border:`1px solid ${on?accent:'rgba(0,0,0,.08)'}`,background:on?bg:'#F2F1EE',color:on?accent:'#706F6C',cursor:'pointer',fontWeight:on?500:400,transition:'all .12s' }}>
                    {s}
                  </button>
                )
              })}
              {/* Custom added skills */}
              {form[key].filter(s=>!SKILLS.includes(s)).map(s=>(
                <button key={s} onClick={()=>toggle(key,s)} style={{ padding:'5px 11px',borderRadius:99,fontSize:12,border:`1px solid ${accent}`,background:bg,color:accent,cursor:'pointer',fontWeight:500 }}>
                  {s} ×
                </button>
              ))}
              <button onClick={()=>setShow(p=>!p)} style={{ padding:'5px 11px',borderRadius:99,fontSize:12,border:`1px dashed ${accent}`,background:'white',color:accent,cursor:'pointer' }}>
                + Other
              </button>
            </div>
            {show && (
              <div style={{ display:'flex',gap:8 }}>
                <input autoFocus value={newVal} onChange={e=>setNew(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter'&&newVal.trim()){setForm(f=>({...f,[key]:[...f[key],newVal.trim()]}));setNew('');setShow(false)}}}
                  placeholder="Type skill & press Enter…" style={{ ...inputCss,flex:1,padding:'8px 12px' }} onFocus={onFocus} onBlur={onBlur}/>
                <button onClick={()=>{if(newVal.trim()){setForm(f=>({...f,[key]:[...f[key],newVal.trim()]}));setNew('');setShow(false)}}} style={{ padding:'8px 14px',borderRadius:9,border:'none',background:accent,color:'white',cursor:'pointer',fontSize:12,fontWeight:500 }}>Add</button>
              </div>
            )}
          </div>
        ))}

        <div style={{ display:'flex',gap:10,marginTop:20 }}>
          <button onClick={onClose} style={{ flex:1,padding:'10px 18px',borderRadius:10,border:'1px solid rgba(0,0,0,.1)',background:'white',color:'#706F6C',cursor:'pointer',fontSize:13 }}>Cancel</button>
          <button onClick={save} disabled={loading} style={{ flex:2,padding:'10px',borderRadius:10,border:'none',background:'#1A5C3A',color:'white',fontWeight:500,cursor:'pointer',fontSize:13,boxShadow:'0 2px 12px rgba(26,92,58,.2)' }}>
            {loading ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Mini Post Card ──────────────────────────────────────────────────────── */
function PostCard({ post, onDelete, isOwner }) {
  const [expanded, setExpanded] = useState(false)
  const [imgExpanded, setImgExpanded] = useState(false)
  const isLong = (post.content||'').length > 120

  return (
    <div style={{ background:'#F7F6F3',border:'1px solid rgba(0,0,0,.07)',borderRadius:12,padding:'14px 16px',marginBottom:10 }}>
      <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8,marginBottom:8 }}>
        <div style={{ display:'flex',alignItems:'center',gap:8,flexWrap:'wrap' }}>
          {post.skill && (
            <span style={{ padding:'2px 10px',borderRadius:99,fontSize:11,fontWeight:500,background:'#EDF4F0',color:'#1A5C3A',border:'1px solid #C8DED4' }}>{post.skill}</span>
          )}
          {post.progressPercent != null && (
            <span style={{ fontSize:11,color:'#A8A7A2' }}>📈 {post.progressPercent}%</span>
          )}
        </div>
        {isOwner && (
          <button onClick={()=>onDelete(post.id)} style={{ background:'none',border:'none',cursor:'pointer',color:'#A8A7A2',fontSize:13,padding:'0 2px',flexShrink:0,lineHeight:1 }}
            onMouseEnter={e=>e.currentTarget.style.color='#8B1A1A'}
            onMouseLeave={e=>e.currentTarget.style.color='#A8A7A2'}>
            🗑
          </button>
        )}
      </div>

      {post.title && (
        <p style={{ fontSize:14,fontWeight:600,color:'#111110',marginBottom:5,letterSpacing:'-.01em' }}>{post.title}</p>
      )}

      {post.content && (
        <div>
          <p style={{ fontSize:13,color:'#706F6C',lineHeight:1.6,margin:0,whiteSpace:'pre-wrap',wordBreak:'break-word' }}>
            {expanded || !isLong ? post.content : post.content.slice(0,120) + '…'}
          </p>
          {isLong && (
            <button onClick={()=>setExpanded(p=>!p)} style={{ background:'none',border:'none',cursor:'pointer',color:'#1A5C3A',fontSize:12,fontWeight:500,padding:'4px 0 0',display:'block' }}>
              {expanded ? 'Show less ↑' : 'See more ↓'}
            </button>
          )}
        </div>
      )}

      {post.imageBase64 && (
        <div style={{ marginTop:10,borderRadius:9,overflow:'hidden',cursor:'pointer' }} onClick={()=>setImgExpanded(p=>!p)}>
          <img src={post.imageBase64} alt="post" style={{ width:'100%',maxHeight:imgExpanded?600:220,objectFit:imgExpanded?'contain':'cover',display:'block',transition:'max-height .25s',background:'#000',borderRadius:9 }}/>
          {!imgExpanded && <div style={{ position:'relative',marginTop:-28,height:28,background:'linear-gradient(transparent,rgba(0,0,0,.35))',borderRadius:'0 0 9px 9px',display:'flex',alignItems:'center',justifyContent:'flex-end',paddingRight:10 }}><span style={{ fontSize:10,color:'white',fontWeight:500 }}>Click to expand</span></div>}
        </div>
      )}

      <div style={{ display:'flex',alignItems:'center',gap:14,marginTop:10 }}>
        <span style={{ fontSize:11.5,color:'#A8A7A2',display:'flex',alignItems:'center',gap:4 }}>
          ❤️ {post.likesCount||post.likeCount||0}
        </span>
        <span style={{ fontSize:11.5,color:'#A8A7A2',display:'flex',alignItems:'center',gap:4 }}>
          💬 {post.commentsCount||post.comments?.length||0}
        </span>
        <span style={{ fontSize:11,color:'#C8C7C2',marginLeft:'auto' }}>
          {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : ''}
        </span>
      </div>
    </div>
  )
}

/* ── Profile Page ────────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const navigate  = useNavigate()
  const { user, setUser, logout } = useAuthStore()

  const [profile,   setProfile]  = useState(user)
  const [requests,  setRequests] = useState([])
  const [partners,  setPartners] = useState([])
  const [myPosts,   setMyPosts]  = useState([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [tab,       setTab]      = useState('posts')
  const [editOpen,  setEditOpen] = useState(false)

  useEffect(() => {
    partnerAPI.getIncoming().then(r => setRequests(r.data||[])).catch(()=>{})
    partnerAPI.getMyPartners().then(r => setPartners(r.data||[])).catch(()=>{})

    // Load my posts — filter from all posts by author id
    postAPI.getAll()
      .then(r => {
        const all = r.data || []
        const mine = all.filter(p => p.author?.id === user?.id)
        setMyPosts(mine)
      })
      .catch(() => {})
      .finally(() => setPostsLoading(false))
  }, [])

  const handleDeletePost = async (id) => {
    try {
      await postAPI.delete(id)
      setMyPosts(ps => ps.filter(p => p.id !== id))
      toast.success('Post deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const respond = async (id, status) => {
    try {
      await (status === 'ACCEPTED' ? partnerAPI.accept(id) : partnerAPI.decline(id))
      setRequests(rs => rs.filter(r => r.id !== id))
      toast.success(status === 'ACCEPTED' ? 'Partner accepted! 🎉' : 'Request declined')
    } catch {
      toast.error('Failed')
    }
  }

  const levelPct = Math.min(100, ((profile?.totalSessions||0) / 20) * 100)
  const level    = Math.floor((profile?.totalSessions||0) / 5) + 1
  const avColor  = profile?.avatarColor || avatarBg(profile?.name||'')

  const TABS = [
    { key:'posts',    label:`Posts (${myPosts.length})` },
    { key:'requests', label:`Requests (${requests.length})` },
    { key:'partners', label:'Partners' },
  ]

  return (
    <div style={{ height:'100%',overflowY:'auto',background:'#F7F6F3' }}>
      <div style={{ maxWidth:1000,margin:'0 auto',padding:'28px 20px' }}>

        {/* ── Profile Header ── */}
        <div style={{ background:'white',border:'1px solid rgba(0,0,0,.07)',borderRadius:16,padding:20,marginBottom:14 }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12,flexWrap:'wrap' }}>
            <div style={{ display:'flex',gap:14,alignItems:'flex-start' }}>
              <Avatar name={profile?.name||'?'} color={avColor} size={54}/>
              <div>
                <h2 style={{ fontSize:22,marginBottom:3,color:'#111110',letterSpacing:'-.3px' }}>{profile?.name||'Your Name'}</h2>
                <p style={{ fontSize:13,color:'#A8A7A2',marginBottom:4 }}>📍 {profile?.city||'No city set'}</p>
                {profile?.bio && (
                  <p style={{ fontSize:13,color:'#706F6C',lineHeight:1.6,maxWidth:560 }}>{profile.bio}</p>
                )}
              </div>
            </div>
            <div style={{ display:'flex',gap:8,alignItems:'center',flexShrink:0 }}>
              <button onClick={()=>setEditOpen(true)} style={{ padding:'8px 14px',borderRadius:9,border:'1px solid rgba(0,0,0,.08)',background:'#F7F6F3',fontSize:12.5,cursor:'pointer',display:'flex',alignItems:'center',gap:5,fontWeight:500,color:'#3B3A38' }}>
                ✏️ Edit Profile
              </button>
              <button onClick={()=>{logout();navigate('/')}} style={{ padding:'8px 14px',borderRadius:9,border:'1px solid rgba(139,26,26,.15)',background:'#FDF0F0',color:'#8B1A1A',cursor:'pointer',fontSize:12.5,fontWeight:500,display:'flex',alignItems:'center',gap:5 }}>
                ↩ Sign out
              </button>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{ display:'flex',gap:10,flexWrap:'wrap',marginBottom:14 }}>
          {[
            { val: profile?.totalSessions||0,                 label:'Sessions' },
            { val: profile?.averageRating?.toFixed(1)||'—',   label:'Rating'   },
            { val: partners.length,                           label:'Partners' },
            { val: myPosts.length,                            label:'Posts'    },
          ].map(({ val, label }) => (
            <div key={label} style={{ flex:1,minWidth:100,background:'white',borderRadius:12,padding:'16px 12px',textAlign:'center',border:'1px solid rgba(0,0,0,.06)' }}>
              <p style={{ fontSize:22,color:'#111110',lineHeight:1,fontWeight:600 }}>{val}</p>
              <p style={{ fontSize:11,color:'#A8A7A2',marginTop:5 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* ── Level ── */}
        <div style={{ background:'white',border:'1px solid rgba(0,0,0,.07)',borderRadius:14,padding:16,marginBottom:14 }}>
          <div style={{ display:'flex',justifyContent:'space-between',marginBottom:8,fontSize:13 }}>
            <span style={{ fontWeight:500,color:'#111110' }}>Level {level} Learner</span>
            <span style={{ color:'#1A5C3A',fontWeight:500 }}>{profile?.totalSessions||0}/20 sessions</span>
          </div>
          <ProgressBar value={levelPct} height={5}/>
        </div>

        {/* ── Skills ── */}
        {((profile?.teachesSkills?.length||0) + (profile?.learnsSkills?.length||0)) > 0 && (
          <div style={{ background:'white',border:'1px solid rgba(0,0,0,.07)',borderRadius:14,padding:16,marginBottom:14 }}>
            <p style={{ fontSize:12,color:'#A8A7A2',fontWeight:500,letterSpacing:'.3px',textTransform:'uppercase',marginBottom:10 }}>Skills</p>
            <div style={{ display:'flex',flexWrap:'wrap',gap:6 }}>
              {profile?.teachesSkills?.map(s => <Tag key={s} label={s} tone="green"/>)}
              {profile?.learnsSkills?.map(s  => <Tag key={s} label={s} tone="amber"/>)}
            </div>
          </div>
        )}

        {/* ── Tabs ── */}
        <div style={{ background:'white',border:'1px solid rgba(0,0,0,.07)',borderRadius:16,overflow:'hidden',marginBottom:20 }}>
          {/* Tab bar */}
          <div style={{ display:'flex',borderBottom:'1px solid rgba(0,0,0,.06)' }}>
            {TABS.map(({ key, label }) => (
              <button key={key} onClick={()=>setTab(key)} style={{
                flex:1,padding:'12px 8px',border:'none',background:'none',
                fontSize:13,fontWeight:tab===key?500:400,
                color:tab===key?'#1A5C3A':'#706F6C',
                cursor:'pointer',
                borderBottom:tab===key?'2px solid #1A5C3A':'2px solid transparent',
                transition:'all .12s',letterSpacing:'-.01em',
              }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ padding:16 }}>

            {/* ── My Posts tab ── */}
            {tab === 'posts' && (
              postsLoading ? (
                <p style={{ textAlign:'center',color:'#A8A7A2',padding:'24px 0',fontSize:13 }}>Loading posts…</p>
              ) : myPosts.length === 0 ? (
                <div style={{ textAlign:'center',padding:'32px 0' }}>
                  <p style={{ fontSize:32,marginBottom:10 }}>📝</p>
                  <p style={{ fontSize:15,fontWeight:500,color:'#111110',marginBottom:4 }}>No posts yet</p>
                  <p style={{ fontSize:13,color:'#A8A7A2' }}>Share your first learning update in the Community tab</p>
                </div>
              ) : (
                <div>
                  {myPosts.map(p => (
                    <PostCard key={p.id} post={p} isOwner={true} onDelete={handleDeletePost}/>
                  ))}
                </div>
              )
            )}

            {/* ── Requests tab ── */}
            {tab === 'requests' && (
              requests.length === 0 ? (
                <div style={{ textAlign:'center',padding:'32px 0' }}>
                  <p style={{ fontSize:32,marginBottom:10 }}>📬</p>
                  <p style={{ fontSize:15,fontWeight:500,color:'#111110',marginBottom:4 }}>No pending requests</p>
                  <p style={{ fontSize:13,color:'#A8A7A2' }}>When someone sends you a partner request, it'll appear here</p>
                </div>
              ) : requests.map(r => (
                <div key={r.id} style={{ display:'flex',alignItems:'center',gap:12,padding:'12px',background:'#F7F6F3',borderRadius:12,marginBottom:8 }}>
                  <Avatar name={r.sender?.name||'?'} color={r.sender?.avatarColor} size={38}/>
                  <div style={{ flex:1,minWidth:0 }}>
                    <p style={{ fontWeight:500,fontSize:14,color:'#111110',marginBottom:2 }}>{r.sender?.name}</p>
                    {r.message && <p style={{ fontSize:12,color:'#706F6C',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{r.message}</p>}
                  </div>
                  <div style={{ display:'flex',gap:7,flexShrink:0 }}>
                    <button onClick={()=>respond(r.id,'DECLINED')} style={{ padding:'6px 12px',borderRadius:8,border:'1px solid rgba(0,0,0,.1)',background:'white',color:'#706F6C',fontSize:12,cursor:'pointer' }}>Decline</button>
                    <button onClick={()=>respond(r.id,'ACCEPTED')} style={{ padding:'6px 14px',borderRadius:8,border:'none',background:'#1A5C3A',color:'white',fontSize:12,fontWeight:500,cursor:'pointer',boxShadow:'0 2px 8px rgba(26,92,58,.2)' }}>Accept</button>
                  </div>
                </div>
              ))
            )}

            {/* ── Partners tab ── */}
            {tab === 'partners' && (
              partners.length === 0 ? (
                <div style={{ textAlign:'center',padding:'32px 0' }}>
                  <p style={{ fontSize:32,marginBottom:10 }}>🤝</p>
                  <p style={{ fontSize:15,fontWeight:500,color:'#111110',marginBottom:4 }}>No partners yet</p>
                  <p style={{ fontSize:13,color:'#A8A7A2' }}>Find study partners in the Discover tab</p>
                </div>
              ) : partners.map(p => {
                const other = p.sender?.id === user?.id ? p.receiver : p.sender
                return (
                  <div key={p.id} style={{ display:'flex',alignItems:'center',gap:12,padding:'12px',background:'#F7F6F3',borderRadius:12,marginBottom:8 }}>
                    <div style={{ position:'relative' }}>
                      <Avatar name={other?.name||'?'} color={other?.avatarColor} size={38}/>
                      {other?.isOnline && <span style={{ position:'absolute',bottom:0,right:0,width:10,height:10,borderRadius:'50%',background:'#22C55E',border:'2px solid white' }}/>}
                    </div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <p style={{ fontWeight:500,fontSize:14,color:'#111110',marginBottom:2 }}>{other?.name}</p>
                      <p style={{ fontSize:12,color:'#A8A7A2' }}>📍 {other?.city||'—'}</p>
                    </div>
                    <button onClick={()=>navigate(`/app/chat/${other.id}`)} style={{ padding:'7px 14px',borderRadius:8,border:'none',background:'#1A5C3A',color:'white',fontSize:12,fontWeight:500,cursor:'pointer',boxShadow:'0 2px 8px rgba(26,92,58,.2)',flexShrink:0 }}>
                      💬 Chat
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>


      </div>

      {editOpen && (
        <EditSheet
          user={profile}
          onClose={()=>setEditOpen(false)}
          onSaved={u => { setProfile(u); setUser(u) }}
        />
      )}
    </div>
  )
}
