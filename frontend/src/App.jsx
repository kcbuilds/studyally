import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'

import HomePage          from './components/pages/HomePage'
import LoginPage         from './components/pages/LoginPage'
import RegisterPage      from './components/pages/RegisterPage'
import MainLayout        from './components/layout/MainLayout'
import NearbyPage        from './components/pages/NearbyPage'
import FeedPage          from './components/pages/FeedPage'
import ChatPage          from './components/pages/ChatPage'
import ProfilePage       from './components/pages/ProfilePage'
import PublicProfilePage from './components/pages/PublicProfilePage'

function PrivateRoute({ children }) {
  const { token, initialized } = useAuthStore()
  if (!initialized) return null
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { init, initialized } = useAuthStore()
  useEffect(() => { init() }, [])

  if (!initialized) {
    return (
      <div style={{ height:'100vh',background:'#F7F6F3',display:'flex',alignItems:'center',justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:44,height:44,borderRadius:13,background:'#1A5C3A',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',boxShadow:'0 4px 20px rgba(26,92,58,.3)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div style={{ width:20,height:20,borderRadius:'50%',border:'2px solid #D4CFC6',borderTopColor:'#1A5C3A',animation:'spin .8s linear infinite',margin:'0 auto' }}/>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/"         element={<HomePage />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/app" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route index                element={<Navigate to="/app/nearby" replace />} />
        <Route path="nearby"        element={<NearbyPage />} />
        <Route path="feed"          element={<FeedPage />} />
        <Route path="chat"          element={<ChatPage />} />
        <Route path="chat/:id"      element={<ChatPage />} />
        <Route path="profile"       element={<ProfilePage />} />
        <Route path="user/:id"      element={<PublicProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
