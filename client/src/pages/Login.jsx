import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Trophy, Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import './Auth.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await login(form.email, form.password)
      toast.success(`Welcome back, ${data.user.name}! 🎮`)
      navigate(data.user.role === 'organizer' ? '/organizer' : '/dashboard')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-glow auth-glow-1" />
      <div className="auth-glow auth-glow-2" />
      <div className="auth-container">
        <div className="auth-card">
          {/* Logo */}
          <Link to="/" className="auth-logo">
            <Trophy size={28} />
            <span>Clutch<span className="text-gradient">Queue</span></span>
          </Link>

          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Log in to your account and get back in the game.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  className="form-input input-with-icon"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  className="form-input input-with-icon input-with-toggle"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button type="button" className="input-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading} id="login-submit-btn">
              {loading ? <><Loader size={16} className="animate-spin" /> Logging in...</> : 'Login to ClutchQueue'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one free</Link>
          </p>

          {/* Demo credentials */}
          <div className="demo-creds">
            <p className="demo-title">🎮 Demo Credentials</p>
            <div className="demo-grid">
              <div>
                <strong>Player:</strong> player@demo.com / demo123
              </div>
              <div>
                <strong>Organizer:</strong> org@demo.com / demo123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
