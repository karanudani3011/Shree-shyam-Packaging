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
  const { customers, sellers } = useERP();
  const [activeTab, setActiveTab] = useState('customers');
  const [searchTerm, setSearchTerm] = useState('');

  const list = activeTab === 'customers' ? customers : sellers;
  const filteredList = list.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.phone.includes(searchTerm)
  );

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

      <div className="crm-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {filteredList.map((item) => (
          <div key={item.id} className="admin-card crm-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="crm-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '1.25rem', fontWeight: 'bold' }}>
                  {item.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem' }}>{item.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-dim)' }}>ID: #{item.id}00{item.id}</span>
                </div>
              </div>
              <button className="icon-btn"><ChevronRight size={18} /></button>
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
                <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-dim)', marginBottom: '0.25rem' }}>
                  {activeTab === 'customers' ? 'Credit Limit' : 'Total Orders'}
                </p>
                <p style={{ fontWeight: '700' }}>₹50,000</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-dim)', marginBottom: '0.25rem' }}>
                  {activeTab === 'customers' ? 'Outstanding' : 'Balance Due'}
                </p>
                <p style={{ fontWeight: '700', color: (item.credit || item.balance) > 0 ? '#ef4444' : '#10b981' }}>
                  ₹{(item.credit || item.balance || 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="crm-actions" style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="glass-btn" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}>
                <CreditCard size={14} /> Payment
              </button>
              <button className="glass-btn" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)' }}>
                View Ledger
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCRM;
