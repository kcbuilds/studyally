
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { partnerAPI } from "../../services/api"
import useAuthStore from "../../store/authStore"
import { Avatar, avatarBg } from "../shared/UI"

/* ─── Icons ───────────────────────── */

const Icons = {
  Discover: (a) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke={a ? "#1A5C3A" : "#706F6C"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="16 8 14 14 8 16 10 10 16 8"/>
    </svg>
  ),

  Community: (a) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke={a ? "#1A5C3A" : "#706F6C"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
    </svg>
  ),

  Messages: (a) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke={a ? "#1A5C3A" : "#706F6C"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),

  Profile: (a) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke={a ? "#1A5C3A" : "#706F6C"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4"/>
      <path d="M5.5 21a6.5 6.5 0 0 1 13 0"/>
    </svg>
  ),
}

/* ─── Navigation ───────────────────────── */

const NAV = [
  { path: "/app/nearby", label: "Discover", icon: Icons.Discover },
  { path: "/app/feed", label: "Community", icon: Icons.Community },
  { path: "/app/chat", label: "Messages", icon: Icons.Messages },
  { path: "/app/profile", label: "Profile", icon: Icons.Profile },
]

export default function MainLayout() {

  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [pending, setPending] = useState(0)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    partnerAPI.getIncoming()
      .then(r => setPending(r.data?.length || 0))
      .catch(()=>{})
  }, [location.pathname])

  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
  }, [])

  const name = user?.name || "You"
  const avColor = user?.avatarColor || avatarBg(name)

  const active = p => location.pathname.startsWith(p)

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#F7F6F3",
        fontFamily: "sans-serif"
      }}
    >

      {/* ───── HEADER ───── */}

      <header
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 clamp(16px,4vw,32px)",
          background: "white",
          borderBottom: "1px solid rgba(0,0,0,.07)",
        }}
      >

        {/* LOGO */}

        <div
          onClick={() => navigate("/app/nearby")}
          style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: "#1A5C3A",
              display: "flex",
              
              
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>

          <span
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: 21,
              fontWeight: 700,
              letterSpacing: "-0.4px",
              color: "#111110"
            }}
          >
            Study<span style={{ color: "#1A5C3A" }}>Ally</span>
          </span>
        </div>


        {/* DESKTOP NAV */}

        {!isMobile && (
          <nav style={{ display: "flex", alignItems: "left", gap: 16 }}>
            {NAV.map(n => {
              const a = active(n.path)
              const Icon = n.icon

              return (
                <NavLink key={n.path} to={n.path} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 14px",
                      borderRadius: 10,
                      background: a ? "#EDF4F0" : "transparent",
                      color: a ? "#1A5C3A" : "#706F6C",
                      fontSize: 14,
                      fontWeight: a ? 600 : 500
                    }}
                  >
                    {Icon(a)}
                    {n.label}

                    {n.label === "Messages" && pending > 0 && (
                      <span
                        style={{
                          marginLeft: 8,
                          background: "#8B1A1A",
                          color: "white",
                          borderRadius: 10,
                          padding: "1px 6px",
                          fontSize: 10
                        }}
                      >
                        {pending}
                      </span>
                    )}
                  </div>
                </NavLink>
              )
            })}
          </nav>
        )}

        {/* RIGHT: BELL + AVATAR */}

        <div style={{ display:"flex",alignItems:"center",gap:10 }}>

          {pending > 0 && (
            <button
              onClick={()=>navigate("/app/profile")}
              style={{
                position:"relative",
                width:36,
                height:36,
                borderRadius:9,
                background:"#FDF0F0",
                border:"1px solid rgba(139,26,26,.12)",
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                cursor:"pointer"
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="#8B1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>

              <span
                style={{
                  position:"absolute",
                  top:-3,
                  right:-3,
                  width:16,
                  height:16,
                  background:"#8B1A1A",
                  color:"white",
                  fontSize:9,
                  fontWeight:700,
                  borderRadius:99,
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  border:"2px solid white"
                }}
              >
                {pending}
              </span>
            </button>
          )}

          

        </div>

      </header>


      {/* ───── PAGE CONTENT ───── */}

      <main style={{ flex:1, overflowY:"auto" }}>
        <Outlet/>
      </main>


      {/* ───── MOBILE BOTTOM NAV ───── */}

      {isMobile && (
        <nav
          style={{
            display:"flex",
            borderTop:"1px solid rgba(0,0,0,.07)",
            background:"white",
            paddingBottom:"max(10px, env(safe-area-inset-bottom))"
          }}
        >
          {NAV.map(n=>{
            const a = active(n.path)

            return (
              <NavLink
                key={n.path}
                to={n.path}
                style={{
                  flex:1,
                  textAlign:"center",
                  padding:"10px 0",
                  textDecoration:"none",
                  fontSize:11,
                  color:a?"#1A5C3A":"#A8A7A2",
                  fontWeight:a?600:500
                }}
              >
                {n.label}

                {n.label==="Messages" && pending>0 && (
                  <div
                    style={{
                      width:6,
                      height:6,
                      borderRadius:"50%",
                      background:"#8B1A1A",
                      margin:"4px auto 0"
                    }}
                  />
                )}
              </NavLink>
            )
          })}
        </nav>
      )}

    </div>
  )
}
