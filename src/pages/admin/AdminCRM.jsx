import React, { useState } from 'react';
import { 
  Users, 
  Truck, 
  Plus, 
  Phone, 
  Mail, 
  CreditCard,
  Search,
  ChevronRight
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import './AdminPages.css';

const AdminCRM = () => {
  const { customers, setCustomers, sellers, transactions } = useERP();
  const [activeTab, setActiveTab] = useState('customers');
  const [searchTerm, setSearchTerm] = useState('');

  const INTEREST_RATE = 2; // 2% per month

  const calculateInterest = (tx) => {
    if (tx.status !== 'pending' || tx.paymentMode !== 'credit') return 0;
    
    const invoiceDate = new Date(tx.date);
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + (tx.dueDays || 30));
    
    const today = new Date();
    if (today <= dueDate) return 0;
    
    const diffTime = Math.abs(today - dueDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Simple monthly interest pro-rated by days
    return (tx.amount * INTEREST_RATE * diffDays) / (30 * 100);
  };

  const getPartyStats = (partyName) => {
    const partyTransactions = transactions.filter(t => t.customer === partyName || t.seller === partyName);
    const outstanding = partyTransactions
      .filter(t => t.status === 'pending')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const totalInterest = partyTransactions
      .filter(t => t.status === 'pending')
      .reduce((acc, t) => acc + calculateInterest(t), 0);
      
    return { outstanding, totalInterest };
  };

  const list = activeTab === 'customers' ? customers : sellers;
  const filteredList = list.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.phone.includes(searchTerm)
  );

  const toggleInterest = (id) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, interestEnabled: !c.interestEnabled } : c));
  };

  return (
    <div className="admin-crm">
      <div className="tabs-header" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className={`glass-btn ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
          style={{ background: activeTab === 'customers' ? 'var(--admin-primary)' : 'rgba(255,255,255,0.05)' }}
        >
          <Users size={18} />
          Customers
        </button>
        <button 
          className={`glass-btn ${activeTab === 'sellers' ? 'active' : ''}`}
          onClick={() => setActiveTab('sellers')}
          style={{ background: activeTab === 'sellers' ? 'var(--admin-primary)' : 'rgba(255,255,255,0.05)' }}
        >
          <Truck size={18} />
          Sellers / Suppliers
        </button>
      </div>

      <div className="inventory-controls">
        <div className="search-wrapper" style={{ flex: 1, position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} size={20} />
          <input 
            type="text" 
            placeholder={`Search ${activeTab}...`} 
            className="search-input" 
            style={{ paddingLeft: '45px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="glass-btn">
          <Plus size={18} />
          Add {activeTab === 'customers' ? 'Customer' : 'Seller'}
        </button>
      </div>

      <div className="crm-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {filteredList.map((item) => {
          const stats = getPartyStats(item.name);
          return (
            <div key={item.id} className="admin-card crm-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="crm-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: 'white' }}>{item.name}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-dim)' }}>ID: #SSP00{item.id}</span>
                  </div>
                </div>
                {activeTab === 'customers' && (
                  <div className="interest-toggle" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', color: item.interestEnabled ? '#10b981' : 'var(--admin-text-dim)' }}>
                      Interest: {item.interestEnabled ? 'ON' : 'OFF'}
                    </span>
                    <div 
                      className={`toggle-switch ${item.interestEnabled ? 'active' : ''}`} 
                      onClick={() => toggleInterest(item.id)}
                      style={{ transform: 'scale(0.8)' }}
                    >
                      <div className="toggle-knob"></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="crm-contact" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--admin-text-dim)', fontSize: '0.9rem' }}>
                  <Phone size={14} /> {item.phone}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--admin-text-dim)', fontSize: '0.9rem' }}>
                  <Mail size={14} /> {item.email}
                </div>
              </div>

              <div className="crm-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-dim)', marginBottom: '0.25rem' }}>Outstanding Bill</p>
                  <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>₹{stats.outstanding.toLocaleString()}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-dim)', marginBottom: '0.25rem' }}>Accumulated Interest</p>
                  <p style={{ fontWeight: '700', fontSize: '1.1rem', color: stats.totalInterest > 0 ? '#ef4444' : '#10b981' }}>
                    ₹{item.interestEnabled ? stats.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0.00'}
                  </p>
                </div>
                <div style={{ gridColumn: 'span 2', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'white', fontWeight: 'bold' }}>Total Due:</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: '800', color: (stats.outstanding + (item.interestEnabled ? stats.totalInterest : 0)) > 0 ? '#ef4444' : 'white' }}>
                      ₹{(stats.outstanding + (item.interestEnabled ? stats.totalInterest : 0)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="crm-actions" style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="glass-btn" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem', justifyContent: 'center' }}>
                  <CreditCard size={14} /> Record Payment
                </button>
                <button className="glass-btn" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', justifyContent: 'center' }}>
                  View Ledger
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminCRM;
