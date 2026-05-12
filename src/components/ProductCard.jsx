import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlayCircle, ShoppingCart, AlertTriangle } from 'lucide-react';
import { openWhatsApp } from '../utils/whatsapp';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { addToCart } = useCart();

  const handleBuyNow = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    openWhatsApp(product.name);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (product.outOfStock) return;
    addToCart(product);
  };

  return (
    <Link to={`/product/${product.id}`} className={`product-card ${product.outOfStock ? 'out-of-stock' : ''}`}>
      <div className="product-image-container">
        <img src={product.image || '/product.png'} alt={product.name} className="product-image" />
        {product.hasVideo && (
          <div className="video-icon-overlay">
            <PlayCircle size={24} />
          </div>
        )}
        {product.outOfStock && (
          <div className="oos-card-badge">
            <AlertTriangle size={14} />
            Out of Stock
          </div>
        )}
      </div>
      
      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <span className="product-category">{product.category}</span>
        
        <div className="product-price-row">
          {product.price ? (
            <span className="product-price">₹{typeof product.price === 'number' && product.price.toFixed ? product.price.toFixed(2) : product.price}</span>
          ) : (
            <span className="contact-price">Ask to Seller</span>
          )}
        </div>
        
        {product.moq && (
          <div className="product-moq" style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem'}}>
            Min. Qty: {product.moq}
          </div>
        )}

        <div className="action-buttons">
          <button 
            className={`btn-buy ${product.outOfStock ? 'btn-disabled' : ''}`} 
            onClick={handleBuyNow}
          >
            {product.outOfStock ? 'Out of Stock' : (product.price ? 'Buy Now' : 'Ask to Seller')}
          </button>
          <button 
            className={`btn-cart ${product.outOfStock ? 'btn-disabled' : ''}`} 
            onClick={handleAddToCart} 
            title={product.outOfStock ? 'Out of Stock' : 'Add to Cart'}
            disabled={product.outOfStock}
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
