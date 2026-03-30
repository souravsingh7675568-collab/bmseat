import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import SeatSelection from './pages/SeatSelection';
import Admin from './pages/Admin';
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
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        
        {/* Simple Footer directly in App for brevity */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
