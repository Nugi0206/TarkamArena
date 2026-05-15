import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { User, LogOut, Settings, Award, History, Users, Shield, Activity } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

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
        <div className="px-8 pb-8 flex flex-col md:flex-row items-end gap-6 -mt-10 relative z-10">
          <div className="relative group">
            <div className="w-28 h-28 rounded-2xl bg-gray-900 border-2 border-[#0A0A0B] p-1 shadow-2xl">
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
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-3xl font-display font-black tracking-tighter uppercase">{profile.fullName}</h1>
              <span className="bg-neon text-black text-[9px] font-black px-1.5 py-0.5 rounded italic">
                {profile.role}
              </span>
            </div>
            <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">{profile.region} DISTRICT</p>
          </div>
          <div className="pb-1">
            <button 
              onClick={handleSignOut}
              className="px-5 py-2 bg-white/5 border border-white/10 hover:bg-red-600 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <LogOut className="w-3 h-3" />
              Keluar
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Sidebar / Stats */}
        <div className="space-y-6">
          <div className="glass p-5 rounded-2xl space-y-4">
            <h3 className="text-[9px] font-black text-neon uppercase tracking-[0.2em] italic">Identity Info</h3>
            <div className="space-y-2">
               <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black text-gray-700 uppercase">Registered Email</span>
                  <p className="text-[11px] font-bold text-gray-300">{profile.email}</p>
               </div>
            </div>
          </div>

          <div className="glass p-5 rounded-2xl space-y-4">
            <h3 className="text-[9px] font-black text-neon uppercase tracking-[0.2em] italic">Dashboard Actions</h3>
            <div className="space-y-1">
              <ActivityItem icon={<History className="w-4 h-4" />} label="Match History" />
              <ActivityItem icon={<Award className="w-4 h-4" />} label="Achievements" />
              {profile.role === "PLAYER" && <ActivityItem icon={<Users className="w-4 h-4" />} label="My Club" />}
              {profile.role === "CLUB_ADMIN" && <ActivityItem icon={<Shield className="w-4 h-4" />} label="Manage Club" />}
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
    <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 transition-colors group">
      <div className="flex items-center gap-3">
        <div className="text-slate-500 group-hover:text-primary-500 transition-colors">{icon}</div>
        <span className="text-sm font-medium text-slate-400 group-hover:text-white transition-colors">{label}</span>
      </div>
      <div className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-primary-500 transition-colors" />
    </button>
  );
}

function StatBox({ label, value }: { label: string, value: string }) {
  return (
    <div className="glass-morphism p-6 rounded-3xl text-center space-y-1">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      <p className="text-2xl font-display font-black text-primary-500">{value}</p>
    </div>
  );
}
