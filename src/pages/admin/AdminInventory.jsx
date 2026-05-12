import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  QrCode as QrIcon, 
  Barcode as BarIcon, 
  Upload,
  X,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader
} from 'lucide-react';
import QRCode from 'react-qr-code';
import Barcode from 'react-barcode';
import { useERP, CATEGORIES } from '../../context/ERPContext';
import { uploadToCloudinary } from '../../utils/cloudinary';
import './AdminPages.css';

const AdminInventory = () => {
  const { products, addProduct, updateProduct, deleteProduct, toggleOutOfStock } = useERP();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCodes, setShowCodes] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const emptyProduct = {
    name: '',
    category: 'Boxes',
    stock: 0,
    price: '',
    cost: '',
    sku: '',
    image: '',
    dimensions: '',
    material: '',
    moq: '',
    outOfStock: false,
    hasVideo: false
  };

  const [newProduct, setNewProduct] = useState({ ...emptyProduct });

  const handleImageSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file (JPG, PNG, WebP)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image must be less than 10MB');
      return;
    }
    setUploadError('');
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageSelect(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setNewProduct({ ...emptyProduct });
    setImageFile(null);
    setImagePreview('');
    setUploadError('');
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadError('');

    try {
      let imageUrl = newProduct.image || '/product.png';

      // Upload image to Cloudinary if a new file was selected
      if (imageFile) {
        const result = await uploadToCloudinary(imageFile);
        imageUrl = result.url;
      }

      const productData = {
        ...newProduct,
        image: imageUrl,
        price: newProduct.price === '' || newProduct.price === null ? null : Number(newProduct.price),
        cost: newProduct.cost === '' ? 0 : Number(newProduct.cost),
        stock: Number(newProduct.stock),
      };

      if (editingProduct) {
        updateProduct(editingProduct.id, productData);
      } else {
        addProduct(productData);
      }

      resetForm();
    } catch (err) {
      setUploadError('Failed to upload image: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      category: product.category,
      stock: product.stock,
      price: product.price === null ? '' : product.price,
      cost: product.cost,
      sku: product.sku,
      image: product.image || '',
      dimensions: product.dimensions || '',
      material: product.material || '',
      moq: product.moq || '',
      outOfStock: product.outOfStock || false,
      hasVideo: product.hasVideo || false
    });
    setImagePreview(product.image || '');
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };

  return (
    <div className="admin-inventory">
      <div className="inventory-controls">
        <div className="search-wrapper" style={{ flex: 1, position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} size={20} />
          <input 
            type="text" 
            placeholder="Search by name, SKU, or category..." 
            className="search-input" 
            style={{ paddingLeft: '45px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="glass-btn" onClick={() => { setEditingProduct(null); setNewProduct({ ...emptyProduct }); setImagePreview(''); setImageFile(null); setIsModalOpen(true); }}>
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="admin-card admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Selling Price</th>
              <th>Cost Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id} style={{ opacity: product.outOfStock ? 0.6 : 1 }}>
                <td>
                  <div className="table-img-wrapper">
                    <img 
                      src={product.image || '/product.png'} 
                      alt={product.name} 
                      className="table-product-img"
                    />
                  </div>
                </td>
                <td><code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>{product.sku}</code></td>
                <td><strong>{product.name}</strong></td>
                <td>
                  <span className="category-badge">{product.category}</span>
                </td>
                <td>
                  <span className={`stock-status ${product.stock < 100 ? 'low' : ''}`}>
                    {product.stock} units
                  </span>
                </td>
                <td>
                  {product.outOfStock ? (
                    <span className="oos-badge oos-out">
                      <XCircle size={14} /> Out of Stock
                    </span>
                  ) : (
                    <span className="oos-badge oos-in">
                      <CheckCircle size={14} /> In Stock
                    </span>
                  )}
                </td>
                <td>{product.price !== null ? `₹${product.price}` : <span style={{ color: '#f59e0b' }}>Ask Seller</span>}</td>
                <td>₹{product.cost}</td>
                <td>
                  <div className="action-btns">
                    <button className="icon-btn" onClick={() => toggleOutOfStock(product.id)} title={product.outOfStock ? 'Mark In Stock' : 'Mark Out of Stock'}>
                      {product.outOfStock ? <CheckCircle size={16} style={{ color: '#10b981' }} /> : <AlertTriangle size={16} style={{ color: '#f59e0b' }} />}
                    </button>
                    <button className="icon-btn" onClick={() => setShowCodes(product)} title="View Codes">
                      <QrIcon size={16} />
                    </button>
                    <button className="icon-btn" onClick={() => handleEdit(product)} title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button className="icon-btn" onClick={() => handleDelete(product.id)} title="Delete" style={{ color: '#ef4444' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-dim)' }}>
            No products found. Add your first product to get started.
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) resetForm(); }}>
          <div className="modal-content modal-large">
            <div className="card-header">
              <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="icon-btn" onClick={resetForm}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="form-grid">
              {/* Image Upload Area */}
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Product Image</label>
                <div 
                  className={`image-upload-area ${dragActive ? 'drag-active' : ''} ${imagePreview ? 'has-preview' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <div className="image-preview-container">
                      <img src={imagePreview} alt="Preview" className="image-preview" />
                      <div className="image-preview-overlay">
                        <ImageIcon size={24} />
                        <span>Click or drag to replace</span>
                      </div>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <Upload size={36} />
                      <p>Drag & drop an image here</p>
                      <span>or click to browse</span>
                      <span className="upload-hint">JPG, PNG, WebP • Max 10MB</span>
                    </div>
                  )}
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*"
                    onChange={handleFileInput}
                    style={{ display: 'none' }}
                  />
                </div>
                {uploadError && (
                  <span className="upload-error">{uploadError}</span>
                )}
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Product Name</label>
                <input type="text" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Premium Corrugated Box" />
              </div>
              <div className="form-group">
                <label>SKU Code</label>
                <input type="text" required value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} placeholder="e.g. BX-003" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Cost Price (₹)</label>
                <input type="number" value={newProduct.cost} onChange={e => setNewProduct({...newProduct, cost: e.target.value})} placeholder="0" />
              </div>
              <div className="form-group">
                <label>Selling Price (₹) <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Leave empty for "Ask Seller"</span></label>
                <input type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} placeholder="Leave empty for Ask Seller" />
              </div>
              <div className="form-group">
                <label>Initial Stock</label>
                <input type="number" required value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} placeholder="0" />
              </div>
              <div className="form-group">
                <label>Dimensions</label>
                <input type="text" value={newProduct.dimensions} onChange={e => setNewProduct({...newProduct, dimensions: e.target.value})} placeholder="e.g. 10x8x4 inches" />
              </div>
              <div className="form-group">
                <label>Material</label>
                <input type="text" value={newProduct.material} onChange={e => setNewProduct({...newProduct, material: e.target.value})} placeholder="e.g. Kraft Paper" />
              </div>
              <div className="form-group">
                <label>Min. Order Quantity</label>
                <input type="text" value={newProduct.moq} onChange={e => setNewProduct({...newProduct, moq: e.target.value})} placeholder="e.g. 500 pcs" />
              </div>

              {/* Out of Stock Toggle */}
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="toggle-label">
                  <div className={`toggle-switch ${newProduct.outOfStock ? 'active' : ''}`} onClick={() => setNewProduct({...newProduct, outOfStock: !newProduct.outOfStock})}>
                    <div className="toggle-knob"></div>
                  </div>
                  <span>Mark as Out of Stock</span>
                  {newProduct.outOfStock && <span className="oos-badge oos-out" style={{ marginLeft: '0.5rem' }}><XCircle size={12} /> Out of Stock</span>}
                </label>
              </div>

              <div className="form-actions" style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                <button type="button" className="glass-btn" style={{ background: 'rgba(255,255,255,0.05)', flex: 1, justifyContent: 'center' }} onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="glass-btn" style={{ flex: 2, justifyContent: 'center' }} disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader size={18} className="spin-animation" /> Uploading...
                    </>
                  ) : (
                    editingProduct ? 'Update Product' : 'Save Product'
                  )}
                </button>
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
