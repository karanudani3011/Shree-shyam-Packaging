import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  Users, 
  PieChart, 
  Settings, 
  LogOut,
  TrendingUp,
  Box,
  Globe,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import './AdminLayout.css';

const AdminSidebar = () => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { icon: <LayoutDashboard size={22} />, label: 'Dashboard', path: '/admin', permission: null },
    { icon: <Package size={22} />, label: 'Inventory', path: '/admin/inventory', permission: 'stock' },
    { icon: <Receipt size={22} />, label: 'Billing', path: '/admin/billing', permission: ['sale', 'purchase'] },
    { icon: <Users size={22} />, label: 'CRM', path: '/admin/crm', permission: 'sale' },
    { icon: <TrendingUp size={22} />, label: 'Accounting', path: '/admin/accounting', permission: ['income', 'expense'] },
    { icon: <PieChart size={22} />, label: 'Reports', path: '/admin/reports', permission: null },
  ];

  const hasPermission = (item) => {
    if (!item.permission) return true;
    if (currentUser?.role === 'admin') return true;
    
    const permissions = currentUser?.permissions || [];
    if (Array.isArray(item.permission)) {
      return item.permission.some(p => permissions.includes(p));
    }
    return permissions.includes(item.permission);
  };

  const filteredNavItems = navItems.filter(hasPermission);

  return (
    <div className="admin-sidebar">
      <div className="admin-logo">
        <Box size={32} />
        <span>PackERP</span>
      </div>
      
      <nav className="admin-nav">
        {filteredNavItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            end={item.path === '/admin'}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="admin-nav" style={{ marginTop: 'auto', borderTop: '1px solid var(--admin-border)' }}>
        {currentUser?.role === 'admin' && (
          <NavLink to="/admin/settings" className="admin-nav-item">
            <Settings size={22} />
            <span>Settings</span>
          </NavLink>
        )}
        <button onClick={handleLogout} className="admin-nav-item" style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
          <LogOut size={22} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

const AdminLayout = () => {
  const { userRole, isLoggedIn, currentUser } = useAuth();
  const { products, updateProduct } = useERP();
  const navigate = useNavigate();

  const [isStockModalOpen, setIsStockModalOpen] = React.useState(false);
  const [selectedProductId, setSelectedProductId] = React.useState('');
  const [adjustType, setAdjustType] = React.useState('add'); // 'add' or 'set'
  const [adjustQty, setAdjustQty] = React.useState('');
  const [updatingStock, setUpdatingStock] = React.useState(false);

  // Protect Admin Routes
  React.useEffect(() => {
    if (!isLoggedIn || (userRole !== 'admin' && userRole !== 'staff')) {
      navigate('/admin/login');
    }
  }, [userRole, isLoggedIn, navigate]);

  if (!isLoggedIn || (userRole !== 'admin' && userRole !== 'staff')) {
    return null; // Don't render anything while redirecting
  }

  const handleQuickStockUpdate = async (e) => {
    e.preventDefault();
    if (!selectedProductId) return alert('Please select a product');
    if (adjustQty === '') return alert('Please enter a quantity');

    setUpdatingStock(true);
    const product = products.find(p => p.id === Number(selectedProductId));
    if (product) {
      const newStock = adjustType === 'add' 
        ? (product.stock || 0) + Number(adjustQty)
        : Number(adjustQty);

      if (newStock < 0) {
        alert('Stock cannot be negative');
        setUpdatingStock(false);
        return;
      }

      const { success, error } = await updateProduct(product.id, { stock: newStock });
      if (success) {
        alert(`Stock updated successfully! New stock: ${newStock}`);
        setIsStockModalOpen(false);
        setSelectedProductId('');
        setAdjustQty('');
      } else {
        alert('Failed to update stock: ' + (error?.message || 'Unknown error'));
      }
    }
    setUpdatingStock(false);
  };

  const handleGoToClient = () => {
    // Force window location change to bypass React Router's Navigate logic in App.jsx if needed
    // or just navigate to / and ensure App.jsx allows it.
    window.location.href = '/';
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-title-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h1>PackERP Business Suite</h1>
              <span className={`status-badge ${userRole === 'admin' ? 'paid' : 'pending'}`} style={{ fontSize: '0.65rem' }}>
                {userRole.toUpperCase()}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
              <p>Welcome back, {currentUser?.username || 'Administrator'}</p>
              {userRole !== 'admin' && currentUser?.permissions && (
                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                  {currentUser.permissions.map(p => (
                    <span key={p} className="status-badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--admin-text-dim)', fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="admin-actions">
            <button className="glass-btn" onClick={handleGoToClient} title="Go to Client Side">
              <Globe size={18} />
              Go to Client Side
            </button>
            <button className="glass-btn" onClick={() => setIsStockModalOpen(true)} title="Quick Stock Update">
              <Package size={18} />
              Quick Stock Update
            </button>
          </div>
        </header>
        <Outlet />
      </main>

      {isStockModalOpen && (
        <div className="modal-overlay" onClick={() => setIsStockModalOpen(false)}>
          <div className="modal-content glass-morphism animate-slideUp" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="card-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Package size={22} color="var(--admin-primary)" />
                Quick Stock Update
              </h3>
              <button className="icon-btn" onClick={() => setIsStockModalOpen(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleQuickStockUpdate} className="form-grid" style={{ marginTop: '1rem' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Select Product</label>
                <select 
                  value={selectedProductId} 
                  onChange={e => {
                    setSelectedProductId(e.target.value);
                    setAdjustQty('');
                  }}
                  required
                >
                  <option value="">-- Choose a Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
                  ))}
                </select>
              </div>

              {selectedProductId && (() => {
                const p = products.find(prod => prod.id === Number(selectedProductId));
                return p ? (
                  <>
                    <div className="form-group" style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--admin-text-dim)' }}>Current Stock: </span>
                      <strong style={{ color: 'white', fontSize: '1rem' }}>{p.stock} units</strong>
                    </div>

                    <div className="form-group">
                      <label>Update Action</label>
                      <select value={adjustType} onChange={e => setAdjustType(e.target.value)}>
                        <option value="add">Add to Stock (+)</option>
                        <option value="set">Set Total Stock (=)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>{adjustType === 'add' ? 'Quantity to Add' : 'New Total Stock'}</label>
                      <input 
                        type="number" 
                        required 
                        min={adjustType === 'add' ? undefined : 0}
                        value={adjustQty}
                        onChange={e => setAdjustQty(e.target.value)}
                        placeholder={adjustType === 'add' ? 'e.g. 50 or -20' : 'e.g. 150'}
                      />
                    </div>
                  </>
                ) : null;
              })()}

              <button type="submit" className="glass-btn" style={{ gridColumn: 'span 2', marginTop: '1.5rem', background: 'var(--admin-primary)', justifyContent: 'center', padding: '1rem' }} disabled={updatingStock}>
                {updatingStock ? 'Updating...' : 'Update Stock'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


export default AdminLayout;
