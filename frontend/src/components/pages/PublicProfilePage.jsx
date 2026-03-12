import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { userAPI, postAPI, partnerAPI } from '../../services/api'
import useAuthStore from '../../store/authStore'
import { Avatar, avatarBg, Tag, ProgressBar } from '../shared/UI'
import toast from 'react-hot-toast'

/* ── Mini Post Card ──────────────────────────────────────────────────────── */
function PostCard({ post }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = (post.content||'').length > 140

  return (
    <div style={{ background:'#F7F6F3',border:'1px solid rgba(0,0,0,.07)',borderRadius:12,padding:'14px 16px',marginBottom:10 }}>
      <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8,flexWrap:'wrap' }}>
        {post.skill && <span style={{ padding:'2px 10px',borderRadius:99,fontSize:11,fontWeight:500,background:'#EDF4F0',color:'#1A5C3A',border:'1px solid #C8DED4' }}>{post.skill}</span>}
        {post.progressPercent != null && <span style={{ fontSize:11,color:'#A8A7A2' }}>📈 {post.progressPercent}%</span>}
        <span style={{ fontSize:11,color:'#C8C7C2',marginLeft:'auto' }}>
          {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : ''}
        </span>
      </div>
      {post.title && <p style={{ fontSize:14,fontWeight:600,color:'#111110',marginBottom:5 }}>{post.title}</p>}
      {post.content && (
        <div>
          <p style={{ fontSize:13,color:'#706F6C',lineHeight:1.6,whiteSpace:'pre-wrap',wordBreak:'break-word',margin:0 }}>
            {expanded || !isLong ? post.content : post.content.slice(0,140)+'…'}
          </p>
          {isLong && (
            <button onClick={()=>setExpanded(p=>!p)} style={{ background:'none',border:'none',cursor:'pointer',color:'#1A5C3A',fontSize:12,fontWeight:500,padding:'4px 0 0',display:'block' }}>
              {expanded?'Show less ↑':'See more ↓'}
            </button>
          )}
        </div>
      )}
      {post.imageBase64 && (
        <div style={{ marginTop:10,borderRadius:9,overflow:'hidden' }}>
          <img src={post.imageBase64} alt="" style={{ width:'100%',maxHeight:220,objectFit:'cover',display:'block' }}/>
        </div>
      )}
      <div style={{ display:'flex',gap:14,marginTop:10 }}>
        <span style={{ fontSize:11.5,color:'#A8A7A2' }}>❤️ {post.likesCount||post.likeCount||0}</span>
        <span style={{ fontSize:11.5,color:'#A8A7A2' }}>💬 {post.commentCount||post.comments?.length||0}</span>
      </div>
    </div>
  )
}

