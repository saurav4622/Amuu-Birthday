import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bgValley from '../assets/bg-valley.png';
import birthdayCake from '../assets/birthday-cake.png';
import catEntry from '../assets/cat-entry.png';
import finalGift from '../assets/final-gift.png';
import catHouse from '../assets/cat-house.png';
import rollingCat from '../assets/rolling-cat.png';
import surpriseCat from '../assets/surprise-cat.png';
import BirthdayGreeting from '../components/BirthdayGreeting';
import './Phase1Intro.css';

export default function Phase1Intro() {
  const [step, setStep] = useState('knocking');
  const navigate = useNavigate();

  // Handle the automatic transition after the cat peaks
  useEffect(() => {
    if (step === 'catPeeking') {
      const timer = setTimeout(() => {
        setStep('catSpinning');
      }, 2000); // 2s wait
      return () => clearTimeout(timer);
    } else if (step === 'catSpinning') {
      const timer = setTimeout(() => {
        setStep('partyRevealed');
      }, 3000); // 3s roll
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Trigger confetti burst on Party Reveal
  useEffect(() => {
    if (step === 'partyRevealed') {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6', '#db2777', '#fcd34d']
      });
    }
  }, [step]);

  return (
    <div className="phase1-container relative w-full h-screen overflow-hidden bg-[#87CEEB] flex items-center justify-center">
      <BirthdayGreeting />
      {/* Container matching standard 1920x1080 aspect ratio to pin elements */}
      <div 
        className="relative pointer-events-none"
        style={{ aspectRatio: '1920 / 1080', minWidth: '100vw', minHeight: '100vh' }}
      >
        <img 
          src={bgValley} 
          alt="Valley Background" 
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

      <AnimatePresence mode="wait">
        
        {/* PHASE: KNOCKING & CAT SEQUENCE */}
        {(step === 'knocking' || step === 'catPeeking' || step === 'catSpinning') && (
          <div key="house-scene" className="absolute inset-0 z-10 pointer-events-auto">
            
            {/* 1. THE CATS */}
            <AnimatePresence>
              {step === 'catPeeking' && (
                <motion.img
                  key="peeking-cat"
                  src={catEntry}
                  alt="Peeking Cat"
                  initial={{ scale: 0, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ top: '55.5%', left: '83.28%', width: '5.83%', height: '10.37%' }}
                  className="absolute object-contain z-30"
                />
              )}

              {step === 'catSpinning' && (
                <motion.img
                  key="spinning-cat"
                  src={rollingCat}
                  alt="Spinning Cat"
                  initial={{ top: '55.5%', left: '83.28%', width: '13.33%', height: '23.7%', scale: 1, opacity: 1, rotate: 0 }} 
                  animate={{ top: '55.5%', left: '20%', rotate: -360 }} // Negative rotate to spin leftwards
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{
                    left: { duration: 3, ease: "linear" },
                    rotate: { repeat: Infinity, duration: 0.5, ease: "linear" }
                  }}
                  className="absolute object-contain z-30"
                />
              )}
            </AnimatePresence>

            {/* 2. THE HOUSE */}
            <motion.div
              style={{ top: '47.5%', left: '79.11%', width: '11.98%', height: '22.87%' }}
              className="absolute z-20 cursor-pointer"
              onClick={() => step === 'knocking' && setStep('catPeeking')}
              whileHover={step === 'knocking' ? { scale: 1.05 } : {}}
            >
              <img src={catHouse} alt="Red Farm House" className="w-full h-full object-contain drop-shadow-2xl" />
              {step === 'knocking' && (
                 <motion.div 
                   animate={{ y: [0, -10, 0] }} 
                   transition={{ repeat: Infinity, duration: 2 }}
                   className="absolute -top-[15%] left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg font-bold text-gray-800 whitespace-nowrap"
                 >
                   Knock Knock! ✊
                 </motion.div>
              )}
            </motion.div>
          </div>
        )}

        {/* PHASE: THE REVEAL */}
        {step === 'partyRevealed' && (
          <div
            key="party"
            className="absolute inset-0 z-40 overflow-hidden pointer-events-auto"
          >
            {/* Code-driven Balloons */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`balloon-${i}`}
                initial={{ y: '100vh', x: `${Math.random() * 80 + 10}vw`, opacity: 0 }}
                animate={{ y: '-20vh', opacity: 1 }}
                transition={{ 
                  duration: Math.random() * 3 + 4, // 4 to 7 seconds
                  ease: "easeOut",
                  repeat: Infinity,
                  delay: Math.random() * 2 // Stagger starts
                }}
                className="absolute text-6xl md:text-8xl pointer-events-none z-10"
              >
                🎈
              </motion.div>
            ))}

            {/* The surprise cat */}
            <motion.img 
              src={surpriseCat} 
              alt="Surprise Cat" 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              style={{ bottom: '15.26%', left: '25%', width: '15%', height: 'auto' }}
              className="absolute object-contain z-50 drop-shadow-2xl" 
            />
            
            {/* Birthday Cake */}
            <motion.img
              src={birthdayCake}
              alt="Birthday Cake"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              style={{ bottom: '7.63%', left: '50%', width: '32%', height: 'auto' }}
              className="absolute -translate-x-1/2 object-contain z-40 drop-shadow-xl"
            />
            
            {/* Happy Birthday Text */}
            <motion.h1 
              initial={{ y: '-20vh', opacity: 0, x: '-50%' }}
              animate={{ y: 0, opacity: 1, x: '-50%' }}
              transition={{ type: 'spring', bounce: 0.5, duration: 1.5 }}
              className="absolute top-[20%] left-1/2 text-6xl md:text-8xl font-black text-white drop-shadow-xl text-center whitespace-nowrap leading-tight z-40"
            >
              HAPPY BIRTHDAY <br/> <span className="text-yellow-300">AMUU!</span>
            </motion.h1>
            
            {/* Final Gift Image */}
            <motion.img
              src={finalGift}
              alt="Final Gift Portal"
              initial={{ y: '10vh', scale: 0, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{ delay: 1, type: 'spring' }}
              whileHover={{ scale: 1.15, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/keyhole')}
              style={{ bottom: '12.26%', left: '16%', width: '12%', height: 'auto' }}
              className="absolute z-50 cursor-pointer drop-shadow-2xl hover:drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] transition-shadow"
            />
          </div>
        )}

      </AnimatePresence>
      </div>
    </div>
  );
}