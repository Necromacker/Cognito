import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isPatient = user && user.role === 'patient';

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Left: Brand with Brain Icon */}
        <Link to={user ? (isPatient ? '/patient' : (user.role === 'doctor' ? '/doctor' : (user.role === 'admin' ? '/admin' : '/caretaker'))) : '/'} className="navbar-brand">
          <div className="navbar-brand__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 4.18A2.5 2.5 0 0 0 6.5 19.5h11a2.5 2.5 0 0 0 2.42-3.54 3 3 0 0 0 .34-4.18 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 12 4.5Z"/>
              <path d="M12 4.5v15"/>
            </svg>
          </div>
          <div className="navbar-brand__text-group">
            <span className="navbar-brand__title">Cognito Care</span>
            <span className="navbar-brand__subtitle">Dementia Care & Cognitive Engagement</span>
          </div>
        </Link>

        {/* Center: Nav links */}
        <nav className="navbar-nav">
          {user ? (
            isPatient ? (
              <>
                <Link to="/patient" className={`nav-item ${location.pathname === '/patient' ? 'nav-item--active' : ''}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  <span>Home</span>
                </Link>
                <Link to="/patient/games" className={`nav-item ${location.pathname.startsWith('/patient/games') ? 'nav-item--active' : ''}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="12" x="2" y="6" rx="2"/>
                    <path d="M6 12h4m-2-2v4"/>
                    <circle cx="16" cy="12" r="1.5"/>
                  </svg>
                  <span>Play</span>
                </Link>
                <Link to="/patient/memories" className={`nav-item ${location.pathname === '/patient/memories' ? 'nav-item--active' : ''}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2"/>
                    <circle cx="9" cy="9" r="2"/>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                  </svg>
                  <span>Memories</span>
                </Link>
              </>
            ) : (
              <>
                {user.role === 'caretaker' && (
                  <>
                    <Link to="/caretaker" className={`nav-item ${location.pathname === '/caretaker' ? 'nav-item--active' : ''}`}>
                      <span>Dashboard</span>
                    </Link>
                    <Link to="/caretaker/patients" className={`nav-item ${location.pathname.startsWith('/caretaker/patients') ? 'nav-item--active' : ''}`}>
                      <span>Patients</span>
                    </Link>
                    <Link to="/caretaker/content" className={`nav-item ${location.pathname.startsWith('/caretaker/content') ? 'nav-item--active' : ''}`}>
                      <span>Library</span>
                    </Link>
                    <Link to="/caretaker/dailylog" className={`nav-item ${location.pathname.startsWith('/caretaker/dailylog') ? 'nav-item--active' : ''}`}>
                      <span>Daily Log</span>
                    </Link>
                    <Link to="/caretaker/reminders" className={`nav-item ${location.pathname.startsWith('/caretaker/reminders') ? 'nav-item--active' : ''}`}>
                      <span>Reminders</span>
                    </Link>
                    <Link to="/caretaker/settings" className={`nav-item ${location.pathname.startsWith('/caretaker/settings') ? 'nav-item--active' : ''}`}>
                      <span>Settings</span>
                    </Link>
                  </>
                )}
                {user.role === 'doctor' && (
                  <Link to="/doctor" className={`nav-item ${location.pathname === '/doctor' ? 'nav-item--active' : ''}`}>
                    <span>Patients</span>
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className={`nav-item ${location.pathname === '/admin' ? 'nav-item--active' : ''}`}>
                    <span>Admin</span>
                  </Link>
                )}
              </>
            )
          ) : (
            <>
              <Link to="/" className={`nav-item ${location.pathname === '/' ? 'nav-item--active' : ''}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span>Home</span>
              </Link>
              <a href="#features" className="nav-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="12" x="2" y="6" rx="2"/>
                  <path d="M6 12h4m-2-2v4"/>
                  <circle cx="16" cy="12" r="1.5"/>
                </svg>
                <span>Play</span>
              </a>
              <a href="#memories" className="nav-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
                <span>Memories</span>
              </a>
              <a href="#about" className="nav-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4m0-4h.01"/>
                </svg>
                <span>About</span>
              </a>
            </>
          )}
        </nav>

        {/* Right: Language & Sign In/Out */}
        <div className="navbar-actions">
          <LanguageSwitcher />
          {user ? (
            <button type="button" className="btn-signout" onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" x2="9" y1="12" y2="12"/>
              </svg>
              <span>Sign Out</span>
            </button>
          ) : (
            <Link to="/" className="btn-signout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" x2="3" y1="12" y2="12"/>
              </svg>
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
