import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import HelpButton from '../../../components/HelpButton/HelpButton';
import Modal from '../../../components/Modal/Modal';
import api from '../../../api';
import './MyMemories.css';

export default function MyMemories() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('people'); // 'people', 'places', 'events'
  const [people, setPeople] = useState([]);
  const [places, setPlaces] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const patientId = user?.patientProfileId || user?.id;

  useEffect(() => {
    if (patientId) {
      Promise.all([
        api.get(`/content/people/${patientId}`),
        api.get(`/content/places/${patientId}`),
        api.get(`/content/life-events/${patientId}`)
      ]).then(([pRes, plRes, eRes]) => {
        setPeople(pRes.data);
        setPlaces(plRes.data);
        setEvents(eRes.data);
      }).catch(err => {
        console.error('Memories load error:', err);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [patientId]);

  return (
    <div className="memories-page">
      <div className="memories-container">
        
        {/* Navigation & Header */}
        <div className="memories-header">
          <button type="button" className="memories-back-btn" onClick={() => navigate('/patient')}>
            ⬅ {t('back_home')}
          </button>
          <h1 className="memories-title">🖼️ {t('my_memories')}</h1>
          <p className="memories-subtitle">
            Cherished family, memorable travels, and special moments in your life.
          </p>
        </div>

        {/* Tab switch */}
        <div className="memories-tabs" role="tablist">
          <button
            type="button"
            className={`memories-tab ${activeTab === 'people' ? 'memories-tab--active' : ''}`}
            onClick={() => setActiveTab('people')}
          >
            👥 Family & Loved Ones ({people.length})
          </button>
          <button
            type="button"
            className={`memories-tab ${activeTab === 'places' ? 'memories-tab--active' : ''}`}
            onClick={() => setActiveTab('places')}
          >
            🏡 Places We Love ({places.length})
          </button>
          <button
            type="button"
            className={`memories-tab ${activeTab === 'events' ? 'memories-tab--active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            🗓️ Life Timeline ({events.length})
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="memories-loading">
            <p>Bringing your memories together...</p>
          </div>
        )}

        {/* Content Grids */}
        {!loading && activeTab === 'people' && (
          <div className="memories-grid">
            {people.map(person => (
              <div
                key={person.id}
                className="memory-card"
                onClick={() => setSelectedItem({ ...person, category: 'person' })}
                role="button"
                tabIndex={0}
              >
                <div className="memory-card__img-wrap">
                  <img
                    src={person.photo_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'}
                    alt={person.name}
                    className="memory-card__img"
                  />
                  <div className="memory-card__badge">{person.relationship}</div>
                </div>
                <div className="memory-card__body">
                  <h3 className="memory-card__name">{person.name}</h3>
                  <p className="memory-card__caption">{person.notes || `Your ${person.relationship}`}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && activeTab === 'places' && (
          <div className="memories-grid">
            {places.map(place => (
              <div
                key={place.id}
                className="memory-card"
                onClick={() => setSelectedItem({ ...place, category: 'place' })}
                role="button"
                tabIndex={0}
              >
                <div className="memory-card__img-wrap">
                  <img
                    src={place.photo_url || 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80'}
                    alt={place.name}
                    className="memory-card__img"
                  />
                </div>
                <div className="memory-card__body">
                  <h3 className="memory-card__name">{place.name}</h3>
                  <p className="memory-card__caption">{place.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && activeTab === 'events' && (
          <div className="memories-grid">
            {events.map(event => (
              <div
                key={event.id}
                className="memory-card"
                onClick={() => setSelectedItem({ ...event, category: 'event' })}
                role="button"
                tabIndex={0}
              >
                <div className="memory-card__img-wrap">
                  <img
                    src={event.photo_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80'}
                    alt={event.title}
                    className="memory-card__img"
                  />
                  {event.year && <div className="memory-card__badge memory-card__badge--year">{event.year}</div>}
                </div>
                <div className="memory-card__body">
                  <h3 className="memory-card__name">{event.title}</h3>
                  <p className="memory-card__caption">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={selectedItem?.name || selectedItem?.title || 'Memory'}
          maxWidth="640px"
        >
          {selectedItem && (
            <div className="memory-detail">
              <div className="memory-detail__photo-wrap">
                <img
                  src={selectedItem.photo_url}
                  alt={selectedItem.name || selectedItem.title}
                  className="memory-detail__photo"
                />
              </div>

              <div className="memory-detail__content">
                {selectedItem.relationship && (
                  <span className="memory-detail__badge">{selectedItem.relationship}</span>
                )}
                {selectedItem.year && (
                  <span className="memory-detail__badge memory-detail__badge--gold">Year: {selectedItem.year}</span>
                )}

                <h2 className="memory-detail__title">{selectedItem.name || selectedItem.title}</h2>
                <p className="memory-detail__desc">
                  {selectedItem.notes || selectedItem.description || 'A loving memory in your life journey.'}
                </p>

                {selectedItem.voice_url && (
                  <div className="memory-voice-player">
                    <span className="memory-voice-label">🎙️ Voice Note:</span>
                    <audio controls src={selectedItem.voice_url} className="memory-audio-el">
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Always Visible Help Button */}
        <HelpButton />

      </div>
    </div>
  );
}

