import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Trophy, Mail, Lock, Eye, EyeOff, User, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import './Auth.css'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'player' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const setRole = role => setForm(p => ({ ...p, role }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const data = await register(form)
      toast.success(`Welcome to ClutchQueue, ${data.user.name}! 🎮`)
      navigate(data.user.role === 'organizer' ? '/organizer' : '/dashboard')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed')
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
          <Link to="/" className="auth-logo">
            <Trophy size={28} />
            <span>Clutch<span className="text-gradient">Queue</span></span>
          </Link>

          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join the arena. Start competing today.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Role Selector */}
            <div className="form-group">
              <label className="form-label">I am a...</label>
              <div className="role-selector">
                <div className={`role-option ${form.role === 'player' ? 'selected' : ''}`} onClick={() => setRole('player')}>
                  <div className="role-icon">🎮</div>
                  <div className="role-label">Player</div>
                  <div className="role-desc">Join teams & compete</div>
                </div>
                <div className={`role-option ${form.role === 'organizer' ? 'selected' : ''}`} onClick={() => setRole('organizer')}>
                  <div className="role-icon">🏆</div>
                  <div className="role-label">Organizer</div>
                  <div className="role-desc">Create & manage tournaments</div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <div className="input-wrapper">
                <User size={16} className="input-icon" />
                <input id="reg-name" type="text" name="name" className="form-input input-with-icon"
                  placeholder="Your gamer name" value={form.name} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input id="reg-email" type="email" name="email" className="form-input input-with-icon"
                  placeholder="you@example.com" value={form.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input id="reg-password" type={showPass ? 'text' : 'password'} name="password"
                  className="form-input input-with-icon input-with-toggle"
                  placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required />
                <button type="button" className="input-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading} id="register-submit-btn">
              {loading ? <><Loader size={16} className="animate-spin" /> Creating account...</> : 'Create Free Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
