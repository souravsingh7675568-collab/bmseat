import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSettings, saveSettings } from '../data/settings';
import { Save, ArrowLeft, RefreshCw, Smartphone, CreditCard, Lock, Image as ImageIcon } from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'anishanisha@gmail.com') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid Administrator Password');
    }
  };

  const handlePriceChange = (catKey, newPrice) => {
    setSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [catKey]: { ...prev.categories[catKey], price: parseInt(newPrice) || 0 }
      }
    }));
  };

  const handlePaymentChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      payment: { ...prev.payment, [field]: value }
    }));
  };

  const handleQrUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSettings(prev => ({
        ...prev,
        payment: { ...prev.payment, qrImage: reader.result }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setIsSaving(true);
    saveSettings(settings.categories, settings.payment);
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 500);
  };

  if (!settings) return null;

  if (!isAuthenticated) {
    return (
      <div className="container flex items-center justify-center" style={{ minHeight: '80vh' }}>
        <div className="glass-panel" style={{ maxWidth: '450px', width: '100%', padding: '3.5rem', borderRadius: '32px', textAlign: 'center' }}>
          <div className="flex justify-center mb-6">
            <div style={{ background: 'var(--primary)', padding: '1.25rem', borderRadius: '24px', boxShadow: '0 10px 25px var(--primary)40' }}>
              <Lock size={40} color="white" />
            </div>
          </div>
          <h2 className="heading-md mb-2">Admin Security</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>Enter the master password to access management controls.</p>
          
          <form onSubmit={handleLogin}>
            <div className="form-group mb-6">
              <input 
                type="password" 
                placeholder="Enter Administrator Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                style={{ 
                  width: '100%', 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  color: 'white', 
                  padding: '1.2rem', 
                  borderRadius: '16px',
                  fontSize: '1.1rem',
                  textAlign: 'center'
                }}
              />
              {loginError && <div style={{ color: 'var(--danger)', fontSize: '0.9rem', marginTop: '1rem', fontWeight: 500 }}>{loginError}</div>}
            </div>
            <button type="submit" className="btn-primary w-full" style={{ padding: '1.2rem', fontSize: '1.1rem' }}>
              Authorize Access
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-8" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s', cursor: 'pointer' }}>
        <ArrowLeft size={20} /> <span style={{fontWeight: 500}}>Back to Site</span>
      </button>

      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="heading-md" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage ticket pricing and payment configuration for Viagogo</p>
        </div>
        <button 
          onClick={handleSave} 
          className="btn-primary" 
          disabled={isSaving}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 2rem', borderRadius: '12px' }}
        >
          {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pricing Category Management */}
        <div className="lg:col-span-2 glass-panel" style={{ padding: '2rem', borderRadius: '24px' }}>
          <h3 className="heading-sm mb-6" style={{ fontSize: '1.25rem' }}>Ticket Pricing (12 Categories)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {Object.entries(settings.categories).map(([key, data]) => (
              <div key={key} className="flex items-center justify-between p-4" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: data.color }} />
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{data.name}</span>
                </div>
                <div className="flex items-center gap-2" style={{ maxWidth: '120px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>₹</span>
                  <input 
                    type="number" 
                    value={data.price}
                    onChange={(e) => handlePriceChange(key, e.target.value)}
                    style={{ 
                      width: '100%', 
                      background: 'rgba(0,0,0,0.2)', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      color: 'white', 
                      padding: '0.5rem', 
                      borderRadius: '8px',
                      fontWeight: 700,
                      textAlign: 'right'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Configuration */}
        <div className="flex flex-col gap-8">
          <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '24px' }}>
            <h3 className="heading-sm mb-6" style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Smartphone size={24} className="text-primary" />
              UPI Config
            </h3>
            <div className="form-group mb-6">
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ImageIcon size={16} /> 
                Upload Custom QR (Recommended)
              </label>
              <div 
                style={{ 
                  width: '100%', 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '2px dashed rgba(255,255,255,0.1)', 
                  padding: '1.5rem', 
                  borderRadius: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              >
                {settings.payment.qrImage ? (
                  <div className="flex flex-col items-center">
                    <img src={settings.payment.qrImage} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'contain', marginBottom: '1rem', borderRadius: '8px' }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>Custom QR Loaded ✓</span>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Click to select your QR image
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleQrUpload}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                />
              </div>
            </div>

            <div className="form-group mb-6" style={{ opacity: settings.payment.qrImage ? 0.3 : 1 }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>UPI ID (Auto-Generation Fallback)</label>
              <input 
                type="text" 
                value={settings.payment.upiId}
                onChange={(e) => handlePaymentChange('upiId', e.target.value)}
                placeholder="example@upi"
                style={{ 
                  width: '100%', 
                  background: 'rgba(0,0,0,0.2)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  color: 'white', 
                  padding: '0.8rem 1rem', 
                  borderRadius: '12px',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Merchant Name</label>
              <input 
                type="text" 
                value={settings.payment.merchantName}
                onChange={(e) => handlePaymentChange('merchantName', e.target.value)}
                placeholder="Shop Name"
                style={{ 
                  width: '100%', 
                  background: 'rgba(0,0,0,0.2)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  color: 'white', 
                  padding: '0.8rem 1rem', 
                  borderRadius: '12px',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '24px', opacity: 0.6 }}>
            <h3 className="heading-sm mb-4" style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CreditCard size={24} className="text-secondary" />
              Static Assets
            </h3>
            <p style={{ fontSize: '0.85rem' }}>Card and Wallet payment gateways are currently managed via the simulated maintenance module.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
