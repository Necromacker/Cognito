import React, { useState } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isPatient = user && user.role === 'patient';

  return (
    <header className={`navbar-header ${isPatient ? 'navbar-header--patient' : ''}`}>
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to={user ? (isPatient ? '/patient' : (user.role === 'doctor' ? '/doctor' : (user.role === 'admin' ? '/admin' : '/caretaker'))) : '/'} className="navbar-brand">
          <span className="navbar-brand__icon" role="img" aria-label="brain">🧠</span>
          <span className="navbar-brand__text">COGNITO</span>
          <span className="navbar-brand__badge">CARE</span>
        </Link>

        {/* Mobile toggle button */}
        {user && !isPatient && (
          <button
            type="button"
            className="navbar-mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
          >
            ☰
          </button>
        )}

        {/* Nav Links */}
        {user && (
          <nav className={`navbar-nav ${menuOpen ? 'navbar-nav--open' : ''}`}>
            {isPatient ? (
              <div className="navbar-patient-links">
                <Link
                  to="/patient"
                  className={`navbar-patient-link ${location.pathname === '/patient' ? 'navbar-patient-link--active' : ''}`}
                >
                  🏠 {t('back_home')}
                </Link>
                <Link
                  to="/patient/memories"
                  className={`navbar-patient-link ${location.pathname === '/patient/memories' ? 'navbar-patient-link--active' : ''}`}
                >
                  🖼️ {t('my_memories')}
                </Link>
              </div>
            ) : (
              <div className="navbar-role-links">
                {user.role === 'caretaker' && (
                  <>
                    <Link to="/caretaker" className={`nav-link ${location.pathname === '/caretaker' ? 'nav-link--active' : ''}`}>
                      {t('dashboard')}
                    </Link>
                    <Link to="/caretaker/patients" className={`nav-link ${location.pathname.startsWith('/caretaker/patients') ? 'nav-link--active' : ''}`}>
                      Patients
                    </Link>
                    <Link to="/caretaker/content" className={`nav-link ${location.pathname.startsWith('/caretaker/content') ? 'nav-link--active' : ''}`}>
                      {t('content_library')}
                    </Link>
                    <Link to="/caretaker/dailylog" className={`nav-link ${location.pathname.startsWith('/caretaker/dailylog') ? 'nav-link--active' : ''}`}>
                      {t('daily_log')}
                    </Link>
                    <Link to="/caretaker/reminders" className={`nav-link ${location.pathname.startsWith('/caretaker/reminders') ? 'nav-link--active' : ''}`}>
                      {t('reminders')}
                    </Link>
                    <Link to="/caretaker/settings" className={`nav-link ${location.pathname.startsWith('/caretaker/settings') ? 'nav-link--active' : ''}`}>
                      {t('settings')}
                    </Link>
                  </>
                )}

                {user.role === 'doctor' && (
                  <>
                    <Link to="/doctor" className={`nav-link ${location.pathname === '/doctor' ? 'nav-link--active' : ''}`}>
                      {t('doctor_dashboard')}
                    </Link>
                  </>
                )}

                {user.role === 'admin' && (
                  <>
                    <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'nav-link--active' : ''}`}>
                      {t('admin_panel')}
                    </Link>
                  </>
                )}
              </div>
            )}

            <div className="navbar-actions">
              <LanguageSwitcher />
              <button
                type="button"
                className={`navbar-logout-btn ${isPatient ? 'navbar-logout-btn--patient' : ''}`}
                onClick={handleLogout}
              >
                {t('logout')}
              </button>
            </div>
          </nav>
        )}

        {!user && (
          <div className="navbar-actions">
            <LanguageSwitcher />
          </div>
        )}
      </div>
    </header>
  );
}

