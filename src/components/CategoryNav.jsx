import React from 'react';
import { Link } from 'react-router-dom';
import { Box, ShoppingBag, Package, Settings, CreditCard } from 'lucide-react';
import './CategoryNav.css';

const categories = [
  { id: 'box', name: 'Box', icon: Box },
  { id: 'bag', name: 'Bag', icon: ShoppingBag },
  { id: 'polythene', name: 'Polythene', icon: Package },
  { id: 'machine', name: 'Machine', icon: Settings },
  { id: 'cards', name: 'Cards', icon: CreditCard },
];

const CategoryNav = () => {
  return (
    <section className="category-nav">
      <div className="container">
        <div className="category-grid">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link to={`/products?category=${cat.id}`} key={cat.id} className="category-item">
                <div className="category-icon-wrapper">
                  <Icon size={32} />
                </div>
                <span className="category-name">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryNav;
