import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import ProtectedRoute from './components/ProtectedRoute';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { AuthProvider } from './context/AuthContext';

// Old Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Gallery from './pages/Gallery';
import Login from './pages/Login';
import Messages from './pages/Messages';

// New Phase Pages
import Phase2Keyhole from './pages/Phase2Keyhole';
import Phase3Orbit from './pages/Phase3Orbit';
import Phase4Whispers from './pages/Phase4Whispers';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
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

            {/* --- OLD PAGES (You can delete these later if you want) --- */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gallery"
              element={
                <ProtectedRoute>
                  <Gallery />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />

            {/* If they type a wrong URL, send them back to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;