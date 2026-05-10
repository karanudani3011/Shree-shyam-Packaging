import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  QrCode as QrIcon, 
  Barcode as BarIcon, 
  Upload,
  X
} from 'lucide-react';
import QRCode from 'react-qr-code';
import Barcode from 'react-barcode';
import { useERP } from '../../context/ERPContext';
import './AdminPages.css';

const AdminInventory = () => {
  const { products, addProduct } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCodes, setShowCodes] = useState(null); // stores product for codes display

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Boxes',
    stock: 0,
    price: 0,
    cost: 0,
    sku: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addProduct(newProduct);
    setIsModalOpen(false);
    setNewProduct({ name: '', category: 'Boxes', stock: 0, price: 0, cost: 0, sku: '' });
  };

  return (
    <div className="admin-inventory">
      <div className="inventory-controls">
        <div className="search-wrapper" style={{ flex: 1, position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} size={20} />
          <input 
            type="text" 
            placeholder="Search by name or SKU..." 
            className="search-input" 
            style={{ paddingLeft: '45px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="glass-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Add Product
        </button>
        <button className="glass-btn" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--admin-border)' }}>
          <Upload size={18} />
          Import Excel
        </button>
      </div>

      <div className="admin-card admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Selling Price</th>
              <th>Cost Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id}>
                <td><code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{product.sku}</code></td>
                <td><strong>{product.name}</strong></td>
                <td>{product.category}</td>
                <td>
                  <span className={`stock-status ${product.stock < 100 ? 'low' : ''}`}>
                    {product.stock} units
                  </span>
                </td>
                <td>₹{product.price}</td>
                <td>₹{product.cost}</td>
                <td>
                  <div className="action-btns">
                    <button className="icon-btn" onClick={() => setShowCodes(product)} title="View Codes">
                      <QrIcon size={16} />
                    </button>
                    <button className="icon-btn" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button className="icon-btn" title="Delete" style={{ color: '#ef4444' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="card-header">
              <h3>Add New Product</h3>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Product Name</label>
                <input type="text" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>SKU Code</label>
                <input type="text" required value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                  <option>Boxes</option>
                  <option>Bags</option>
                  <option>Polythene</option>
                  <option>Machines</option>
                  <option>Cards</option>
                </select>
              </div>
              <div className="form-group">
                <label>Cost Price (₹)</label>
                <input type="number" required value={newProduct.cost} onChange={e => setNewProduct({...newProduct, cost: Number(e.target.value)})} />
              </div>
              <div className="form-group">
                <label>Selling Price (₹)</label>
                <input type="number" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Initial Stock</label>
                <input type="number" required value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} />
              </div>
              <div className="form-actions" style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                <button type="submit" className="glass-btn" style={{ width: '100%', justifyContent: 'center' }}>Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR/Barcode Modal */}
      {showCodes && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="card-header">
              <h3>Product Identifiers</h3>
              <button className="icon-btn" onClick={() => setShowCodes(null)}><X size={20} /></button>
            </div>
            <div className="codes-display" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem' }}>
              <div className="qr-section">
                <p style={{ marginBottom: '1rem', color: 'var(--admin-text-dim)' }}>QR Code (SKU: {showCodes.sku})</p>
                <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', display: 'inline-block' }}>
                  <QRCode value={showCodes.sku} size={150} />
                </div>
              </div>
              <div className="barcode-section">
                <p style={{ marginBottom: '1rem', color: 'var(--admin-text-dim)' }}>Barcode</p>
                <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', display: 'inline-block' }}>
                  <Barcode value={showCodes.sku} height={50} width={1.5} fontSize={14} />
                </div>
              </div>
              <button className="glass-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => window.print()}>
                Print Labels
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
