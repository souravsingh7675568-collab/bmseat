import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchIplMatches } from '../data/mockApi';
import { Calendar, MapPin, Ticket } from 'lucide-react';

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIplMatches().then(data => {
      setMatches(data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '6rem 2rem',
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        background: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 1)), url("https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div className="container relative z-10" style={{ maxWidth: '800px' }}>
          <h1 className="heading-lg">
            Experience the <span className="text-gradient">Thrill of IPL 2026</span>
          </h1>
          <p className="heading-md" style={{ fontWeight: 400, color: 'var(--text-secondary)', fontSize: '1.25rem' }}>
            Book your seats now for the most electrifying cricket tournament in the world. 
            Premium seats available for all upcoming matches.
          </p>
          <a href="#events" className="btn-primary mt-8 inline-block" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>
            Book Tickets Now
          </a>
        </div>
      </section>

      {/* Events Listing */}
      <section id="events" className="container" style={{ padding: '4rem 2rem' }}>
        <h2 className="heading-md" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          Upcoming <span className="text-gradient">IPL Matches</span>
        </h2>
        
        {loading ? (
          <div className="flex justify-center items-center" style={{ minHeight: '200px' }}>
            <div style={{
              width: '50px', height: '50px', 
              border: '4px solid var(--border)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
            {matches.map(match => (
              <div key={match.id} className="glass-panel" style={{ 
                borderRadius: '16px', overflow: 'hidden', transition: 'transform 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ height: '220px', position: 'relative' }}>
                  <img src={match.image} alt="Stadium" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(transparent, rgba(15, 23, 42, 0.9))',
                    padding: '1rem',
                  }}>
                    <div className="flex justify-between items-end">
                      <div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>T20 MATCH</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.25rem 0' }}>
                          {match.team1Short} <span style={{ color: 'var(--danger)' }}>vs</span> {match.team2Short}
                        </h3>
                      </div>
                      <div style={{ background: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontWeight: 'bold' }}>
                        ₹{match.ticketPrice} onwards
                      </div>
                    </div>
                  </div>
                </div>
                
                <div style={{ padding: '1.5rem' }}>
                  <div className="flex gap-4 mb-4" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{new Date(match.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span style={{ display: 'inline-block', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {match.venue}
                      </span>
                    </div>
                  </div>
                  
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {match.description}
                  </p>
                  
                  <Link to={`/event/${match.id}`} className="btn-primary flex justify-center items-center gap-2" style={{ width: '100%', textAlign: 'center' }}>
                    <Ticket size={18} />
                    Book Tickets
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
