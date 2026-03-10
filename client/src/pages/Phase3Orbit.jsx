import { doc, onSnapshot } from "firebase/firestore"; // FIX 1: Added 'doc' import
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import "./Phase3Orbit.css";

const Phase3Orbit = () => {
  const [memories, setMemories] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // FIX 2: Correctly using doc() with the imported function
    const unsub = onSnapshot(doc(db, "birthdayContent", "phase3"), (snapshot) => {
      if (snapshot.exists()) {
        setMemories(snapshot.data().photos || []);
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="orbit-container">
      <h1 className="absolute top-12 text-xl md:text-3xl font-light tracking-[0.5em] text-fuchsia-300 z-10">
        THE ORBIT OF US
      </h1>

      <div className="central-core" />

      {memories.length === 0 ? (
        <p className="text-slate-500 text-xs tracking-widest uppercase animate-pulse">
          Awaiting memories from the dashboard...
        </p>
      ) : (
        <div className="relative w-full max-w-[600px] aspect-square flex items-center justify-center">
         {memories.map((photo, index) => {
  const angle = (index / memories.length) * 2 * Math.PI;
  const radius = window.innerWidth < 768 ? 130 : 250; // Increased radius for better spacing

  return (
    <motion.div
      key={photo.id}
      className="absolute cursor-pointer z-10"
      // THIS IS THE MAGIC PART:
      animate={{
        // This math makes them rotate 360 degrees (2*Math.PI) endlessly
        x: [
          Math.cos(angle) * radius, 
          Math.cos(angle + 2 * Math.PI) * radius
        ],
        y: [
          Math.sin(angle) * radius, 
          Math.sin(angle + 2 * Math.PI) * radius
        ],
      }}
      transition={{
        duration: 20, // Adjust this to make it faster (10) or slower (30)
        repeat: Infinity,
        ease: "linear",
      }}
      whileHover={{ scale: 1.1, zIndex: 50 }}
      onClick={() => setSelectedId(selectedId === photo.id ? null : photo.id)}
    >
      <div className="memory-card">
        <img src={photo.url} alt="Memory" className="w-full h-full object-cover" />
        <AnimatePresence>
          {selectedId === photo.id && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="mist-overlay"
            >
              <p className="text-[10px] md:text-sm text-fuchsia-100 italic">
                {photo.caption || "A moment frozen in time..."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
})}
        </div>
      )}

      <button 
        onClick={() => navigate("/whispers")} 
        className="absolute bottom-12 px-8 py-3 rounded-full border border-fuchsia-500/30 text-fuchsia-300 text-[10px] tracking-[0.3em] uppercase hover:bg-fuchsia-500/10 transition-all z-20"
      >
        Read My Whispers →
      </button>
    </div>
  );
};

export default Phase3Orbit;