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
      setRestoreMsg(res.data.message || 'Backup restored successfully');
    } catch (err) {
      setRestoreMsg('Restore failed');
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        
        <div className="settings-card card">
          <div className="card-top-tag">LOCAL STORAGE</div>
          <h2 className="settings-card__title">DATA BACKUP & RESTORE</h2>
          <p className="settings-card__desc">
            All records, voice recordings and photos are stored on this device at <code>./data</code>.
          </p>

          <div className="settings-backup-row">
            <Button variant="secondary" onClick={handleDownloadBackup}>
              DOWNLOAD BACKUP ZIP ➔
            </Button>
          </div>

          <form onSubmit={handleRestore} className="settings-restore-form">
            <span className="form-label">Restore from file:</span>
            <input
              type="file"
              accept=".zip"
              className="form-input"
              onChange={e => setFile(e.target.files[0])}
            />
            <Button type="submit" variant="primary">RESTORE ARCHIVE</Button>
          </form>
          {restoreMsg && <p className="restore-msg">✓ {restoreMsg}</p>}
        </div>

        <div className="settings-card card">
          <div className="card-top-tag">DISCLAIMER</div>
          <p className="disclaimer-text">
            This app supports cognitive engagement and tracking. It is not a diagnostic tool.
          </p>
        </div>
      </div>
    </div>
  );
}
