import { Link } from 'react-router-dom'
import { Trophy, Zap, Users, Shield, ChevronRight, Star, Target, Award } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './Landing.css'

const GAMES = [
  { id: 'bgmi', name: 'BGMI', color: '#ff6b00', icon: '🔫', players: '2.1K', tournaments: 48 },
  { id: 'valorant', name: 'Valorant', color: '#ff4655', icon: '🎯', players: '3.4K', tournaments: 62 },
  { id: 'freefire', name: 'Free Fire', color: '#ffcc00', icon: '🔥', players: '1.8K', tournaments: 35 },
  { id: 'fifa', name: 'FIFA', color: '#00aaff', icon: '⚽', players: '1.2K', tournaments: 27 },
]

const FEATURES = [
  { icon: <Trophy size={28} />, title: 'Easy Registration', desc: 'Register your team for tournaments in seconds. No paperwork, no hassle.' },
  { icon: <Zap size={28} />, title: 'Live Match Updates', desc: 'Follow matches in real-time. Instant score updates and bracket progression.' },
  { icon: <Users size={28} />, title: 'Team Management', desc: 'Build your squad, manage rosters, and communicate via team chat.' },
  { icon: <Shield size={28} />, title: 'Verified Tournaments', desc: 'Organizer-verified events with transparent rules and prize tracking.' },
  { icon: <Target size={28} />, title: 'Smart Brackets', desc: 'Auto-generated brackets for single and double elimination formats.' },
  { icon: <Award size={28} />, title: 'Leaderboards', desc: 'Global and per-game rankings to show who truly dominates.' },
]

const STATS = [
  { value: '12K+', label: 'Players Registered' },
  { value: '172', label: 'Tournaments Hosted' },
  { value: '4', label: 'Game Titles' },
  { value: '98%', label: 'Satisfaction Rate' },
]

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        <div className="container hero-content">
          <div className="hero-badge">
            <span className="glow-dot" />
            <span>Season 3 Now Live — Register Your Team</span>
          </div>
          <h1 className="hero-title">
            The Ultimate<br />
            <span className="text-gradient">Esports Arena</span><br />
            For College Gamers
          </h1>
          <p className="hero-subtitle">
            ClutchQueue brings competitive gaming to your campus. Create teams, join tournaments, track leaderboards — all in one place.
          </p>
          <div className="hero-cta">
            {user ? (
              <Link to={user.role === 'organizer' ? '/organizer' : '/dashboard'} className="btn btn-primary btn-lg">
                Go to Dashboard <ChevronRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Start Playing Free <ChevronRight size={18} />
                </Link>
                <Link to="/tournaments" className="btn btn-outline btn-lg">
                  Browse Tournaments
                </Link>
              </>
            )}
          </div>

          {/* Stats Row */}
          <div className="hero-stats">
            {STATS.map(s => (
              <div key={s.label} className="hero-stat">
                <span className="hero-stat-value">{s.value}</span>
                <span className="hero-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Categories */}
      <section className="section games-section">
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <h2 className="section-title">Choose Your <span className="text-gradient">Game</span></h2>
            <p className="section-subtitle">Compete across four premier game titles with dedicated tournament tracks and leaderboards.</p>
          </div>
          <div className="games-grid">
            {GAMES.map(game => (
              <Link to={`/tournaments?game=${game.id}`} key={game.id} className="game-card" style={{ '--game-color': game.color }}>
                <div className="game-icon">{game.icon}</div>
                <div className="game-info">
                  <h3 className="game-name">{game.name}</h3>
                  <div className="game-meta">
                    <span>{game.players} players</span>
                    <span>·</span>
                    <span>{game.tournaments} tournaments</span>
                  </div>
                </div>
                <div className="game-arrow"><ChevronRight size={18} /></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section features-section">
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <h2 className="section-title">Everything You Need to <span className="text-gradient">Compete</span></h2>
            <p className="section-subtitle">Built for gamers, by gamers. Every feature designed to enhance your competitive experience.</p>
          </div>
          <div className="grid-3 features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-banner">
            <div className="cta-glow" />
            <div className="cta-content">
              <div className="cta-stars">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#ffcc00" color="#ffcc00" />)}
              </div>
              <h2 className="cta-title">Ready to <span className="text-gradient">Clutch It?</span></h2>
              <p className="cta-subtitle">Join 12,000+ players competing in college esports tournaments across India.</p>
              <div className="hero-cta">
                <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
                <Link to="/tournaments" className="btn btn-outline btn-lg">View Tournaments</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-logo">
            <Trophy size={20} className="footer-logo-icon" />
            <span className="footer-logo-text">Clutch<span className="text-gradient">Queue</span></span>
          </div>
          <p className="footer-copy">© 2025 ClutchQueue. Built for college esports communities.</p>
          <div className="footer-links">
            <Link to="/tournaments">Tournaments</Link>
            <Link to="/leaderboard">Leaderboard</Link>
            <Link to="/register">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
