import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import SeatSelection from './pages/SeatSelection';
import './index.css';

function App() {
  return (
    <Router>
      <div className="flex flex-col" style={{ minHeight: '100vh' }}>
        <Header />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/event/:id" element={<EventDetail />} />
            <Route path="/event/:id/seats" element={<SeatSelection />} />
          </Routes>
        </main>
        
        {/* Simple Footer directly in App for brevity */}
        <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem 0', marginTop: 'auto', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div className="container">
            <p>© {new Date().getFullYear()} BookMySeat. All rights reserved.</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>This is a custom project for research purposes.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
