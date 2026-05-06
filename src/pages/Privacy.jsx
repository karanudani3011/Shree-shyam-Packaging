import React, { useEffect } from 'react';
import './Legal.css';

const Privacy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-page">
      <div className="container">
        <h1 className="legal-title">Privacy Policy</h1>
        <div className="legal-content glass">
          <h2>1. Information We Collect</h2>
          <p>We may collect personal information such as your name, email address, phone number, and shipping address when you register or place an order.</p>

          <h2>2. How We Use Your Information</h2>
          <p>Your information is used to process orders, communicate with you, and improve our services. We do not sell your personal data to third parties.</p>

          <h2>3. Data Security</h2>
          <p>We implement a variety of security measures to maintain the safety of your personal information when you place an order or access your account.</p>

          <h2>4. Cookies</h2>
          <p>Our website uses "cookies" to enhance your experience, gather general visitor information, and track visits to our website.</p>

          <h2>5. Third-Party Disclosures</h2>
          <p>We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties, except trusted partners who assist us in operating our website or servicing you, so long as those parties agree to keep this information confidential.</p>

          <h2>6. Changes to Our Privacy Policy</h2>
          <p>We reserve the right to update this privacy policy at any time. Any changes will be posted on this page.</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
