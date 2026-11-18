import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Button from '../../components/Button/Button';
import './Login.css';

export default function Login() {
  const { login, pinLogin, register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('patient');
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('caretaker');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePinDigit = (digit) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
    }
  };

  const handlePinBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handlePatientSubmit = async (e) => {
    if (e) e.preventDefault();
    if (pin.length !== 4) {
      setError('Enter 4-digit PIN');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await pinLogin(pin);
      navigate('/patient');
    } catch (err) {
      setError(err.response?.data?.error || 'Incorrect PIN. Try again.');
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
        await register({ email, password, role, name });
      } else {
        await login(email, password);
      }
      navigate(role === 'doctor' ? '/doctor' : (role === 'admin' ? '/admin' : '/caretaker'));
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoType) => {
    setError('');
    if (demoType === 'patient') {
      setActiveTab('patient');
      setPin('1234');
    } else if (demoType === 'caretaker') {
      setActiveTab('staff');
      setIsRegistering(false);
      setEmail('caretaker@demo.com');
      setPassword('demo1234');
    } else if (demoType === 'doctor') {
      setActiveTab('staff');
      setIsRegistering(false);
      setEmail('doctor@demo.com');
      setPassword('demo1234');
    } else if (demoType === 'admin') {
      setActiveTab('staff');
      setIsRegistering(false);
      setEmail('admin@demo.com');
      setPassword('demo1234');
    }
  };

  return (
    <div className="login-page">
      <div className="login-stage">
        
        {/* Main Retro Card */}
        <div className="login-box card">
          <div className="login-top-tag">
            <span className="badge badge--pink">SYSTEM</span>
            <span className="badge badge--green">DEMO READY</span>
          </div>

          <h1 className="login-title">COGNITO</h1>
          <p className="login-subtitle">Cognitive engagement & care coordination platform.</p>

          {/* Clean Tab Switcher */}
          <div className="login-tabs">
            <button
              type="button"
              className={`login-tab ${activeTab === 'patient' ? 'login-tab--active' : ''}`}
              onClick={() => { setActiveTab('patient'); setError(''); }}
            >
              PATIENT PIN
            </button>
            <button
              type="button"
              className={`login-tab ${activeTab === 'staff' ? 'login-tab--active' : ''}`}
              onClick={() => { setActiveTab('staff'); setError(''); }}
            >
              STAFF LOGIN
            </button>
          </div>

          {error && <div className="login-error-alert">{error}</div>}

          {/* Patient PIN View */}
          {activeTab === 'patient' ? (
            <div className="patient-pin-flow">
              <div className="pin-dots-display">
                {[0, 1, 2, 3].map(idx => (
                  <div key={idx} className={`pin-slot ${pin.length > idx ? 'pin-slot--filled' : ''}`}>
                    {pin.length > idx ? '●' : '—'}
                  </div>
                ))}
              </div>

              <div className="pin-keypad-compact">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
                  <button key={d} type="button" className="pin-num-btn" onClick={() => handlePinDigit(d)}>
                    {d}
                  </button>
                ))}
                <button type="button" className="pin-num-btn pin-num-btn--action" onClick={handlePinBackspace}>
                  DEL
                </button>
                <button type="button" className="pin-num-btn" onClick={() => handlePinDigit('0')}>
                  0
                </button>
                <button
                  type="button"
                  className="pin-num-btn pin-num-btn--enter"
                  onClick={handlePatientSubmit}
                  disabled={pin.length !== 4 || loading}
                >
                  OK
                </button>
              </div>

              <Button
                variant="primary"
                onClick={handlePatientSubmit}
                disabled={pin.length !== 4 || loading}
                style={{ width: '100%' }}
              >
                {loading ? 'Entering...' : 'ENTER'}
              </Button>
            </div>
          ) : (
            <form className="staff-form" onSubmit={handleStaffSubmit}>
              {isRegistering && (
                <>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
                      <option value="caretaker">Caretaker / Family</option>
                      <option value="doctor">Doctor / Clinician</option>
                    </select>
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <Button type="submit" variant="primary" style={{ width: '100%', marginTop: '6px' }}>
                {loading ? 'Processing...' : (isRegistering ? 'REGISTER' : 'SIGN IN')}
              </Button>

              <div className="toggle-reg">
                <button
                  type="button"
                  className="reg-btn"
                  onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                >
                  {isRegistering ? 'Have account? Sign in' : 'Create new account'}
                </button>
              </div>
            </form>
          )}

          <div className="disclaimer-note">
            This app supports cognitive engagement. It is not a diagnostic tool.
          </div>
        </div>

        {/* Yellow Post-It Note Callout matching Reference "2P COUCH CO-OP" */}
        <div className="postit-card login-postit">
          <div className="postit-card__title">QUICK ACCESS</div>
          <div className="postit-card__text">ONE-CLICK DEMO ACCOUNTS:</div>
          <div className="postit-btns">
            <button type="button" className="postit-pill" onClick={() => fillDemo('patient')}>
              Patient PIN 1234
            </button>
            <button type="button" className="postit-pill" onClick={() => fillDemo('caretaker')}>
              Caretaker
            </button>
            <button type="button" className="postit-pill" onClick={() => fillDemo('doctor')}>
              Doctor
            </button>
            <button type="button" className="postit-pill" onClick={() => fillDemo('admin')}>
              Admin
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
