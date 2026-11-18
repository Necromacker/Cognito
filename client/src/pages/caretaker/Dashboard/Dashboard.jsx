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

  // Load patients list
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

  // Load stats and chart for selected patient
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
        
        {/* Top Header */}
        <div className="dashboard-header">
          <div>
            <div className="label-caps">Caretaker Overview</div>
            <h1 className="dashboard-title">Family & Care Companion</h1>
          </div>

          {/* Patient Selector */}
          {patients.length > 0 && (
            <div className="patient-select-wrap">
              <label className="label-caps">Active Patient:</label>
              <select
                className="dashboard-select"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Age {p.age || '—'}, {p.stage ? p.stage.toUpperCase() : 'EARLY'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Alerts Feed */}
        {alerts.length > 0 && (
          <div className="alerts-feed-card">
            <div className="alerts-feed__header">
              <span className="alerts-feed__title">⚠️ Active Caretaker Alerts ({alerts.length})</span>
            </div>
            <div className="alerts-list">
              {alerts.map(a => (
                <div key={a.id} className="alert-item">
                  <div className="alert-item__content">
                    <span className="alert-badge">{a.type.toUpperCase()}</span>
                    <span className="alert-message">{a.message}</span>
                    <span className="alert-time">{a.created_at}</span>
                  </div>
                  <button
                    type="button"
                    className="alert-ack-btn"
                    onClick={() => handleDismissAlert(a.id)}
                  >
                    Acknowledge ✓
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4 Stat Cards Styled Exactly like Reference Score/Best Grid */}
        <div className="stats-metric-grid">
          <div className="metric-card">
            <span className="metric-card__label">OVERALL ACCURACY</span>
            <div className="metric-card__value metric-card__value--gold">
              {stats?.accuracy || 0}%
            </div>
            <span className="metric-card__sub">{stats?.totalAttempts || 0} total question attempts</span>
          </div>

          <div className="metric-card">
            <span className="metric-card__label">RESPONSE TIME</span>
            <div className="metric-card__value">
              {stats?.avgResponseTimeSec || 0}s
            </div>
            <span className="metric-card__sub">Average time per gentle question</span>
          </div>

          <div className="metric-card">
            <span className="metric-card__label">DAY STREAK</span>
            <div className="metric-card__value metric-card__value--pink">
              {stats?.streak || 1} 🔥
            </div>
            <span className="metric-card__sub">Consistent engagement days</span>
          </div>

          <div className="metric-card">
            <span className="metric-card__label">HINTS USED</span>
            <div className="metric-card__value metric-card__value--green">
              {stats?.totalHints || 0}
            </div>
            <span className="metric-card__sub">Gentle memory supports given</span>
          </div>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="dashboard-quick-actions">
          <button
            type="button"
            className="quick-action-btn"
            onClick={() => navigate('/caretaker/content')}
          >
            📸 Content Library (People & Photos)
          </button>
          <button
            type="button"
            className="quick-action-btn"
            onClick={() => navigate('/caretaker/dailylog')}
          >
            📝 Log Sleep, Mood & Meds
          </button>
          <button
            type="button"
            className="quick-action-btn"
            onClick={() => navigate('/caretaker/reminders')}
          >
            ⏰ Manage Reminders
          </button>
        </div>

        {/* Trends & Recent Sessions Grid */}
        <div className="dashboard-panels-grid">
          {/* Accuracy Trend SVG Chart */}
          <div className="panel-card">
            <div className="label-caps">Cognitive Trend</div>
            <h3 className="panel-title">Accuracy Over Last 7 Days</h3>
            
            <div className="chart-bars-wrap">
              {chartData.length === 0 ? (
                <p className="no-data-msg">No session data recorded yet this week.</p>
              ) : (
                chartData.map((d, i) => (
                  <div key={i} className="chart-bar-col">
                    <div className="chart-bar-track">
                      <div
                        className="chart-bar-fill"
                        style={{ height: `${Math.max(10, d.accuracy)}%` }}
                        title={`${d.date}: ${d.accuracy}%`}
                      ></div>
                    </div>
                    <span className="chart-bar-pct">{d.accuracy}%</span>
                    <span className="chart-bar-date">{d.date.slice(5)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Game Sessions */}
          <div className="panel-card">
            <div className="label-caps">Activity History</div>
            <h3 className="panel-title">Recent Game Sessions</h3>

            <div className="recent-sessions-list">
              {stats?.recentSessions?.length === 0 ? (
                <p className="no-data-msg">No games played yet. Invite patient to play!</p>
              ) : (
                stats?.recentSessions?.map(s => (
                  <div key={s.id} className="session-history-item">
                    <div className="session-item__left">
                      <span className="session-game-badge">{s.game_type}</span>
                      <span className="session-time">{s.started_at}</span>
                    </div>
                    <div className="session-item__right">
                      <span className="session-score">
                        {s.correct_answers} / {s.total_questions} correct
                      </span>
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
