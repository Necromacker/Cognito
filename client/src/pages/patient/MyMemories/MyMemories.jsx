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

  const [activeTab, setActiveTab] = useState('people');
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
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [patientId]);

  return (
    <div className="memories-page">
      <div className="memories-container">
        
        {/* Top bar */}
        <div className="memories-top-strip">
          <div className="memories-tabs">
            <button
              type="button"
              className={`mem-tab ${activeTab === 'people' ? 'mem-tab--active' : ''}`}
              onClick={() => setActiveTab('people')}
            >
              {t('mem_tab_people')} ({people.length})
            </button>
            <button
              type="button"
              className={`mem-tab ${activeTab === 'places' ? 'mem-tab--active' : ''}`}
              onClick={() => setActiveTab('places')}
            >
              {t('mem_tab_places')} ({places.length})
            </button>
            <button
              type="button"
              className={`mem-tab ${activeTab === 'events' ? 'mem-tab--active' : ''}`}
              onClick={() => setActiveTab('events')}
            >
              {t('mem_tab_timeline')} ({events.length})
            </button>
          </div>

          <button type="button" className="mem-home-btn" onClick={() => navigate('/patient')}>
            {t('mem_btn_home')}
          </button>
        </div>

        {loading && <div className="loading-note">{t('mem_loading')}</div>}

        {!loading && activeTab === 'people' && (
          <div className="memories-grid">
            {people.map(person => (
              <div
                key={person.id}
                className="memory-card card"
                onClick={() => setSelectedItem(person)}
              >
                <div className="memory-card__img-wrap">
                  <img src={person.photo_url} alt={person.name} className="memory-card__img" />
                  <span className="memory-pill-badge">{person.relationship}</span>
                </div>
                <div className="memory-card__body">
                  <h3 className="memory-card__name">{person.name}</h3>
                  <p className="memory-card__caption">{person.notes || person.relationship}</p>
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
                className="memory-card card"
                onClick={() => setSelectedItem(place)}
              >
                <div className="memory-card__img-wrap">
                  <img src={place.photo_url} alt={place.name} className="memory-card__img" />
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
                className="memory-card card"
                onClick={() => setSelectedItem(event)}
              >
                <div className="memory-card__img-wrap">
                  <img src={event.photo_url} alt={event.title} className="memory-card__img" />
                  {event.year && <span className="memory-pill-badge memory-pill-badge--gold">{event.year}</span>}
                </div>
                <div className="memory-card__body">
                  <h3 className="memory-card__name">{event.title}</h3>
                  <p className="memory-card__caption">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={selectedItem?.name || selectedItem?.title || 'Memory'}
        >
          {selectedItem && (
            <div className="memory-popup">
              <div className="memory-popup__img-wrap">
                <img src={selectedItem.photo_url} alt={selectedItem.name} className="memory-popup__img" />
              </div>
              <h2 className="memory-popup__title">{selectedItem.name || selectedItem.title}</h2>
              {selectedItem.relationship && <span className="badge badge--pink">{selectedItem.relationship}</span>}
              {selectedItem.year && <span className="badge badge--green">YEAR {selectedItem.year}</span>}
              <p className="memory-popup__desc">{selectedItem.notes || selectedItem.description}</p>
            </div>
          )}
        </Modal>

        <HelpButton />

      </div>
    </div>
  );
}
