import { Float, OrbitControls, Stars, useTexture } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from "react-router-dom"; // <-- IMPORTED NAVIGATE
import SunCalc from 'suncalc';
import * as THREE from 'three';
import { useGlobalAudio } from "../context/AudioContext";

// --- Helpers ---
const getDaysBetween = (d1, d2) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  date1.setHours(0, 0, 0, 0);
  date2.setHours(0, 0, 0, 0);
  return Math.round((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
};

const formatCompact = (d) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
const formatForInput = (d) => d.toISOString().split('T')[0];

const getConstellation = (date) => {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const zodiacs = [
    { name: "Capricorn", start: [12, 22], end: [1, 19] }, { name: "Aquarius", start: [1, 20], end: [2, 18] },
    { name: "Pisces", start: [2, 19], end: [3, 20] }, { name: "Aries", start: [3, 21], end: [4, 19] },
    { name: "Taurus", start: [4, 20], end: [5, 20] }, { name: "Gemini", start: [5, 21], end: [6, 20] },
    { name: "Cancer", start: [6, 21], end: [7, 22] }, { name: "Leo", start: [7, 23], end: [8, 22] },
    { name: "Virgo", start: [8, 23], end: [9, 22] }, { name: "Libra", start: [9, 23], end: [10, 22] },
    { name: "Scorpio", start: [10, 23], end: [11, 21] }, { name: "Sagittarius", start: [11, 22], end: [12, 21] }
  ];
  const sign = zodiacs.find(z => (m === z.start[0] && d >= z.start[1]) || (m === z.end[0] && d <= z.end[1]));
  return sign ? `${sign.name}` : "Star-Sign";
};

const getMoonDetails = (date) => {
  const { phase, fraction } = SunCalc.getMoonIllumination(date);
  const phases = ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"];
  const phaseName = phases[Math.floor(phase * 8) % 8];
  return { phaseValue: phase, phaseName, fraction: Math.round(fraction * 100) };
};

const createGlowTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'white');
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.6)');
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
};

// --- 3D Components ---

const RealisticEarthDecor = () => {
  const earthRef = useRef();

  const earthTexture = useTexture(
    "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg"
  );

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.0008;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group position={[40, -15, -50]} rotation={[0.2, 0, 0]}>
        <mesh ref={earthRef}>
          <sphereGeometry args={[14, 64, 64]} />
          <meshStandardMaterial
            map={earthTexture}
            color="#a3a3a3"
            roughness={1}
            metalness={0.1}
          />
        </mesh>
        <mesh scale={[1.02, 1.02, 1.02]}>
          <sphereGeometry args={[14, 32, 32]} />
          <meshBasicMaterial color="#4facfe" transparent opacity={0.15} side={THREE.BackSide} />
        </mesh>
      </group>
    </Float>
  );
};

const RealisticMoonMain = ({ date, onMoonClick }) => {
  const ref = useRef();
  const texture = useTexture(
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg'
  );

  const moonData = useMemo(() => getMoonDetails(date), [date]);

  const lightPos = useMemo(() => {
    const r = 25;
    return [
      Math.sin(moonData.phaseValue * Math.PI * 2) * r,
      0,
      -Math.cos(moonData.phaseValue * Math.PI * 2) * r
    ];
  }, [moonData]);

  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.0005;
  });

  return (
    <group 
      onClick={(e) => {
        e.stopPropagation();
        onMoonClick({ title: "Lunar Phase Data", subtitle: formatCompact(date), body: `Phase: ${moonData.phaseName}\nIllumination: ${moonData.fraction}%` });
      }}
      onPointerOver={() => document.body.style.cursor='pointer'}
      onPointerOut={() => document.body.style.cursor='auto'}
    >
      <ambientLight intensity={0.02} />
      <directionalLight position={lightPos} intensity={4.5} color="#fff4e0" />
      <directionalLight position={[0, 0, -10]} intensity={0.1} color="#64748b" />
      <mesh ref={ref} rotation={[0.2, Math.PI, 0]}>
        <sphereGeometry args={[2.5, 64, 64]} />
        <meshStandardMaterial map={texture} color="#a3a3a3" roughness={1} metalness={0.1} />
      </mesh>
    </group>
  );
};

