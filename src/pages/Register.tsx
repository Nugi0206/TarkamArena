import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { UserRole, Region } from "../types";
import { Trophy, Shield, Users, Calendar, MapPin, Check } from "lucide-react";
import { cn } from "../lib/utils";

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const googleUser = location.state?.googleUser;

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole | "">("");
  const [region, setRegion] = useState<Region | "">("");
  const [fullName, setFullName] = useState(googleUser?.displayName || "");
  const [loading, setLoading] = useState(false);

  const roles = [
    { id: "PLAYER", title: "Pemain", desc: "Cari klub & bangun statistik karier", icon: Users },
    { id: "CLUB_ADMIN", title: "Admin Klub", desc: "Kelola tim & rekrut pemain", icon: Shield },
    { id: "EO", title: "Penyelenggara", desc: "Buat turnamen & kelola match", icon: Trophy },
    { id: "VIEWER", title: "Penonton", desc: "Update info & live score", icon: Calendar },
  ];

  const regions: Region[] = ["Cirebon", "Indramayu", "Majalengka", "Kuningan"];

  const handleComplete = async () => {
    if (!auth.currentUser || !role || !region || !fullName) return;

    try {
      setLoading(true);
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userRef, {
        uid: auth.currentUser.uid,
        fullName,
        email: auth.currentUser.email,
        role,
        region,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // If user is a player, create a player profile too
      if (role === "PLAYER") {
        const playerRef = doc(db, "players", auth.currentUser.uid);
        await setDoc(playerRef, {
          userId: auth.currentUser.uid,
          positions: [],
          dominantFoot: "Right",
          isOpenToJoin: true,
          stats: { matches: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0 },
          rating: 0,
          achievements: []
        });
      }

      navigate("/");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "users/players");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      {/* Progress Bars */}
      <div className="flex gap-2 mb-12">
        {[1, 2, 3].map((s) => (
          <div key={s} className={cn("h-1.5 flex-1 rounded-full transition-all", s <= step ? "bg-primary-500" : "bg-slate-800")} />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center">
            <h1 className="text-3xl font-display font-bold mb-2">Pilih Peran Anda</h1>
            <p className="text-slate-400">Bagaimana Anda akan menggunakan Tarkam Arena?</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {roles.map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
                  onClick={() => { setRole(r.id as UserRole); setStep(2); }}
                  className={cn(
                    "p-6 rounded-3xl text-left transition-all border-2 group",
                    role === r.id ? "bg-primary-600/10 border-primary-500 ring-2 ring-primary-500/20" : "bg-slate-900 border-slate-800 hover:border-slate-700"
                  )}
                >
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", role === r.id ? "bg-primary-500 text-white" : "bg-slate-800 text-slate-400")}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-display font-bold mb-1">{r.title}</h3>
                  <p className="text-slate-400 text-sm">{r.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center">
            <h1 className="text-3xl font-display font-bold mb-2">Pilih Wilayah</h1>
            <p className="text-slate-400">Pilih area domisili sepak bola utama Anda.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => { setRegion(r); setStep(3); }}
                className={cn(
                  "p-8 rounded-3xl text-center transition-all border-2 flex flex-col items-center gap-3",
                  region === r ? "bg-primary-600/10 border-primary-500" : "bg-slate-900 border-slate-800 hover:border-slate-700"
                )}
              >
                <MapPin className={cn("w-8 h-8", region === r ? "text-primary-500" : "text-slate-600")} />
                <span className="text-xl font-display font-bold">{r}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(1)} className="text-slate-500 hover:text-white font-bold transition-colors w-full">Kembali</button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center">
            <h1 className="text-3xl font-display font-bold mb-2">Konfirmasi Profil</h1>
            <p className="text-slate-400">Sedikit lagi dan Anda siap bertanding!</p>
          </div>
          <div className="glass-morphism p-8 rounded-3xl space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Nama Lengkap</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-4 px-4 focus:border-primary-500 outline-none transition-all text-xl font-display font-bold"
                placeholder="cth: Bambang Pamungkas"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1 bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Peran</span>
                <span className="font-bold text-primary-400">{role}</span>
              </div>
              <div className="flex-1 bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Wilayah</span>
                <span className="font-bold text-primary-400">{region}</span>
              </div>
            </div>

            <button 
              onClick={handleComplete}
              disabled={loading || !fullName}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Menyimpan..." : <><Check className="w-5 h-5" /> Selesaikan Pendaftaran</>}
            </button>
          </div>
          <button onClick={() => setStep(2)} className="text-slate-500 hover:text-white font-bold transition-colors w-full">Kembali</button>
        </div>
      )}
    </div>
  );
}
