import { createContext, useContext, useEffect, useState } from 'react';

const ADMIN_SESSION_KEY = 'adminSession';
const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

const ADMIN_PASSWORD = 'admin123';

export const AdminAuthProvider = ({ children }) => {
  // REPAIR: Initialize as false to ensure the default state is 'Locked'
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem(ADMIN_SESSION_KEY);
    
    // REPAIR: Explicitly check for 'true' string and set boolean
    if (session === 'true') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
    
    // Crucial: Only set loading to false AFTER the check is done
    setLoading(false);
  }, []);

  const login = (password) => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_SESSION_KEY, 'true');
      setIsAdmin(true);
      return { success: true };
    }
    return { success: false, message: 'Incorrect password' };
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAdmin(false);
    // Force a reload to clear any cached states if needed
    window.location.href = '/secret-admin/login';
  };

  return (
    <AdminAuthContext.Provider value={{ isAdmin, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};