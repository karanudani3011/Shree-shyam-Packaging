import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Box } from 'lucide-react';
import './Header.css';

const Header = () => {
  return (
    <header className="header glass">
      <div className="container header-container">
        <Link to="/" className="logo">
          <Box className="logo-icon" size={28} color="var(--accent-electric-cyan)" />
          Pack<span>Store</span>
        </Link>
        
        <div className="search-bar">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Search boxes, bags, dimensions..." 
            className="search-input"
          />
        </div>

        <nav className="nav-links">
          <Link to="/products" className="nav-link">Products</Link>
          <Link to="/products?category=boxes" className="nav-link">Boxes</Link>
          <Link to="/products?category=bags" className="nav-link">Bags</Link>
          <button className="cart-btn">
            <ShoppingCart size={20} />
            <span>Cart (0)</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
