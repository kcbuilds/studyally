// ─── Design System Primitives ─────────────────────────────────────────────────

const PALETTE = ['#1A5C3A','#1A3A6B','#5C1A4A','#4A3A1A','#1A4A5C','#3A1A5C','#5C3A1A']
export function avatarBg(name = '') {
  return PALETTE[(name.charCodeAt(0) || 0) % PALETTE.length]
}

export function Avatar({ name = '?', color, size = 38 }) {
  const initials = name.trim().split(/\s+/).slice(0,2).map(w => w[0]).join('').toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: Math.round(size * .3),
      background: color || avatarBg(name),
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'rgba(255,255,255,.9)', fontWeight: 600,
      fontSize: Math.round(size * .38), letterSpacing: '-.5px',
      flexShrink: 0, userSelect: 'none',
    }}>
      {initials}
    </div>
  )
}

export function Spinner({ size = 18, color = '#1A5C3A' }) {
  return (
    <span style={{
      display: 'inline-block',
      width: size, height: size, borderRadius: '50%',
      border: `1.5px solid ${color}22`,
      borderTopColor: color,
      animation: 'spin .75s linear infinite', flexShrink: 0,
    }} />
  )
}

export function Tag({ label, tone = 'green' }) {
  const tones = {
    green:  { bg: '#EDF4F0', color: '#1A5C3A', border: '#C8DED4' },
    amber:  { bg: '#FDF3E3', color: '#7C4A00', border: '#F0D9A8' },
    muted:  { bg: '#F2F1EE', color: '#706F6C', border: '#E8E6E1' },
    active: { bg: '#1A5C3A', color: '#fff',    border: '#1A5C3A' },
    red:    { bg: '#FDF0F0', color: '#8B1A1A', border: '#F4C5C5' },
  }
  const t = tones[tone] || tones.muted
  return (
    <span style={{
      display: 'inline-block', padding: '3px 9px', borderRadius: 99,
      fontSize: 11, fontWeight: 500, letterSpacing: '.1px',
      background: t.bg, color: t.color, border: `1px solid ${t.border}`,
    }}>
      {label}
    </span>
  )
}

export function ProgressBar({ value = 0, color = '#1A5C3A', height = 4, track = '#E8E6E1' }) {
  return (
    <div style={{ background: track, borderRadius: 99, height, overflow: 'hidden' }}>
      <div style={{
        width: `${Math.min(100, Math.max(0, value))}%`, height,
        background: color, borderRadius: 99,
        transition: 'width .6s cubic-bezier(.4,0,.2,1)',
      }} />
    </div>
  )
}

// Shared input style helper
export const inputCss = {
  width: '100%', boxSizing: 'border-box',
  background: '#F7F6F3', border: '1px solid rgba(0,0,0,.1)',
  borderRadius: 10, padding: '10px 13px',
  fontSize: 14, color: '#111110',
  outline: 'none', transition: 'border-color .15s, box-shadow .15s',
  fontFamily: 'inherit',
}
export const onFocus = e => {
  e.target.style.borderColor = '#1A5C3A'
  e.target.style.boxShadow   = '0 0 0 3px rgba(26,92,58,.1)'
  e.target.style.background  = '#fff'
}
export const onBlur  = e => {
  e.target.style.borderColor = 'rgba(0,0,0,.1)'
  e.target.style.boxShadow   = 'none'
  e.target.style.background  = '#F7F6F3'
}
