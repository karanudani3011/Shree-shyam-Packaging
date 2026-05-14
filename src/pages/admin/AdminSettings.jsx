import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Trash2, 
  Shield, 
  CheckCircle2, 
  XCircle,
  X,
  Lock,
  User,
  Settings as SettingsIcon
} from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../context/AuthContext';
import './AdminPages.css';

const AdminSettings = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'staff',
    permissions: []
  });

  const availablePermissions = [
    { id: 'income', label: 'Income' },
    { id: 'expense', label: 'Expense' },
    { id: 'purchase', label: 'Purchase' },
    { id: 'sale', label: 'Sale' },
    { id: 'stock', label: 'Stock' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data);
    }
    setLoading(false);
  };

  const handlePermissionChange = (permId) => {
    setNewUser(prev => {
      const perms = prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId];
      return { ...prev, permissions: perms };
    });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('admin_users')
      .insert([newUser]);
    
    if (error) {
      alert('Error adding user: ' + error.message);
    } else {
      setShowModal(false);
      setNewUser({ username: '', password: '', role: 'staff', permissions: [] });
      fetchUsers();
    }
  };

  const handleDeleteUser = async (id) => {
    if (id === currentUser.id) {
      alert("You cannot delete your own account!");
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this user?')) {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', id);
      
      if (error) {
        alert('Error deleting user');
      } else {
        fetchUsers();
      }
    }
  };

  if (currentUser?.role !== 'admin') {
    return <div className="admin-card" style={{ padding: '2rem', textAlign: 'center' }}>Access Denied. Only super admins can manage users.</div>;
  }

  return (
    <div className="admin-settings animate-fadeIn">
      <div className="inventory-controls" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>User Management</h2>
          <p style={{ color: 'var(--admin-text-dim)' }}>Manage staff access and specific feature permissions</p>
        </div>
        <button className="glass-btn" onClick={() => setShowModal(true)}>
          <UserPlus size={18} />
          Add New Staff
        </button>
      </div>

      <div className="admin-card admin-table-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading users...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Permissions</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                        <User size={16} />
                      </div>
                      {user.username}
                      {user.id === currentUser.id && <span className="status-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.7rem' }}>You</span>}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${user.role === 'admin' ? 'paid' : 'pending'}`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {user.role === 'admin' ? (
                        <span className="status-badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--admin-primary)' }}>ALL ACCESS</span>
                      ) : (
                        user.permissions.map(p => (
                          <span key={p} className="status-badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--admin-text-dim)', fontSize: '0.75rem' }}>
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                          </span>
                        ))
                      )}
                      {!user.permissions?.length && user.role !== 'admin' && <span style={{ color: 'var(--admin-danger)', fontSize: '0.8rem' }}>No Access</span>}
                    </div>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="icon-btn" 
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.id === currentUser.id}
                      style={{ color: user.id === currentUser.id ? 'var(--admin-text-dim)' : 'var(--admin-danger)' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content glass-morphism animate-slideUp" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="card-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <UserPlus size={22} color="var(--admin-primary)" />
                Create Staff Account
              </h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddUser} className="form-grid">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Username</label>
                <div className="input-with-icon">
                  <User size={16} className="field-icon" />
                  <input 
                    type="text" 
                    required 
                    value={newUser.username}
                    onChange={e => setNewUser({...newUser, username: e.target.value})}
                    placeholder="e.g. karan_staff"
                  />
                </div>
              </div>
              
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Temporary Password</label>
                <div className="input-with-icon">
                  <Lock size={16} className="field-icon" />
                  <input 
                    type="text" 
                    required 
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Set a password"
                  />
                </div>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ marginBottom: '1rem' }}>Feature Access Rights</label>
                <div className="permissions-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {availablePermissions.map(perm => (
                    <div 
                      key={perm.id} 
                      className={`permission-item ${newUser.permissions.includes(perm.id) ? 'active' : ''}`}
                      onClick={() => handlePermissionChange(perm.id)}
                      style={{
                        padding: '0.75rem',
                        background: newUser.permissions.includes(perm.id) ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${newUser.permissions.includes(perm.id) ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {newUser.permissions.includes(perm.id) ? <CheckCircle2 size={18} color="var(--admin-primary)" /> : <Shield size={18} color="var(--admin-text-dim)" />}
                      <span style={{ fontSize: '0.9rem', color: newUser.permissions.includes(perm.id) ? 'white' : 'var(--admin-text-dim)' }}>{perm.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="glass-btn" style={{ gridColumn: 'span 2', marginTop: '1.5rem', background: 'var(--admin-primary)', justifyContent: 'center', padding: '1rem' }}>
                <UserPlus size={18} />
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
