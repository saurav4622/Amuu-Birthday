import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Stars from '../components/Stars';
import './Messages.css';

const Messages = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const messages = [
    {
      id: 1,
      emoji: '💕',
      title: 'You Are Amazing',
      content: 'Every day with you is a gift. Your smile lights up my world and your kindness touches everyone around you.',
    },
    {
      id: 2,
      emoji: '🌟',
      title: 'A Special Day',
      content: 'Today we celebrate you - the incredible person who brings so much joy and love into my life.',
    },
    {
      id: 3,
      emoji: '🎈',
      title: 'Birthday Wishes',
      content: 'May this year bring you endless happiness, amazing adventures, and all the dreams your heart desires.',
    },
    {
      id: 4,
      emoji: '🌹',
      title: 'With Love',
      content: 'Thank you for being exactly who you are. You make every moment special and every day brighter.',
    },
  ];

  return (
    <div className="messages-page">
      <Stars />
      <nav className="messages-nav">
        <div className="nav-content">
          <h2>💌 Special Messages</h2>
          <div className="nav-links">
            <button onClick={() => navigate('/dashboard')} className="nav-link">Dashboard</button>
            <button onClick={() => navigate('/gallery')} className="nav-link">Gallery</button>
            <span className="user-email">{user?.email}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </nav>

      <div className="messages-container">
        <div className="messages-header">
          <h1>💖 Messages Just For You</h1>
          <p>Heartfelt words to celebrate your special day</p>
        </div>

        <div className="messages-grid">
          {messages.map((message, index) => (
            <div key={message.id} className="message-card" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="message-emoji">{message.emoji}</div>
              <h3 className="message-title">{message.title}</h3>
              <p className="message-content">{message.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Messages;
