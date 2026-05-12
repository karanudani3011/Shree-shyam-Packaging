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

  useEffect(() => {
    // Find product from ERPContext
    const foundProduct = products.find(p => p.id === parseInt(id));
    setProduct(foundProduct);
    window.scrollTo(0, 0);
  }, [id, products]);

  if (!product) {
    return <div className="container" style={{padding: '4rem 0'}}>Loading...</div>;
  }

  // Use the product's actual image from Cloudinary or fallback
  const images = [
    product.image || '/product.png',
    product.image || '/product.png',
    product.image || '/product.png'
  ];

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    openWhatsApp(product.name);
  };

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
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
              <img src={images[activeImage]} alt={product.name} className="main-image" />
              {product.hasVideo && activeImage === 0 && (
                <div className="video-icon-overlay" style={{top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80px', height: '80px'}}>
                  <PlayCircle size={40} />
                </div>
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
            </div>
          </div>

          <div className="product-info-section">
            <span className="product-category-label">{product.category}</span>
            <h1 className="product-details-title">{product.name}</h1>
            
            <div className="product-details-price">
              {product.price ? `₹${product.price.toFixed ? product.price.toFixed(2) : product.price}` : 'Ask to Seller'}
            </div>

            {product.outOfStock && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                marginBottom: '1rem'
              }}>
                <AlertTriangle size={16} />
                Currently Out of Stock
              </div>
            )}

            <p className="product-description">
              Experience the highest quality in industrial and commercial packaging with our premium {product.name.toLowerCase()}. 
              Designed with durability, aesthetics, and eco-friendliness in mind, this product ensures your items are protected 
              while presenting a high-end feel to your customers.
            </p>

            <div className="specs-grid">
              <div className="spec-item">
                <span className="spec-label">Material</span>
                <span className="spec-value">{product.material}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Dimensions</span>
                <span className="spec-value">{product.dimensions}</span>
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
    </div>
  );
};

export default ProductDetails;
