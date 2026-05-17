import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, Box } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AdminPages.css';
import '../Login.css'; // Reusing some base login styles but with admin overrides

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(email, password, true);
    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.message || 'Invalid Administrator Credentials');
    }
  };

  return (
    <div className="login-wrapper admin-login-theme">
      <div className="login-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>

      <div className="login-container-premium">
        <div className="login-glass-card glass-morphism" style={{ maxWidth: '500px', margin: '0 auto', gridTemplateColumns: '1fr' }}>
          <div className="login-right-form" style={{ padding: '4rem' }}>
            <div className="brand-icon-admin" style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <div className="stat-icon" style={{ margin: '0 auto', width: '64px', height: '64px', background: 'var(--admin-primary)', color: 'white' }}>
                <ShieldCheck size={32} />
              </div>
            </div>

            <div className="form-header" style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '2rem' }}>Admin <span>Portal</span></h2>
              <p>Secure Enterprise Access Only</p>
            </div>

            {error && <div className="error-alert animate-shake">{error}</div>}

            <form onSubmit={handleLogin} style={{ marginTop: '2.5rem' }}>
              <div className="input-group-premium">
                <label>Admin ID</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={20} />
                  <input
                    type="text"
                    placeholder="Enter Admin Username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group-premium">
                <label>Security Key</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={20} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn-premium" style={{ background: 'var(--admin-primary)' }}>
                <span>Authenticate</span>
                <ArrowRight size={20} />
              </button>
            </form>

            <div className="form-footer" style={{ marginTop: '3rem' }}>
              <p>© 2026 PackStore ERP Security System</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
