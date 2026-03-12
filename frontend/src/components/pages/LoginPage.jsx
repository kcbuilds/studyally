import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { inputCss, onFocus, onBlur } from '../shared/UI'
import toast from 'react-hot-toast'

/* ---------------- LOGO ---------------- */

const Logo = () => (
  <div style={{display:'flex',alignItems:'center',gap:9}}>
    <div style={{width:30,height:30,borderRadius:9,background:'#1A5C3A',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    </div>

    <span style={{
      fontFamily:'"Plus Jakarta Sans", sans-serif',
      fontSize:19,
      fontWeight:700,
      letterSpacing:'-.3px',
      color:'#111110'
    }}>
      Study<span style={{color:"#1A5C3A"}}>Ally</span>
    </span>
  </div>
)

/* ---------------- LOGIN PAGE ---------------- */

export default function LoginPage() {

  const navigate  = useNavigate()
  const { login } = useAuthStore()

  const [form,setForm] = useState({ email:'', password:'' })
  const [showPw,setShowPw] = useState(false)
  const [loading,setLoading] = useState(false)

  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const submit = async e => {

    e.preventDefault()

    if(!form.email || !form.password){
      toast.error('Fill all fields')
      return
    }

    setLoading(true)

    try{
      await login(form)
      navigate('/app/nearby')
    }
    catch(err){
      toast.error(err.response?.data?.message || 'Wrong email or password')
    }
    finally{
      setLoading(false)
    }

  }

  const Label = ({children}) => (
    <label style={{
      display:'block',
      fontSize:11.5,
      fontWeight:500,
      color:'#706F6C',
      letterSpacing:'.3px',
      marginBottom:6
    }}>
      {children}
    </label>
  )

  return (

<div style={{
  minHeight:'100vh',
  background:'#F7F6F3',
  display:'flex',
  fontFamily:'"Geist",sans-serif'
}}>

{/* LEFT PANEL */}

<div className="hidden md:flex" style={{
  width:420,
  flexShrink:0,
  background:'linear-gradient(135deg,#1A5C3A,#134631)',
  flexDirection:'column',
  justifyContent:'space-between',
  padding:'44px 40px'
}}>

<div style={{display:'flex',alignItems:'center',gap:9}}>
  <div style={{width:30,height:30,borderRadius:8,background:'#1A5C3A',display:'flex',alignItems:'center',justifyContent:'center'}}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  </div>

  <span style={{
    fontFamily:'"Plus Jakarta Sans", sans-serif',
    fontSize:19,
    fontWeight:700,
    color:'#FFFFFF'
  }}>
    Study<span style={{color:"#CFE9DD"}}>Ally</span>
  </span>
</div>

<div>

<p style={{
  fontFamily:'"Plus Jakarta Sans", sans-serif',
  fontSize:34,
  fontWeight:700,
  color:'#FFFFFF',
  lineHeight:1.2,
  marginBottom:20
}}>
Find a study partner.<br/>
<span style={{color:'#CFE9DD'}}>Learn together.</span>
</p>

<p style={{
  fontSize:14,
  color:'rgba(255,255,255,0.75)',
  lineHeight:1.75
}}>
Match with learners in your city. Teach what you know and learn new skills together.
</p>

<div style={{display:'flex',gap:28,marginTop:36}}>

{[
['Early','community'],
['Real','practice'],
['Local','partners']
].map(([v,l])=>(
<div key={l}>

<p style={{
  fontFamily:'"Plus Jakarta Sans", sans-serif',
  fontSize:24,
  fontWeight:600,
  color:'#FFFFFF'
}}>
{v}
</p>

<p style={{
  fontSize:12,
  color:'rgba(255,255,255,0.6)',
  marginTop:2
}}>
{l}
</p>

</div>
))}

</div>

</div>

<p style={{
  fontSize:12,
  color:'rgba(255,255,255,0.65)',
  lineHeight:1.7
}}>
"StudyAlly helped me stay consistent with DSA practice." — 
<span style={{color:'#CFE9DD'}}> Priya, Pune</span>
</p>

</div>

{/* RIGHT PANEL */}

<div style={{
  flex:1,
  display:'flex',
  alignItems:'center',
  justifyContent:'center',
  padding:'40px 24px'
}}>

<div style={{width:'100%',maxWidth:360}}>

<div className="md:hidden" style={{marginBottom:36}}>
<Logo/>
</div>

<h2 style={{
  fontFamily:'"Plus Jakarta Sans", sans-serif',
  fontSize:30,
  fontWeight:700,
  color:'#111110',
  marginBottom:6
}}>
Welcome back
</h2>

<p style={{
  fontSize:13.5,
  color:'#A8A7A2',
  marginBottom:28
}}>
Sign in to continue your learning journey
</p>

<form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:14}}>

<div>
<Label>Email address</Label>

<input
type="email"
placeholder="you@example.com"
value={form.email}
onChange={e=>set('email',e.target.value)}
style={inputCss}
onFocus={onFocus}
onBlur={onBlur}
/>

</div>

<div>

<Label>Password</Label>

<div style={{position:'relative'}}>

<input
type={showPw?'text':'password'}
placeholder="••••••••"
value={form.password}
onChange={e=>set('password',e.target.value)}
style={{...inputCss,paddingRight:44}}
onFocus={onFocus}
onBlur={onBlur}
/>

<button
type="button"
onClick={()=>setShowPw(p=>!p)}
style={{
position:'absolute',
right:12,
top:'50%',
transform:'translateY(-50%)',
background:'none',
border:'none',
cursor:'pointer',
color:'#A8A7A2',
fontSize:13,
padding:4
}}
>
{showPw?'Hide':'Show'}
</button>

</div>

</div>

<button
type="submit"
disabled={loading}
style={{
marginTop:4,
width:'100%',
padding:'11px',
borderRadius:10,
border:'none',
background:loading?'#4E8B6A':'#1A5C3A',
color:'white',
fontSize:14,
fontWeight:500,
cursor:loading?'not-allowed':'pointer',
boxShadow:'0 4px 18px rgba(26,92,58,.25)',
transition:'all .2s ease'
}}
>
{loading?'Signing in…':'Sign in'}
</button>

</form>

<p style={{
textAlign:'center',
fontSize:13,
color:'#A8A7A2',
marginTop:24
}}>
No account?{' '}
<Link
to="/register"
style={{
color:'#1A5C3A',
fontWeight:500,
textDecoration:'none'
}}
>
Create one →
</Link>
</p>

</div>
</div>

</div>
)
}