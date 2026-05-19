import { useState, useEffect } from 'react'
import axios from 'axios'
import { Trophy, Medal } from 'lucide-react'
import './Leaderboard.css'

const GAMES = [
  { id: '', label: 'All Games', icon: '🎮' },
  { id: 'bgmi', label: 'BGMI', icon: '🔫', color: '#ff6b00' },
  { id: 'valorant', label: 'Valorant', icon: '🎯', color: '#ff4655' },
  { id: 'freefire', label: 'Free Fire', icon: '🔥', color: '#ffcc00' },
  { id: 'fifa', label: 'FIFA', icon: '⚽', color: '#00aaff' },
]

const MOCK_PLAYERS = [
  { _id: '1', name: 'ShadowKing', favoriteGame: 'bgmi', stats: { wins: 34, tournamentsPlayed: 40, kills: 480 } },
  { _id: '2', name: 'ValorantAce', favoriteGame: 'valorant', stats: { wins: 28, tournamentsPlayed: 35, kills: 320 } },
  { _id: '3', name: 'FireStarter', favoriteGame: 'freefire', stats: { wins: 22, tournamentsPlayed: 30, kills: 290 } },
  { _id: '4', name: 'GoalMachine', favoriteGame: 'fifa', stats: { wins: 19, tournamentsPlayed: 22, kills: 0 } },
  { _id: '5', name: 'NightHunter', favoriteGame: 'bgmi', stats: { wins: 17, tournamentsPlayed: 25, kills: 210 } },
  { _id: '6', name: 'QuantumAim', favoriteGame: 'valorant', stats: { wins: 15, tournamentsPlayed: 20, kills: 180 } },
  { _id: '7', name: 'StealthOp', favoriteGame: 'bgmi', stats: { wins: 14, tournamentsPlayed: 18, kills: 175 } },
  { _id: '8', name: 'EliteStriker', favoriteGame: 'fifa', stats: { wins: 12, tournamentsPlayed: 16, kills: 0 } },
  { _id: '9', name: 'PhoenixRise', favoriteGame: 'valorant', stats: { wins: 11, tournamentsPlayed: 15, kills: 140 } },
  { _id: '10', name: 'WildCard99', favoriteGame: 'freefire', stats: { wins: 9, tournamentsPlayed: 14, kills: 120 } },
]

const gameColors = { bgmi: '#ff6b00', valorant: '#ff4655', freefire: '#ffcc00', fifa: '#00aaff' }
const gameIcons = { bgmi: '🔫', valorant: '🎯', freefire: '🔥', fifa: '⚽' }

const RANK_MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
  const [players, setPlayers] = useState(MOCK_PLAYERS)
  const [game, setGame] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const params = game ? { game } : {}
    axios.get('/users/leaderboard', { params })
      .then(r => { if (r.data.length) setPlayers(r.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [game])

  const filtered = game ? players.filter(p => p.favoriteGame === game) : players

  return (
    <div className="lb-page">
      <div className="lb-hero">
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 className="section-title">🏆 <span className="text-gradient">Leaderboard</span></h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Top players across all game categories.</p>
        </div>
      </div>

      <div className="container lb-body">
        {/* Top 3 Podium */}
        {filtered.length >= 3 && (
          <div className="podium">
            {[filtered[1], filtered[0], filtered[2]].map((p, i) => {
              const pos = i === 0 ? 2 : i === 1 ? 1 : 3
              return (
                <div key={p._id} className={`podium-card pos-${pos}`}>
                  <div className="podium-rank">{RANK_MEDALS[pos - 1]}</div>
                  <div className="podium-avatar">{p.name[0]}</div>
                  <div className="podium-name">{p.name}</div>
                  <div className="podium-game" style={{ color: gameColors[p.favoriteGame] }}>{gameIcons[p.favoriteGame]} {p.favoriteGame?.toUpperCase()}</div>
                  <div className="podium-wins">{p.stats.wins} wins</div>
                  <div className={`podium-base base-${pos}`} />
                </div>
              )
            })}
          </div>
        )}

        {/* Game Filter */}
        <div className="filter-chips" style={{ marginBottom: 20, justifyContent: 'center' }}>
          {GAMES.map(g => (
            <button key={g.id} className={`filter-chip ${game === g.id ? 'active' : ''}`}
              onClick={() => setGame(g.id)}
              style={game === g.id && g.color ? { borderColor: g.color, color: g.color } : {}}>
              {g.icon} {g.label}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex-center" style={{ padding: 60 }}><div className="spinner" /></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Player</th>
                  <th>Game</th>
                  <th>Wins</th>
                  <th>Tournaments</th>
                  <th>Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p._id} className={i < 3 ? 'top-row' : ''}>
                    <td>
                      <span className="lb-rank">
                        {i < 3 ? RANK_MEDALS[i] : `#${i + 1}`}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="lb-avatar">{p.name[0]}</div>
                        <span style={{ fontWeight: 600 }}>{p.name}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: gameColors[p.favoriteGame], fontWeight: 600, fontSize: '0.85rem' }}>
                        {gameIcons[p.favoriteGame]} {p.favoriteGame?.toUpperCase() || '—'}
                      </span>
                    </td>
                    <td><span style={{ fontWeight: 700, color: 'var(--neon-green)' }}>{p.stats.wins}</span></td>
                    <td>{p.stats.tournamentsPlayed}</td>
                    <td>
                      <span className="lb-winrate">
                        {p.stats.tournamentsPlayed > 0 ? Math.round((p.stats.wins / p.stats.tournamentsPlayed) * 100) : 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
