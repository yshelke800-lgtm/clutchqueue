import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { Plus, Trophy, Users, BarChart2, ChevronRight, Trash2, Edit, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import './OrganizerDashboard.css'

const MOCK_TOURNAMENTS = [
  { _id: '1', title: 'BGMI Pro League S3', game: 'bgmi', status: 'upcoming', maxTeams: 16, registeredTeams: [{},{},{},{}], prizePool: '₹10,000', startDate: '2025-06-15' },
  { _id: '2', title: 'Valorant Campus Cup', game: 'valorant', status: 'ongoing', maxTeams: 32, registeredTeams: new Array(28).fill({}), prizePool: '₹25,000', startDate: '2025-05-20' },
  { _id: '3', title: 'FIFA Premier League', game: 'fifa', status: 'completed', maxTeams: 16, registeredTeams: new Array(16).fill({}), prizePool: '₹8,000', startDate: '2025-04-10' },
]

const gameColors = { bgmi: '#ff6b00', valorant: '#ff4655', freefire: '#ffcc00', fifa: '#00aaff' }
const gameIcons = { bgmi: '🔫', valorant: '🎯', freefire: '🔥', fifa: '⚽' }

export default function OrganizerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tournaments, setTournaments] = useState(MOCK_TOURNAMENTS)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    setLoading(true)
    axios.get('/tournaments/my')
      .then(r => { if (r.data.length) setTournaments(r.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      await axios.delete(`/tournaments/${id}`)
      setTournaments(prev => prev.filter(t => t._id !== id))
      toast.success('Tournament deleted')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  const total = tournaments.length
  const ongoing = tournaments.filter(t => t.status === 'ongoing').length
  const upcoming = tournaments.filter(t => t.status === 'upcoming').length
  const totalTeams = tournaments.reduce((acc, t) => acc + (t.registeredTeams?.length || 0), 0)

  return (
    <div className="od-page">
      {/* Header */}
      <div className="od-header">
        <div className="container">
          <div className="od-header-inner">
            <div className="od-welcome">
              <div className="od-avatar">{user?.name?.[0]?.toUpperCase()}</div>
              <div>
                <h1 className="od-name">Organizer Panel</h1>
                <p className="od-sub">Welcome back, <span className="text-gradient">{user?.name}</span></p>
              </div>
            </div>
            <Link to="/organizer/create" className="btn btn-primary" id="create-tournament-btn">
              <Plus size={18} /> Create Tournament
            </Link>
          </div>
        </div>
      </div>

      <div className="container od-body">
        {/* Stats */}
        <div className="od-stats-grid">
          {[
            { icon: '🏆', label: 'Total Tournaments', value: total, color: 'rgba(124,58,237,0.15)' },
            { icon: '⚡', label: 'Live Now', value: ongoing, color: 'rgba(0,255,135,0.1)' },
            { icon: '📅', label: 'Upcoming', value: upcoming, color: 'rgba(6,182,212,0.1)' },
            { icon: '👥', label: 'Teams Registered', value: totalTeams, color: 'rgba(255,107,0,0.1)' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ borderColor: 'var(--border)' }}>
              <div className="stat-icon" style={{ background: s.color, fontSize: '1.4rem' }}>{s.icon}</div>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tournaments List */}
        <div className="od-section-header">
          <h2 className="od-section-title">Your Tournaments</h2>
          <Link to="/organizer/create" className="btn btn-outline btn-sm"><Plus size={14} /> New</Link>
        </div>

        {loading ? (
          <div className="flex-center" style={{ padding: 60 }}><div className="spinner" /></div>
        ) : tournaments.length === 0 ? (
          <div className="card od-empty">
            <div style={{ fontSize: '3rem' }}>🏆</div>
            <h3>No Tournaments Yet</h3>
            <p>Create your first tournament to get started.</p>
            <Link to="/organizer/create" className="btn btn-primary" style={{ marginTop: 8 }}>Create Tournament</Link>
          </div>
        ) : (
          <div className="od-tournament-list">
            {tournaments.map(t => {
              const filled = t.registeredTeams?.length || 0
              const pct = (filled / t.maxTeams) * 100
              return (
                <div key={t._id} className="od-tournament-card card">
                  <div className="odtc-left">
                    <div className="odtc-game-icon" style={{ background: `${gameColors[t.game]}22`, color: gameColors[t.game] }}>
                      {gameIcons[t.game]}
                    </div>
                    <div>
                      <h3 className="odtc-title">{t.title}</h3>
                      <div className="odtc-meta">
                        <span style={{ color: gameColors[t.game], fontWeight: 600, fontSize: '0.8rem' }}>{t.game?.toUpperCase()}</span>
                        <span>·</span>
                        <span>{new Date(t.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span>·</span>
                        <span>{t.prizePool || 'No prize'}</span>
                      </div>
                      <div className="odtc-progress-row">
                        <div className="odtc-progress">
                          <div className="odtc-progress-bar" style={{ width: `${pct}%`, background: gameColors[t.game] }} />
                        </div>
                        <span className="odtc-teams-label">{filled}/{t.maxTeams} teams</span>
                      </div>
                    </div>
                  </div>
                  <div className="odtc-right">
                    <span className={`badge ${t.status === 'ongoing' ? 'badge-success' : t.status === 'upcoming' ? 'badge-info' : 'badge-warning'}`}>
                      {t.status === 'ongoing' ? 'LIVE' : t.status === 'upcoming' ? 'UPCOMING' : 'ENDED'}
                    </span>
                    <div className="odtc-actions">
                      <button className="icon-btn" title="Manage" onClick={() => navigate(`/organizer/manage/${t._id}`)}>
                        <Edit size={15} />
                      </button>
                      <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => handleDelete(t._id, t.title)} disabled={deleting === t._id}>
                        {deleting === t._id ? <Loader size={15} className="animate-spin" /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
