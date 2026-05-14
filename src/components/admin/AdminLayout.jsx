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
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
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
  const navigate = useNavigate();

  // Protect Admin Routes
  React.useEffect(() => {
    if (!isLoggedIn || (userRole !== 'admin' && userRole !== 'staff')) {
      navigate('/admin/login');
    }
  }, [userRole, isLoggedIn, navigate]);

  if (!isLoggedIn || (userRole !== 'admin' && userRole !== 'staff')) {
    return null; // Don't render anything while redirecting
  }

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
            <button className="glass-btn">
              <Package size={18} />
              Quick Stock Update
            </button>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
};


export default AdminLayout;
