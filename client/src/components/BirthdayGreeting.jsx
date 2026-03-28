import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const BirthdayGreeting = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenGreeting');
    if (!hasSeen) {
      setIsVisible(true);
    }
  }, []);

  const handleStart = () => {
    localStorage.setItem('hasSeenGreeting', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md text-white px-6 text-center select-none"
          style={{ zIndex: 9999 }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1.5 }}
            className="text-5xl md:text-7xl font-serif text-fuchsia-300 drop-shadow-xl mb-6 tracking-wide"
          >
            Happy Birthday, Amuu.
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 1.5 }}
            className="text-lg md:text-xl font-light tracking-[0.2em] uppercase text-white/70 mb-12 max-w-2xl leading-relaxed"
          >
            The stars have aligned for you today. Your journey begins now.
          </motion.p>
          
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 1 }}
            onClick={handleStart}
            className="px-8 py-4 bg-fuchsia-600/20 border border-fuchsia-500/50 rounded-full text-sm md:text-base text-fuchsia-300 uppercase tracking-[0.3em] font-bold hover:scale-105 hover:bg-fuchsia-600/40 transition-all shadow-[0_0_20px_rgba(232,121,249,0.5)] cursor-pointer backdrop-blur-md"
          >
            Start Journey
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BirthdayGreeting;
