import React, { useState, useEffect } from 'react';
import api from '../../../api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [filterRole, setFilterRole] = useState('all');

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('doctor');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

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

  const handleDeleteUser = async (id, userName) => {
    if (window.confirm(`Are you sure you want to permanently remove "${userName}"?`)) {
      try {
        await api.delete(`/admin/users/${id}`);
        loadData();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to remove user');
      }
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');
    try {
      await api.post('/admin/users/create', {
        name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole
      });
      setModalSuccess(`Successfully created ${newRole}: ${newName}`);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      loadData();
      setTimeout(() => {
        setShowAddModal(false);
        setModalSuccess('');
      }, 1500);
    } catch (err) {
      setModalError(err.response?.data?.error || 'Failed to create user');
    }
  };

  const filteredUsers = filterRole === 'all'
    ? users
    : users.filter(u => u.role === filterRole);

  return (
    <div className="admin-page">
      <div className="admin-container">
        
        {/* Header Bar */}
        <div className="admin-top-bar">
          <div className="admin-header-left">
            <div className="admin-badge-pill">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              <span>Platform Administration</span>
            </div>
            <h1 className="admin-title">System & User Management</h1>
            <p className="admin-subtitle">
              Manage clinicians, caregivers, doctor approvals, and review security audit logs.
            </p>
          </div>

          <div className="admin-header-actions">
            <button
              type="button"
              className="btn-add-user"
              onClick={() => { setShowAddModal(true); setModalError(''); setModalSuccess(''); }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>Add Doctor / Caregiver</span>
            </button>
          </div>
        </div>

        {/* Tab & Filter Navigation */}
        <div className="admin-nav-row">
          <div className="admin-tabs">
            <button
              type="button"
              className={`admin-tab ${activeTab === 'users' ? 'admin-tab--active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              User Accounts ({users.length})
            </button>
            <button
              type="button"
              className={`admin-tab ${activeTab === 'audit' ? 'admin-tab--active' : ''}`}
              onClick={() => setActiveTab('audit')}
            >
              Security Audit Logs ({auditLogs.length})
            </button>
          </div>

          {activeTab === 'users' && (
            <div className="admin-filter-pills">
              <button type="button" className={`filter-pill ${filterRole === 'all' ? 'filter-pill--active' : ''}`} onClick={() => setFilterRole('all')}>
                All
              </button>
              <button type="button" className={`filter-pill ${filterRole === 'doctor' ? 'filter-pill--active' : ''}`} onClick={() => setFilterRole('doctor')}>
                Doctors
              </button>
              <button type="button" className={`filter-pill ${filterRole === 'caretaker' ? 'filter-pill--active' : ''}`} onClick={() => setFilterRole('caretaker')}>
                Caregivers
              </button>
              <button type="button" className={`filter-pill ${filterRole === 'patient' ? 'filter-pill--active' : ''}`} onClick={() => setFilterRole('patient')}>
                Patients
              </button>
            </div>
          )}
        </div>

        {/* Users Table */}
        {activeTab === 'users' ? (
          <div className="admin-card card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User / Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Clinician Verification</th>
                  <th>Access Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="admin-user-cell">
                        <strong>{u.name}</strong>
                        {u.role === 'patient' && <span className="pin-indicator">PIN: 1234</span>}
                      </div>
                    </td>
                    <td>{u.email || '—'}</td>
                    <td>
                      <span className={`role-badge role-badge--${u.role}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {u.role === 'doctor' ? (
                        <button
                          type="button"
                          className={`verify-btn ${u.is_verified ? 'verify-btn--verified' : 'verify-btn--pending'}`}
                          onClick={() => handleVerifyDoctor(u.id, u.is_verified)}
                          title="Click to toggle approval"
                        >
                          {u.is_verified ? '✓ Approved' : 'Pending Approval'}
                        </button>
                      ) : (
                        <span className="not-applicable">—</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`toggle-active-btn ${u.is_active ? 'toggle-active-btn--active' : 'toggle-active-btn--disabled'}`}
                        onClick={() => handleToggleActive(u.id)}
                      >
                        {u.is_active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-remove-user"
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        title="Remove user"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        <span>Remove</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Audit Logs Table */
          <div className="admin-card card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Operator</th>
                  <th>Action</th>
                  <th>Target / Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(l => (
                  <tr key={l.id}>
                    <td>{l.created_at}</td>
                    <td>
                      <strong>{l.user_name || l.user_email || 'System'}</strong>
                      {l.user_role && <span className="audit-role-tag"> [{l.user_role}]</span>}
                    </td>
                    <td><span className="audit-action-tag">{l.action}</span></td>
                    <td>{l.details || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal: Add Doctor / Caregiver */}
        {showAddModal && (
          <div className="admin-modal-backdrop" onClick={() => setShowAddModal(false)}>
            <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add Clinician or Caregiver</h3>
                <button type="button" className="modal-close-btn" onClick={() => setShowAddModal(false)}>✕</button>
              </div>

              {modalError && <div className="modal-alert modal-alert--error">{modalError}</div>}
              {modalSuccess && <div className="modal-alert modal-alert--success">{modalSuccess}</div>}

              <form onSubmit={handleCreateUser} className="admin-add-form">
                <div className="form-group-clean">
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Kulkarni"
                    className="input-clean"
                  />
                </div>

                <div className="form-group-clean">
                  <label>Email Address</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="doctor@hospital.org"
                    className="input-clean"
                  />
                </div>

                <div className="form-group-clean">
                  <label>Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-clean"
                  />
                </div>

                <div className="form-group-clean">
                  <label>Role</label>
                  <select
                    className="input-clean select-clean"
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                  >
                    <option value="doctor">Doctor / Clinician (Verified by Default)</option>
                    <option value="caretaker">Family Caregiver</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>

                <div className="modal-actions-row">
                  <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-create-submit">
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
