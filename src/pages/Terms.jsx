import React, { useEffect } from 'react';
import './Legal.css';

const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-page">
      <div className="container">
        <h1 className="legal-title">Terms and Conditions</h1>
        <div className="legal-content glass">
          <h2>1. Introduction</h2>
          <p>Welcome to Shree Shyam Packaging. By accessing our website, you agree to these Terms and Conditions. Please read them carefully.</p>

          <h2>2. Products and Services</h2>
          <p>We provide high-quality packaging materials including boxes, bags, and polythene. All products are subject to availability. Prices are subject to change without notice.</p>

          <h2>3. Ordering and Payment</h2>
          <p>Orders can be placed via our website or WhatsApp. Payments must be completed as agreed upon during the ordering process. We reserve the right to refuse or cancel any order.</p>

          <h2>4. Shipping and Delivery</h2>
          <p>Delivery times and costs are estimated and may vary depending on your location and the size of your order.</p>

          <h2>5. Returns and Refunds</h2>
          <p>If you are not satisfied with your purchase, please contact us within 7 days of delivery. Returns are subject to our return policy, and custom-made items may not be eligible for a refund.</p>

          <h2>6. Limitation of Liability</h2>
          <p>Shree Shyam Packaging is not liable for any indirect, incidental, or consequential damages arising from the use of our products or website.</p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
