import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import './ProtectedRoute.css';

const AdminProtectedRoute = ({ children }) => {
  const { isAdmin, ready } = useAdminAuth();

  if (!ready) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/secret-admin/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
