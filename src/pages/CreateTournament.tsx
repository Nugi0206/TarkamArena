import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { Trophy, Calendar, MapPin, Award, Image as ImageIcon, ChevronLeft, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";

export default function CreateTournament() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    prize: "",
    startDate: "",
    endDate: "",
    location: "",
    bannerUrl: "",
    status: "REGISTRATION" as const,
  });

  if (!profile || profile.role !== "EO") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Trophy className="w-16 h-16 text-gray-800" />
        <h1 className="text-xl font-display font-black uppercase tracking-widest text-center">Akses Ditolak</h1>
        <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest text-center">Hanya Penyelenggara (EO) yang dapat membuat turnamen.</p>
        <button onClick={() => navigate("/")} className="bg-neon text-black px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest italic">Kembali ke Beranda</button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "tournaments"), {
        ...formData,
        eoId: profile.uid,
        participants: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      navigate("/tournaments");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "tournaments");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Batal</span>
        </button>
        <h1 className="text-2xl font-display font-black uppercase tracking-tight">Create <span className="text-neon">Arena</span></h1>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Main Info */}
          <div className="glass p-8 rounded-3xl space-y-6 border border-white/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-neon italic">Tournament Identity</h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Tournament Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="cth: BUPATI CUP KUNINGAN 2024"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-white font-display font-bold focus:border-neon/50 outline-none transition-all placeholder:text-gray-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Description & Rules</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detail turnamen, sistem pertandingan, dan persyaratan pendaftaran..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-white text-sm focus:border-neon/50 outline-none transition-all placeholder:text-gray-800 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-3xl space-y-6 border border-white/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-neon italic">Logistics & Prizes</h3>
            <div className="grid sm:grid-cols-2 gap-4">
               <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Location / District</label>
                <input 
                  required
                  type="text" 
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="cth: Stadion Mashud Wisnusaputra"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-white text-sm focus:border-neon/50 outline-none transition-all placeholder:text-gray-800"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Total Prize Pool</label>
                <input 
                  required
                  type="text" 
                  value={formData.prize}
                  onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
                  placeholder="cth: Rp 50.000.000"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-white text-sm focus:border-neon/50 outline-none transition-all placeholder:text-gray-800"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Side Panel */}
          <div className="glass p-6 rounded-3xl space-y-6 border border-white/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-neon italic">Visual Identity</h3>
            <div className="space-y-4">
              <div className="aspect-[16/9] rounded-2xl bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:bg-white/10 transition-all">
                {formData.bannerUrl ? (
                  <img src={formData.bannerUrl} className="w-full h-full object-cover rounded-2xl" alt="Preview" />
                ) : (
                  <>
                    <ImageIcon className="w-6 h-6 text-gray-700 group-hover:text-neon transition-colors" />
                    <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest">Upload Banner</span>
                  </>
                )}
              </div>
              <input 
                type="url" 
                placeholder="Banner Image URL"
                value={formData.bannerUrl}
                onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-[10px] text-white focus:border-neon/50 outline-none transition-all"
              />
            </div>
          </div>

          <div className="glass p-6 rounded-3xl space-y-6 border border-white/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-neon italic">Launch Control</h3>
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-neon text-black py-4 rounded-2xl font-black uppercase tracking-widest italic flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(180,255,0,0.3)] transition-all disabled:opacity-50"
            >
              {loading ? "Initializing..." : (
                <>
                  <Plus className="w-4 h-4" />
                  Publish Tournament
                </>
              )}
            </button>
            <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.2em] text-center italic">Ready for regional audience.</p>
          </div>
        </div>
      </form>
    </div>
  );
}
