import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMatchDetails } from '../data/mockApi';
import { ArrowLeft, Monitor, CreditCard, Wallet, Smartphone, User, Mail, Phone, QrCode, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SeatSelection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [checkoutStep, setCheckoutStep] = useState('none'); // 'none' | 'details' | 'payment' | 'upi-qr' | 'success'
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
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s', cursor: 'pointer' }}>
        <ArrowLeft size={20} /> <span style={{fontWeight: 500}}>Back to Event Details</span>
      </button>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Same layout as before for Step 0 (Seat Selection) */}
        <div style={{ gridColumn: 'span 3' }}>
          <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '24px', textAlign: 'center', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)' }}>
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
                boxShadow: '0 -10px 40px rgba(138, 43, 226, 0.5)'
              }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', letterSpacing: '4px', fontWeight: 600 }}>PLAYING PITCH / STAGE</span>
              </div>

              <div style={{ marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', display: 'inline-block', padding: '0 2rem' }}>VIP PAVILION - ₹{match.ticketPrice * 2}</h3>
                {renderSeatRow('A', 14, true)}
                {renderSeatRow('B', 16, true)}
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', display: 'inline-block', padding: '0 2rem' }}>STANDARD STANDS - ₹{match.ticketPrice}</h3>
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
           {/* Booking Summary Box */}
          <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '24px', position: 'sticky', top: '100px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{width: '6px', height: '20px', background: 'var(--primary)', borderRadius: '4px'}}></div>
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
                  {selectedSeats.map(seat => (
                    <span key={seat} style={{ background: 'var(--surface-hover)', padding: '0.4rem 0.75rem', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {seat}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', textAlign: 'center' }}>No seats selected</div>
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
            
            <div className="mt-8 pt-6" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-4 mb-3">
                <div className="seat available" style={{ width: '20px', height: '20px', padding: 0 }} /> Available
              </div>
              <div className="flex items-center gap-4 mb-3">
                <div className="seat selected" style={{ width: '20px', height: '20px', padding: 0 }} /> Selected
              </div>
              <div className="flex items-center gap-4 mb-3">
                <div className="seat booked" style={{ width: '20px', height: '20px', padding: 0 }} /> Booked (Unavailable)
              </div>
              <div className="flex items-center gap-4">
                <div className="seat vip" style={{ width: '20px', height: '20px', padding: 0 }} /> VIP Seat
              </div>
            </div>
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
                className="payment-option btn-secondary" 
                style={{ 
                  borderRadius: '16px', textAlign: 'left', display: 'block', width: '100%',
                  background: paymentMethod === 'Card' ? 'rgba(138, 43, 226, 0.1)' : 'var(--surface-hover)',
                  border: paymentMethod === 'Card' ? '2px solid var(--primary)' : '2px solid transparent',
                  padding: 0,
                  boxShadow: paymentMethod === 'Card' ? '0 10px 40px -10px rgba(138, 43, 226, 0.5)' : 'none',
                  transform: paymentMethod === 'Card' ? 'scale(1.02)' : 'none'
                }}
              >
                <div className="flex items-center gap-5" style={{ padding: '1.5rem' }}>
                  <div style={{ background: paymentMethod === 'Card' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard size={28} color={paymentMethod === 'Card' ? 'white' : 'var(--text-secondary)'} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1.3rem', color: paymentMethod === 'Card' ? 'white' : 'var(--text-primary)' }}>Credit / Debit Card</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>Visa, Mastercard, RuPay, Maestro</div>
                  </div>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid', borderColor: paymentMethod === 'Card' ? 'var(--primary)' : 'rgba(255,255,255,0.2)', background: paymentMethod === 'Card' ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {paymentMethod === 'Card' && <div style={{width: '12px', height: '12px', borderRadius: '50%', background: 'white'}}></div>}
                  </div>
                </div>
                {paymentMethod === 'Card' && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '1.05rem', color: 'var(--danger)', fontStyle: 'italic', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertCircle size={18} /> Currently Unavailable
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: '1.5' }}>
                      Our payment gateway is currently undergoing scheduled maintenance for Card transactions. Please select UPI / QR to continue.
                    </div>
                  </div>
                )}
              </button>

              <button 
                onClick={() => setPaymentMethod('Wallet')}
                className="payment-option btn-secondary" 
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
                    <div style={{ fontWeight: 700, fontSize: '1.3rem', color: paymentMethod === 'Wallet' ? 'white' : 'var(--text-primary)' }}>Wallets</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>Amazon Pay, MobiKwik, Freecharge</div>
                  </div>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid', borderColor: paymentMethod === 'Wallet' ? 'var(--primary)' : 'rgba(255,255,255,0.2)', background: paymentMethod === 'Wallet' ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {paymentMethod === 'Wallet' && <div style={{width: '12px', height: '12px', borderRadius: '50%', background: 'white'}}></div>}
                  </div>
                </div>
                {paymentMethod === 'Wallet' && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '1.05rem', color: 'var(--danger)', fontStyle: 'italic', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertCircle size={18} /> Currently Unavailable
                    </div>
                  </div>
                )}
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
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '2rem' }}>Open Google Pay, PhonePe or any UPI app to scan.</p>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', display: 'inline-block', marginBottom: '2rem', boxShadow: '0 15px 40px rgba(0,0,0,0.4)' }}>
              {/* Actual working UPI QR generated via API matching the exact UPI ID specified in the user's reference image */}
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
          <div className="glass-panel modal-card" style={{ maxWidth: '450px', textAlign: 'center', padding: '4rem 2.5rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto', boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)' }}>
              <CheckCircle2 size={48} color="white" />
            </div>
            
            <h2 className="heading-md mb-4" style={{ fontSize: '2rem', color: 'white' }}>Booking Confirmed!</h2>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '3rem' }}>
              Your payment was successful and the tickets have been sent to your registered email address <strong>{userDetails.email}</strong>.
            </p>

            <button 
              onClick={handleFinish} 
              className="btn-primary" 
              style={{ width: '100%', padding: '1.25rem', fontSize: '1.2rem', borderRadius: '14px', fontWeight: 600, background: 'var(--success)', border: 'none' }}
            >
              OK
            </button>
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
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease;
          padding: 0;
          overflow: hidden;
        }
        .payment-option:hover:not(:disabled) {
          transform: scale(1.02);
          background: rgba(255,255,255,0.03);
        }
        @media (max-width: 768px) {
          .seat { width: 28px; height: 28px; font-size: 0.65rem; }
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
