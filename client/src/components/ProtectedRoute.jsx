import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ProtectedRoute.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // 1. If Firebase is still determining if the user is logged in, show a loader
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  // 2. If the user is NOT logged in, redirect them to the login page immediately
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. If they are authenticated, let them see the content
  return children;
};

export default ProtectedRoute;