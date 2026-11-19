import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import './Login.css';

export default function Login() {
  const { login, pinLogin, register } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Active Portal: 'patient', 'doctor', 'admin', 'caregiver'
  const [activePortal, setActivePortal] = useState('patient');
  
  // Patient PIN state
  const [pin, setPin] = useState('');
  
  // Staff Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Portal metadata matching uploaded images
  const portalConfig = {
    patient: {
      theme: 'theme-patient',
      badgeIcon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
      ),
      badgeText: 'Patient Access',
      title: 'Cognitive Care for Dementia',
      subtitle: 'Engaging games, meaningful memories and daily care support for a better quality of life.',
      image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Smiling elderly couple with tablet',
      formTitle: 'Enter Patient PIN',
      formSubtitle: 'Access your personalized cognitive games and memory activities.',
      featuresTitle: 'Other Access',
      features: [
        { id: 'caregiver', title: 'Caregiver Login', desc: 'Monitor activity & daily care', badgeClass: 'badge-green', icon: 'user' },
        { id: 'doctor', title: 'Doctor Login', desc: 'View progress & clinical reports', badgeClass: 'badge-purple', icon: 'doctor' },
        { id: 'admin', title: 'Staff Login', desc: 'System administration', badgeClass: 'badge-amber', icon: 'gear' }
      ],
      bottomPillars: [
        { title: 'Cognitive Games', subtitle: 'Brain-stimulating activities', color: 'green', icon: 'game' },
        { title: 'Personal Memories', subtitle: 'Relive people, places & moments', color: 'sage', icon: 'photo' },
        { title: 'Progress Tracking', subtitle: 'Monitor cognitive engagement', color: 'teal', icon: 'chart' },
        { title: 'Daily Reminders', subtitle: 'Medications & routines', color: 'amber', icon: 'bell' }
      ]
    },
    doctor: {
      theme: 'theme-doctor',
      badgeIcon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
          <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
          <circle cx="20" cy="10" r="2"/>
        </svg>
      ),
      badgeText: 'Doctor Portal',
      title: 'Clinical Care & Cognitive Assessment',
      subtitle: 'Monitor patients, review cognitive progress, analyze reports and manage care plans effectively.',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Doctor assisting elderly patient with a digital tablet',
      formTitle: 'Doctor Login',
      formSubtitle: 'Access patient records, assessment reports and clinical insights.',
      submitButtonText: 'Login to Doctor Portal',
      demoEmail: 'doctor@demo.com',
      demoPassword: 'demo1234',
      featuresTitle: 'Doctor Features',
      features: [
        { id: 'pat_mgmt', title: 'Patient Management', desc: 'View and manage patient profiles', badgeClass: 'badge-purple', icon: 'user' },
        { id: 'cog_rep', title: 'Cognitive Reports', desc: 'Track assessment results & trends', badgeClass: 'badge-purple-deep', icon: 'chart' },
        { id: 'clin_notes', title: 'Clinical Notes', desc: 'Add observations and recommendations', badgeClass: 'badge-amber', icon: 'note' },
        { id: 'care_plan', title: 'Care Plan', desc: 'Update therapy and activity plans', badgeClass: 'badge-blue', icon: 'calendar' }
      ],
      bottomPillars: [
        { title: 'Cognitive Assessments', subtitle: 'Evaluate memory, attention & more', color: 'purple', icon: 'brain' },
        { title: 'Progress Analysis', subtitle: 'Track improvement over time', color: 'purple-deep', icon: 'chart' },
        { title: 'Care Coordination', subtitle: 'Collaborate with caregivers & family', color: 'blue', icon: 'users' },
        { title: 'Secure Records', subtitle: 'HIPAA compliant & data protected', color: 'indigo', icon: 'shield' }
      ]
    },
    admin: {
      theme: 'theme-admin',
      badgeIcon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      ),
      badgeText: 'Admin Portal',
      title: 'System Management & Control',
      subtitle: 'Manage users, modules, content and overall platform operations for Cognito Care.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Modern laptop with analytical dashboard and charts',
      formTitle: 'Admin Login',
      formSubtitle: 'Access system controls, user management and platform settings.',
      submitButtonText: 'Login to Admin Portal',
      demoEmail: 'admin@demo.com',
      demoPassword: 'demo1234',
      featuresTitle: 'Admin Features',
      features: [
        { id: 'usr_mgmt', title: 'User Management', desc: 'Add, update or deactivate users', badgeClass: 'badge-blue', icon: 'user' },
        { id: 'mod_mgmt', title: 'Module Management', desc: 'Enable, disable or configure games', badgeClass: 'badge-purple-deep', icon: 'layers' },
        { id: 'sys_rep', title: 'System Reports', desc: 'View usage and performance analytics', badgeClass: 'badge-teal', icon: 'chart' },
        { id: 'plat_set', title: 'Platform Settings', desc: 'Manage system, security and data', badgeClass: 'badge-amber', icon: 'gear' }
      ],
      bottomPillars: [
        { title: 'Role Control', subtitle: 'Manage patient, caregiver & doctor access', color: 'blue', icon: 'shield' },
        { title: 'Data Management', subtitle: 'Monitor and maintain platform data', color: 'teal', icon: 'database' },
        { title: 'Usage Analytics', subtitle: 'Track system activity & engagement', color: 'cyan', icon: 'chart' },
        { title: 'Backup & Security', subtitle: 'Ensure data safety and availability', color: 'indigo', icon: 'cloud' }
      ]
    },
    caregiver: {
      theme: 'theme-caregiver',
      badgeIcon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <polyline points="16 11 18 13 22 9"/>
        </svg>
      ),
      badgeText: 'Caregiver Portal',
      title: 'Caregiver Coordination & Monitoring',
      subtitle: 'Track daily wellness, hydration, medications, and review cognitive engagement.',
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Caregiver assisting elderly resident',
      formTitle: 'Caregiver Login',
      formSubtitle: 'Access care tracking, patient memory albums and reminder schedules.',
      submitButtonText: 'Login to Caregiver Portal',
      demoEmail: 'caretaker@demo.com',
      demoPassword: 'demo1234',
      featuresTitle: 'Caregiver Features',
      features: [
        { id: 'daily_well', title: 'Daily Wellness Logs', desc: 'Track hydration, meals & sleep', badgeClass: 'badge-green', icon: 'note' },
        { id: 'mem_lib', title: 'Memory Library', desc: 'Upload family photos & voice clips', badgeClass: 'badge-sage', icon: 'photo' },
        { id: 'med_rem', title: 'Medication Reminders', desc: 'Keep track of daily medications', badgeClass: 'badge-amber', icon: 'bell' },
        { id: 'game_tune', title: 'Game Customization', desc: 'Adjust difficulty & enable games', badgeClass: 'badge-teal', icon: 'gear' }
      ],
      bottomPillars: [
        { title: 'Hydration & Nutrition', subtitle: 'Interactive daily water tracker', color: 'teal', icon: 'chart' },
        { title: 'Medication Adherence', subtitle: 'Daily morning, noon & night logs', color: 'amber', icon: 'bell' },
        { title: 'Memory Reminiscence', subtitle: 'Personalized people & song media', color: 'sage', icon: 'photo' },
        { title: 'Cognitive Score', subtitle: 'Automated performance trend score', color: 'green', icon: 'brain' }
      ]
    }
  };

  const curr = portalConfig[activePortal];

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
      setError('Please enter your 4-digit PIN');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await pinLogin(pin);
      navigate('/patient');
    } catch (err) {
      setError(err.response?.data?.error || 'Incorrect PIN. Try demo PIN: 1234');
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
      setError(err.response?.data?.error || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const switchPortal = (newPortal) => {
    setActivePortal(newPortal);
    setError('');
    setIsRegistering(false);
    const target = portalConfig[newPortal];
    if (target.demoEmail) {
      setEmail(target.demoEmail);
      setPassword(target.demoPassword);
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

  // Icon Helper for Badges
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
      case 'note':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
      case 'calendar':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
      case 'layers':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
      default:
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>;
    }
  };

  return (
    <div className={`login-screen ${curr.theme}`}>
      {/* Background Soft Gradients */}
      <div className="bg-blob bg-blob--top-left"></div>
      <div className="bg-blob bg-blob--bottom-right"></div>

      <div className="login-main-container">
        
        {/* Top 3-Column Section */}
        <div className="login-hero-row">
          
          {/* Column 1: Hero Pitch & Picture (dynamically updates per portal) */}
          <div className="hero-left-column">
            <div className="portal-badge-pill">
              {curr.badgeIcon}
              <span>{curr.badgeText}</span>
            </div>

            <h1 className="hero-main-title">
              {curr.title}
            </h1>
            <p className="hero-main-subtitle">
              {curr.subtitle}
            </p>

            <div className="hero-image-wrapper">
              <img
                src={curr.image}
                alt={curr.imageAlt}
                className="hero-couple-img"
              />
            </div>
          </div>

          {/* Column 2: Center Interactive Card (Patient PIN or Portal Login) */}
          <div className="login-center-column">
            {activePortal === 'patient' ? (
              <div className="patient-pin-card">
                <div className="patient-access-badge">
                  {curr.badgeIcon}
                  <span>{curr.badgeText}</span>
                </div>

                <h2 className="pin-card-title">{curr.formTitle}</h2>
                <p className="pin-card-subtitle">{curr.formSubtitle}</p>

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

                {/* 3x4 Keypad */}
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

                  <button
                    type="button"
                    className="keypad-key"
                    onClick={() => handlePinDigit('0')}
                  >
                    0
                  </button>

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

                <div className="quick-demo-row">
                  <button type="button" className="quick-demo-pill" onClick={fillDemoPin}>
                    Fill Demo PIN (1234)
                  </button>
                </div>
              </div>
            ) : (
              /* Portal Staff Login (Doctor / Admin / Caregiver matching reference images) */
              <div className="patient-pin-card staff-login-card">
                <div className="portal-top-badge-row">
                  <button
                    type="button"
                    className="back-to-pin-btn"
                    onClick={() => switchPortal('patient')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12"/>
                      <polyline points="12 19 5 12 12 5"/>
                    </svg>
                    <span>Patient Access</span>
                  </button>
                  <button type="button" className="quick-fill-demo-btn" onClick={fillStaffDemo}>
                    Use Demo Credentials
                  </button>
                </div>

                <div className="portal-icon-box">
                  {curr.badgeIcon}
                </div>

                <h2 className="pin-card-title">{curr.formTitle}</h2>
                <p className="pin-card-subtitle">{curr.formSubtitle}</p>

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
                    <label>Email / Username</label>
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
                    <label>Password</label>
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

                  <button type="submit" className="btn-staff-submit" disabled={loading}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                      <polyline points="10 17 15 12 10 7"/>
                      <line x1="15" x2="3" y1="12" y2="12"/>
                    </svg>
                    <span>{loading ? 'Processing...' : (isRegistering ? 'Register & Sign In' : (curr.submitButtonText || 'Login to Portal'))}</span>
                  </button>

                  <div className="staff-toggle-row">
                    <button
                      type="button"
                      className="text-toggle-btn"
                      onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                    >
                      {isRegistering ? 'Already registered? Sign In' : 'Need an account? Register'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Column 3: Features / Switcher Sidebar matching Images */}
          <div className="login-right-column">
            <div className="other-access-card">
              <div className="other-access-header">
                <div className="other-access-icon">
                  {curr.badgeIcon}
                </div>
                <h3 className="other-access-title">{curr.featuresTitle}</h3>
              </div>

              <div className="access-options-list">
                {activePortal === 'patient' ? (
                  /* When on patient, clicking these switches portal */
                  curr.features.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      className="access-item-card"
                      onClick={() => switchPortal(item.id)}
                    >
                      <div className={`access-badge access-${item.badgeClass}`}>
                        {renderIcon(item.icon)}
                      </div>
                      <div className="access-text-group">
                        <span className="access-name">{item.title}</span>
                        <span className="access-desc">{item.desc}</span>
                      </div>
                      <div className="access-chevron">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </div>
                    </button>
                  ))
                ) : (
                  /* When on Doctor/Admin/Caregiver, shows feature items matching screenshot */
                  <>
                    {curr.features.map(item => (
                      <div key={item.id} className="access-item-card access-item-card--feature">
                        <div className={`access-badge access-${item.badgeClass}`}>
                          {renderIcon(item.icon)}
                        </div>
                        <div className="access-text-group">
                          <span className="access-name">{item.title}</span>
                          <span className="access-desc">{item.desc}</span>
                        </div>
                        <div className="access-chevron">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"/>
                          </svg>
                        </div>
                      </div>
                    ))}

                    {/* Portal Switcher Buttons at bottom of card */}
                    <div className="portal-quick-switch-tabs">
                      <span className="switch-label">Switch Access:</span>
                      <div className="switch-buttons-row">
                        <button type="button" className={`switch-pill ${activePortal === 'patient' ? 'switch-pill--active' : ''}`} onClick={() => switchPortal('patient')}>
                          Patient
                        </button>
                        <button type="button" className={`switch-pill ${activePortal === 'caregiver' ? 'switch-pill--active' : ''}`} onClick={() => switchPortal('caregiver')}>
                          Caregiver
                        </button>
                        <button type="button" className={`switch-pill ${activePortal === 'doctor' ? 'switch-pill--active' : ''}`} onClick={() => switchPortal('doctor')}>
                          Doctor
                        </button>
                        <button type="button" className={`switch-pill ${activePortal === 'admin' ? 'switch-pill--active' : ''}`} onClick={() => switchPortal('admin')}>
                          Admin
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom 4-Pillar Features Bar matching uploaded images */}
        <div className="features-bottom-pill">
          {curr.bottomPillars.map((pill, i) => (
            <div key={i} className="feature-item">
              <div className={`feature-item__icon feature-item__icon--${pill.color}`}>
                {renderIcon(pill.icon)}
              </div>
              <div className="feature-item__content">
                <span className="feature-item__title">{pill.title}</span>
                <span className="feature-item__subtitle">{pill.subtitle}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
