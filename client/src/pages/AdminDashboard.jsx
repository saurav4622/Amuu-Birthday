import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { db } from '../firebase';
import './AdminDashboard.css';

// UPDATED: Added Phase 6 to the TABS array
const TABS = ['Phase 2 (Keyhole)', 'Phase 3 (Orbit)', 'Phase 4 (Whispers)', 'Phase 5 (Timeline)', 'Phase 6 (Video)'];

// Color options for the timeline dots
const COLOR_OPTIONS = [
  { label: 'Gold', value: 'bg-amber-400' },
  { label: 'Pink', value: 'bg-pink-400' },
  { label: 'Indigo', value: 'bg-indigo-400' },
  { label: 'Emerald', value: 'bg-emerald-400' },
  { label: 'Rose', value: 'bg-rose-400' },
  { label: 'Cyan', value: 'bg-cyan-400' },
  { label: 'White', value: 'bg-white' },
];

// --- Image Compressor Helper ---
const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1920; 
        const MAX_HEIGHT = 1080;
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        } else if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.8);
      };
    };
  });
};

function AdminDashboard() {
  const { logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // States
  const [tumblers, setTumblers] = useState([
    { id: 1, prompt: '', answer: '' },
    { id: 2, prompt: '', answer: '' },
    { id: 3, prompt: '', answer: '' }
  ]);
  const [orbitPhotos, setOrbitPhotos] = useState([
    { id: 1, url: '', caption: '' }
  ]);
  
  const [bgMusic, setBgMusic] = useState(null);
  const [poemLines, setPoemLines] = useState("");
  
  const [checkpoints, setCheckpoints] = useState([
    { id: 'start', date: '2002-06-04', label: 'My Birth', color: 'bg-indigo-400', isPermanent: true },
    { id: 'annu_birth', date: '2004-03-30', label: 'Annu', color: 'bg-pink-400', isPermanent: true }
  ]);

  // NEW: State for Phase 6 Video URL
  const [videoUrl, setVideoUrl] = useState("");
  
  const [uploadingIds, setUploadingIds] = useState({});

  // 1. LOAD DATA FROM FIREBASE
  useEffect(() => {
    const loadData = async () => {
      try {
        const p2Snap = await getDoc(doc(db, "birthdayContent", "phase2"));
        if (p2Snap.exists()) setTumblers(p2Snap.data().questions);

        const p3Snap = await getDoc(doc(db, "birthdayContent", "phase3"));
        if (p3Snap.exists()) {
          setOrbitPhotos(p3Snap.data().photos || []);
          setBgMusic(p3Snap.data().bgMusic || null); 
        }

        const p4Snap = await getDoc(doc(db, "birthdayContent", "phase4"));
        if (p4Snap.exists()) setPoemLines(p4Snap.data().text);

        const p5Snap = await getDoc(doc(db, "birthdayContent", "phase5"));
        if (p5Snap.exists() && p5Snap.data().checkpoints) {
          setCheckpoints(p5Snap.data().checkpoints);
        }

        // NEW: Load Phase 6 Video Link
        const p6Snap = await getDoc(doc(db, "birthdayContent", "phase6"));
        if (p6Snap.exists()) {
          setVideoUrl(p6Snap.data().url || "");
        }
      } catch (e) {
        console.error("Load Error:", e);
      }
    };
    loadData();
  }, []);

  // 2. SAVE DATA TO FIREBASE
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, "birthdayContent", "phase2"), { questions: tumblers });
      await setDoc(doc(db, "birthdayContent", "phase3"), { photos: orbitPhotos, bgMusic: bgMusic });
      await setDoc(doc(db, "birthdayContent", "phase4"), { text: poemLines });
      await setDoc(doc(db, "birthdayContent", "phase5"), { checkpoints: checkpoints }); 
      
      // NEW: Save Phase 6 Video Link
      await setDoc(doc(db, "birthdayContent", "phase6"), { url: videoUrl });

      alert("All changes pushed to the live site! 🚀");
    } catch (error) {
      alert(`Failed to save. Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper functions
  const updateTumbler = (id, field, value) => setTumblers(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  const updateOrbitPhoto = (id, field, value) => setOrbitPhotos(prev => prev.map(p => (p.id === id ? { ...p, [field]: value } : p)));
  const updateCheckpoint = (id, field, value) => setCheckpoints(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  const removeCheckpoint = (id) => setCheckpoints(prev => prev.filter(c => c.id !== id));
  
  const addCheckpoint = () => {
    setCheckpoints(prev => [
      ...prev, 
      { id: Date.now().toString(), date: '', label: 'New Memory', color: 'bg-amber-400', isPermanent: false }
    ]);
  };

  const handleImageUpload = async (id, file) => {
    if (!file) return;
    setUploadingIds(prev => ({ ...prev, [id]: true }));
    try {
      const compressedFile = await compressImage(file);
      const formData = new FormData();
      formData.append("file", compressedFile); 
      formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      
      const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      updateOrbitPhoto(id, 'url', data.secure_url);
    } catch (error) {
      alert(`Upload Failed: ${error.message}`);
    } finally {
      setUploadingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleAudioUpload = async (file) => {
    if (!file) return;
    setUploadingIds(prev => ({ ...prev, audio: true }));
    try {
      const formData = new FormData();
      formData.append("file", file); 
      formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      
      const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      setBgMusic(data.secure_url); 
    } catch (error) {
      alert(`Audio Upload Failed: ${error.message}`);
    } finally {
      setUploadingIds(prev => ({ ...prev, audio: false }));
    }
  };

  return (
    <div className="admin-dashboard bg-[#020617] text-white min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 p-6 flex flex-col gap-6">
        <h2 className="text-xl font-bold tracking-tighter">Admin Panel</h2>
        <nav className="flex flex-col gap-2 flex-1">
          {TABS.map((tab, i) => (
            <button key={tab} className={`p-3 text-left rounded-lg text-sm transition ${activeTab === i ? 'bg-fuchsia-600' : 'hover:bg-white/5'}`} onClick={() => setActiveTab(i)}>
              {tab}
            </button>
          ))}
        </nav>
        <button className="bg-emerald-600 p-4 rounded-xl font-bold text-xs uppercase tracking-widest" onClick={handleSaveAll} disabled={isSaving}>
          {isSaving ? "Saving..." : "Push to Live Site"}
        </button>
        <button className="text-slate-500 text-xs hover:text-white" onClick={logout}>Logout</button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-y-auto">
        
        {/* PHASE 2 */}
        {activeTab === 0 && (
          <div className="space-y-8">
            <h1 className="text-3xl font-light">Phase 2 Questions</h1>
            {tumblers.map((t) => (
              <div key={t.id} className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                <p className="text-fuchsia-400 font-bold text-[10px] uppercase">Tumbler {t.id}</p>
                <input className="w-full bg-black/40 border border-white/10 p-4 rounded-xl" value={t.prompt} onChange={(e) => updateTumbler(t.id, 'prompt', e.target.value)} placeholder="Question" />
                <input className="w-full bg-black/40 border border-white/10 p-4 rounded-xl" value={t.answer} onChange={(e) => updateTumbler(t.id, 'answer', e.target.value)} placeholder="Answer" />
              </div>
            ))}
          </div>
        )}

        {/* PHASE 3 */}
        {activeTab === 1 && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-light">Phase 3 Content</h1>
              <button onClick={() => setOrbitPhotos([...orbitPhotos, { id: Date.now(), url: '', caption: '' }])} className="px-4 py-2 bg-fuchsia-600/20 border border-fuchsia-500/50 rounded-xl text-xs text-fuchsia-300 hover:bg-fuchsia-600/40 transition-all uppercase tracking-widest font-bold">
                + Add Photo Slot
              </button>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-[24px] space-y-4">
              <h3 className="text-sm font-bold text-fuchsia-400 uppercase tracking-widest">Background Music</h3>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer">
                  <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleAudioUpload(e.target.files[0])} />
                  <div className="px-6 py-3 bg-fuchsia-600 border border-fuchsia-500 rounded-xl text-xs uppercase tracking-widest font-bold text-white hover:bg-fuchsia-500 transition-all">
                    {uploadingIds.audio ? "Uploading..." : "Upload Audio Track"}
                  </div>
                </label>
                {bgMusic ? <p className="text-emerald-400 text-sm">✅ Music uploaded.</p> : <p className="text-slate-500 text-sm">No music uploaded.</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orbitPhotos.map((p) => (
                <div key={p.id} className="p-6 bg-white/5 border border-white/10 rounded-[24px] space-y-5 transition-all hover:border-white/20">
                  <div className="aspect-video bg-black/40 rounded-2xl overflow-hidden flex items-center justify-center border border-white/5 relative group">
                    {p.url ? <img src={p.url} className="w-full h-full object-cover" /> : <div className="text-center space-y-2"><span className="text-3xl block">🖼️</span><p className="text-[10px] text-slate-500 uppercase tracking-widest">No image</p></div>}
                    {uploadingIds[p.id] && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center animate-pulse">Uploading...</div>}
                  </div>
                  <div className="flex flex-col gap-4">
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(p.id, e.target.files[0])} />
                      <div className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-center text-[10px] uppercase tracking-[0.2em] font-bold text-slate-300 hover:bg-white/10 transition-all cursor-pointer">Select Image</div>
                    </label>
                    <input className="w-full bg-black/60 border border-white/10 p-4 rounded-xl text-sm" value={p.caption} onChange={(e) => updateOrbitPhoto(p.id, 'caption', e.target.value)} placeholder="Caption..." />
                    <button onClick={() => setOrbitPhotos(prev => prev.filter(item => item.id !== p.id))} className="text-red-900/60 hover:text-red-500 text-[9px] uppercase font-bold self-end transition-colors">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PHASE 4 */}
        {activeTab === 2 && (
          <div className="space-y-8">
            <h1 className="text-3xl font-light">Phase 4 Poem</h1>
            <textarea className="w-full h-[500px] bg-black/40 border border-white/10 p-6 rounded-2xl text-lg italic leading-relaxed" value={poemLines} onChange={(e) => setPoemLines(e.target.value)} placeholder="Type your poem here..." />
          </div>
        )}

        {/* PHASE 5 */}
        {activeTab === 3 && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-light">Timeline Checkpoints</h1>
              <button onClick={addCheckpoint} className="px-4 py-2 bg-indigo-600/20 border border-indigo-500/50 rounded-xl text-xs text-indigo-300 font-bold">
                + Add Date
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {checkpoints.map((cp) => (
                <div key={cp.id} className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <p className={`font-bold text-[10px] uppercase tracking-widest ${cp.isPermanent ? 'text-pink-400' : 'text-indigo-400'}`}>{cp.isPermanent ? 'Permanent Anchor' : 'Custom Event'}</p>
                    {!cp.isPermanent && <button onClick={() => removeCheckpoint(cp.id)} className="text-red-500/50 hover:text-red-500 text-lg">×</button>}
                  </div>
                  <div className="space-y-3">
                    <input type="text" className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-sm" value={cp.label} onChange={(e) => updateCheckpoint(cp.id, 'label', e.target.value)} placeholder="Event Label" />
                    <div className="flex gap-3">
                      <input type="date" className="flex-1 bg-black/40 border border-white/10 p-3 rounded-lg text-sm color-white" value={cp.date} onChange={(e) => updateCheckpoint(cp.id, 'date', e.target.value)} />
                      <select className="flex-1 bg-black/40 border border-white/10 p-3 rounded-lg text-sm" value={cp.color} onChange={(e) => updateCheckpoint(cp.id, 'color', e.target.value)}>
                        {COLOR_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NEW: PHASE 6 - VIDEO SECTION */}
        {activeTab === 4 && (
          <div className="space-y-8">
            <h1 className="text-3xl font-light">Phase 6 Video (Family Wishes)</h1>
            <div className="p-8 bg-white/5 border border-white/10 rounded-[32px] space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                </div>
                <h3 className="text-lg font-medium text-white">YouTube Integration</h3>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-slate-400 leading-relaxed">
                  Since the family wishes video is 400MB, upload it as an <b>Unlisted</b> video on YouTube. 
                  Paste the link here, and the app will automatically generate the cinematic player for Annu.
                </p>
                
                <div className="relative">
                  <input 
                    className="w-full bg-black/60 border border-white/10 p-5 rounded-2xl text-fuchsia-300 placeholder-white/10 focus:border-fuchsia-500/50 outline-none transition-all pr-12" 
                    value={videoUrl} 
                    onChange={(e) => setVideoUrl(e.target.value)} 
                    placeholder="https://www.youtube.com/watch?v=..." 
                  />
                  {videoUrl && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  )}
                </div>
              </div>

              {videoUrl && (
                <div className="mt-6 aspect-video bg-black rounded-xl overflow-hidden border border-white/5">
                   <p className="text-[10px] text-slate-600 uppercase text-center mt-20">Preview will be live on site</p>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default AdminDashboard;