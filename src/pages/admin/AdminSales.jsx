import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Download, 
  FileText,
  User,
  Package,
  Calendar,
  ShoppingCart,
  Edit2,
  X,
  Search
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useERP } from '../../context/ERPContext';
import { useAuth } from '../../context/AuthContext';
import './AdminPages.css';

const AdminSales = () => {
  const { products, customers, addTransaction, transactions, deleteTransaction, updateTransaction } = useERP();
  const { currentUser } = useAuth();
  
  // Tab: 'create' | 'history'
  const [activeTab, setActiveTab] = useState('create');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [dueDays, setDueDays] = useState(30);
  const [items, setItems] = useState([{ productId: '', quantity: 1, price: 0 }]);
  const [gstRate, setGstRate] = useState(18);

  // History search & edit/delete
  const [historySearch, setHistorySearch] = useState('');
  const [editingTx, setEditingTx] = useState(null);
  const [editForm, setEditForm] = useState({});

  const addItem = () => setItems([...items, { productId: '', quantity: 1, price: 0 }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const handleProductChange = (index, productId) => {
    const product = products.find(p => p.id === Number(productId));
    const rememberedPrices = JSON.parse(localStorage.getItem('last_billed_prices') || '{}');
    const rememberedPrice = rememberedPrices[productId];
    const defaultPrice = rememberedPrice !== undefined ? rememberedPrice : (product && product.price !== null ? product.price : 0);
    const newItems = [...items];
    newItems[index] = { productId, quantity: 1, price: defaultPrice, name: product ? product.name : '' };
    setItems(newItems);
  };

  const calculateSubtotal = () => items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const calculateGST = () => (calculateSubtotal() * gstRate) / 100;
  const calculateTotal = () => calculateSubtotal() + calculateGST();

  const buildPDF = (txData) => {
    const doc = new jsPDF();
    const subtotal = (txData.items || []).reduce((a, i) => a + (i.price * i.quantity), 0);
    const gst = (subtotal * (txData.gstRate || 18)) / 100;
    const total = txData.amount || (subtotal + gst);

    doc.setFontSize(22);
    doc.setTextColor(99, 102, 241);
    doc.text('SHREE SHYAM PACKAGING', 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('GSTIN: 24ABCDE1234F1Z5', 14, 30);
    doc.text('GIDC Industrial Estate, Rajkot, Gujarat', 14, 35);

    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('SALES INVOICE', 140, 22);
    doc.setFontSize(10);
    doc.text(`Invoice No: INV-${String(txData.id || Date.now()).slice(-6)}`, 140, 30);
    doc.text(`Date: ${txData.date || new Date().toLocaleDateString()}`, 140, 35);
    doc.text(`Mode: ${(txData.paymentMode || 'cash').toUpperCase()}`, 140, 40);

    doc.setFontSize(12);
    doc.text('Bill To:', 14, 50);
    doc.setFontSize(10);
    doc.text(txData.customer || 'Walk-in Customer', 14, 57);

    const tableData = (txData.items || []).map((item, index) => [
      index + 1,
      item.name || 'Product',
      item.quantity,
      `INR ${Number(item.price || 0).toLocaleString()}`,
      `INR ${(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: 65,
      head: [['#', 'Description', 'Qty', 'Unit Price', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Subtotal: INR ${subtotal.toLocaleString()}`, 140, finalY);
    doc.text(`GST: INR ${gst.toFixed(2)}`, 140, finalY + 7);
    doc.setFontSize(12);
    doc.text(`Total: INR ${Number(total).toLocaleString()}`, 140, finalY + 15);
    return doc;
  };

  const generatePDF = () => {
    const subtotal = calculateSubtotal();
    const gst = calculateGST();
    const total = calculateTotal();

    const txData = {
      type: 'sale',
      customer: selectedCustomer,
      amount: total,
      status: paymentMode === 'cash' ? 'paid' : 'pending',
      paymentMode,
      dueDays: paymentMode === 'credit' ? dueDays : 0,
      items,
      gstRate,
      date: new Date().toLocaleDateString()
    };

    const doc = buildPDF(txData);
    doc.save(`Invoice_${Date.now()}.pdf`);
    
    addTransaction({ ...txData, items });

    const rememberedPrices = JSON.parse(localStorage.getItem('last_billed_prices') || '{}');
    items.forEach(item => {
      if (item.productId && item.price !== undefined) {
        rememberedPrices[item.productId] = item.price;
      }
    });
    localStorage.setItem('last_billed_prices', JSON.stringify(rememberedPrices));

    alert('Invoice saved and sale transaction recorded!');
    setItems([{ productId: '', quantity: 1, price: 0 }]);
    setSelectedCustomer('');
  };

  const handleReprintPDF = (tx) => {
    const doc = buildPDF(tx);
    doc.save(`Invoice_Reprint_${tx.id || Date.now()}.pdf`);
  };

  const handleDeleteTx = async (id) => {
    if (!window.confirm('Delete this sale invoice permanently?')) return;
    await deleteTransaction(id);
  };

  const openEditTx = (tx) => {
    setEditingTx(tx);
    setEditForm({
      customer: tx.customer || '',
      date: tx.date || '',
      amount: tx.amount || 0,
      paymentMode: tx.paymentMode || 'cash',
      status: tx.status || 'paid'
    });
  };

  const handleSaveEdit = async () => {
    await updateTransaction(editingTx.id, editForm);
    setEditingTx(null);
  };

  const filteredSales = transactions
    .filter(t => t.type === 'sale')
    .filter(t => !historySearch || (t.customer || '').toLowerCase().includes(historySearch.toLowerCase()))
    .sort((a, b) => b.id - a.id);

  return (
    <div className="admin-billing">
      {/* Tab Navigation */}
      <div className="billing-tabs">
        <button
          className={`billing-tab-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => { setActiveTab('create'); }}
        >
          <Plus size={16} /> Create Sales Invoice
        </button>
        <button
          className={`billing-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => { setActiveTab('history'); setHistorySearch(''); }}
        >
          <ShoppingCart size={16} /> Sales Invoice History
        </button>
      </div>

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="admin-card glass-morphism animate-fadeIn">
          <div className="card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShoppingCart size={22} color="var(--admin-primary)" />
              Sales Invoices
            </h3>
            <span className="category-badge" style={{ fontSize: '0.9rem', padding: '0.4rem 0.9rem' }}>
              {filteredSales.length} bills
            </span>
          </div>

          <div className="billing-history-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search sales by customer name…"
              value={historySearch}
              onChange={e => setHistorySearch(e.target.value)}
            />
          </div>

          <div className="admin-table-container" style={{ marginTop: '1rem' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--admin-text-dim)' }}>
                      No sales invoices found.
                    </td>
                  </tr>
                ) : filteredSales.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ color: 'var(--admin-text-dim)', fontSize: '0.8rem' }}>
                      INV-{String(tx.id || '').slice(-6)}
                    </td>
                    <td>{tx.date || '—'}</td>
                    <td style={{ fontWeight: 600 }}>{tx.customer || 'Walk-in'}</td>
                    <td style={{ color: 'var(--admin-success)', fontWeight: 700 }}>
                      ₹{Number(tx.amount || 0).toLocaleString()}
                    </td>
                    <td>
                      <span className="category-badge" style={{ background: tx.paymentMode === 'cash' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: tx.paymentMode === 'cash' ? '#34d399' : '#fbbf24' }}>
                        {tx.paymentMode || 'cash'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${tx.status === 'paid' ? 'paid' : 'pending'}`}>
                        {tx.status || 'paid'}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="icon-btn" title="Reprint PDF" style={{ color: 'var(--admin-primary)' }} onClick={() => handleReprintPDF(tx)}>
                          <Download size={15} />
                        </button>
                        <button className="icon-btn" title="Edit" style={{ color: '#a78bfa' }} onClick={() => openEditTx(tx)}>
                          <Edit2 size={15} />
                        </button>
                        <button className="icon-btn" title="Delete" style={{ color: 'var(--admin-danger)' }} onClick={() => handleDeleteTx(tx.id)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Tab */}
      {activeTab === 'create' && (
        <div className="admin-card glass-morphism animate-fadeIn">
          <div className="card-header">
            <div className="title-area">
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Create New Sales Invoice</h3>
              <p style={{ color: 'var(--admin-text-dim)', fontSize: '0.9rem' }}>Generate professional sales tax invoices instantly</p>
            </div>
          </div>

          <div className="billing-form-top form-grid" style={{ marginBottom: '3rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid var(--admin-border)' }}>
            <div className="form-group">
              <label><User size={16} color="var(--admin-primary)" /> Customer</label>
              <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}>
                <option value="">Select Customer</option>
                {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label><Calendar size={16} color="var(--admin-primary)" /> Invoice Date</label>
              <input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="form-group">
              <label><Package size={16} color="var(--admin-primary)" /> Payment Mode</label>
              <div className="mode-toggle">
                <button
                  type="button"
                  onClick={() => setPaymentMode('cash')}
                  className={paymentMode === 'cash' ? 'mode-active' : 'mode-inactive'}
                >Cash</button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('credit')}
                  className={paymentMode === 'credit' ? 'mode-active mode-credit' : 'mode-inactive'}
                >Credit</button>
              </div>
            </div>
            {paymentMode === 'credit' && (
              <div className="form-group animate-slideIn">
                <label>Due Days</label>
                <input type="number" value={dueDays} onChange={e => setDueDays(Number(e.target.value))} />
              </div>
            )}
          </div>

          {/* Items */}
          <div className="billing-items">
            <div className="items-header">
              <span>Item Description</span>
              <span>Qty</span>
              <span>Unit Price</span>
              <span>Total</span>
              <span></span>
            </div>
            <div className="items-list">
              {items.map((item, index) => (
                <div key={index} className="item-row">
                  <select value={item.productId} onChange={e => handleProductChange(index, e.target.value)}>
                    <option value="">Select Product</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input
                    type="number"
                    value={item.quantity}
                    placeholder="Qty"
                    onChange={e => {
                      const newItems = [...items];
                      newItems[index].quantity = Number(e.target.value);
                      setItems(newItems);
                    }}
                  />
                  <input
                    type="number"
                    value={item.price}
                    placeholder="Price"
                    onChange={e => {
                      const newItems = [...items];
                      newItems[index].price = Number(e.target.value);
                      setItems(newItems);
                    }}
                  />
                  <div className="item-total">₹{(item.price * item.quantity).toLocaleString()}</div>
                  <button className="icon-btn" style={{ color: 'var(--admin-danger)', background: 'rgba(239,68,68,0.1)', border: 'none' }} onClick={() => removeItem(index)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <button className="glass-btn add-item-btn" onClick={addItem}>
              <Plus size={20} /> Add Another Item
            </button>
          </div>

          {/* Summary */}
          <div className="billing-summary">
            <div className="summary-card">
              <div className="summary-row">
                <span style={{ color: 'var(--admin-text-dim)' }}>Subtotal:</span>
                <span style={{ fontWeight: 600 }}>₹{calculateSubtotal().toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span style={{ color: 'var(--admin-text-dim)' }}>Tax Rate (GST %):</span>
                <input
                  type="number"
                  value={gstRate}
                  onChange={e => setGstRate(Number(e.target.value))}
                  style={{ width: '80px', padding: '8px 12px', textAlign: 'right', borderRadius: '8px' }}
                />
              </div>
              <div className="summary-total">
                <span>Total:</span>
                <span style={{ color: 'var(--admin-primary)', textShadow: '0 0 20px var(--admin-primary-glow)' }}>
                  ₹{calculateTotal().toLocaleString()}
                </span>
              </div>
              <button className="glass-btn submit-btn-premium" onClick={generatePDF}>
                <Download size={22} />
                Finalize & Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTx && (
        <div className="modal-overlay" onClick={() => setEditingTx(null)}>
          <div className="modal-content glass-morphism animate-slideUp" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="card-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Edit2 size={20} color="var(--admin-primary)" /> Edit Sales Invoice
              </h3>
              <button className="icon-btn" onClick={() => setEditingTx(null)}><X size={20} /></button>
            </div>
            <div className="form-grid" style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label>Customer Name</label>
                <input type="text" value={editForm.customer} onChange={e => setEditForm({ ...editForm, customer: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="text" value={editForm.date} onChange={e => setEditForm({ ...editForm, date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Total Amount (₹)</label>
                <input type="number" value={editForm.amount} onChange={e => setEditForm({ ...editForm, amount: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label>Payment Mode</label>
                <select value={editForm.paymentMode} onChange={e => setEditForm({ ...editForm, paymentMode: e.target.value })}>
                  <option value="cash">Cash</option>
                  <option value="credit">Credit</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Status</label>
                <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <button
                className="glass-btn"
                style={{ gridColumn: 'span 2', background: 'var(--admin-primary)', justifyContent: 'center', padding: '1rem', marginTop: '1rem' }}
                onClick={handleSaveEdit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSales;
