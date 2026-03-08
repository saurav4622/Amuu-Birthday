import './FloatingElements.css';

const FloatingElements = () => {
  const emojis = ['🎈', '🎁', '🎊', '💐', '⭐', '🌹'];

  return (
    <div className="floating-elements">
      {emojis.map((emoji, index) => (
        <span 
          key={index} 
          className="emoji"
          style={{ animationDelay: `${index * 2}s` }}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
};

export default FloatingElements;
