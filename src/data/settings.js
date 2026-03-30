export const DEFAULT_STAND_CATEGORIES = {
  general: { name: 'General Stand', price: 599, color: '#ec4899' },
  silver: { name: 'Silver Stand', price: 799, color: '#94a3b8' },
  premium: { name: 'Premium Stand', price: 999, color: '#0ea5e9' },
  gold: { name: 'Gold Stand', price: 1299, color: '#fbbf24' },
  pavilion: { name: 'Pavilion Stand', price: 1499, color: '#22c55e' },
  platinum: { name: 'Platinum Stand', price: 1799, color: '#38bdf8' },
  vip: { name: 'VIP Stand', price: 1999, color: '#8b5cf6' },
  diamond: { name: 'Diamond Stand', price: 2399, color: '#f472b6' },
  corporate: { name: 'Corporate Box', price: 2799, color: '#f59e0b' },
  hospitality: { name: 'Hospitality Box', price: 2999, color: '#f97316' },
  elite: { name: 'Elite Suite', price: 3499, color: '#ef4444' },
  owners: { name: "Owner's Box", price: 4999, color: '#10b981' },
};

export const DEFAULT_PAYMENT_CONFIG = {
  upiId: '7985492748@okbizaxis',
  merchantName: 'Viagogo',
  qrImage: null, // Base64 or URL for custom uploaded QR
};

export const getSettings = () => {
  const savedCategories = localStorage.getItem('viagogo_categories');
  const savedPayment = localStorage.getItem('viagogo_payment');
  
  return {
    categories: savedCategories ? JSON.parse(savedCategories) : DEFAULT_STAND_CATEGORIES,
    payment: savedPayment ? JSON.parse(savedPayment) : DEFAULT_PAYMENT_CONFIG
  };
};

export const saveSettings = (categories, payment) => {
  localStorage.setItem('viagogo_categories', JSON.stringify(categories));
  localStorage.setItem('viagogo_payment', JSON.stringify(payment));
};
