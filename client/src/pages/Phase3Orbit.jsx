import { doc, onSnapshot } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import "./Phase3Orbit.css";

// Math to distribute photos perfectly into a 3D Sphere
const calculateSpherePosition = (index, total) => {
  const phi = Math.acos(1 - 2 * (index + 0.5) / total);
  const theta = Math.PI * (1 + Math.sqrt(5)) * index;
  const radius = window.innerWidth < 768 ? 160 : 300; // Size of the globe

  const x = radius * Math.cos(theta) * Math.sin(phi);
  const y = radius * Math.sin(theta) * Math.sin(phi);
  const z = radius * Math.cos(phi);

  // Calculate rotation so photos face OUTWARD from the center
  const rotateY = Math.atan2(x, z) * (180 / Math.PI);
  const rotateX = Math.atan2(-y, Math.sqrt(x * x + z * z)) * (180 / Math.PI);

  return { x, y, z, rotateX, rotateY };
};

const Phase3Orbit = () => {
  const [memories, setMemories] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const navigate = useNavigate();

  // Fetch live from Admin Dashboard
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "birthdayContent", "phase3"), (snapshot) => {
      if (snapshot.exists()) {
        const photos = snapshot.data().photos || [];
        // Only show photos that actually have a URL uploaded
        setMemories(photos.filter(p => p.url)); 
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="globe-wrapper">
      <h1 className="absolute top-12 text-xl md:text-3xl font-light tracking-[0.5em] text-fuchsia-300 z-10 pointer-events-none">
        THE ORBIT OF US
      </h1>

      {/* The Central Glowing Core */}
      <div className="absolute w-40 h-40 rounded-full bg-fuchsia-600/30 blur-[80px] z-0" />

      {memories.length === 0 ? (
        <p className="text-slate-500 text-xs tracking-widest uppercase animate-pulse">
          Awaiting memories from the dashboard...
        </p>
      ) : (
        <>
          {/* THE 3D ROTATING GLOBE */}
          <motion.div
            className="globe-scene"
            animate={{ rotateY: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            style={{ opacity: selectedPhoto ? 0.2 : 1 }} // Dims when a photo is clicked
          >
            {memories.map((photo, index) => {
              const { x, y, z, rotateX, rotateY } = calculateSpherePosition(index, memories.length);

              return (
                <motion.div
                  key={photo.id}
                  layoutId={`card-${photo.id}`} // Magic layout connection
                  className="memory-sphere-card"
                  style={{
                    x, y, z,
                    rotateX, rotateY,
                  }}
                  whileHover={{ scale: 1.1, boxShadow: "0 0 40px rgba(217,70,239,0.6)" }}
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img src={photo.url} alt="Memory" />
                </motion.div>
              );
            })}
          </motion.div>

          {/* THE CLICKED STATE (Front image + Right Mist Message) */}
          <AnimatePresence>
            {selectedPhoto && (
              <div className="absolute inset-0 z-50 flex items-center justify-start px-10 md:px-32">
                {/* Background Click to Close */}
                <div 
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" 
                  onClick={() => setSelectedPhoto(null)} 
                />

                {/* The Focused Image (Left Side) */}
                <motion.div
                  layoutId={`card-${selectedPhoto.id}`}
                  className="relative z-50 w-[300px] h-[300px] md:w-[450px] md:h-[450px] rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(217,70,239,0.4)] border border-white/20"
                >
                  <img src={selectedPhoto.url} className="w-full h-full object-cover" />
                </motion.div>

                {/* The Mist Message (Right Side) */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="mist-panel"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-400 font-bold mb-4">
                    A Memory Resurfaced
                  </p>
                  <p className="text-xl md:text-3xl font-light italic text-white leading-relaxed">
                    "{selectedPhoto.caption || "A moment frozen in time..."}"
                  </p>
                  
                  <button 
                    onClick={() => setSelectedPhoto(null)}
                    className="mt-12 text-[10px] uppercase tracking-widest text-slate-400 hover:text-white self-start transition-colors"
                  >
                    ← Return to Orbit
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Navigation to Phase 4 */}
      <button 
        onClick={() => navigate("/whispers")} 
        className="absolute bottom-12 px-8 py-3 rounded-full border border-fuchsia-500/30 text-fuchsia-300 text-[10px] tracking-[0.3em] uppercase hover:bg-fuchsia-500/20 transition-all z-20"
      >
        Read My Whispers →
      </button>
    </div>
  );
};

export default Phase3Orbit;