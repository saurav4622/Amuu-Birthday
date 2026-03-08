import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BirthdayCard from '../components/BirthdayCard';
import ConfettiContainer from '../components/ConfettiContainer';
import FloatingElements from '../components/FloatingElements';
import ConfettiButton from '../components/ConfettiButton';
import Stars from '../components/Stars';
import { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [birthdayInfo, setBirthdayInfo] = useState(null);
  const [messageData, setMessageData] = useState(null);
  const [confettiKey, setConfettiKey] = useState(0);

  useEffect(() => {
    // Fetch birthday info from API
    axios.get('/api/birthday-info')
      .then(response => setBirthdayInfo(response.data))
      .catch(error => {
        console.error('Error fetching birthday info:', error);
        setBirthdayInfo({
          title: 'Happy Birthday!',
          subtitle: 'Click to open your surprise',
          icon: '🎂'
        });
      });

    // Fetch message data from API
    axios.get('/api/message')
      .then(response => setMessageData(response.data))
      .catch(error => {
        console.error('Error fetching message:', error);
        setMessageData({
          title: 'To My Amazing Girlfriend',
          messages: [
            'You light up my world every single day. Today, we celebrate you! 🎉',
            'Wishing you the happiest of birthdays filled with love, laughter, and all your favorite things.',
            'Thank you for being you! 💕'
          ],
          hearts: '💖💖💖'
        });
      });
  }, []);

  const triggerConfetti = () => {
    setConfettiKey(prev => prev + 1);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!birthdayInfo || !messageData) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-app">
      <nav className="dashboard-nav">
        <div className="nav-content">
          <h2>🎉 Birthday Surprise</h2>
          <div className="nav-user">
            <button onClick={() => navigate('/gallery')} className="nav-link">Gallery</button>
            <button onClick={() => navigate('/messages')} className="nav-link">Messages</button>
            <span className="user-email">{user?.email}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </nav>
      
      <Stars />
      <ConfettiContainer trigger={confettiKey} />
      <div className="container">
        <BirthdayCard 
          birthdayInfo={birthdayInfo} 
          messageData={messageData}
        />
        <FloatingElements />
        <ConfettiButton onTrigger={triggerConfetti} />
      </div>
    </div>
  );
};

export default Dashboard;
