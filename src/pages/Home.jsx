import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Banner from '../components/Banner';
import CategoryNav from '../components/CategoryNav';
import ProductCard from '../components/ProductCard';
import './Home.css';

// Mock data for display
export const mockProducts = [
  {
    id: 1,
    name: 'Premium Corrugated Mailer',
    category: 'Boxes',
    price: 150.00,
    image: '/product.png',
    hasVideo: false,
    dimensions: '10x8x4 inches',
    material: 'Kraft Corrugated Cardboard',
    moq: '500 pcs',
    date: '2023-10-01'
  },
  {
    id: 2,
    name: 'Luxury Rigid Gift Box',
    category: 'Boxes',
    price: 320.00,
    image: '/product.png',
    hasVideo: true,
    dimensions: '12x12x5 inches',
    material: 'Rigid Greyboard with Matte Lamination',
    moq: '200 pcs',
    date: '2023-11-15'
  },
  {
    id: 3,
    name: 'Custom Printed Kraft Bag',
    category: 'Bags',
    price: null, // No price to trigger "Ask to Seller"
    image: '/product.png',
    hasVideo: false,
    dimensions: '10x5x13 inches',
    material: 'Recycled Kraft Paper',
    moq: '1000 pcs',
    date: '2024-01-10'
  },
  {
    id: 4,
    name: 'Industrial Stretch Film',
    category: 'Polythene',
    price: 1200.00,
    image: '/product.png',
    hasVideo: false,
    dimensions: '18 inches x 1500 feet',
    material: 'LLDPE',
    moq: '50 rolls',
    date: '2023-09-05'
  },
  {
    id: 5,
    name: 'Semi-Auto Strapping Machine',
    category: 'Machines',
    price: null, // No price to trigger "Ask to Seller"
    image: '/product.png',
    hasVideo: true,
    dimensions: '900x580x750 mm',
    material: 'Steel Frame',
    moq: '1 unit',
    date: '2024-02-20'
  },
  {
    id: 6,
    name: 'Premium Thank You Cards',
    category: 'Cards',
    price: 15.00,
    image: '/product.png',
    hasVideo: false,
    dimensions: '4x6 inches',
    material: '350gsm Art Paper',
    moq: '1000 pcs',
    date: '2024-03-01'
  }
];

const Home = () => {
  const bestSellers = mockProducts.slice(0, 4);
  const newArrivals = mockProducts.slice(2, 6);

  return (
    <div className="home-page">
      <Banner />
      <CategoryNav />

      <section className="home-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Best Sellers</h2>
            <Link to="/products" className="section-link">
              View All <ArrowRight size={20} />
            </Link>
          </div>
          
          <div className="product-grid">
            {bestSellers.map((product) => (
              <div key={product.id} className="glow-card-wrapper" style={{height: '100%'}}>
                {/* Use a wrapper if you want to apply glow-card class conditionally or always on best sellers */}
                <div style={{height: '100%'}} className="glow-card" >
                   <ProductCard product={product} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section" style={{ backgroundColor: 'var(--bg-card-surface)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">New Arrivals</h2>
            <Link to="/products?sort=newest" className="section-link">
              View All <ArrowRight size={20} />
            </Link>
          </div>
          
          <div className="product-grid">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
