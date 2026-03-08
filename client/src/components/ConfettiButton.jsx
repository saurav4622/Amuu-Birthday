import './ConfettiButton.css';

const ConfettiButton = ({ onTrigger }) => {
  return (
    <button className="confetti-btn" onClick={onTrigger}>
      More Confetti! 🎊
    </button>
  );
};

export default ConfettiButton;
