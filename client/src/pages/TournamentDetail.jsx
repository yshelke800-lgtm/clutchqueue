import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { Trophy, Users, Calendar, Shield, ChevronLeft, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import './TournamentDetail.css'

const gameColors = { bgmi: '#ff6b00', valorant: '#ff4655', freefire: '#ffcc00', fifa: '#00aaff' }
const gameIcons = { bgmi: '🔫', valorant: '🎯', freefire: '🔥', fifa: '⚽' }

const MOCK = {
  _id: '1', title: 'BGMI Pro League S3', game: 'bgmi', status: 'upcoming',
  maxTeams: 16, registeredTeams: [{_id:'t1',name:'Team Alpha'},{_id:'t2',name:'Squad Zero'},{_id:'t3',name:'Ghost Unit'},{_id:'t4',name:'Steel Wolves'}],
  prizePool: '₹10,000', startDate: '2025-06-15', endDate: '2025-06-20',
  description: 'The ultimate BGMI showdown for college teams. Compete for glory, prizes and a shot at the national league.',
  rules: '1. Teams of 4 players.\n2. No hacking or cheating — instant disqualification.\n3. Match schedule will be shared 24h before.\n4. Organizer decision is final.',
  format: 'single-elimination',
  organizer: { name: 'ProGaming Events', avatar: '' },
  brackets: [],
  winner: null,
}

export default function TournamentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tournament, setTournament] = useState(null)
  const [myTeams, setMyTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState('')
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [tab, setTab] = useState('info')

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get(`/tournaments/${id}`)
        setTournament(data)
      } catch { setTournament(MOCK) }
      finally { setLoading(false) }
    }
    fetch()
  }, [id])

  useEffect(() => {
    if (user?.role === 'player') {
      axios.get('/teams/my').then(r => setMyTeams(r.data)).catch(() => {})
    }
  }, [user])

  const handleRegister = async () => {
    if (!selectedTeam) { toast.error('Select a team first'); return }
    setRegistering(true)
    try {
      await axios.post(`/tournaments/${id}/register`, { teamId: selectedTeam })
      toast.success('Team registered successfully! 🎉')
      const { data } = await axios.get(`/tournaments/${id}`)
      setTournament(data)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed')
    } finally { setRegistering(false) }
  }

  if (loading) return <div className="flex-center" style={{ minHeight: '100vh' }}><div className="spinner" /></div>
  if (!tournament) return null

  const t = tournament
  const gameColor = gameColors[t.game]
  const spotsLeft = t.maxTeams - (t.registeredTeams?.length || 0)
  const isAlreadyRegistered = myTeams.some(team => t.registeredTeams?.some(rt => rt._id === team._id || rt === team._id))

  return (
    <div className="td-page">
      {/* Hero */}
      <div className="td-hero" style={{ '--game-color': gameColor }}>
        <div className="td-hero-bg" />
        <div className="container">
          <button className="td-back" onClick={() => navigate('/tournaments')}>
            <ChevronLeft size={16} /> Back to Tournaments
          </button>
          <div className="td-hero-content">
            <div className="td-game-tag" style={{ background: `${gameColor}22`, color: gameColor, border: `1px solid ${gameColor}44` }}>
              {gameIcons[t.game]} {t.game?.toUpperCase()}
            </div>
            <h1 className="td-title">{t.title}</h1>
            <div className="td-badges">
              <span className={`badge ${t.status === 'ongoing' ? 'badge-success' : t.status === 'upcoming' ? 'badge-info' : 'badge-warning'}`}>
                {t.status?.toUpperCase()}
              </span>
              <span className="badge badge-primary">{t.format?.replace('-', ' ').toUpperCase()}</span>
            </div>
            <div className="td-quick-stats">
              <div className="td-stat"><Trophy size={16} /><strong>{t.prizePool || 'No prize'}</strong><span>Prize Pool</span></div>
              <div className="td-stat"><Users size={16} /><strong>{t.registeredTeams?.length || 0}/{t.maxTeams}</strong><span>Teams</span></div>
              <div className="td-stat"><Calendar size={16} /><strong>{new Date(t.startDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</strong><span>Start Date</span></div>
              <div className="td-stat"><Shield size={16} /><strong>{t.organizer?.name}</strong><span>Organizer</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="container td-body">
        <div className="td-layout">
          {/* Main Content */}
          <div className="td-main">
            {/* Tabs */}
            <div className="td-tabs">
              {['info', 'teams', 'brackets'].map(tab_name => (
                <button key={tab_name} className={`td-tab ${tab === tab_name ? 'active' : ''}`} onClick={() => setTab(tab_name)}>
                  {tab_name.charAt(0).toUpperCase() + tab_name.slice(1)}
                </button>
              ))}
            </div>

            {tab === 'info' && (
              <div className="td-tab-content card" style={{ animationDuration: '0.3s' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 12 }}>About This Tournament</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{t.description || 'No description provided.'}</p>
                {t.rules && (
                  <>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', margin: '20px 0 12px' }}>Rules</h3>
                    <pre style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.7, fontFamily: 'var(--font-body)' }}>{t.rules}</pre>
                  </>
                )}
              </div>
            )}

            {tab === 'teams' && (
              <div className="td-tab-content">
                {!t.registeredTeams?.length ? (
                  <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No teams registered yet. Be the first!</div>
                ) : (
                  <div className="td-teams-grid">
                    {t.registeredTeams.map((team, i) => (
                      <div key={team._id || i} className="td-team-card card">
                        <div className="td-team-avatar">{(team.name || 'T')[0]}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{team.name || `Team ${i+1}`}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Registered</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'brackets' && (
              <div className="td-tab-content card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                {t.brackets?.length ? (
                  <div>{t.brackets.length} matches scheduled</div>
                ) : (
                  <>
                    <div style={{ fontSize: '2rem', marginBottom: 12 }}>🏆</div>
                    <p>Brackets will appear once the tournament begins.</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="td-sidebar">
            {/* Registration Card */}
            {t.status === 'upcoming' && user?.role === 'player' && (
              <div className="card td-reg-card">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 16 }}>Register Your Team</h3>
                <div className="td-spots">
                  <span>{spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} remaining</span>
                  <div className="tc-progress" style={{ marginTop: 8 }}>
                    <div className="tc-progress-bar" style={{ width: `${((t.registeredTeams?.length||0)/t.maxTeams)*100}%`, background: gameColor }} />
                  </div>
                </div>
                {isAlreadyRegistered ? (
                  <div className="badge badge-success" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 16 }}>✅ Team Already Registered</div>
                ) : spotsLeft > 0 ? (
                  <>
                    <div className="form-group" style={{ marginTop: 16 }}>
                      <label className="form-label">Select Your Team</label>
                      <select className="form-select" value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}>
                        <option value="">-- Choose team --</option>
                        {myTeams.map(tm => (
                          <option key={tm._id} value={tm._id}>{tm.name} ({tm.game?.toUpperCase()})</option>
                        ))}
                      </select>
                      {myTeams.length === 0 && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--neon-pink)', marginTop: 6 }}>
                          ⚠️ You have no teams! <a href="/teams" style={{ color: 'var(--primary-light)' }}>Create a {t.game?.toUpperCase()} team first →</a>
                        </p>
                      )}
                      {myTeams.length > 0 && myTeams.filter(tm => tm.game === t.game).length === 0 && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--neon-pink)', marginTop: 6 }}>
                          ⚠️ No {t.game?.toUpperCase()} team found. <a href="/teams" style={{ color: 'var(--primary-light)' }}>Create one →</a>
                        </p>
                      )}
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }} onClick={handleRegister} disabled={registering || !selectedTeam} id="register-team-btn">
                      {registering ? <><Loader size={14} className="animate-spin" /> Registering...</> : 'Register Team'}
                    </button>
                  </>
                ) : (
                  <div className="badge badge-danger" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 16 }}>Tournament Full</div>
                )}
              </div>
            )}

            {/* Winner card */}
            {t.winner && (
              <div className="card" style={{ textAlign: 'center', padding: 24, border: '1px solid gold' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🏆</div>
                <h4 style={{ fontFamily: 'var(--font-display)' }}>Tournament Winner</h4>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'gold', marginTop: 8 }}>{t.winner?.name}</div>
              </div>
            )}

            {/* Info card */}
            <div className="card">
              <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: 16, fontSize: '1rem' }}>Tournament Details</h4>
              {[['Game', `${gameIcons[t.game]} ${t.game?.toUpperCase()}`], ['Format', t.format?.replace(/-/g, ' ')], ['Prize Pool', t.prizePool || 'None'], ['Max Teams', t.maxTeams], ['Start', new Date(t.startDate).toLocaleDateString()], ['Status', t.status]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
