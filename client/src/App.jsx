import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Tournaments from './pages/Tournaments'
import TournamentDetail from './pages/TournamentDetail'
import PlayerDashboard from './pages/PlayerDashboard'
import OrganizerDashboard from './pages/OrganizerDashboard'
import Profile from './pages/Profile'
import Teams from './pages/Teams'
import Leaderboard from './pages/Leaderboard'
import CreateTournament from './pages/CreateTournament'
import ManageTournament from './pages/ManageTournament'

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { user } = useAuth()

  return (
    <div className="page-wrapper">
      <div className="bg-grid" />
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'organizer' ? '/organizer' : '/dashboard'} />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to={user.role === 'organizer' ? '/organizer' : '/dashboard'} />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/tournaments/:id" element={<TournamentDetail />} />
        <Route path="/leaderboard" element={<Leaderboard />} />

        {/* Player Routes */}
        <Route path="/dashboard" element={<ProtectedRoute role="player"><PlayerDashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/teams" element={<ProtectedRoute role="player"><Teams /></ProtectedRoute>} />

        {/* Organizer Routes */}
        <Route path="/organizer" element={<ProtectedRoute role="organizer"><OrganizerDashboard /></ProtectedRoute>} />
        <Route path="/organizer/create" element={<ProtectedRoute role="organizer"><CreateTournament /></ProtectedRoute>} />
        <Route path="/organizer/manage/:id" element={<ProtectedRoute role="organizer"><ManageTournament /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
