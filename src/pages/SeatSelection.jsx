import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMatchDetails } from '../data/mockApi';
import { ArrowLeft, Monitor, CreditCard, Wallet, Smartphone, User, Mail, Phone, CheckCircle2, Ticket } from 'lucide-react';

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

function describeArcText(x, y, radius, startAngle, endAngle) {
    const start = polarToCartesian(x, y, radius, startAngle);
    const end = polarToCartesian(x, y, radius, endAngle);
    return [
      "M", start.x, start.y, 
      "A", radius, radius, 0, 0, 1, end.x, end.y
    ].join(" ");
}

const generateSeatsForStand = (prefix, cx, cy, innerR, outerR, startAng, endAng, rows, seatsPerRow, isVip) => {
  const seats = [];
  const radiusStep = (outerR - innerR) / rows;
  const angleStep = (endAng - startAng) / seatsPerRow;

  for (let r = 0; r < rows; r++) {
    const currentRadius = innerR + (r + 0.5) * radiusStep;
    for (let s = 0; s < seatsPerRow; s++) {
      const currentAngle = startAng + (s + 0.5) * angleStep;
      const pt = polarToCartesian(cx, cy, currentRadius, currentAngle);
      seats.push({
         id: `${prefix}${r+1}-${s+1}`, // e.g. N1-15
         x: pt.x,
         y: pt.y,
         isVip,
         stand: prefix
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

  // Generate Stadium Mathematics 
  // 1000x1000 SVG Canvas
  const cx = 500, cy = 500;
  
  const stands = useMemo(() => [
    { id: 'North', prefix: 'N', isVip: false, innerR: 240, outerR: 450, startAng: -35, endAng: 35, rows: 6, seatsPerRow: 20 },
    { id: 'South', prefix: 'S', isVip: false, innerR: 240, outerR: 450, startAng: 145, endAng: 215, rows: 6, seatsPerRow: 20 },
    { id: 'East VIP', prefix: 'E', isVip: true, innerR: 220, outerR: 350, startAng: 50, endAng: 130, rows: 4, seatsPerRow: 12 },
    { id: 'West VIP', prefix: 'W', isVip: true, innerR: 220, outerR: 350, startAng: 230, endAng: 310, rows: 4, seatsPerRow: 12 },
  ], []);

  const allSeats = useMemo(() => {
    let seats = [];
    stands.forEach(stand => {
      seats = seats.concat(generateSeatsForStand(
        stand.prefix, cx, cy, stand.innerR, stand.outerR, stand.startAng, stand.endAng, stand.rows, stand.seatsPerRow, stand.isVip
      ));
    });
    return seats;
  }, [stands]);

  useEffect(() => {
    fetchMatchDetails(id).then(data => {
      setMatch(data);
      if (data && allSeats.length > 0) {
        const randomBooked = [];
        // Randomly book ~25% of the massive stadium
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
        alert("You can only select up to 10 seats at a time.");
      }
    }
  };

  const basePrice = selectedSeats.reduce((total, seatId) => {
    const seatObj = allSeats.find(s => s.id === seatId);
    return total + (seatObj?.isVip ? match?.ticketPrice * 2 : match?.ticketPrice);
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
    if (paymentMethod !== 'UPI') return;
    setCheckoutStep('upi-qr');
    setTimeLeft(300);
  };

  const handleGetTicket = () => {
    setCheckoutStep('success');
  };

  const handleFinish = () => {
    navigate('/');
  };

  if (!match) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading stadium architecture...</div>;

  return (
    <div className="container" style={{ padding: '2rem 0', paddingBottom: '6rem' }}>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s', cursor: 'pointer' }}>
        <ArrowLeft size={20} /> <span style={{fontWeight: 500}}>Back to Event Details</span>
      </button>

      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* Step 0: Real Graphical SVG Stadium */}
        <div style={{ gridColumn: 'span 3' }}>
          <div className="glass-panel" style={{ padding: '1rem', borderRadius: '24px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            
            <div className="flex justify-between items-center mb-2 px-6 pt-4" style={{maxWidth: '900px', margin: '0 auto'}}>
              <h2 className="heading-md" style={{margin: 0}}>Graphical Seating View</h2>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Click a seat dot to select 
              </div>
            </div>
            
            <div style={{ position: 'relative', width: '100%', maxWidth: '900px', margin: '0 auto', background: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.05) 0%, transparent 60%)', border: '1px solid rgba(255,255,255,0.02)', borderRadius: '40px', overflow: 'hidden' }}>
              
              {/* Massive SVG Vector Map */}
              <svg viewBox="0 0 1000 1000" style={{ width: '100%', height: 'auto', display: 'block' }}>
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

                {/* Outer Stadium Track / Perimeter */}
                <circle cx={cx} cy={cy} r="480" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="2" strokeDasharray="10 10" />
                <circle cx={cx} cy={cy} r="490" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />

                {/* Central Pitch Block */}
                <circle cx={cx} cy={cy} r="180" fill="url(#pitchGrad)" stroke="rgba(255,255,255,0.4)" strokeWidth="5" />
                {/* 30-yard Inner Circle equivalent */}
                <circle cx={cx} cy={cy} r="90" fill="transparent" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="5 5" />
                {/* Inner 22-yard main pitch rectangle */}
                <rect x={cx - 30} y={cy - 80} width="60" height="160" fill="#d6d3d1" rx="4" />
                <line x1={cx - 30} y1={cy - 60} x2={cx + 30} y2={cy - 60} stroke="#fff" strokeWidth="2" />
                <line x1={cx - 30} y1={cy + 60} x2={cx + 30} y2={cy + 60} stroke="#fff" strokeWidth="2" />

                {/* Draw the architectural curved stand backgrounds */}
                {stands.map(stand => (
                  <g key={stand.id} className="stand-group">
                    <path 
                      d={describeStand(cx, cy, stand.innerR, stand.outerR, stand.startAng, stand.endAng)} 
                      fill={stand.isVip ? "rgba(255, 0, 127, 0.05)" : "rgba(255, 255, 255, 0.02)"} 
                      stroke={stand.isVip ? "rgba(255, 0, 127, 0.2)" : "rgba(255, 255, 255, 0.1)"} 
                      strokeWidth="2" 
                      className="stand-bg"
                    />
                    {/* Stand Labels on arcs */}
                    <path id={`path-${stand.id}`} 
                      d={describeArcText(cx, cy, stand.outerR + 25, stand.startAng, stand.endAng)} 
                      fill="transparent" 
                    />
                    <text fill="var(--text-secondary)" fontSize="18" fontWeight="bold" letterSpacing="4">
                      <textPath href={`#path-${stand.id}`} startOffset="50%" textAnchor="middle">
                        {stand.id.toUpperCase()} STAND {stand.isVip ? '★ VIP' : ''}
                      </textPath>
                    </text>
                  </g>
                ))}

                {/* Map every single seat as an interactive circular dot right into the SVG coordinates */}
                {allSeats.map(seat => {
                  const isBooked = bookedSeats.includes(seat.id);
                  const isSelected = selectedSeats.includes(seat.id);
                  
                  let fill = "rgba(255,255,255,0.15)";
                  let stroke = "rgba(255,255,255,0.3)";
                  let filter = "none";
                  let r = "6";
                  
                  if (isSelected) {
                    fill = "var(--success)";
                    stroke = "white";
                    filter = "url(#glow)";
                    r = "9";
                  } else if (isBooked) {
                    fill = "#334155";
                    stroke = "transparent";
                    r = "6";
                  } else if (seat.isVip) {
                    fill = "rgba(255, 0, 127, 0.4)";
                    stroke = "rgba(255, 0, 127, 0.8)";
                  }

                  return (
                    <circle
                      key={seat.id}
                      cx={seat.x}
                      cy={seat.y}
                      r={r}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={isSelected ? "2" : "1"}
                      filter={filter}
                      className={`svg-seat ${isBooked ? 'booked' : 'available'} ${isSelected ? 'selected' : ''} ${seat.isVip && !isBooked && !isSelected ? 'vip' : ''}`}
                      onClick={() => toggleSeat(seat.id)}
                      style={{ cursor: isBooked ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease' }}
                    >
                      <title>{isBooked ? 'Booked' : `${seat.id} - ₹${seat.isVip ? match.ticketPrice * 2 : match.ticketPrice}`}</title>
                    </circle>
                  );
                })}
              </svg>

            </div>

            <div className="flex items-center gap-8 justify-center mt-6 mb-4" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <div className="flex items-center gap-2">
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }} /> Available
              </div>
              <div className="flex items-center gap-2">
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--success)', border: '1px solid white', boxShadow: '0 0 8px var(--success)' }} /> Selected
              </div>
              <div className="flex items-center gap-2">
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(255, 0, 127, 0.4)', border: '1px solid rgba(255, 0, 127, 0.8)' }} /> VIP
              </div>
              <div className="flex items-center gap-2">
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#334155' }} /> Booked
              </div>
            </div>

          </div>
        </div>

        <div>
           {/* Booking Summary Sidebar Component */}
          <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '24px', position: 'sticky', top: '100px', border: '1px solid rgba(255,255,255,0.05)' }}>
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
                    return (
                      <span key={seatId} style={{ 
                        background: seatObj?.isVip ? 'rgba(255, 0, 127, 0.15)' : 'var(--surface-hover)', 
                        color: seatObj?.isVip ? 'var(--secondary)' : 'white',
                        padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.1)' 
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
                  <span>Total Amount</span>
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
            </div>

            <div className="flex gap-4 mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
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
                style={{ flex: 1, padding: '1.25rem', fontSize: '1.1rem', borderRadius: '14px' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleGetTicket} 
                className="btn-primary" 
                style={{ flex: 2, padding: '1.25rem', fontSize: '1.1rem', borderRadius: '14px', fontWeight: 600, background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}
              >
                Get Ticket
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
        .svg-seat.available:hover {
          fill: var(--primary);
          stroke: var(--primary);
          r: 10;
          filter: url(#glow);
        }
        .svg-seat.vip:hover {
          fill: var(--secondary);
          stroke: var(--secondary);
          r: 10;
          filter: url(#glow);
        }
        
        .stand-group {
          transition: opacity 0.3s ease;
        }
        .stand-group:hover .stand-bg {
          fill: rgba(255,255,255,0.06);
          stroke: rgba(255,255,255,0.3);
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
