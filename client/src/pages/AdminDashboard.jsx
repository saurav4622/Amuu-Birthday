import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { db } from '../firebase';
import './AdminDashboard.css';

const TABS = ['Phase 2 (Keyhole)', 'Phase 3 (Orbit)', 'Phase 4 (Whispers)'];

function AdminDashboard() {
  const { logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // States with default empty fields so they ARE NEVER BLANK
  const [tumblers, setTumblers] = useState([
    { id: 1, prompt: '', answer: '' },
    { id: 2, prompt: '', answer: '' },
    { id: 3, prompt: '', answer: '' }
  ]);
  const [orbitPhotos, setOrbitPhotos] = useState([
    { id: 1, url: '', caption: '' }
  ]);
  const [poemLines, setPoemLines] = useState("");
  const [uploadingIds, setUploadingIds] = useState({});

  // 1. LOAD DATA FROM FIREBASE
  useEffect(() => {
    const loadData = async () => {
      try {
        const p2Snap = await getDoc(doc(db, "birthdayContent", "phase2"));
        if (p2Snap.exists()) setTumblers(p2Snap.data().questions);

        const p3Snap = await getDoc(doc(db, "birthdayContent", "phase3"));
        if (p3Snap.exists()) setOrbitPhotos(p3Snap.data().photos);

        const p4Snap = await getDoc(doc(db, "birthdayContent", "phase4"));
        if (p4Snap.exists()) setPoemLines(p4Snap.data().text);
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
      await setDoc(doc(db, "birthdayContent", "phase3"), { photos: orbitPhotos });
      await setDoc(doc(db, "birthdayContent", "phase4"), { text: poemLines });
      alert("All changes pushed to the live site! 🚀");
    } catch (error) {
      alert("Failed to save. Check your Firebase permissions.");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper functions
  const updateTumbler = (id, field, value) => {
    setTumblers(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const updateOrbitPhoto = (id, field, value) => {
    setOrbitPhotos(prev => prev.map(p => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleImageUpload = async (id, file) => {
    if (!file) return;
    setUploadingIds(prev => ({ ...prev, [id]: true }));
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      updateOrbitPhoto(id, 'url', data.secure_url);
    } catch (error) {
      alert("Cloudinary upload failed.");
    } finally {
      setUploadingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="admin-dashboard bg-[#020617] text-white min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 p-6 flex flex-col gap-6">
        <h2 className="text-xl font-bold tracking-tighter">Admin Panel</h2>
        <nav className="flex flex-col gap-2 flex-1">
          {TABS.map((tab, i) => (
            <button 
              key={tab} 
              className={`p-3 text-left rounded-lg text-sm transition ${activeTab === i ? 'bg-fuchsia-600' : 'hover:bg-white/5'}`} 
              onClick={() => setActiveTab(i)}
            >
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

{activeTab === 1 && (
  <div className="space-y-8">
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-light">Phase 3 Photos</h1>
      <button onClick={() => setOrbitPhotos([...orbitPhotos, { id: Date.now(), url: '', caption: '' }])} className="px-4 py-2 bg-fuchsia-600/20 border border-fuchsia-500/50 rounded-xl text-xs text-fuchsia-300 hover:bg-fuchsia-600/40 transition-all uppercase tracking-widest font-bold">
        + Add New Slot
      </button>
    </div>
    
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
            
            {/* Overlay Loader */}
            {uploadingIds[p.id] && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                <div className="w-6 h-6 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-[10px] text-fuchsia-400 font-bold uppercase tracking-tighter">Uploading...</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {/* THE NEW UPLOAD BUTTON */}
            <label className="cursor-pointer">
              <input 
                type="file" 
                className="hidden" 
                onChange={(e) => handleImageUpload(p.id, e.target.files[0])} 
              />
              <div className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-center text-[10px] uppercase tracking-[0.2em] font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                {p.url ? "Change Photo" : "Select Image"}
              </div>
            </label>

            <input 
              className="w-full bg-black/60 border border-white/10 p-4 rounded-xl text-sm focus:border-fuchsia-500/50 outline-none transition-all" 
              value={p.caption} 
              onChange={(e) => updateOrbitPhoto(p.id, 'caption', e.target.value)} 
              placeholder="Enter mist caption..." 
            />
            
            <button 
              onClick={() => setOrbitPhotos(prev => prev.filter(item => item.id !== p.id))} 
              className="text-red-900/60 hover:text-red-500 text-[9px] uppercase tracking-widest font-bold self-end transition-colors"
            >
              Remove Slot
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

        {activeTab === 2 && (
          <div className="space-y-8">
            <h1 className="text-3xl font-light">Phase 4 Poem</h1>
            <textarea 
              className="w-full h-[500px] bg-black/40 border border-white/10 p-6 rounded-2xl text-lg italic leading-relaxed" 
              value={poemLines} 
              onChange={(e) => setPoemLines(e.target.value)} 
              placeholder="Type your poem here..."
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;