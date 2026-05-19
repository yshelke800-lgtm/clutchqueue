import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { Trophy, Users, Calendar, Bell, Zap, ChevronRight, Target } from 'lucide-react'
import './PlayerDashboard.css'

const MOCK_STATS = { tournamentsPlayed: 8, wins: 3, kills: 142, rank: 47 }
const MOCK_TOURNAMENTS = [
  { _id: '1', title: 'BGMI Pro League S3', game: 'bgmi', status: 'upcoming', startDate: '2025-06-15', prizePool: '₹10,000' },
  { _id: '2', title: 'Valorant Campus Cup', game: 'valorant', status: 'ongoing', startDate: '2025-05-20', prizePool: '₹25,000' },
]
const MOCK_TEAMS = [
  { _id: 't1', name: 'Ghost Unit', game: 'bgmi', wins: 5, losses: 2, members: [{},{},{},{}] },
]
const MOCK_NOTIFICATIONS = [
  { _id: 'n1', message: 'Your team Ghost Unit is registered for BGMI Pro League!', read: false, createdAt: new Date() },
  { _id: 'n2', message: 'Match scheduled: Ghost Unit vs Steel Wolves on June 16', read: false, createdAt: new Date() },
  { _id: 'n3', message: 'Welcome to ClutchQueue! Start by joining a team.', read: true, createdAt: new Date() },
]

const gameColors = { bgmi: '#ff6b00', valorant: '#ff4655', freefire: '#ffcc00', fifa: '#00aaff' }
const gameIcons = { bgmi: '🔫', valorant: '🎯', freefire: '🔥', fifa: '⚽' }

