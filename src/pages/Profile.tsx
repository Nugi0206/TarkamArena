import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { User, LogOut, Settings, Award, History, Users, Shield, Activity, Trophy, Save, MessageCircle, DollarSign, Camera, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, onSnapshot } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { PlayerProfile, Club } from "../types";

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [playerData, setPlayerData] = useState<Partial<PlayerProfile>>({});
  const [managedClub, setManagedClub] = useState<Club | null>(null);
  const [eoData, setEoData] = useState({
    photographerInfo: profile?.photographerInfo || "",
    liveVideoInfo: profile?.liveVideoInfo || "",
    instagramUrl: profile?.instagramUrl || "",
    tiktokUrl: profile?.tiktokUrl || "",
    youtubeUrl: profile?.youtubeUrl || "",
  });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (profile?.role === "PLAYER") {
      const fetchPlayer = async () => {
        const docSnap = await getDoc(doc(db, "players", profile.uid));
        if (docSnap.exists()) {
          setPlayerData(docSnap.data());
        }
      };
      fetchPlayer();
    }

    if (profile?.role === "CLUB_ADMIN") {
      const q = query(collection(db, "clubs"), where("adminId", "==", profile.uid));
      const unsub = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          setManagedClub({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Club);
        }
      });
      return () => unsub();
    }
  }, [profile]);

  const handleSaveEO = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", profile.uid), {
        ...eoData,
        updatedAt: serverTimestamp()
      });
      setEditing(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCV = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "players", profile.uid), {
        ...playerData,
        updatedAt: serverTimestamp()
      });
      setEditing(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `players/${profile.uid}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (!profile) return null;

  return (
    <div className="space-y-6 pb-10">
      {/* Profile Header */}
      <div className="relative rounded-3xl overflow-hidden glass border border-white/5">
        <div className="h-24 bg-gradient-to-r from-neon/40 to-transparent relative">
           <div className="absolute inset-0 bg-[#0A0A0B]/40 backdrop-blur-sm" />
        </div>
        <div className="px-6 md:px-8 pb-8 flex flex-col md:flex-row items-center md:items-end gap-6 -mt-12 md:-mt-10 relative z-10 text-center md:text-left">
          <div className="relative group">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gray-900 border-2 border-[#0A0A0B] p-1 shadow-2xl">
              <img 
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.fullName}`} 
                alt={profile.fullName} 
                className="w-full h-full rounded-xl object-cover grayscale"
              />
            </div>
            <button className="absolute bottom-1 right-1 p-1.5 bg-[#0A0A0B] hover:bg-neon hover:text-black rounded-lg border border-white/10 transition-all">
              <Settings className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1 pb-1">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 mb-1">
              <h1 className="text-2xl md:text-3xl font-display font-black tracking-tighter uppercase italic">{profile.fullName}</h1>
              <span className="bg-neon text-black text-[8px] md:text-[9px] font-black px-1.5 py-0.5 rounded italic">
                {profile.role}
              </span>
            </div>
            <p className="text-gray-500 text-[9px] md:text-[10px] uppercase font-black tracking-widest">{profile.region} DISTRICT</p>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            {(profile.role === "PLAYER" || profile.role === "EO") && (
               <button 
                onClick={() => setEditing(!editing)}
                className="flex-1 md:flex-none px-5 py-2.5 md:py-2 bg-neon/10 border border-neon/20 hover:bg-neon/20 text-neon rounded-lg text-[10px] font-black uppercase tracking-widest transition-all italic"
              >
                {editing ? "BATAL" : profile.role === "PLAYER" ? "EDIT CV" : "EDIT INFO"}
              </button>
            )}
            <button 
              onClick={handleSignOut}
              className="flex-1 md:flex-none px-5 py-2.5 md:py-2 bg-white/5 border border-white/10 hover:bg-red-600 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 italic"
            >
              <LogOut className="w-3 h-3" />
              LOGOUT
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Sidebar / Stats */}
        <div className="space-y-6">
          <div className="glass p-5 rounded-2xl space-y-4">
            <h3 className="text-[9px] font-black text-neon uppercase tracking-[0.2em] italic">Identity Info</h3>
            <div className="space-y-4">
               <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black text-gray-700 uppercase">Registered Email</span>
                  <p className="text-[11px] font-bold text-gray-300">{profile.email}</p>
               </div>
               {profile.role === "PLAYER" && (
                 <>
                   <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black text-gray-700 uppercase">WhatsApp</span>
                      <p className="text-[11px] font-bold text-neon">{playerData.contactWhatsApp || "-"}</p>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[8px] font-black text-gray-700 uppercase">Negotiation Price</span>
                      <p className="text-[11px] font-bold text-white uppercase italic">{playerData.negotiationPrice || "Berdasarkan Match"}</p>
                   </div>
                 </>
               )}
            </div>
          </div>
          
          <div className="glass p-5 rounded-2xl space-y-4">
            <h3 className="text-[9px] font-black text-neon uppercase tracking-[0.2em] italic">Dashboard Actions</h3>
            <div className="space-y-1">
              <ActivityItem icon={<History className="w-4 h-4" />} label="Match History" />
              <ActivityItem icon={<Award className="w-4 h-4" />} label="Achievements" />
              {profile.role === "CLUB_ADMIN" && managedClub && (
                <button 
                  onClick={() => navigate(`/admin/clubs/${managedClub.id}/manage`)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-gray-500 group-hover:text-neon transition-colors"><Shield className="w-4 h-4" /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">Manage Club</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/5 group-hover:bg-neon transition-colors" />
                </button>
              )}
              {profile.role === "EO" && (
                <>
                  <button 
                    onClick={() => navigate("/tournaments/create")}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-gray-500 group-hover:text-neon transition-colors"><Trophy className="w-4 h-4" /></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">Buat Turnamen</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/5 group-hover:bg-neon transition-colors" />
                  </button>
                  <button 
                    onClick={() => navigate("/admin/venues")}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-gray-500 group-hover:text-neon transition-colors"><MapPin className="w-4 h-4" /></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">Upload Lapangan</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/5 group-hover:bg-neon transition-colors" />
                  </button>
                </>
              )}
              {(profile.role === "ADMIN" || profile.email === "muhamadnugiandri@gmail.com") && (
                <button 
                  onClick={() => navigate("/admin/users")}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-gray-500 group-hover:text-neon transition-colors"><Shield className="w-4 h-4" /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">Manajemen User</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/5 group-hover:bg-neon transition-colors" />
                </button>
              )}
              {profile.role === "EO" && (
                <button 
                  onClick={() => navigate("/tournaments/create")}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-slate-500 group-hover:text-neon transition-colors"><Trophy className="w-4 h-4" /></div>
                    <span className="text-sm font-medium text-slate-400 group-hover:text-white transition-colors">Buat Turnamen</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-neon transition-colors" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {editing ? (
            profile.role === "PLAYER" ? (
             <div className="glass p-8 rounded-3xl space-y-6 border border-neon/20 animate-in slide-in-from-bottom-5 duration-500">
                <h2 className="text-xl font-display font-black uppercase tracking-tight italic">Update CV <span className="text-neon">Karir</span></h2>
                <div className="grid sm:grid-cols-2 gap-6">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                         <MessageCircle className="w-3 h-3" /> WhatsApp Contact
                      </label>
                      <input 
                        type="tel"
                        value={playerData.contactWhatsApp || ""}
                        onChange={(e) => setPlayerData({...playerData, contactWhatsApp: e.target.value})}
                        placeholder="6281234..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-neon outline-none"
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                         <DollarSign className="w-3 h-3" /> Negotiation Price (Desc)
                      </label>
                      <input 
                        type="text"
                        value={playerData.negotiationPrice || ""}
                        onChange={(e) => setPlayerData({...playerData, negotiationPrice: e.target.value})}
                        placeholder="cth: 500k / Match"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-neon outline-none"
                      />
                   </div>
                   <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Short Bio / Career Summary</label>
                      <textarea 
                        rows={4}
                        value={playerData.bio || ""}
                        onChange={(e) => setPlayerData({...playerData, bio: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-neon outline-none resize-none"
                      />
                   </div>
                </div>
                <button 
                  onClick={handleSaveCV}
                  disabled={loading}
                  className="bg-neon text-black px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest italic flex items-center gap-2 hover:shadow-[0_0_20px_rgba(180,255,0,0.3)] transition-all"
                >
                   <Save className="w-4 h-4" />
                   {loading ? "Menyimpan..." : "Simpan Profil Karir"}
                </button>
             </div>
            ) : profile.role === "EO" ? (
              <div className="glass p-8 rounded-3xl space-y-6 border border-neon/20 animate-in slide-in-from-bottom-5 duration-500">
                <h2 className="text-xl font-display font-black uppercase tracking-tight italic">Update Info <span className="text-neon">Layanan</span></h2>
                <div className="grid sm:grid-cols-2 gap-6">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Informasi Fotografer</label>
                      <input 
                        type="text"
                        value={eoData.photographerInfo}
                        onChange={(e) => setEoData({...eoData, photographerInfo: e.target.value})}
                        placeholder="cth: @LensArena / 0812..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-neon outline-none"
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Informasi Video Live</label>
                      <input 
                        type="text"
                        value={eoData.liveVideoInfo}
                        onChange={(e) => setEoData({...eoData, liveVideoInfo: e.target.value})}
                        placeholder="cth: YouTube TarkamTV"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-neon outline-none"
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Instagram URL</label>
                      <input 
                        type="url"
                        value={eoData.instagramUrl}
                        onChange={(e) => setEoData({...eoData, instagramUrl: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-neon outline-none"
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">TikTok/YouTube</label>
                      <input 
                        type="url"
                        value={eoData.tiktokUrl}
                        onChange={(e) => setEoData({...eoData, tiktokUrl: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-neon outline-none"
                      />
                   </div>
                </div>
                <button 
                  onClick={handleSaveEO}
                  disabled={loading}
                  className="bg-neon text-black px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest italic flex items-center gap-2 hover:shadow-[0_0_20px_rgba(180,255,0,0.3)] transition-all"
                >
                   <Save className="w-4 h-4" />
                   {loading ? "Menyimpan..." : "Simpan Info Layanan"}
                </button>
             </div>
            ) : null
          ) : (
            <>
              {profile.role === "PLAYER" && (
                <section className="space-y-3">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Career Statistics</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatBox label="MATCHES" value="0" />
                    <StatBox label="GOALS" value="0" />
                    <StatBox label="ASSISTS" value="0" />
                    <StatBox label="RATING" value="-" />
                  </div>
                </section>
              )}

              {profile.role === "EO" && (
                <section className="space-y-3">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Service Coverage</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                     <div className="glass p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                        <Camera className="w-6 h-6 text-neon" />
                        <div>
                           <p className="text-[8px] font-black text-gray-600 uppercase">Photography</p>
                           <p className="text-xs font-black text-white">{profile.photographerInfo || "Not Specified"}</p>
                        </div>
                     </div>
                     <div className="glass p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                        <Activity className="w-6 h-6 text-neon" />
                        <div>
                           <p className="text-[8px] font-black text-gray-600 uppercase">Live Streaming</p>
                           <p className="text-xs font-black text-white">{profile.liveVideoInfo || "Not Specified"}</p>
                        </div>
                     </div>
                  </div>
                </section>
              )}

              <section className="space-y-3">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">About / Identity</h2>
                <div className="glass p-6 rounded-2xl border border-white/5">
                   <p className="text-sm text-gray-400 leading-relaxed italic uppercase font-medium">
                      {profile.role === "PLAYER" ? (playerData.bio || "Pemain belum menambahkan informasi profil karir.") : `EO Profesional di wilayah ${profile.region}.`}
                   </p>
                </div>
              </section>
            </>
          )}

          <section className="space-y-3">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Regional Feed</h2>
            <div className="glass h-48 rounded-2xl flex flex-col items-center justify-center text-gray-700 gap-3 border border-dashed border-white/5">
              <Activity className="w-6 h-6 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest">No recent tactical data detected.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group">
      <div className="flex items-center gap-3">
        <div className="text-gray-500 group-hover:text-neon transition-colors">{icon}</div>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">{label}</span>
      </div>
      <div className="w-1.5 h-1.5 rounded-full bg-white/5 group-hover:bg-neon transition-colors" />
    </button>
  );
}

function StatBox({ label, value }: { label: string, value: string }) {
  return (
    <div className="glass p-4 rounded-2xl text-center space-y-1 group hover:border-neon/30 transition-all">
      <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest group-hover:text-neon transition-colors">{label}</span>
      <p className="text-2xl font-display font-black text-white italic transition-all group-hover:scale-110">{value}</p>
    </div>
  );
}
