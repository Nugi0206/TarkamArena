import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { Venue } from "../types";
import { MapPin, Plus, Trash2, Home, Maximize2, Camera, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ManageVenues() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    grassCondition: "Sangat Baik",
    photoUrls: [""],
  });

  useEffect(() => {
    if (!profile || profile.role !== "EO") return;

    const q = query(collection(db, "venues"));
    const unsub = onSnapshot(q, (snapshot) => {
      setVenues(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Venue[]);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "venues");
    });

    return () => unsub();
  }, [profile]);

  const handleAddVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "venues"), {
        ...formData,
        facilities: ["Standard Pitch", "Locker Room"],
        createdAt: serverTimestamp(),
      });
      setShowAddForm(false);
      setFormData({ name: "", location: "", grassCondition: "Sangat Baik", photoUrls: [""] });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "venues");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus lapangan ini?")) return;
    try {
      await deleteDoc(doc(db, "venues", id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `venues/${id}`);
    }
  };

  if (profile?.role !== "EO") return <div>Access Denied</div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate("/profile")} className="p-2 bg-white/5 rounded-lg hover:bg-white/10">
              <ChevronLeft className="w-5 h-5 text-gray-400" />
           </button>
           <div>
              <h1 className="text-3xl font-display font-black uppercase italic italic tracking-tighter">Database <span className="text-neon">Lapangan</span></h1>
              <p className="text-gray-500 font-bold uppercase text-[9px] tracking-widest mt-1">Kelola listing stage & arena turnamen</p>
           </div>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-neon text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-neon/20 hover:scale-105 transition-all flex items-center gap-2 italic"
        >
          <Plus className="w-4 h-4" />
          Tambah Lapangan
        </button>
      </div>

      {showAddForm && (
        <div className="glass p-8 rounded-[2rem] border border-neon/20 animate-in slide-in-from-top-6 duration-500">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-display font-black uppercase italic text-white">Input <span className="text-neon">Stage Baru</span></h3>
              <button onClick={() => setShowAddForm(false)} className="text-gray-500 font-black text-[10px] uppercase">Batal</button>
           </div>
           <form onSubmit={handleAddVenue} className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Nama Lapangan</label>
                 <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-neon" placeholder="cth: Stadion Mashud Wisnusaputra" />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Kecamatan/Lokasi</label>
                 <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-neon" placeholder="cth: Kuningan Kota" />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Kondisi Rumput</label>
                 <input required type="text" value={formData.grassCondition} onChange={e => setFormData({...formData, grassCondition: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-neon" placeholder="cth: Sintetis / Rumput Alami GBT" />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-neon uppercase tracking-widest ml-1">Foto URL (Thumbnail)</label>
                 <input required type="url" value={formData.photoUrls[0]} onChange={e => setFormData({...formData, photoUrls: [e.target.value]})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-neon" placeholder="https://..." />
              </div>
              <div className="md:col-span-2">
                 <button type="submit" className="w-full bg-neon text-black py-4 rounded-2xl font-black uppercase tracking-widest italic hover:shadow-[0_0_20px_rgba(180,255,0,0.3)] transition-all">
                    Daftarkan Unit Lapangan
                 </button>
              </div>
           </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-64 glass rounded-[2rem] animate-pulse" />)
        ) : (
          venues.map(venue => (
            <div key={venue.id} className="glass rounded-[2rem] overflow-hidden border border-white/5 group hover:border-neon/30 transition-all">
               <div className="h-40 relative">
                  <img src={venue.photoUrls?.[0] || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800"} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={venue.name} />
                  <div className="absolute top-4 right-4 flex gap-2">
                     <button onClick={() => handleDelete(venue.id)} className="p-2 bg-black/80 text-gray-500 hover:text-red-500 rounded-lg backdrop-blur-md">
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>
               <div className="p-6 space-y-4">
                  <div>
                     <h3 className="text-lg font-display font-black uppercase text-white italic tracking-tight">{venue.name}</h3>
                     <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-bold mt-1">
                        <MapPin className="w-3 h-3 text-neon" />
                        <span className="uppercase tracking-widest">{venue.location}</span>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                     <div className="space-y-1">
                        <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest">Grass</span>
                        <p className="text-[10px] font-black text-gray-400 uppercase italic truncate">{venue.grassCondition}</p>
                     </div>
                     <div className="space-y-1">
                        <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest">Type</span>
                        <p className="text-[10px] font-black text-gray-400 uppercase italic">Multi-Stage</p>
                     </div>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
