import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlayCircle, ShoppingCart } from 'lucide-react';
import { openWhatsApp } from '../utils/whatsapp';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleBuyNow = (e) => {
    e.preventDefault();
    openWhatsApp(product.name);
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
            <span className="product-price">${product.price.toFixed(2)}</span>
          ) : (
            <span className="contact-price">Contact for Price</span>
          )}
        </div>

        <div className="action-buttons">
          <button className="btn-buy" onClick={handleBuyNow}>
            Buy Now
          </button>
          <button className="btn-cart" onClick={(e) => e.preventDefault()} title="Add to Cart">
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
