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

  const [step, setStep] = useState(2);
  const [role, setRole] = useState<UserRole>("VIEWER");
  const [region, setRegion] = useState<Region | "">("");
  const [fullName, setFullName] = useState(googleUser?.displayName || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const regions: Region[] = ["Cirebon", "Indramayu", "Majalengka", "Kuningan"];

  const handleComplete = async () => {
    if (!auth.currentUser) {
      setError("Sesi kadaluarsa. Silakan masuk kembali.");
      return;
    }
    
    if (!role || !region || !fullName) {
      setError("Mohon lengkapi semua data.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userRef, {
        uid: auth.currentUser.uid,
        fullName,
        email: auth.currentUser.email || "no-email@tarkam.arena",
        role,
        region,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      navigate("/");
    } catch (err: any) {
      console.error("Registration Error Details:", err);
      setError(err?.message || "Terjadi kesalahan pendaftaran. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black py-12 px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-neon/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-xl mx-auto space-y-12 relative z-10">
        {/* Progress System */}
        <div className="flex items-center gap-4">
          {[2, 3].map((s) => (
            <div key={s} className="flex-1 space-y-2">
              <div className={cn("h-1 rounded-full transition-all duration-500", s <= step ? "bg-neon shadow-[0_0_10px_rgba(180,255,0,0.5)]" : "bg-white/5")} />
              <p className={cn("text-[8px] font-black uppercase tracking-widest", s === step ? "text-neon" : "text-gray-700")}>Step 0{s - 1}</p>
            </div>
          ))}
        </div>

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="text-center px-4">
              <h1 className="text-3xl md:text-4xl font-display font-black uppercase italic tracking-tighter text-white">Pilih <span className="text-neon underline decoration-neon/20 underline-offset-8">Wilayah</span></h1>
              <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-[10px] mt-2 italic">Area domisili utama Tarkam Arena</p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {regions.map((r) => (
                <button
                  key={r}
                  onClick={() => { setRegion(r); setStep(3); }}
                  className={cn(
                    "p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] text-center transition-all border border-white/5 flex flex-col items-center gap-3 md:gap-4 group",
                    region === r ? "bg-neon/10 border-neon" : "bg-white/5 hover:border-white/20"
                  )}
                >
                  <MapPin className={cn("w-8 h-8 md:w-10 md:h-10 transition-transform group-hover:-translate-y-1", region === r ? "text-neon" : "text-gray-800")} />
                  <span className="text-sm md:text-lg font-display font-black uppercase italic tracking-tight text-white">{r}</span>
                </button>
              ))}
            </div>
            <button onClick={() => navigate("/login")} className="text-gray-700 hover:text-white font-black uppercase tracking-[0.2em] text-[10px] w-full transition-colors italic">Batal Pendaftaran</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="text-center px-4">
              <h1 className="text-3xl md:text-4xl font-display font-black uppercase italic tracking-tighter text-white">Finalisasi <span className="text-neon underline decoration-neon/20 underline-offset-8">Data</span></h1>
              <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-[10px] mt-2 italic">Lengkapi informasi publik anda</p>
            </div>
            <div className="glass p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 space-y-6 md:space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-4 md:py-5 px-5 md:px-6 text-xl md:text-2xl font-display font-black uppercase italic tracking-tight text-white focus:border-neon outline-none transition-all placeholder:text-gray-800"
                  placeholder="EX: BAMBANG P."
                />
              </div>

              <div className="flex gap-3 md:gap-4">
                <div className="flex-1 bg-white/5 p-4 md:p-5 rounded-xl md:rounded-2xl border border-white/5 text-center">
                  <span className="text-[7px] md:text-[8px] font-black text-gray-700 uppercase tracking-widest block mb-1">Akses</span>
                  <span className="text-xs font-black text-neon uppercase italic tracking-widest">{role}</span>
                </div>
                <div className="flex-1 bg-white/5 p-4 md:p-5 rounded-xl md:rounded-2xl border border-white/5 text-center">
                  <span className="text-[7px] md:text-[8px] font-black text-gray-700 uppercase tracking-widest block mb-1">Wilayah</span>
                  <span className="text-xs font-black text-neon uppercase italic tracking-widest">{region}</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] md:text-[10px] p-3 md:p-4 rounded-xl font-black uppercase tracking-wider text-center">
                  {error}
                </div>
              )}

              <button 
                onClick={handleComplete}
                disabled={loading || !fullName}
                className="w-full bg-neon text-black py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-neon/20 transition-all hover:shadow-neon/40 hover:scale-[1.02] active:scale-95 disabled:opacity-50 italic"
              >
                {loading ? "PROCESSING..." : "JOIN THE ARENA"}
              </button>
            </div>
            <button onClick={() => setStep(2)} className="text-gray-700 hover:text-white font-black uppercase tracking-[0.2em] text-[10px] w-full transition-colors italic">Ubah Wilayah</button>
          </div>
        )}
      </div>
    </div>
  );
}
