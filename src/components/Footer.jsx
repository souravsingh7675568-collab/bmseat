import { Ticket, Send, Star, PlayCircle, Activity, ChevronRight } from 'lucide-react';

const FacebookIcon = ({ size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = ({ size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const InstagramIcon = ({ size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const YoutubeIcon = ({ size = 18, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

export default function Footer() {
  return (
    <footer style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column' }}>
      
      {/* Official Partners Light Section */}
      <div style={{ backgroundColor: '#f8fafc', padding: '3rem 1rem', borderTop: '1px solid #e2e8f0', color: '#0f172a' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '2.5rem' }}>
            Official Partners
          </h2>
          
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10">
            {/* Broadcaster */}
            <div className="flex flex-col items-center gap-2" style={{ minWidth: '120px' }}>
              <span style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 500 }}>Official Broadcaster</span>
              <div style={{ background: '#0f172a', width: '120px', height: '60px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <Star size={20} color="white" fill="white" />
                <span style={{ fontSize: '0.6rem', fontWeight: 700, tracking: '0.05em', marginTop: '2px' }}>STAR SPORTS</span>
              </div>
            </div>

            {/* Title Sponsor */}
            <div className="flex flex-col items-center gap-2" style={{ minWidth: '120px' }}>
              <span style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 500 }}>Title Sponsor</span>
              <div style={{ background: '#0f172a', width: '120px', height: '60px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.7rem', lineHeight: 1 }}>T</span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '2px' }}>TATA</span>
              </div>
            </div>

            {/* Digital Streaming */}
            <div className="flex flex-col items-center gap-2" style={{ minWidth: '120px' }}>
              <span style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 500 }}>Digital Streaming</span>
              <div style={{ background: '#0f172a', width: '120px', height: '60px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <Star size={14} color="white" fill="white" style={{marginBottom: '2px'}} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>JioHotstar</span>
              </div>
            </div>

            {/* Associate Partner */}
            <div className="flex flex-col items-center gap-2" style={{ minWidth: '120px' }}>
              <span style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 500 }}>Associate Partner</span>
              <div style={{ background: '#0f172a', width: '120px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid white', borderTopColor: 'transparent', transform: 'rotate(-45deg)' }}></div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>MY<span style={{fontSize: '0.85rem'}}>11</span>CIRCLE</span>
              </div>
            </div>

            {/* Official Umpire */}
            <div className="flex flex-col items-center gap-2" style={{ minWidth: '120px' }}>
              <span style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 500 }}>Official Umpire</span>
              <div style={{ background: '#0f172a', width: '120px', height: '60px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <Activity size={20} strokeWidth={3} />
                <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1.1, textAlign: 'center', marginTop: '2px' }}>Wonder<br/>Cement</span>
              </div>
            </div>

            {/* Strategic Timeout */}
            <div className="flex flex-col items-center gap-2" style={{ minWidth: '120px' }}>
              <span style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 500 }}>Strategic Timeout</span>
              <div style={{ background: '#0f172a', width: '120px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, fontStyle: 'italic', letterSpacing: '-0.5px' }}>RuPay<span style={{color:'var(--primary)'}}>{`>`}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dark Footer */}
      <div style={{ backgroundColor: '#0b1120', color: '#f8fafc', padding: '4rem 1rem 2rem 1rem' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            
            {/* Column 1: Brand & Social */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Ticket className="text-primary" size={24} fill="white" />
                <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
                  Book<strong>My</strong>Show
                </span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Your one-stop destination for sports tickets
              </p>
              <div className="flex items-center gap-3">
                <a href="#" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', color: 'white' }} className="hover:bg-primary">
                  <FacebookIcon size={18} fill="currentColor" />
                </a>
                <a href="#" style={{ width: '36px', height: '36px', borderRadius: '50', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', color: 'white' }} className="hover:bg-primary">
                  <TwitterIcon size={18} fill="currentColor" />
                </a>
                <a href="#" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', color: 'white' }} className="hover:bg-primary">
                  <InstagramIcon size={18} strokeWidth={2.5} />
                </a>
                <a href="#" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', color: 'white' }} className="hover:bg-primary">
                  <YoutubeIcon size={18} fill="currentColor" />
                </a>
              </div>
            </div>

            {/* Column 2: Help & Support */}
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'white' }}>Help & Support</h4>
              <ul className="flex flex-col gap-3">
                <li><a href="#" className="flex items-center gap-2 hover:text-white transition-colors" style={{ color: '#94a3b8', fontSize: '0.9rem' }}><ChevronRight size={14} color="#ef4444" strokeWidth={3} /> Contact Us</a></li>
                <li><a href="#" className="flex items-center gap-2 hover:text-white transition-colors" style={{ color: '#94a3b8', fontSize: '0.9rem' }}><ChevronRight size={14} color="#ef4444" strokeWidth={3} /> FAQs</a></li>
                <li><a href="#" className="flex items-center gap-2 hover:text-white transition-colors" style={{ color: '#94a3b8', fontSize: '0.9rem' }}><ChevronRight size={14} color="#ef4444" strokeWidth={3} /> Terms & Conditions</a></li>
              </ul>
            </div>

            {/* Column 3: Quick Links */}
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'white' }}>Quick Links</h4>
              <ul className="flex flex-col gap-3">
                <li><a href="#" className="flex items-center gap-2 hover:text-white transition-colors" style={{ color: '#94a3b8', fontSize: '0.9rem' }}><ChevronRight size={14} color="#ef4444" strokeWidth={3} /> About Us</a></li>
                <li><a href="#" className="flex items-center gap-2 hover:text-white transition-colors" style={{ color: '#94a3b8', fontSize: '0.9rem' }}><ChevronRight size={14} color="#ef4444" strokeWidth={3} /> Press Release</a></li>
                <li><a href="#" className="flex items-center gap-2 hover:text-white transition-colors" style={{ color: '#94a3b8', fontSize: '0.9rem' }}><ChevronRight size={14} color="#ef4444" strokeWidth={3} /> Careers</a></li>
              </ul>
            </div>

            {/* Column 4: Subscribe */}
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'white' }}>Subscribe</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Get updates on latest matches and offers
              </p>
              <div className="flex" style={{ borderRadius: '6px', overflow: 'hidden', height: '42px' }}>
                <input 
                  type="email" 
                  placeholder="Email address" 
                  style={{ 
                    flex: 1, 
                    background: '#334155', 
                    border: 'none', 
                    padding: '0 1rem', 
                    color: 'white', 
                    fontSize: '0.9rem',
                    outline: 'none'
                  }} 
                />
                <button type="button" style={{ width: '42px', background: '#ef4444', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }} className="hover:bg-red-600">
                  <Send size={16} color="white" />
                </button>
              </div>
            </div>

          </div>

          {/* Copyright Bar */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              © 2026 BookMyShow. All rights reserved.
            </p>
            <p style={{ color: '#64748b', fontSize: '0.8rem' }}>
              IPL and Indian Premier League are registered trademarks of BCCI.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
