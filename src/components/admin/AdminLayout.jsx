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
  Box
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const AdminSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { icon: <LayoutDashboard size={22} />, label: 'Dashboard', path: '/admin' },
    { icon: <Package size={22} />, label: 'Inventory', path: '/admin/inventory' },
    { icon: <Receipt size={22} />, label: 'Billing', path: '/admin/billing' },
    { icon: <Users size={22} />, label: 'CRM', path: '/admin/crm' },
    { icon: <TrendingUp size={22} />, label: 'Accounting', path: '/admin/accounting' },
    { icon: <PieChart size={22} />, label: 'Reports', path: '/admin/reports' },
  ];

  return (
    <div className="admin-sidebar">
      <div className="admin-logo">
        <Box size={32} />
        <span>PackERP</span>
      </div>
      
      <nav className="admin-nav">
        {navItems.map((item) => (
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
        <NavLink to="/admin/settings" className="admin-nav-item">
          <Settings size={22} />
          <span>Settings</span>
        </NavLink>
        <button onClick={handleLogout} className="admin-nav-item" style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
          <LogOut size={22} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

const AdminLayout = () => {
  const { userRole, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Protect Admin Routes
  React.useEffect(() => {
    if (!isLoggedIn || userRole !== 'admin') {
      navigate('/login');
    }
  }, [userRole, isLoggedIn, navigate]);

  if (!isLoggedIn || userRole !== 'admin') {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-title-section">
            <h1>PackERP Business Suite</h1>
            <p>Welcome back, Administrator</p>
          </div>
          <div className="admin-actions">
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
