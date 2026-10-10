import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';

const TeacherDashboard = ({ onLogout, userEmail }) => {
  const [events, setEvents] = useState([]);
  const [allRegistrations, setAllRegistrations] = useState([]);
  const [viewingEventRoster, setViewingEventRoster] = useState(null);
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    category: 'Technology',
    event_date: '',
    deadline_date: '',
    poster_url: ''
  });

  const fetchData = useCallback(async () => {
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .order('id', { ascending: false });

    if (eventsError) console.error('Error loading events:', eventsError);
    else setEvents(eventsData || []);

    const { data: regsData, error: regsError } = await supabase
      .from('registrations')
      .select('*, events(*)');

    if (regsError) console.error('Error loading registrations:', regsError);
    else setAllRegistrations(regsData || []);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleNewEventChange = (e) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('events').insert([newEvent]);
    if (error) {
      alert('Failed to create event: ' + error.message);
    } else {
      alert('Event successfully created and published!');
      setNewEvent({ title: '', description: '', category: 'Technology', event_date: '', deadline_date: '', poster_url: '' });
      fetchData();
    }
  };

  const exportEventCSV = (eventItem) => {
    const filteredRegs = allRegistrations.filter(r => r.event_id.toString() === eventItem.id.toString());
    if (filteredRegs.length === 0) {
      alert('No student registrations to export for this event yet.');
      return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,Student Name,Email,Phone,Registration Date\n";
    filteredRegs.forEach(r => {
      csvContent += `"${r.student_name}","${r.student_email}","${r.student_phone}","${r.created_at || 'N/A'}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${eventItem.title.replace(/\s+/g, '_')}_roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&auto=format&fit=crop&q=60';
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        .td-wrapper {
          margin: 0;
          font-family: 'Poppins', sans-serif;
          background-color: #f8fafc;
          min-height: 100vh;
          color: #0f172a;
        }

        .td-navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 4rem;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
        }

        .td-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 700;
          font-size: 1.25rem;
          color: #0f172a;
        }

        .td-logo-icon {
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

        .td-logout-btn {
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

        .td-logout-btn:hover {
          background: #1e293b;
        }

        .td-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }

        .td-section-title {
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

        .admin-badge {
          background: #1e293b;
          color: #38bdf8;
          font-size: 0.75rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-weight: 600;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: #2563eb;
          margin-top: 0.5rem;
        }

        .carousel-container {
          position: relative;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
          margin-bottom: 1.5rem;
          padding: 2rem;
          display: flex;
          align-items: center;
        }

        .td-event-poster-img {
          width: 280px;
          height: 180px;
          object-fit: cover;
          border-radius: 16px;
          margin-right: 2.5rem;
          background: #e2e8f0;
          flex-shrink: 0;
        }

        .td-event-content {
          flex: 1;
        }

        .td-event-tag {
          font-size: 0.75rem;
          font-weight: 600;
          color: #2563eb;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
          letter-spacing: 0.05em;
        }

        .td-event-heading {
          font-size: 1.75rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.5rem 0;
        }

        .td-event-desc {
          font-size: 0.875rem;
          line-height: 1.5;
          color: #64748b;
          margin-bottom: 1rem;
        }

        .td-event-meta {
          font-size: 0.8rem;
          color: #475569;
          background: #f1f5f9;
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          display: inline-block;
          margin-bottom: 1rem;
        }

        .td-action-btn {
          display: inline-block;
          padding: 0.6rem 1.25rem;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .td-action-btn:hover {
          background: #1d4ed8;
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
          max-width: 650px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 1rem;
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

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          margin-top: 1rem;
        }

        .admin-table th, .admin-table td {
          padding: 0.85rem 1rem;
          text-align: left;
          font-size: 0.85rem;
        }

        .admin-table th {
          background: #f1f5f9;
          color: #0f172a;
          font-weight: 600;
        }

        .admin-table tr:not(:last-child) td {
          border-bottom: 1px solid #e2e8f0;
        }

        @media (max-width: 900px) {
          .carousel-container {
            flex-direction: column;
            align-items: flex-start;
          }
          .td-event-poster-img {
            width: 100%;
            height: 180px;
            margin-right: 0;
            margin-bottom: 1.25rem;
          }
          .td-navbar {
            padding: 1.25rem 1.5rem;
          }
        }
      `}</style>

      <div className="td-wrapper">
        <nav className="td-navbar">
          <div className="td-logo">
            <div className="td-logo-icon">E</div>
            Eventics — Faculty Portal
          </div>
          <div>
            <button onClick={onLogout} className="td-logout-btn">
              Sign Out
            </button>
          </div>
        </nav>

        <div className="td-container">
          <h2 className="td-section-title">
            Faculty Administration Dashboard
            <span className="admin-badge">{userEmail || 'Admin Mode'}</span>
          </h2>

          <div className="stats-grid">
            <div className="stat-card">
              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>Total Active Events</div>
              <div className="stat-number">{events.length}</div>
            </div>
            <div className="stat-card">
              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>Total Campus Registrations</div>
              <div className="stat-number">{allRegistrations.length}</div>
            </div>
          </div>

          {/* Publish Event Section */}
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', color: '#0f172a' }}>Publish New Campus Event</h3>
            <form onSubmit={handleCreateEvent} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <input type="text" name="title" placeholder="Event Title" required value={newEvent.title} onChange={handleNewEventChange} className="modal-input" style={{ margin: 0 }} />
              <input type="text" name="category" placeholder="Category (e.g. Sports, Cultural)" required value={newEvent.category} onChange={handleNewEventChange} className="modal-input" style={{ margin: 0 }} />
              <input type="date" name="event_date" required value={newEvent.event_date} onChange={handleNewEventChange} className="modal-input" style={{ margin: 0 }} />
              <input type="date" name="deadline_date" required value={newEvent.deadline_date} onChange={handleNewEventChange} className="modal-input" style={{ margin: 0 }} />
              <input type="url" name="poster_url" placeholder="Poster Image URL (Unsplash link)" required value={newEvent.poster_url} onChange={handleNewEventChange} className="modal-input" style={{ margin: 0, gridColumn: 'span 2' }} />
              <textarea name="description" placeholder="Event Description..." required value={newEvent.description} onChange={handleNewEventChange} className="modal-input" style={{ margin: 0, gridColumn: 'span 2', height: '80px', resize: 'vertical' }} />
              <button type="submit" className="td-action-btn" style={{ gridColumn: 'span 2', width: '100%', padding: '0.8rem' }}>Publish Event Live</button>
            </form>
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>Manage Events & Student Rosters</h3>
          
          {events.length === 0 ? (
            <p style={{ color: '#64748b' }}>No events published yet.</p>
          ) : (
            events.map((ev) => {
              const count = allRegistrations.filter(r => r.event_id.toString() === ev.id.toString()).length;
              return (
                <div key={ev.id} className="carousel-container">
                  <img src={ev.poster_url} alt="" onError={handleImageError} className="td-event-poster-img" />
                  <div className="td-event-content">
                    <div className="td-event-tag">{ev.category} — {count} Registered</div>
                    <h3 className="td-event-heading">{ev.title}</h3>
                    <p className="td-event-desc">{ev.description}</p>
                    <div className="td-event-meta">
                      Event Date: {ev.event_date} &nbsp;|&nbsp; Deadline: {ev.deadline_date}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => setViewingEventRoster(ev)}
                        className="td-action-btn"
                        style={{ background: '#0f172a' }}
                      >
                        👥 View Student Roster ({count})
                      </button>
                      <button 
                        onClick={() => exportEventCSV(ev)}
                        className="td-action-btn"
                        style={{ background: '#10b981' }}
                      >
                         Download CSV
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Faculty Event Roster Modal */}
        {viewingEventRoster && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="modal-title" style={{ margin: 0 }}>Roster: {viewingEventRoster.title}</h3>
                <button onClick={() => exportEventCSV(viewingEventRoster)} className="td-action-btn" style={{ background: '#10b981', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                  Export CSV 📥
                </button>
              </div>

              {allRegistrations.filter(r => r.event_id.toString() === viewingEventRoster.id.toString()).length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.9rem', padding: '1rem 0' }}>No students have registered for this event yet.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allRegistrations
                      .filter(r => r.event_id.toString() === viewingEventRoster.id.toString())
                      .map((reg) => (
                        <tr key={reg.id}>
                          <td style={{ fontWeight: 600 }}>{reg.student_name}</td>
                          <td>{reg.student_email}</td>
                          <td>{reg.student_phone}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}

              <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                <button type="button" onClick={() => setViewingEventRoster(null)} className="td-action-btn" style={{ background: '#64748b', width: '100px' }}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TeacherDashboard;