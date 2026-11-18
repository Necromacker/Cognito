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

  const [activeTab, setActiveTab] = useState('patient'); // 'patient' or 'staff'
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('caretaker');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Patient PIN Pad buttons
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
      setError('Please enter your 4-digit code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await pinLogin(pin);
      navigate('/patient');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid PIN. Please ask your caretaker for help.');
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
      // Redirect based on role or let state handle it
      navigate(role === 'doctor' ? '/doctor' : (role === 'admin' ? '/admin' : '/caretaker'));
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Demo one-click shortcuts for testing
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
      <div className="login-container">
        {/* Header */}
        <div className="login-header">
          <div className="login-logo-pill">
            <span role="img" aria-label="brain">🧠</span> COGNITO CARE
          </div>
          <h1 className="login-title">{t('login_title')}</h1>
          <p className="login-subtitle">{t('login_subtitle')}</p>
        </div>

        {/* Quick Demo Logins Bar */}
        <div className="demo-shortcuts" aria-label="Demo one-click logins">
          <span className="demo-shortcuts__label">Quick Demo Access:</span>
          <button type="button" className="demo-chip demo-chip--patient" onClick={() => fillDemo('patient')}>
            👴 Patient (PIN 1234)
          </button>
          <button type="button" className="demo-chip" onClick={() => fillDemo('caretaker')}>
            👩‍⚕️ Caretaker
          </button>
          <button type="button" className="demo-chip" onClick={() => fillDemo('doctor')}>
            🩺 Doctor
          </button>
          <button type="button" className="demo-chip" onClick={() => fillDemo('admin')}>
            🛡️ Admin
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="login-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'patient'}
            className={`login-tab ${activeTab === 'patient' ? 'login-tab--active' : ''}`}
            onClick={() => { setActiveTab('patient'); setError(''); }}
          >
            👴 {t('tab_patient')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'staff'}
            className={`login-tab ${activeTab === 'staff' ? 'login-tab--active' : ''}`}
            onClick={() => { setActiveTab('staff'); setError(''); }}
          >
            💼 {t('tab_caretaker_doctor')}
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="login-error-alert" role="alert">
            <span>ℹ️</span> {error}
          </div>
        )}

        {/* Patient PIN Login View */}
        {activeTab === 'patient' ? (
          <div className="patient-login-box">
            <p className="patient-pin-instruction">{t('pin_prompt')}</p>

            {/* PIN Display Dots */}
            <div className="pin-display">
              {[0, 1, 2, 3].map(index => (
                <div
                  key={index}
                  className={`pin-dot ${pin.length > index ? 'pin-dot--filled' : ''}`}
                >
                  {pin.length > index ? '●' : '○'}
                </div>
              ))}
            </div>

            {/* Big Dementia-Friendly Numeric Keypad (minimum 72px touch targets) */}
            <div className="pin-keypad">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
                <button
                  key={digit}
                  type="button"
                  className="pin-key"
                  onClick={() => handlePinDigit(digit)}
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                className="pin-key pin-key--action"
                onClick={handlePinBackspace}
                aria-label="Delete last digit"
              >
                ⌫
              </button>
              <button
                type="button"
                className="pin-key"
                onClick={() => handlePinDigit('0')}
              >
                0
              </button>
              <button
                type="button"
                className="pin-key pin-key--submit"
                onClick={handlePatientSubmit}
                disabled={pin.length !== 4 || loading}
                aria-label="Enter PIN"
              >
                ➔
              </button>
            </div>

            <Button
              variant="patient"
              size="patient"
              className="patient-submit-btn"
              onClick={handlePatientSubmit}
              disabled={pin.length !== 4 || loading}
            >
              {loading ? 'Entering...' : 'Open My Cognito ➔'}
            </Button>
          </div>
        ) : (
          /* Staff (Caretaker / Doctor / Admin) View */
          <form className="staff-login-form" onSubmit={handleStaffSubmit}>
            {isRegistering && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Anjali Desai or Priya Sharma"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="caretaker">Caretaker / Family Member</option>
                    <option value="doctor">Doctor / Clinical Specialist</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">{t('email')}</label>
              <input
                type="email"
                required
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('password')}</label>
              <input
                type="password"
                required
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="large"
              className="staff-submit-btn"
              disabled={loading}
            >
              {loading ? 'Signing In...' : (isRegistering ? t('register') : t('sign_in'))}
            </Button>

            <div className="login-toggle-mode">
              <button
                type="button"
                className="link-btn"
                onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
              >
                {isRegistering
                  ? 'Already have an account? Sign in here'
                  : 'Need a new caretaker or doctor account? Register'}
              </button>
            </div>
          </form>
        )}

        {/* Safety Disclaimer */}
        <div className="login-disclaimer">
          {t('disclaimer')}
        </div>
      </div>
    </div>
  );
}

