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
        minHeight: '300px',
        height: 'auto',
        position: 'relative',
        background: `linear-gradient(rgba(15, 23, 42, 0.5), rgba(15, 23, 42, 1)), url(${match.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        paddingTop: '4rem',
      }}>
        <div className="container flex flex-col justify-end" style={{ minHeight: '300px', paddingBottom: '2.5rem' }}>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6" style={{ color: 'var(--text-secondary)', width: 'fit-content', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
            <ArrowLeft size={18} /> Back
          </button>
          
          <div style={{ display: 'inline-block', background: 'var(--primary)', padding: '0.25rem 1rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.75rem', marginBottom: '0.75rem', width: 'max-content' }}>
            T20 CRICKET MATCH
          </div>
          
          <h1 className="heading-md" style={{ marginBottom: '0.5rem', fontWeight: 900 }}>
            {match.team1} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>vs</span> {match.team2}
          </h1>
        </div>
      </div>

      <div className="container mt-6 md:mt-10">
        <div className="grid grid-cols-1 lg-grid-cols-3 gap-8">
          
          {/* Main Details */}
          <div className="lg-col-span-2">
            <h2 className="heading-sm mb-4">About the Match</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2rem', lineHeight: 1.7 }}>
              {match.description}
            </p>
            
            <div className="glass-panel" style={{ padding: '1.5rem', mdPadding: '2rem', borderRadius: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1.5rem' }}>Match Information</h3>
              
              <div className="flex flex-col gap-5">
                <div className="flex items-start gap-4">
                  <div style={{ background: 'rgba(138, 43, 226, 0.1)', padding: '0.8rem', borderRadius: '12px', color: 'var(--primary)' }}>
                    <Calendar size={20} />
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Date & Time</div>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>
                      {new Date(match.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'long', day: 'numeric' })}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {new Date(match.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.8rem', borderRadius: '12px', color: 'var(--success)' }}>
                    <MapPin size={20} />
                  </div>
                  <img 
                    src={match.image} 
                    alt={match.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} 
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=800";
                    }}
                  />
                  <div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Venue</div>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{match.venue}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Widget Sidebar */}
          <div className="order-first lg-order-last">
            <div className="glass-panel" style={{ padding: '1.5rem', mdPadding: '2.5rem', borderRadius: '24px', position: 'sticky', top: '100px' }}>
              <div className="flex justify-between items-center mb-6" style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>From</span>
                <span className="heading-sm" style={{ margin: 0, color: 'var(--primary)', fontWeight: 800 }}>₹{match.ticketPrice}</span>
              </div>
              
              <div className="mb-6 flex flex-col gap-2">
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <Tag size={14} /> Standard Admission Available
                </div>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <Tag size={14} /> VIP Packages Available
                </div>
              </div>
 
              <Link to={`/event/${match.id}/seats`} className="btn-primary" style={{ display: 'block', width: '100%', textAlign: 'center', fontSize: '1.1rem', padding: '1.1rem', borderRadius: '16px' }}>
                Select Seats
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
