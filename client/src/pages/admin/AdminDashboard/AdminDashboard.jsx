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
        
        <div className="admin-top-bar">
          <div className="admin-tabs">
            <button
              type="button"
              className={`admin-tab ${activeTab === 'users' ? 'admin-tab--active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              USERS ({users.length})
            </button>
            <button
              type="button"
              className={`admin-tab ${activeTab === 'audit' ? 'admin-tab--active' : ''}`}
              onClick={() => setActiveTab('audit')}
            >
              AUDIT TRAIL ({auditLogs.length})
            </button>
          </div>
        </div>

        {activeTab === 'users' ? (
          <div className="admin-card card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  <th>VERIFICATION</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td><span className="badge badge--pink">{u.role.toUpperCase()}</span></td>
                    <td>
                      {u.role === 'doctor' ? (
                        <button
                          type="button"
                          className={`verify-btn ${u.is_verified ? 'verify-btn--verified' : 'verify-btn--pending'}`}
                          onClick={() => handleVerifyDoctor(u.id, u.is_verified)}
                        >
                          {u.is_verified ? 'VERIFIED' : 'PENDING'}
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
                        {u.is_active ? 'ACTIVE' : 'DISABLED'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-card card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>TIMESTAMP</th>
                  <th>USER</th>
                  <th>ACTION</th>
                  <th>DETAILS</th>
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
