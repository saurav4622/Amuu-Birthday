import { doc, onSnapshot } from "firebase/firestore";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { db } from "../firebase";

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const audioRef = useRef(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);
  const [bgMusicUrl, setBgMusicUrl] = useState(null);

  // 1. Fetch the music URL globally from Firebase
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "birthdayContent", "phase3"), (snapshot) => {
      if (snapshot.exists()) {
        setBgMusicUrl(snapshot.data().bgMusic || null);
      }
    });
    return () => unsub();
  }, []);

  // 2. Attach the URL to the persistent audio element
  useEffect(() => {
    if (bgMusicUrl) {
      audioRef.current.src = bgMusicUrl;
      audioRef.current.loop = true;
      audioRef.current.volume = 0.4; // Soft background volume
    }
  }, [bgMusicUrl]);

  // Global Controls - Wrapped in useCallback to prevent infinite loops
  const playAudio = useCallback(() => {
    if (bgMusicUrl && audioRef.current.paused) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false)); // Autoplay blocked by browser
      }
    }
  }, [bgMusicUrl]);

  const stopAudio = useCallback(() => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  }, []);

  const toggleAudio = useCallback(() => {
    // Check the actual hardware state of the audio element, not just React state
    if (audioRef.current.paused) {
      playAudio();
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [playAudio]);

  return (
    <AudioContext.Provider value={{ isPlaying, playAudio, stopAudio, toggleAudio, hasAudio: !!bgMusicUrl }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useGlobalAudio = () => useContext(AudioContext);