// --- ✨ Interactive Constellations ---
const InteractiveStarField = ({ date, isFirstDate, isAnnuDate, isSettled, onStarClick }) => {
  const pointsRef = useRef();
  const lineRef = useRef();
  const count = 40;
  const starTexture = useMemo(() => createGlowTexture(), []);
  
  // 1. The explicit Heart Shape (First Date)
  const heartPos = useMemo(() => {
    const hp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const scale = 0.6;
      hp[i*3] = 16 * Math.pow(Math.sin(t), 3) * scale;
      hp[i*3+1] = (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) * scale;
      hp[i*3+2] = 5;
    }
    return hp;
  }, []);

  // 2. The Face Outline / Silhouette (Annu's Birthday)
  const faceOutlinePos = useMemo(() => {
    const fp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      let x = 12 * Math.cos(t);
      let y = 16 * Math.sin(t);
      
      // MAGIC MATH: Draw the bottom half (the jawline & chin)
      if (Math.sin(t) < 0) {
        x = x * (1 + 0.35 * Math.sin(t)); // Tweak 0.35 for jaw width
        y = y * (1 - 0.15 * Math.sin(t)); // Tweak 0.15 for chin length
      }

      fp[i*3] = x;
      fp[i*3+1] = y;
      fp[i*3+2] = 5;
    }
    return fp;
  }, []);

  // 3. The Random Constellations (Zodiac signs)
  const currentZodiac = getConstellation(date);
  const randPos = useMemo(() => {
    const rp = new Float32Array(count * 3);
    let seed = 0;
    for (let i = 0; i < currentZodiac.length; i++) seed += currentZodiac.charCodeAt(i);
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    const points = [];
    for (let i = 0; i < count; i++) {
      points.push({
        x: (random() - 0.5) * 50, 
        y: (random() - 0.5) * 30, 
        z: -10 - (random() * 20)  
      });
    }
    
    points.sort((a, b) => a.x - b.x);

    for (let i = 0; i < count; i++) {
      rp[i*3] = points[i].x;
      rp[i*3+1] = points[i].y;
      rp[i*3+2] = points[i].z;
    }
    return rp;
  }, [currentZodiac]);

  const names = useMemo(() => ["Sirius", "Vega", "Altair", "Polaris", "Antares", "Rigel", "Deneb", "Betelgeuse", "Spica", "Pollux"], []);
  const [initialPos] = useState(() => randPos.slice());

  const drawCount = useRef(0);
  useFrame((state, delta) => {
    const pos = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      // --- ROUTER: Pick the shape based on the current date ---
      let target;
      if (isFirstDate) {
        target = [heartPos[i*3], heartPos[i*3+1], heartPos[i*3+2]];
      } else if (isAnnuDate) {
        target = [faceOutlinePos[i*3], faceOutlinePos[i*3+1], faceOutlinePos[i*3+2]];
      } else {
        target = [randPos[i*3], randPos[i*3+1], randPos[i*3+2]];
      }

      pos[i*3] = THREE.MathUtils.lerp(pos[i*3], target[0], 2 * delta);
      pos[i*3+1] = THREE.MathUtils.lerp(pos[i*3+1], target[1], 2 * delta);
      pos[i*3+2] = THREE.MathUtils.lerp(pos[i*3+2], target[2], 2 * delta);
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    if (lineRef.current) {
      lineRef.current.geometry.attributes.position.array.set(pos);
      lineRef.current.geometry.attributes.position.needsUpdate = true;
    }

    if (isSettled && drawCount.current < count) {
      drawCount.current += 20 * delta;
      lineRef.current.geometry.setDrawRange(0, Math.floor(drawCount.current));
    } else if (!isSettled) {
      drawCount.current = 0;
      lineRef.current.geometry.setDrawRange(0, 0);
    }
  });

  return (
    <group>
      <line ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={initialPos.slice()} itemSize={3} />
        </bufferGeometry>
        {/* Glows bright for both the Heart and the Face! */}
        <lineBasicMaterial color="#fbbf24" transparent opacity={(isFirstDate || isAnnuDate) ? 0.6 : 0.15} linewidth={1} />
      </line>
      <points ref={pointsRef} onClick={(e) => onStarClick({ title: `Star: ${names[e.index % names.length]}`, subtitle: formatCompact(date), body: isFirstDate ? 'A magical moment we shared under these exact stars.' : isAnnuDate ? 'The day the universe gave me you.' : 'A distant star in the night sky.' })}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={initialPos.slice()} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={1.2} vertexColors={false} color="#fbbf24" map={starTexture} transparent alphaTest={0.1} />
      </points>
    </group>
  );
};

