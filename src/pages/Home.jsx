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
        <div className="container relative z-10" style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
          <div>
            <h1 className="heading-lg" style={{ marginBottom: '1.5rem' }}>
              Experience the <span className="text-gradient">Thrill of IPL 2026</span>
            </h1>
            <p className="heading-md" style={{ fontWeight: 400, color: 'var(--text-secondary)', fontSize: '1.25rem', margin: '0 auto', maxWidth: '650px' }}>
              Book your seats now for the most electrifying cricket tournament in the world. 
              Premium seats available for all upcoming matches.
            </p>
          </div>
          <a href="#events" className="btn-primary inline-block" style={{ fontSize: '1.2rem', padding: '1.1rem 2.5rem', borderRadius: '14px', boxShadow: '0 10px 30px rgba(138, 43, 226, 0.3)' }}>
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
          <div className="grid-responsive mb-12">
            {matches.map(match => (
              <Link key={match.id} to={`/event/${match.id}`} className="glass-panel group overflow-hidden block" 
                   style={{ transition: 'all 0.3s ease', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                  <img 
                    src={match.image} 
                    alt={match.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    className="group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=800";
                    }}
                  />
                  <div 
                    style={{ 
                      position: 'absolute', 
                      top: '1rem', 
                      right: '1rem', 
                      background: 'rgba(138, 43, 226, 0.9)', 
                      padding: '0.4rem 0.8rem', 
                      borderRadius: '8px', 
                      fontSize: '0.8rem', 
                      fontWeight: 700 
                    }}
                  >
                    LIVE
                  </div>
                </div>
                
                <div style={{ padding: '1.5rem' }}>
                  <div className="flex justify-between items-center mb-3">
                    <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.85rem' }}>{match.venue}</span>
                    <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      <Calendar size={14} />
                      <span>{new Date(match.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                  
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', lineHeight: 1.3, height: '3.3rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {match.name}
                  </h3>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    paddingTop: '1.2rem', 
                    borderTop: '1px solid rgba(255,255,255,0.05)' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                      <Ticket size={18} color="var(--primary)" />
                      <span style={{ fontSize: '0.9rem' }}>From ₹600</span>
                    </div>
                    <span className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>Book Now</span>
                  </div>
                </div>
              </Link>
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
