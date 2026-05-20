import React, { useState } from 'react';
import { 
  Users, 
  Truck, 
  Plus, 
  Phone, 
  Mail, 
  CreditCard,
  Search,
  ChevronRight,
  Trash2,
  Edit2,
  X
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import './AdminPages.css';

const AdminCRM = () => {
  const { customers, setCustomers, sellers, setSellers, transactions, updateTransactionStatus, deleteTransaction, updateTransaction } = useERP();
  const [activeTab, setActiveTab] = useState('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [activeParty, setActiveParty] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  
  // Transaction Edit states
  const [editingTx, setEditingTx] = useState(null);
  const [editTxData, setEditTxData] = useState({ customer: '', seller: '', date: '', amount: '', payment_mode: '', status: '' });

  const INTEREST_RATE = 1.5; // 1.5% per month

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

  const handleDeleteItem = (id) => {
    if (window.confirm(`Are you sure you want to delete this ${activeTab === 'customers' ? 'customer' : 'seller'}?`)) {
      if (activeTab === 'customers') {
        setCustomers(prev => prev.filter(c => c.id !== id));
      } else {
        setSellers(prev => prev.filter(s => s.id !== id));
      }
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return alert('Name and Phone are required!');
    
    const newItem = {
      id: Date.now(),
      name: formData.name,
      phone: formData.phone,
      email: formData.email || '',
      interestEnabled: false,
      credit: 0,
      balance: 0
    };

    if (activeTab === 'customers') {
      setCustomers(prev => [...prev, newItem]);
    } else {
      setSellers(prev => [...prev, newItem]);
    }

    setIsAddModalOpen(false);
    setFormData({ name: '', phone: '', email: '' });
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
        <button className="glass-btn" onClick={() => setIsAddModalOpen(true)}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                  <button 
                    onClick={() => handleDeleteItem(item.id)}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                    title={`Delete ${activeTab === 'customers' ? 'Customer' : 'Seller'}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
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
                <button 
                  className="glass-btn" 
                  onClick={() => {
                    setActiveParty(item);
                    setIsPaymentModalOpen(true);
                  }}
                  style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem', justifyContent: 'center' }}
                >
                  <CreditCard size={14} /> Record Payment
                </button>
                <button 
                  className="glass-btn" 
                  onClick={() => {
                    setActiveParty(item);
                    setIsLedgerModalOpen(true);
                  }}
                  style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', justifyContent: 'center' }}
                >
                  View Ledger
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content glass-morphism animate-slideUp" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="card-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Plus size={22} color="var(--admin-primary)" />
                Add {activeTab === 'customers' ? 'Customer' : 'Seller'}
              </h3>
              <button className="icon-btn" onClick={() => setIsAddModalOpen(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="form-grid" style={{ marginTop: '1.25rem' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Name</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  placeholder={`e.g. ${activeTab === 'customers' ? 'Jane Doe' : 'ABC Supplier Corp'}`}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  required 
                  value={formData.phone} 
                  onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                  placeholder="e.g. 9876543210"
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({ ...formData, email: e.target.value })} 
                  placeholder="e.g. info@company.com"
                />
              </div>

              <button type="submit" className="glass-btn" style={{ gridColumn: 'span 2', marginTop: '1.5rem', background: 'var(--admin-primary)', justifyContent: 'center', padding: '1rem' }}>
                Save {activeTab === 'customers' ? 'Customer' : 'Seller'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isPaymentModalOpen && activeParty && (() => {
        const partyTransactions = transactions.filter(t => t.customer === activeParty.name || t.seller === activeParty.name);
        const pendingTransactions = partyTransactions.filter(t => t.status === 'pending');
        
        return (
          <div className="modal-overlay" onClick={() => setIsPaymentModalOpen(false)}>
            <div className="modal-content glass-morphism animate-slideUp" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <div className="card-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CreditCard size={22} color="var(--admin-primary)" />
                  Outstanding Bills: {activeParty.name}
                </h3>
                <button className="icon-btn" onClick={() => setIsPaymentModalOpen(false)}><X size={20} /></button>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingTransactions.length === 0 ? (
                  <p style={{ color: 'var(--admin-text-dim)', textAlign: 'center', padding: '2rem' }}>
                    No outstanding pending bills found for this {activeTab === 'customers' ? 'customer' : 'seller'}.
                  </p>
                ) : (
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Bill ID</th>
                          <th>Amount</th>
                          <th style={{ textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingTransactions.map(tx => (
                          <tr key={tx.id}>
                            <td>{tx.date}</td>
                            <td><code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{tx.id.substring(0, 8)}</code></td>
                            <td><strong>₹{tx.amount.toLocaleString()}</strong></td>
                            <td style={{ textAlign: 'center' }}>
                              <button 
                                className="glass-btn" 
                                onClick={async () => {
                                  if (window.confirm('Mark this bill as paid?')) {
                                    const { success } = await updateTransactionStatus(tx.id, 'paid');
                                    if (success) {
                                      alert('Bill marked as paid successfully!');
                                    } else {
                                      alert('Failed to mark as paid');
                                    }
                                  }
                                }}
                                style={{ background: '#10b981', padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '8px', display: 'inline-flex' }}
                              >
                                Mark Paid
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {isLedgerModalOpen && activeParty && (() => {
        const partyTransactions = transactions.filter(t => t.customer === activeParty.name || t.seller === activeParty.name);
        
        return (
          <div className="modal-overlay" onClick={() => setIsLedgerModalOpen(false)}>
            <div className="modal-content glass-morphism animate-slideUp" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
              <div className="card-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Users size={22} color="var(--admin-primary)" />
                  Ledger History: {activeParty.name}
                </h3>
                <button className="icon-btn" onClick={() => setIsLedgerModalOpen(false)}><X size={20} /></button>
              </div>

              <div style={{ marginTop: '1.5rem', maxHeight: '450px', overflowY: 'auto' }} className="admin-table-container">
                {partyTransactions.length === 0 ? (
                  <p style={{ color: 'var(--admin-text-dim)', textAlign: 'center', padding: '2rem' }}>
                    No transactions recorded for this {activeTab === 'customers' ? 'customer' : 'seller'}.
                  </p>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Bill ID</th>
                        <th>Type</th>
                        <th>Total Amount</th>
                        <th>Payment Mode</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partyTransactions.map(tx => (
                        <tr key={tx.id}>
                          <td>{tx.date}</td>
                          <td><code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{tx.id.substring(0, 8)}</code></td>
                          <td>
                            <span className="category-badge" style={{ background: tx.type === 'sale' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: tx.type === 'sale' ? '#34d399' : '#f87171' }}>
                              {tx.type.toUpperCase()}
                            </span>
                          </td>
                          <td><strong>₹{tx.amount.toLocaleString()}</strong></td>
                          <td style={{ textTransform: 'capitalize' }}>{tx.payment_mode || tx.paymentMode}</td>
                          <td>
                            <span className={`status-badge ${tx.status === 'paid' ? 'paid' : 'pending'}`}>
                              {tx.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                              <button 
                                onClick={() => {
                                  setEditingTx(tx);
                                  setEditTxData({
                                    customer: tx.customer || '',
                                    seller: tx.seller || '',
                                    date: tx.date || new Date().toISOString().split('T')[0],
                                    amount: tx.amount,
                                    payment_mode: tx.payment_mode || tx.paymentMode || 'cash',
                                    status: tx.status || 'paid'
                                  });
                                }}
                                style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Edit Bill"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                onClick={async () => {
                                  if (window.confirm('Are you sure you want to permanently delete this bill? This cannot be undone.')) {
                                    const { success } = await deleteTransaction(tx.id);
                                    if (success) {
                                      alert('Bill deleted successfully!');
                                    } else {
                                      alert('Failed to delete bill');
                                    }
                                  }
                                }}
                                style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Delete Bill"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {editingTx && (
        <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setEditingTx(null)}>
          <div className="modal-content glass-morphism animate-slideUp" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%' }}>
            <div className="card-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Edit2 size={22} color="var(--admin-primary)" />
                Edit Bill: {editingTx.id.substring(0, 8)}
              </h3>
              <button className="icon-btn" onClick={() => setEditingTx(null)}><X size={20} /></button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const updates = {
                customer: editingTx.type === 'sale' ? editTxData.customer : null,
                seller: editingTx.type === 'purchase' ? editTxData.seller : null,
                date: editTxData.date,
                amount: Number(editTxData.amount),
                payment_mode: editTxData.payment_mode,
                status: editTxData.status
              };
              
              const { success } = await updateTransaction(editingTx.id, updates);
              if (success) {
                alert('Bill updated successfully!');
                setEditingTx(null);
              } else {
                alert('Failed to update bill');
              }
            }} className="form-grid" style={{ marginTop: '1.25rem' }}>
              
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>{editingTx.type === 'sale' ? 'Customer Name' : 'Seller Name'}</label>
                <input 
                  type="text"
                  required
                  value={editingTx.type === 'sale' ? editTxData.customer : editTxData.seller}
                  onChange={e => setEditTxData(prev => ({
                    ...prev,
                    [editingTx.type === 'sale' ? 'customer' : 'seller']: e.target.value
                  }))}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Date</label>
                <input 
                  type="date"
                  required
                  value={editTxData.date}
                  onChange={e => setEditTxData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Total Amount (₹)</label>
                <input 
                  type="number"
                  required
                  value={editTxData.amount}
                  onChange={e => setEditTxData(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>Payment Mode</label>
                <select 
                  value={editTxData.payment_mode}
                  onChange={e => setEditTxData(prev => ({ ...prev, payment_mode: e.target.value }))}
                >
                  <option value="cash">Cash</option>
                  <option value="credit">Credit</option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select 
                  value={editTxData.status}
                  onChange={e => setEditTxData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <button type="submit" className="glass-btn" style={{ gridColumn: 'span 2', marginTop: '1.5rem', background: 'var(--admin-primary)', justifyContent: 'center', padding: '1rem' }}>
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCRM;
