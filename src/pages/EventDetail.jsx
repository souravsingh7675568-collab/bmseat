import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchMatchDetails } from '../data/mockApi';
import { Calendar, MapPin, Tag, ArrowLeft } from 'lucide-react';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchDetails(id).then(data => {
      setMatch(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <div className="container flex justify-center items-center" style={{ minHeight: '60vh' }}>
      <div style={{
        width: '50px', height: '50px', 
        border: '4px solid var(--border)',
        borderTopColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
    </div>
  );

  if (!match) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Event not found</div>;

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Event Header Banner */}
      <div style={{
        height: '400px',
        position: 'relative',
        background: `linear-gradient(rgba(15, 23, 42, 0.5), rgba(15, 23, 42, 1)), url(${match.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div className="container flex flex-col justify-end" style={{ height: '100%', paddingBottom: '3rem' }}>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6" style={{ color: 'var(--text-secondary)', width: 'fit-content' }}>
            <ArrowLeft size={20} /> Back to Events
          </button>
          
          <div style={{ display: 'inline-block', background: 'var(--primary)', padding: '0.25rem 1rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '1rem', width: 'max-content' }}>
            T20 CRICKET MATCH
          </div>
          
          <h1 className="heading-lg" style={{ marginBottom: '0.5rem' }}>
            {match.team1} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>vs</span> {match.team2}
          </h1>
        </div>
      </div>

      <div className="container mt-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Details */}
          <div style={{ gridColumn: 'span 2' }}>
            <h2 className="heading-md">About the Match</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: 1.8 }}>
              {match.description}
            </p>
            
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Match Information</h3>
              
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div style={{ background: 'rgba(138, 43, 226, 0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--primary)' }}>
                    <Calendar size={24} />
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Date & Time</div>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                      {new Date(match.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      {new Date(match.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--success)' }}>
                    <MapPin size={24} />
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Venue</div>
                    <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{match.venue}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Widget Sidebar */}
          <div>
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', position: 'sticky', top: '100px' }}>
              <div className="flex justify-between items-center mb-6" style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '1.2rem' }}>Ticket Price</span>
                <span className="heading-md" style={{ margin: 0, color: 'var(--primary)' }}>₹{match.ticketPrice}</span>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--text-secondary)' }}>
                  <Tag size={16} /> Standard Admission
                </div>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <Tag size={16} /> VIP Packages Available
                </div>
              </div>

              <Link to={`/event/${match.id}/seats`} className="btn-primary" style={{ display: 'block', width: '100%', textAlign: 'center', fontSize: '1.1rem', padding: '1rem' }}>
                Select Seats
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
