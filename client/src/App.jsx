import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import ProtectedRoute from './components/ProtectedRoute';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { AuthProvider } from './context/AuthContext';
import { AudioProvider } from './context/AudioContext';

// Old Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import Login from './pages/Login';

// New Phase Pages
import Phase1Intro from './pages/Phase1Intro';
import Phase2Keyhole from './pages/Phase2Keyhole';
import Phase3Orbit from './pages/Phase3Orbit';
import Phase4Whispers from './pages/Phase4Whispers';
import CelestialTimeline from './pages/Phase5CelestialTimeline';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <AudioProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/secret-admin/login" element={<AdminLogin />} />
              
              <Route
                path="/secret-admin"
                element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                }
              />

              {/* --- THE NEW BIRTHDAY FLOW --- */}
              <Route
                path="/intro"
                element={
                  <ProtectedRoute>
                    <Phase1Intro />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/keyhole"
                element={
                  <ProtectedRoute>
                    <Phase2Keyhole />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orbit"
                element={
                  <ProtectedRoute>
                    <Phase3Orbit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/whispers"
                element={
                  <ProtectedRoute>
                    <Phase4Whispers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stars"
                element={
                  <ProtectedRoute>
                    <CelestialTimeline />
                  </ProtectedRoute>
                }
              />

              {/* If they type a wrong URL, send them back to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </AudioProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;