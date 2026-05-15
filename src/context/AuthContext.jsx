import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check saved session on mount
    const checkSession = async () => {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setIsLoggedIn(true);
        setUserRole(user.role);
        setCurrentUser(user);
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const login = async (username, password, isAdminLogin = false) => {
    try {
      if (isAdminLogin) {
        // Strict Admin/Staff login check
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('username', username)
          .eq('password', password)
          .maybeSingle();

        if (!error && data) {
          setIsLoggedIn(true);
          setUserRole(data.role);
          setCurrentUser(data);
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userRole', data.role);
          localStorage.setItem('currentUser', JSON.stringify(data));
          return { success: true, role: data.role };
        }
        
        return { success: false, message: 'Invalid Administrator Credentials' };
      } else {
        // Customer login (Mock for now)
        const mockUser = { id: `cust-${Date.now()}`, username: username || 'Customer', role: 'user' };
        setIsLoggedIn(true);
        setUserRole('user');
        setCurrentUser(mockUser);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', 'user');
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        
        return { success: true, role: 'user' };
      }
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: 'Server error' };
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentUser(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userRole, currentUser, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