/* ── Public Profile Page ─────────────────────────────────────────────────── */
export default function PublicProfilePage() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { user: me } = useAuthStore()

  const [profile,    setProfile]   = useState(null)
  const [posts,      setPosts]     = useState([])
  const [status,     setStatus]    = useState('NONE') // NONE | PENDING | ACCEPTED
  const [loading,    setLoading]   = useState(true)
  const [connecting, setConnecting]= useState(false)

  useEffect(() => {
    if (!id) return

    // Redirect to own profile page
    if (Number(id) === me?.id) {
      navigate('/app/profile', { replace: true })
      return
    }

    const load = async () => {
      setLoading(true)
      try {
        const [userRes, postsRes, partnersRes] = await Promise.allSettled([
          userAPI.getUser(id),
          postAPI.getAll(),
          partnerAPI.getMyPartners(),
        ])

        if (userRes.status === 'fulfilled') setProfile(userRes.value.data)

        if (postsRes.status === 'fulfilled') {
          const mine = (postsRes.value.data||[]).filter(p => p.author?.id === Number(id))
          setPosts(mine)
        }

        if (partnersRes.status === 'fulfilled') {
          const partners = partnersRes.value.data || []
          const isPartner = partners.some(p =>
            p.sender?.id === Number(id) || p.receiver?.id === Number(id)
          )
          if (isPartner) setStatus('ACCEPTED')
        }
      } catch(e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [id])

  const sendRequest = async () => {
    if (status !== 'NONE') return
    setConnecting(true)
    try {
      await partnerAPI.sendRequest({ receiverId: Number(id), message: '' })
      setStatus('PENDING')
      toast.success('Request sent!')
    } catch(err) {
      toast.error(err.response?.data?.message || 'Already sent')
    } finally {
      setConnecting(false)
    }
  }

  const openChat = () => navigate(`/app/chat/${id}`)

  if (loading) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100%',gap:10 }}>
      <span style={{ width:20,height:20,border:'2px solid rgba(26,92,58,.15)',borderTopColor:'#1A5C3A',borderRadius:'50%',animation:'spin .75s linear infinite',display:'inline-block' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!profile) return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:12 }}>
      <p style={{ fontSize:32 }}>😕</p>
      <p style={{ fontSize:16,fontWeight:500,color:'#111110' }}>User not found</p>
      <button onClick={()=>navigate(-1)} style={{ padding:'8px 18px',borderRadius:99,border:'none',background:'#1A5C3A',color:'white',cursor:'pointer',fontSize:13 }}>Go back</button>
    </div>
  )

  const avColor  = profile.avatarColor || avatarBg(profile.name||'')
  const level    = Math.floor((profile.totalSessions||0)/5)+1
  const levelPct = Math.min(100,((profile.totalSessions||0)/20)*100)

  return (
    <div style={{ height:'100%',overflowY:'auto',background:'#F7F6F3' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ maxWidth:720,margin:'0 auto',padding:'24px 16px' }}>

        {/* Back */}
        <button onClick={()=>navigate(-1)} style={{ display:'flex',alignItems:'center',gap:6,background:'none',border:'none',cursor:'pointer',color:'#706F6C',fontSize:13,marginBottom:16,padding:0 }}>
          ← Back
        </button>

        {/* ── Header card ── */}
        <div style={{ background:'white',border:'1px solid rgba(0,0,0,.07)',borderRadius:16,padding:20,marginBottom:12 }}>
          <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,flexWrap:'wrap' }}>
            <div style={{ display:'flex',gap:14,alignItems:'flex-start' }}>
              <Avatar name={profile.name} color={avColor} size={56}/>
              <div>
                <h2 style={{ fontSize:22,fontWeight:700,color:'#111110',marginBottom:3,letterSpacing:'-.3px' }}>{profile.name}</h2>
                <p style={{ fontSize:13,color:'#A8A7A2',marginBottom:6 }}>📍 {profile.city||'—'}</p>
                {profile.bio && <p style={{ fontSize:13,color:'#706F6C',lineHeight:1.6,maxWidth:420 }}>{profile.bio}</p>}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display:'flex',gap:8,flexShrink:0 }}>
              {status === 'ACCEPTED' ? (
                <button onClick={openChat} style={{ padding:'8px 16px',borderRadius:9,border:'none',background:'#1A5C3A',color:'white',fontSize:13,fontWeight:500,cursor:'pointer',boxShadow:'0 2px 8px rgba(26,92,58,.2)',display:'flex',alignItems:'center',gap:5 }}>
                  💬 Message
                </button>
              ) : (
                <button onClick={sendRequest} disabled={status==='PENDING'||connecting} style={{
                  padding:'8px 16px',borderRadius:9,border:'none',fontSize:13,fontWeight:500,cursor:status==='NONE'?'pointer':'default',
                  background:status==='PENDING'?'#F2F1EE':'#1A5C3A',
                  color:status==='PENDING'?'#A8A7A2':'white',
                  boxShadow:status==='NONE'?'0 2px 8px rgba(26,92,58,.2)':'none',
                }}>
                  {connecting ? 'Sending…' : status==='PENDING' ? 'Request Sent' : '+ Connect'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{ display:'flex',gap:10,marginBottom:12,flexWrap:'wrap' }}>
          {[
            { val: profile.totalSessions||0,               label:'Sessions' },
            { val: profile.averageRating?.toFixed(1)||'—', label:'Rating'   },
            { val: posts.length,                           label:'Posts'    },
          ].map(({ val, label }) => (
            <div key={label} style={{ flex:1,minWidth:90,background:'white',borderRadius:12,padding:'14px 12px',textAlign:'center',border:'1px solid rgba(0,0,0,.06)' }}>
              <p style={{ fontSize:22,fontWeight:600,color:'#111110',lineHeight:1 }}>{val}</p>
              <p style={{ fontSize:11,color:'#A8A7A2',marginTop:4 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* ── Level ── */}
        <div style={{ background:'white',border:'1px solid rgba(0,0,0,.07)',borderRadius:12,padding:'14px 16px',marginBottom:12 }}>
          <div style={{ display:'flex',justifyContent:'space-between',marginBottom:8,fontSize:13 }}>
            <span style={{ fontWeight:500,color:'#111110' }}>Level {level} Learner</span>
            <span style={{ color:'#1A5C3A',fontWeight:500 }}>{profile.totalSessions||0}/20 sessions</span>
          </div>
          <ProgressBar value={levelPct} height={5}/>
        </div>

        {/* ── Skills ── */}
        {((profile.teachesSkills?.length||0)+(profile.learnsSkills?.length||0)) > 0 && (
          <div style={{ background:'white',border:'1px solid rgba(0,0,0,.07)',borderRadius:12,padding:'14px 16px',marginBottom:12 }}>
            <p style={{ fontSize:11,color:'#A8A7A2',fontWeight:600,letterSpacing:'.5px',textTransform:'uppercase',marginBottom:10 }}>Skills</p>
            <div style={{ display:'flex',flexWrap:'wrap',gap:6 }}>
              {(profile.teachesSkills||[]).map(s => <Tag key={s} label={s} tone="green"/>)}
              {(profile.learnsSkills||[]).map(s  => <Tag key={s} label={s} tone="amber"/>)}
            </div>
          </div>
        )}

        {/* ── Posts ── */}
        <div style={{ background:'white',border:'1px solid rgba(0,0,0,.07)',borderRadius:12,overflow:'hidden' }}>
          <div style={{ padding:'14px 16px',borderBottom:'1px solid rgba(0,0,0,.06)' }}>
            <p style={{ fontSize:14,fontWeight:600,color:'#111110' }}>Posts <span style={{ fontSize:12,color:'#A8A7A2',fontWeight:400 }}>({posts.length})</span></p>
          </div>
          <div style={{ padding:posts.length?'12px 16px':0 }}>
            {posts.length === 0 ? (
              <div style={{ textAlign:'center',padding:'36px 0' }}>
                <p style={{ fontSize:28,marginBottom:8 }}>📝</p>
                <p style={{ fontSize:14,color:'#706F6C' }}>No posts yet</p>
              </div>
            ) : posts.map(p => <PostCard key={p.id} post={p}/>)}
          </div>
        </div>

      </div>
    </div>
  )
}
