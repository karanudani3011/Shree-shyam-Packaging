import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
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
import { useAuth } from '../../context/AuthContext';
import { generateSKU } from '../../utils/sku';
import './AdminPages.css';

const formatDateTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const pad = (num) => String(num).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
};

import * as XLSX from 'xlsx';

const AdminInventory = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct, toggleOutOfStock, clearInventory } = useERP();
  
  const hasStockPermission = currentUser?.role === 'admin' || currentUser?.permissions?.includes('stock');

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!hasStockPermission) {
    return (
      <div className="admin-inventory animate-fadeIn">
        <div className="admin-card" style={{ textAlign: 'center', padding: '5rem', marginTop: '2rem' }}>
          <Package size={48} color="var(--admin-danger)" style={{ marginBottom: '1.5rem', opacity: 0.5, margin: '0 auto' }} />
          <h2 style={{ color: 'white' }}>Access Denied</h2>
          <p style={{ color: 'var(--admin-text-dim)' }}>You do not have permission to view or manage inventory.</p>
        </div>
      </div>
    );
  }
  const [showCodes, setShowCodes] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const excelInputRef = useRef(null);
  // Inline SKU editing
  const [editingSkuId, setEditingSkuId] = useState(null);
  const [editingSkuValue, setEditingSkuValue] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const emptyProduct = {
    name: '',
    category: 'Pal Bopp bag',
    stock: 0,
    price: '',
    cost: '',
    sku: '',
    image: '',
    dimensions: '',
    length: '',
    width: '',
    height: '',
    weight: '',
    colour: '',
    material: '',
    moq: '',
    out_of_stock: false,
    hasVideo: false,
    videoUrl: ''
  };

  const [newProduct, setNewProduct] = useState({ ...emptyProduct });

  // Track if SKU was manually edited so auto-gen doesn't overwrite it
  const [skuManuallyEdited, setSkuManuallyEdited] = useState(false);

  const handleAutoGenSKU = (category, target) => {
    const nextSku = generateSKU(category, products);
    if (target === 'new') {
      setNewProduct(prev => ({ ...prev, sku: nextSku }));
      setSkuManuallyEdited(false);
    }
  };

  // When category changes in the Add modal, auto-generate SKU only if not manually edited
  useEffect(() => {
    if (!editingProduct && !skuManuallyEdited) {
      const nextSku = generateSKU(newProduct.category, products);
      setNewProduct(prev => ({ ...prev, sku: nextSku }));
    }
  }, [newProduct.category, editingProduct]);

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      data.forEach(item => {
        addProduct({
          name: item.Name || 'Unnamed Product',
          category: item.Category || 'Dabbi',
          sku: item.SKU || generateSKU(item.Category || 'Dabbi'),
          price: item.Price ? Number(item.Price) : null,
          cost: item.Cost ? Number(item.Cost) : 0,
          stock: item.Stock ? Number(item.Stock) : 0,
          dimensions: item.Dimensions || '',
          material: item.Material || '',
          moq: item.MOQ || ''
        });
      });
      alert(`Successfully imported ${data.length} products!`);
    };
    reader.readAsBinaryString(file);
  };

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

      if (imageFile) {
        const result = await uploadToCloudinary(imageFile);
        imageUrl = result.url;
      }

      // Format dimensions string if individual parts are provided
      let finalDimensions = newProduct.dimensions;
      if (newProduct.length || newProduct.width || newProduct.height) {
        finalDimensions = `${newProduct.length || 0}x${newProduct.width || 0}x${newProduct.height || 0} ${newProduct.unit || 'in'}`;
      }

      const productData = {
        name: newProduct.name,
        category: newProduct.category,
        sku: newProduct.sku,
        image: imageUrl,
        dimensions: finalDimensions,
        price: newProduct.price === '' || newProduct.price === null ? null : Number(newProduct.price),
        cost: newProduct.cost === '' ? 0 : Number(newProduct.cost),
        stock: Number(newProduct.stock),
        material: newProduct.material,
        moq: newProduct.moq,
        out_of_stock: newProduct.out_of_stock || false,
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
    navigate(`/admin/inventory/edit/${product.id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };

  // Label print URL logic
  const getProductPublicUrl = (product) => {
    return `${window.location.origin}/product/${product.id}`;
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
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="glass-btn" onClick={() => excelInputRef.current?.click()} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <Upload size={18} />
            Excel Upload
          </button>
          <input type="file" ref={excelInputRef} onChange={handleExcelUpload} accept=".xlsx, .xls, .csv" style={{ display: 'none' }} />
          
          <button className="glass-btn" onClick={() => { setEditingProduct(null); setNewProduct({ ...emptyProduct }); setImagePreview(''); setImageFile(null); setIsModalOpen(true); }}>
            <Plus size={18} />
            Add Product
          </button>
        </div>
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
              <tr key={product.id} style={{ opacity: product.out_of_stock ? 0.6 : 1 }}>
                <td>
                  <div className="table-img-wrapper">
                    <img 
                      src={product.image || '/product.png'} 
                      alt={product.name} 
                      className="table-product-img"
                    />
                  </div>
                </td>
                <td>
                  {editingSkuId === product.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <input
                        autoFocus
                        type="text"
                        value={editingSkuValue}
                        onChange={e => setEditingSkuValue(e.target.value)}
                        onBlur={() => {
                          if (editingSkuValue.trim()) {
                            updateProduct(product.id, { ...product, sku: editingSkuValue.trim() });
                          }
                          setEditingSkuId(null);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            if (editingSkuValue.trim()) {
                              updateProduct(product.id, { ...product, sku: editingSkuValue.trim() });
                            }
                            setEditingSkuId(null);
                          } else if (e.key === 'Escape') {
                            setEditingSkuId(null);
                          }
                        }}
                        style={{ width: '80px', padding: '3px 7px', borderRadius: '6px', border: '1px solid var(--admin-primary)', background: 'rgba(99,102,241,0.12)', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                      />
                    </div>
                  ) : (
                    <code
                      title="Click to edit SKU"
                      style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer' }}
                      onClick={() => { setEditingSkuId(product.id); setEditingSkuValue(product.sku); }}
                    >
                      {product.sku} ✏️
                    </code>
                  )}
                </td>
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
                  {product.out_of_stock ? (
                    <span className="oos-badge oos-out">
                      <XCircle size={14} /> Out of Stock
                    </span>
                  ) : (
                    <span className="oos-badge oos-in">
                      <CheckCircle size={14} /> In Stock
                    </span>
                  )}
                </td>
                <td>{product.price !== null ? `₹${product.price.toLocaleString()}` : <span style={{ color: '#f59e0b' }}>Ask Seller</span>}</td>
                <td>₹{product.cost.toLocaleString()}</td>
                <td>
                    <div className="action-btns" style={{ gap: '1rem', display: 'flex', alignItems: 'center' }}>
                      <button className="icon-btn" onClick={() => toggleOutOfStock(product.id)} title={product.out_of_stock ? 'Mark In Stock' : 'Mark Out of Stock'} style={{ padding: '8px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px' }}>
                        {product.out_of_stock ? <CheckCircle size={18} style={{ color: '#10b981' }} /> : <AlertTriangle size={18} style={{ color: '#f59e0b' }} />}
                      </button>
                      <button className="icon-btn" onClick={() => setShowCodes(product)} title="View Codes" style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px' }}>
                        <QrIcon size={18} />
                      </button>
                      <button className="icon-btn" onClick={() => handleEdit(product)} title="Edit" style={{ padding: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                        <Edit2 size={18} />
                      </button>
                      <button className="icon-btn" onClick={() => handleDelete(product.id)} title="Delete" style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: '#ef4444' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) resetForm(); }}>
          <div className="modal-content modal-large">
            <div className="card-header">
              <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="icon-btn" onClick={resetForm}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="form-grid">
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
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} style={{ display: 'none' }} />
                </div>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Product Name</label>
                <input type="text" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Premium Corrugated Box" />
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
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>SKU Code</span>
                  <button
                    type="button"
                    onClick={() => handleAutoGenSKU(newProduct.category, 'new')}
                    style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--admin-primary)',
                      background: 'rgba(99,102,241,0.15)',
                      color: 'var(--admin-primary)',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    ⚡ Auto-Gen
                  </button>
                </label>
                <input 
                  type="text" 
                  value={newProduct.sku} 
                  onChange={e => { setNewProduct({...newProduct, sku: e.target.value}); setSkuManuallyEdited(true); }} 
                  placeholder={`e.g. ${generateSKU(newProduct.category, products)}`}
                />
                <small style={{ color: 'var(--admin-text-dim)', marginTop: '4px', display: 'block', fontSize: '0.73rem' }}>
                  Series auto-detected from category. Admin can override anytime.
                </small>
              </div>
              
              <div className="form-group">
                <label>Cost Price (₹)</label>
                <input type="number" value={newProduct.cost} onChange={e => setNewProduct({...newProduct, cost: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Selling Price (₹)</label>
                <input type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} placeholder="Empty for Ask Seller" />
              </div>
              
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Material</label>
                <input type="text" value={newProduct.material} onChange={e => setNewProduct({...newProduct, material: e.target.value})} placeholder="e.g. Kraft Paper" />
              </div>

              <div className="form-group">
                <label>Length</label>
                <input type="text" value={newProduct.length} onChange={e => setNewProduct({...newProduct, length: e.target.value})} placeholder="L" />
              </div>
              <div className="form-group">
                <label>Width</label>
                <input type="text" value={newProduct.width} onChange={e => setNewProduct({...newProduct, width: e.target.value})} placeholder="W" />
              </div>
              <div className="form-group">
                <label>Height</label>
                <input type="text" value={newProduct.height} onChange={e => setNewProduct({...newProduct, height: e.target.value})} placeholder="H" />
              </div>
              <div className="form-group">
                <label>Weight</label>
                <input type="text" value={newProduct.weight} onChange={e => setNewProduct({...newProduct, weight: e.target.value})} placeholder="e.g. 500g" />
              </div>
              <div className="form-group">
                <label>Colour</label>
                <input type="text" value={newProduct.colour} onChange={e => setNewProduct({...newProduct, colour: e.target.value})} placeholder="e.g. Brown" />
              </div>
              <div className="form-group">
                <label>Min. Order Quantity</label>
                <input type="text" value={newProduct.moq} onChange={e => setNewProduct({...newProduct, moq: e.target.value})} />
              </div>

              <div className="form-group">
                <label>Stock</label>
                <input type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Video URL (Youtube ID)</label>
                <input type="text" value={newProduct.videoUrl} onChange={e => setNewProduct({...newProduct, videoUrl: e.target.value, hasVideo: !!e.target.value})} placeholder="e.g. dQw4w9WgXcQ" />
              </div>

              <div className="form-actions" style={{ gridColumn: 'span 2' }}>
                <button type="button" className="glass-btn" onClick={resetForm}>Cancel</button>
                <button type="submit" className="glass-btn" style={{ flex: 2 }} disabled={uploading}>
                  {uploading ? 'Processing...' : (editingProduct ? 'Update Product' : 'Save Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCodes && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowCodes(null); }}>
          <div className="modal-content" style={{ maxWidth: '480px', textAlign: 'center' }}>
            <div className="card-header">
              <h3>Sticker Print Preview</h3>
              <button className="icon-btn" onClick={() => setShowCodes(null)}><X size={20} /></button>
            </div>
            
            <div className="sticker-preview-container" style={{ margin: '2rem 0', display: 'flex', justifyContent: 'center' }}>
              <div className="sticker-card-preview">
                <div className="sticker-bg-logo">
                  <div className="logo-circle-wrapper">
                    <div className="logo-circle">
                      <span className="logo-text-center">SSP</span>
                    </div>
                    <span className="logo-tm">TM</span>
                  </div>
                </div>
                
                <div className="sticker-content">
                  <div className="sticker-sku">{showCodes.sku}</div>
                  <div className="sticker-name">{showCodes.name}</div>
                  <div className="sticker-dimensions">{showCodes.dimensions || showCodes.category}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="glass-btn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowCodes(null)}>
                Cancel
              </button>
              <button className="glass-btn" style={{ flex: 2, justifyContent: 'center', background: 'var(--admin-primary)' }} onClick={() => window.print()}>
                Print Label
              </button>
            </div>
          </div>
        </div>
      )}

      {showCodes && createPortal(
        <div className="printable-sticker-label">
          <div className="sticker-bg-logo">
            <div className="logo-circle-wrapper">
              <div className="logo-circle">
                <span className="logo-text-center">SSP</span>
              </div>
              <span className="logo-tm">TM</span>
            </div>
          </div>
          
          <div className="sticker-content">
            <div className="sticker-sku">{showCodes.sku}</div>
            <div className="sticker-name">{showCodes.name}</div>
            <div className="sticker-dimensions">{showCodes.dimensions || showCodes.category}</div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminInventory;
