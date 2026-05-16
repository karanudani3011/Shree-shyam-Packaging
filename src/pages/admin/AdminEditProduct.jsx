import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Image as ImageIcon, 
  Loader,
  AlertTriangle
} from 'lucide-react';
import { useERP, CATEGORIES } from '../../context/ERPContext';
import { uploadToCloudinary } from '../../utils/cloudinary';
import './AdminPages.css';

const AdminEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, updateProduct } = useERP();
  const [product, setProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const foundProduct = products.find(p => p.id === Number(id));
    if (foundProduct) {
      setProduct({
        ...foundProduct,
        price: foundProduct.price === null ? '' : foundProduct.price,
      });
      setImagePreview(foundProduct.image || '');
    } else {
      navigate('/admin/inventory');
    }
  }, [id, products, navigate]);

  if (!product) return <div className="admin-loader"><Loader className="animate-spin" /></div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError('');

    try {
      let imageUrl = product.image;

      if (imageFile) {
        const result = await uploadToCloudinary(imageFile);
        imageUrl = result.url;
      }

      let finalDimensions = product.dimensions;
      if (product.length || product.width || product.height) {
        finalDimensions = `${product.length || 0}x${product.width || 0}x${product.height || 0} ${product.unit || 'in'}`;
      }

      const updatedData = {
        name: product.name,
        category: product.category,
        sku: product.sku,
        image: imageUrl,
        dimensions: finalDimensions,
        price: product.price === '' ? null : Number(product.price),
        cost: Number(product.cost),
        stock: Number(product.stock),
        material: product.material,
        moq: product.moq,
        out_of_stock: product.out_of_stock,
      };

      updateProduct(Number(id), updatedData);
      navigate('/admin/inventory');
    } catch (err) {
      setError('Update failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-edit-product animate-fadeIn">
      <div className="card-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/admin/inventory" className="icon-btn">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Edit Product</h2>
            <p style={{ color: 'var(--admin-text-dim)' }}>ID: {product.sku}</p>
          </div>
        </div>
      </div>

      {error && <div className="error-alert" style={{ marginBottom: '2rem' }}>{error}</div>}

      <div className="admin-card glass-morphism">
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Product Image</label>
            <div 
              className="image-upload-area has-preview"
              onClick={() => fileInputRef.current?.click()}
              style={{ maxHeight: '300px' }}
            >
              {imagePreview ? (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Preview" className="image-preview" style={{ maxHeight: '250px', objectFit: 'contain' }} />
                  <div className="image-preview-overlay">
                    <Upload size={24} />
                    <span>Change Image</span>
                  </div>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <ImageIcon size={48} />
                  <p>Click to upload product image</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setImageFile(file);
                  const reader = new FileReader();
                  reader.onloadend = () => setImagePreview(reader.result);
                  reader.readAsDataURL(file);
                }
              }} style={{ display: 'none' }} />
            </div>
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Product Name</label>
            <input 
              type="text" 
              required 
              value={product.name} 
              onChange={e => setProduct({...product, name: e.target.value})} 
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select value={product.category} onChange={e => setProduct({...product, category: e.target.value})}>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>SKU Code</label>
            <input type="text" value={product.sku} readOnly style={{ opacity: 0.7, cursor: 'not-allowed' }} />
          </div>

          <div className="form-group">
            <label>Cost Price (₹)</label>
            <input type="number" value={product.cost} onChange={e => setProduct({...product, cost: e.target.value})} />
          </div>

          <div className="form-group">
            <label>Selling Price (₹)</label>
            <input 
              type="number" 
              value={product.price} 
              onChange={e => setProduct({...product, price: e.target.value})} 
              placeholder="Empty for Ask Seller" 
            />
          </div>

          <div className="form-group">
            <label>Stock Quantity</label>
            <input type="number" value={product.stock} onChange={e => setProduct({...product, stock: e.target.value})} />
          </div>

          <div className="form-group">
            <label>Material</label>
            <input type="text" value={product.material} onChange={e => setProduct({...product, material: e.target.value})} />
          </div>

          <div className="form-group">
            <label>Dimensions</label>
            <input type="text" value={product.dimensions} onChange={e => setProduct({...product, dimensions: e.target.value})} />
          </div>

          <div className="form-group">
            <label>Weight</label>
            <input type="text" value={product.weight} onChange={e => setProduct({...product, weight: e.target.value})} />
          </div>

          <div className="form-group">
            <label>Colour</label>
            <input type="text" value={product.colour} onChange={e => setProduct({...product, colour: e.target.value})} />
          </div>

          <div className="form-group">
            <label>Min. Order Quantity</label>
            <input type="text" value={product.moq} onChange={e => setProduct({...product, moq: e.target.value})} />
          </div>

          <div className="form-actions" style={{ gridColumn: 'span 2', marginTop: '2rem' }}>
            <button type="button" className="glass-btn" onClick={() => navigate('/admin/inventory')}>Cancel</button>
            <button type="submit" className="glass-btn submit-btn-premium" disabled={uploading}>
              {uploading ? <Loader className="animate-spin" /> : <Save size={20} />}
              {uploading ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditProduct;
