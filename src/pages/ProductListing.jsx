import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { mockProducts } from './Home';
import './ProductListing.css';

const categories = ['All', 'Boxes', 'Bags', 'Polythene', 'Machines', 'Cards'];

const ProductListing = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryParam = searchParams.get('category');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    if (categoryParam) {
      const formatted = categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1);
      setSelectedCategory(formatted);
    }
  }, [categoryParam]);

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.dimensions.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortOption === 'price-low') {
      const priceA = a.price !== null ? a.price : Infinity;
      const priceB = b.price !== null ? b.price : Infinity;
      return priceA - priceB;
    }
    if (sortOption === 'price-high') {
      const priceA = a.price !== null ? a.price : -Infinity;
      const priceB = b.price !== null ? b.price : -Infinity;
      return priceB - priceA;
    }
    // newest by default
    return new Date(b.date) - new Date(a.date);
  });

  return (
    <div className="product-listing-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Products</h1>
        </div>

        <div className="listing-container">
          <aside className="filters-sidebar">
            <div className="filter-group">
              <h3 className="filter-title">Categories</h3>
              <div className="filter-options">
                {categories.map(cat => (
                  <label key={cat} className="filter-label">
                    <input 
                      type="radio" 
                      name="category" 
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(cat)}
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </div>
            
            <div className="filter-group">
              <h3 className="filter-title">Size / Dimensions</h3>
              <div className="filter-options">
                <label className="filter-label">
                  <input type="checkbox" /> Small
                </label>
                <label className="filter-label">
                  <input type="checkbox" /> Medium
                </label>
                <label className="filter-label">
                  <input type="checkbox" /> Large
                </label>
              </div>
            </div>
          </aside>

          <main className="products-content">
            <div className="products-header">
              <div className="search-filter">
                <Search size={18} color="var(--text-muted)" />
                <input 
                  type="text" 
                  placeholder="Search products by name, size..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <select 
                className="sort-dropdown"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="newest">Newest → Oldest</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
              </select>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="products-grid">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="no-results">
                No products found matching your criteria.
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
