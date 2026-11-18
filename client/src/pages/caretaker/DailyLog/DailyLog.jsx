import React, { useState, useEffect } from 'react';
import api from '../../../api';
import Button from '../../../components/Button/Button';
import './DailyLog.css';

export default function DailyLog() {
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().slice(0, 10));
  const [mood, setMood] = useState('happy');
  const [sleepHours, setSleepHours] = useState('7.5');
  const [sleepQuality, setSleepQuality] = useState('good');
  const [medicationTaken, setMedicationTaken] = useState(true);
  const [meals, setMeals] = useState('');
  const [activities, setActivities] = useState('');
  const [notes, setNotes] = useState('');
  const [pastLogs, setPastLogs] = useState([]);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    api.get('/patients').then(res => {
      setPatients(res.data);
      if (res.data.length > 0) setPatientId(String(res.data[0].id));
    }).catch(console.error);
  }, []);

  const loadPastLogs = () => {
    if (!patientId) return;
    api.get(`/dailylog/${patientId}`)
      .then(res => setPastLogs(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    loadPastLogs();
  }, [patientId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/dailylog/${patientId}`, {
        log_date: logDate,
        mood,
        sleep_hours: parseFloat(sleepHours),
        sleep_quality: sleepQuality,
        medication_taken: medicationTaken ? 1 : 0,
        meals,
        activities,
        notes
      });
      setSavedMsg('Daily log saved successfully!');
      setTimeout(() => setSavedMsg(''), 3000);
      loadPastLogs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="daily-log-page">
      <div className="daily-log-container">
        
        <div className="daily-log-header">
          <div>
            <div className="label-caps">Care Journal</div>
            <h1 className="daily-log-title">Daily Observation Log</h1>
          </div>
        </div>

        <div className="daily-log-layout">
          {/* Form */}
          <form className="log-form-card" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Log Date</label>
              <input
                type="date"
                required
                className="form-input"
                value={logDate}
                onChange={e => setLogDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Patient General Mood Today</label>
              <select className="form-select" value={mood} onChange={e => setMood(e.target.value)}>
                <option value="happy">😊 Happy & Smiling</option>
                <option value="neutral">😐 Calm / Neutral</option>
                <option value="sad">😢 Low / Sad / Withdrawn</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Hours of Sleep</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={sleepHours}
                  onChange={e => setSleepHours(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Sleep Quality</label>
                <select className="form-select" value={sleepQuality} onChange={e => setSleepQuality(e.target.value)}>
                  <option value="good">Good / Restful</option>
                  <option value="fair">Fair / Woke Up Once</option>
                  <option value="poor">Restless / Interrupted</option>
                </select>
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={medicationTaken}
                  onChange={e => setMedicationTaken(e.target.checked)}
                />
                <span>Prescribed Medications Taken on Time</span>
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Meals & Nutrition</label>
              <textarea
                className="form-textarea"
                value={meals}
                onChange={e => setMeals(e.target.value)}
                placeholder="Poha for breakfast, dal rice for lunch, had fruits..."
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Activities & Walks</label>
              <textarea
                className="form-textarea"
                value={activities}
                onChange={e => setActivities(e.target.value)}
                placeholder="Walked in garden, listened to songs, played with grandson..."
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Care Notes & Behaviour</label>
              <textarea
                className="form-textarea"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any special moments, confusion episodes, or pleasant recollections..."
              ></textarea>
            </div>

            <Button type="submit" variant="primary">
              Save Daily Entry
            </Button>

            {savedMsg && <p className="log-saved-msg">✓ {savedMsg}</p>}
          </form>

          {/* Past Logs */}
          <div className="past-logs-card">
            <div className="label-caps">Log History</div>
            <h2 className="past-logs-title">Past Entries</h2>

            <div className="past-logs-list">
              {pastLogs.map(l => (
                <div key={l.id} className="past-log-entry">
                  <div className="past-log-entry__header">
                    <span className="past-log-date">{l.log_date}</span>
                    <span className="past-log-mood">{l.mood === 'happy' ? '😊 Happy' : l.mood === 'sad' ? '😢 Low' : '😐 Calm'}</span>
                  </div>
                  <div className="past-log-stats">
                    <span>🌙 Sleep: {l.sleep_hours} hrs ({l.sleep_quality})</span>
                    <span>💊 Meds: {l.medication_taken ? 'Yes' : 'No'}</span>
                  </div>
                  {l.notes && <p className="past-log-notes">"{l.notes}"</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
