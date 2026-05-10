import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Download, 
  FileText,
  User,
  Package,
  Calendar
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useERP } from '../../context/ERPContext';
import './AdminPages.css';

const AdminBilling = () => {
  const { products, customers, addTransaction } = useERP();
  const [invoiceType, setInvoiceType] = useState('sale'); // sale or purchase
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 1, price: 0 }]);
  const [gstRate, setGstRate] = useState(18);

  const addItem = () => setItems([...items, { productId: '', quantity: 1, price: 0 }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const handleProductChange = (index, productId) => {
    const product = products.find(p => p.id === Number(productId));
    const newItems = [...items];
    newItems[index] = { 
      productId, 
      quantity: 1, 
      price: product ? product.price : 0,
      name: product ? product.name : ''
    };
    setItems(newItems);
  };

  const calculateSubtotal = () => items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const calculateGST = () => (calculateSubtotal() * gstRate) / 100;
  const calculateTotal = () => calculateSubtotal() + calculateGST();

  const generatePDF = () => {
    const doc = new jsPDF();
    const subtotal = calculateSubtotal();
    const gst = calculateGST();
    const total = calculateTotal();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(99, 102, 241);
    doc.text('PACKAGING STORE', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('GSTIN: 24AAAAA0000A1Z5', 14, 30);
    doc.text('123 Packaging Hub, Industrial Area, Gujarat', 14, 35);

    // Invoice Info
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('TAX INVOICE', 140, 22);
    doc.setFontSize(10);
    doc.text(`Invoice No: INV-${Date.now().toString().slice(-6)}`, 140, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 35);

    // Customer
    doc.setFontSize(12);
    doc.text('Bill To:', 14, 50);
    doc.setFontSize(10);
    doc.text(selectedCustomer || 'Cash Customer', 14, 57);

    // Table
    const tableData = items.map((item, index) => [
      index + 1,
      item.name || 'Product',
      item.quantity,
      `INR ${item.price}`,
      `INR ${item.price * item.quantity}`
    ]);

    doc.autoTable({
      startY: 65,
      head: [['#', 'Description', 'Qty', 'Unit Price', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] }
    });

    // Totals
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Subtotal: INR ${subtotal}`, 140, finalY);
    doc.text(`GST (${gstRate}%): INR ${gst}`, 140, finalY + 7);
    doc.setFontSize(12);
    doc.text(`Total: INR ${total}`, 140, finalY + 15);

    doc.save(`Invoice_${Date.now()}.pdf`);
    
    // Add to transactions
    addTransaction({
      type: invoiceType,
      customer: selectedCustomer,
      amount: total,
      status: 'paid'
    });
  };

  return (
    <div className="admin-billing">
      <div className="admin-card">
        <div className="card-header">
          <h3>Create New {invoiceType === 'sale' ? 'Sales' : 'Purchase'} Invoice</h3>
          <div className="type-switch">
            <button 
              className={`glass-btn ${invoiceType === 'sale' ? 'active' : ''}`} 
              onClick={() => setInvoiceType('sale')}
              style={{ background: invoiceType === 'sale' ? 'var(--admin-primary)' : 'rgba(255,255,255,0.05)' }}
            >
              Sales
            </button>
            <button 
              className={`glass-btn ${invoiceType === 'purchase' ? 'active' : ''}`} 
              onClick={() => setInvoiceType('purchase')}
              style={{ background: invoiceType === 'purchase' ? 'var(--admin-primary)' : 'rgba(255,255,255,0.05)', marginLeft: '0.5rem' }}
            >
              Purchase
            </button>
          </div>
        </div>

        <div className="billing-form-top form-grid" style={{ marginBottom: '2rem' }}>
          <div className="form-group">
            <label><User size={14} style={{ marginRight: '4px' }} /> {invoiceType === 'sale' ? 'Customer' : 'Seller'}</label>
            <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
              <option value="">Select {invoiceType === 'sale' ? 'Customer' : 'Seller'}</option>
              {invoiceType === 'sale' 
                ? customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)
                : <option value="Main Supplier">Main Supplier</option>
              }
            </select>
          </div>
          <div className="form-group">
            <label><Calendar size={14} style={{ marginRight: '4px' }} /> Invoice Date</label>
            <input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
        </div>

        <div className="billing-items">
          <div className="items-header" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 40px', gap: '1rem', padding: '0.5rem', borderBottom: '1px solid var(--admin-border)', color: 'var(--admin-text-dim)', fontSize: '0.875rem' }}>
            <span>Item Description</span>
            <span>Quantity</span>
            <span>Unit Price</span>
            <span>Total</span>
            <span></span>
          </div>
          
          <div className="items-list" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map((item, index) => (
              <div key={index} className="item-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 40px', gap: '1rem', alignItems: 'center' }}>
                <select value={item.productId} onChange={(e) => handleProductChange(index, e.target.value)}>
                  <option value="">Select Product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input 
                  type="number" 
                  value={item.quantity} 
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index].quantity = Number(e.target.value);
                    setItems(newItems);
                  }}
                />
                <input 
                  type="number" 
                  value={item.price} 
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index].price = Number(e.target.value);
                    setItems(newItems);
                  }}
                />
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                  ₹{(item.price * item.quantity).toLocaleString()}
                </div>
                <button className="icon-btn" style={{ color: '#ef4444' }} onClick={() => removeItem(index)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <button className="text-btn" onClick={addItem} style={{ marginTop: '1rem', color: 'var(--admin-primary)', fontWeight: '600' }}>
            <Plus size={16} /> Add Another Item
          </button>
        </div>

        <div className="billing-summary" style={{ marginTop: '3rem', borderTop: '1px solid var(--admin-border)', paddingTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <div className="summary-card" style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--admin-text-dim)' }}>Subtotal:</span>
              <span>₹{calculateSubtotal().toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--admin-text-dim)' }}>GST (%):</span>
              <input 
                type="number" 
                value={gstRate} 
                onChange={(e) => setGstRate(Number(e.target.value))} 
                style={{ width: '60px', padding: '4px', textAlign: 'right' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '700', borderTop: '1px solid var(--admin-border)', paddingTop: '1rem' }}>
              <span>Grand Total:</span>
              <span style={{ color: 'var(--admin-primary)' }}>₹{calculateTotal().toLocaleString()}</span>
            </div>
            <button className="glass-btn" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }} onClick={generatePDF}>
              <Download size={18} />
              Save & Print Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBilling;
