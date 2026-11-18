import React, { useState } from 'react';
import api from '../../../api';
import Button from '../../../components/Button/Button';
import './Settings.css';

export default function Settings() {
  const [restoreMsg, setRestoreMsg] = useState('');
  const [file, setFile] = useState(null);

  const handleDownloadBackup = () => {
    window.location.href = '/api/backup/export';
  };

  const handleRestore = async (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('backupZip', file);

    try {
      const res = await api.post('/backup/restore', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setRestoreMsg(res.data.message || 'Backup restored successfully!');
    } catch (err) {
      setRestoreMsg('Restore failed. Please check the ZIP file.');
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h1 className="settings-title">⚙️ System Settings & Data Safety</h1>

        <div className="settings-card">
          <div className="label-caps">Local Data Sovereignty (No Cloud)</div>
          <h2 className="settings-card__title">Backup & Restore</h2>
          <p className="settings-card__desc">
            All photos, voice clips, and records are stored safely on this machine at <code>./data</code>.
          </p>

          <div className="settings-backup-row">
            <Button variant="secondary" onClick={handleDownloadBackup}>
              📦 Download Full Backup ZIP
            </Button>
          </div>

          <form onSubmit={handleRestore} className="settings-restore-form">
            <div className="label-caps">Restore From Backup:</div>
            <input
              type="file"
              accept=".zip"
              className="form-input"
              onChange={e => setFile(e.target.files[0])}
            />
            <Button type="submit" variant="primary">Restore Database & Files</Button>
          </form>
          {restoreMsg && <p className="restore-msg">{restoreMsg}</p>}
        </div>

        <div className="settings-card">
          <div className="label-caps">Clinical & Safety Disclaimer</div>
          <p className="disclaimer-text">
            "This app supports cognitive engagement and tracking. It is not a diagnostic tool."
          </p>
        </div>
      </div>
    </div>
  );
}
