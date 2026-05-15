import React from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Trophy, Calendar, MapPin, Share2, Info, List, Grid, Zap, Shield } from "lucide-react";
import { cn } from "../lib/utils";

export default function TournamentDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header Navigation */}
      <div className="flex items-center justify-between px-1">
        <Link to="/tournaments" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group">
          <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center group-hover:bg-neon group-hover:text-black transition-all">
            <ChevronLeft className="w-4 h-4 text-current" />
          </div>
          <span className="font-black text-[10px] uppercase tracking-widest italic">Return to Arena</span>
        </Link>
        <button className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-neon transition-all hover:scale-105 active:scale-95">
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Hero Banner */}
      <section className="relative h-64 md:h-80 glass rounded-3xl overflow-hidden shadow-2xl shadow-neon/5">
        <img 
          src="https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=2000" 
          className="absolute inset-0 w-full h-full object-cover grayscale opacity-50"
          alt="Tournament Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/40 to-transparent flex flex-col justify-end p-8 md:p-12">
          <div className="flex items-center gap-2 mb-3">
             <span className="bg-neon text-black text-[9px] font-black px-2 py-0.5 rounded italic">REGISTRATION OPEN</span>
             <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded italic uppercase tracking-tighter animate-pulse">Live Soon</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black leading-[0.85] tracking-tighter uppercase max-w-2xl">
             BUPATI CUP <span className="text-neon">KUNINGAN</span> 2024
          </h1>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Metrics */}
          <div className="glass p-6 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-4 border border-white/5">
            <InfoItem icon={<Calendar className="w-4 h-4 text-neon" />} label="Schedule" value="12 Jun 2024" />
            <InfoItem icon={<MapPin className="w-4 h-4 text-neon" />} label="Location" value="Mashud W." />
            <InfoItem icon={<Trophy className="w-4 h-4 text-neon" />} label="Grand Prize" value="Rp 50MT" />
            <InfoItem icon={<Zap className="w-4 h-4 text-neon" />} label="Format" value="KO SYSTEM" />
          </div>

          {/* Dynamic Tabs */}
          <div className="space-y-4">
            <div className="flex gap-6 border-b border-white/5 px-2">
              {["OVERVIEW", "BRACKET", "SQUAD LIST", "DATA"].map((tab, i) => (
                <button 
                  key={tab}
                  className={cn(
                    "pb-3 text-[10px] font-black tracking-[0.2em] transition-all border-b-2",
                    i === 0 ? "border-neon text-neon" : "border-transparent text-gray-600 hover:text-white"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="glass h-64 rounded-2xl flex flex-col items-center justify-center text-gray-700 gap-3 border border-dashed border-white/10">
               <Grid className="w-8 h-8 opacity-10" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Awaiting Tactical Feed...</p>
            </div>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-4">
          <div className="glass p-6 rounded-2xl space-y-6 border-l-4 border-l-neon shadow-xl shadow-neon/10">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">REGISTRATION FEE</span>
              <p className="text-3xl font-display font-black text-white italic tracking-tighter">1.500K<span className="text-[10px] font-bold text-gray-600 ml-1 uppercase">/ TEAM</span></p>
            </div>
            <button className="w-full bg-neon text-black py-4 rounded-lg font-black text-xs uppercase tracking-[0.2em] hover:bg-neon/90 transition-all active:scale-95 shadow-lg shadow-neon/20">
              SECURE SLOT NOW
            </button>
            <div className="flex items-center justify-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
               <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest italic">4 Slots Available</p>
            </div>
          </div>

          <div className="glass p-5 rounded-2xl space-y-4">
            <h3 className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">Sanctioned By</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-neon" />
              </div>
              <div className="flex flex-col">
                <p className="text-[11px] font-bold uppercase tracking-tighter">DISPORA KUNINGAN</p>
                <p className="text-[8px] text-gray-600 uppercase font-black">Regional Authority</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: any) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{label}</span>
      </div>
      <p className="font-black text-[11px] text-white uppercase italic tracking-tighter">{value}</p>
    </div>
  );
}
