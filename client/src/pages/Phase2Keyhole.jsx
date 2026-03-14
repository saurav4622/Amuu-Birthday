import { doc, onSnapshot } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import "./Phase2Keyhole.css";

const normalize = (str) => (str || "").trim().toLowerCase();

function Phase2Keyhole() {
  const navigate = useNavigate();
  const [tumblers, setTumblers] = useState([]); 
  const [values, setValues] = useState({});
  const [isSolved, setIsSolved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch questions from Firebase
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "birthdayContent", "phase2"), (docSnap) => {
      if (docSnap.exists()) {
        const questions = docSnap.data().questions || [];
        setTumblers(questions);
        
        const initialValues = {};
        questions.forEach(t => initialValues[t.id] = "");
        setValues(initialValues);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const isCorrect = (id) => {
    const t = tumblers.find((tumbler) => tumbler.id === id);
    if (!t) return false;
    return normalize(values[id]) === normalize(t.answer);
  };

  const allCorrect = tumblers.length > 0 && tumblers.every((t) => isCorrect(t.id));

  const handleChange = (id, value) => setValues((prev) => ({ ...prev, [id]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (allCorrect) {
      setIsSolved(true);
      setTimeout(() => navigate("/orbit"), 2000);
    }
  };

  if (loading) {
    return (
      <div className="keyhole-container flex items-center justify-center">
        <div className="text-fuchsia-500 animate-pulse tracking-[0.5em] text-xs uppercase">
          Accessing Memories...
        </div>
      </div>
    );
  }

  return (
    <div className="keyhole-container">
      <div className="bg-glow-top" />
      <div className="bg-glow-bottom" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >

        {/* The Sleek Birthday Alert */}
        <div className="birthday-alert">
          <p className="alert-text">
            <span className="alert-highlight">Happy Birthday Baby!</span> You need to unlock your surprise first... nothing comes free of cost. 😉
          </p>
          <div className="alert-price">Price: Correct Memories</div>
        </div>

        {/* The Clean Header (Only One) */}
        <header className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.5em] text-fuchsia-400 font-bold mb-2">Phase 02</p>
          <h1 className="text-3xl font-light text-white tracking-tight">The Keyhole</h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {tumblers.map((t) => (
            <div key={t.id} className="space-y-2">
              <label className="block text-[10px] uppercase tracking-widest text-slate-500 ml-1">
                {t.prompt}
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  autoComplete="off"
                  value={values[t.id] || ""}
                  onChange={(e) => handleChange(t.id, e.target.value)}
                  className={`input-field ${isCorrect(t.id) ? 'border-emerald-500/40' : 'border-white/10'}`}
                  placeholder="..."
                />
                <div className={`status-dot ${isCorrect(t.id) ? 'dot-unlocked' : 'dot-locked'}`} />
              </div>
            </div>
          ))}

          <motion.button
            whileTap={allCorrect ? { scale: 0.96 } : {}}
            disabled={!allCorrect}
            className={`submit-btn ${allCorrect ? 'btn-unlocked' : 'btn-locked'}`}
          >
            {allCorrect ? "Unlock Path" : "Locked"}
          </motion.button>
        </form>
      </motion.div>

      {/* Success Overlay */}
      <AnimatePresence>
        {isSolved && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-[#020617] flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-7xl mb-6 shadow-glow"
            >
              🔓
            </motion.div>
            <h2 className="text-sm text-fuchsia-400 font-bold tracking-[0.8em] uppercase">Open</h2>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Phase2Keyhole;