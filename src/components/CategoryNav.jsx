import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Package,
  Settings,
  CreditCard,
  Box,
  Archive,
  Tag,
  Layers,
  Truck,
  Star,
  Zap,
  Grid,
  Wrench,
  Circle,
  Briefcase,
  Scissors,
  PackageOpen,
} from 'lucide-react';
import './CategoryNav.css';

const categories = [
  { id: 'Pal Bopp bag',              name: 'Pal Bopp Bag',         icon: ShoppingBag },
  { id: 'tape bopp bag',             name: 'Tape Bopp Bag',        icon: Package },
  { id: 'PP Bag',                    name: 'PP Bag',               icon: Grid },
  { id: 'LD Bag',                    name: 'LD Bag',               icon: Zap },
  { id: 'plastic Box',               name: 'Plastic Box',          icon: Box },
  { id: 'Dabbi',                     name: 'Dabbi',                icon: Archive },
  { id: 'Fashion / customised card', name: 'Fashion / Card',       icon: CreditCard },
  { id: 'Cartoon',                   name: 'Cartoon Box',          icon: Layers },
  { id: 'Pati',                      name: 'Pati',                 icon: Circle },
  { id: 'Label',                     name: 'Label',                icon: Tag },
  { id: 'Bubble',                    name: 'Bubble / Polythene',   icon: Star },
  { id: 'customised/small box',      name: 'Customised Box',       icon: PackageOpen },
  { id: 'machines',                  name: 'Machines',             icon: Settings },
  { id: 'peach',                     name: 'Peach',                icon: Wrench },
  { id: 'Bags',                      name: 'Bags',                 icon: Briefcase },
  { id: 'Tapes',                     name: 'Tapes',                icon: Scissors },
  { id: 'Parcel packing items',      name: 'Parcel Packing',       icon: Truck },
];

const CategoryNav = () => {
  return (
    <section className="category-nav">
      <div className="container">
        <h2 className="category-nav-title">Shop by Category</h2>
        <div className="category-grid">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                to={`/products?category=${encodeURIComponent(cat.id)}`}
                key={cat.id}
                className="category-item"
              >
                <div className="category-icon-wrapper">
                  <Icon size={28} />
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
