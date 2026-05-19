import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Menu, X, Trophy, ChevronDown, LogOut, User, LayoutDashboard, Users, Gamepad2 } from 'lucide-react'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setDropOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navLinks = [
    { label: 'Tournaments', href: '/tournaments' },
    { label: 'Leaderboard', href: '/leaderboard' },
  ]

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <Trophy size={24} className="navbar-logo-icon" />
          <span className="navbar-logo-text">
            Clutch<span className="text-gradient">Queue</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="navbar-links">
          {navLinks.map(link => (
            <Link
              key={link.href}
              to={link.href}
              className={`navbar-link ${location.pathname === link.href ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth Section */}
        <div className="navbar-auth">
          {user ? (
            <div className="navbar-user" onClick={() => setDropOpen(!dropOpen)}>
              <div className="navbar-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="avatar" width={32} height={32} />
                ) : (
                  <div className="navbar-avatar-placeholder">{user.name?.[0]?.toUpperCase()}</div>
                )}
              </div>
              <span className="navbar-username">{user.name}</span>
              <ChevronDown size={14} className={`navbar-chevron ${dropOpen ? 'open' : ''}`} />

              {dropOpen && (
                <div className="navbar-dropdown">
                  <Link to="/profile" className="dropdown-item">
                    <User size={14} /> Profile
                  </Link>
                  {user.role === 'player' ? (
                    <>
                      <Link to="/dashboard" className="dropdown-item">
                        <LayoutDashboard size={14} /> Dashboard
                      </Link>
                      <Link to="/teams" className="dropdown-item">
                        <Users size={14} /> My Teams
                      </Link>
                    </>
                  ) : (
                    <Link to="/organizer" className="dropdown-item">
                      <LayoutDashboard size={14} /> Organizer Panel
                    </Link>
                  )}
                  <div className="dropdown-divider" />
                  <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar-auth-buttons">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join Now</Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button className="navbar-mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar-mobile-menu">
          {navLinks.map(link => (
            <Link key={link.href} to={link.href} className="mobile-link">{link.label}</Link>
          ))}
          {user ? (
            <>
              <Link to="/profile" className="mobile-link">Profile</Link>
              {user.role === 'player' ? (
                <>
                  <Link to="/dashboard" className="mobile-link">Dashboard</Link>
                  <Link to="/teams" className="mobile-link">My Teams</Link>
                </>
              ) : (
                <Link to="/organizer" className="mobile-link">Organizer Panel</Link>
              )}
              <button className="mobile-link mobile-logout" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <div className="mobile-auth">
              <Link to="/login" className="btn btn-ghost">Login</Link>
              <Link to="/register" className="btn btn-primary">Join Now</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
