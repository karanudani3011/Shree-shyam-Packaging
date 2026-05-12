import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Banner from '../components/Banner';
import CategoryNav from '../components/CategoryNav';
import ProductCard from '../components/ProductCard';
import { useERP } from '../context/ERPContext';
import './Home.css';

const Home = () => {
  const { products } = useERP();

  // Filter out products for display sections
  const inStockProducts = products.filter(p => !p.outOfStock);
  const bestSellers = inStockProducts.slice(0, 4);
  const newArrivals = [...products].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);

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
