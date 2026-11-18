import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

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
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [selectedPatientId]);

  const handleDismissAlert = async (alertId) => {
    try {
      await api.post(`/dashboard/alerts/${alertId}/read`);
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch (e) {}
  };

  return (
    <div className="caretaker-dashboard-page">
      <div className="dashboard-container">
        
        {/* Top Bar with Patient Pill Selector */}
        <div className="dashboard-top-bar">
          <div className="dashboard-patient-chips">
            {patients.map(p => (
              <button
                key={p.id}
                type="button"
                className={`patient-tab-chip ${selectedPatientId === String(p.id) ? 'patient-tab-chip--active' : ''}`}
                onClick={() => setSelectedPatientId(String(p.id))}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className="dashboard-quick-actions">
            <button type="button" className="action-pill-btn" onClick={() => navigate('/caretaker/content')}>
              CONTENT
            </button>
            <button type="button" className="action-pill-btn" onClick={() => navigate('/caretaker/dailylog')}>
              DAILY LOG
            </button>
            <button type="button" className="action-pill-btn" onClick={() => navigate('/caretaker/reminders')}>
              REMINDERS
            </button>
          </div>
        </div>

        {/* Alerts Feed */}
        {alerts.length > 0 && (
          <div className="alerts-strip">
            <span className="alert-strip-badge">ALERT</span>
            <div className="alerts-items">
              {alerts.map(a => (
                <div key={a.id} className="alert-item-row">
                  <span className="alert-item-msg">{a.message}</span>
                  <button type="button" className="alert-ack-btn" onClick={() => handleDismissAlert(a.id)}>
                    ACK
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4 Score Metric Cards directly matching Pixel Picnic Score Box */}
        <div className="metrics-pixel-grid">
          <div className="pixel-stat-card card">
            <span className="pixel-stat-label">ACCURACY</span>
            <div className="pixel-stat-value pixel-stat-value--pink">
              {stats?.accuracy || 0}%
            </div>
            <span className="pixel-stat-sub">{stats?.totalAttempts || 0} attempts</span>
          </div>

          <div className="pixel-stat-card card">
            <span className="pixel-stat-label">AVG RESPONSE</span>
            <div className="pixel-stat-value">
              {stats?.avgResponseTimeSec || 0}s
            </div>
            <span className="pixel-stat-sub">per question</span>
          </div>

          <div className="pixel-stat-card card">
            <span className="pixel-stat-label">STREAK</span>
            <div className="pixel-stat-value pixel-stat-value--gold">
              {stats?.streak || 1}
            </div>
            <span className="pixel-stat-sub">consecutive days</span>
          </div>

          <div className="pixel-stat-card card">
            <span className="pixel-stat-label">HINTS</span>
            <div className="pixel-stat-value pixel-stat-value--green">
              {stats?.totalHints || 0}
            </div>
            <span className="pixel-stat-sub">assists given</span>
          </div>
        </div>

        {/* Panels */}
        <div className="dashboard-panels-grid">
          {/* Trend Chart */}
          <div className="panel-box card">
            <div className="card-header-bar">
              <span className="card-header-title">7-DAY ACCURACY TREND</span>
            </div>
            <div className="chart-bars-wrap">
              {chartData.length === 0 ? (
                <p className="no-data-msg">No activity recorded this week</p>
              ) : (
                chartData.map((d, i) => (
                  <div key={i} className="chart-bar-col">
                    <div className="chart-bar-track">
                      <div
                        className="chart-bar-fill"
                        style={{ height: `${Math.max(12, d.accuracy)}%` }}
                      ></div>
                    </div>
                    <span className="chart-bar-pct">{d.accuracy}%</span>
                    <span className="chart-bar-date">{d.date.slice(5)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent History */}
          <div className="panel-box card">
            <div className="card-header-bar">
              <span className="card-header-title">RECENT SESSIONS</span>
            </div>
            <div className="recent-sessions-list">
              {stats?.recentSessions?.length === 0 ? (
                <p className="no-data-msg">No sessions yet</p>
              ) : (
                stats?.recentSessions?.map(s => (
                  <div key={s.id} className="session-history-item">
                    <div>
                      <span className="session-game-badge">{s.game_type}</span>
                      <span className="session-time">{s.started_at?.slice(0, 16)}</span>
                    </div>
                    <span className="session-score">
                      {s.correct_answers}/{s.total_questions}
                    </span>
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
