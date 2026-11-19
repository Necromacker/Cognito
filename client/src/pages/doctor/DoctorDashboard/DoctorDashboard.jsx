import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import './DoctorDashboard.css';

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/doctor/patients')
      .then(res => setPatients(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="doctor-dashboard-page">
      <div className="doctor-container">
        
        {/* Header Header */}
        <div className="doctor-top-bar">
          <div className="doctor-header-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
              <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
              <circle cx="20" cy="10" r="2"/>
            </svg>
            <span>Clinical Registry</span>
          </div>
          <h1 className="doctor-heading">Consented Patient Profiles</h1>
          <p className="doctor-subheading">
            Review cognitive progression, game-level response accuracy, and longitudinal clinical evaluations.
          </p>
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
                  <div>
                    <h2 className="doctor-patient-name">{p.name}</h2>
                    <span className="doctor-card__caretaker">Caregiver: {p.caretaker_name || 'Family Caretaker'}</span>
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
                </div>

                <button type="button" className="btn-doctor-action">
                  <span>Review Cognitive Data</span>
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
