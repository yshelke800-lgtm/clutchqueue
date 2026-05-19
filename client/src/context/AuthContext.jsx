import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('cq_token') || null)
  const [loading, setLoading] = useState(true)

  axios.defaults.baseURL = API_URL

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get('/users/profile')
      setUser(data)
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const { data } = await axios.post('/auth/login', { email, password })
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('cq_token', data.token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    return data
  }

  const register = async (formData) => {
    const { data } = await axios.post('/auth/register', formData)
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('cq_token', data.token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    return data
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('cq_token')
    delete axios.defaults.headers.common['Authorization']
  }

  const updateUser = (updatedUser) => setUser(updatedUser)

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
