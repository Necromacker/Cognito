import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api';
import './PatientDetail.css';

export default function PatientDetail() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [noteSaved, setNoteSaved] = useState('');

  const [start1, setStart1] = useState(new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10));
  const [end1, setEnd1] = useState(new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10));
  const [start2, setStart2] = useState(new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10));
  const [end2, setEnd2] = useState(new Date().toISOString().slice(0, 10));
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    if (patientId) {
      api.get(`/doctor/patient/${patientId}/breakdown`)
        .then(res => setData(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [patientId]);

  const handleExportPDF = () => {
    window.location.href = `/api/doctor/patient/${patientId}/export-pdf`;
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/doctor/patient/${patientId}/notes`, { content, recommendations });
      setContent('');
      setRecommendations('');
      setNoteSaved('Clinical note recorded successfully.');
      setTimeout(() => setNoteSaved(''), 4000);
      api.get(`/doctor/patient/${patientId}/breakdown`).then(res => setData(res.data));
    } catch (e) { console.error(e); }
  };

  const handleCompare = async () => {
    try {
      const res = await api.get(`/doctor/patient/${patientId}/compare?start1=${start1}&end1=${end1}&start2=${start2}&end2=${end2}`);
      setComparison(res.data);
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="doctor-loading-state">Loading patient clinical file...</div>;

  return (
    <div className="patient-detail-page">
      <div className="detail-container">
        
        {/* Top Header */}
        <div className="detail-header">
          <div className="detail-header-left">
            <button className="doctor-back-btn" onClick={() => navigate('/doctor')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              <span>Back to Registry</span>
            </button>
            <div className="detail-patient-title-group">
              <h1 className="detail-title">{data?.patient?.name}</h1>
              <span className="doctor-stage-pill doctor-stage-pill--early">
                {data?.patient?.stage?.toUpperCase() || 'EARLY'} STAGE
              </span>
            </div>
            <p className="detail-patient-meta">
              Age: {data?.patient?.age || 74} | Language: {data?.patient?.language?.toUpperCase() || 'EN'} | Caretaker: {data?.patient?.caretaker_name || 'Family'}
            </p>
          </div>

          <button type="button" className="btn-export-pdf" onClick={handleExportPDF}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>Export Clinical PDF Report</span>
          </button>
        </div>

        {/* Diagnostic Engagement Table */}
        <div className="detail-card card">
          <div className="doctor-card-tag">Diagnostic Module Engagement</div>
          <table className="breakdown-table">
            <thead>
              <tr>
                <th>Module</th>
                <th>Sessions Played</th>
                <th>Accuracy</th>
                <th>Avg Reaction Time</th>
              </tr>
            </thead>
            <tbody>
              {data?.gameBreakdown?.map((g, i) => (
                <tr key={i}>
                  <td><strong>{g.gameType.replace(/-/g, ' ').toUpperCase()}</strong></td>
                  <td>{g.sessionCount} sessions</td>
                  <td>
                    <span className="table-acc-pill">
                      {g.accuracy}%
                    </span>
                  </td>
                  <td>{g.avgResponseTimeSec}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Date Range Comparison */}
        <div className="detail-card card">
          <div className="doctor-card-tag">Longitudinal Cognitive Trend Comparison</div>
          <div className="compare-inputs-grid">
            <div className="compare-col">
              <label className="doctor-input-label">Period 1 (Baseline)</label>
              <div className="date-inputs-row">
                <input type="date" className="doctor-date-input" value={start1} onChange={e => setStart1(e.target.value)} />
                <span className="date-sep">to</span>
                <input type="date" className="doctor-date-input" value={end1} onChange={e => setEnd1(e.target.value)} />
              </div>
            </div>
            <div className="compare-col">
              <label className="doctor-input-label">Period 2 (Evaluation)</label>
              <div className="date-inputs-row">
                <input type="date" className="doctor-date-input" value={start2} onChange={e => setStart2(e.target.value)} />
                <span className="date-sep">to</span>
                <input type="date" className="doctor-date-input" value={end2} onChange={e => setEnd2(e.target.value)} />
              </div>
            </div>
          </div>

          <button type="button" className="btn-doctor-compare" onClick={handleCompare}>
            Run Longitudinal Analysis
          </button>

          {comparison && (
            <div className="compare-results-box">
              <div className="compare-stat">
                <span className="compare-period-tag">Baseline Period</span>
                <h4 className="compare-dates-title">{comparison.range1.dates}</h4>
                <div className="compare-data-row">
                  <span>Accuracy:</span>
                  <strong className="compare-stat-acc">{comparison.range1.accuracy}%</strong>
                </div>
                <div className="compare-data-row">
                  <span>Total Sessions:</span>
                  <strong>{comparison.range1.sessions}</strong>
                </div>
                <div className="compare-data-row">
                  <span>Avg Response:</span>
                  <strong>{comparison.range1.avgResponseTimeSec}s</strong>
                </div>
              </div>

              <div className="compare-stat compare-stat--current">
                <span className="compare-period-tag compare-period-tag--eval">Evaluation Period</span>
                <h4 className="compare-dates-title">{comparison.range2.dates}</h4>
                <div className="compare-data-row">
                  <span>Accuracy:</span>
                  <strong className="compare-stat-acc compare-stat-acc--highlight">{comparison.range2.accuracy}%</strong>
                </div>
                <div className="compare-data-row">
                  <span>Total Sessions:</span>
                  <strong>{comparison.range2.sessions}</strong>
                </div>
                <div className="compare-data-row">
                  <span>Avg Response:</span>
                  <strong>{comparison.range2.avgResponseTimeSec}s</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Clinical Notes Form */}
        <div className="detail-card card">
          <div className="doctor-card-tag">Add Clinical Assessment & Recommendations</div>
          <form onSubmit={handleAddNote} className="doctor-note-form">
            <div className="doctor-form-field">
              <label className="doctor-input-label">Clinical Observations</label>
              <textarea
                required
                className="doctor-textarea"
                placeholder="Document observed cognitive recall, verbal engagement, mood and responses..."
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={3}
              ></textarea>
            </div>
            
            <div className="doctor-form-field">
              <label className="doctor-input-label">Caregiver Recommendations</label>
              <textarea
                className="doctor-textarea"
                placeholder="Recommended session length, preferred game categories, or adjustments for caregivers..."
                value={recommendations}
                onChange={e => setRecommendations(e.target.value)}
                rows={2}
              ></textarea>
            </div>

            <div className="note-submit-row">
              <button type="submit" className="btn-doctor-record">
                Record Clinical Note
              </button>
              {noteSaved && <span className="note-saved-text">✓ {noteSaved}</span>}
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
