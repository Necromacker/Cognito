import React, { useState } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import './HelpButton.css';

export default function HelpButton() {
  const { user } = useAuth();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user || user.role !== 'patient') return null;

  const handleHelp = async () => {
    if (loading) return;
    setLoading(true);

    try {
      await api.post('/mood/help', {
        patientId: user.patientProfileId || user.id
      });
      setSent(true);
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      setSent(true);
      setTimeout(() => setSent(false), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="help-button-container">
      <button
        type="button"
        className={`help-button ${sent ? 'help-button--sent' : ''}`}
        onClick={handleHelp}
        disabled={loading}
      >
        <span className="help-button__badge">!</span>
        <span className="help-button__text">
          {sent ? 'CARETAKER ALERTED' : 'REQUEST HELP'}
        </span>
      </button>
    </div>
  );
}
