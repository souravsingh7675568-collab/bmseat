import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMatchDetails } from '../data/mockApi';
import { ArrowLeft, Monitor, CreditCard, Wallet, Smartphone, User, Mail, Phone, CheckCircle2, Ticket } from 'lucide-react';

const standCategories = {
  general: { name: 'General Stand', price: 599, color: '#ec4899' },
  premium: { name: 'Premium Stand', price: 999, color: '#0ea5e9' },
  pavilion: { name: 'Pavilion Stand', price: 1499, color: '#22c55e' },
  vip: { name: 'VIP Stand', price: 1999, color: '#8b5cf6' },
  corporate: { name: 'Corporate Box', price: 2199, color: '#eab308' },
  hospitality: { name: 'Hospitality Box', price: 2599, color: '#f97316' },
};

// Math Helpers for SVG Arc Generation
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeStand(x, y, innerRadius, outerRadius, startAngle, endAngle) {
  const p1 = polarToCartesian(x, y, outerRadius, endAngle);
  const p2 = polarToCartesian(x, y, outerRadius, startAngle);
  const p3 = polarToCartesian(x, y, innerRadius, startAngle);
  const p4 = polarToCartesian(x, y, innerRadius, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", p1.x, p1.y,
    "A", outerRadius, outerRadius, 0, largeArcFlag, 0, p2.x, p2.y,
    "L", p3.x, p3.y,
    "A", innerRadius, innerRadius, 0, largeArcFlag, 1, p4.x, p4.y,
    "Z"
  ].join(" ");
}

const generateSeatsForStand = (standObj, cx, cy) => {
  const seats = [];
  const radiusStep = (standObj.outerR - standObj.innerR) / standObj.rows;
  const angleStep = (standObj.endAng - standObj.startAng) / standObj.seatsPerRow;

  for (let r = 0; r < standObj.rows; r++) {
    const currentRadius = standObj.innerR + (r + 0.5) * radiusStep;
    for (let s = 0; s < standObj.seatsPerRow; s++) {
      const currentAngle = standObj.startAng + (s + 0.5) * angleStep;
      const pt = polarToCartesian(cx, cy, currentRadius, currentAngle);
      seats.push({
         id: `${standObj.prefix}${r+1}-${s+1}`, // e.g. GN1-15
         x: pt.x,
         y: pt.y,
         cat: standObj.cat,
         standName: standObj.id
      });
    }
  }
  return seats;
};

