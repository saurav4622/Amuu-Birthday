import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminProtectedRoute = ({ children }) => {
  const { isAdmin, loading } = useAdminAuth();

  // 1. If we are still reading from localStorage, show nothing.
  // This prevents the "flash" of the dashboard before the redirect.
  if (loading) {
    return null; 
  }

  // 2. CRITICAL: If isAdmin is NOT true, force them to the login page.
  // This is the line that was likely missing or broken.
  if (isAdmin !== true) {
    return <Navigate to="/secret-admin/login" replace />;
  }

  // 3. Only if they are a verified admin do we show the Dashboard.
  return children;
};

export default AdminProtectedRoute;