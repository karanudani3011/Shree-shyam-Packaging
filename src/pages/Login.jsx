import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, ShieldCheck } from 'lucide-react';
import './Login.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'admin'

  const handleLogin = (e) => {
    e.preventDefault();
    login(activeTab);
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="login-page">
      <div className="container login-container">
        <div className="login-box glass">
          <div className="login-tabs">
            <button 
              type="button"
              className={`login-tab ${activeTab === 'user' ? 'active' : ''}`}
              onClick={() => setActiveTab('user')}
            >
              <User size={18} /> User Login
            </button>
            <button 
              type="button"
              className={`login-tab ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              <ShieldCheck size={18} /> Admin Login
            </button>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-header">
              <h2>{activeTab === 'admin' ? 'Admin Portal' : 'Welcome Back'}</h2>
              <p>Sign in to continue your purchase.</p>
            </div>
            
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" required placeholder="Enter your email" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" required placeholder="Enter your password" />
            </div>
            
            {activeTab === 'admin' && (
              <div className="form-group">
                <label>Admin Access Code</label>
                <input type="password" required placeholder="Enter access code" />
              </div>
            )}
            
            <button type="submit" className="btn-login">
              {activeTab === 'admin' ? 'Login as Admin' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
