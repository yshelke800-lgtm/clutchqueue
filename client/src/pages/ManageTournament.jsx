import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ChevronLeft, Users, Trophy, CheckCircle, XCircle, Loader, Edit, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import './ManageTournament.css'

const gameColors = { bgmi: '#ff6b00', valorant: '#ff4655', freefire: '#ffcc00', fifa: '#00aaff' }
const gameIcons = { bgmi: '🔫', valorant: '🎯', freefire: '🔥', fifa: '⚽' }

const MOCK = {
  _id: '1', title: 'BGMI Pro League S3', game: 'bgmi', status: 'upcoming',
  maxTeams: 16, prizePool: '₹10,000', startDate: '2025-06-15', format: 'single-elimination',
  description: 'The ultimate BGMI showdown.',
  registeredTeams: [
    { _id: 't1', name: 'Ghost Unit', members: [{},{},{},{}] },
    { _id: 't2', name: 'Steel Wolves', members: [{},{},{}] },
    { _id: 't3', name: 'Reaper Squad', members: [{},{},{},{},{}] },
    { _id: 't4', name: 'Night Hunters', members: [{},{}] },
  ],
  brackets: [],
  winner: null,
}

export default function ManageTournament() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tournament, setTournament] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [winnerModal, setWinnerModal] = useState(false)
  const [selectedWinner, setSelectedWinner] = useState('')
  const [settingWinner, setSettingWinner] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get(`/tournaments/${id}`)
        setTournament(data)
        setEditForm({ title: data.title, description: data.description, rules: data.rules, prizePool: data.prizePool })
      } catch {
        setTournament(MOCK)
        setEditForm({ title: MOCK.title, description: MOCK.description || '', rules: MOCK.rules || '', prizePool: MOCK.prizePool })
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const updateStatus = async (newStatus) => {
    setUpdatingStatus(true)
    try {
      const { data } = await axios.put(`/tournaments/${id}`, { status: newStatus })
      setTournament(data)
      toast.success(`Tournament is now ${newStatus}!`)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed')
      setTournament(t => ({ ...t, status: newStatus })) // optimistic for demo
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleSetWinner = async () => {
    if (!selectedWinner) { toast.error('Select a winner'); return }
    setSettingWinner(true)
    try {
      await axios.put(`/tournaments/${id}/result`, { winner: selectedWinner })
      const winner = tournament.registeredTeams.find(t => t._id === selectedWinner)
      setTournament(t => ({ ...t, winner, status: 'completed' }))
      toast.success(`🏆 ${winner?.name} declared as winner!`)
      setWinnerModal(false)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not set winner')
      setTournament(t => ({ ...t, winner: tournament.registeredTeams.find(x => x._id === selectedWinner), status: 'completed' }))
      setWinnerModal(false)
    } finally {
      setSettingWinner(false)
    }
  }

  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      const { data } = await axios.put(`/tournaments/${id}`, editForm)
      setTournament(data)
      toast.success('Tournament updated!')
      setEditMode(false)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex-center" style={{ minHeight: '100vh' }}><div className="spinner" /></div>
  if (!tournament) return null

  const t = tournament
  const filled = t.registeredTeams?.length || 0
  const spotsLeft = t.maxTeams - filled
  const gameColor = gameColors[t.game]

  return (
    <div className="mt-page">
      {/* Header */}
      <div className="mt-header">
        <div className="container">
          <button className="td-back" onClick={() => navigate('/organizer')}>
            <ChevronLeft size={16} /> Back to Dashboard
          </button>
          <div className="mt-header-content">
            <div>
              <div className="mt-game-tag" style={{ background: `${gameColor}22`, color: gameColor }}>
                {gameIcons[t.game]} {t.game?.toUpperCase()}
              </div>
              <h1 className="mt-title">{t.title}</h1>
              <div className="mt-meta-row">
                <span className={`badge ${t.status === 'ongoing' ? 'badge-success' : t.status === 'upcoming' ? 'badge-info' : 'badge-warning'}`}>
                  {t.status?.toUpperCase()}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{filled}/{t.maxTeams} teams · {t.prizePool}</span>
              </div>
            </div>

            {/* Status Controls */}
            <div className="mt-controls">
              {t.status === 'upcoming' && (
                <button className="btn btn-primary" onClick={() => updateStatus('ongoing')} disabled={updatingStatus}>
                  {updatingStatus ? <Loader size={15} className="animate-spin" /> : '▶ Start Tournament'}
                </button>
              )}
              {t.status === 'ongoing' && (
                <button className="btn btn-primary" onClick={() => setWinnerModal(true)}>
                  <Trophy size={15} /> Declare Winner
                </button>
              )}
              {t.status === 'completed' && t.winner && (
                <div className="mt-winner-badge">
                  🏆 Winner: <strong>{t.winner?.name}</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-body">
        {/* Tabs */}
        <div className="mt-tabs">
          {['overview', 'teams', 'brackets', 'settings'].map(tabName => (
            <button key={tabName} className={`pd-tab ${tab === tabName ? 'active' : ''}`} onClick={() => setTab(tabName)}>
              {tabName.charAt(0).toUpperCase() + tabName.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="animate-fade mt-overview">
            <div className="grid-3">
              {[
                { icon: '👥', label: 'Registered Teams', value: filled, sub: `${spotsLeft} spots left` },
                { icon: '🏆', label: 'Prize Pool', value: t.prizePool || 'None' },
                { icon: '📅', label: 'Start Date', value: new Date(t.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(124,58,237,0.1)', fontSize: '1.4rem' }}>{s.icon}</div>
                  <div>
                    <div className="stat-value" style={{ fontSize: '1.6rem' }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                    {s.sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.sub}</div>}
                  </div>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div className="card mt-progress-card">
              <div className="flex-between" style={{ marginBottom: 10 }}>
                <span style={{ fontWeight: 600 }}>Registration Progress</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{filled}/{t.maxTeams} teams</span>
              </div>
              <div style={{ height: 8, background: 'var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(filled / t.maxTeams) * 100}%`, background: gameColor, borderRadius: 8, transition: 'width 0.6s' }} />
              </div>
            </div>

            {t.description && (
              <div className="card">
                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 10, fontSize: '1rem' }}>Description</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>{t.description}</p>
              </div>
            )}
          </div>
        )}

        {/* Teams */}
        {tab === 'teams' && (
          <div className="animate-fade">
            <div className="flex-between" style={{ marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>Registered Teams ({filled})</h2>
            </div>
            {filled === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                No teams registered yet.
              </div>
            ) : (
              <div className="mt-teams-grid">
                {t.registeredTeams.map((team, i) => (
                  <div key={team._id || i} className="mt-team-card card">
                    <div className="mt-team-rank">#{i + 1}</div>
                    <div className="mt-team-avatar">{(team.name || 'T')[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{team.name || `Team ${i + 1}`}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{team.members?.length || 0} players</div>
                    </div>
                    {t.status === 'ongoing' && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => { setSelectedWinner(team._id); setWinnerModal(true) }}>
                        <Trophy size={12} /> Set Winner
                      </button>
                    )}
                    {t.winner?._id === team._id && <span className="badge badge-success">🏆 Winner</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Brackets */}
        {tab === 'brackets' && (
          <div className="animate-fade card" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔗</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: 8 }}>Bracket System</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto' }}>
              {t.status === 'upcoming'
                ? 'Brackets will be auto-generated once you start the tournament.'
                : t.brackets?.length > 0
                  ? `${t.brackets.length} matches in bracket`
                  : 'No brackets configured yet.'}
            </p>
            {t.status === 'upcoming' && filled >= 2 && (
              <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => updateStatus('ongoing')}>
                Start Tournament & Generate Brackets
              </button>
            )}
          </div>
        )}

        {/* Settings */}
        {tab === 'settings' && (
          <div className="animate-fade">
            <div className="card">
              <div className="flex-between" style={{ marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Tournament Settings</h3>
                {!editMode ? (
                  <button className="btn btn-outline btn-sm" onClick={() => setEditMode(true)}><Edit size={14} /> Edit</button>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditMode(false)}>Cancel</button>
                    <button className="btn btn-primary btn-sm" onClick={handleSaveEdit} disabled={saving}>
                      {saving ? <Loader size={13} className="animate-spin" /> : <><Save size={13} /> Save</>}
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  {editMode
                    ? <input className="form-input" value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} />
                    : <p style={{ color: 'var(--text-primary)', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>{t.title}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Prize Pool</label>
                  {editMode
                    ? <input className="form-input" value={editForm.prizePool} onChange={e => setEditForm(p => ({ ...p, prizePool: e.target.value }))} />
                    : <p style={{ color: 'var(--text-primary)', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>{t.prizePool || '—'}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  {editMode
                    ? <textarea className="form-input" rows={3} value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
                    : <p style={{ color: 'var(--text-secondary)', padding: '12px 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem' }}>{t.description || '—'}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Rules</label>
                  {editMode
                    ? <textarea className="form-input" rows={4} value={editForm.rules} onChange={e => setEditForm(p => ({ ...p, rules: e.target.value }))} />
                    : <pre style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>{t.rules || '—'}</pre>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Winner Modal */}
      {winnerModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setWinnerModal(false)}>
          <div className="modal-content">
            <h2 className="modal-title">🏆 Declare Winner</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.9rem' }}>
              Select the winning team. This will end the tournament.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {t.registeredTeams.map(team => (
                <div
                  key={team._id}
                  className={`winner-option ${selectedWinner === team._id ? 'selected' : ''}`}
                  onClick={() => setSelectedWinner(team._id)}
                >
                  <div className="mt-team-avatar" style={{ width: 32, height: 32, fontSize: '0.85rem' }}>{(team.name || 'T')[0]}</div>
                  <span style={{ fontWeight: 600 }}>{team.name}</span>
                  {selectedWinner === team._id && <CheckCircle size={16} style={{ marginLeft: 'auto', color: 'var(--neon-green)' }} />}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setWinnerModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSetWinner} disabled={settingWinner || !selectedWinner}>
                {settingWinner ? <><Loader size={14} className="animate-spin" /> Saving...</> : '🏆 Confirm Winner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
