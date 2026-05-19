import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { Plus, Users, MessageSquare, Send, Loader, X, Crown } from 'lucide-react'
import toast from 'react-hot-toast'
import io from 'socket.io-client'
import './Teams.css'

const GAMES = ['bgmi', 'valorant', 'freefire', 'fifa']
const gameColors = { bgmi: '#ff6b00', valorant: '#ff4655', freefire: '#ffcc00', fifa: '#00aaff' }
const gameIcons = { bgmi: '🔫', valorant: '🎯', freefire: '🔥', fifa: '⚽' }
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

const MOCK_TEAMS = [
  { _id: 't1', name: 'Ghost Unit', game: 'bgmi', wins: 5, losses: 2, isRecruiting: true, description: 'We dominate the battlefield.', captain: { _id: 'u1', name: 'ShadowKing' }, members: [{ _id: 'u1', name: 'ShadowKing' }, { _id: 'u2', name: 'Reaper99' }] },
  { _id: 't2', name: 'Valorant Vipers', game: 'valorant', wins: 3, losses: 1, isRecruiting: true, description: 'Precision over everything.', captain: { _id: 'u3', name: 'AcePlayer' }, members: [{ _id: 'u3', name: 'AcePlayer' }] },
]

export default function Teams() {
  const { user } = useAuth()
  const [teams, setTeams] = useState(MOCK_TEAMS)
  const [myTeams, setMyTeams] = useState([])
  const [tab, setTab] = useState('browse')
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', game: 'bgmi', description: '' })
  const [creating, setCreating] = useState(false)
  const [chatTeam, setChatTeam] = useState(null)
  const [messages, setMessages] = useState([])
  const [msgInput, setMsgInput] = useState('')
  const [sending, setSending] = useState(false)
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    axios.get('/teams').then(r => { if (r.data.length) setTeams(r.data) }).catch(() => {})
    axios.get('/teams/my').then(r => setMyTeams(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (chatTeam) {
      socketRef.current = io(SOCKET_URL)
      socketRef.current.emit('join_team', chatTeam._id)
      socketRef.current.on('receive_message', msg => {
        setMessages(prev => [...prev, msg])
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
      axios.get(`/messages/${chatTeam._id}`).then(r => setMessages(r.data)).catch(() => setMessages([]))
      return () => socketRef.current?.disconnect()
    }
  }, [chatTeam])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleCreate = async e => {
    e.preventDefault()
    setCreating(true)
    try {
      const { data } = await axios.post('/teams', createForm)
      setMyTeams(prev => [data, ...prev])
      setTeams(prev => [data, ...prev])
      toast.success(`Team "${data.name}" created! 🎉`)
      setShowCreate(false)
      setCreateForm({ name: '', game: 'bgmi', description: '' })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Create failed')
    } finally {
      setCreating(false)
    }
  }

  const handleJoin = async (teamId) => {
    try {
      await axios.put(`/teams/${teamId}/join`)
      toast.success('Joined team! 💪')
      const { data } = await axios.get('/teams/my')
      setMyTeams(data)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not join')
    }
  }

  const handleLeave = async (teamId, teamName) => {
    if (!window.confirm(`Leave ${teamName}?`)) return
    try {
      await axios.put(`/teams/${teamId}/leave`)
      toast.success('Left team')
      setMyTeams(prev => prev.filter(t => t._id !== teamId))
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not leave')
    }
  }

  const sendMessage = async () => {
    if (!msgInput.trim() || !chatTeam) return
    setSending(true)
    try {
      const { data } = await axios.post('/messages', { teamId: chatTeam._id, content: msgInput.trim() })
      socketRef.current?.emit('send_message', { teamId: chatTeam._id, message: data })
      setMessages(prev => [...prev, data])
      setMsgInput('')
    } catch { toast.error('Failed to send') }
    finally { setSending(false) }
  }

  const isMember = (team) => myTeams.some(t => t._id === team._id) || team.members?.some(m => m._id === user?._id)

  return (
    <div className="teams-page">
      <div className="teams-hero">
        <div className="container">
          <h1 className="section-title">Teams & <span className="text-gradient">Squads</span></h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Build your squad, join existing teams, and compete together.</p>
        </div>
      </div>

      <div className="container teams-body">
        <div className="teams-layout">
          {/* Main */}
          <div className="teams-main">
            <div className="teams-tabs-row">
              <div className="pd-tabs">
                {['browse', 'my teams'].map(t => (
                  <button key={t} className={`pd-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)} id="create-team-btn">
                <Plus size={15} /> Create Team
              </button>
            </div>

            {/* Browse All Teams */}
            {tab === 'browse' && (
              <div className="teams-grid animate-fade">
                {teams.map(team => (
                  <div key={team._id} className="team-card card">
                    <div className="team-card-top">
                      <div className="team-logo" style={{ background: `${gameColors[team.game]}22`, color: gameColors[team.game] }}>
                        {gameIcons[team.game]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <h3 className="team-name">{team.name}</h3>
                          {team.isRecruiting && <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>RECRUITING</span>}
                        </div>
                        <div className="team-sub">{team.game?.toUpperCase()} · {team.members?.length || 0} members</div>
                      </div>
                    </div>
                    {team.description && <p className="team-desc">{team.description}</p>}
                    <div className="team-stats-row">
                      <span style={{ color: 'var(--neon-green)', fontWeight: 600 }}>{team.wins}W</span>
                      <span style={{ color: 'var(--neon-pink)', fontWeight: 600 }}>{team.losses}L</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Captain: {team.captain?.name}</span>
                    </div>
                    <div className="team-actions">
                      {isMember(team) ? (
                        <>
                          <button className="btn btn-ghost btn-sm" onClick={() => { setChatTeam(team); setTab('chat') }}>
                            <MessageSquare size={14} /> Chat
                          </button>
                          {team.captain?._id !== user?._id && (
                            <button className="btn btn-outline btn-sm" style={{ borderColor: 'var(--neon-pink)', color: 'var(--neon-pink)' }} onClick={() => handleLeave(team._id, team.name)}>Leave</button>
                          )}
                        </>
                      ) : (
                        <button className="btn btn-primary btn-sm" onClick={() => handleJoin(team._id)}>Join Team</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* My Teams */}
            {tab === 'my teams' && (
              <div className="animate-fade">
                {myTeams.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>👥</div>
                    <h3 style={{ fontFamily: 'var(--font-display)' }}>No Teams Yet</h3>
                    <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Create a team or join one to get started.</p>
                    <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowCreate(true)}>Create Team</button>
                  </div>
                ) : myTeams.map(team => (
                  <div key={team._id} className="my-team-row card">
                    <div className="team-logo" style={{ background: `${gameColors[team.game]}22`, color: gameColors[team.game], width: 44, height: 44, flexShrink: 0 }}>
                      {gameIcons[team.game]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem' }}>{team.name}</span>
                        {team.captain?._id === user?._id && <Crown size={14} style={{ color: 'gold' }} />}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        {team.members?.length || 0} members · {team.wins}W {team.losses}L
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setChatTeam(team); setTab('chat') }}>
                      <MessageSquare size={14} /> Team Chat
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Chat */}
            {tab === 'chat' && chatTeam && (
              <div className="chat-container animate-fade">
                <div className="chat-header">
                  <div className="team-logo" style={{ background: `${gameColors[chatTeam.game]}22`, color: gameColors[chatTeam.game], width: 36, height: 36 }}>{gameIcons[chatTeam.game]}</div>
                  <span style={{ fontWeight: 700 }}>{chatTeam.name} — Team Chat</span>
                  <button className="icon-btn" style={{ marginLeft: 'auto' }} onClick={() => { setChatTeam(null); setTab('my teams') }}><X size={15} /></button>
                </div>
                <div className="chat-messages">
                  {messages.length === 0 && <div className="chat-empty">No messages yet. Say hi! 👋</div>}
                  {messages.map((msg, i) => {
                    const isMe = msg.sender?._id === user?._id || msg.sender === user?._id
                    return (
                      <div key={msg._id || i} className={`chat-msg ${isMe ? 'me' : 'them'}`}>
                        {!isMe && <div className="chat-sender-avatar">{(msg.sender?.name || '?')[0]}</div>}
                        <div className="chat-bubble">
                          {!isMe && <div className="chat-sender-name">{msg.sender?.name}</div>}
                          <p>{msg.content}</p>
                          <span className="chat-time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
                <div className="chat-input-row">
                  <input className="form-input chat-input" placeholder="Type a message..." value={msgInput}
                    onChange={e => setMsgInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} />
                  <button className="btn btn-primary" onClick={sendMessage} disabled={sending || !msgInput.trim()} id="send-message-btn">
                    {sending ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Team Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="modal-content">
            <h2 className="modal-title">Create New Team</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Team Name</label>
                <input className="form-input" placeholder="e.g. Ghost Unit" value={createForm.name}
                  onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Game</label>
                <select className="form-select" value={createForm.game}
                  onChange={e => setCreateForm(p => ({ ...p, game: e.target.value }))}>
                  {GAMES.map(g => <option key={g} value={g}>{gameIcons[g]} {g.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <textarea className="form-input" rows={2} placeholder="Describe your team..."
                  value={createForm.description} onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating} id="create-team-submit-btn">
                  {creating ? <><Loader size={14} className="animate-spin" /> Creating...</> : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
