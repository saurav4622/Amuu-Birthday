import axios from 'axios';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const verifySession = useCallback(async (token) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify-session`, { token });
      
      if (response.data.success) {
        // 1. Server confirmed! Update the 'temp' user with real data
        setUser({ email: response.data.email, token });
      } 
      // NOTE: We removed the "else { setUser(null) }" here to prevent kicking.

    } catch (error) {
      // 2. REPAIR: If the server returns 401 or is offline, we SILENTLY fail.
      // We do NOT call setUser(null) here. This keeps the optimistic session alive.
      console.warn("Background sync failed, keeping local session active.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // 3. REPAIR: Set the user immediately. 
      // This ensures ProtectedRoute sees a user on the VERY FIRST render.
      setUser({ email: 'User', token }); 
      
      // 4. Verify in the background without blocking the UI
      verifySession(token);
    } else {
      setLoading(false);
    }
  }, [verifySession]);

  const login = async (email, otp) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify-otp`, { email, otp });
      if (response.data.success) {
        localStorage.setItem('authToken', response.data.token);
        setUser({ email: response.data.email, token: response.data.token });
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed.',
      };
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`, { token });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    // 5. REPAIR: Explicit logout is the only way to actually clear the session now.
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const requestOTP = async (email) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/request-otp`, { email });
      return response.data;
    } catch (error) {
      return { success: false, message: 'Failed to send OTP.' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, requestOTP, loading }}>
      {children}
    </AuthContext.Provider>
  );
};