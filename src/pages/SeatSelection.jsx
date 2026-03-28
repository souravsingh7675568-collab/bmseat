import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMatchDetails } from '../data/mockApi';
import { ArrowLeft, Monitor, CreditCard, Wallet, Smartphone, User, Mail, Phone, QrCode } from 'lucide-react';

export default function SeatSelection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [checkoutStep, setCheckoutStep] = useState('none'); // 'none' | 'details' | 'payment' | 'upi-qr'
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [userDetails, setUserDetails] = useState({ name: '', email: '', mobile: '' });
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    fetchMatchDetails(id).then(data => {
      setMatch(data);
      const randomBooked = [];
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      for (let i = 0; i < 15; i++) {
        const row = rows[Math.floor(Math.random() * rows.length)];
        const num = Math.floor(Math.random() * 10) + 1;
        randomBooked.push(`${row}${num}`);
      }
      setBookedSeats(randomBooked);
    });
  }, [id]);

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

  const basePrice = selectedSeats.reduce((total, seat) => {
    const isVip = seat.startsWith('A') || seat.startsWith('B');
    return total + (isVip ? match?.ticketPrice * 2 : match?.ticketPrice);
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

  const confirmBooking = () => {
    alert(`Payment successful! Your tickets for the ${match.team1Short} vs ${match.team2Short} match have been sent instantly to ${userDetails.email}.`);
    navigate('/');
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!match) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading seat layout...</div>;

  const renderSeatRow = (rowLabel, count, isVip = false) => {
    const seats = [];
    for (let i = 1; i <= count; i++) {
      const seatId = `${rowLabel}${i}`;
      const isBooked = bookedSeats.includes(seatId);
      const isSelected = selectedSeats.includes(seatId);
      
      let seatClass = 'seat ';
      if (isBooked) seatClass += 'booked';
      else if (isSelected) seatClass += 'selected';
      else if (isVip) seatClass += 'vip';
      else seatClass += 'available';

      seats.push(
        <button 
          key={seatId}
          onClick={() => toggleSeat(seatId)}
          disabled={isBooked}
          className={seatClass}
          title={isBooked ? 'Booked' : `Seat ${seatId} - ₹${isVip ? match.ticketPrice * 2 : match.ticketPrice}`}
        >
          {i}
        </button>
      );
    }
    
    return (
      <div className="flex items-center gap-4 justify-center" style={{ marginBottom: '1rem' }} key={rowLabel}>
        <div style={{ width: '30px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{rowLabel}</div>
        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          <div className="flex gap-2">{seats.slice(0, Math.ceil(count / 2))}</div>
          <div style={{ width: '20px' }}></div>
          <div className="flex gap-2">{seats.slice(Math.ceil(count / 2))}</div>
        </div>
        <div style={{ width: '30px', fontWeight: 'bold', color: 'var(--text-secondary)', textAlign: 'right' }}>{rowLabel}</div>
      </div>
    );
  };

  return (
    <div className="container" style={{ padding: '2rem 0', paddingBottom: '6rem' }}>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6" style={{ color: 'var(--text-secondary)' }}>
        <ArrowLeft size={20} /> Back to Event Details
      </button>

      <div className="grid lg:grid-cols-4 gap-8">
        <div style={{ gridColumn: 'span 3' }}>
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', textAlign: 'center', overflowX: 'auto' }}>
            <div style={{ display: 'inline-block', minWidth: '600px' }}>
              <h2 className="heading-md mb-8">Select Your Seats</h2>
              
              <div style={{ 
                margin: '0 auto 4rem auto', 
                width: '80%', 
                height: '40px', 
                background: 'linear-gradient(to bottom, var(--primary), transparent)',
                borderRadius: '50% 50% 0 0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderTop: '2px solid var(--primary)',
                boxShadow: '0 -10px 30px rgba(138, 43, 226, 0.4)'
              }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', letterSpacing: '4px' }}>PLAYING PITCH / STAGE</span>
              </div>

              <div style={{ marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>VIP PAVILION - ₹{match.ticketPrice * 2}</h3>
                {renderSeatRow('A', 14, true)}
                {renderSeatRow('B', 16, true)}
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>STANDARD STANDS - ₹{match.ticketPrice}</h3>
                {renderSeatRow('C', 18)}
                {renderSeatRow('D', 18)}
                {renderSeatRow('E', 20)}
                {renderSeatRow('F', 20)}
                {renderSeatRow('G', 22)}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>Booking Summary</h3>
            
            <div className="mb-4">
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Match</div>
              <div style={{ fontWeight: 600 }}>{match.team1Short} vs {match.team2Short}</div>
            </div>

            <div className="mb-6">
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Selected Seats ({selectedSeats.length})</div>
              {selectedSeats.length > 0 ? (
                <div style={{ fontWeight: 600, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selectedSeats.map(seat => (
                    <span key={seat} style={{ background: 'var(--surface-hover)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem' }}>
                      {seat}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.875rem' }}>No seats selected</div>
              )}
            </div>

            {selectedSeats.length > 0 && (
              <div style={{ fontSize: '0.9rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                <div className="flex justify-between mb-2">
                  <span style={{ color: 'var(--text-secondary)' }}>Tickets</span>
                  <span>₹{basePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span style={{ color: 'var(--text-secondary)' }}>Handling Fee</span>
                  <span>₹{handlingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2 pb-2" style={{ borderBottom: '1px dashed var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>GST (18%)</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2" style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                  <span>Total Amount</span>
                  <span style={{ color: 'var(--primary)' }}>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            )}

            <button 
              onClick={handleProceedToDetails} 
              disabled={selectedSeats.length === 0}
              className="btn-primary" 
              style={{ width: '100%', padding: '1rem', opacity: selectedSeats.length === 0 ? 0.5 : 1, cursor: selectedSeats.length === 0 ? 'not-allowed' : 'pointer' }}
            >
              Proceed to Details
            </button>
            
            <div className="mt-8" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="seat available" style={{ width: '16px', height: '16px', padding: 0 }} /> Available
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="seat selected" style={{ width: '16px', height: '16px', padding: 0 }} /> Selected
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="seat booked" style={{ width: '16px', height: '16px', padding: 0 }} /> Booked (Unavailable)
              </div>
              <div className="flex items-center gap-3">
                <div className="seat vip" style={{ width: '16px', height: '16px', padding: 0 }} /> VIP Seat
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Customer Details Modal */}
      {checkoutStep === 'details' && (
        <div className="overlay">
          <div className="glass-panel modal-card">
            <h2 className="heading-md mb-6">Customer Details</h2>
            <form onSubmit={handleProceedToPayment}>
              <div className="form-group">
                <label><User size={16} /> Full Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Enter your name"
                  value={userDetails.name}
                  onChange={(e) => setUserDetails({...userDetails, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label><Mail size={16} /> Email Address</label>
                <input 
                  type="email" 
                  required 
                  placeholder="name@example.com"
                  value={userDetails.email}
                  onChange={(e) => setUserDetails({...userDetails, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label><Phone size={16} /> Mobile Number</label>
                <input 
                  type="tel" 
                  required 
                  pattern="[0-9]{10}"
                  placeholder="10-digit mobile number"
                  value={userDetails.mobile}
                  onChange={(e) => setUserDetails({...userDetails, mobile: e.target.value})}
                />
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Your tickets will be sent to this email automatically.
              </p>
              <div className="flex gap-4">
                <button type="button" onClick={() => setCheckoutStep('none')} className="btn-secondary" style={{ flex: 1 }}>Back</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Continue to Pay</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Step 2: Payment Modal */}
      {checkoutStep === 'payment' && (
        <div className="overlay">
          <div className="glass-panel modal-card" style={{ maxWidth: '450px' }}>
            
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <h2 className="heading-md" style={{ margin: 0 }}>Payment</h2>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>₹{grandTotal.toFixed(2)}</div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Select Method</h3>
              
              <button 
                onClick={() => setPaymentMethod('UPI')}
                className="payment-option btn-secondary" 
                style={{ 
                  borderRadius: '12px', textAlign: 'left', display: 'block', width: '100%',
                  background: paymentMethod === 'UPI' ? 'rgba(138, 43, 226, 0.1)' : 'var(--surface-hover)',
                  border: paymentMethod === 'UPI' ? '1px solid var(--primary)' : '1px solid var(--border)'
                }}
              >
                <div className="flex items-center gap-3 p-4">
                  <Smartphone size={20} color={paymentMethod === 'UPI' ? "var(--primary)" : "var(--text-secondary)"} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: paymentMethod === 'UPI' ? 'white' : 'var(--text-primary)' }}>UPI / QR</div>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => setPaymentMethod('Card')}
                className="payment-option btn-secondary" 
                style={{ 
                  borderRadius: '12px', textAlign: 'left', display: 'block', width: '100%',
                  background: paymentMethod === 'Card' ? 'rgba(138, 43, 226, 0.1)' : 'var(--surface-hover)',
                  border: paymentMethod === 'Card' ? '1px solid var(--primary)' : '1px solid var(--border)'
                }}
              >
                <div className="flex items-center gap-3 p-4">
                  <CreditCard size={20} color={paymentMethod === 'Card' ? "var(--primary)" : "var(--text-secondary)"} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: paymentMethod === 'Card' ? 'white' : 'var(--text-primary)' }}>Credit / Debit Card</div>
                  </div>
                </div>
                {/* Dropdown-like display for unavailable status */}
                {paymentMethod === 'Card' && (
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderTop: '1px solid var(--border)', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--danger)', fontStyle: 'italic', fontWeight: '500' }}>
                      ⚠️ Currently Unavailable
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Card payments are undergoing maintenance. Please select UPI / QR.
                    </div>
                  </div>
                )}
              </button>

              <button 
                onClick={() => setPaymentMethod('Wallet')}
                className="payment-option btn-secondary" 
                style={{ 
                  borderRadius: '12px', textAlign: 'left', display: 'block', width: '100%',
                  background: paymentMethod === 'Wallet' ? 'rgba(138, 43, 226, 0.1)' : 'var(--surface-hover)',
                  border: paymentMethod === 'Wallet' ? '1px solid var(--primary)' : '1px solid var(--border)'
                }}
              >
                <div className="flex items-center gap-3 p-4">
                  <Wallet size={20} color={paymentMethod === 'Wallet' ? "var(--primary)" : "var(--text-secondary)"} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: paymentMethod === 'Wallet' ? 'white' : 'var(--text-primary)' }}>Wallet</div>
                  </div>
                </div>
                {/* Dropdown-like display for unavailable status */}
                {paymentMethod === 'Wallet' && (
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderTop: '1px solid var(--border)', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--danger)', fontStyle: 'italic', fontWeight: '500' }}>
                      ⚠️ Currently Unavailable
                    </div>
                  </div>
                )}
              </button>
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={() => setCheckoutStep('details')} className="btn-secondary" style={{ flex: 1 }}>Back</button>
              <button 
                onClick={handlePayMethodSelection} 
                disabled={paymentMethod !== 'UPI'}
                className="btn-primary" 
                style={{ flex: 2, opacity: paymentMethod !== 'UPI' ? 0.5 : 1, cursor: paymentMethod !== 'UPI' ? 'not-allowed' : 'pointer' }}
              >
                Pay Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: UPI QR Scanning Modal */}
      {checkoutStep === 'upi-qr' && (
        <div className="overlay">
          <div className="glass-panel modal-card" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <h2 className="heading-md mb-2">Scan & Pay</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Open any UPI app to scan the code.</p>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', display: 'inline-block', marginBottom: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
              <div style={{ width: '180px', height: '180px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gridTemplateRows: 'repeat(6, 1fr)', gap: '4px' }}>
                {Array.from({ length: 36 }).map((_, i) => (
                  <div key={i} style={{ 
                    background: [0, 5, 30, 35].includes(i) || Math.random() > 0.4 ? 'black' : 'white',
                    borderRadius: '2px'
                  }}></div>
                ))}
              </div>
            </div>

            <div className="flex justify-center items-center gap-2 mb-6" style={{ color: timeLeft < 60 ? 'var(--danger)' : 'var(--primary)', fontWeight: 'bold', fontSize: '1.5rem' }}>
              <Monitor size={24} /> {formatTime(timeLeft)}
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--success)', display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--success)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</div>
              <p style={{ margin: 0, lineHeight: 1.5, fontWeight: 500, textAlign: 'left' }}>
                Tickets for <strong>{userDetails.name}</strong> will be sent to <strong>{userDetails.email}</strong> upon success.
              </p>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setCheckoutStep('payment')} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={confirmBooking} className="btn-primary" style={{ flex: 2 }}>Simulate Success</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .seat {
          width: 36px;
          height: 36px;
          border-radius: 8px 8px 4px 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: bold;
          transition: all 0.2s;
        }
        .seat.available {
          background: var(--surface-hover);
          color: var(--text-secondary);
          border: 1px solid var(--border);
        }
        .seat.available:hover {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
          transform: scale(1.1);
          z-index: 10;
        }
        .seat.vip {
          background: rgba(255, 0, 127, 0.1);
          color: var(--secondary);
          border: 1px solid rgba(255, 0, 127, 0.4);
        }
        .seat.vip:hover {
          background: var(--secondary);
          color: white;
          transform: scale(1.1);
          z-index: 10;
        }
        .seat.selected {
          background: var(--success);
          color: white;
          border: none;
          transform: scale(1.1);
          box-shadow: 0 4px 10px rgba(16, 185, 129, 0.4);
          z-index: 10;
        }
        .seat.booked {
          background: #334155;
          color: #475569;
          cursor: not-allowed;
          opacity: 0.5;
        }
        .payment-option {
          transition: all 0.2s ease;
          padding: 0;
          overflow: hidden;
        }
        .payment-option:hover {
          transform: translateX(4px);
        }
        @media (max-width: 768px) {
          .seat { width: 28px; height: 28px; font-size: 0.65rem; }
        }

        /* Modal Styles */
        .overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.95);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .modal-card {
          padding: 2.5rem;
          border-radius: 24px;
          max-width: 450px;
          width: 100%;
          background: var(--surface);
          max-height: 90vh;
          overflow-y: auto;
        }
        .form-group {
          margin-bottom: 1.5rem;
          text-align: left;
        }
        .form-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }
        .form-group input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--border);
          color: white;
          font-family: inherit;
        }
        .form-group input:focus {
          outline: none;
          border-color: var(--primary);
        }
        .border-b {
          border-bottom: 1px solid var(--border);
        }
      `}</style>
    </div>
  );
}
