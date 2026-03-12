import { create } from 'zustand'
import { authAPI, userAPI } from '../services/api'

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  initialized: false,

  init: async () => {
    const token = localStorage.getItem('token')
    if (!token) { set({ initialized: true }); return }
    try {
      const { data } = await userAPI.getMe()
      set({ user: data, token, initialized: true })
    } catch {
      localStorage.removeItem('token')
      set({ user: null, token: null, initialized: true })
    }
  },

  register: async (formData) => {
    set({ loading: true })
    try {
      const { data } = await authAPI.register(formData)
      localStorage.setItem('token', data.token)
      set({ user: data.user, token: data.token, loading: false })
      return data
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },

  login: async (credentials) => {
    set({ loading: true })
    try {
      const { data } = await authAPI.login(credentials)
      localStorage.setItem('token', data.token)
      set({ user: data.user, token: data.token, loading: false })
      return data
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },

  setUser: (user) => set({ user }),
}))

export default useAuthStore
