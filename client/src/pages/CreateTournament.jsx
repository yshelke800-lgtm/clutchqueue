import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { Trophy, Calendar, Users, DollarSign, FileText, ChevronLeft, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import './CreateTournament.css'

const GAMES = [
  { id: 'bgmi', label: '🔫 BGMI' },
  { id: 'valorant', label: '🎯 Valorant' },
  { id: 'freefire', label: '🔥 Free Fire' },
  { id: 'fifa', label: '⚽ FIFA' },
]

const FORMATS = [
  { id: 'single-elimination', label: 'Single Elimination' },
  { id: 'double-elimination', label: 'Double Elimination' },
  { id: 'round-robin', label: 'Round Robin' },
]

const MAX_TEAMS_OPTIONS = [8, 16, 24, 32, 64]

export default function CreateTournament() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    game: 'bgmi',
    format: 'single-elimination',
    maxTeams: 16,
    prizePool: '',
    startDate: '',
    endDate: '',
    description: '',
    rules: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = e => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.title || !form.game || !form.startDate) {
      toast.error('Please fill all required fields')
      return
    }
    setLoading(true)
    try {
      const { data } = await axios.post('/tournaments', form)
      toast.success('Tournament created successfully! 🏆')
      navigate(`/organizer/manage/${data._id}`)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create tournament')
    } finally {
      setLoading(false)
    }
  }

  const gameColors = { bgmi: '#ff6b00', valorant: '#ff4655', freefire: '#ffcc00', fifa: '#00aaff' }

  return (
    <div className="ct-page">
      <div className="ct-hero">
        <div className="container">
          <button className="td-back" onClick={() => navigate('/organizer')}>
            <ChevronLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="section-title">Create <span className="text-gradient">Tournament</span></h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Set up your esports tournament in minutes.</p>
        </div>
      </div>

      <div className="container ct-body">
        <div className="ct-layout">
          {/* Form */}
          <form onSubmit={handleSubmit} className="ct-form">
            {/* Basic Info */}
            <div className="card ct-section">
              <h3 className="ct-section-title"><Trophy size={18} /> Basic Information</h3>
              <div className="form-group">
                <label className="form-label" htmlFor="ct-title">Tournament Title *</label>
                <input id="ct-title" type="text" name="title" className="form-input"
                  placeholder="e.g. BGMI Pro League Season 3"
                  value={form.title} onChange={handleChange} required />
              </div>

              <div className="ct-two-col">
                <div className="form-group">
                  <label className="form-label">Game *</label>
                  <div className="game-picker">
                    {GAMES.map(g => (
                      <button type="button" key={g.id}
                        className={`game-pick-btn ${form.game === g.id ? 'selected' : ''}`}
                        style={form.game === g.id ? { borderColor: gameColors[g.id], background: `${gameColors[g.id]}18` } : {}}
                        onClick={() => setForm(p => ({ ...p, game: g.id }))}>
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="ct-format">Format *</label>
                  <select id="ct-format" name="format" className="form-select" value={form.format} onChange={handleChange}>
                    {FORMATS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Capacity & Prize */}
            <div className="card ct-section">
              <h3 className="ct-section-title"><Users size={18} /> Capacity & Prize</h3>
              <div className="ct-two-col">
                <div className="form-group">
                  <label className="form-label">Max Teams *</label>
                  <div className="max-teams-picker">
                    {MAX_TEAMS_OPTIONS.map(n => (
                      <button type="button" key={n}
                        className={`teams-pick-btn ${form.maxTeams === n ? 'selected' : ''}`}
                        onClick={() => setForm(p => ({ ...p, maxTeams: n }))}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="ct-prize">Prize Pool</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <DollarSign size={16} style={{ position: 'absolute', left: 14, color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input id="ct-prize" type="text" name="prizePool" className="form-input" style={{ paddingLeft: 44 }}
                      placeholder="e.g. ₹10,000 or Amazon vouchers"
                      value={form.prizePool} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="card ct-section">
              <h3 className="ct-section-title"><Calendar size={18} /> Schedule</h3>
              <div className="ct-two-col">
                <div className="form-group">
                  <label className="form-label" htmlFor="ct-start">Start Date *</label>
                  <input id="ct-start" type="date" name="startDate" className="form-input"
                    value={form.startDate} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="ct-end">End Date</label>
                  <input id="ct-end" type="date" name="endDate" className="form-input"
                    value={form.endDate} onChange={handleChange}
                    min={form.startDate} />
                </div>
              </div>
            </div>

            {/* Description & Rules */}
            <div className="card ct-section">
              <h3 className="ct-section-title"><FileText size={18} /> Description & Rules</h3>
              <div className="form-group">
                <label className="form-label" htmlFor="ct-desc">Description</label>
                <textarea id="ct-desc" name="description" className="form-input ct-textarea"
                  placeholder="Describe the tournament, what players can expect..."
                  value={form.description} onChange={handleChange} rows={3} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="ct-rules">Rules</label>
                <textarea id="ct-rules" name="rules" className="form-input ct-textarea"
                  placeholder="List the tournament rules, team requirements, conduct guidelines..."
                  value={form.rules} onChange={handleChange} rows={5} />
              </div>
            </div>

            <div className="ct-submit-row">
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/organizer')}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} id="submit-tournament-btn">
                {loading ? <><Loader size={16} className="animate-spin" /> Creating...</> : '🏆 Create Tournament'}
              </button>
            </div>
          </form>

          {/* Preview Card */}
          <div className="ct-preview">
            <h3 className="ct-preview-title">Preview</h3>
            <div className="card ct-preview-card">
              <div className="ct-preview-top">
                <span style={{ background: `${gameColors[form.game]}22`, color: gameColors[form.game], padding: '4px 10px', borderRadius: 100, fontSize: '0.78rem', fontWeight: 700 }}>
                  {GAMES.find(g => g.id === form.game)?.label}
                </span>
                <span className="badge badge-info">UPCOMING</span>
              </div>
              <h4 className="ct-preview-name">{form.title || 'Tournament Name'}</h4>
              <div className="ct-preview-meta">
                <span>🏆 {form.prizePool || 'No prize set'}</span>
                <span>👥 0 / {form.maxTeams} teams</span>
                <span>📅 {form.startDate ? new Date(form.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'No date'}</span>
                <span>⚙️ {FORMATS.find(f => f.id === form.format)?.label}</span>
              </div>
              {form.description && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.6 }}>{form.description}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
