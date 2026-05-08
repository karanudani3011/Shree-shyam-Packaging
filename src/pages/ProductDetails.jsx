import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MessageCircle, ShoppingCart, ArrowLeft, PlayCircle } from 'lucide-react';
import { mockProducts } from './Home';
import { openWhatsApp } from '../utils/whatsapp';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    // In a real app, fetch from API. Here we use mock data.
    const foundProduct = mockProducts.find(p => p.id === parseInt(id));
    setProduct(foundProduct);
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) {
    return <div className="container" style={{padding: '4rem 0'}}>Loading...</div>;
  }

  // Mock gallery images
  const images = [
    product.image || '/product.png',
    '/product.png',
    '/product.png'
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
              {product.price ? `₹${product.price.toFixed(2)}` : 'Ask to Seller'}
            </div>

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
                <span className="spec-value" style={{color: 'var(--accent-neon-green)'}}>In Stock</span>
              </div>
            </div>

            <div className="actions-group">
              <button className="btn-add-cart" onClick={handleAddToCart}>
                <ShoppingCart size={20} /> Add to Cart
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
