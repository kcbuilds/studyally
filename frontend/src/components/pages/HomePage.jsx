import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

/* ── Responsive helper ── */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

/* ---------------- LOGO ---------------- */
const Logo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
    <div style={{ width: 32, height: 32, borderRadius: 9, background: "#1A5C3A", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    </div>
    <span style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 21, fontWeight: 700, letterSpacing: "-0.4px", color: "#111110" }}>
      Study<span style={{ color: "#1A5C3A" }}>Ally</span>
    </span>
  </div>
);

/* ---------------- DIVIDER ---------------- */
function SectionDivider() {
  return (
    <div style={{ height: 1, background: "linear-gradient(90deg,transparent,#e4e3df,transparent)", maxWidth: 900, margin: "0 auto 70px" }} />
  );
}

/* ---------------- SKILL TAGS ---------------- */
function SkillTags() {
  const tags = ["DSA Partner", "English Practice", "Interview Prep", "React Study", "LeetCode Prep"];
  return (
    <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
      {tags.map((tag, i) => (
        <span key={i} style={{ fontSize: 12, padding: "6px 12px", borderRadius: 20, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)", border: "1px solid rgba(0,0,0,.06)", color: "#1A5C3A" }}>
          {tag}
        </span>
      ))}
    </div>
  );
}

/* ---------------- LIVE ACTIVITY ---------------- */
function LiveActivity() {
  const activities = [
    "Rahul joined from Pune",
    "Priya found a DSA partner",
    "Arjun started English practice",
    "Sneha connected with a React learner",
  ];
  const [text, setText] = useState("");
  useEffect(() => { setText(activities[Math.floor(Math.random() * activities.length)]) }, []);
  return (
    <p style={{ fontSize: 12, color: "#A8A7A2", marginTop: 6 }}>
      <span style={{ color: "#1A5C3A" }}>●</span> {text}
    </p>
  );
}

/* ---------------- DATA ---------------- */
const FEATURES = [
  { icon: "🤝", title: "Find the right partner", desc: "Discover learners who share the same goals and start learning together." },
  { icon: "📍", title: "Nearby learners", desc: "Connect with learners in your city and study online or offline." },
  { icon: "💬", title: "Practice together", desc: "Chat, share resources, and stay accountable to your learning goals." },
];

const TESTIMONIALS = [
  { name: "Priya K.", city: "Pune", text: "I finally found a DSA partner. Solving problems together keeps me consistent." },
  { name: "Arjun M.", city: "Kolhapur", text: "Practicing English with a coding partner helped both of us improve faster." },
  { name: "Sneha R.", city: "Nashik", text: "StudyAlly made learning less lonely. We keep each other accountable." },
];

const AVATARS = [
  { n: "PK", c: "#1A5C3A" },
  { n: "AM", c: "#1A3A6B" },
  { n: "SR", c: "#4A1A6B" },
  { n: "RT", c: "#6B1A1A" },
  { n: "DP", c: "#1A4A5C" },
];

/* ---------------- HOMEPAGE ---------------- */
export default function HomePage() {
  const isMobile = useIsMobile()

  return (
    <div style={{ minHeight: "100vh", fontFamily: '"Geist",sans-serif', background: `radial-gradient(circle at 20% 10%, #ffffff 0%, #F7F6F3 40%), radial-gradient(circle at 80% 80%, #E8F3ED 0%, transparent 40%)` }}>
      <style>{`
        @media (max-width: 640px) {
          .nav-links { display: flex !important; gap: 6px !important; }
          .nav-links a { padding: 7px 12px !important; font-size: 13px !important; }
          .hero-h1 { font-size: clamp(26px, 8vw, 42px) !important; }
          .hero-p { font-size: 15px !important; }
          .hero-section { padding: 40px 16px !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; }
          .cta-h2 { font-size: 26px !important; }
          .social-proof { flex-direction: column !important; gap: 6px !important; align-items: center !important; }
        }
        @media (max-width: 400px) {
          .skill-tags span { font-size: 11px !important; padding: 5px 9px !important; }
        }
      `}</style>

      {/* Noise texture */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')", opacity: 0.05, zIndex: 0 }} />

      {/* NAVBAR */}
      <nav style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1100, margin: "0 auto 20px auto" }}>
        <Logo />
        <div className="nav-links" style={{ display: "flex", gap: 10 }}>
          <Link to="/login" style={{ padding: "8px 16px", borderRadius: 9, border: "1px solid rgba(0,0,0,.1)", background: "white", color: "#3B3A38", fontSize: 13.5, textDecoration: "none" }}>
            Sign in
          </Link>
          <Link to="/register" style={{ padding: "8px 16px", borderRadius: 9, background: "#1A5C3A", color: "white", fontSize: 13.5, textDecoration: "none" }}>
            Get started
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-section" style={{ maxWidth: 760, margin: "0 auto", padding: "70px 24px", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: 100, left: "50%", transform: "translateX(-50%)", width: 420, height: 420, background: "radial-gradient(circle,#1A5C3A22,transparent)", filter: "blur(80px)", zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 className="hero-h1" style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(32px,4vw,54px)", lineHeight: 1.15, background: "linear-gradient(90deg,#111110,#1A5C3A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Find a study partner.<br />
            <span style={{ color: "#1A5C3A", WebkitTextFillColor: "#1A5C3A" }}>Learn together.</span>
          </h1>
          <p className="hero-p" style={{ fontSize: 17, color: "#706F6C", lineHeight: 1.7, maxWidth: 520, margin: "20px auto" }}>
            Connect with learners near you who share the same goals. Practice DSA, improve English, or prepare for interviews together.
          </p>
          <SkillTags />
          <div style={{ marginTop: 30 }}>
            <Link to="/register" style={{ padding: "12px 26px", borderRadius: 11, background: "#1A5C3A", color: "white", fontSize: 15, textDecoration: "none", fontWeight: 500, boxShadow: "0 4px 16px rgba(26,92,58,.25)", display: "inline-block" }}>
              Start learning →
            </Link>
          </div>

          {/* SOCIAL PROOF */}
          <div className="social-proof" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 26, flexWrap: "wrap" }}>
            <div style={{ display: "flex" }}>
              {AVATARS.map((a, i) => (
                <div key={i} style={{ width: 26, height: 26, borderRadius: "50%", background: a.c, border: "2px solid #F7F6F3", marginLeft: i > 0 ? -8 : 0, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 9 }}>
                  {a.n}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: "#A8A7A2", margin: 0 }}>
              Find learners in your city and start studying together.
            </p>
          </div>
          <LiveActivity />
        </div>
      </section>

      <SectionDivider />

      {/* FEATURES */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px 70px" }}>
        <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
          {FEATURES.map((f) => (
            <div key={f.title}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,.08)" }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none" }}
              style={{ background: "white", border: "1px solid rgba(0,0,0,.07)", borderRadius: 14, padding: "22px 20px", transition: "all .25s ease" }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: "#EDF4F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 12 }}>
                {f.icon}
              </div>
              <h3 style={{ fontFamily: "Inter, sans-serif", fontSize: 18, marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: 13.5, color: "#706F6C", lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ background: "#111110", padding: "60px 16px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(22px,4vw,32px)", color: "white", textAlign: "center", marginBottom: 32 }}>
            Learners growing together
          </h2>
          <div className="testimonials-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 10 }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, padding: 20 }}>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,.7)", lineHeight: 1.7, marginBottom: 14, fontStyle: "italic" }}>"{t.text}"</p>
                <p style={{ fontSize: 13, color: "white" }}>{t.name} · {t.city}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "80px 16px", textAlign: "center" }}>
        <h2 className="cta-h2" style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(22px,4vw,36px)", marginBottom: 16 }}>
          Ready to find your study partner?
        </h2>
        <p style={{ color: "#706F6C", marginBottom: 30, fontSize: 15 }}>
          Join thousands of learners building better study habits.
        </p>
        <Link to="/register" style={{ background: "#1A5C3A", color: "white", padding: "14px 32px", borderRadius: 12, textDecoration: "none", fontWeight: 500, display: "inline-block" }}>
          Get started for free
        </Link>
      </section>
    </div>
  );
}
