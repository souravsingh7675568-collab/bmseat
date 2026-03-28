import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 100, padding: '1rem 0' }}>
      <div className="container flex justify-between items-center">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            width: '40px', height: '40px', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 'bold', fontSize: '1.25rem'
          }}>
            B
          </div>
          <span className="heading-sm" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>
            BookMy<span className="text-gradient">Seat</span>
          </span>
        </Link>
        <nav className="flex gap-4 items-center" style={{ fontSize: '0.9rem', fontWeight: 500 }}>
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <a href="#events" className="hover:text-primary transition-colors lg-only">IPL Matches</a>
        </nav>
      </div>
    </header>
  );
}
