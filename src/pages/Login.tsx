import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Trophy, Mail, Lock, ChevronRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const docRef = doc(db, "users", result.user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        navigate("/register", { state: { googleUser: result.user } });
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err: any) {
      setError("Email atau Password salah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden bg-black">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-md w-full space-y-8 relative z-10 transition-all duration-500">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-neon/10 border border-neon/20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-neon/10 rotate-3 transform transition-transform hover:rotate-0">
            <Trophy className="w-10 h-10 text-neon" />
          </div>
          <div>
            <h1 className="text-4xl font-display font-black uppercase italic tracking-tighter text-white">Tarkam <span className="text-neon underline decoration-neon/20 underline-offset-8">Arena</span></h1>
            <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-[10px] mt-2 italic">Official EO & Admin Access</p>
          </div>
        </div>

        <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-6 shadow-2xl">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-neon transition-all hover:shadow-[0_0_20px_rgba(180,255,0,0.3)] disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/layout/google.svg" className="w-5 h-5 font-bold" alt="Google" />
            Lanjut dengan Google
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-gray-700 text-[9px] font-black uppercase tracking-widest">Atau Gunakan Email</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Account Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 group-focus-within:text-neon transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white text-sm focus:border-neon outline-none transition-all placeholder:text-gray-800"
                  placeholder="admin@tarkam.arena"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Secure Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700 group-focus-within:text-neon transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white text-sm focus:border-neon outline-none transition-all placeholder:text-gray-800"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] p-3 rounded-lg font-black uppercase tracking-wider text-center">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-neon text-black py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-neon/20 transition-all hover:shadow-neon/40 hover:scale-[1.02] active:scale-95 disabled:opacity-50 italic"
            >
              {loading ? "AUTHENTICATING..." : "LOGIN TO ARENA"}
            </button>
          </form>

          <p className="text-center text-gray-700 text-[10px] font-black uppercase tracking-widest leading-relaxed">
            Akses Terbatas khusus EO & Admin.<br/>Hubungi Pusat Bantuan untuk pendaftaran.
          </p>
        </div>
      </div>
    </div>
  );
}
