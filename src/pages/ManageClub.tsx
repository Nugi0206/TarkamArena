import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { Club } from "../types";
import { ChevronLeft, Shield, Save, Instagram, MessageCircle, Camera, Quote } from "lucide-react";

export default function ManageClub() {
  const { clubId } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    logoUrl: "",
    instagramUrl: "",
    whatsappNumber: "",
    description: "",
    homeJerseyUrl: "",
    awayJerseyUrl: "",
    region: "Cirebon"
  });

  useEffect(() => {
    if (!clubId) return;

    const unsub = onSnapshot(doc(db, "clubs", clubId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Club;
        setClub({ id: docSnap.id, ...data });
        setFormData({
          name: data.name || "",
          logoUrl: data.logoUrl || "",
          instagramUrl: data.instagramUrl || "",
          whatsappNumber: data.whatsappNumber || "",
          description: data.description || "",
          homeJerseyUrl: data.homeJerseyUrl || "",
          awayJerseyUrl: data.awayJerseyUrl || "",
          region: data.region || "Cirebon"
        });
      }
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `clubs/${clubId}`);
    });

    return () => unsub();
  }, [clubId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!club || updating) return;

    setUpdating(true);
    try {
      await updateDoc(doc(db, "clubs", club.id), {
        ...formData,
        updatedAt: serverTimestamp()
      });
      alert("Profil klub berhasil diperbarui!");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `clubs/${clubId}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-display text-neon animate-pulse uppercase">Syncing Club Data...</div>;
  if (!club) return <div className="h-screen flex items-center justify-center text-red-500 uppercase font-black">Club Not Found</div>;

  // Authorization check
  const isBootstrapAdmin = profile?.email === 'muhamadnugiandri@gmail.com';
  if (profile?.uid !== club.adminId && !isBootstrapAdmin) {
    return <div className="h-screen flex items-center justify-center text-gray-500 uppercase font-black">Unauthorized Access</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest italic">Club Management</span>
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
           <div className="glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center space-y-4">
              <div className="relative group">
                 <div className="w-32 h-32 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center p-4 overflow-hidden">
                    {formData.logoUrl ? (
                      <img src={formData.logoUrl} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all" alt="Logo" />
                    ) : (
                      <Shield className="w-full h-full text-gray-800" />
                    )}
                 </div>
                 <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-neon text-black flex items-center justify-center border-4 border-[#0A0A0B]">
                    <Camera className="w-4 h-4" />
                 </div>
              </div>
              <div>
                 <h2 className="text-xl font-display font-black uppercase tracking-tight">{club.name}</h2>
                 <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">{club.region} REGIONAL</p>
              </div>
           </div>

           <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Victory Records</h3>
              <div className="grid grid-cols-3 gap-2">
                 <div className="text-center">
                    <p className="text-sm font-black text-white italic">{club.stats.wins}</p>
                    <p className="text-[8px] font-bold text-gray-600 uppercase">WINS</p>
                 </div>
                 <div className="text-center border-x border-white/5">
                    <p className="text-sm font-black text-white italic">{club.stats.draws}</p>
                    <p className="text-[8px] font-bold text-gray-600 uppercase">DRAW</p>
                 </div>
                 <div className="text-center">
                    <p className="text-sm font-black text-white italic">{club.stats.losses}</p>
                    <p className="text-[8px] font-bold text-gray-600 uppercase">LOSS</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="md:col-span-2">
           <form onSubmit={handleSave} className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-neon italic">Klub Identity & Socials</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Nama Klub</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-neon outline-none"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Logo URL</label>
                    <input 
                      type="url" 
                      value={formData.logoUrl}
                      onChange={e => setFormData({...formData, logoUrl: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-neon outline-none"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <Instagram className="w-3 h-3" /> Instagram Link
                    </label>
                    <input 
                      type="url" 
                      value={formData.instagramUrl}
                      onChange={e => setFormData({...formData, instagramUrl: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-neon outline-none"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <MessageCircle className="w-3 h-3" /> WhatsApp Link
                    </label>
                    <input 
                      type="text" 
                      value={formData.whatsappNumber}
                      onChange={e => setFormData({...formData, whatsappNumber: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-neon outline-none"
                      placeholder="wa.me/..."
                    />
                 </div>
                 <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <Quote className="w-3 h-3" /> Club Description & Bio
                    </label>
                    <textarea 
                      rows={4}
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-neon outline-none resize-none"
                      placeholder="Misi, Visi, atau Sejarah Klub..."
                    />
                 </div>
              </div>

              <div className="pt-4">
                 <button 
                  type="submit"
                  disabled={updating}
                  className="w-full bg-neon text-black py-4 rounded-xl font-black uppercase tracking-widest italic flex items-center justify-center gap-3 hover:shadow-[0_0_20px_rgba(180,255,0,0.3)] transition-all"
                >
                  <Save className="w-4 h-4" />
                  {updating ? "Syncing..." : "Simpan Profil Klub"}
                </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
}
