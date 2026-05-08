import React from 'react';
import { Package, Award, Users, Target } from 'lucide-react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <h1 className="hero-title">About Shree Shyam Packaging</h1>
          <p className="hero-subtitle">
            Your trusted partner in premium, reliable, and sustainable packaging solutions since 2010.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="about-section bg-surface">
        <div className="container about-grid">
          <div className="about-content">
            <h2 className="section-title">Our Story</h2>
            <p>
              Founded with a vision to revolutionize the packaging industry, Shree Shyam Packaging started as a small local distributor. Over the years, our unwavering commitment to quality and customer satisfaction has helped us grow into a leading provider of innovative packaging solutions across the nation.
            </p>
            <p>
              We understand that packaging is not just about protecting products; it's about presenting your brand. That's why we combine state-of-the-art technology with sustainable practices to deliver products that truly make a difference.
            </p>
          </div>
          <div className="about-image">
            <img src="/product.png" alt="Our Warehouse" className="story-img glow-card" />
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="about-section">
        <div className="container">
          <h2 className="section-title text-center">Our Core Values</h2>
          <div className="values-grid">
            <div className="value-card glow-card">
              <Award className="value-icon" size={40} />
              <h3>Quality First</h3>
              <p>We never compromise on the quality of our materials, ensuring your products are always well-protected.</p>
            </div>
            <div className="value-card glow-card">
              <Package className="value-icon" size={40} />
              <h3>Innovation</h3>
              <p>Constantly exploring new materials and designs to bring you the latest in packaging technology.</p>
            </div>
            <div className="value-card glow-card">
              <Users className="value-icon" size={40} />
              <h3>Customer Success</h3>
              <p>Your success is our success. We provide personalized support to meet your unique business needs.</p>
            </div>
            <div className="value-card glow-card">
              <Target className="value-icon" size={40} />
              <h3>Sustainability</h3>
              <p>Committed to eco-friendly solutions that reduce environmental impact without sacrificing performance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats/Milestones */}
      <section className="about-section bg-surface stats-section">
        <div className="container stats-container">
          <div className="stat-item">
            <h3 className="stat-number">10+</h3>
            <p className="stat-label">Years of Experience</p>
          </div>
          <div className="stat-item">
            <h3 className="stat-number">5000+</h3>
            <p className="stat-label">Happy Clients</p>
          </div>
          <div className="stat-item">
            <h3 className="stat-number">50M+</h3>
            <p className="stat-label">Products Delivered</p>
          </div>
          <div className="stat-item">
            <h3 className="stat-number">24/7</h3>
            <p className="stat-label">Customer Support</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
