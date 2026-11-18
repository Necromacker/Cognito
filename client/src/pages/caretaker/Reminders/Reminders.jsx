import React, { useState, useEffect } from 'react';
import api from '../../../api';
import Button from '../../../components/Button/Button';
import './Reminders.css';

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('medication');
  const [time, setTime] = useState('09:00');

  useEffect(() => {
    api.get('/patients').then(res => {
      setPatients(res.data);
      if (res.data.length > 0) setPatientId(String(res.data[0].id));
    }).catch(console.error);
  }, []);

  const loadReminders = () => {
    if (!patientId) return;
    api.get(`/reminders/${patientId}`).then(res => setReminders(res.data)).catch(console.error);
  };

  useEffect(() => {
    loadReminders();
  }, [patientId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/reminders/${patientId}`, { type, title, time, days: 'daily' });
      setTitle('');
      loadReminders();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/reminders/${id}`);
      loadReminders();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="reminders-page">
      <div className="reminders-container">
        <h1 className="reminders-title">⏰ Reminders & Gentle Prompts</h1>

        <form onSubmit={handleAdd} className="reminder-add-card">
          <div className="form-row">
            <input
              type="text"
              required
              placeholder="e.g. Morning Heart Medicine"
              className="form-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ flex: 2 }}
            />
            <select className="form-select" value={type} onChange={e => setType(e.target.value)} style={{ flex: 1 }}>
              <option value="medication">💊 Medication</option>
              <option value="game">🎮 Gentle Game</option>
              <option value="appointment">🩺 Doctor Check-in</option>
              <option value="custom">🌸 Custom Activity</option>
            </select>
            <input
              type="time"
              required
              className="form-input"
              value={time}
              onChange={e => setTime(e.target.value)}
              style={{ width: '130px' }}
            />
            <Button type="submit" variant="primary">Add Reminder</Button>
          </div>
        </form>

        <div className="reminders-list">
          {reminders.map(r => (
            <div key={r.id} className="reminder-card">
              <span className="reminder-badge">{r.type.toUpperCase()}</span>
              <div className="reminder-info">
                <span className="reminder-title-text">{r.title}</span>
                <span className="reminder-time-text">Scheduled Daily at {r.time}</span>
              </div>
              <button type="button" className="reminder-del-btn" onClick={() => handleDelete(r.id)}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
