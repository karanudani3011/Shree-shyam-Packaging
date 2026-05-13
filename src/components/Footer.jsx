import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Phone, Mail, MapPin, Globe } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <Link to="/" className="footer-logo">
              <Box size={28} color="var(--accent-electric-cyan)" />
              Shree Shyam<span>Packaging</span>
            </Link>
            <p className="footer-desc">
              High-end, modern packaging solutions for industrial and commercial needs. We provide premium boxes, bags, polythene, machines, and cards.
            </p>
            <div className="social-links">
              <a href="#" className="social-icon"><Globe size={20} /></a>
              <a href="#" className="social-icon"><Globe size={20} /></a>
              <a href="#" className="social-icon"><Globe size={20} /></a>
            </div>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Product Categories</h3>
            <ul className="footer-links">
              <li><Link to="/products?category=Box" className="footer-link">Box</Link></li>
              <li><Link to="/products?category=Bag" className="footer-link">Bag</Link></li>
              <li><Link to="/products?category=Polythene" className="footer-link">Polythene</Link></li>
              <li><Link to="/products?category=Machine" className="footer-link">Machine</Link></li>
              <li><Link to="/products?category=Cards" className="footer-link">Cards</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Support & Legal</h3>
            <ul className="footer-links">
              <li><Link to="/about" className="footer-link">About Us</Link></li>
              <li><Link to="/faq" className="footer-link">FAQ</Link></li>
              <li><Link to="/shipping" className="footer-link">Shipping Policy</Link></li>
              <li><Link to="/terms" className="footer-link">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="footer-link">Privacy Policy</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Contact Us</h3>
            <div className="contact-info">
              <div className="contact-item">
                <Phone size={18} color="var(--accent-warm-orange)" />
                <span>+91 98765 43210</span>
              </div>
              <div className="contact-item">
                <Mail size={18} color="var(--accent-warm-orange)" />
                <span>info@shreeshyampackaging.com</span>
              </div>
              <div className="contact-item">
                <MapPin size={18} color="var(--accent-warm-orange)" />
                <span>GIDC Industrial Estate, Rajkot, Gujarat</span>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Shree Shyam Packaging. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
