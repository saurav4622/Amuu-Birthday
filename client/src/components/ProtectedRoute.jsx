import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ProtectedRoute.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // TODO: REVERT BEFORE DEPLOY - Bypassing auth for UI development
  return children;
  
  /*
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
  */
};

export default ProtectedRoute;
