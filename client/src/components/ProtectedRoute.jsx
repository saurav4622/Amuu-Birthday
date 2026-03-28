import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ProtectedRoute.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. WHILE LOADING: We show a cinematic "Authenticating" screen.
  // This prevents the "Navigate" component from firing until we are 100% sure.
  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#02040a]">
        <div className="relative">
          {/* A soft glowing pulse effect */}
          <div className="absolute inset-0 animate-ping rounded-full bg-fuchsia-500/20" />
          <div className="relative h-12 w-12 border-t-2 border-fuchsia-500 rounded-full animate-spin" />
        </div>
        <p className="mt-8 text-[10px] uppercase tracking-[0.6em] text-fuchsia-400 animate-pulse font-bold">
          Verifying Universe...
        </p>
      </div>
    );
  }

  // 2. IF NOT LOGGED IN: Redirect to login.
  // We use state: { from: location } to remember where they were trying to go.
  if (!loading && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. IF AUTHENTICATED: Show the birthday content!
  return children;
};

export default ProtectedRoute;