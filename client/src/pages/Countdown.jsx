import { useEffect, useState } from 'react';

const Countdown = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const TARGET_DATE = new Date("2026-03-30T00:00:00").getTime();

  useEffect(() => {
    // Bypass check for testing
    const params = new URLSearchParams(window.location.search);
    if (params.get('unlock') === 'true') {
      setIsUnlocked(true);
      return;
    }

    const intervalId = setInterval(() => {
      const now = new Date().getTime();
      const distance = TARGET_DATE - now;

      if (distance < 0) {
        setIsUnlocked(true);
        clearInterval(intervalId);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [TARGET_DATE]);

  if (isUnlocked) {
    return children;
  }

  return (
    <div className="min-h-screen bg-[#02040a] flex flex-col items-center justify-center text-white relative overflow-hidden select-none font-sans">
      {/* Background Soft Glow */}
      <div className="absolute w-[500px] h-[500px] bg-fuchsia-500/20 blur-3xl rounded-full pointer-events-none" />
      
      <div className="z-10 flex flex-col items-center space-y-12">
        {/* Pulsing Text */}
        <h1 className="text-xl md:text-3xl font-light tracking-[0.4em] uppercase animate-pulse text-white/80">
          The Universe is Aligning
        </h1>
        
        {/* Timer */}
        <div className="flex space-x-6 md:space-x-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <span className="text-6xl md:text-8xl tabular-nums font-thin text-fuchsia-400 drop-shadow-[0_0_15px_rgba(232,121,249,0.5)]">
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span className="text-[10px] md:text-xs tracking-widest uppercase text-white/40 font-bold">Days</span>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <span className="text-6xl md:text-8xl tabular-nums font-thin text-fuchsia-400 drop-shadow-[0_0_15px_rgba(232,121,249,0.5)]">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-[10px] md:text-xs tracking-widest uppercase text-white/40 font-bold">Hours</span>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <span className="text-6xl md:text-8xl tabular-nums font-thin text-fuchsia-400 drop-shadow-[0_0_15px_rgba(232,121,249,0.5)]">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-[10px] md:text-xs tracking-widest uppercase text-white/40 font-bold">Minutes</span>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <span className="text-6xl md:text-8xl tabular-nums font-thin text-fuchsia-400 drop-shadow-[0_0_15px_rgba(232,121,249,0.5)]">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] md:text-xs tracking-widest uppercase text-white/40 font-bold">Seconds</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Countdown;
