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
    <div className="navbar-wrapper">
      {/* Reference Top Window Bar with dots & URL */}
      <div className="window-topbar">
        <div className="window-dots">
          <span className="window-dot window-dot--orange"></span>
          <span className="window-dot window-dot--yellow"></span>
          <span className="window-dot window-dot--green"></span>
        </div>
        <div className="window-url-box">
          COGNITO.CARE
        </div>
        <div className="window-badge-live">
          SYSTEM ACTIVE
        </div>
      </div>

      {/* Retro Dark Navbar Bar matching Reference */}
      <header className="navbar-floating-bar">
        <div className="navbar-left">
          <Link to={user ? (isPatient ? '/patient' : (user.role === 'doctor' ? '/doctor' : (user.role === 'admin' ? '/admin' : '/caretaker'))) : '/'} className="navbar-brand">
            <span className="navbar-pixel-icon">::</span>
            <span className="navbar-brand__text">COGNITO</span>
          </Link>
        </div>

        {user && (
          <nav className="navbar-center-links">
            {isPatient ? (
              <>
                <Link to="/patient" className={`nav-link ${location.pathname === '/patient' ? 'nav-link--active' : ''}`}>
                  HOME
                </Link>
                <Link to="/patient/games" className={`nav-link ${location.pathname.startsWith('/patient/games') ? 'nav-link--active' : ''}`}>
                  PLAY
                </Link>
                <Link to="/patient/memories" className={`nav-link ${location.pathname === '/patient/memories' ? 'nav-link--active' : ''}`}>
                  MEMORIES
                </Link>
              </>
            ) : (
              <>
                {user.role === 'caretaker' && (
                  <>
                    <Link to="/caretaker" className={`nav-link ${location.pathname === '/caretaker' ? 'nav-link--active' : ''}`}>
                      DASHBOARD
                    </Link>
                    <Link to="/caretaker/patients" className={`nav-link ${location.pathname.startsWith('/caretaker/patients') ? 'nav-link--active' : ''}`}>
                      PATIENTS
                    </Link>
                    <Link to="/caretaker/content" className={`nav-link ${location.pathname.startsWith('/caretaker/content') ? 'nav-link--active' : ''}`}>
                      LIBRARY
                    </Link>
                    <Link to="/caretaker/dailylog" className={`nav-link ${location.pathname.startsWith('/caretaker/dailylog') ? 'nav-link--active' : ''}`}>
                      DAILY LOG
                    </Link>
                    <Link to="/caretaker/reminders" className={`nav-link ${location.pathname.startsWith('/caretaker/reminders') ? 'nav-link--active' : ''}`}>
                      REMINDERS
                    </Link>
                    <Link to="/caretaker/settings" className={`nav-link ${location.pathname.startsWith('/caretaker/settings') ? 'nav-link--active' : ''}`}>
                      SETTINGS
                    </Link>
                  </>
                )}

                {user.role === 'doctor' && (
                  <>
                    <Link to="/doctor" className={`nav-link ${location.pathname === '/doctor' ? 'nav-link--active' : ''}`}>
                      PATIENTS
                    </Link>
                  </>
                )}

                {user.role === 'admin' && (
                  <>
                    <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'nav-link--active' : ''}`}>
                      ADMIN
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>
        )}

        <div className="navbar-right">
          <LanguageSwitcher />
          {user ? (
            <button type="button" className="navbar-pink-btn" onClick={handleLogout}>
              SIGN OUT
            </button>
          ) : (
            <Link to="/" className="navbar-pink-btn">
              SIGN IN
            </Link>
          )}
        </div>
      </header>
    </div>
  );
}
