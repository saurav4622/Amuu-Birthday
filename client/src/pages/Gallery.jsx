import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Stars from '../components/Stars';
import './Gallery.css';

const Gallery = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Placeholder images - replace with actual photos
  const photos = [
    { id: 1, emoji: '📸', title: 'Beautiful Memories' },
    { id: 2, emoji: '💕', title: 'Special Moments' },
    { id: 3, emoji: '🎈', title: 'Celebrations' },
    { id: 4, emoji: '🌹', title: 'Love & Joy' },
    { id: 5, emoji: '✨', title: 'Magical Times' },
    { id: 6, emoji: '🎂', title: 'Birthday Fun' },
  ];

  return (
    <div className="gallery-page">
      <Stars />
      <nav className="gallery-nav">
        <div className="nav-content">
          <h2>📸 Photo Gallery</h2>
          <div className="nav-links">
            <button onClick={() => navigate('/dashboard')} className="nav-link">Dashboard</button>
            <button onClick={() => navigate('/messages')} className="nav-link">Messages</button>
            <span className="user-email">{user?.email}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </nav>

      <div className="gallery-container">
        <div className="gallery-header">
          <h1>🎉 Your Special Moments</h1>
          <p>Beautiful memories we've shared together</p>
        </div>

        <div className="photo-grid">
          {photos.map((photo) => (
            <div key={photo.id} className="photo-card">
              <div className="photo-placeholder">
                <div className="photo-emoji">{photo.emoji}</div>
                <p className="photo-title">{photo.title}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="gallery-note">
          <p>💡 Tip: Add your favorite photos here to make this gallery special!</p>
        </div>
      </div>
    </div>
  );
};

export default Gallery;
