import React, { useState, useEffect } from 'react';
import api from '../../../api';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import './PatientManager.css';

export default function PatientManager() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [games, setGames] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doctorEmail, setDoctorEmail] = useState('');
  const [consentMsg, setConsentMsg] = useState('');

  // Create patient form
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [pin, setPin] = useState('1234');
  const [stage, setStage] = useState('early');
  const [likes, setLikes] = useState('');
  const [avoid, setAvoid] = useState('');

  const loadPatients = () => {
    api.get('/patients').then(res => {
      setPatients(res.data);
      if (res.data.length > 0 && !selectedPatient) {
        setSelectedPatient(res.data[0]);
      }
    }).catch(console.error);
  };

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      api.get(`/patients/${selectedPatient.id}/games`)
        .then(res => setGames(res.data))
        .catch(console.error);
    }
  }, [selectedPatient]);

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    try {
      await api.post('/patients', {
        name, age, pin, stage, likes, avoid
      });
      setIsModalOpen(false);
      setName('');
      setAge('');
      loadPatients();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleGame = async (gameType, currentStatus) => {
    const updated = games.map(g => g.game_type === gameType ? { ...g, is_enabled: currentStatus ? 0 : 1 } : g);
    setGames(updated);
    try {
      await api.put(`/patients/${selectedPatient.id}/games`, { settings: updated });
    } catch (e) {
      console.error(e);
    }
  };

  const handleGrantDoctor = async (e) => {
    e.preventDefault();
    if (!doctorEmail) return;
    try {
      await api.post('/consent/grant', {
        patientId: selectedPatient.id,
        doctorEmail
      });
      setConsentMsg('Clinical consent granted to doctor');
      setDoctorEmail('');
      setTimeout(() => setConsentMsg(''), 4000);
    } catch (err) {
      setConsentMsg(err.response?.data?.error || 'Doctor must be registered and verified');
    }
  };

  return (
    <div className="patient-manager-page">
      <div className="manager-container">
        
        {/* Clean bar without noisy headers */}
        <div className="manager-top-strip">
          <div className="patients-selector-bar">
            {patients.map(p => (
              <button
                key={p.id}
                type="button"
                className={`patient-pill-btn ${selectedPatient?.id === p.id ? 'patient-pill-btn--active' : ''}`}
                onClick={() => setSelectedPatient(p)}
              >
                {p.name} [PIN {p.pin}]
              </button>
            ))}
          </div>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            + Add Patient
          </Button>
        </div>

        {selectedPatient && (
          <div className="manager-panels-grid">
            {/* Patient Profile Card */}
            <div className="manager-card">
              <div className="card-top-tag">PROFILE</div>
              <h2 className="manager-card__title">{selectedPatient.name}</h2>
              <div className="profile-details-list">
                <div className="profile-row"><span>Age</span> <strong>{selectedPatient.age || '—'}</strong></div>
                <div className="profile-row"><span>Stage</span> <strong>{selectedPatient.stage?.toUpperCase()}</strong></div>
                <div className="profile-row"><span>PIN</span> <strong>{selectedPatient.pin}</strong></div>
                <div className="profile-row"><span>Likes</span> <span>{selectedPatient.likes || 'None added'}</span></div>
                <div className="profile-row"><span>Triggers</span> <span>{selectedPatient.avoid || 'None added'}</span></div>
              </div>

              {/* Doctor Consent Invite Section */}
              <div className="consent-invite-box">
                <div className="card-top-tag">DOCTOR ACCESS</div>
                <form onSubmit={handleGrantDoctor} className="consent-form">
                  <input
                    type="email"
                    required
                    placeholder="doctor@demo.com"
                    className="form-input"
                    value={doctorEmail}
                    onChange={e => setDoctorEmail(e.target.value)}
                  />
                  <Button type="submit" variant="secondary">Grant Access</Button>
                </form>
                {consentMsg && <p className="consent-feedback">{consentMsg}</p>}
              </div>
            </div>

            {/* Game Controls per Patient */}
            <div className="manager-card">
              <div className="card-top-tag">ACTIVE MODULES</div>
              <div className="games-settings-list">
                {games.map(g => (
                  <div key={g.id} className="game-setting-row">
                    <span className="game-setting__name">{g.game_type}</span>
                    <button
                      type="button"
                      className={`toggle-switch-btn ${g.is_enabled ? 'toggle-switch--on' : 'toggle-switch--off'}`}
                      onClick={() => handleToggleGame(g.game_type, g.is_enabled)}
                    >
                      {g.is_enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Create Patient Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Patient"
        >
          <form onSubmit={handleCreatePatient} className="patient-create-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                className="form-input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Patient Name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Age</label>
              <input
                type="number"
                className="form-input"
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="Age"
              />
            </div>
            <div className="form-group">
              <label className="form-label">4-Digit PIN</label>
              <input
                type="text"
                maxLength={4}
                required
                className="form-input"
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="1234"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Dementia Stage</label>
              <select className="form-select" value={stage} onChange={e => setStage(e.target.value)}>
                <option value="early">Early Stage</option>
                <option value="moderate">Moderate Stage</option>
                <option value="advanced">Advanced Stage</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Comforts / Memories</label>
              <textarea
                className="form-textarea"
                value={likes}
                onChange={e => setLikes(e.target.value)}
                placeholder="Gardening, songs, stories..."
              ></textarea>
            </div>
            <div className="form-group">
              <label className="form-label">Sensory Triggers</label>
              <textarea
                className="form-textarea"
                value={avoid}
                onChange={e => setAvoid(e.target.value)}
                placeholder="Loud noises, crowded rooms..."
              ></textarea>
            </div>
            <Button type="submit" variant="primary">Save Patient</Button>
          </form>
        </Modal>

      </div>
    </div>
  );
}
