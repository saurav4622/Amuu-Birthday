import { doc, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Typewriter from "typewriter-effect";
import { db } from "../firebase";

const Phase4Whispers = () => {
  const [poem, setPoem] = useState("");
  const navigate = useNavigate();

  // Fetch the poem from Firestore (Phase 4 document)
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "birthdayContent", "phase4"), (doc) => {
      if (doc.exists()) {
        setPoem(doc.data().text);
      } else {
        // Fallback poem if database is empty
        setPoem("In the quiet hours when the world forgets its noise,\nyour laugh still lingers in the corners of my mind.\n\nEvery glance from you feels like a secret constellation,\ndrawing soft patterns across the sky behind my ribs.");
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-6 py-20 overflow-hidden relative">
      {/* Abstract Background Element */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-fuchsia-900/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="max-w-2xl w-full space-y-8 z-10"
      >
        <header className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.5em] text-fuchsia-400 font-bold">
            Phase 04
          </p>
          <h1 className="text-3xl md:text-5xl font-light tracking-tight text-white">
            Whispers in the Dark
          </h1>
        </header>

        <div className="h-[1px] w-24 bg-gradient-to-r from-fuchsia-500 to-transparent" />

        <div className="text-lg md:text-2xl leading-relaxed font-light text-slate-300 italic min-h-[300px]">
          {poem && (
            <Typewriter
              options={{
                delay: 50,
                cursor: "▊",
                autoStart: true,
                loop: false,
              }}
              onInit={(typewriter) => {
                typewriter.typeString(poem.replace(/\n/g, '<br />')).start();
              }}
            />
          )}
        </div>
      </motion.div>

      {/* Navigation to Phase 5 */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 5 }} // Appears after she starts reading
        onClick={() => navigate("/stars")}
        className="mt-12 px-6 py-2 text-xs tracking-[0.3em] text-slate-500 hover:text-fuchsia-300 transition-colors uppercase"
      >
        Written in the stars →
      </motion.button>
    </div>
  );
};

export default Phase4Whispers;