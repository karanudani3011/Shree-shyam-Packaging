import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './Banner.css';

const slides = [
  {
    id: 1,
    image: '/banner.png',
    subtitle: 'Premium Packaging Solutions',
    title: 'Industrial & Custom Boxes',
    description: 'High-quality corrugated boxes designed for durability and aesthetic appeal. Perfect for e-commerce and retail.',
    link: '/products?category=boxes'
  },
  {
    id: 2,
    image: '/banner.png', // Reusing the high-quality generated banner image for the prototype
    subtitle: 'Eco-Friendly Options',
    title: 'Sustainable Paper Bags',
    description: 'Reduce your carbon footprint with our premium, recyclable paper bags. Available in all sizes.',
    link: '/products?category=bags'
  },
  {
    id: 3,
    image: '/banner.png',
    subtitle: 'Advanced Machinery',
    title: 'Packaging Machines',
    description: 'Automate your packaging line with our state-of-the-art strapping and sealing machines.',
    link: '/products?category=machines'
  }
];

const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="banner-wrapper">
      {slides.map((slide, index) => (
        <div key={slide.id} className={`banner-slide ${index === currentSlide ? 'active' : ''}`}>
          <img src={slide.image} alt={slide.title} className="banner-image" />
          <div className="banner-overlay"></div>
          
          <div className="container">
            <div className="banner-content animate-fade-in">
              <span className="banner-subtitle">{slide.subtitle}</span>
              <h2 className="banner-title">{slide.title}</h2>
              <p className="banner-description">{slide.description}</p>
              <Link to={slide.link} className="btn btn-primary">
                Explore Now <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      ))}
      
      <div className="banner-controls">
        {slides.map((_, index) => (
          <div 
            key={index} 
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Banner;
