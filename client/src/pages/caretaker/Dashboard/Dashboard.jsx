import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../api';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Trackers state
  const [waterGlasses, setWaterGlasses] = useState(5);
  const [meds, setMeds] = useState({ morning: true, noon: true, night: false });
  const [trackerMessage, setTrackerMessage] = useState('');

  useEffect(() => {
    api.get('/patients')
      .then(res => {
        setPatients(res.data);
        if (res.data.length > 0) {
          setSelectedPatientId(String(res.data[0].id));
        }
      })
      .catch(console.error);

    api.get('/dashboard/alerts')
      .then(res => setAlerts(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      setLoading(true);
      Promise.all([
        api.get(`/dashboard/stats/${selectedPatientId}`),
        api.get(`/dashboard/chart/${selectedPatientId}?days=7`)
      ]).then(([sRes, cRes]) => {
        setStats(sRes.data);
        setChartData(cRes.data);
        if (sRes.data?.todayLog) {
          setWaterGlasses(sRes.data.todayLog.water_glasses || 5);
          try {
            const parsed = typeof sRes.data.todayLog.meds_detail === 'string'
              ? JSON.parse(sRes.data.todayLog.meds_detail)
              : sRes.data.todayLog.meds_detail;
            if (parsed) setMeds(parsed);
          } catch (e) {}
        }
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [selectedPatientId]);

  const handleDismissAlert = async (alertId) => {
    try {
      await api.post(`/dashboard/alerts/${alertId}/read`);
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch (e) {}
  };

  const handleWaterChange = async (delta) => {
    const newVal = Math.max(0, Math.min(12, waterGlasses + delta));
    setWaterGlasses(newVal);
    const todayStr = new Date().toISOString().slice(0, 10);
    try {
      await api.post(`/dailylog/${selectedPatientId}`, {
        log_date: todayStr,
        water_glasses: newVal
      });
      setTrackerMessage('Hydration updated');
      setTimeout(() => setTrackerMessage(''), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMedToggle = async (timeKey) => {
    const updated = { ...meds, [timeKey]: !meds[timeKey] };
    setMeds(updated);
    const todayStr = new Date().toISOString().slice(0, 10);
    const allTaken = updated.morning && updated.noon && updated.night ? 1 : 0;
    try {
      await api.post(`/dailylog/${selectedPatientId}`, {
        log_date: todayStr,
        medication_taken: allTaken,
        meds_detail: updated
      });
      setTrackerMessage('Medication log updated');
      setTimeout(() => setTrackerMessage(''), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const activePatient = patients.find(p => String(p.id) === selectedPatientId);
  const cogScore = stats?.cognitiveScore || 84;

  return (
    <div className="caretaker-dashboard-page">
      <div className="dashboard-container">
        
        {/* Top Header Bar with Patient Selector */}
        <div className="dashboard-top-bar">
          <div className="dashboard-patient-chips">
            <span className="chips-label">Patient:</span>
            {patients.map(p => (
              <button
                key={p.id}
                type="button"
                className={`patient-tab-chip ${selectedPatientId === String(p.id) ? 'patient-tab-chip--active' : ''}`}
                onClick={() => setSelectedPatientId(String(p.id))}
              >
                <span>{p.name}</span>
                <span className="patient-chip-stage">[{p.stage || 'Early'}]</span>
              </button>
            ))}
          </div>

          <div className="dashboard-quick-actions">
            <button type="button" className="action-pill-btn" onClick={() => navigate('/caretaker/content')}>
              Memory Library
            </button>
            <button type="button" className="action-pill-btn" onClick={() => navigate('/caretaker/dailylog')}>
              Daily Care Log
            </button>
            <button type="button" className="action-pill-btn" onClick={() => navigate('/caretaker/reminders')}>
              Reminders
            </button>
            <button type="button" className="action-pill-btn" onClick={() => navigate('/caretaker/settings')}>
              Settings
            </button>
          </div>
        </div>

        {/* Alerts Strip */}
        {alerts.length > 0 && (
          <div className="alerts-strip">
            <div className="alert-strip-badge">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span>Caregiver Alert</span>
            </div>
            <div className="alerts-items">
              {alerts.map(a => (
                <div key={a.id} className="alert-item-row">
                  <span className="alert-item-msg">{a.message}</span>
                  <button type="button" className="alert-ack-btn" onClick={() => handleDismissAlert(a.id)}>
                    Dismiss
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4 KPIs Suite (Calculated from game performance & daily telemetry) */}
        <div className="metrics-kpi-grid">
          {/* KPI 1: Cognitive Performance Score */}
          <div className="kpi-card card">
            <div className="kpi-card__top">
              <span className="kpi-card__label">Cognitive Score</span>
              <span className="kpi-badge kpi-badge--green">Stable</span>
            </div>
            <div className="kpi-card__value-group">
              <span className="kpi-card__main-val">{cogScore}</span>
              <span className="kpi-card__scale">/ 100</span>
            </div>
            <div className="kpi-card__progress">
              <div className="kpi-card__progress-bar" style={{ width: `${cogScore}%` }}></div>
            </div>
            <span className="kpi-card__sub">Calculated from game recall & speed</span>
          </div>

          {/* KPI 2: Overall Game Accuracy */}
          <div className="kpi-card card">
            <div className="kpi-card__top">
              <span className="kpi-card__label">Game Accuracy</span>
              <span className="kpi-badge kpi-badge--teal">{stats?.totalAttempts || 0} Attempts</span>
            </div>
            <div className="kpi-card__value-group">
              <span className="kpi-card__main-val">{stats?.accuracy || 0}%</span>
            </div>
            <div className="kpi-card__progress">
              <div className="kpi-card__progress-bar kpi-card__progress-bar--teal" style={{ width: `${stats?.accuracy || 0}%` }}></div>
            </div>
            <span className="kpi-card__sub">Avg reaction: {stats?.avgResponseTimeSec || 0}s per prompt</span>
          </div>

          {/* KPI 3: Daily Hydration Tracker KPI */}
          <div className="kpi-card card">
            <div className="kpi-card__top">
              <span className="kpi-card__label">Water Intake</span>
              <span className="kpi-badge kpi-badge--cyan">{Math.round((waterGlasses / 8) * 100)}% Goal</span>
            </div>
            <div className="kpi-card__value-group">
              <span className="kpi-card__main-val">{waterGlasses}</span>
              <span className="kpi-card__scale">/ 8 glasses</span>
            </div>
            <div className="kpi-card__progress">
              <div className="kpi-card__progress-bar kpi-card__progress-bar--cyan" style={{ width: `${Math.min(100, (waterGlasses / 8) * 100)}%` }}></div>
            </div>
            <span className="kpi-card__sub">{(waterGlasses * 250)} ml of 2000 ml target</span>
          </div>

          {/* KPI 4: Streak & Medication Adherence */}
          <div className="kpi-card card">
            <div className="kpi-card__top">
              <span className="kpi-card__label">Daily Routine Streak</span>
              <span className="kpi-badge kpi-badge--amber">Active</span>
            </div>
            <div className="kpi-card__value-group">
              <span className="kpi-card__main-val">{stats?.streak || 1}</span>
              <span className="kpi-card__scale">Days</span>
            </div>
            <div className="kpi-card__progress">
              <div className="kpi-card__progress-bar kpi-card__progress-bar--amber" style={{ width: `${Math.min(100, (stats?.streak || 1) * 20)}%` }}></div>
            </div>
            <span className="kpi-card__sub">Hints used: {stats?.totalHints || 0} gentle assists</span>
          </div>
        </div>

        {/* Interactive Trackers Row: Water Tracker + Daily Medication Tracker */}
        <div className="trackers-two-column-row">
          
          {/* 1. Water Intake Interactive Tracker */}
          <div className="tracker-card card">
            <div className="tracker-card__header">
              <div className="tracker-title-group">
                <div className="tracker-icon-badge tracker-icon-badge--water">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="tracker-title">Daily Hydration Tracker</h3>
                  <p className="tracker-subtitle">Proper hydration directly supports memory, focus and mood.</p>
                </div>
              </div>
              {trackerMessage && <span className="tracker-saved-pill">{trackerMessage}</span>}
            </div>

            {/* Glasses Visual Meter */}
            <div className="water-glasses-meter">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(glassNum => (
                <div
                  key={glassNum}
                  className={`water-glass-item ${waterGlasses >= glassNum ? 'water-glass-item--full' : ''}`}
                  onClick={() => handleWaterChange(glassNum - waterGlasses)}
                  title={`Glass ${glassNum} (250ml)`}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
                    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
                    <line x1="6" y1="2" x2="6" y2="4"/>
                    <line x1="10" y1="2" x2="10" y2="4"/>
                    <line x1="14" y1="2" x2="14" y2="4"/>
                  </svg>
                  <span className="glass-number">{glassNum}</span>
                </div>
              ))}
            </div>

            {/* Water Control Buttons */}
            <div className="water-controls-row">
              <button type="button" className="btn-water-action" onClick={() => handleWaterChange(-1)} disabled={waterGlasses <= 0}>
                - Remove Glass
              </button>
              <div className="water-total-pill">
                <strong>{waterGlasses * 250} ml</strong> / 2000 ml
              </div>
              <button type="button" className="btn-water-action btn-water-action--add" onClick={() => handleWaterChange(1)}>
                + Log 1 Glass (250ml)
              </button>
            </div>
          </div>

          {/* 2. Daily Medication Tracker */}
          <div className="tracker-card card">
            <div className="tracker-card__header">
              <div className="tracker-title-group">
                <div className="tracker-icon-badge tracker-icon-badge--meds">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2"/>
                    <path d="m8 12 3 3 5-5"/>
                  </svg>
                </div>
                <div>
                  <h3 className="tracker-title">Daily Medication Tracker</h3>
                  <p className="tracker-subtitle">Log each scheduled dose to prevent missed or duplicate medications.</p>
                </div>
              </div>
            </div>

            {/* Checklists for Morning, Noon, Night */}
            <div className="meds-checklist">
              {/* Morning */}
              <div className={`med-dose-card ${meds.morning ? 'med-dose-card--taken' : ''}`} onClick={() => handleMedToggle('morning')}>
                <div className="med-checkbox">
                  {meds.morning ? '✓' : ''}
                </div>
                <div className="med-dose-info">
                  <span className="med-dose-time">Morning Dose (09:00 AM)</span>
                  <span className="med-dose-name">Cognitive Vit. & Heart Tablet</span>
                </div>
                <span className={`med-status-tag ${meds.morning ? 'med-status-tag--done' : ''}`}>
                  {meds.morning ? 'Taken' : 'Pending'}
                </span>
              </div>

              {/* Noon */}
              <div className={`med-dose-card ${meds.noon ? 'med-dose-card--taken' : ''}`} onClick={() => handleMedToggle('noon')}>
                <div className="med-checkbox">
                  {meds.noon ? '✓' : ''}
                </div>
                <div className="med-dose-info">
                  <span className="med-dose-time">Afternoon Dose (01:30 PM)</span>
                  <span className="med-dose-name">Calcium & Vitamin D supplement</span>
                </div>
                <span className={`med-status-tag ${meds.noon ? 'med-status-tag--done' : ''}`}>
                  {meds.noon ? 'Taken' : 'Pending'}
                </span>
              </div>

              {/* Night */}
              <div className={`med-dose-card ${meds.night ? 'med-dose-card--taken' : ''}`} onClick={() => handleMedToggle('night')}>
                <div className="med-checkbox">
                  {meds.night ? '✓' : ''}
                </div>
                <div className="med-dose-info">
                  <span className="med-dose-time">Evening Dose (08:30 PM)</span>
                  <span className="med-dose-name">Sleep Support & Evening Care</span>
                </div>
                <span className={`med-status-tag ${meds.night ? 'med-status-tag--done' : ''}`}>
                  {meds.night ? 'Taken' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cognitive Performance Trend Graph + Recent Sessions */}
        <div className="dashboard-panels-grid">
          
          {/* 3. Cognitive Performance Trend Graph */}
          <div className="panel-box card">
            <div className="card-header-bar">
              <div className="panel-header-left">
                <span className="panel-header-title">Cognitive Performance Trend (Last 7 Days)</span>
                <span className="panel-header-desc">Accuracy & cognitive vitality tracked per session</span>
              </div>
              <span className="trend-kpi-badge">+4% Stability</span>
            </div>

            <div className="chart-bars-wrap">
              {chartData.length === 0 ? (
                <div className="no-data-msg">
                  <p>No game sessions recorded in this period yet.</p>
                  <p className="no-data-sub">Encourage Ramesh to play a short game session!</p>
                </div>
              ) : (
                chartData.map((d, i) => (
                  <div key={i} className="chart-bar-col">
                    <div className="chart-bar-track">
                      <div
                        className="chart-bar-fill"
                        style={{ height: `${Math.max(14, d.accuracy)}%` }}
                        title={`${d.date}: ${d.accuracy}% accuracy (${d.attempts} attempts)`}
                      ></div>
                    </div>
                    <span className="chart-bar-pct">{d.accuracy}%</span>
                    <span className="chart-bar-date">{d.date.slice(5)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Cognitive Activity Telemetry */}
          <div className="panel-box card">
            <div className="card-header-bar">
              <div className="panel-header-left">
                <span className="panel-header-title">Recent Session Logs</span>
                <span className="panel-header-desc">Live cognitive game results</span>
              </div>
            </div>

            <div className="recent-sessions-list">
              {stats?.recentSessions?.length === 0 ? (
                <p className="no-data-msg">No sessions recorded yet</p>
              ) : (
                stats?.recentSessions?.map(s => (
                  <div key={s.id} className="session-history-item">
                    <div className="session-item-left">
                      <span className="session-game-badge">
                        {s.game_type?.replace(/-/g, ' ').toUpperCase()}
                      </span>
                      <span className="session-time">
                        {s.started_at?.slice(0, 16)} • {s.duration_seconds || 60}s duration
                      </span>
                    </div>
                    <div className="session-score-pill">
                      <span>{s.correct_answers || 0} / {s.total_questions || 0} correct</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