export default function PlayerDashboard() {
  const { user } = useAuth()
  const [myTournaments, setMyTournaments] = useState(MOCK_TOURNAMENTS)
  const [myTeams, setMyTeams] = useState(MOCK_TEAMS)
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    axios.get('/teams/my').then(r => { if (r.data.length) setMyTeams(r.data) }).catch(() => {})
    axios.get('/users/notifications').then(r => { if (r.data.length) setNotifications(r.data) }).catch(() => {})
  }, [])

  const stats = user?.stats || MOCK_STATS
  const unread = notifications.filter(n => !n.read).length

  const STAT_CARDS = [
    { icon: '🏆', label: 'Wins', value: stats.wins, color: 'rgba(255,215,0,0.15)', border: 'rgba(255,215,0,0.3)' },
    { icon: '🎮', label: 'Tournaments', value: stats.tournamentsPlayed, color: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.3)' },
    { icon: '💀', label: 'Total Kills', value: stats.kills, color: 'rgba(255,0,110,0.1)', border: 'rgba(255,0,110,0.25)' },
    { icon: '📊', label: 'Global Rank', value: `#${stats.rank || '—'}`, color: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.25)' },
  ]

  return (
    <div className="pd-page">
      {/* Header */}
      <div className="pd-header">
        <div className="container">
          <div className="pd-welcome">
            <div className="pd-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <h1 className="pd-name">Welcome back, <span className="text-gradient">{user?.name}</span> 👋</h1>
              <p className="pd-role-tag">
                <span className="badge badge-primary">🎮 Player</span>
                {user?.favoriteGame && <span className="badge" style={{ background: `${gameColors[user.favoriteGame]}22`, color: gameColors[user.favoriteGame], border: `1px solid ${gameColors[user.favoriteGame]}44`, marginLeft: 8 }}>{gameIcons[user.favoriteGame]} {user.favoriteGame?.toUpperCase()}</span>}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container pd-body">
        {/* Stat Cards */}
        <div className="pd-stats-grid">
          {STAT_CARDS.map(s => (
            <div key={s.label} className="stat-card" style={{ borderColor: s.border }}>
              <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="pd-tabs">
          {['overview', 'tournaments', 'teams', 'notifications'].map(t => (
            <button key={t} className={`pd-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t === 'notifications' && unread > 0 && <span className="notif-badge">{unread}</span>}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="pd-overview animate-fade">
            <div className="pd-two-col">
              {/* My Tournaments */}
              <div className="card">
                <div className="flex-between" style={{ marginBottom: 16 }}>
                  <h3 className="card-section-title"><Trophy size={16} /> My Tournaments</h3>
                  <Link to="/tournaments" className="view-all-link">View All →</Link>
                </div>
                {myTournaments.length === 0 ? (
                  <div className="empty-mini">No tournaments yet. <Link to="/tournaments">Browse tournaments →</Link></div>
                ) : myTournaments.map(t => (
                  <Link to={`/tournaments/${t._id}`} key={t._id} className="mini-item">
                    <div className="mini-game-dot" style={{ background: gameColors[t.game] }} />
                    <div style={{ flex: 1 }}>
                      <div className="mini-title">{t.title}</div>
                      <div className="mini-meta">{new Date(t.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {t.prizePool}</div>
                    </div>
                    <span className={`badge ${t.status === 'ongoing' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '0.7rem' }}>
                      {t.status === 'ongoing' ? 'LIVE' : 'UPCOMING'}
                    </span>
                  </Link>
                ))}
              </div>

              {/* My Teams */}
              <div className="card">
                <div className="flex-between" style={{ marginBottom: 16 }}>
                  <h3 className="card-section-title"><Users size={16} /> My Teams</h3>
                  <Link to="/teams" className="view-all-link">Manage →</Link>
                </div>
                {myTeams.length === 0 ? (
                  <div className="empty-mini">No teams yet. <Link to="/teams">Create one →</Link></div>
                ) : myTeams.map(team => (
                  <div key={team._id} className="mini-item" style={{ cursor: 'default' }}>
                    <div className="mini-team-avatar">{team.name[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div className="mini-title">{team.name}</div>
                      <div className="mini-meta">{team.members?.length || 0} members · {team.game?.toUpperCase()}</div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--neon-green)', fontWeight: 600 }}>{team.wins}W / {team.losses}L</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h3 className="card-section-title" style={{ marginBottom: 16 }}><Zap size={16} /> Quick Actions</h3>
              <div className="qa-grid">
                <Link to="/tournaments" className="qa-card">
                  <Trophy size={22} />
                  <span>Browse Tournaments</span>
                  <ChevronRight size={16} />
                </Link>
                <Link to="/teams" className="qa-card">
                  <Users size={22} />
                  <span>Manage Teams</span>
                  <ChevronRight size={16} />
                </Link>
                <Link to="/leaderboard" className="qa-card">
                  <Target size={22} />
                  <span>Leaderboard</span>
                  <ChevronRight size={16} />
                </Link>
                <Link to="/profile" className="qa-card">
                  <Calendar size={22} />
                  <span>Edit Profile</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tournaments Tab */}
        {activeTab === 'tournaments' && (
          <div className="animate-fade">
            {myTournaments.length === 0 ? (
              <div className="card empty-full">
                <div style={{ fontSize: '3rem' }}>🏆</div>
                <h3>No Tournaments Yet</h3>
                <p>Register your team for a tournament to get started.</p>
                <Link to="/tournaments" className="btn btn-primary" style={{ marginTop: 8 }}>Browse Tournaments</Link>
              </div>
            ) : (
              <div className="tournaments-list">
                {myTournaments.map(t => (
                  <Link to={`/tournaments/${t._id}`} key={t._id} className="tournament-row card">
                    <div className="tr-game" style={{ background: `${gameColors[t.game]}22`, color: gameColors[t.game] }}>{gameIcons[t.game]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{t.title}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>{new Date(t.startDate).toLocaleDateString()} · {t.prizePool}</div>
                    </div>
                    <span className={`badge ${t.status === 'ongoing' ? 'badge-success' : t.status === 'upcoming' ? 'badge-info' : 'badge-warning'}`}>
                      {t.status?.toUpperCase()}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div className="animate-fade">
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-display)' }}>My Teams</h3>
              <Link to="/teams" className="btn btn-primary btn-sm">+ Create Team</Link>
            </div>
            {myTeams.map(team => (
              <div key={team._id} className="card team-detail-row">
                <div className="td-avatar">{team.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{team.name}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>{team.game?.toUpperCase()} · {team.members?.length || 0} members</div>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--neon-green)' }}>{team.wins}W</span>
                  <span style={{ color: 'var(--neon-pink)' }}>{team.losses}L</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="animate-fade">
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-display)' }}>Notifications</h3>
              {unread > 0 && <button className="btn btn-ghost btn-sm" onClick={() => setNotifications(n => n.map(x => ({ ...x, read: true })))}>Mark all read</button>}
            </div>
            {notifications.map(n => (
              <div key={n._id} className={`notif-item ${!n.read ? 'unread' : ''}`}>
                <Bell size={16} className="notif-icon" />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.9rem' }}>{n.message}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{new Date(n.createdAt).toLocaleDateString()}</p>
                </div>
                {!n.read && <div className="unread-dot" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
