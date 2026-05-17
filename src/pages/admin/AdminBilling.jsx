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
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useERP } from '../../context/ERPContext';
import { useAuth } from '../../context/AuthContext';
import './AdminPages.css';

const AdminBilling = () => {
  const { products, customers, addTransaction, updateProduct } = useERP();
  const { currentUser } = useAuth();
  
  const canSale = currentUser?.role === 'admin' || currentUser?.permissions?.includes('sale');
  const canPurchase = currentUser?.role === 'admin' || currentUser?.permissions?.includes('purchase');

  const [invoiceType, setInvoiceType] = useState(canSale ? 'sale' : 'purchase'); // sale or purchase
  const [paymentMode, setPaymentMode] = useState('cash'); // cash or credit
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [dueDays, setDueDays] = useState(30);
  const [items, setItems] = useState([{ productId: '', quantity: 1, price: 0 }]);
  const [gstRate, setGstRate] = useState(18);

  const addItem = () => setItems([...items, { productId: '', quantity: 1, price: 0 }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const handleProductChange = (index, productId) => {
    const product = products.find(p => p.id === Number(productId));
    
    // Retrieve the locally remembered price for this product, if any
    const rememberedPrices = JSON.parse(localStorage.getItem('last_billed_prices') || '{}');
    const rememberedPrice = rememberedPrices[productId];
    
    // Default to remembered price if present, otherwise fall back to product's retail price
    const defaultPrice = rememberedPrice !== undefined ? rememberedPrice : (product && product.price !== null ? product.price : 0);

    const newItems = [...items];
    newItems[index] = { 
      productId, 
      quantity: 1, 
      price: defaultPrice,
      name: product ? product.name : ''
    };
    setItems(newItems);
  };

  const calculateSubtotal = () => items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const calculateGST = () => (calculateSubtotal() * gstRate) / 100;
  const calculateTotal = () => calculateSubtotal() + calculateGST();

  const generatePDF = () => {
    if (invoiceType === 'sale' && !canSale) return alert('No permission to create sales');
    if (invoiceType === 'purchase' && !canPurchase) return alert('No permission to create purchases');
    
    const doc = new jsPDF();
    const subtotal = calculateSubtotal();
    const gst = calculateGST();
    const total = calculateTotal();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(99, 102, 241);
    doc.text('SHREE SHYAM PACKAGING', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('GSTIN: 24ABCDE1234F1Z5', 14, 30);
    doc.text('GIDC Industrial Estate, Rajkot, Gujarat', 14, 35);

    // Invoice Info
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(`${invoiceType === 'sale' ? 'SALES' : 'PURCHASE'} INVOICE`, 140, 22);
    doc.setFontSize(10);
    doc.text(`Invoice No: ${invoiceType === 'sale' ? 'INV' : 'PUR'}-${Date.now().toString().slice(-6)}`, 140, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 35);
    doc.text(`Mode: ${paymentMode.toUpperCase()}`, 140, 40);

    // Customer
    doc.setFontSize(12);
    doc.text(invoiceType === 'sale' ? 'Bill To:' : 'Vendor:', 14, 50);
    doc.setFontSize(10);
    doc.text(selectedCustomer || 'Walk-in Customer', 14, 57);

    // Table
    const tableData = items.map((item, index) => [
      index + 1,
      item.name || 'Product',
      item.quantity,
      `INR ${item.price.toLocaleString()}`,
      `INR ${(item.price * item.quantity).toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: 65,
      head: [['#', 'Description', 'Qty', 'Unit Price', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] }
    });

    // Totals
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Subtotal: INR ${subtotal.toLocaleString()}`, 140, finalY);
    doc.text(`GST (${gstRate}%): INR ${gst.toLocaleString()}`, 140, finalY + 7);
    doc.setFontSize(12);
    doc.text(`Total: INR ${total.toLocaleString()}`, 140, finalY + 15);

    doc.save(`Invoice_${Date.now()}.pdf`);
    
    // Add to transactions
    addTransaction({
      type: invoiceType,
      customer: selectedCustomer,
      amount: total,
      status: paymentMode === 'cash' ? 'paid' : 'pending',
      paymentMode: paymentMode,
      dueDays: paymentMode === 'credit' ? dueDays : 0,
      items: items
    });

    // Automatically update locally remembered product prices based on this bill so the next bill gets the same default price
    if (invoiceType === 'sale') {
      const rememberedPrices = JSON.parse(localStorage.getItem('last_billed_prices') || '{}');
      items.forEach(item => {
        if (item.productId && item.price !== undefined) {
          rememberedPrices[item.productId] = item.price;
        }
      });
      localStorage.setItem('last_billed_prices', JSON.stringify(rememberedPrices));
    }

    alert('Invoice saved and transaction recorded!');
  };

  return (
    <div className="admin-billing">
      <div className="admin-card glass-morphism animate-fadeIn">
        <div className="card-header">
          <div className="title-area">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Create New {invoiceType === 'sale' ? 'Sales' : 'Purchase'} Invoice</h3>
            <p style={{ color: 'var(--admin-text-dim)', fontSize: '0.9rem' }}>Generate professional tax invoices instantly</p>
          </div>
          <div className="type-switch" style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
            {canSale && (
              <button 
                className={`glass-btn ${invoiceType === 'sale' ? 'active' : ''}`} 
                onClick={() => setInvoiceType('sale')}
                style={{ padding: '0.6rem 1.5rem', borderRadius: '12px' }}
              >
                Sales
              </button>
            )}
            {canPurchase && (
              <button 
                className={`glass-btn ${invoiceType === 'purchase' ? 'active' : ''}`} 
                onClick={() => setInvoiceType('purchase')}
                style={{ padding: '0.6rem 1.5rem', borderRadius: '12px' }}
              >
                Purchase
              </button>
            )}
          </div>
        </div>

        <div className="billing-form-top form-grid" style={{ marginBottom: '3rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid var(--admin-border)' }}>
          <div className="form-group">
            <label><User size={16} color="var(--admin-primary)" /> {invoiceType === 'sale' ? 'Customer' : 'Seller'}</label>
            <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
              <option value="">Select {invoiceType === 'sale' ? 'Customer' : 'Seller'}</option>
              {invoiceType === 'sale' 
                ? customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)
                : <option value="Main Supplier">Main Supplier</option>
              }
            </select>
          </div>
          <div className="form-group">
            <label><Calendar size={16} color="var(--admin-primary)" /> Invoice Date</label>
            <input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="form-group">
            <label><Package size={16} color="var(--admin-primary)" /> Payment Mode</label>
            <div className="mode-toggle" style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '6px' }}>
              <button 
                onClick={() => setPaymentMode('cash')}
                style={{ 
                  flex: 1, 
                  padding: '10px', 
                  borderRadius: '10px', 
                  border: 'none', 
                  background: paymentMode === 'cash' ? 'var(--admin-primary)' : 'transparent', 
                  color: 'white', 
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                Cash
              </button>
              <button 
                onClick={() => setPaymentMode('credit')}
                style={{ 
                  flex: 1, 
                  padding: '10px', 
                  borderRadius: '10px', 
                  border: 'none', 
                  background: paymentMode === 'credit' ? 'var(--admin-danger)' : 'transparent', 
                  color: 'white', 
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                Credit
              </button>
            </div>
          </div>
          {paymentMode === 'credit' && (
            <div className="form-group animate-slideIn">
              <label>Due Days</label>
              <input type="number" value={dueDays} onChange={(e) => setDueDays(Number(e.target.value))} />
            </div>
          )}
        </div>

        <div className="billing-items">
          <div className="items-header" style={{ 
            display: 'grid', 
            gridTemplateColumns: '2.5fr 1fr 1fr 1fr 60px', 
            gap: '1.5rem', 
            padding: '1rem', 
            background: 'rgba(255,255,255,0.03)', 
            borderRadius: '12px',
            color: 'var(--admin-text-dim)', 
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontWeight: '700'
          }}>
            <span>Item Description</span>
            <span>Quantity</span>
            <span>Unit Price</span>
            <span>Total</span>
            <span></span>
          </div>
          
          <div className="items-list" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map((item, index) => (
              <div key={index} className="item-row" style={{ 
                display: 'grid', 
                gridTemplateColumns: '2.5fr 1fr 1fr 1fr 60px', 
                gap: '1.5rem', 
                alignItems: 'center',
                padding: '1.25rem',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '16px',
                border: '1px solid var(--admin-border)',
                transition: 'all 0.3s ease'
              }}>
                <select value={item.productId} onChange={(e) => handleProductChange(index, e.target.value)}>
                  <option value="">Select Product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input 
                  type="number" 
                  value={item.quantity} 
                  placeholder="Qty"
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index].quantity = Number(e.target.value);
                    setItems(newItems);
                  }}
                />
                <input 
                  type="number" 
                  value={item.price} 
                  placeholder="Price"
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index].price = Number(e.target.value);
                    setItems(newItems);
                  }}
                />
                <div style={{ 
                  padding: '0.875rem', 
                  background: 'rgba(99, 102, 241, 0.1)', 
                  borderRadius: '12px', 
                  color: 'var(--admin-primary)',
                  fontWeight: '700',
                  textAlign: 'center'
                }}>
                  ₹{(item.price * item.quantity).toLocaleString()}
                </div>
                <button 
                  className="icon-btn" 
                  style={{ color: 'var(--admin-danger)', background: 'rgba(239, 68, 68, 0.1)', border: 'none' }} 
                  onClick={() => removeItem(index)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <button 
            className="glass-btn" 
            onClick={addItem} 
            style={{ 
              marginTop: '1.5rem', 
              color: 'var(--admin-primary)', 
              background: 'rgba(99, 102, 241, 0.05)',
              border: '1px dashed var(--admin-primary)',
              width: '100%',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <Plus size={20} /> Add Another Item
          </button>
        </div>

        <div className="billing-summary" style={{ 
          marginTop: '4rem', 
          padding: '2.5rem', 
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.4))', 
          borderRadius: '32px', 
          border: '1px solid var(--admin-border)',
          display: 'flex', 
          justifyContent: 'flex-end' 
        }}>
          <div className="summary-card" style={{ width: '360px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
              <span style={{ color: 'var(--admin-text-dim)' }}>Subtotal:</span>
              <span style={{ fontWeight: '600' }}>₹{calculateSubtotal().toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--admin-text-dim)' }}>Tax Rate (GST %):</span>
              <div style={{ position: 'relative', width: '80px' }}>
                <input 
                  type="number" 
                  value={gstRate} 
                  onChange={(e) => setGstRate(Number(e.target.value))} 
                  style={{ width: '100%', padding: '8px 12px', textAlign: 'right', borderRadius: '8px' }}
                />
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '1.75rem', 
              fontWeight: '800', 
              borderTop: '1px solid var(--admin-border)', 
              paddingTop: '1.5rem',
              marginTop: '0.5rem'
            }}>
              <span>Total:</span>
              <span style={{ color: 'var(--admin-primary)', textShadow: '0 0 20px var(--admin-primary-glow)' }}>
                ₹{calculateTotal().toLocaleString()}
              </span>
            </div>
            <button 
              className="glass-btn submit-btn-premium" 
              style={{ 
                marginTop: '1.5rem', 
                width: '100%', 
                justifyContent: 'center', 
                padding: '1.25rem',
                fontSize: '1.1rem',
                background: 'var(--admin-primary)',
                boxShadow: '0 10px 25px -5px var(--admin-primary-glow)'
              }} 
              onClick={generatePDF}
            >
              <Download size={22} />
              Finalize & Print Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBilling;
// Force Vite HMR reload
