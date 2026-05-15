import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MessageCircle, ShoppingCart, ArrowLeft, PlayCircle, AlertTriangle } from 'lucide-react';
import { openWhatsApp } from '../utils/whatsapp';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useERP } from '../context/ERPContext';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { addToCart } = useCart();
  const { products } = useERP();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({ name: '', phone: '' });
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');

  useEffect(() => {
    const foundProduct = products.find(p => p.id === parseInt(id));
    setProduct(foundProduct);
    window.scrollTo(0, 0);
  }, [id, products]);

  if (!product) {
    return <div className="container" style={{padding: '4rem 0'}}>Loading...</div>;
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : [product.image || '/product.png', product.image || '/product.png', product.image || '/product.png', product.image || '/product.png'];

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setShowOrderModal(true);
  };

  const handleConfirmOrder = (e) => {
    e.preventDefault();
    if (!otpStep) {
      // Mock OTP Send
      setOtpStep(true);
      return;
    }
    // Verify OTP (Mock)
    if (otp === '1234') {
      openWhatsApp(product.name, {
        ...customerDetails,
        dimensions: product.dimensions,
        material: product.material,
        sku: product.sku
      });
      setShowOrderModal(false);
      setOtpStep(false);
    } else {
      alert('Invalid OTP. Use 1234 for testing.');
    }
  };

  const handleAddToCart = () => {
    if (product.outOfStock) return;
    addToCart(product);
  };

  return (
    <div className="product-details-page">
      <div className="container">
        <Link to="/products" className="section-link" style={{marginBottom: '2rem', display: 'inline-flex'}}>
          <ArrowLeft size={20} /> Back to Products
        </Link>
        
        <div className="details-container">
          <div className="product-gallery">
            <div className="main-image-container">
              {product.hasVideo && activeImage === images.length ? (
                <div className="video-player-wrapper" style={{ height: '100%', background: '#000' }}>
                   <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/${product.videoUrl || 'dQw4w9WgXcQ'}`} 
                    title="Product Video" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <img src={images[activeImage] || '/product.png'} alt={product.name} className="main-image" />
              )}
              {product.outOfStock && (
                <div className="oos-overlay-detail">
                  <AlertTriangle size={24} />
                  <span>Out of Stock</span>
                </div>
              )}
            </div>
            <div className="thumbnail-list">
              {images.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`thumbnail ${activeImage === idx ? 'active' : ''}`}
                  onClick={() => setActiveImage(idx)}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} />
                </div>
              ))}
              {product.hasVideo && (
                <div 
                  className={`thumbnail video-thumb ${activeImage === images.length ? 'active' : ''}`}
                  onClick={() => setActiveImage(images.length)}
                >
                  <PlayCircle size={24} />
                  <span>Video</span>
                </div>
              )}
            </div>
          </div>

          <div className="product-info-section">
            <span className="product-category-label">{product.category}</span>
            <h1 className="product-details-title">{product.name}</h1>
            <div className="sku-label" style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>SKU: {product.sku}</div>
            
            <div className="product-details-price">
              {product.price ? `₹${product.price.toLocaleString()}` : 'Ask to Seller'}
            </div>

            {product.outOfStock && (
              <div className="oos-badge-detail">
                <AlertTriangle size={16} /> Currently Out of Stock
              </div>
            )}

            <p className="product-description">
              {product.description || `Experience the highest quality in industrial and commercial packaging with our premium ${product.name.toLowerCase()}. Designed with durability, aesthetics, and eco-friendliness in mind.`}
            </p>

            <div className="specs-grid">
              <div className="spec-item">
                <span className="spec-label">Material</span>
                <span className="spec-value">{product.material || 'Premium Grade'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Dimensions</span>
                <span className="spec-value">{product.dimensions || 'N/A'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Weight</span>
                <span className="spec-value">{product.weight || 'N/A'}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Colour</span>
                <span className="spec-value">{product.colour || 'Standard'}</span>
              </div>
              {product.moq && (
                <div className="spec-item">
                  <span className="spec-label">Min. Quantity</span>
                  <span className="spec-value">{product.moq}</span>
                </div>
              )}
              <div className="spec-item">
                <span className="spec-label">Availability</span>
                <span className="spec-value" style={{color: product.outOfStock ? '#ef4444' : 'var(--accent-neon-green)'}}>
                  {product.outOfStock ? 'Out of Stock' : 'In Stock'}
                </span>
              </div>
            </div>

            <div className="actions-group">
              <button 
                className="btn-add-cart" 
                onClick={handleAddToCart} 
                disabled={product.outOfStock}
                style={product.outOfStock ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              >
                <ShoppingCart size={20} /> {product.outOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button className="btn-buy-now" onClick={handleBuyNow}>
                <MessageCircle size={20} /> {product.price ? 'Order via WhatsApp' : 'Ask to Seller'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="modal-content glass-morphism animate-fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '1.5rem', color: 'white' }}>Quick Order</h2>
            <form onSubmit={handleConfirmOrder}>
              {!otpStep ? (
                <>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Your Name</label>
                    <input 
                      type="text" 
                      required 
                      value={customerDetails.name} 
                      onChange={e => setCustomerDetails({...customerDetails, name: e.target.value})}
                      placeholder="Enter your name"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Mobile Number</label>
                    <input 
                      type="tel" 
                      required 
                      value={customerDetails.phone} 
                      onChange={e => setCustomerDetails({...customerDetails, phone: e.target.value})}
                      placeholder="Enter mobile number"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Send Verification Code
                  </button>
                </>
              ) : (
                <>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Verification Code (OTP)</label>
                    <input 
                      type="text" 
                      required 
                      value={otp} 
                      onChange={e => setOtp(e.target.value)}
                      placeholder="Enter 4-digit code"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                    />
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem', textAlign: 'center' }}>Use 1234 for demo</p>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Confirm & WhatsApp
                  </button>
                  <button type="button" className="text-btn" onClick={() => setOtpStep(false)} style={{ width: '100%', marginTop: '1rem', color: 'rgba(255,255,255,0.5)' }}>
                    Edit Phone Number
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
