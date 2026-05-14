import React, { useState } from 'react';
import { 
  Plus,
  X,
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet,
  Search
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { useAuth } from '../../context/AuthContext';
import './AdminPages.css';

const AdminAccounting = () => {
  const { accounting, addAccountingEntry, transactions } = useERP();
  const { currentUser } = useAuth();
  
  const allCategories = {
    receipts: ['Customer Payment', 'Loan', 'Other Income'],
    payments: ['Supplier Payment', 'Loan Repayment', 'Utility'],
    expenses: ['Rent', 'Salary', 'Electricity', 'Transport', 'Marketing', 'Tea/Snacks', 'Other'],
    income: ['Interest', 'Commission', 'Scrap Sale', 'Other']
  };

  // Filter categories based on permissions
  const categories = Object.keys(allCategories).reduce((acc, key) => {
    const isIncomeType = key === 'receipts' || key === 'income';
    const isExpenseType = key === 'payments' || key === 'expenses';
    
    if (currentUser?.role === 'admin') {
      acc[key] = allCategories[key];
    } else {
      if (isIncomeType && currentUser?.permissions?.includes('income')) {
        acc[key] = allCategories[key];
      }
      if (isExpenseType && currentUser?.permissions?.includes('expense')) {
        acc[key] = allCategories[key];
      }
    }
    return acc;
  }, {});

  const [activeTab, setActiveTab] = useState(Object.keys(categories)[0] || 'receipts');
  const [showModal, setShowModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ description: '', amount: '', party: '', category: 'General' });

  const handleSubmit = (e) => {
    e.preventDefault();
    addAccountingEntry(activeTab, {
      ...newEntry,
      amount: Number(newEntry.amount)
    });
    setNewEntry({ description: '', amount: '', party: '', category: 'General' });
    setShowModal(false);
  };

  const totalSales = transactions.filter(t => t.type === 'sale').reduce((acc, t) => acc + t.amount, 0);
  const totalPurchases = transactions.filter(t => t.type === 'purchase').reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = accounting.expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalIncome = totalSales + accounting.income.reduce((acc, i) => acc + i.amount, 0);
  
  const netProfit = totalIncome - totalPurchases - totalExpenses;

  const entries = accounting[activeTab] || [];

  return (
    <div className="admin-accounting">
      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="admin-card">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <ArrowUpCircle size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-dim)' }}>Total Revenue</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>₹{totalIncome.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="admin-card">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              <ArrowDownCircle size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-dim)' }}>Total Outflow</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>₹{(totalPurchases + totalExpenses).toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="admin-card">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
              <Wallet size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-dim)' }}>Daily/Net Profit</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: netProfit >= 0 ? '#10b981' : '#ef4444' }}>
                ₹{netProfit.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="tabs-header" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        {Object.keys(categories).map(tab => (
          <button 
            key={tab}
            className={`glass-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            style={{ 
              background: activeTab === tab ? 'var(--admin-primary)' : 'rgba(255,255,255,0.05)',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="inventory-controls">
        <h2 style={{ color: 'white', textTransform: 'capitalize' }}>{activeTab} Log</h2>
        <button className="glass-btn" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Record {activeTab.slice(0, -1)}
        </button>
      </div>

      <div className="admin-card admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>{activeTab === 'receipts' || activeTab === 'payments' ? 'Party' : 'Category'}</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(entry => (
              <tr key={entry.id}>
                <td>{entry.date}</td>
                <td>{entry.description}</td>
                <td>{entry.party || entry.category}</td>
                <td style={{ fontWeight: 'bold', color: activeTab === 'receipts' || activeTab === 'income' ? '#10b981' : '#ef4444' }}>
                  ₹{entry.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-dim)' }}>
            No records found for this category.
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content glass-morphism" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="card-header">
              <h3 style={{ textTransform: 'capitalize' }}>Record {activeTab.slice(0, -1)}</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Description</label>
                <input 
                  type="text" 
                  required 
                  value={newEntry.description} 
                  onChange={e => setNewEntry({...newEntry, description: e.target.value})}
                  placeholder="e.g. Monthly Rent"
                />
              </div>
              <div className="form-group">
                <label>Amount (₹)</label>
                <input 
                  type="number" 
                  required 
                  value={newEntry.amount} 
                  onChange={e => setNewEntry({...newEntry, amount: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={newEntry.category} onChange={e => setNewEntry({...newEntry, category: e.target.value})}>
                  {categories[activeTab].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              {(activeTab === 'receipts' || activeTab === 'payments') && (
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Party Name</label>
                  <input 
                    type="text" 
                    value={newEntry.party} 
                    onChange={e => setNewEntry({...newEntry, party: e.target.value})}
                    placeholder="Enter customer or supplier name"
                  />
                </div>
              )}
              <button type="submit" className="glass-btn" style={{ gridColumn: 'span 2', marginTop: '1rem', justifyContent: 'center' }}>
                Save Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccounting;
