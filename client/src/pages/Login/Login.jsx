import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import './Login.css';

export default function Login() {
  const { login, pinLogin, register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Active Portal: 'patient', 'doctor', 'admin', 'caregiver'
  const [activePortal, setActivePortal] = useState('patient');
  
  // Patient PIN state
  const [pin, setPin] = useState('');
  
  // Staff Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // All Portals definition
  const portals = [
    {
      id: 'patient',
      theme: 'theme-patient',
      badgeIcon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
      ),
      badgeTextKey: 'hero_badge_patient',
      titleKey: 'hero_title_patient',
      subtitleKey: 'hero_sub_patient',
      image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Smiling elderly couple with tablet',
      formTitleKey: 'form_title_patient',
      formSubtitleKey: 'form_sub_patient',
      accessTitleKey: 'other_access_patient_title',
      accessDescKey: 'other_access_patient_desc',
      badgeClass: 'access-badge-teal',
      icon: 'user',
      bottomPillars: [
        { titleKey: 'pillar_games_title', subKey: 'pillar_games_sub', color: 'green', icon: 'game' },
        { titleKey: 'pillar_memories_title', subKey: 'pillar_memories_sub', color: 'sage', icon: 'photo' },
        { titleKey: 'pillar_tracking_title', subKey: 'pillar_tracking_sub', color: 'teal', icon: 'chart' },
        { titleKey: 'pillar_reminders_title', subKey: 'pillar_reminders_sub', color: 'amber', icon: 'bell' }
      ]
    },
    {
      id: 'caregiver',
      theme: 'theme-caregiver',
      badgeIcon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <polyline points="16 11 18 13 22 9"/>
        </svg>
      ),
      badgeTextKey: 'hero_badge_caregiver',
      titleKey: 'hero_title_caregiver',
      subtitleKey: 'hero_sub_caregiver',
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Caregiver assisting elderly resident',
      formTitleKey: 'form_title_caregiver',
      formSubtitleKey: 'form_sub_caregiver',
      submitButtonKey: 'btn_login_caregiver',
      demoEmail: 'caretaker@demo.com',
      demoPassword: 'demo1234',
      accessTitleKey: 'other_access_caregiver_title',
      accessDescKey: 'other_access_caregiver_desc',
      badgeClass: 'access-badge-green',
      icon: 'user',
      bottomPillars: [
        { titleKey: 'pillar_games_title', subKey: 'pillar_games_sub', color: 'green', icon: 'game' },
        { titleKey: 'pillar_memories_title', subKey: 'pillar_memories_sub', color: 'sage', icon: 'photo' },
        { titleKey: 'pillar_tracking_title', subKey: 'pillar_tracking_sub', color: 'teal', icon: 'chart' },
        { titleKey: 'pillar_reminders_title', subKey: 'pillar_reminders_sub', color: 'amber', icon: 'bell' }
      ]
    },
    {
      id: 'doctor',
      theme: 'theme-doctor',
      badgeIcon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
          <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
          <circle cx="20" cy="10" r="2"/>
        </svg>
      ),
      badgeTextKey: 'hero_badge_doctor',
      titleKey: 'hero_title_doctor',
      subtitleKey: 'hero_sub_doctor',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Doctor assisting elderly patient with a digital tablet',
      formTitleKey: 'form_title_doctor',
      formSubtitleKey: 'form_sub_doctor',
      submitButtonKey: 'btn_login_doctor',
      demoEmail: 'doctor@demo.com',
      demoPassword: 'demo1234',
      accessTitleKey: 'other_access_doctor_title',
      accessDescKey: 'other_access_doctor_desc',
      badgeClass: 'access-badge-purple',
      icon: 'doctor',
      bottomPillars: [
        { titleKey: 'pillar_doc_eval_title', subKey: 'pillar_doc_eval_sub', color: 'purple', icon: 'brain' },
        { titleKey: 'pillar_doc_analysis_title', subKey: 'pillar_doc_analysis_sub', color: 'purple-deep', icon: 'chart' },
        { titleKey: 'pillar_doc_coord_title', subKey: 'pillar_doc_coord_sub', color: 'blue', icon: 'users' },
        { titleKey: 'pillar_doc_secure_title', subKey: 'pillar_doc_secure_sub', color: 'indigo', icon: 'shield' }
      ]
    },
    {
      id: 'admin',
      theme: 'theme-admin',
      badgeIcon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      ),
      badgeTextKey: 'hero_badge_admin',
      titleKey: 'hero_title_admin',
      subtitleKey: 'hero_sub_admin',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Modern laptop with analytical dashboard and charts',
      formTitleKey: 'form_title_admin',
      formSubtitleKey: 'form_sub_admin',
      submitButtonKey: 'btn_login_admin',
      demoEmail: 'admin@demo.com',
      demoPassword: 'demo1234',
      accessTitleKey: 'other_access_admin_title',
      accessDescKey: 'other_access_admin_desc',
      badgeClass: 'access-badge-amber',
      icon: 'gear',
      bottomPillars: [
        { titleKey: 'pillar_admin_role_title', subKey: 'pillar_admin_role_sub', color: 'blue', icon: 'shield' },
        { titleKey: 'pillar_admin_data_title', subKey: 'pillar_admin_data_sub', color: 'teal', icon: 'database' },
        { titleKey: 'pillar_admin_usage_title', subKey: 'pillar_admin_usage_sub', color: 'cyan', icon: 'chart' },
        { titleKey: 'pillar_admin_backup_title', subKey: 'pillar_admin_backup_sub', color: 'indigo', icon: 'cloud' }
      ]
    }
  ];

  const curr = portals.find(p => p.id === activePortal) || portals[0];

  // Other access items for the right card: ONLY the other 3 portals across ALL login pages!
  const otherAccessItems = portals.filter(p => p.id !== activePortal);

  // PIN Keypad Handlers
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
      setError(t('pin_error_required'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      await pinLogin(pin);
      navigate('/patient');
    } catch (err) {
      setError(err.response?.data?.error || t('pin_error_incorrect'));
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const roleToSubmit = activePortal === 'caregiver' ? 'caretaker' : activePortal;
      if (isRegistering) {
        await register({ email, password, role: roleToSubmit, name });
      } else {
        await login(email, password);
      }
      navigate(activePortal === 'doctor' ? '/doctor' : (activePortal === 'admin' ? '/admin' : '/caretaker'));
    } catch (err) {
      setError(err.response?.data?.error || t('auth_error_generic'));
    } finally {
      setLoading(false);
    }
  };

  const switchPortal = (newPortal) => {
    setActivePortal(newPortal);
    setError('');
    setIsRegistering(false);
    const target = portals.find(p => p.id === newPortal);
    if (target?.demoEmail) {
      setEmail(target.demoEmail);
      setPassword(target.demoPassword);
    } else {
      setPin('');
    }
  };

  const fillDemoPin = () => {
    setPin('1234');
    setError('');
  };

  const fillStaffDemo = () => {
    if (curr.demoEmail) {
      setEmail(curr.demoEmail);
      setPassword(curr.demoPassword);
      setError('');
    }
  };

  // Icon Helper for Badges & Pillars
  const renderIcon = (type) => {
    switch (type) {
      case 'user':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>;
      case 'doctor':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>;
      case 'gear':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
      case 'chart':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
      case 'game':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 12 10 8 10 11 14 11 14 8 18 12 14 16 14 13 10 13 10 16 6 12"/></svg>;
      case 'photo':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>;
      case 'bell':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>;
      case 'brain':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z"/></svg>;
      case 'users':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
      case 'shield':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
      case 'database':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>;
      case 'cloud':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>;
      default:
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>;
    }
  };

  return (
    <div className={`login-screen ${curr.theme}`}>
      <div className="bg-blob bg-blob--top-left" aria-hidden="true"></div>
      <div className="bg-blob bg-blob--bottom-right" aria-hidden="true"></div>

      <div className="login-main-container">

        {/* 3-Column Top Row matching spec and Figma screenshots */}
        <div className="login-hero-row">

          {/* Column 1: Left Hero Description & Image */}
          <div className="hero-left-column">
            <div className="portal-badge-pill">
              {curr.badgeIcon}
              <span>{t(curr.badgeTextKey)}</span>
            </div>
            <h1 className="hero-main-title">{t(curr.titleKey)}</h1>
            <p className="hero-main-subtitle">{t(curr.subtitleKey)}</p>

            <div className="hero-image-wrapper">
              <img
                src={curr.image}
                alt={curr.imageAlt}
                className="hero-couple-img"
                loading="eager"
              />
            </div>
          </div>

          {/* Column 2: Center Interactive Card */}
          <div className="login-center-column">
            {activePortal === 'patient' ? (
              /* Patient PIN Keypad Card */
              <div className="patient-pin-card">
                <span className="patient-access-badge">
                  {curr.badgeIcon}
                  <span>{t(curr.badgeTextKey)}</span>
                </span>
                <h2 className="pin-card-title">{t(curr.formTitleKey)}</h2>
                <p className="pin-card-subtitle">{t(curr.formSubtitleKey)}</p>

                {error && <div className="card-error-banner" role="alert">{error}</div>}

                {/* 4-Box PIN Display */}
                <div className="pin-boxes-container" aria-label="PIN entry">
                  {[0, 1, 2, 3].map(index => (
                    <div
                      key={index}
                      className={`pin-box ${pin.length > index ? 'pin-box--filled' : ''} ${pin.length === index ? 'pin-box--active' : ''}`}
                    >
                      {pin.length > index ? '●' : '—'}
                    </div>
                  ))}
                </div>

                {/* Keypad Grid */}
                <div className="pin-keypad-grid">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button
                      key={num}
                      type="button"
                      className="keypad-key"
                      onClick={() => handlePinDigit(num.toString())}
                      disabled={loading || pin.length >= 4}
                    >
                      {num}
                    </button>
                  ))}
                  
                  {/* Delete button */}
                  <button
                    type="button"
                    className="keypad-key keypad-key--action"
                    onClick={handlePinBackspace}
                    disabled={loading || pin.length === 0}
                    aria-label="Delete last digit"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m10 15 5-6M15 15l-5-6M18 6H8a2 2 0 0 0-1.6.8L2 12l4.4 5.2A2 2 0 0 0 8 18h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z"/>
                    </svg>
                  </button>

                  {/* Zero */}
                  <button
                    type="button"
                    className="keypad-key"
                    onClick={() => handlePinDigit('0')}
                    disabled={loading || pin.length >= 4}
                  >
                    0
                  </button>

                  {/* Enter button */}
                  <button
                    type="button"
                    className="keypad-key keypad-key--enter"
                    onClick={() => handlePatientSubmit()}
                    disabled={loading || pin.length !== 4}
                  >
                    <span>{t('btn_enter')}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                </div>

                {/* Demo Helper Button */}
                <div className="quick-demo-row">
                  <button type="button" className="quick-demo-pill" onClick={fillDemoPin}>
                    {t('demo_pin_hint')}
                  </button>
                </div>
              </div>
            ) : (
              /* Doctor, Admin & Caregiver Staff Login Card */
              <div className="patient-pin-card staff-login-card">
                <div className="portal-top-badge-row">
                  <div className="portal-icon-box">
                    {curr.badgeIcon}
                  </div>
                  {curr.demoEmail && (
                    <button type="button" className="quick-fill-demo-btn" onClick={fillStaffDemo}>
                      {t('demo_creds_hint')}
                    </button>
                  )}
                </div>

                <h2 className="pin-card-title">{t(curr.formTitleKey)}</h2>
                <p className="pin-card-subtitle">{t(curr.formSubtitleKey)}</p>

                {error && <div className="card-error-banner" role="alert">{error}</div>}

                <form onSubmit={handleStaffSubmit} className="staff-login-form">
                  {isRegistering && (
                    <div className="form-group-clean">
                      <label>{t('label_name')}</label>
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
                    <label>{t('label_email')}</label>
                    <div className="input-with-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2"/>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="input-clean"
                      />
                    </div>
                  </div>

                  <div className="form-group-clean">
                    <label>{t('label_password')}</label>
                    <div className="input-with-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="input-clean"
                      />
                    </div>
                  </div>

                  <div className="form-options-row">
                    <label className="checkbox-clean">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                      />
                      <span>{t('remember_me')}</span>
                    </label>
                    <a href="#forgot" className="forgot-link" onClick={(e) => { e.preventDefault(); alert('Demo credentials: ' + (curr.demoEmail || 'doctor@demo.com')); }}>
                      {t('forgot_password')}
                    </a>
                  </div>

                  <button type="submit" className="btn-staff-submit" disabled={loading}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                      <polyline points="10 17 15 12 10 7"/>
                      <line x1="15" x2="3" y1="12" y2="12"/>
                    </svg>
                    <span>{loading ? t('btn_processing') : (isRegistering ? t('btn_register_signin') : (t(curr.submitButtonKey) || t('sign_in')))}</span>
                  </button>

                  <div className="staff-toggle-row">
                    <button
                      type="button"
                      className="text-toggle-btn"
                      onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                    >
                      {isRegistering ? t('toggle_have_account') : t('toggle_need_account')}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Column 3: ONLY Other Access Sidebar across ALL Login Portals */}
          <div className="login-right-column">
            <div className="other-access-card">
              <div className="other-access-header">
                <div className="other-access-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <h3 className="other-access-title">{t('other_access_title')}</h3>
              </div>

              {/* Show the remaining 3 portals cleanly and interactively */}
              <div className="access-options-list">
                {otherAccessItems.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    className="access-item-card"
                    onClick={() => switchPortal(item.id)}
                  >
                    <div className={`access-badge ${item.badgeClass}`}>
                      {renderIcon(item.icon)}
                    </div>
                    <div className="access-text-group">
                      <span className="access-name">{t(item.accessTitleKey)}</span>
                      <span className="access-desc">{t(item.accessDescKey)}</span>
                    </div>
                    <div className="access-chevron">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom 4-Pillar Features Bar */}
        <div className="features-bottom-pill">
          {curr.bottomPillars.map((pill, i) => (
            <div key={i} className="feature-item">
              <div className={`feature-item__icon feature-item__icon--${pill.color}`}>
                {renderIcon(pill.icon)}
              </div>
              <div className="feature-item__content">
                <span className="feature-item__title">{t(pill.titleKey)}</span>
                <span className="feature-item__subtitle">{t(pill.subKey)}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
