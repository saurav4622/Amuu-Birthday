import { useState } from 'react';
import './BirthdayCard.css';

const BirthdayCard = ({ birthdayInfo, messageData }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [sparkles, setSparkles] = useState([]);

  const handleMouseEnter = () => {
    const sparkleEmojis = ['✨', '⭐', '💫', '🌟'];
    const newSparkles = [];
    
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        newSparkles.push({
          id: Date.now() + i,
          emoji: sparkleEmojis[Math.floor(Math.random() * sparkleEmojis.length)],
          left: Math.random() * 100,
          top: Math.random() * 100,
        });
        setSparkles([...newSparkles]);
        
        setTimeout(() => {
          setSparkles(prev => prev.filter(s => s.id !== newSparkles[i]?.id));
        }, 1000);
      }, i * 100);
    }
  };

  return (
    <div 
      className="card"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div className={`card-inner ${isFlipped ? 'flipped' : ''}`}>
        <div className="card-front">
          <div className="birthday-icon">{birthdayInfo.icon}</div>
          <h1 className="title">{birthdayInfo.title}</h1>
          <p className="subtitle">{birthdayInfo.subtitle}</p>
          <div className="sparkle">✨</div>
        </div>
        
        <div className="card-back">
          <h2 className="message-title">{messageData.title}</h2>
          <div className="message-content">
            {messageData.messages.map((message, index) => (
              <p key={index} className="message-text">{message}</p>
            ))}
          </div>
          <div className="hearts">{messageData.hearts}</div>
        </div>
      </div>
      
      {sparkles.map(sparkle => (
        <div
          key={sparkle.id}
          className="sparkle-effect"
          style={{
            left: `${sparkle.left}%`,
            top: `${sparkle.top}%`,
          }}
        >
          {sparkle.emoji}
        </div>
      ))}
    </div>
  );
};

export default BirthdayCard;
