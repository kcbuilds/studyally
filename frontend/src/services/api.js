import axios from 'axios'



const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  sendOtp:   (data) => api.post('/auth/send-otp', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
}

// ── Users ─────────────────────────────────────────────────────────────────
export const userAPI = {
  getMe:         ()     => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  getNearby:     ()     => api.get('/users/nearby'),
  getUser:       (id)   => api.get(`/users/${id}`),
}

// ── Posts ─────────────────────────────────────────────────────────────────
export const postAPI = {
  getAll:     ()         => api.get('/posts'),
  create:     (data)     => api.post('/posts', data),
  toggleLike: (id)       => api.post(`/posts/${id}/like`),
  addComment: (id, data) => api.post(`/posts/${id}/comments`, data),
  delete:     (id)       => api.delete(`/posts/${id}`),
}

// ── Partners ──────────────────────────────────────────────────────────────
export const partnerAPI = {
  sendRequest:    (data) => api.post('/partners/requests', data),
  accept:         (id)   => api.put(`/partners/requests/${id}/accept`),
  decline:        (id)   => api.put(`/partners/requests/${id}/decline`),
  getIncoming:    ()     => api.get('/partners/requests/incoming'),
  getMyPartners:  ()     => api.get('/partners'),
}

// ── Messages ──────────────────────────────────────────────────────────────
export const messageAPI = {
  send:            (data)      => api.post('/messages', data),
  getConversation: (partnerId) => api.get(`/messages/conversation/${partnerId}`),
  getConversations:()          => api.get('/messages/conversations'),
}

export default api
