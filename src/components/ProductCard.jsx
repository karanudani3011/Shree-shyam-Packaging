import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlayCircle, ShoppingCart } from 'lucide-react';
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
    addToCart(product);
  };

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-image-container">
        <img src={product.image || '/product.png'} alt={product.name} className="product-image" />
        {product.hasVideo && (
          <div className="video-icon-overlay">
            <PlayCircle size={24} />
          </div>
        )}
      </div>
      
      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <span className="product-category">{product.category}</span>
        
        <div className="product-price-row">
          {product.price ? (
            <span className="product-price">₹{product.price.toFixed(2)}</span>
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
          <button className="btn-buy" onClick={handleBuyNow}>
            {product.price ? 'Buy Now' : 'Ask to Seller'}
          </button>
          <button className="btn-cart" onClick={handleAddToCart} title="Add to Cart">
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
