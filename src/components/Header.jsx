import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Box, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Header.css';

const Header = () => {
  const { cartCount, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      <div className="top-banner">
        <p>One stop solution for all jewellery packing material</p>
      </div>
      <header className="header glass">
        <div className="container header-container">
          <Link to="/" className="logo">
            <Box className="logo-icon" size={28} color="var(--accent-electric-cyan)" />
            Shree Shyam<span>Packaging</span>
          </Link>

          <div className="search-bar">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search boxes, bags, dimensions..."
              className="search-input"
            />
          </div>

          {/* Desktop Nav */}
          <nav className="nav-links desktop-nav">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/products" className="nav-link">Products</Link>
            <Link to="/about" className="nav-link">About Us</Link>
            <Link to="/products?category=boxes" className="nav-link">Boxes</Link>
            
            <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart size={20} />
              <span>Cart ({cartCount})</span>
            </button>
          </nav>

          {/* Mobile Toggle */}
          <div className="mobile-actions">
            <button className="cart-btn mobile-cart-btn" onClick={() => setIsCartOpen(true)}>
                <ShoppingCart size={20} />
                <span className="cart-badge">{cartCount}</span>
            </button>
            <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-search">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search..."
              className="search-input"
            />
          </div>
          <Link to="/" className="mobile-nav-link" onClick={toggleMobileMenu}>Home</Link>
          <Link to="/products" className="mobile-nav-link" onClick={toggleMobileMenu}>Products</Link>
          <Link to="/about" className="mobile-nav-link" onClick={toggleMobileMenu}>About Us</Link>
          <Link to="/products?category=boxes" className="mobile-nav-link" onClick={toggleMobileMenu}>Boxes</Link>
        </div>
      </header>
    </>
  );
};

export default Header;
