import { useEffect, useState } from 'react';
import './ConfettiContainer.css';

const ConfettiContainer = ({ trigger }) => {
  const [confettiPieces, setConfettiPieces] = useState([]);

  const createConfetti = () => {
    const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ff8b94', '#c7ceea', '#ffd93d'];
    const pieces = [];
    
    for (let i = 0; i < 100; i++) {
      pieces.push({
        id: Date.now() + i + Math.random(),
        left: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        width: Math.random() * 10 + 5,
        height: Math.random() * 10 + 5,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 2,
        opacity: Math.random(),
        borderRadius: Math.random() > 0.5 ? '50%' : '0%',
      });
    }
    
    setConfettiPieces(pieces);
    
    // Remove confetti after animation
    setTimeout(() => {
      setConfettiPieces([]);
    }, 5000);
  };

  useEffect(() => {
    createConfetti();
    
    // Periodic confetti bursts
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        createConfetti();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (trigger > 0) {
      createConfetti();
    }
  }, [trigger]);


  return (
    <div className="confetti-container">
      {confettiPieces.map(piece => (
        <div
          key={piece.id}
          className="confetti"
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.color,
            width: `${piece.width}px`,
            height: `${piece.height}px`,
            animationDuration: `${piece.duration}s`,
            animationDelay: `${piece.delay}s`,
            opacity: piece.opacity,
            borderRadius: piece.borderRadius,
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiContainer;
