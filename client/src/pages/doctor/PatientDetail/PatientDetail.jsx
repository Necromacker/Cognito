import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api';
import Button from '../../../components/Button/Button';
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
      setNoteSaved('Note saved');
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

  if (loading) return <div className="loading-pad">Loading patient file...</div>;

  return (
    <div className="patient-detail-page">
      <div className="detail-container">
        
        <div className="detail-header">
          <div>
            <button className="back-link" onClick={() => navigate('/doctor')}>
              BACK TO LIST
            </button>
            <h1 className="detail-title">{data?.patient?.name}</h1>
          </div>
          <Button variant="secondary" onClick={handleExportPDF}>
            EXPORT PDF REPORT
          </Button>
        </div>

        {/* Game Breakdown Table */}
        <div className="detail-card card">
          <div className="card-top-tag">DIAGNOSTIC ENGAGEMENT</div>
          <table className="breakdown-table">
            <thead>
              <tr>
                <th>MODULE</th>
                <th>SESSIONS</th>
                <th>ACCURACY</th>
                <th>AVG RESPONSE</th>
              </tr>
            </thead>
            <tbody>
              {data?.gameBreakdown?.map((g, i) => (
                <tr key={i}>
                  <td><strong>{g.gameType.toUpperCase()}</strong></td>
                  <td>{g.sessionCount}</td>
                  <td><span className="table-acc">{g.accuracy}%</span></td>
                  <td>{g.avgResponseTimeSec}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Date Range Comparison */}
        <div className="detail-card card">
          <div className="card-top-tag">LONGITUDINAL COMPARISON</div>
          <div className="compare-inputs-grid">
            <div className="compare-col">
              <label className="form-label">Period 1 (Baseline)</label>
              <input type="date" className="form-input" value={start1} onChange={e => setStart1(e.target.value)} />
              <input type="date" className="form-input" value={end1} onChange={e => setEnd1(e.target.value)} />
            </div>
            <div className="compare-col">
              <label className="form-label">Period 2 (Evaluation)</label>
              <input type="date" className="form-input" value={start2} onChange={e => setStart2(e.target.value)} />
              <input type="date" className="form-input" value={end2} onChange={e => setEnd2(e.target.value)} />
            </div>
          </div>
          <Button variant="primary" onClick={handleCompare} style={{ marginTop: '10px' }}>
            RUN COMPARISON
          </Button>

          {comparison && (
            <div className="compare-results-box">
              <div className="compare-stat">
                <h3>{comparison.range1.dates}</h3>
                <p>Accuracy: <strong>{comparison.range1.accuracy}%</strong></p>
                <p>Sessions: {comparison.range1.sessions}</p>
                <p>Response: {comparison.range1.avgResponseTimeSec}s</p>
              </div>
              <div className="compare-stat compare-stat--current">
                <h3>{comparison.range2.dates}</h3>
                <p>Accuracy: <strong>{comparison.range2.accuracy}%</strong></p>
                <p>Sessions: {comparison.range2.sessions}</p>
                <p>Response: {comparison.range2.avgResponseTimeSec}s</p>
              </div>
            </div>
          )}
        </div>

        {/* Clinical Note Form */}
        <div className="detail-card card">
          <div className="card-top-tag">CLINICAL OBSERVATION</div>
          <form onSubmit={handleAddNote} className="doctor-note-form">
            <textarea
              required
              className="form-textarea"
              placeholder="Clinical observation..."
              value={content}
              onChange={e => setContent(e.target.value)}
            ></textarea>
            <textarea
              className="form-textarea"
              placeholder="Recommended adjustments..."
              value={recommendations}
              onChange={e => setRecommendations(e.target.value)}
            ></textarea>
            <Button type="submit" variant="primary">RECORD NOTE</Button>
            {noteSaved && <span className="note-saved-text">✓ {noteSaved}</span>}
          </form>
        </div>
      </div>
    </div>
  );
}
