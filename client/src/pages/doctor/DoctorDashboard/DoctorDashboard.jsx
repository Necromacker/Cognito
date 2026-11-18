import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import './DoctorDashboard.css';

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/doctor/patients')
      .then(res => setPatients(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="doctor-dashboard-page">
      <div className="doctor-container">
        
        <div className="doctor-top-bar">
          <div className="card-top-tag">CLINICAL CONSENT REGISTRY</div>
        </div>

        <div className="doctor-patients-grid">
          {patients.map(p => (
            <div key={p.id} className="doctor-patient-card card" onClick={() => navigate(`/doctor/patient/${p.id}`)}>
              <div className="doctor-card__header">
                <h2 className="doctor-patient-name">{p.name}</h2>
                <span className="badge badge--green">{p.stage?.toUpperCase() || 'EARLY'}</span>
              </div>
              <p className="doctor-patient-info">Caretaker: {p.caretaker_name || 'Family'}</p>
              <p className="doctor-patient-info">Granted: {p.granted_at || 'Active'}</p>
              <button type="button" className="btn btn--primary" style={{ width: '100%', marginTop: '12px' }}>
                REVIEW COGNITIVE DATA ➔
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
