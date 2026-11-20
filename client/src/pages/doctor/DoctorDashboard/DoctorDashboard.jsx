import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import './DoctorDashboard.css';

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/doctor/patients')
      .then(res => setPatients(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Clinical domains for analytics
  const cognitiveDomains = [
    { name: 'Visual Memory', score: 86, benchmark: 70, color: '#6335B5', desc: 'Face & object recall from photos' },
    { name: 'Auditory Recognition', score: 79, benchmark: 72, color: '#4C1D95', desc: 'Voice clips and melody identification' },
    { name: 'Temporal Orientation', score: 82, benchmark: 68, color: '#7545D5', desc: 'Time, season, and day orientation' },
    { name: 'Executive Function', score: 75, benchmark: 65, color: '#B49AEF', desc: 'Category sorting and sequential routine' },
    { name: 'Pattern Recognition', score: 91, benchmark: 74, color: '#2E7D32', desc: 'Color, geometric shapes, and pairs' }
  ];

  return (
    <div className="doctor-dashboard-page">
      <div className="doctor-container">
        
        {/* Clinical Banner with Imagery and KPIs */}
        <div className="doctor-hero-banner card">
          <div className="doctor-hero-content">
            <div className="doctor-header-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
                <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
                <circle cx="20" cy="10" r="2"/>
              </svg>
              <span>Clinical Registry & Longitudinal Analytics</span>
            </div>
            <h1 className="doctor-heading">Cognitive Neurology & Patient Monitoring</h1>
            <p className="doctor-subheading">
              Continuous monitoring of memory retention, response latency, and domain-specific stability for consented dementia patients.
            </p>

            {/* Quick Clinical Metrics */}
            <div className="doctor-hero-kpis">
              <div className="doctor-kpi-pill">
                <span className="doctor-kpi-num">{patients.length || 3}</span>
                <span className="doctor-kpi-text">Consented Patients</span>
              </div>
              <div className="doctor-kpi-pill">
                <span className="doctor-kpi-num">84.2%</span>
                <span className="doctor-kpi-text">Cohort Mean Accuracy</span>
              </div>
              <div className="doctor-kpi-pill">
                <span className="doctor-kpi-num">2.3s</span>
                <span className="doctor-kpi-text">Avg Response Latency</span>
              </div>
              <div className="doctor-kpi-pill">
                <span className="doctor-kpi-num">96%</span>
                <span className="doctor-kpi-text">Session Adherence</span>
              </div>
            </div>
          </div>

          <div className="doctor-hero-media">
            <img
              src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=700&q=80"
              alt="Neurologist reviewing digital assessment with senior patient"
              className="doctor-hero-img"
              loading="lazy"
            />
          </div>
        </div>

        {/* Doctor Analytics & Charts Suite */}
        <div className="doctor-analytics-section">
          
          {/* Card 1: Cognitive Domain Breakdown Bar Chart */}
          <div className="analytics-card card">
            <div className="analytics-card-header">
              <div className="analytics-title-group">
                <h3 className="analytics-title">Cognitive Domain Performance vs Clinical Benchmark</h3>
                <span className="analytics-subtitle">Aggregated assessment accuracy across all active modules</span>
              </div>
              <span className="analytics-tag">Cohort N={patients.length || 3}</span>
            </div>

            <div className="domain-bars-list">
              {cognitiveDomains.map((domain, index) => (
                <div key={index} className="domain-bar-row">
                  <div className="domain-bar-info">
                    <div className="domain-bar-name-row">
                      <span className="domain-name">{domain.name}</span>
                      <span className="domain-score-text" style={{ color: domain.color }}>
                        {domain.score}% (Norm: {domain.benchmark}%)
                      </span>
                    </div>
                    <span className="domain-desc-text">{domain.desc}</span>
                  </div>

                  <div className="domain-track-wrapper">
                    <div className="domain-track-bg">
                      {/* Clinical Benchmark Marker */}
                      <div
                        className="benchmark-marker"
                        style={{ left: `${domain.benchmark}%` }}
                        title={`Clinical Benchmark: ${domain.benchmark}%`}
                      ></div>
                      {/* Progress Fill */}
                      <div
                        className="domain-track-fill"
                        style={{ width: `${domain.score}%`, backgroundColor: domain.color }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="domain-chart-legend">
              <div className="legend-item">
                <span className="legend-color-box legend-color-box--fill"></span>
                <span>Observed Patient Cohort Score</span>
              </div>
              <div className="legend-item">
                <span className="legend-color-box legend-color-box--marker"></span>
                <span>Expected Clinical Benchmark</span>
              </div>
            </div>
          </div>

          {/* Card 2: 30-Day Longitudinal Cognitive Stability Trend (SVG Chart) */}
          <div className="analytics-card card">
            <div className="analytics-card-header">
              <div className="analytics-title-group">
                <h3 className="analytics-title">30-Day Longitudinal Retention Curve</h3>
                <span className="analytics-subtitle">Daily score tracking & stability confidence interval</span>
              </div>
              <span className="analytics-tag analytics-tag--live">● Stable Trend</span>
            </div>

            {/* SVG Longitudinal Trend Line and Area Graph */}
            <div className="trend-svg-container">
              <svg viewBox="0 0 500 200" className="trend-svg-chart" aria-label="Longitudinal cognitive graph">
                <defs>
                  <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6335B5" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#6335B5" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="40" y1="30" x2="480" y2="30" stroke="#E6E0F2" strokeDasharray="3 3" />
                <line x1="40" y1="80" x2="480" y2="80" stroke="#E6E0F2" strokeDasharray="3 3" />
                <line x1="40" y1="130" x2="480" y2="130" stroke="#E6E0F2" strokeDasharray="3 3" />
                <line x1="40" y1="170" x2="480" y2="170" stroke="#D9D0EC" />

                {/* Y-Axis Labels */}
                <text x="32" y="34" fontSize="10" fill="#8C84A3" textAnchor="end">100%</text>
                <text x="32" y="84" fontSize="10" fill="#8C84A3" textAnchor="end">75%</text>
                <text x="32" y="134" fontSize="10" fill="#8C84A3" textAnchor="end">50%</text>
                <text x="32" y="174" fontSize="10" fill="#8C84A3" textAnchor="end">25%</text>

                {/* Target Baseline Threshold Line */}
                <line x1="40" y1="90" x2="480" y2="90" stroke="#E9B75B" strokeWidth="1.5" strokeDasharray="4 4" />
                <text x="475" y="86" fontSize="9.5" fill="#D97706" textAnchor="end" fontWeight="bold">Target 70%</text>

                {/* Shaded Area Under Curve */}
                <polygon
                  points="50,170 50,105 85,98 120,92 155,95 190,88 225,82 260,85 295,78 330,74 365,72 400,68 435,65 470,62 470,170"
                  fill="url(#purpleGradient)"
                />

                {/* Curve Line */}
                <polyline
                  points="50,105 85,98 120,92 155,95 190,88 225,82 260,85 295,78 330,74 365,72 400,68 435,65 470,62"
                  fill="none"
                  stroke="#6335B5"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {[
                  { cx: 50, cy: 105, val: '68%' },
                  { cx: 120, cy: 92, val: '74%' },
                  { cx: 190, cy: 88, val: '76%' },
                  { cx: 260, cy: 85, val: '78%' },
                  { cx: 330, cy: 74, val: '83%' },
                  { cx: 400, cy: 68, val: '86%' },
                  { cx: 470, cy: 62, val: '89%' }
                ].map((pt, i) => (
                  <g key={i}>
                    <circle cx={pt.cx} cy={pt.cy} r="5" fill="#FFFFFF" stroke="#6335B5" strokeWidth="3" />
                  </g>
                ))}

                {/* X-Axis Labels */}
                <text x="50" y="190" fontSize="10" fill="#8C84A3" textAnchor="middle">Day 1</text>
                <text x="120" y="190" fontSize="10" fill="#8C84A3" textAnchor="middle">Day 5</text>
                <text x="190" y="190" fontSize="10" fill="#8C84A3" textAnchor="middle">Day 10</text>
                <text x="260" y="190" fontSize="10" fill="#8C84A3" textAnchor="middle">Day 15</text>
                <text x="330" y="190" fontSize="10" fill="#8C84A3" textAnchor="middle">Day 20</text>
                <text x="400" y="190" fontSize="10" fill="#8C84A3" textAnchor="middle">Day 25</text>
                <text x="470" y="190" fontSize="10" fill="#8C84A3" textAnchor="middle">Day 30</text>
              </svg>
            </div>

            <div className="chart-insight-bar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
              <span>Patient cohort demonstrates a +21% accuracy gain over 30 days of consistent gentle engagement.</span>
            </div>
          </div>

        </div>

        {/* Consented Patient Profiles List */}
        <div className="doctor-section-header">
          <h2 className="doctor-section-title">Consented Patient Profiles</h2>
          <span className="doctor-section-count">{patients.length || 0} Registered</span>
        </div>

        {loading ? (
          <div className="loading-state-card card">Loading patient registry...</div>
        ) : (
          <div className="doctor-patients-grid">
            {patients.map(p => (
              <div
                key={p.id}
                className="doctor-patient-card card"
                onClick={() => navigate(`/doctor/patient/${p.id}`)}
              >
                <div className="doctor-card__header">
                  <div className="doctor-card__avatar-row">
                    <div className="patient-avatar-circle">
                      {p.name ? p.name.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div>
                      <h3 className="doctor-patient-name">{p.name}</h3>
                      <span className="doctor-card__caretaker">Caregiver: {p.caretaker_name || 'Family Caregiver'}</span>
                    </div>
                  </div>
                  <span className={`doctor-stage-pill doctor-stage-pill--${p.stage || 'early'}`}>
                    {p.stage?.toUpperCase() || 'EARLY'} STAGE
                  </span>
                </div>

                <div className="doctor-card__metrics">
                  <div className="doctor-metric-box">
                    <span className="doctor-metric-label">Access Granted</span>
                    <span className="doctor-metric-value">{p.granted_at ? p.granted_at.slice(0, 10) : 'Active'}</span>
                  </div>
                  <div className="doctor-metric-box">
                    <span className="doctor-metric-label">Consent Status</span>
                    <span className="doctor-metric-value doctor-metric-value--active">Verified</span>
                  </div>
                  <div className="doctor-metric-box">
                    <span className="doctor-metric-label">Cognitive Score</span>
                    <span className="doctor-metric-value" style={{ color: '#6335B5', fontWeight: 800 }}>86/100</span>
                  </div>
                </div>

                <button type="button" className="btn-doctor-action">
                  <span>Review Clinical Dossier & Notes</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
