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
        <div className="label-caps">Clinical Portal</div>
        <h1 className="doctor-title">Consented Patients Under Care</h1>

        <div className="doctor-patients-grid">
          {patients.map(p => (
            <div key={p.id} className="doctor-patient-card" onClick={() => navigate(`/doctor/patient/${p.id}`)}>
              <div className="doctor-card__header">
                <h2 className="doctor-patient-name">{p.name}</h2>
                <span className="doctor-stage-badge">{p.stage?.toUpperCase() || 'EARLY'}</span>
              </div>
              <p className="doctor-patient-caretaker">Caretaker: {p.caretaker_name || 'Primary Care'}</p>
              <p className="doctor-patient-consent">Consent Granted: {p.granted_at || 'Active'}</p>
              <button type="button" className="doctor-view-btn">
                View Clinical Breakdown & Report ➔
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
