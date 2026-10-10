import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';

const StudentDashboard = ({ onLogout, userEmail }) => {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const [studentData, setStudentData] = useState({
    name: '',
    email: userEmail || '',
    phone: ''
  });

  const fetchEvents = useCallback(async () => {
    const { data, error } = await supabase.from('events').select('*').order('id', { ascending: false });
    if (error) console.error('Error loading events:', error);
    else setEvents(data || []);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const fetchMyRegistrations = useCallback(async (email) => {
    if (!email) return;
    const { data, error } = await supabase
      .from('registrations')
      .select('*, events(*)')
      .eq('student_email', email);

    if (error) console.error('Error fetching registrations:', error);
    else setMyRegistrations(data || []);
  }, []);

  useEffect(() => {
    if (activeTab === 'my-registrations' && userEmail) {
      fetchMyRegistrations(userEmail);
    }
  }, [activeTab, userEmail, fetchMyRegistrations]);

  const handleInputChange = (e) => {
    setStudentData({ ...studentData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from('registrations').insert([
      {
        event_id: selectedEvent.id,
        student_name: studentData.name,
        student_email: userEmail,
        student_phone: studentData.phone
      }
    ]);

    if (error) {
      alert('Registration failed or already registered with this email.');
    } else {
      alert('Successfully registered for ' + selectedEvent.title + '!');
      fetchMyRegistrations(userEmail);
      setSelectedEvent(null);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === events.length - 1 ? 0 : prevIndex + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? events.length - 1 : prevIndex - 1));
  };

  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&auto=format&fit=crop&q=60';
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        .sd-wrapper {
          margin: 0;
          font-family: 'Poppins', sans-serif;
          background-color: #f8fafc;
          min-height: 100vh;
          color: #0f172a;
        }

        .sd-navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 4rem;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
        }

        .sd-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 700;
          font-size: 1.25rem;
          color: #0f172a;
        }

        .sd-logo-icon {
          width: 32px;
          height: 32px;
          background: #0f172a;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
        }

        .sd-nav-links {
          display: flex;
          gap: 2rem;
          list-style: none;
          margin: 0;
          padding: 0;
          font-size: 0.875rem;
          font-weight: 500;
          color: #64748b;
        }

        .sd-nav-links span {
          cursor: pointer;
          transition: color 0.2s;
        }

        .sd-nav-links span.active, .sd-nav-links span:hover {
          color: #2563eb;
          font-weight: 600;
        }

        .sd-logout-btn {
          background: #0f172a;
          color: white;
          border: none;
          padding: 0.6rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .sd-logout-btn:hover {
          background: #1e293b;
        }

        .sd-hero-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }

        .sd-section-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 2rem;
          border-left: 4px solid #2563eb;
          padding-left: 0.75rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .carousel-container {
          position: relative;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
          margin-bottom: 2rem;
        }

        .carousel-slide {
          display: flex;
          align-items: center;
          padding: 3rem;
          min-height: 320px;
        }

        .sd-event-poster-img {
          width: 320px;
          height: 220px;
          object-fit: cover;
          border-radius: 16px;
          margin-right: 2.5rem;
          background: #e2e8f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          flex-shrink: 0;
        }

        .sd-event-content {
          flex: 1;
        }

        .sd-event-tag {
          font-size: 0.75rem;
          font-weight: 600;
          color: #2563eb;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
          letter-spacing: 0.05em;
        }

        .sd-event-heading {
          font-size: 2rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.75rem 0;
        }

        .sd-event-desc {
          font-size: 0.9rem;
          line-height: 1.6;
          color: #64748b;
          margin-bottom: 1.25rem;
        }

        .sd-event-meta {
          font-size: 0.8rem;
          color: #475569;
          background: #f1f5f9;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          display: inline-block;
          margin-bottom: 1.5rem;
        }

        .sd-action-btn {
          display: inline-block;
          padding: 0.75rem 2rem;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .sd-action-btn:hover {
          background: #1d4ed8;
        }

        .carousel-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(15, 23, 42, 0.7);
          color: white;
          border: none;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          transition: background 0.2s;
          z-index: 10;
        }

        .carousel-btn:hover {
          background: #0f172a;
        }

        .carousel-btn.prev {
          left: 1rem;
        }

        .carousel-btn.next {
          right: 1rem;
        }

        .carousel-dots {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          padding-bottom: 1.5rem;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #cbd5e1;
          cursor: pointer;
          transition: background 0.2s;
        }

        .dot.active {
          background: #2563eb;
          width: 24px;
          border-radius: 5px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-card {
          background: #ffffff;
          padding: 2.5rem;
          border-radius: 20px;
          width: 100%;
          max-width: 450px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 1.5rem;
        }

        .modal-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.875rem;
          outline: none;
          margin-bottom: 1rem;
          box-sizing: border-box;
          font-family: 'Poppins', sans-serif;
          background: #f8fafc;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .modal-submit {
          flex: 1;
          padding: 0.75rem;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .modal-cancel {
          flex: 1;
          padding: 0.75rem;
          background: #f1f5f9;
          color: #475569;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>

      <div className="sd-wrapper">
        <nav className="sd-navbar">
          <div className="sd-logo">
            <div className="sd-logo-icon">E</div>
            Eventics — Student Portal
          </div>
          <ul className="sd-nav-links">
            <span className={activeTab === 'events' ? 'active' : ''} onClick={() => setActiveTab('events')}>
              Events Showcase
            </span>
            <span className={activeTab === 'my-registrations' ? 'active' : ''} onClick={() => setActiveTab('my-registrations')}>
              My Registrations
            </span>
          </ul>
          <div>
            <button onClick={onLogout} className="sd-logout-btn">
              Sign Out
            </button>
          </div>
        </nav>

        <div className="sd-hero-container">
          {activeTab === 'events' ? (
            <>
              <h2 className="sd-section-title">December 2026 Campus Highlights</h2>
              
              {events.length === 0 ? (
                <p style={{ color: '#64748b' }}>Loading upcoming events...</p>
              ) : (
                <div className="carousel-container">
                  <button className="carousel-btn prev" onClick={prevSlide}>❮</button>
                  <button className="carousel-btn next" onClick={nextSlide}>❯</button>

                  <div className="carousel-slide">
                    <img 
                      src={events[currentIndex].poster_url} 
                      alt="" 
                      onError={handleImageError}
                      className="sd-event-poster-img" 
                    />
                    <div className="sd-event-content">
                      <div className="sd-event-tag">{events[currentIndex].category}</div>
                      <h3 className="sd-event-heading">{events[currentIndex].title}</h3>
                      <p className="sd-event-desc">{events[currentIndex].description}</p>
                      <div className="sd-event-meta">
                        Event Date: {events[currentIndex].event_date} &nbsp;|&nbsp; Register By: {events[currentIndex].deadline_date}
                      </div>
                      <button 
                        onClick={() => setSelectedEvent(events[currentIndex])}
                        className="sd-action-btn"
                      >
                        Register Now
                      </button>
                    </div>
                  </div>

                  <div className="carousel-dots">
                    {events.map((_, idx) => (
                      <span 
                        key={idx} 
                        className={`dot ${currentIndex === idx ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(idx)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="sd-section-title">My Registered Events ({userEmail})</h2>

              {myRegistrations.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>You have not registered for any events yet.</p>
              ) : (
                myRegistrations.map((reg) => (
                  <div className="carousel-container" key={reg.id} style={{ padding: '2rem', display: 'flex', alignItems: 'center' }}>
                    <img 
                      src={reg.events?.poster_url} 
                      alt="" 
                      onError={handleImageError}
                      className="sd-event-poster-img" 
                    />
                    <div className="sd-event-content">
                      <div className="sd-event-tag">{reg.events?.category}</div>
                      <h3 className="sd-event-heading">{reg.events?.title}</h3>
                      <p className="sd-event-desc">{reg.events?.description}</p>
                      <div className="sd-event-meta">
                        Registered As: {reg.student_name} ({reg.student_phone}) &nbsp;|&nbsp; Event Date: {reg.events?.event_date}
                      </div>
                      <div style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>
                        Status: Confirmed
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {selectedEvent && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h3 className="modal-title">Register for {selectedEvent.title}</h3>
              <form onSubmit={handleRegisterSubmit}>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#475569' }}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Enter your full name"
                  value={studentData.name}
                  onChange={handleInputChange}
                  className="modal-input"
                />

                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#475569' }}>Email Address (Logged In)</label>
                <input
                  type="email"
                  name="email"
                  disabled
                  value={userEmail}
                  className="modal-input"
                  style={{ background: '#e2e8f0', cursor: 'not-allowed' }}
                />

                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: '#475569' }}>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="Enter mobile number"
                  value={studentData.phone}
                  onChange={handleInputChange}
                  className="modal-input"
                />

                <div className="modal-actions">
                  <button type="submit" className="modal-submit">Confirm Registration</button>
                  <button type="button" onClick={() => setSelectedEvent(null)} className="modal-cancel">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StudentDashboard;