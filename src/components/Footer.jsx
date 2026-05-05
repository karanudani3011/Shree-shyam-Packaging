import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Phone, Mail, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <Link to="/" className="footer-logo">
              <Box size={28} color="var(--accent-electric-cyan)" />
              Pack<span>Store</span>
            </Link>
            <p className="footer-desc">
              High-end, modern packaging solutions for industrial and commercial needs. We provide premium boxes, bags, polythene, machines, and cards.
            </p>
            <div className="social-links">
              <a href="#" className="social-icon">FB</a>
              <a href="#" className="social-icon">IG</a>
              <a href="#" className="social-icon">TW</a>
              <a href="#" className="social-icon">LI</a>
            </div>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/products" className="footer-link">All Products</Link></li>
              <li><Link to="/products?category=boxes" className="footer-link">Boxes</Link></li>
              <li><Link to="/products?category=bags" className="footer-link">Bags</Link></li>
              <li><Link to="/about" className="footer-link">About Us</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Contact Us</h3>
            <div className="contact-info">
              <div className="contact-item">
                <Phone size={18} color="var(--accent-warm-orange)" />
                <span>+1 (234) 567-8900</span>
              </div>
              <div className="contact-item">
                <Mail size={18} color="var(--accent-warm-orange)" />
                <span>support@packstore.com</span>
              </div>
              <div className="contact-item">
                <MapPin size={18} color="var(--accent-warm-orange)" />
                <span>123 Industrial Park, Tech City, 10012</span>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} PackStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
