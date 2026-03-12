import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { userAPI, authAPI } from '../../services/api'
import { inputCss, onFocus, onBlur } from '../shared/UI'
import toast from 'react-hot-toast'

const ALL_SKILLS = ['Python','JavaScript','DSA','English','React','ML/AI','Math','Design','Java']
const SKILL_BG = {Python:'#1A3A6B',JavaScript:'#6B3A1A',DSA:'#4A1A6B',English:'#6B1A1A',React:'#1A4A5C',
  'ML/AI':'#1A5C3A',Math:'#3A1A6B',Design:'#6B1A4A',Java:'#6B2E1A'}

const Label = ({children}) => (
  <label style={{display:'block',fontSize:11.5,fontWeight:500,color:'#706F6C',letterSpacing:'.3px',marginBottom:6}}>
    {children}
  </label>
)

const FieldInput = ({label,type='text',placeholder,value,onChange}) => (
  <div>
    <Label>{label}</Label>
    <input type={type} placeholder={placeholder} value={value} onChange={onChange}
      style={inputCss} onFocus={onFocus} onBlur={onBlur}/>
  </div>
)

const Logo = () => (
  <div style={{display:'flex',alignItems:'center',gap:9}}>
    <div style={{width:30,height:30,borderRadius:8,background:'#1A5C3A',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    </div>
    <span style={{fontFamily:'"Plus Jakarta Sans", sans-serif',fontSize:20,fontWeight:700,color:'#111110'}}>
      Study<span style={{color:'#1A5C3A'}}>Ally</span>
    </span>
  </div>
)

const STEPS = ['Account','Verify','Location','Skills']

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, loading } = useAuthStore()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    name:'',email:'',password:'',city:'',bio:'',teachesSkills:[],learnsSkills:[],
  })

  // OTP state
  const [otp,         setOtp]         = useState('')
  const [otpLoading,  setOtpLoading]  = useState(false)
  const [otpSent,     setOtpSent]     = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  // Location state
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsOk,      setGpsOk]      = useState(false)
  const [gpsCords,   setGpsCords]   = useState(null)

  // Skills state
  const [teachOther, setTeachOther] = useState('')
  const [learnOther, setLearnOther] = useState('')
  const [showTO,     setShowTO]     = useState(false)
  const [showLO,     setShowLO]     = useState(false)

  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  const toggle = (k,s) => set(k, form[k].includes(s)?form[k].filter(x=>x!==s):[...form[k],s])
  const addCustom = (k,val,setVal,setShow) => {
    const t=val.trim(); if(!t) return
    if(!form[k].includes(t)) set(k,[...form[k],t])
    setVal(''); setShow(false)
  }

  const startResendTimer = () => {
    setResendTimer(60)
    const iv = setInterval(() => {
      setResendTimer(t => { if(t<=1){clearInterval(iv);return 0} return t-1 })
    }, 1000)
  }

  const sendOtp = async () => {
    setOtpLoading(true)
    try {
      await authAPI.sendOtp({ email: form.email })
      setOtpSent(true)
      startResendTimer()
      toast.success('OTP sent to ' + form.email)
    } catch {
      toast.error('Failed to send OTP. Check the email.')
    } finally {
      setOtpLoading(false)
    }
  }

  const verifyOtp = async () => {
    if(otp.length !== 6) { toast.error('Enter the 6-digit OTP'); return }
    setOtpLoading(true)
    try {
      await authAPI.verifyOtp({ email: form.email, otp })
      setOtpVerified(true)
      toast.success('Email verified! ✓')
      setTimeout(() => setStep(2), 600)
    } catch {
      toast.error('Invalid OTP. Try again.')
    } finally {
      setOtpLoading(false)
    }
  }

  const detectGPS = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return }
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords
        setGpsCords({ latitude, longitude })
        try {
          // Nominatim with Accept-Language for English results
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          )
          const d = await r.json()
          const a = d.address || {}
          // Indian city priority — Ichalkaranji = a.town, Kolhapur = a.city
          // Also check a.suburb for localities inside big cities
          const city =
            a.city ||
            a.town ||
            a.city_district ||
            a.village ||
            a.municipality ||
            a.suburb ||
            a.county ||
            a.state_district || ''
          if (city) {
            set('city', city)
            setGpsOk(true)
            // Warn if city looks wrong (e.g. Chrome cached location from another country)
            const countryCode = (a.country_code || '').toLowerCase()
            if (countryCode && countryCode !== 'in') {
              toast('⚠️ Detected: ' + city + ' — if wrong, enter your city manually', { icon: '📍', duration: 5000 })
            } else {
              toast.success('Location detected: ' + city)
            }
          } else {
            toast.error('Could not detect city. Enter manually.')
          }
        } catch {
          // Fallback to bigdatacloud with better Indian city extraction
          try {
            const r2 = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            )
            const d2 = await r2.json()
            const admins = d2.localityInfo?.administrative || []
            const cityEntry = admins.find(x => ['City','Town','Village','Municipality'].includes(x.description))
            const city2 = cityEntry?.name || d2.city || d2.locality || ''
            if (city2) {
              set('city', city2)
              setGpsOk(true)
              toast.success('Location detected: ' + city2)
            } else {
              toast.error('Could not detect city. Enter manually.')
            }
          } catch {
            toast.error('Location lookup failed. Enter city manually.')
          }
        }
        setGpsLoading(false)
      },
      (err) => {
        setGpsLoading(false)
        if (err.code === 1) toast.error('Permission denied. Please allow location access.')
        else if (err.code === 2) toast.error('Location unavailable. Enter city manually.')
        else toast.error('Request timed out. Enter city manually.')
      },
      { timeout: 15000, enableHighAccuracy: true, maximumAge: 0 }
    )
  }

  const nextStep0 = () => {
    if(!form.name||!form.email||!form.password){toast.error('Fill all fields');return}
    if(form.password.length<6){toast.error('Password too short');return}
    setStep(1)
    setTimeout(() => {
      authAPI.sendOtp({ email: form.email })
        .then(() => { setOtpSent(true); startResendTimer(); toast.success('OTP sent to ' + form.email) })
        .catch(() => toast.error('Failed to send OTP'))
    }, 300)
  }

  // ── FIXED submit — pass latitude/longitude correctly ─────────────────────
  // Geocode a city name → { latitude, longitude } using Nominatim
  const geocodeCity = async (cityName) => {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName + ', India')}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const results = await r.json()
      if (results.length > 0) {
        return {
          latitude:  parseFloat(results[0].lat),
          longitude: parseFloat(results[0].lon),
        }
      }
    } catch {}
    return null
  }

  const submit = async () => {
    if(!form.teachesSkills.length||!form.learnsSkills.length){
      toast.error('Pick at least one skill in each'); return
    }
    try {
      await register(form)

      // Determine best coords to save
      let coordsToSave = null

      if (gpsCords) {
        const { latitude: lat, longitude: lng } = gpsCords
        const isIndia = lat >= 6 && lat <= 37 && lng >= 68 && lng <= 97
        if (isIndia) {
          coordsToSave = { latitude: lat, longitude: lng }
        }
      }

      // No valid GPS? Geocode the typed city name instead
      if (!coordsToSave && form.city.trim()) {
        const cityCoords = await geocodeCity(form.city.trim())
        if (cityCoords) {
          coordsToSave = cityCoords
        }
      }

      // Save coords to backend
      if (coordsToSave) {
        try {
          await userAPI.updateProfile(coordsToSave)
        } catch {
          // Non-fatal
        }
      }

      navigate('/app/nearby')
    } catch(err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    }
  }

  const SkillChip = ({s, active, onClick}) => (
    <button type="button" onClick={onClick} style={{
      padding:'5px 12px',borderRadius:99,fontSize:12,fontWeight:active?500:400,
      cursor:'pointer',transition:'all .12s',letterSpacing:'-.01em',
      background:active?(SKILL_BG[s]||'#1A5C3A'):'#F2F1EE',
      color:active?'white':'#706F6C',
      border:`1px solid ${active?'transparent':'rgba(0,0,0,.08)'}`,
    }}>{s}</button>
  )

  return (
    <div style={{minHeight:'100vh',background:'#F7F6F3',display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'40px 16px 80px',fontFamily:'"Geist",sans-serif'}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{width:'100%',maxWidth:420}} className="anim-fade-up">
        <div style={{marginBottom:28}}><Logo /></div>

        {/* Step indicator */}
        <div style={{display:'flex',alignItems:'center',marginBottom:28}}>
          {STEPS.map((s,i)=>(
            <div key={s} style={{display:'flex',alignItems:'center',flex:i<STEPS.length-1?1:0}}>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                <div style={{
                  width:26,height:26,borderRadius:'50%',fontSize:11,fontWeight:600,
                  display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s',
                  background:i<step?'#1A5C3A':i===step?'#1A5C3A':'transparent',
                  color:i<=step?'white':'#A8A7A2',
                  border:`1.5px solid ${i<=step?'#1A5C3A':'rgba(0,0,0,.12)'}`,
                }}>{i<step?'✓':i+1}</div>
                <span style={{fontSize:10,fontWeight:i===step?500:400,color:i===step?'#111110':'#A8A7A2',whiteSpace:'nowrap'}}>{s}</span>
              </div>
              {i<STEPS.length-1&&<div style={{flex:1,height:1,margin:'0 6px 14px',background:i<step?'#1A5C3A':'rgba(0,0,0,.1)',transition:'background .2s'}}/>}
            </div>
          ))}
        </div>

        <div style={{background:'white',border:'1px solid rgba(0,0,0,.08)',borderRadius:16,padding:'26px 22px',boxShadow:'0 1px 3px rgba(0,0,0,.05),0 4px 12px rgba(0,0,0,.04)'}}>

          {/* ─── Step 0: Account ─── */}
          {step===0&&(
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <div>
                <h2 style={{fontFamily:'Plus Jakarta Sans',fontWeight:700,fontSize:26,color:'#111110',marginBottom:4}}>Create account</h2>
                <p style={{fontSize:13,color:'#A8A7A2'}}>Join learners across 12+ cities</p>
              </div>
              <FieldInput label="Full name" placeholder="Your name" value={form.name} onChange={e=>set('name',e.target.value)}/>
              <FieldInput label="Email" type="email" placeholder="you@email.com" value={form.email} onChange={e=>set('email',e.target.value)}/>
              <FieldInput label="Password" type="password" placeholder="Min 6 characters" value={form.password} onChange={e=>set('password',e.target.value)}/>
              <button onClick={nextStep0} style={{width:'100%',padding:'11px',borderRadius:10,border:'none',background:'#1A5C3A',color:'white',fontSize:14,fontWeight:500,cursor:'pointer',boxShadow:'0 2px 12px rgba(26,92,58,.2)',marginTop:4,letterSpacing:'-.01em'}}>
                Continue →
              </button>
            </div>
          )}

          {/* ─── Step 1: Verify OTP ─── */}
          {step===1&&(
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <div>
                <h2 style={{fontFamily:'Plus Jakarta Sans',fontWeight:700,fontSize:26,color:'#111110',marginBottom:4}}>Verify email</h2>
                <p style={{fontSize:13,color:'#A8A7A2'}}>
                  {otpSent
                    ? <>We sent a 6-digit code to <strong style={{color:'#111110'}}>{form.email}</strong></>
                    : 'Sending code…'
                  }
                </p>
              </div>

              <div>
                <Label>Enter OTP</Label>
                <input
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
                  placeholder="000000"
                  maxLength={6}
                  style={{...inputCss,fontSize:22,letterSpacing:8,textAlign:'center',fontWeight:600,color:'#111110'}}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </div>

              {otpVerified ? (
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'12px',background:'#EDF4F0',borderRadius:10,border:'1px solid #C8DED4'}}>
                  <span style={{color:'#1A5C3A',fontSize:16}}>✓</span>
                  <span style={{color:'#1A5C3A',fontWeight:500,fontSize:13}}>Email verified!</span>
                </div>
              ) : (
                <button
                  onClick={verifyOtp}
                  disabled={otpLoading || otp.length !== 6}
                  style={{width:'100%',padding:'11px',borderRadius:10,border:'none',background:otp.length===6?'#1A5C3A':'#E8E6E1',color:otp.length===6?'white':'#A8A7A2',fontSize:14,fontWeight:500,cursor:otp.length===6?'pointer':'not-allowed',transition:'all .15s',letterSpacing:'-.01em'}}
                >
                  {otpLoading ? 'Verifying…' : 'Verify OTP'}
                </button>
              )}

              <div style={{textAlign:'center'}}>
                {resendTimer > 0 ? (
                  <p style={{fontSize:12.5,color:'#A8A7A2'}}>Resend in {resendTimer}s</p>
                ) : (
                  <button onClick={sendOtp} disabled={otpLoading} style={{fontSize:12.5,color:'#1A5C3A',background:'none',border:'none',cursor:'pointer',fontWeight:500}}>
                    Resend OTP
                  </button>
                )}
              </div>

              <button onClick={()=>setStep(0)} style={{padding:'10px',borderRadius:10,border:'1px solid rgba(0,0,0,.1)',background:'white',color:'#706F6C',fontSize:13,cursor:'pointer'}}>
                ← Change email
              </button>
            </div>
          )}

          {/* ─── Step 2: Location ─── */}
          {step===2&&(
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <div>
                <h2 style={{fontFamily:'Plus Jakarta Sans',fontWeight:700,fontSize:26,color:'#111110',marginBottom:4}}>Where are you?</h2>
                <p style={{fontSize:13,color:'#A8A7A2'}}>We'll match you with people nearby</p>
              </div>

              {/* GPS button — works on phone, may be wrong on PC */}
              <button onClick={detectGPS} disabled={gpsLoading} style={{
                width:'100%',padding:'10px 14px',borderRadius:10,cursor:gpsLoading?'not-allowed':'pointer',
                display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                background:gpsOk?'#EDF4F0':'#F7F6F3',
                border:`1px solid ${gpsOk?'#C8DED4':'rgba(0,0,0,.1)'}`,
                color:gpsOk?'#1A5C3A':'#3B3A38',fontSize:13,fontWeight:500,transition:'all .15s',
              }}>
                {gpsLoading
                  ? <><span style={{width:13,height:13,border:'1.5px solid rgba(26,92,58,.2)',borderTopColor:'#1A5C3A',borderRadius:'50%',animation:'spin .75s linear infinite',display:'inline-block'}}/> Detecting…</>
                  : gpsOk
                    ? <><span>✓</span> {form.city}{gpsCords && <span style={{fontSize:11,color:'#1A5C3A',marginLeft:6,opacity:.8}}>{gpsCords.latitude.toFixed(4)}, {gpsCords.longitude.toFixed(4)}</span>}</>
                    : <><span>📍</span> Auto-detect location</>
                }
              </button>

              {/* Show detected coords so user can verify */}
              {gpsOk && gpsCords && (
                <div style={{background:'#F7F6F3',border:'1px solid rgba(0,0,0,.07)',borderRadius:9,padding:'8px 12px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <span style={{fontSize:11.5,color:'#706F6C'}}>
                    🗺 Coords: <strong style={{color:'#111110'}}>{gpsCords.latitude.toFixed(5)}, {gpsCords.longitude.toFixed(5)}</strong>
                  </span>
                  <button onClick={()=>{setGpsOk(false);setGpsCords(null);set('city','')}} style={{fontSize:11,color:'#8B1A1A',background:'none',border:'none',cursor:'pointer',fontWeight:500}}>✕ Reset</button>
                </div>
              )}

              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{flex:1,height:1,background:'rgba(0,0,0,.08)'}}/>
                <span style={{fontSize:11.5,color:'#A8A7A2'}}>enter city manually</span>
                <div style={{flex:1,height:1,background:'rgba(0,0,0,.08)'}}/>
              </div>

              <div>
                <Label>City</Label>
                <input placeholder="e.g. Ichalkaranji, Kolhapur, Pune" value={form.city}
                  onChange={e=>{set('city',e.target.value);setGpsOk(false)}}
                  style={inputCss} onFocus={onFocus} onBlur={onBlur}/>
                <p style={{fontSize:11,color:'#A8A7A2',marginTop:5}}>
                  💡 On PC, auto-detect may show wrong city. Just type your city above.
                </p>
              </div>

              <div>
                <Label>Bio <span style={{fontWeight:400,color:'#A8A7A2',fontSize:11}}>(optional)</span></Label>
                <textarea rows={2} placeholder="Tell others about yourself..." value={form.bio}
                  onChange={e=>set('bio',e.target.value)}
                  style={{...inputCss,resize:'none'}} onFocus={onFocus} onBlur={onBlur}/>
              </div>

              <div style={{display:'flex',gap:8,marginTop:4}}>
                <button onClick={()=>setStep(1)} style={{padding:'10px 18px',borderRadius:10,border:'1px solid rgba(0,0,0,.1)',background:'white',color:'#706F6C',fontSize:13,cursor:'pointer'}}>Back</button>
                <button onClick={async()=>{
                  if(!form.city.trim()){toast.error('Enter your city');return}
                  // If no GPS coords yet, geocode the typed city
                  if(!gpsCords && form.city.trim()) {
                    setGpsLoading(true)
                    const coords = await geocodeCity(form.city.trim())
                    setGpsLoading(false)
                    if(coords) {
                      setGpsCords(coords)
                      setGpsOk(true)
                      toast.success(`📍 Mapped: ${form.city} (${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)})`)
                    }
                  }
                  setStep(3)
                }} style={{flex:1,padding:'10px',borderRadius:10,border:'none',background:'#1A5C3A',color:'white',fontSize:14,fontWeight:500,cursor:'pointer',boxShadow:'0 2px 12px rgba(26,92,58,.2)',letterSpacing:'-.01em'}}>
                  {gpsLoading ? 'Mapping city…' : 'Continue →'}
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 3: Skills ─── */}
          {step===3&&(
            <div>
              <h2 style={{fontFamily:'Plus Jakarta Sans',fontWeight:700,fontSize:26,color:'#111110',marginBottom:4}}>Your skills</h2>
              <p style={{fontSize:13,color:'#A8A7A2',marginBottom:20}}>What do you teach? What do you want to learn?</p>

              <div style={{marginBottom:18}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10}}>
                  <span style={{width:6,height:6,borderRadius:'50%',background:'#1A5C3A',display:'inline-block'}}/>
                  <Label>I can teach</Label>
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                  {ALL_SKILLS.map(s=><SkillChip key={s} s={s} active={form.teachesSkills.includes(s)} onClick={()=>toggle('teachesSkills',s)}/>)}
                  {form.teachesSkills.filter(s=>!ALL_SKILLS.includes(s)).map(s=>(
                    <button key={s} type="button" onClick={()=>toggle('teachesSkills',s)} style={{padding:'5px 10px',borderRadius:99,fontSize:12,cursor:'pointer',background:'#1A5C3A',color:'white',border:'none'}}>{s} ×</button>
                  ))}
                  <button type="button" onClick={()=>setShowTO(p=>!p)} style={{padding:'5px 11px',borderRadius:99,fontSize:12,cursor:'pointer',background:'transparent',color:'#A8A7A2',border:'1px dashed rgba(0,0,0,.15)'}}>+ other</button>
                </div>
                {showTO&&<div style={{display:'flex',gap:6,marginTop:8}}>
                  <input autoFocus value={teachOther} onChange={e=>setTeachOther(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&addCustom('teachesSkills',teachOther,setTeachOther,setShowTO)}
                    placeholder="e.g. Guitar" style={{...inputCss,padding:'8px 12px',flex:1}} onFocus={onFocus} onBlur={onBlur}/>
                  <button onClick={()=>addCustom('teachesSkills',teachOther,setTeachOther,setShowTO)}
                    style={{padding:'8px 14px',borderRadius:9,border:'none',background:'#1A5C3A',color:'white',fontSize:12,cursor:'pointer'}}>Add</button>
                </div>}
              </div>

              <div style={{marginBottom:22}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10}}>
                  <span style={{width:6,height:6,borderRadius:'50%',background:'#7C4A00',display:'inline-block'}}/>
                  <Label>I want to learn</Label>
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                  {ALL_SKILLS.map(s=>{
                    const on=form.learnsSkills.includes(s)
                    return <button key={s} type="button" onClick={()=>toggle('learnsSkills',s)} style={{
                      padding:'5px 12px',borderRadius:99,fontSize:12,fontWeight:on?500:400,cursor:'pointer',
                      background:on?'#FDF3E3':'#F2F1EE',color:on?'#7C4A00':'#706F6C',
                      border:`1px solid ${on?'#F0D9A8':'rgba(0,0,0,.08)'}`,transition:'all .12s',
                    }}>{s}</button>
                  })}
                  {form.learnsSkills.filter(s=>!ALL_SKILLS.includes(s)).map(s=>(
                    <button key={s} type="button" onClick={()=>toggle('learnsSkills',s)} style={{padding:'5px 10px',borderRadius:99,fontSize:12,cursor:'pointer',background:'#FDF3E3',color:'#7C4A00',border:'1px solid #F0D9A8'}}>{s} ×</button>
                  ))}
                  <button type="button" onClick={()=>setShowLO(p=>!p)} style={{padding:'5px 11px',borderRadius:99,fontSize:12,cursor:'pointer',background:'transparent',color:'#A8A7A2',border:'1px dashed rgba(0,0,0,.15)'}}>+ other</button>
                </div>
                {showLO&&<div style={{display:'flex',gap:6,marginTop:8}}>
                  <input autoFocus value={learnOther} onChange={e=>setLearnOther(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&addCustom('learnsSkills',learnOther,setLearnOther,setShowLO)}
                    placeholder="e.g. Piano" style={{...inputCss,padding:'8px 12px',flex:1}} onFocus={onFocus} onBlur={onBlur}/>
                  <button onClick={()=>addCustom('learnsSkills',learnOther,setLearnOther,setShowLO)}
                    style={{padding:'8px 14px',borderRadius:9,border:'none',background:'#1A5C3A',color:'white',fontSize:12,cursor:'pointer'}}>Add</button>
                </div>}
              </div>

              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>setStep(2)} style={{padding:'10px 18px',borderRadius:10,border:'1px solid rgba(0,0,0,.1)',background:'white',color:'#706F6C',fontSize:13,cursor:'pointer'}}>Back</button>
                <button onClick={submit} disabled={loading} style={{flex:1,padding:'10px',borderRadius:10,border:'none',background:loading?'#4E8B6A':'#1A5C3A',color:'white',fontSize:14,fontWeight:500,cursor:loading?'not-allowed':'pointer',boxShadow:'0 2px 12px rgba(26,92,58,.2)',letterSpacing:'-.01em'}}>
                  {loading?'Creating account…':'Join StudyAlly'}
                </button>
              </div>
            </div>
          )}
        </div>

        <p style={{textAlign:'center',fontSize:13,color:'#A8A7A2',marginTop:20}}>
          Have an account? <Link to="/login" style={{color:'#1A5C3A',fontWeight:500,textDecoration:'none'}}>Sign in →</Link>
        </p>
      </div>
    </div>
  )
}
