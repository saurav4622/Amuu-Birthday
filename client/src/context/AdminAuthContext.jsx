import { createContext, useContext, useState, useEffect } from 'react';

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem(ADMIN_SESSION_KEY);
    setIsAdmin(session === 'true');
    setReady(true);
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
  };

  return (
    <AdminAuthContext.Provider value={{ isAdmin, login, logout, ready }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
