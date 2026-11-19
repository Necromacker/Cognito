import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import './Login.css';

export default function Login() {
  const { login, pinLogin, register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('patient'); // 'patient' or 'staff'
  const [staffRole, setStaffRole] = useState('caretaker'); // 'caretaker', 'doctor', 'admin'
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePinDigit = (digit) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
      setError('');
    }
  };

  const handlePinBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handlePatientSubmit = async (e) => {
    if (e) e.preventDefault();
    if (pin.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await pinLogin(pin);
      navigate('/patient');
    } catch (err) {
      setError(err.response?.data?.error || 'Incorrect PIN. Try PIN: 1234');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegistering) {
        await register({ email, password, role: staffRole, name });
      } else {
        await login(email, password);
      }
      navigate(staffRole === 'doctor' ? '/doctor' : (staffRole === 'admin' ? '/admin' : '/caretaker'));
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const openStaffLogin = (role) => {
    setStaffRole(role);
    setActiveTab('staff');
    setIsRegistering(false);
    setError('');
    if (role === 'caretaker') {
      setEmail('caretaker@demo.com');
      setPassword('demo1234');
    } else if (role === 'doctor') {
      setEmail('doctor@demo.com');
      setPassword('demo1234');
    } else if (role === 'admin') {
      setEmail('admin@demo.com');
      setPassword('demo1234');
    }
  };

  const fillDemoPin = () => {
    setPin('1234');
    setError('');
  };

  return (
    <div className="login-screen">
      {/* Background Soft Organic Shapes */}
      <div className="bg-blob bg-blob--top-left"></div>
      <div className="bg-blob bg-blob--bottom-right"></div>

      <div className="login-main-container">
        
        {/* Top 3-Column Section */}
        <div className="login-hero-row">
          
          {/* Column 1: Hero Pitch & Warm Couple Image */}
          <div className="hero-left-column">
            <h1 className="hero-main-title">
              Cognitive Care <br />for Dementia
            </h1>
            <p className="hero-main-subtitle">
              Engaging games, meaningful memories and daily care support for a better quality of life.
            </p>
            <div className="hero-image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=700&q=80"
                alt="Smiling elderly couple enjoying a digital tablet"
                className="hero-couple-img"
              />
            </div>
          </div>

          {/* Column 2: Center Interactive Card (Patient PIN or Staff Login) */}
          <div className="login-center-column">
            {activeTab === 'patient' ? (
              <div className="patient-pin-card">
                <div className="patient-access-badge">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  </svg>
                  <span>Patient Access</span>
                </div>

                <h2 className="pin-card-title">Enter Patient PIN</h2>
                <p className="pin-card-subtitle">
                  Access your personalized cognitive games and memory activities.
                </p>

                {error && <div className="card-error-banner">{error}</div>}

                {/* 4 PIN Slots */}
                <div className="pin-boxes-container">
                  {[0, 1, 2, 3].map(idx => (
                    <div
                      key={idx}
                      className={`pin-box ${pin.length > idx ? 'pin-box--filled' : ''} ${pin.length === idx ? 'pin-box--active' : ''}`}
                    >
                      {pin.length > idx ? '●' : '—'}
                    </div>
                  ))}
                </div>

                {/* 3x4 Soft Keypad */}
                <div className="pin-keypad-grid">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
                    <button
                      key={digit}
                      type="button"
                      className="keypad-key"
                      onClick={() => handlePinDigit(digit)}
                    >
                      {digit}
                    </button>
                  ))}
                  
                  {/* Backspace Key */}
                  <button
                    type="button"
                    className="keypad-key keypad-key--action"
                    onClick={handlePinBackspace}
                    title="Delete"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m10 15 5-5m0 5-5-5"/>
                      <path d="M7 21h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H7a2 2 0 0 0-1.75 1.03L1.5 12l3.75 7.97A2 2 0 0 0 7 21z"/>
                    </svg>
                  </button>

                  {/* 0 Key */}
                  <button
                    type="button"
                    className="keypad-key"
                    onClick={() => handlePinDigit('0')}
                  >
                    0
                  </button>

                  {/* Enter Key */}
                  <button
                    type="button"
                    className="keypad-key keypad-key--enter"
                    onClick={handlePatientSubmit}
                    disabled={pin.length !== 4 || loading}
                  >
                    <span>{loading ? '...' : 'Enter'}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </button>
                </div>

                {/* Quick One-Click Demo Helper */}
                <div className="quick-demo-row">
                  <button type="button" className="quick-demo-pill" onClick={fillDemoPin}>
                    Fill Demo PIN (1234)
                  </button>
                </div>
              </div>
            ) : (
              <div className="patient-pin-card staff-login-card">
                <button
                  type="button"
                  className="back-to-pin-btn"
                  onClick={() => { setActiveTab('patient'); setError(''); }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"/>
                    <polyline points="12 19 5 12 12 5"/>
                  </svg>
                  <span>Back to Patient PIN</span>
                </button>

                <h2 className="pin-card-title">
                  {staffRole === 'caretaker' && 'Caregiver Login'}
                  {staffRole === 'doctor' && 'Doctor Login'}
                  {staffRole === 'admin' && 'Staff Admin Login'}
                </h2>
                <p className="pin-card-subtitle">
                  {staffRole === 'caretaker' && 'Monitor activity, upload memories, and record daily logs.'}
                  {staffRole === 'doctor' && 'Review longitudinal progress and export clinical reports.'}
                  {staffRole === 'admin' && 'System administration and doctor verifications.'}
                </p>

                {error && <div className="card-error-banner">{error}</div>}

                <form onSubmit={handleStaffSubmit} className="staff-login-form">
                  {isRegistering && (
                    <div className="form-group-clean">
                      <label>Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Your Name"
                        className="input-clean"
                      />
                    </div>
                  )}

                  <div className="form-group-clean">
                    <label>Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="input-clean"
                    />
                  </div>

                  <div className="form-group-clean">
                    <label>Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-clean"
                    />
                  </div>

                  <button type="submit" className="btn-staff-submit" disabled={loading}>
                    <span>{loading ? 'Signing in...' : (isRegistering ? 'Register' : 'Sign In')}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </button>

                  <div className="staff-toggle-row">
                    <button
                      type="button"
                      className="text-toggle-btn"
                      onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                    >
                      {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Column 3: Other Access Card matching Image 2 */}
          <div className="login-right-column">
            <div className="other-access-card">
              <div className="other-access-header">
                <div className="other-access-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <h3 className="other-access-title">Other Access</h3>
              </div>

              <div className="access-options-list">
                {/* 1. Caregiver Login */}
                <button
                  type="button"
                  className={`access-item-card ${activeTab === 'staff' && staffRole === 'caretaker' ? 'access-item-card--active' : ''}`}
                  onClick={() => openStaffLogin('caretaker')}
                >
                  <div className="access-badge access-badge--green">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <polyline points="16 11 18 13 22 9"/>
                    </svg>
                  </div>
                  <div className="access-text-group">
                    <span className="access-name">Caregiver Login</span>
                    <span className="access-desc">Monitor activity & daily care</span>
                  </div>
                  <div className="access-chevron">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                </button>

                {/* 2. Doctor Login */}
                <button
                  type="button"
                  className={`access-item-card ${activeTab === 'staff' && staffRole === 'doctor' ? 'access-item-card--active' : ''}`}
                  onClick={() => openStaffLogin('doctor')}
                >
                  <div className="access-badge access-badge--purple">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
                      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
                      <circle cx="20" cy="10" r="2"/>
                    </svg>
                  </div>
                  <div className="access-text-group">
                    <span className="access-name">Doctor Login</span>
                    <span className="access-desc">View progress & clinical reports</span>
                  </div>
                  <div className="access-chevron">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                </button>

                {/* 3. Staff / Admin Login */}
                <button
                  type="button"
                  className={`access-item-card ${activeTab === 'staff' && staffRole === 'admin' ? 'access-item-card--active' : ''}`}
                  onClick={() => openStaffLogin('admin')}
                >
                  <div className="access-badge access-badge--amber">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </div>
                  <div className="access-text-group">
                    <span className="access-name">Staff Login</span>
                    <span className="access-desc">System administration</span>
                  </div>
                  <div className="access-chevron">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom 4-Pillar Features Bar matching Image 2 */}
        <div className="features-bottom-pill">
          <div className="feature-item">
            <div className="feature-item__icon feature-item__icon--green">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="12" x="2" y="6" rx="2"/>
                <path d="M6 12h4m-2-2v4"/>
                <circle cx="16" cy="12" r="1.5"/>
              </svg>
            </div>
            <div className="feature-item__content">
              <span className="feature-item__title">Cognitive Games</span>
              <span className="feature-item__subtitle">Brain-stimulating activities</span>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-item__icon feature-item__icon--sage">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              </svg>
            </div>
            <div className="feature-item__content">
              <span className="feature-item__title">Personal Memories</span>
              <span className="feature-item__subtitle">Relive people, places & moments</span>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-item__icon feature-item__icon--teal">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </div>
            <div className="feature-item__content">
              <span className="feature-item__title">Progress Tracking</span>
              <span className="feature-item__subtitle">Monitor cognitive engagement</span>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-item__icon feature-item__icon--amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
              </svg>
            </div>
            <div className="feature-item__content">
              <span className="feature-item__title">Daily Reminders</span>
              <span className="feature-item__subtitle">Medications & routines</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
