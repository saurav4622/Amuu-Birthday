import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { db } from '../firebase';
import './AdminDashboard.css';

const TABS = ['Phase 2 (Keyhole)', 'Phase 3 (Orbit)', 'Phase 4 (Whispers)', 'Phase 5 (Timeline)'];

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
  
  // NEW: Background Music State for Phase 3
  const [bgMusic, setBgMusic] = useState(null);

  const [poemLines, setPoemLines] = useState("");
  
  const [checkpoints, setCheckpoints] = useState([
    { id: 'start', date: '2002-06-04', label: 'My Birth', color: 'bg-indigo-400', isPermanent: true },
    { id: 'annu_birth', date: '2004-03-30', label: 'Annu', color: 'bg-pink-400', isPermanent: true }
  ]);
  
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
          setBgMusic(p3Snap.data().bgMusic || null); // Fetch Music
        }

        const p4Snap = await getDoc(doc(db, "birthdayContent", "phase4"));
        if (p4Snap.exists()) setPoemLines(p4Snap.data().text);

        const p5Snap = await getDoc(doc(db, "birthdayContent", "phase5"));
        if (p5Snap.exists() && p5Snap.data().checkpoints) {
          setCheckpoints(p5Snap.data().checkpoints);
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
      // Include the music URL when saving Phase 3
      await setDoc(doc(db, "birthdayContent", "phase3"), { photos: orbitPhotos, bgMusic: bgMusic });
      await setDoc(doc(db, "birthdayContent", "phase4"), { text: poemLines });
      await setDoc(doc(db, "birthdayContent", "phase5"), { checkpoints: checkpoints }); 
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

  // IMAGE UPLOADER (Compresses)
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

  // NEW: AUDIO UPLOADER (No compression, auto resource type)
  const handleAudioUpload = async (file) => {
    if (!file) return;
    setUploadingIds(prev => ({ ...prev, audio: true }));
    try {
      const formData = new FormData();
      formData.append("file", file); 
      formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      
      // Note the /auto/upload endpoint handles audio/video correctly
      const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      setBgMusic(data.secure_url); // Save the audio URL
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

            {/* Background Music Uploader Section */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-[24px] space-y-4">
              <h3 className="text-sm font-bold text-fuchsia-400 uppercase tracking-widest">Background Music</h3>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer">
                  <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleAudioUpload(e.target.files[0])} />
                  <div className="px-6 py-3 bg-fuchsia-600 border border-fuchsia-500 rounded-xl text-xs uppercase tracking-widest font-bold text-white hover:bg-fuchsia-500 transition-all">
                    {uploadingIds.audio ? "Uploading..." : "Upload Audio Track"}
                  </div>
                </label>
                {bgMusic ? (
                  <p className="text-emerald-400 text-sm">✅ Music uploaded and ready.</p>
                ) : (
                  <p className="text-slate-500 text-sm">No music uploaded yet.</p>
                )}
              </div>
            </div>
            
            {/* Photos Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orbitPhotos.map((p) => (
                <div key={p.id} className="p-6 bg-white/5 border border-white/10 rounded-[24px] space-y-5 transition-all hover:border-white/20">
                  <div className="aspect-video bg-black/40 rounded-2xl overflow-hidden flex items-center justify-center border border-white/5 relative group">
                    {p.url ? (
                      <img src={p.url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center space-y-2">
                        <span className="text-3xl block">🖼️</span>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">No image uploaded</p>
                      </div>
                    )}
                    
                    {uploadingIds[p.id] && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                        <div className="w-6 h-6 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                        <p className="text-[10px] text-fuchsia-400 font-bold uppercase tracking-tighter">Uploading...</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-4">
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(p.id, e.target.files[0])} />
                      <div className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-center text-[10px] uppercase tracking-[0.2em] font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                        {p.url ? "Change Photo" : "Select Image"}
                      </div>
                    </label>

                    <input className="w-full bg-black/60 border border-white/10 p-4 rounded-xl text-sm focus:border-fuchsia-500/50 outline-none transition-all" value={p.caption} onChange={(e) => updateOrbitPhoto(p.id, 'caption', e.target.value)} placeholder="Enter mist caption..." />
                    
                    <button onClick={() => setOrbitPhotos(prev => prev.filter(item => item.id !== p.id))} className="text-red-900/60 hover:text-red-500 text-[9px] uppercase tracking-widest font-bold self-end transition-colors">
                      Remove Slot
                    </button>
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

        {/* PHASE 5: TIMELINE */}
        {activeTab === 3 && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-light">Timeline Checkpoints</h1>
              <button onClick={addCheckpoint} className="px-4 py-2 bg-indigo-600/20 border border-indigo-500/50 rounded-xl text-xs text-indigo-300 hover:bg-indigo-600/40 transition-all uppercase tracking-widest font-bold">
                + Add Date
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {checkpoints.map((cp) => (
                <div key={cp.id} className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <p className={`font-bold text-[10px] uppercase tracking-widest ${cp.isPermanent ? 'text-pink-400' : 'text-indigo-400'}`}>{cp.isPermanent ? 'Permanent Anchor' : 'Custom Event'}</p>
                    {!cp.isPermanent && ( <button onClick={() => removeCheckpoint(cp.id)} className="text-red-500/50 hover:text-red-500 text-lg leading-none">×</button> )}
                  </div>

                  <div className="space-y-3">
                    <input type="text" className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-sm" value={cp.label} onChange={(e) => updateCheckpoint(cp.id, 'label', e.target.value)} placeholder="Event Label (e.g., First Date)" />
                    <div className="flex gap-3">
                      <input type="date" className="flex-1 bg-black/40 border border-white/10 p-3 rounded-lg text-sm color-white" value={cp.date} onChange={(e) => updateCheckpoint(cp.id, 'date', e.target.value)} />
                      <select className="flex-1 bg-black/40 border border-white/10 p-3 rounded-lg text-sm appearance-none" value={cp.color} onChange={(e) => updateCheckpoint(cp.id, 'color', e.target.value)}>
                        {COLOR_OPTIONS.map(opt => ( <option key={opt.value} value={opt.value}>{opt.label} Dot</option> ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;