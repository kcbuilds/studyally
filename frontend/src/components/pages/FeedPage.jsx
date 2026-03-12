import { useState, useEffect, useRef } from "react";
import { postAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { Avatar, avatarBg, ProgressBar, inputCss, onFocus, onBlur } from "../shared/UI";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import banner from "../../assets/feed-banner.png";

const SKILLS = ["Python","JavaScript","DSA","English","React","ML/AI","Math","Design","Java","French","Spanish","Ruby"];
const SKILL_CLR = {
  Python:"#1A3A6B",JavaScript:"#6B3A1A",DSA:"#4A1A6B",English:"#6B1A1A",
  React:"#1A4A5C","ML/AI":"#1A5C3A",Math:"#3A1A6B",Design:"#6B1A4A",
  Java:"#6B2E1A",French:"#1A2E6B",Spanish:"#6B4A1A",Ruby:"#6B1A2E",
};
const TRENDING = ["Backtracking","Dynamic Programming","Recursion","Binary Search","Graph Theory"];
const TOP_LEARNERS = [{ name:"Akshay", level:85 },{ name:"Swati", level:77 },{ name:"Rakesh", level:60 }];

/* ── Image Picker ────────────────────────────────────────────────────────── */
function ImagePicker({ image, onImage, onRemove }) {
  const ref = useRef()
  const handleFile = (file) => {
    if (!file) return
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return }
    const reader = new FileReader()
    reader.onload = (e) => onImage(e.target.result)
    reader.readAsDataURL(file)
  }
  const handleDrop = (e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }

  if (image) return (
    <div style={{ position:"relative",borderRadius:10,overflow:"hidden",border:"1px solid rgba(0,0,0,.08)" }}>
      <img src={image} alt="preview" style={{ width:"100%",maxHeight:220,objectFit:"cover",display:"block" }}/>
      <button onClick={onRemove} style={{ position:"absolute",top:8,right:8,width:28,height:28,borderRadius:"50%",background:"rgba(0,0,0,.55)",border:"none",color:"white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14 }}>×</button>
    </div>
  )

  return (
    <div onClick={()=>ref.current.click()} onDrop={handleDrop} onDragOver={e=>e.preventDefault()}
      style={{ border:"1.5px dashed rgba(0,0,0,.13)",borderRadius:10,padding:"18px 12px",textAlign:"center",cursor:"pointer",background:"#FAFAF9",transition:"border-color .15s,background .15s" }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor="#1A5C3A";e.currentTarget.style.background="#F0F7F3"}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(0,0,0,.13)";e.currentTarget.style.background="#FAFAF9"}}>
      <input ref={ref} type="file" accept="image/*" style={{ display:"none" }} onChange={e=>handleFile(e.target.files[0])}/>
      <div style={{ fontSize:22,marginBottom:6 }}>🖼</div>
      <p style={{ fontSize:12.5,color:"#706F6C",marginBottom:2 }}>Click or drag to add a photo</p>
      <p style={{ fontSize:11,color:"#A8A7A2" }}>PNG, JPG, GIF · max 5MB</p>
    </div>
  )
}

/* ── Skill Selector ──────────────────────────────────────────────────────── */
function SkillSelector({ skill, onChange }) {
  const [customSkill,   setCustomSkill]   = useState("")
  const [showOtherInput, setShowOtherInput] = useState(false)
  const [allSkills,     setAllSkills]     = useState(SKILLS)
  const inputRef = useRef()

  const isCustom = skill && !SKILLS.includes(skill)

  const selectSkill = (s) => {
    onChange(s)
    setShowOtherInput(false)
    setCustomSkill("")
  }

  const confirmCustom = () => {
    const t = customSkill.trim()
    if (!t) return
    if (!allSkills.includes(t)) setAllSkills(prev => [...prev, t])
    onChange(t)
    setShowOtherInput(false)
    setCustomSkill("")
  }

  return (
    <div style={{ marginBottom:14 }}>
      <p style={{ fontSize:11,fontWeight:500,color:"#706F6C",letterSpacing:".4px",marginBottom:8 }}>SKILL</p>

      {/* Scrollable chip row on mobile, wrap on desktop */}
      <div style={{
        display:"flex",
        flexWrap:"wrap",
        gap:6,
        maxHeight:110,
        overflowY:"auto",
        paddingBottom:4,
      }}>
        {allSkills.map(s => (
          <button key={s} type="button" onClick={()=>selectSkill(s)} style={{
            padding:"5px 12px",borderRadius:99,fontSize:12,cursor:"pointer",
            transition:"all .12s",whiteSpace:"nowrap",flexShrink:0,
            background:skill===s?(SKILL_CLR[s]||"#1A5C3A"):"#F2F1EE",
            color:skill===s?"white":"#706F6C",
            border:`1px solid ${skill===s?"transparent":"rgba(0,0,0,.08)"}`,
            fontWeight:skill===s?500:400,
          }}>{s}</button>
        ))}

        {/* + Other button */}
        <button type="button" onClick={()=>{setShowOtherInput(p=>!p);setTimeout(()=>inputRef.current?.focus(),50)}} style={{
          padding:"5px 12px",borderRadius:99,fontSize:12,cursor:"pointer",
          whiteSpace:"nowrap",flexShrink:0,
          background:showOtherInput||isCustom?"#EDF4F0":"transparent",
          color:showOtherInput||isCustom?"#1A5C3A":"#A8A7A2",
          border:`1px dashed ${showOtherInput||isCustom?"#1A5C3A":"rgba(0,0,0,.2)"}`,
          fontWeight:500,transition:"all .12s",
        }}>
          {isCustom ? `✓ ${skill}` : "+ Other"}
        </button>
      </div>

      {/* Custom skill input */}
      {showOtherInput && (
        <div style={{ display:"flex",gap:6,marginTop:8 }}>
          <input
            ref={inputRef}
            value={customSkill}
            onChange={e=>setCustomSkill(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&confirmCustom()}
            placeholder="e.g. Guitar, Swift, Figma…"
            style={{ ...inputCss,padding:"8px 12px",flex:1,fontSize:13 }}
            onFocus={onFocus} onBlur={onBlur}
          />
          <button onClick={confirmCustom} style={{ padding:"8px 14px",borderRadius:9,border:"none",background:"#1A5C3A",color:"white",fontSize:12,cursor:"pointer",fontWeight:500,whiteSpace:"nowrap" }}>
            Add
          </button>
          <button onClick={()=>{setShowOtherInput(false);setCustomSkill("")}} style={{ padding:"8px 12px",borderRadius:9,border:"1px solid rgba(0,0,0,.1)",background:"white",color:"#706F6C",fontSize:12,cursor:"pointer" }}>
            ✕
          </button>
        </div>
      )}
    </div>
  )
}

/* ── New Post Sheet ──────────────────────────────────────────────────────── */
function NewPostSheet({ onClose, onCreated }) {
  const [title,    setTitle]    = useState("")
  const [content,  setContent]  = useState("")
  const [skill,    setSkill]    = useState("DSA")
  const [progress, setProgress] = useState(25)
  const [image,    setImage]    = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [showImg,  setShowImg]  = useState(false)

  const submit = async () => {
    if (!title.trim()) { toast.error("Add a title"); return }
    setLoading(true)
    try {
      const { data } = await postAPI.create({
        title, content, skill,
        progressPercent: progress,
        imageBase64: image || null,
      })
      toast.success("Posted!")
      onCreated(data)
      onClose()
    } catch {
      toast.error("Failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.35)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:"16px" }}
      onClick={onClose}>
      <div
        style={{
          background:"white",borderRadius:20,width:"100%",maxWidth:520,
          padding:"24px 20px 28px",
          maxHeight:"92vh",overflowY:"auto",
          boxShadow:"0 -8px 40px rgba(0,0,0,.12)",
        }}
        onClick={e=>e.stopPropagation()}
      >
        <div style={{ width:32,height:3,background:"#E8E6E1",borderRadius:2,margin:"0 auto 18px" }}/>
        <h2 style={{ fontFamily:"serif",fontSize:24,color:"#111110",marginBottom:2 }}>Share a learning update</h2>
        <p style={{ fontSize:12,color:"#A8A7A2",marginBottom:18 }}>Tell the community what you learned today</p>

        {/* Skill selector with Other */}
        <SkillSelector skill={skill} onChange={setSkill}/>

        <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:14 }}>
          <div>
            <p style={{ fontSize:11.5,fontWeight:500,color:"#706F6C",letterSpacing:".3px",marginBottom:6 }}>WHAT DID YOU LEARN?</p>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Finally understood closures!"
              style={inputCss} onFocus={onFocus} onBlur={onBlur}/>
          </div>
          <div>
            <p style={{ fontSize:11.5,fontWeight:500,color:"#706F6C",letterSpacing:".3px",marginBottom:6 }}>DETAILS</p>
            <textarea rows={3} value={content} onChange={e=>setContent(e.target.value)}
              placeholder="Key insights, what clicked, next steps…"
              style={{ ...inputCss,resize:"none" }} onFocus={onFocus} onBlur={onBlur}/>
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
            <p style={{ fontSize:11.5,fontWeight:500,color:"#706F6C",letterSpacing:".3px" }}>PROGRESS</p>
            <span style={{ fontSize:12,fontWeight:600,color:"#1A5C3A" }}>{progress}%</span>
          </div>
          <input type="range" min={0} max={100} step={5} value={progress}
            onChange={e=>setProgress(+e.target.value)}
            style={{ width:"100%",marginTop:4,accentColor:"#1A5C3A" }}/>
        </div>

        {/* Image toggle */}
        <div style={{ marginBottom:18 }}>
          <button type="button" onClick={()=>setShowImg(p=>!p)} style={{
            display:"flex",alignItems:"center",gap:7,padding:"7px 13px",borderRadius:99,fontSize:12.5,
            border:`1px solid ${showImg||image?"#C8DED4":"rgba(0,0,0,.1)"}`,
            background:showImg||image?"#EDF4F0":"white",
            color:showImg||image?"#1A5C3A":"#706F6C",
            cursor:"pointer",fontWeight:500,marginBottom:showImg?10:0,transition:"all .15s",
          }}>
            <span style={{ fontSize:14 }}>🖼</span>
            {image ? "✓ Photo added" : "Add a photo"}
            {image && <button onClick={e=>{e.stopPropagation();setImage(null)}} style={{ marginLeft:4,background:"none",border:"none",color:"#8B1A1A",cursor:"pointer",fontSize:13,padding:0 }}>×</button>}
          </button>
          {showImg && <ImagePicker image={image} onImage={setImage} onRemove={()=>setImage(null)}/>}
        </div>

        <div style={{ display:"flex",gap:8 }}>
          <button onClick={onClose} style={{ padding:"10px 18px",borderRadius:10,border:"1px solid rgba(0,0,0,.1)",background:"white",color:"#706F6C",fontSize:13,cursor:"pointer" }}>Cancel</button>
          <button onClick={submit} disabled={loading} style={{ flex:1,padding:"10px",borderRadius:10,border:"none",background:loading?"#4E8B6A":"#1A5C3A",color:"white",fontSize:13.5,fontWeight:500,cursor:loading?"not-allowed":"pointer",boxShadow:"0 2px 12px rgba(26,92,58,.18)",letterSpacing:"-.01em" }}>
            {loading ? "Publishing…" : "Publish update"}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Post Card ───────────────────────────────────────────────────────────── */
function PostCard({ post, onLike, onDelete, currentUserId }) {
  const navigate = useNavigate()
  const [showComments, setShowComments] = useState(false)
  const [commentText,  setCommentText]  = useState("")
  const [imgExpanded,  setImgExpanded]  = useState(false)
  const clr = SKILL_CLR[post.skill] || "#1A5C3A"

  const submitComment = async () => {
    if (!commentText.trim()) return
    try {
      await postAPI.addComment(post.id, { content: commentText })
      setCommentText("")
      toast.success("Comment added!")
    } catch { toast.error("Failed") }
  }

  return (
    <div style={{ background:"white",border:"1px solid rgba(0,0,0,.07)",borderRadius:14,overflow:"hidden",marginBottom:8,boxShadow:"0 1px 3px rgba(0,0,0,.04)" }}>
      <div style={{ height:2,background:clr,opacity:.7 }}/>
      <div style={{ padding:"15px 16px 12px" }}>
        <div style={{ display:"flex",alignItems:"flex-start",padding:5,justifyContent:"space-between",gap:10,marginBottom:11 }}>
          <div
            style={{ display:"flex",alignItems:"center",gap:10,cursor:"pointer" }}
            onClick={()=>navigate(`/app/user/${post.author?.id}`)}
          >
            <Avatar name={post.author?.name||"User"} size={36}/>
            <div>
              <p style={{ fontWeight:500,fontSize:14,color:"#111110",letterSpacing:"-.01em" }}
                onMouseEnter={e=>e.currentTarget.style.color="#1A5C3A"}
                onMouseLeave={e=>e.currentTarget.style.color="#111110"}
              >{post.author?.name||"User"}</p>
              <p style={{ fontSize:11.5,color:"#A8A7A2",marginTop:1 }}>
                {post.createdAt ? formatDistanceToNow(new Date(post.createdAt),{addSuffix:true}) : ""}
              </p>
            </div>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:7 }}>
            <span style={{ padding:"3px 9px",borderRadius:99,fontSize:11,fontWeight:500,background:`${clr}14`,color:clr,border:`1px solid ${clr}28`,flexShrink:0 }}>{post.skill}</span>
            {post.author?.id === currentUserId && (
              <button onClick={()=>onDelete(post.id)} style={{ width:28,height:28,borderRadius:7,border:"1px solid rgba(0,0,0,.08)",background:"white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}
                onMouseEnter={e=>e.currentTarget.style.background="#FDF0F0"}
                onMouseLeave={e=>e.currentTarget.style.background="white"}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </button>
            )}
          </div>
        </div>
        <h4 style={{ fontSize:15,fontWeight:500,color:"#111110",marginBottom:4,lineHeight:1.45,letterSpacing:"-.01em" }}>{post.title}</h4>
        {post.content && <p style={{ fontSize:13,color:"#706F6C",lineHeight:1.65 }}>{post.content}</p>}
        {post.imageBase64 && (
          <div style={{ marginTop:12,borderRadius:10,overflow:"hidden",cursor:"pointer",border:"1px solid rgba(0,0,0,.07)" }} onClick={()=>setImgExpanded(true)}>
            <img src={post.imageBase64} alt="post" style={{ width:"100%",maxHeight:280,objectFit:"cover",display:"block",transition:"transform .2s" }}
              onMouseEnter={e=>e.currentTarget.style.transform="scale(1.01)"}
              onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}/>
          </div>
        )}
        {post.progressPercent != null && (
          <div style={{ marginTop:12,padding:"10px 12px",background:"#F7F6F3",borderRadius:9 }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
              <span style={{ fontSize:10.5,fontWeight:500,color:"#A8A7A2",letterSpacing:".5px" }}>PROGRESS</span>
              <span style={{ fontSize:11.5,fontWeight:600,color:clr }}>{post.progressPercent}%</span>
            </div>
            <ProgressBar value={post.progressPercent} color={clr} height={5}/>
          </div>
        )}
      </div>
      <div style={{ padding:"9px 16px",borderTop:"1px solid rgba(0,0,0,.05)",display:"flex",gap:6,background:"#FAFAF9" }}>
        <button onClick={()=>onLike(post.id)} style={{
          display:"flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:99,
          border:`1px solid ${post.likedByMe?"rgba(139,26,26,.2)":"rgba(0,0,0,.08)"}`,
          background:post.likedByMe?"#FDF0F0":"white",color:post.likedByMe?"#8B1A1A":"#706F6C",
          cursor:"pointer",fontSize:12,fontWeight:post.likedByMe?500:450,transition:"all .15s",
        }}>{post.likedByMe ? "♥" : "♡"} {post.likesCount??0}</button>
        <button onClick={()=>setShowComments(p=>!p)} style={{
          display:"flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:99,
          border:"1px solid rgba(0,0,0,.08)",background:"white",cursor:"pointer",
          fontSize:12,color:"#706F6C",fontWeight:450,transition:"background .12s",letterSpacing:"-.01em",
        }}
        onMouseEnter={e=>e.currentTarget.style.background="#F2F1EE"}
        onMouseLeave={e=>e.currentTarget.style.background="white"}>
          ◇ {post.commentCount||post.comments?.length||0}
        </button>
      </div>
      {showComments && (
        <div style={{ padding:"0 16px 14px",borderTop:"1px solid rgba(0,0,0,.05)" }}>
          {post.comments?.map(c=>(
            <div key={c.id} style={{ display:"flex",gap:8,marginTop:10 }}>
              <Avatar name={c.author?.name||"U"} size={28}/>
              <div style={{ background:"#F7F6F3",borderRadius:9,padding:"7px 11px",flex:1 }}>
                <p style={{ fontSize:11.5,fontWeight:500,color:"#111110" }}>{c.author?.name}</p>
                <p style={{ fontSize:12.5,color:"#706F6C",marginTop:2,lineHeight:1.55 }}>{c.content}</p>
              </div>
            </div>
          ))}
          <div style={{ display:"flex",gap:7,marginTop:10 }}>
            <input value={commentText} onChange={e=>setCommentText(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&submitComment()}
              placeholder="Write a comment…"
              style={{ ...inputCss,padding:"8px 12px",flex:1,fontSize:13 }} onFocus={onFocus} onBlur={onBlur}/>
            <button onClick={submitComment} style={{ padding:"8px 14px",borderRadius:9,border:"none",background:"#1A5C3A",color:"white",fontSize:12.5,cursor:"pointer",fontWeight:500 }}>Post</button>
          </div>
        </div>
      )}
      {imgExpanded && post.imageBase64 && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}
          onClick={()=>setImgExpanded(false)}>
          <button style={{ position:"absolute",top:16,right:16,background:"rgba(255,255,255,.15)",border:"none",color:"white",width:36,height:36,borderRadius:"50%",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
          <img src={post.imageBase64} alt="post" style={{ maxWidth:"100%",maxHeight:"90vh",borderRadius:12,objectFit:"contain" }} onClick={e=>e.stopPropagation()}/>
        </div>
      )}
    </div>
  )
}

/* ── Right Panel ─────────────────────────────────────────────────────────── */
function RightPanel() {
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
      <div style={{ background:"white",border:"1px solid rgba(0,0,0,.07)",borderRadius:14,padding:"16px",boxShadow:"0 1px 3px rgba(0,0,0,.04)" }}>
        <p style={{ fontWeight:500,fontSize:13.5,color:"#111110",marginBottom:13,letterSpacing:"-.01em" }}>Trending topics</p>
        {TRENDING.map((t,i)=>(
          <div key={t} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:i<TRENDING.length-1?10:0 }}>
            <span style={{ fontSize:15 }}>🔥</span>
            <div>
              <p style={{ fontSize:13,fontWeight:500,color:"#111110",letterSpacing:"-.01em" }}>{t}</p>
              <p style={{ fontSize:11,color:"#A8A7A2",marginTop:1 }}>Programming</p>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background:"white",border:"1px solid rgba(0,0,0,.07)",borderRadius:14,padding:"16px",boxShadow:"0 1px 3px rgba(0,0,0,.04)" }}>
        <p style={{ fontWeight:500,fontSize:13.5,color:"#111110",marginBottom:13,letterSpacing:"-.01em" }}>Top learners</p>
        {TOP_LEARNERS.map((l,i)=>(
          <div key={l.name} style={{ display:"flex",alignItems:"center",gap:9,marginBottom:i<TOP_LEARNERS.length-1?10:0 }}>
            <Avatar name={l.name} size={32}/>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:13,fontWeight:500,color:"#111110",letterSpacing:"-.01em" }}>{l.name}</p>
              <p style={{ fontSize:11,color:"#A8A7A2",marginTop:1 }}>Level {l.level}</p>
            </div>
            <span style={{ fontSize:11.5,fontWeight:600,color:"#1A5C3A" }}>Lvl {l.level}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Feed Page ───────────────────────────────────────────────────────────── */
export default function FeedPage() {
  const { user } = useAuthStore()
  const [posts,     setPosts]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showSheet, setShowSheet] = useState(false)

  useEffect(() => {
    postAPI.getAll().then(r=>setPosts(r.data||[])).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  const handleLike = async (id) => {
    setPosts(ps => ps.map(p => {
      if (p.id !== id) return p
      const wasLiked = p.likedByMe === true
      return { ...p, likedByMe:!wasLiked, likesCount: wasLiked ? Math.max(0,(p.likesCount??0)-1) : (p.likesCount??0)+1 }
    }))
    try {
      const { data } = await postAPI.toggleLike(id)
      if (data) setPosts(ps => ps.map(p => p.id===id ? { ...p, likesCount:data.likesCount??p.likesCount, likedByMe:data.likedByMe??p.likedByMe } : p))
    } catch { toast.error("Could not update like") }
  }

  const handleDelete = async (id) => {
    try {
      await postAPI.delete(id)
      setPosts(ps => ps.filter(p => p.id !== id))
      toast.success("Post deleted")
    } catch { toast.error("Failed to delete") }
  }

  const handleCreated = (post) => setPosts(ps => [post, ...ps])

  const Compose = () => (
    <div style={{ background:"white",border:"1px solid rgba(0,0,0,.07)",borderRadius:14,padding:"11px 13px",marginBottom:14,display:"flex",alignItems:"center",gap:10,boxShadow:"0 1px 3px rgba(0,0,0,.04)",cursor:"pointer" }} onClick={()=>setShowSheet(true)}>
      <Avatar name={user?.name||"You"} size={32}/>
      <div style={{ flex:1,background:"#F7F6F3",borderRadius:8,padding:"8px 13px",fontSize:13,color:"#A8A7A2",border:"1px solid rgba(0,0,0,.06)" }}>
        Share what you learned today…
      </div>
      <button onClick={e=>{e.stopPropagation();setShowSheet(true)}} style={{ padding:"7px 14px",borderRadius:9,border:"none",background:"#1A5C3A",color:"white",fontSize:12.5,fontWeight:500,cursor:"pointer",flexShrink:0,boxShadow:"0 2px 8px rgba(26,92,58,.18)",letterSpacing:"-.01em" }}>
        Post
      </button>
    </div>
  )

  const Feed = () => (
    <>
      {loading ? (
        <div style={{ display:"flex",justifyContent:"center",paddingTop:50 }}>
          <span style={{ width:22,height:22,border:"1.5px solid rgba(26,92,58,.2)",borderTopColor:"#1A5C3A",borderRadius:"50%",animation:"spin .75s linear infinite",display:"inline-block" }}/>
        </div>
      ) : posts.length === 0 ? (
        <div style={{ background:"white",border:"1px solid rgba(0,0,0,.07)",borderRadius:14,padding:48,textAlign:"center" }}>
          <p style={{ fontSize:32,marginBottom:10 }}>📝</p>
          <p style={{ fontFamily:'"Instrument Serif",serif',fontSize:20,color:"#111110",marginBottom:5 }}>No posts yet</p>
          <p style={{ fontSize:13,color:"#A8A7A2" }}>Be the first to share a learning update!</p>
        </div>
      ) : (
        posts.map(p => <PostCard key={p.id} post={p} onLike={handleLike} onDelete={handleDelete} currentUserId={user?.id}/>)
      )}
    </>
  )

  return (
    <div style={{ height:"100%",overflowY:"auto",background:"#F7F6F3" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ maxWidth:1200,margin:"0 auto",padding:"24px clamp(16px,4vw,32px)" }}>
        <div className="hidden md:grid" style={{ gridTemplateColumns:"1fr 256px",gap:16,alignItems:"start" }}>
          <div>
            <div style={{ marginBottom:18 }}>
              <h1 style={{ fontSize:28,fontWeight:700,color:"#111110",letterSpacing:"-.3px",marginBottom:4 }}>Community Feed</h1>
              <p style={{ color:"#706F6C",fontSize:14 }}>Share progress, discover ideas, and learn together.</p>
            </div>
            <Compose/>
            <Feed/>
          </div>
          <div style={{ position:"sticky",top:16 }}><RightPanel/></div>
        </div>
        <div className="md:hidden">
          <h2 style={{ fontFamily:"serif",fontSize:20,color:"#111110",marginBottom:12 }}>Community Feed</h2>
          <Compose/>
          <Feed/>
        </div>
      </div>
      {showSheet && <NewPostSheet onClose={()=>setShowSheet(false)} onCreated={handleCreated}/>}
    </div>
  )
}
