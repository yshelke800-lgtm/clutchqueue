import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { Camera, Save, Loader, User } from 'lucide-react'
import toast from 'react-hot-toast'
import './Profile.css'

const GAMES = [
  { id: '', label: 'Select a game' },
  { id: 'bgmi', label: '🔫 BGMI' },
  { id: 'valorant', label: '🎯 Valorant' },
  { id: 'freefire', label: '🔥 Free Fire' },
  { id: 'fifa', label: '⚽ FIFA' },
]

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ name: '', bio: '', favoriteGame: '', avatar: '' })
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState('')

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', bio: user.bio || '', favoriteGame: user.favoriteGame || '', avatar: user.avatar || '' })
      setPreview(user.avatar || '')
    }
  }, [user])

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleAvatarChange = e => {
    const url = e.target.value
    setForm(p => ({ ...p, avatar: url }))
    setPreview(url)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await axios.put('/users/profile', form)
      updateUser(data)
      toast.success('Profile updated! ✅')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const stats = user?.stats || { tournamentsPlayed: 0, wins: 0, kills: 0 }

  return (
    <div className="profile-page">
      <div className="profile-hero">
        <div className="container">
          <h1 className="section-title"><span className="text-gradient">My Profile</span></h1>
        </div>
      </div>

      <div className="container profile-body">
        <div className="profile-layout">
          {/* Left: Avatar + Stats */}
          <div className="profile-left">
            <div className="card profile-card">
              <div className="profile-avatar-wrapper">
                <div className="profile-avatar">
                  {preview ? (
                    <img src={preview} alt="Avatar" className="avatar" width={96} height={96} onError={() => setPreview('')} />
                  ) : (
                    <div className="profile-avatar-fallback">{user?.name?.[0]?.toUpperCase()}</div>
                  )}
                </div>
                <div className="profile-avatar-edit"><Camera size={14} /></div>
              </div>
              <h2 className="profile-name">{user?.name}</h2>
              <p className="profile-email">{user?.email}</p>
              <span className="badge badge-primary" style={{ marginTop: 4 }}>
                {user?.role === 'organizer' ? '🏆 Organizer' : '🎮 Player'}
              </span>
            </div>

            {/* Stats */}
            {user?.role === 'player' && (
              <div className="card profile-stats">
                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 16, fontSize: '1rem' }}>Player Stats</h3>
                {[
                  { label: 'Tournaments Played', value: stats.tournamentsPlayed },
                  { label: 'Wins', value: stats.wins, highlight: true },
                  { label: 'Total Kills', value: stats.kills },
                  { label: 'Win Rate', value: stats.tournamentsPlayed > 0 ? `${Math.round((stats.wins / stats.tournamentsPlayed) * 100)}%` : '0%' },
                ].map(s => (
                  <div key={s.label} className="profile-stat-row">
                    <span className="profile-stat-label">{s.label}</span>
                    <span className="profile-stat-value" style={s.highlight ? { color: 'var(--neon-green)' } : {}}>{s.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Edit Form */}
          <div className="profile-right">
            <div className="card">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: 24 }}>Edit Profile</h2>
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-name">Display Name</label>
                  <div className="input-wrapper">
                    <User size={16} className="input-icon" />
                    <input id="profile-name" type="text" name="name" className="form-input input-with-icon"
                      placeholder="Your name" value={form.name} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profile-avatar">Avatar URL</label>
                  <input id="profile-avatar" type="url" name="avatar" className="form-input"
                    placeholder="https://example.com/avatar.png" value={form.avatar} onChange={handleAvatarChange} />
                  {preview && (
                    <div className="avatar-preview-row">
                      <img src={preview} alt="preview" className="avatar" width={40} height={40} onError={() => setPreview('')} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Preview</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="profile-bio">Bio</label>
                  <textarea id="profile-bio" name="bio" className="form-input profile-bio"
                    placeholder="Tell the community about yourself..." value={form.bio} onChange={handleChange} rows={3} />
                </div>

                {user?.role === 'player' && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-game">Favorite Game</label>
                    <select id="profile-game" name="favoriteGame" className="form-select"
                      value={form.favoriteGame} onChange={handleChange}>
                      {GAMES.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                    </select>
                  </div>
                )}

                <button type="submit" className="btn btn-primary" disabled={saving} id="save-profile-btn">
                  {saving ? <><Loader size={15} className="animate-spin" /> Saving...</> : <><Save size={15} /> Save Changes</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