export default function SeatSelection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [checkoutStep, setCheckoutStep] = useState('none'); 
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [userDetails, setUserDetails] = useState({ name: '', email: '', mobile: '' });
  const [timeLeft, setTimeLeft] = useState(300);

  // SVG parameters
  const cx = 500, cy = 500;
  
  const stands = useMemo(() => [
    { id: 'North General', cat: 'general', prefix: 'GN', innerR: 350, outerR: 450, startAng: -35, endAng: 35, rows: 4, seatsPerRow: 25 },
    { id: 'South General', cat: 'general', prefix: 'GS', innerR: 350, outerR: 450, startAng: 145, endAng: 215, rows: 4, seatsPerRow: 25 },
    
    { id: 'North Premium', cat: 'premium', prefix: 'PN', innerR: 240, outerR: 330, startAng: -35, endAng: 35, rows: 3, seatsPerRow: 20 },
    { id: 'South Premium', cat: 'premium', prefix: 'PS', innerR: 240, outerR: 330, startAng: 145, endAng: 215, rows: 3, seatsPerRow: 20 },
    
    { id: 'East Pavilion', cat: 'pavilion', prefix: 'PVE', innerR: 320, outerR: 450, startAng: 50, endAng: 130, rows: 4, seatsPerRow: 18 },
    { id: 'West Pavilion', cat: 'pavilion', prefix: 'PVW', innerR: 320, outerR: 450, startAng: 230, endAng: 310, rows: 4, seatsPerRow: 18 },

    { id: 'East VIP', cat: 'vip', prefix: 'VE', innerR: 220, outerR: 300, startAng: 55, endAng: 125, rows: 3, seatsPerRow: 15 },
    { id: 'West VIP', cat: 'vip', prefix: 'VW', innerR: 220, outerR: 300, startAng: 235, endAng: 305, rows: 3, seatsPerRow: 15 },

    { id: 'Corporate Box', cat: 'corporate', prefix: 'CBT', innerR: 220, outerR: 300, startAng: 38, endAng: 47, rows: 3, seatsPerRow: 3 },
    { id: 'Corporate Box', cat: 'corporate', prefix: 'CBT2', innerR: 220, outerR: 300, startAng: 313, endAng: 322, rows: 3, seatsPerRow: 3 },

    { id: 'Hospitality Box', cat: 'hospitality', prefix: 'HB', innerR: 220, outerR: 300, startAng: 133, endAng: 142, rows: 3, seatsPerRow: 3 },
    { id: 'Hospitality Box', cat: 'hospitality', prefix: 'HB2', innerR: 220, outerR: 300, startAng: 218, endAng: 227, rows: 3, seatsPerRow: 3 }
  ], []);

  const allSeats = useMemo(() => {
    let seats = [];
    stands.forEach(stand => {
      seats = seats.concat(generateSeatsForStand(stand, cx, cy));
    });
    return seats;
  }, [stands]);

  useEffect(() => {
    fetchMatchDetails(id).then(data => {
      setMatch(data);
      if (data && allSeats.length > 0) {
        const randomBooked = [];
        // Block ~25% randomly to simulate a crowded arena
        const toBook = Math.floor(allSeats.length * 0.25);
        for (let i = 0; i < toBook; i++) {
          const randomIndex = Math.floor(Math.random() * allSeats.length);
          randomBooked.push(allSeats[randomIndex].id);
        }
        setBookedSeats(randomBooked);
      }
    });
  }, [id, allSeats]);

  useEffect(() => {
    let timerId;
    if (checkoutStep === 'upi-qr' && timeLeft > 0) {
      // Auto-success after 5 seconds to simulate payment detection
      if (timeLeft === 295) {
        setCheckoutStep('success');
      }
      timerId = setInterval(() => {
        setTimeLeft(prv => prv - 1);
      }, 1000);
    } else if (checkoutStep === 'upi-qr' && timeLeft === 0) {
      alert("Payment session expired! Please try booking again.");
      setCheckoutStep('none');
      setTimeLeft(300);
    }
    return () => clearInterval(timerId);
  }, [checkoutStep, timeLeft]);

  const toggleSeat = (seatId) => {
    if (bookedSeats.includes(seatId)) return;
    
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      if (selectedSeats.length < 10) {
        setSelectedSeats([...selectedSeats, seatId]);
      } else {
        alert("You can only select up to 10 tickets at a time.");
      }
    }
  };

  const basePrice = selectedSeats.reduce((total, seatId) => {
    const seatObj = allSeats.find(s => s.id === seatId);
    if (!seatObj) return total;
    return total + standCategories[seatObj.cat].price;
  }, 0);
  
  const handlingFee = selectedSeats.length > 0 ? 200 : 0;
  const gst = basePrice > 0 ? (basePrice + handlingFee) * 0.18 : 0;
  const grandTotal = basePrice + handlingFee + gst;

  const handleProceedToDetails = () => {
    if (selectedSeats.length === 0) return;
    setCheckoutStep('details');
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!userDetails.name || !userDetails.email || !userDetails.mobile) return;
    setCheckoutStep('payment');
  };

  const handlePayMethodSelection = () => {
    if (paymentMethod === 'UPI') {
      setCheckoutStep('upi-qr');
      setTimeLeft(300);
    } else if (paymentMethod === 'Card' || paymentMethod === 'Wallet') {
      setCheckoutStep('success'); // Simulate instant success for non-QR methods
    }
  };

  const handleGetTicket = () => {
    setCheckoutStep('success');
  };

  const handleFinish = () => {
    navigate('/');
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!match) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading stadium architecture...</div>;

  return (
    <div className="container" style={{ padding: '2rem 0', paddingBottom: '6rem' }}>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s', cursor: 'pointer' }}>
        <ArrowLeft size={20} /> <span style={{fontWeight: 500}}>Back to Event Details</span>
      </button>

      <div className="grid grid-cols-1 lg-grid-cols-4 gap-6 md:gap-8">
        
        {/* Step 0: Real Graphical SVG Stadium */}
        <div className="lg-col-span-3" style={{ minWidth: 0 }}>
          
          {/* Legend and Rate List Map Pill Categories UI */}
          <div className="glass-panel mb-6 md:mb-8" style={{ padding: '1.5rem', mdPadding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 className="heading-sm mb-5" style={{ fontSize: '1.25rem' }}>Select Category</h3>
            <div className="flex flex-wrap gap-3 w-full">
              {Object.entries(standCategories).map(([key, data]) => (
                <div key={key} className="category-pill flex flex-col items-center justify-center p-3" style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${data.color}50`,
                  borderRadius: '16px',
                  boxShadow: `0 4px 15px ${data.color}10`,
                  flex: '1 1 140px',
                  minWidth: '140px',
                  overflow: 'hidden'
                }}>
                  <div className="flex items-center justify-center gap-2 mb-1.5 w-full px-1">
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: data.color, boxShadow: `0 0 10px ${data.color}`, flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, color: 'white', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{data.name}</span>
                  </div>
                  <span style={{ fontWeight: 800, color: data.color, fontSize: '1.1rem', lineHeight: '1' }}>₹{data.price}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <div className="flex justify-between items-center mb-4 px-2 pt-2" style={{maxWidth: '900px', margin: '0 auto'}}>
              <h2 className="heading-md" style={{margin: 0}}>Graphical Seating View</h2>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Scroll map on mobile to view
              </div>
            </div>
            
            <div 
              className="stadium-map-container"
              style={{ 
                position: 'relative', 
                width: '100%', 
                maxWidth: '900px', 
                margin: '0 auto', 
                background: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.05) 0%, transparent 60%)', 
                border: '1px solid rgba(255,255,255,0.02)', 
                borderRadius: '24px', 
                overflowX: 'auto', 
                overflowY: 'hidden',
                WebkitOverflowScrolling: 'touch',
                padding: '1rem' 
              }}>
              
              <div style={{ minWidth: '850px', margin: '0 auto' }}>
                <svg viewBox="0 0 1000 1000" style={{ width: '100%', height: 'auto', display: 'block', touchAction: 'pan-x pan-y' }}>
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    <linearGradient id="pitchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#15803d" />
                      <stop offset="100%" stopColor="#16a34a" />
                    </linearGradient>
                  </defs>

                  <circle cx={cx} cy={cy} r="480" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="2" strokeDasharray="10 10" />
                  <circle cx={cx} cy={cy} r="490" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />

                  <circle cx={cx} cy={cy} r="180" fill="url(#pitchGrad)" stroke="rgba(255,255,255,0.4)" strokeWidth="5" />
                  <circle cx={cx} cy={cy} r="90" fill="transparent" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="5 5" />
                  <rect x={cx - 30} y={cy - 80} width="60" height="160" fill="#d6d3d1" rx="4" />
                  <line x1={cx - 30} y1={cy - 60} x2={cx + 30} y2={cy - 60} stroke="#fff" strokeWidth="2" />
                  <line x1={cx - 30} y1={cy + 60} x2={cx + 30} y2={cy + 60} stroke="#fff" strokeWidth="2" />

                  {stands.map(stand => {
                    const colorHex = standCategories[stand.cat].color;
                    return (
                      <g key={stand.id} className="stand-group">
                        <path 
                          d={describeStand(cx, cy, stand.innerR, stand.outerR, stand.startAng, stand.endAng)} 
                          fill={`${colorHex}15`} 
                          stroke={`${colorHex}50`} 
                          strokeWidth="2" 
                          className="stand-bg"
                        />
                      </g>
                    )
                  })}

                  {allSeats.map(seat => {
                    const isBooked = bookedSeats.includes(seat.id);
                    const isSelected = selectedSeats.includes(seat.id);
                    const catColor = standCategories[seat.cat].color;
                    
                    let fill = `${catColor}B3`; // 70% opacity
                    let stroke = catColor;
                    let filter = "none";
                    let r = "13"; 
                    
                    if (isSelected) {
                      fill = "var(--success)";
                      stroke = "white";
                      filter = "url(#glow)";
                      r = "18"; 
                    } else if (isBooked) {
                      fill = "#334155";
                      stroke = "rgba(255,255,255,0.1)";
                      r = "13";
                    }

                    return (
                      <circle
                        key={seat.id}
                        cx={seat.x}
                        cy={seat.y}
                        r={r}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={isSelected ? "3" : "1"}
                        filter={filter}
                        className={`svg-seat ${isBooked ? 'booked' : 'available'} ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleSeat(seat.id)}
                        style={{ cursor: isBooked ? 'not-allowed' : 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                        data-color={catColor}
                      >
                        <title>{isBooked ? 'Booked' : `${seat.standName} • Seat ${seat.id}\n₹${standCategories[seat.cat].price}`}</title>
                      </circle>
                    );
                  })}
                </svg>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 justify-center mt-6 mb-2" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <div className="flex items-center gap-2">
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--success)', border: '2px solid white', boxShadow: '0 0 8px var(--success)' }} /> Selected
              </div>
              <div className="flex items-center gap-2">
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#334155', border: '1px solid rgba(255,255,255,0.1)' }} /> Booked / Unavailable
              </div>
            </div>

          </div>
        </div>

        <div>
           {/* Booking Summary Sidebar Component */}
          <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '24px', position: 'sticky', top: 'paddingTop', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Ticket size={24} color="var(--primary)" />
              Booking Summary
            </h3>
            
            <div className="mb-5">
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Match</div>
              <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{match.team1Short} vs {match.team2Short}</div>
            </div>

            <div className="mb-6">
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Selected Seats ({selectedSeats.length})</div>
              {selectedSeats.length > 0 ? (
                <div style={{ fontWeight: 600, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selectedSeats.map(seatId => {
                    const seatObj = allSeats.find(s => s.id === seatId);
                    const catColor = seatObj ? standCategories[seatObj.cat].color : 'white';
                    return (
                      <span key={seatId} style={{ 
                        background: `${catColor}20`, // 15% opacity tint 
                        color: catColor,
                        padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.9rem', border: `1px solid ${catColor}50`
                      }}>
                        {seatId}
                      </span>
                    )
                  })}
                </div>
              ) : (
                <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', textAlign: 'center' }}>No seats clicked yet on map</div>
              )}
            </div>

            {selectedSeats.length > 0 && (
              <div style={{ fontSize: '0.95rem', marginBottom: '2rem', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex justify-between mb-3">
                  <span style={{ color: 'var(--text-secondary)' }}>Tickets</span>
                  <span style={{fontWeight: 500}}>₹{basePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span style={{ color: 'var(--text-secondary)' }}>Handling Fee</span>
                  <span style={{fontWeight: 500}}>₹{handlingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-4 pb-4" style={{ borderBottom: '1px dashed rgba(255,255,255,0.1)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>GST (18%)</span>
                  <span style={{fontWeight: 500}}>₹{gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between" style={{ fontWeight: 700, fontSize: '1.25rem' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--primary)' }}>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            )}

            <button 
              onClick={handleProceedToDetails} 
              disabled={selectedSeats.length === 0}
              className="btn-primary" 
              style={{ 
                width: '100%', 
                padding: '1.2rem', 
                fontSize: '1.1rem',
                opacity: selectedSeats.length === 0 ? 0.5 : 1, 
                cursor: selectedSeats.length === 0 ? 'not-allowed' : 'pointer' 
              }}
            >
              Proceed to Details
            </button>
          </div>
        </div>
      </div>

      {checkoutStep === 'details' && (
        <div className="overlay">
          <div className="glass-panel modal-card" style={{ maxWidth: '500px', padding: '3rem' }}>
            <h2 className="heading-md mb-2" style={{fontSize: '2rem'}}>Customer Details</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: '1.6' }}>We need this information to send you the tickets after payment.</p>
            
            <form onSubmit={handleProceedToPayment}>
              <div className="form-group mb-5">
                <label style={{ fontSize: '1rem', fontWeight: 500 }}><User size={18} /> Full Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Enter your accurate name"
                  value={userDetails.name}
                  onChange={(e) => setUserDetails({...userDetails, name: e.target.value})}
                  style={{ padding: '1rem 1.25rem', fontSize: '1rem', background: 'rgba(255,255,255,0.03)' }}
                />
              </div>
              <div className="form-group mb-5">
                <label style={{ fontSize: '1rem', fontWeight: 500 }}><Mail size={18} /> Email Address</label>
                <input 
                  type="email" 
                  required 
                  placeholder="name@example.com"
                  value={userDetails.email}
                  onChange={(e) => setUserDetails({...userDetails, email: e.target.value})}
                  style={{ padding: '1rem 1.25rem', fontSize: '1rem', background: 'rgba(255,255,255,0.03)' }}
                />
              </div>
              <div className="form-group mb-6">
                <label style={{ fontSize: '1rem', fontWeight: 500 }}><Phone size={18} /> Mobile Number</label>
                <input 
                  type="tel" 
                  required 
                  pattern="[0-9]{10}"
                  placeholder="10-digit mobile number"
                  value={userDetails.mobile}
                  onChange={(e) => setUserDetails({...userDetails, mobile: e.target.value})}
                  style={{ padding: '1rem 1.25rem', fontSize: '1rem', background: 'rgba(255,255,255,0.03)' }}
                />
              </div>
              
              <div className="flex gap-4 mt-8 pt-4" style={{borderTop: '1px solid rgba(255,255,255,0.05)'}}>
                <button type="button" onClick={() => setCheckoutStep('none')} className="btn-secondary" style={{ flex: 1, padding: '1.2rem', fontSize: '1.1rem' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 2, padding: '1.2rem', fontSize: '1.1rem' }}>Continue to Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {checkoutStep === 'payment' && (
        <div className="overlay">
          <div className="glass-panel modal-card" style={{ maxWidth: '620px', padding: '3.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            
            <div className="flex justify-between items-center mb-8 pb-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <div>
                <h2 className="heading-md" style={{ margin: 0, fontSize: '2.2rem' }}>Payment</h2>
                <div style={{color: 'var(--text-secondary)', marginTop: '0.5rem'}}>Secure Checkout</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Amount</div>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)', lineHeight: 1 }}>₹{grandTotal.toFixed(2)}</div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>Select a Payment Method</h3>
              
              <button 
                onClick={() => setPaymentMethod('UPI')}
                className="payment-option btn-secondary" 
                style={{ 
                  borderRadius: '16px', textAlign: 'left', display: 'block', width: '100%',
                  background: paymentMethod === 'UPI' ? 'rgba(138, 43, 226, 0.1)' : 'var(--surface-hover)',
                  border: paymentMethod === 'UPI' ? '2px solid var(--primary)' : '2px solid transparent',
                  padding: 0,
                  boxShadow: paymentMethod === 'UPI' ? '0 10px 40px -10px rgba(138, 43, 226, 0.5)' : 'none',
                  transform: paymentMethod === 'UPI' ? 'scale(1.02)' : 'none'
                }}
              >
                <div className="flex items-center gap-5" style={{ padding: '1.5rem' }}>
                  <div style={{ background: paymentMethod === 'UPI' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Smartphone size={28} color={paymentMethod === 'UPI' ? 'white' : 'var(--text-secondary)'} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1.3rem', color: paymentMethod === 'UPI' ? 'white' : 'var(--text-primary)' }}>UPI / QR</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>Google Pay, PhonePe, Paytm, BHIM</div>
                  </div>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid', borderColor: paymentMethod === 'UPI' ? 'var(--primary)' : 'rgba(255,255,255,0.2)', background: paymentMethod === 'UPI' ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {paymentMethod === 'UPI' && <div style={{width: '12px', height: '12px', borderRadius: '50%', background: 'white'}}></div>}
                  </div>
                </div>
              </button>

               <button 
                onClick={() => setPaymentMethod('Card')}
                className="payment-option" 
                style={{ 
                  borderRadius: '16px', textAlign: 'left', display: 'block', width: '100%',
                  background: paymentMethod === 'Card' ? 'rgba(138, 43, 226, 0.1)' : 'var(--surface-hover)',
                  border: paymentMethod === 'Card' ? '2px solid var(--primary)' : '2px solid transparent',
                  padding: 0,
                  boxShadow: paymentMethod === 'Card' ? '0 10px 40px -10px rgba(138, 43, 226, 0.5)' : 'none',
                  transform: paymentMethod === 'Card' ? 'scale(1.02)' : 'none',
                  marginBottom: '1rem'
                }}
              >
                <div className="flex items-center gap-5" style={{ padding: '1.5rem' }}>
                  <div style={{ background: paymentMethod === 'Card' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard size={28} color={paymentMethod === 'Card' ? 'white' : 'var(--text-secondary)'} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1.3rem', color: paymentMethod === 'Card' ? 'white' : 'var(--text-primary)' }}>Credit / Debit Card</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>Visa, Mastercard, RuPay</div>
                  </div>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid', borderColor: paymentMethod === 'Card' ? 'var(--primary)' : 'rgba(255,255,255,0.2)', background: paymentMethod === 'Card' ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {paymentMethod === 'Card' && <div style={{width: '12px', height: '12px', borderRadius: '50%', background: 'white'}}></div>}
                  </div>
                </div>
              </button>

              <button 
                onClick={() => setPaymentMethod('Wallet')}
                className="payment-option" 
                style={{ 
                  borderRadius: '16px', textAlign: 'left', display: 'block', width: '100%',
                  background: paymentMethod === 'Wallet' ? 'rgba(138, 43, 226, 0.1)' : 'var(--surface-hover)',
                  border: paymentMethod === 'Wallet' ? '2px solid var(--primary)' : '2px solid transparent',
                  padding: 0,
                  boxShadow: paymentMethod === 'Wallet' ? '0 10px 40px -10px rgba(138, 43, 226, 0.5)' : 'none',
                  transform: paymentMethod === 'Wallet' ? 'scale(1.02)' : 'none'
                }}
              >
                <div className="flex items-center gap-5" style={{ padding: '1.5rem' }}>
                  <div style={{ background: paymentMethod === 'Wallet' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Wallet size={28} color={paymentMethod === 'Wallet' ? 'white' : 'var(--text-secondary)'} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1.3rem', color: paymentMethod === 'Wallet' ? 'white' : 'var(--text-primary)' }}>Wallet</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>Amazon Pay, MobiKwik, Freecharge</div>
                  </div>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid', borderColor: paymentMethod === 'Wallet' ? 'var(--primary)' : 'rgba(255,255,255,0.2)', background: paymentMethod === 'Wallet' ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {paymentMethod === 'Wallet' && <div style={{width: '12px', height: '12px', borderRadius: '50%', background: 'white'}}></div>}
                  </div>
                </div>
              </button>
            </div>

              <div className="flex gap-4 mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', flexDirection: 'column' }}>
                {(paymentMethod === 'Card' || paymentMethod === 'Wallet') && (
                  <div style={{ color: 'var(--danger)', fontSize: '0.95rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '0.5rem' }}>
                    <strong>Not available right now:</strong> This payment method is undergoing maintenance. Please use UPI/QR.
                  </div>
                )}
                
                <div className="flex gap-4 w-full">
                  <button 
                    onClick={() => setCheckoutStep('details')} 
                    className="btn-secondary" 
                    style={{ flex: 1, padding: '1.25rem', fontSize: '1.15rem', borderRadius: '14px' }}
                  >
                    Back
                  </button>
                  <button 
                    onClick={handlePayMethodSelection} 
                    disabled={paymentMethod !== 'UPI'}
                    className="btn-primary" 
                    style={{ 
                      flex: 2, 
                      padding: '1.25rem', 
                      fontSize: '1.15rem', 
                      borderRadius: '14px', 
                      opacity: paymentMethod !== 'UPI' ? 0.5 : 1, 
                      cursor: paymentMethod !== 'UPI' ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.75rem',
                      fontWeight: 600
                    }}
                  >
                    Proceed to Pay ₹{grandTotal.toFixed(2)}
                  </button>
                </div>
              </div>
          </div>
        </div>
      )}

      {checkoutStep === 'upi-qr' && (
        <div className="overlay">
          <div className="glass-panel modal-card" style={{ maxWidth: '450px', textAlign: 'center', padding: '3.5rem 2.5rem' }}>
            <h2 className="heading-md mb-2" style={{ fontSize: '2rem' }}>Scan & Pay</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '2.5rem' }}>Open Google Pay, PhonePe or any UPI app to scan.</p>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', display: 'inline-block', marginBottom: '2.5rem', boxShadow: '0 15px 40px rgba(0,0,0,0.4)' }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=7985492748@okbizaxis&pn=Viagogo&cu=INR&am=${grandTotal}`} 
                alt="UPI QR Code" 
                style={{ borderRadius: '8px', display: 'block', width: '220px', height: '220px' }} 
              />
              <div style={{color: 'black', marginTop: '1.25rem', fontWeight: 700, fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                <span style={{background: '#f8f9fa', padding: '4px 12px', borderRadius: '20px', border: '1px solid #dee2e6'}}>Viagogo</span>
              </div>
              <div style={{color: '#666', fontSize: '0.9rem', marginTop: '4px'}}>7985492748@okbizaxis</div>
            </div>

            <div className="flex justify-center items-center gap-3 mb-8" style={{ color: timeLeft < 60 ? 'var(--danger)' : 'var(--primary)', fontWeight: 'bold', fontSize: '1.8rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '16px', display: 'inline-flex' }}>
              <Monitor size={28} /> {formatTime(timeLeft)}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setCheckoutStep('payment')} 
                className="btn-secondary" 
                style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', borderRadius: '14px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {checkoutStep === 'success' && (
        <div className="overlay">
          <div className="glass-panel modal-card" style={{ maxWidth: '480px', textAlign: 'center', padding: '4.5rem 3rem' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem auto', boxShadow: '0 15px 40px rgba(16, 185, 129, 0.4)' }}>
              <CheckCircle2 size={54} color="white" strokeWidth={2.5} />
            </div>
            
            <h2 className="heading-lg mb-4" style={{ fontSize: '2.4rem', color: 'white', letterSpacing: '-0.5px' }}>Booking Confirmed!</h2>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: '1.6', marginBottom: '3.5rem' }}>
              Your payment was successful and the tickets have been sent to your registered email address <strong>{userDetails.email}</strong>.
            </p>

            <button 
              onClick={handleFinish} 
              className="btn-primary" 
              style={{ width: '100%', padding: '1.25rem', fontSize: '1.2rem', borderRadius: '14px', fontWeight: 600, background: 'white', color: '#111', border: 'none', boxShadow: '0 5px 20px rgba(255,255,255,0.2)' }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <style>{`
        /* Scalable SVG Seats */
        .stadium-map-container::-webkit-scrollbar {
          height: 8px;
        }
        .stadium-map-container::-webkit-scrollbar-thumb {
          background-color: var(--primary);
          border-radius: 4px;
        }
        
        .svg-seat.available:hover {
          stroke: white !important;
          stroke-width: 3 !important;
          r: 18;
          filter: url(#glow);
        }
        
        .stand-group {
          transition: opacity 0.3s ease;
        }
        .stand-group:hover .stand-bg {
          fill: rgba(255,255,255,0.1) !important;
          stroke: rgba(255,255,255,0.5) !important;
        }

        .category-pill:hover {
           background: rgba(255,255,255,0.08) !important;
           transform: translateY(-2px);
           cursor: pointer;
        }

        .payment-option {
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease;
          padding: 0;
          overflow: hidden;
        }
        .payment-option:hover:not(:disabled) {
          transform: scale(1.02);
          background: rgba(255,255,255,0.03);
        }

        /* Modal Styles */
        .overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(10, 15, 30, 0.95);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .modal-card {
          width: 100%;
          background: var(--surface);
          max-height: 95vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .modal-card::-webkit-scrollbar {
          width: 6px;
        }
        .modal-card::-webkit-scrollbar-thumb {
          background-color: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        .form-group {
          text-align: left;
        }
        .form-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
        }
        .form-group input {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          font-family: inherit;
          transition: all 0.2s ease;
        }
        .form-group input:focus {
          outline: none;
          border-color: var(--primary);
          background: rgba(138, 43, 226, 0.05) !important;
          box-shadow: 0 0 0 4px rgba(138, 43, 226, 0.1);
        }
      `}</style>
    </div>
  );
}
