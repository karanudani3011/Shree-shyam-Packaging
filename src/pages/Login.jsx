import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import './Login.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('user'); 
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    password: ''
  });

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (activeTab === 'admin') {
      // Password changed to 'admin123' (no space)
      if (formData.id === 'admin' && formData.password === 'admin123') {
        login('admin');
        navigate('/admin');
      } else {
        setError('Unauthorized Admin Access');
      }
    } else {
      // User login - no real validation needed as per request
      login('user');
      navigate('/');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="login-container-premium">
        <div className="login-glass-card">
          <div className="login-left-brand">
            <div className="brand-content">
              <h1>Pack<span>ERP</span></h1>
              <p>The ultimate packaging management solution for modern businesses.</p>
              <div className="brand-features">
                <div className="feat-item"><div className="dot"></div> Inventory Sync</div>
                <div className="feat-item"><div className="dot"></div> GST Billing</div>
                <div className="feat-item"><div className="dot"></div> CRM Analytics</div>
              </div>
            </div>
          </div>

          <div className="login-right-form">
            <div className="login-tabs-premium">
              <button 
                className={`tab-btn ${activeTab === 'user' ? 'active' : ''}`}
                onClick={() => setActiveTab('user')}
              >
                <User size={18} /> Customer
              </button>
              <button 
                className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin')}
              >
                <ShieldCheck size={18} /> Admin
              </button>
            </div>

            <form className="premium-form" onSubmit={handleLogin}>
              <div className="form-header">
                <h2>{activeTab === 'admin' ? 'Admin Portal' : 'Customer Sign In'}</h2>
                <p>{activeTab === 'admin' ? 'Enter credentials to manage your store.' : 'Welcome back! Please enter your details.'}</p>
              </div>

              {error && <div className="error-alert">{error}</div>}

              <div className="input-group-premium">
                <label>{activeTab === 'admin' ? 'Admin Username' : 'Email Address'}</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input 
                    type="text" 
                    placeholder={activeTab === 'admin' ? 'admin' : 'your@email.com'} 
                    required 
                    value={formData.id}
                    onChange={(e) => setFormData({...formData, id: e.target.value})}
                  />
                </div>
              </div>

              <div className="input-group-premium">
                <label>Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn-premium">
                {activeTab === 'admin' ? 'Launch Dashboard' : 'Sign In'}
                <ArrowRight size={20} />
              </button>

              <div className="form-footer">
                {activeTab === 'user' ? (
                  <p>Don't have an account? <span className="link">Register here</span></p>
                ) : (
                  <p>Forgot access code? <span className="link">Contact Support</span></p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
