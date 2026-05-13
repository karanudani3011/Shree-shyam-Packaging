import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Client Pages
import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import About from './pages/About';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminInventory from './pages/admin/AdminInventory';
import AdminBilling from './pages/admin/AdminBilling';
import AdminCRM from './pages/admin/AdminCRM';
import AdminAccounting from './pages/admin/AdminAccounting';
import AdminReports from './pages/admin/AdminReports';
import AdminLogin from './pages/admin/AdminLogin';
import AdminEditProduct from './pages/admin/AdminEditProduct';

const App = () => {
  const { isLoggedIn, userRole } = useAuth();

  return (
    <Routes>
      {/* 1. Login Routes */}
      <Route 
        path="/login" 
        element={!isLoggedIn ? <Login /> : <Navigate to={userRole === 'admin' ? "/admin" : "/"} replace />} 
      />
      <Route 
        path="/admin/login" 
        element={
          !isLoggedIn ? <AdminLogin /> : 
          (userRole === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/" replace />)
        } 
      />

      {/* 2. Admin Protected Routes */}
      <Route path="/admin" element={isLoggedIn && userRole === 'admin' ? <AdminLayout /> : <Navigate to="/admin/login" replace />}>
        <Route index element={<AdminDashboard />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="inventory/edit/:id" element={<AdminEditProduct />} />
        <Route path="billing" element={<AdminBilling />} />
        <Route path="crm" element={<AdminCRM />} />
        <Route path="accounting" element={<AdminAccounting />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      {/* 3. Customer Routes & Global Layout */}
      <Route 
        path="/" 
        element={!isLoggedIn ? <Navigate to="/login" replace /> : (userRole === 'admin' ? <Navigate to="/admin" replace /> : (
          <div className="app">
            <Header />
            <CartSidebar />
            <main className="main-content">
              <Home />
            </main>
            <Footer />
          </div>
        ))} 
      />
      
      <Route path="/products" element={isLoggedIn && userRole === 'user' ? <div className="app"><Header /><CartSidebar /><main className="main-content"><ProductListing /></main><Footer /></div> : <Navigate to="/login" replace />} />
      <Route path="/product/:id" element={isLoggedIn && userRole === 'user' ? <div className="app"><Header /><CartSidebar /><main className="main-content"><ProductDetails /></main><Footer /></div> : <Navigate to="/login" replace />} />
      <Route path="/about" element={isLoggedIn && userRole === 'user' ? <div className="app"><Header /><main className="main-content"><About /></main><Footer /></div> : <Navigate to="/login" replace />} />
      <Route path="/terms" element={isLoggedIn && userRole === 'user' ? <div className="app"><Header /><main className="main-content"><Terms /></main><Footer /></div> : <Navigate to="/login" replace />} />
      <Route path="/privacy" element={isLoggedIn && userRole === 'user' ? <div className="app"><Header /><main className="main-content"><Privacy /></main><Footer /></div> : <Navigate to="/login" replace />} />

      {/* 4. Global Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
