import React, { useState, useEffect } from 'react';
import api from '../../../api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('users');

  const loadData = () => {
    api.get('/admin/users').then(res => setUsers(res.data)).catch(console.error);
    api.get('/admin/audit-logs').then(res => setAuditLogs(res.data)).catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerifyDoctor = async (id, isVerified) => {
    try {
      await api.post(`/admin/users/${id}/verify`, { isVerified: !isVerified });
      loadData();
    } catch (e) { console.error(e); }
  };

  const handleToggleActive = async (id) => {
    try {
      await api.post(`/admin/users/${id}/toggle-active`);
      loadData();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <h1 className="admin-title">🛡️ Administrator Management Portal</h1>

        <div className="admin-tabs">
          <button
            type="button"
            className={`admin-tab ${activeTab === 'users' ? 'admin-tab--active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users & Doctor Verification ({users.length})
          </button>
          <button
            type="button"
            className={`admin-tab ${activeTab === 'audit' ? 'admin-tab--active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            Audit Logs ({auditLogs.length})
          </button>
        </div>

        {activeTab === 'users' ? (
          <div className="admin-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Verification</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td><span className="role-badge">{u.role.toUpperCase()}</span></td>
                    <td>
                      {u.role === 'doctor' ? (
                        <button
                          type="button"
                          className={`verify-btn ${u.is_verified ? 'verify-btn--verified' : 'verify-btn--pending'}`}
                          onClick={() => handleVerifyDoctor(u.id, u.is_verified)}
                        >
                          {u.is_verified ? 'Verified ✓' : 'Pending Verification ✕'}
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="toggle-active-btn"
                        onClick={() => handleToggleActive(u.id)}
                      >
                        {u.is_active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(l => (
                  <tr key={l.id}>
                    <td>{l.created_at}</td>
                    <td>{l.user_name || l.user_email || 'System'}</td>
                    <td><span className="audit-action-tag">{l.action}</span></td>
                    <td>{l.details || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
