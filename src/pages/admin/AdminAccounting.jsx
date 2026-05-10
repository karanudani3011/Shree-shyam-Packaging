import React from 'react';
import { 
  FileText, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet,
  Calendar,
  Filter
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import './AdminPages.css';

const AdminAccounting = () => {
  const { transactions } = useERP();

  const totalIncome = transactions.filter(t => t.type === 'sale').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'purchase').reduce((acc, t) => acc + t.amount, 0);
  const netProfit = totalIncome - totalExpense;

  return (
    <div className="admin-accounting">
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="admin-card">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <ArrowUpCircle size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-dim)' }}>Total Income</p>
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
              <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-dim)' }}>Total Expense</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>₹{totalExpense.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="admin-card">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
              <Wallet size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--admin-text-dim)' }}>Net Cash Flow</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: netProfit >= 0 ? '#10b981' : '#ef4444' }}>
                ₹{netProfit.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="card-header">
          <h3>General Ledger</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="glass-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', background: 'rgba(255,255,255,0.05)' }}>
              <Calendar size={16} /> Date Range
            </button>
            <button className="glass-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', background: 'rgba(255,255,255,0.05)' }}>
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Transaction ID</th>
                <th>Description / Party</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.date}</td>
                  <td><code>{tx.id}</code></td>
                  <td><strong>{tx.customer || tx.seller}</strong></td>
                  <td>
                    <span style={{ 
                      color: tx.type === 'sale' ? '#10b981' : '#ef4444',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      fontSize: '0.75rem'
                    }}>
                      {tx.type}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: '700' }}>₹{tx.amount.toLocaleString()}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${tx.status}`}>{tx.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAccounting;
