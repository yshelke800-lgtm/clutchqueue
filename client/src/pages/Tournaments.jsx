import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { Search, Filter, Trophy, Users, Calendar, Zap } from 'lucide-react'
import './Tournaments.css'

const GAMES = [
  { id: '', label: 'All Games', icon: '🎮' },
  { id: 'bgmi', label: 'BGMI', icon: '🔫', color: '#ff6b00' },
  { id: 'valorant', label: 'Valorant', icon: '🎯', color: '#ff4655' },
  { id: 'freefire', label: 'Free Fire', icon: '🔥', color: '#ffcc00' },
  { id: 'fifa', label: 'FIFA', icon: '⚽', color: '#00aaff' },
]

const STATUSES = [
  { id: '', label: 'All' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'ongoing', label: 'Live' },
  { id: 'completed', label: 'Completed' },
]

const MOCK_TOURNAMENTS = [
  { _id: '1', title: 'BGMI Pro League S3', game: 'bgmi', status: 'upcoming', maxTeams: 16, registeredTeams: [{},{},{},{}], prizePool: '₹10,000', startDate: '2025-06-15', organizer: { name: 'ProGaming Events' }, format: 'single-elimination' },
  { _id: '2', title: 'Valorant Campus Cup', game: 'valorant', status: 'ongoing', maxTeams: 32, registeredTeams: new Array(28).fill({}), prizePool: '₹25,000', startDate: '2025-05-20', organizer: { name: 'EsportsIndia' }, format: 'double-elimination' },
  { _id: '3', title: 'Free Fire Frenzy', game: 'freefire', status: 'upcoming', maxTeams: 20, registeredTeams: new Array(12).fill({}), prizePool: '₹5,000', startDate: '2025-06-22', organizer: { name: 'CollegeGamer' }, format: 'single-elimination' },
  { _id: '4', title: 'FIFA Premier League', game: 'fifa', status: 'completed', maxTeams: 16, registeredTeams: new Array(16).fill({}), prizePool: '₹8,000', startDate: '2025-04-10', organizer: { name: 'SportsHub' }, format: 'round-robin' },
  { _id: '5', title: 'BGMI Invitational 2025', game: 'bgmi', status: 'ongoing', maxTeams: 24, registeredTeams: new Array(24).fill({}), prizePool: '₹15,000', startDate: '2025-05-18', organizer: { name: 'GamingZone' }, format: 'single-elimination' },
  { _id: '6', title: 'Valorant Night Series', game: 'valorant', status: 'upcoming', maxTeams: 16, registeredTeams: new Array(6).fill({}), prizePool: '₹12,000', startDate: '2025-07-01', organizer: { name: 'NightOwlGaming' }, format: 'single-elimination' },
]

const gameColors = { bgmi: '#ff6b00', valorant: '#ff4655', freefire: '#ffcc00', fifa: '#00aaff' }
const gameIcons = { bgmi: '🔫', valorant: '🎯', freefire: '🔥', fifa: '⚽' }

export default function Tournaments() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tournaments, setTournaments] = useState(MOCK_TOURNAMENTS)
  const [search, setSearch] = useState('')
  const [game, setGame] = useState(searchParams.get('game') || '')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true)
      try {
        const params = {}
        if (game) params.game = game
        if (status) params.status = status
        const { data } = await axios.get('/tournaments', { params })
        if (data.length > 0) setTournaments(data)
      } catch {
        // Use mock data if API unavailable
      } finally {
        setLoading(false)
      }
    }
    fetchTournaments()
  }, [game, status])

  const filtered = tournaments.filter(t =>
    (!game || t.game === game) &&
    (!status || t.status === status) &&
    (!search || t.title.toLowerCase().includes(search.toLowerCase()))
  )

  const handleGameChange = (g) => {
    setGame(g)
    if (g) setSearchParams({ game: g })
    else setSearchParams({})
  }

  return (
    <div className="tournaments-page">
      <div className="tournaments-hero">
        <div className="container">
          <h1 className="section-title">All <span className="text-gradient">Tournaments</span></h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Find and register for upcoming esports tournaments.</p>
        </div>
      </div>

      <div className="container tournaments-body">
        {/* Filters */}
        <div className="tournaments-filters">
          {/* Search */}
          <div className="search-wrapper">
            <Search size={16} className="search-icon" />
            <input
              id="tournament-search"
              className="form-input search-input"
              placeholder="Search tournaments..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Game Filter */}
          <div className="filter-chips">
            {GAMES.map(g => (
              <button
                key={g.id}
                className={`filter-chip ${game === g.id ? 'active' : ''}`}
                onClick={() => handleGameChange(g.id)}
                style={game === g.id && g.color ? { borderColor: g.color, color: g.color } : {}}
              >
                {g.icon} {g.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="filter-chips">
            {STATUSES.map(s => (
              <button key={s.id} className={`filter-chip ${status === s.id ? 'active' : ''}`}
                onClick={() => setStatus(s.id)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="results-meta">
          <span>{filtered.length} tournament{filtered.length !== 1 ? 's' : ''} found</span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex-center" style={{ padding: 80 }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏆</div>
            <h3>No tournaments found</h3>
            <p>Try changing your filters or check back later.</p>
          </div>
        ) : (
          <div className="tournaments-grid">
            {filtered.map(t => (
              <Link to={`/tournaments/${t._id}`} key={t._id} className="tournament-card" style={{ '--game-clr': gameColors[t.game] }}>
                <div className="tc-top">
                  <div className="tc-game-badge badge badge-" style={{ background: `${gameColors[t.game]}22`, color: gameColors[t.game], border: `1px solid ${gameColors[t.game]}44` }}>
                    {gameIcons[t.game]} {t.game?.toUpperCase()}
                  </div>
                  <div className={`badge ${ t.status === 'ongoing' ? 'badge-success' : t.status === 'upcoming' ? 'badge-info' : 'badge-warning' }`}>
                    {t.status === 'ongoing' && <span className="glow-dot" style={{ background: 'var(--neon-green)', boxShadow: '0 0 6px var(--neon-green)', width: 6, height: 6 }} />}
                    {t.status === 'ongoing' ? 'LIVE' : t.status === 'upcoming' ? 'UPCOMING' : 'ENDED'}
                  </div>
                </div>

                <h3 className="tc-title">{t.title}</h3>

                <div className="tc-meta">
                  <div className="tc-meta-item">
                    <Trophy size={14} />
                    <span>{t.prizePool || 'No prize'}</span>
                  </div>
                  <div className="tc-meta-item">
                    <Users size={14} />
                    <span>{t.registeredTeams?.length || 0}/{t.maxTeams} teams</span>
                  </div>
                  <div className="tc-meta-item">
                    <Calendar size={14} />
                    <span>{new Date(t.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>

                <div className="tc-footer">
                  <span className="tc-organizer">by {t.organizer?.name || 'Unknown'}</span>
                  <div className="tc-register-btn">
                    {t.status === 'upcoming' ? 'Register →' : t.status === 'ongoing' ? 'View Live →' : 'Results →'}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="tc-progress">
                  <div className="tc-progress-bar" style={{ width: `${((t.registeredTeams?.length || 0) / t.maxTeams) * 100}%`, background: gameColors[t.game] }} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