// --- Timeline Controls ---
const TimelineControls = ({ selectedDate, onDateChange, dates, checkpoints }) => {
  const TOTAL_DAYS = getDaysBetween(dates.START, dates.TODAY);
  const currentDays = getDaysBetween(dates.START, selectedDate);
  
  const [localVal, setLocalVal] = useState(currentDays);
  const [isVisible, setIsVisible] = useState(true);
  const hideTimeoutRef = useRef(null);

  const resetHideTimeout = () => {
    setIsVisible(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 3500); 
  };

  useEffect(() => {
    const handleActivity = () => resetHideTimeout();
    
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('click', handleActivity);

    resetHideTimeout();

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('click', handleActivity);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  useEffect(() => setLocalVal(currentDays), [currentDays]);

  const handleSliderChange = (e) => {
    resetHideTimeout();
    let val = parseInt(e.target.value);
    
    for (let cp of checkpoints) {
      const safeDate = new Date(cp.date);
      const cpDays = getDaysBetween(dates.START, safeDate);
      if (Math.abs(val - cpDays) < 40) {
        val = cpDays;
        break;
      }
    }
    if (Math.abs(val) < 40) val = 0;
    
    setLocalVal(val);
    onDateChange(new Date(dates.START.getTime() + val * 24 * 60 * 60 * 1000));
  };

  const jumpToDate = (targetDays) => {
    resetHideTimeout();
    setLocalVal(targetDays);
    onDateChange(new Date(dates.START.getTime() + targetDays * 24 * 60 * 60 * 1000));
  };

  const handleManualDateChange = (e) => {
    resetHideTimeout();
    const newDate = new Date(e.target.value);
    if (newDate >= dates.START && newDate <= dates.TODAY) {
      jumpToDate(getDaysBetween(dates.START, newDate));
    }
  };

  const currentLocalPercent = localVal / TOTAL_DAYS;

  return (
    <div className="absolute bottom-0 left-0 w-full h-40 flex items-end justify-center pointer-events-none z-20 pb-8">
      <AnimatePresence>
        {isVisible && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-[90%] max-w-4xl bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl pointer-events-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">History</span>
              
              <div className="text-center relative group flex flex-col items-center">
                <h4 className="text-2xl font-black text-amber-300 tracking-tight drop-shadow-lg pointer-events-none">
                  {formatCompact(new Date(dates.START.getTime() + localVal * 24 * 60 * 60 * 1000))}
                </h4>
                <input 
                  type="date" 
                  value={formatForInput(new Date(dates.START.getTime() + localVal * 24 * 60 * 60 * 1000))} 
                  onChange={handleManualDateChange}
                  min={formatForInput(dates.START)}
                  max={formatForInput(dates.TODAY)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  title="Click to select a specific date"
                />
                <span className="text-[8px] text-white/30 uppercase mt-1 group-hover:text-white/80 transition-colors">Tap to jump to date</span>
              </div>
              
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Present</span>
            </div>

            <div className="relative h-2 bg-white/10 rounded-full">
              <div className="absolute h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-300 rounded-full pointer-events-none" style={{ width: `${currentLocalPercent * 100}%` }} />
              
              {checkpoints.map((cp, idx) => {
                const safeDate = new Date(cp.date);
                const percent = getDaysBetween(dates.START, safeDate) / TOTAL_DAYS;
                return (
                  <div key={idx} className="absolute w-0 h-full pointer-events-none" style={{ left: `${percent * 100}%` }}>
                    <div 
                      onClick={() => jumpToDate(getDaysBetween(dates.START, safeDate))} 
                      className={`absolute w-3 h-3 top-1/2 -translate-y-1/2 -translate-x-1/2 ${cp.color} rounded-full cursor-pointer pointer-events-auto hover:scale-150 transition-transform shadow-lg`}
                      title={cp.label}
                    />
                    <span className={`absolute ${idx % 2 === 0 ? '-top-5' : '-bottom-5'} left-1/2 -translate-x-1/2 text-[9px] uppercase text-${cp.color.replace('bg-', '')}`}>{cp.label}</span>
                  </div>
                );
              })}

              <input type="range" min={0} max={TOTAL_DAYS} value={localVal} onChange={handleSliderChange} className="absolute w-full h-full opacity-0 cursor-pointer" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


// --- 🚀 MAIN APP ---
export default function CelestialTimeline() {
  const [dates] = useState({
    START: new Date('2002-06-04'),
    TODAY: new Date()
  });

  const [checkpoints, setCheckpoints] = useState([
    { id: 'start', date: new Date('2002-06-04'), label: 'My Birth', color: 'bg-indigo-400' },
    { id: 'annu_birth', date: new Date('2004-03-30'), label: 'Annu', color: 'bg-pink-400', isPermanent: true }, 
    { id: 'first_date', date: new Date('2025-06-20'), label: 'First Date', color: 'bg-amber-400' }
  ]);

  const [date, setDate] = useState(dates.TODAY);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [isSettled, setIsSettled] = useState(true);

  const navigate = useNavigate(); // <-- NAVIGATE HOOK DEFINED
  const { stopAudio } = useGlobalAudio();

  useEffect(() => {
    stopAudio();
  }, [stopAudio]);

  useEffect(() => {
    setIsSettled(false);
    const t = setTimeout(() => setIsSettled(true), 600);
    return () => clearTimeout(t);
  }, [date]);

  // DATE CHECKS
  const firstDateCP = checkpoints.find(c => c.id === 'first_date');
  const isFirstDate = firstDateCP ? Math.abs(getDaysBetween(date, new Date(firstDateCP.date))) === 0 : false;

  const annuDateCP = checkpoints.find(c => c.id === 'annu_birth');
  const isAnnuDate = annuDateCP ? Math.abs(getDaysBetween(date, new Date(annuDateCP.date))) === 0 : false;

  return (
    <div className="relative w-full h-screen bg-[#02040a] overflow-hidden select-none font-sans">
      
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0f172a_0%,#02040a_100%)] pointer-events-none" />

      {/* --- RENDER SPECIAL TITLES --- */}
      <AnimatePresence>
        {isFirstDate && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-[10%] left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none w-full">
            <h1 className="text-5xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-white to-amber-200 drop-shadow-2xl">The Night We Met</h1>
          </motion.div>
        )}
        {isAnnuDate && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-[10%] left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none w-full">
            <h1 className="text-5xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-white to-pink-300 drop-shadow-2xl">The Day You Were Born</h1>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-8 right-10 text-right z-10 pointer-events-none">
        <p className="text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-1">Celestial Sign</p>
        <h2 className="text-3xl font-serif italic text-white/90 drop-shadow-xl">{getConstellation(date)}</h2>
      </div>

      <Canvas camera={{ position: [0, 0, 40], fov: 45 }}>
        <Suspense fallback={null}>
          <OrbitControls enableZoom={true} enablePan={false} maxDistance={70} minDistance={15} />
          
          <Stars radius={150} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          <directionalLight position={[50, 20, 30]} intensity={2.5} color="#ffffff" />
          <ambientLight intensity={1.5} color="#ffffff" />
          
          <RealisticEarthDecor />
          <RealisticMoonMain date={date} onMoonClick={setActiveTooltip} />
          
          <InteractiveStarField 
            date={date} 
            isFirstDate={isFirstDate} 
            isAnnuDate={isAnnuDate} 
            isSettled={isSettled} 
            onStarClick={setActiveTooltip} 
          />
        </Suspense>
      </Canvas>

      <AnimatePresence>
        {activeTooltip && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-xl border border-white/20 p-8 rounded-3xl z-40 text-center w-80 shadow-2xl">
            <button onClick={() => setActiveTooltip(null)} className="absolute top-4 right-5 text-white/40 hover:text-white transition-colors">✕</button>
            <h3 className="text-xl font-bold text-amber-400 mb-1">{activeTooltip.title}</h3>
            <p className="text-[10px] uppercase tracking-widest text-indigo-300 mb-4">{activeTooltip.subtitle}</p>
            {activeTooltip.body && <p className="text-sm text-gray-200 leading-relaxed italic">{activeTooltip.body}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* NEW: Navigation Button to Phase 6 */}
      <button 
        onClick={() => navigate("/wishes")} 
        className="absolute bottom-12 right-10 px-8 py-3 rounded-full border border-fuchsia-500/30 text-fuchsia-300 text-[10px] tracking-[0.3em] uppercase hover:bg-fuchsia-500/20 transition-all z-30 cursor-pointer backdrop-blur-md"
      >
        See The Wishes →
      </button>

      <TimelineControls 
        selectedDate={date} 
        onDateChange={(newDate) => { setDate(newDate); setActiveTooltip(null); }} 
        dates={dates} 
        checkpoints={checkpoints}
      />
    </div>
  );
}