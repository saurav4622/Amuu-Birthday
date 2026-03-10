import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import './AdminLogin.css';

function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const result = login(password);
    if (result.success) {
      navigate('/secret-admin', { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <h1>Admin Access</h1>
        <p className="admin-login-hint">Enter the secret key to continue.</p>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            autoComplete="current-password"
          />
          {error && <p className="admin-login-error">{error}</p>}
          <button type="submit">Unlock</button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
