import React, { useState, useEffect } from 'react';
import api from '../../../api';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import './ContentLibrary.css';

export default function ContentLibrary() {
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState('');
  const [activeTab, setActiveTab] = useState('people');
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/patients').then(res => {
      setPatients(res.data);
      if (res.data.length > 0) setPatientId(String(res.data[0].id));
    }).catch(console.error);
  }, []);

  const loadItems = () => {
    if (!patientId) return;
    const endpoint = activeTab === 'people' ? `/content/people/${patientId}`
      : activeTab === 'places' ? `/content/places/${patientId}`
      : activeTab === 'songs' ? `/content/songs/${patientId}`
      : `/content/life-events/${patientId}`;

    api.get(endpoint).then(res => setItems(res.data)).catch(console.error);
  };

  useEffect(() => {
    loadItems();
  }, [patientId, activeTab]);

  const handleToggleHide = async (id) => {
    const entityType = activeTab === 'events' ? 'life_events' : activeTab;
    try {
      await api.patch(`/content/toggle-hide/${entityType}/${id}`);
      loadItems();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this item?')) return;
    const endpoint = `/content/${activeTab}/${id}`;
    try {
      await api.delete(endpoint);
      loadItems();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (activeTab === 'people') {
        await api.post(`/content/people/${patientId}`, {
          name, relationship, photo_url: photoUrl, notes: description
        });
      } else if (activeTab === 'places') {
        await api.post(`/content/places/${patientId}`, {
          name, description, photo_url: photoUrl
        });
      } else if (activeTab === 'songs') {
        await api.post(`/content/songs/${patientId}`, {
          title: name, artist: relationship, audio_url: photoUrl
        });
      } else {
        await api.post(`/content/life-events/${patientId}`, {
          title: name, description, year: parseInt(year) || null, photo_url: photoUrl
        });
      }
      setIsModalOpen(false);
      setName('');
      setRelationship('');
      setDescription('');
      setPhotoUrl('');
      setYear('');
      loadItems();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-library-page">
      <div className="content-lib-container">
        
        <div className="content-lib-header">
          <div>
            <div className="label-caps">Personalised Memory Base</div>
            <h1 className="content-lib-title">Content Library</h1>
          </div>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            + Add New {activeTab.slice(0, -1).toUpperCase()}
          </Button>
        </div>

        {/* Tab switcher */}
        <div className="content-lib-tabs">
          <button
            type="button"
            className={`lib-tab ${activeTab === 'people' ? 'lib-tab--active' : ''}`}
            onClick={() => setActiveTab('people')}
          >
            👥 People
          </button>
          <button
            type="button"
            className={`lib-tab ${activeTab === 'places' ? 'lib-tab--active' : ''}`}
            onClick={() => setActiveTab('places')}
          >
            🏡 Places
          </button>
          <button
            type="button"
            className={`lib-tab ${activeTab === 'songs' ? 'lib-tab--active' : ''}`}
            onClick={() => setActiveTab('songs')}
          >
            🎵 Songs
          </button>
          <button
            type="button"
            className={`lib-tab ${activeTab === 'life_events' ? 'lib-tab--active' : ''}`}
            onClick={() => setActiveTab('life_events')}
          >
            🗓️ Life Events
          </button>
        </div>

        {/* Items Table / Cards */}
        <div className="lib-items-grid">
          {items.map(item => (
            <div key={item.id} className={`lib-card ${item.is_hidden ? 'lib-card--hidden' : ''}`}>
              <div className="lib-card__img-wrap">
                <img
                  src={item.photo_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'}
                  alt={item.name || item.title}
                  className="lib-card__img"
                />
                {item.is_hidden ? (
                  <span className="lib-hidden-tag">HIDDEN FROM PATIENT</span>
                ) : null}
              </div>

              <div className="lib-card__content">
                <h3 className="lib-card__title">{item.name || item.title}</h3>
                {item.relationship && <span className="lib-card__rel">{item.relationship}</span>}
                {item.year && <span className="lib-card__year">Year: {item.year}</span>}
                <p className="lib-card__desc">{item.notes || item.description}</p>
              </div>

              <div className="lib-card__actions">
                <button
                  type="button"
                  className="lib-action-btn"
                  onClick={() => handleToggleHide(item.id)}
                  title={item.is_hidden ? 'Show to patient' : 'Hide from patient if upsetting'}
                >
                  {item.is_hidden ? '👁️ Show' : '🙈 Hide'}
                </button>
                <button
                  type="button"
                  className="lib-action-btn lib-action-btn--delete"
                  onClick={() => handleDelete(item.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Add New ${activeTab.toUpperCase()}`}
        >
          <form onSubmit={handleSave} className="lib-add-form">
            <div className="form-group">
              <label className="form-label">{activeTab === 'songs' ? 'Song Title' : 'Name / Title'}</label>
              <input
                type="text"
                required
                className="form-input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Priya Sharma or Family Wedding"
              />
            </div>

            {activeTab === 'people' && (
              <div className="form-group">
                <label className="form-label">Relationship to Patient</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={relationship}
                  onChange={e => setRelationship(e.target.value)}
                  placeholder="e.g. Daughter, Wife, Friend"
                />
              </div>
            )}

            {activeTab === 'life_events' && (
              <div className="form-group">
                <label className="form-label">Approximate Year</label>
                <input
                  type="number"
                  className="form-input"
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  placeholder="e.g. 1978"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input
                type="url"
                className="form-input"
                value={photoUrl}
                onChange={e => setPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notes / Memory Description</label>
              <textarea
                className="form-textarea"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Add special calming details..."
              ></textarea>
            </div>

            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save into Cognito'}
            </Button>
          </form>
        </Modal>

      </div>
    </div>
  );
}
