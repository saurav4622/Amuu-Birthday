import { doc, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { db } from "../firebase";

const Phase6Video = () => {
  const [videoUrl, setVideoUrl] = useState("");

  // Fetch the video link from Firestore (Phase 6 document)
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "birthdayContent", "phase6"), (doc) => {
      if (doc.exists()) {
        setVideoUrl(doc.data().url || "");
      }
    });
    return () => unsub();
  }, []);

  // Smart converter to turn standard YouTube links into Embed links
  const getEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      // rel=0 hides recommended videos at the end, modestbranding keeps it clean
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0&modestbranding=1`;
    }
    return url; // Fallback in case you use a raw .mp4 link instead of YouTube
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-100 flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
      
      {/* Background Cinematic Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-fuchsia-900/20 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-900/20 blur-[150px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5 }}
        className="z-10 text-center space-y-4 mb-10"
      >
        <p className="text-[10px] uppercase tracking-[0.5em] text-fuchsia-400 font-bold">
          Phase 06
        </p>
        <h1 className="text-3xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-white to-pink-200">
          A Universe of Love
        </h1>
        <p className="text-sm md:text-base text-slate-400 font-light italic tracking-wide">
          Some familiar faces wanted to say hello...
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 1.5 }}
        className="w-full max-w-5xl aspect-video z-10 bg-black/50 border border-white/10 rounded-2xl md:rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(217,70,239,0.15)] relative"
      >
        {embedUrl ? (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={embedUrl}
            title="Birthday Wishes"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <div className="flex items-center justify-center h-full w-full text-slate-500 text-xs tracking-widest uppercase animate-pulse">
            Awaiting video broadcast...
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Phase6Video;