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
      setSavedMsg('Saved');
      setTimeout(() => setSavedMsg(''), 3000);
      loadPastLogs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="daily-log-page">
      <div className="daily-log-container">
        
        <div className="daily-log-layout">
          {/* Form */}
          <form className="log-form-card card" onSubmit={handleSubmit}>
            <div className="card-top-tag">NEW LOG ENTRY</div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                required
                className="form-input"
                value={logDate}
                onChange={e => setLogDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Observed Mood</label>
              <select className="form-select" value={mood} onChange={e => setMood(e.target.value)}>
                <option value="happy">Cheerful & Engaged</option>
                <option value="neutral">Calm & Neutral</option>
                <option value="sad">Low & Quiet</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Sleep (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input"
                  value={sleepHours}
                  onChange={e => setSleepHours(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Quality</label>
                <select className="form-select" value={sleepQuality} onChange={e => setSleepQuality(e.target.value)}>
                  <option value="good">Restful</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Interrupted</option>
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
                <span>Medications taken on schedule</span>
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Meals & Nutrition</label>
              <textarea
                className="form-textarea"
                value={meals}
                onChange={e => setMeals(e.target.value)}
                placeholder="Breakfast, lunch, tea..."
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Activities & Walks</label>
              <textarea
                className="form-textarea"
                value={activities}
                onChange={e => setActivities(e.target.value)}
                placeholder="Gardening, music, walk..."
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Care Notes</label>
              <textarea
                className="form-textarea"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Observations, lucid memories..."
              ></textarea>
            </div>

            <Button type="submit" variant="primary">
              Save Entry
            </Button>

            {savedMsg && <span className="log-saved-msg">✓ {savedMsg}</span>}
          </form>

          {/* Past Logs */}
          <div className="past-logs-card card">
            <div className="card-top-tag">LOG HISTORY</div>

            <div className="past-logs-list">
              {pastLogs.map(l => (
                <div key={l.id} className="past-log-entry">
                  <div className="past-log-entry__header">
                    <span className="past-log-date">{l.log_date}</span>
                    <span className="badge badge--pink">{l.mood?.toUpperCase()}</span>
                  </div>
                  <div className="past-log-stats">
                    <span>Sleep: {l.sleep_hours}h ({l.sleep_quality})</span>
                    <span>Meds: {l.medication_taken ? 'Yes' : 'No'}</span>
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
