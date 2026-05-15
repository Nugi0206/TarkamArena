import React from "react";
import { Users, Search, Filter, MapPin, Award, Star, Activity } from "lucide-react";

export default function PlayerList() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <span className="text-neon text-[10px] font-black uppercase tracking-[0.3em] block italic">TALENT SCOUTING</span>
          <h1 className="text-4xl font-display font-black tracking-tighter uppercase">BURSA <span className="text-neon">PEMAIN</span></h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-neon transition-colors" />
            <input 
              type="text" 
              placeholder="SEARCH PLAYERS..." 
              className="md:w-80 bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest focus:border-neon/50 outline-none transition-all placeholder:text-gray-700"
            />
          </div>
          <button className="bg-white/5 border border-white/10 p-3 rounded-lg text-gray-500 hover:text-neon transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="glass rounded-2xl overflow-hidden group hover:neon-border transition-all cursor-pointer">
            <div className="h-44 relative bg-black/40">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} 
                alt="Player" 
                className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-700" 
              />
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                <span className="bg-neon text-black text-[8px] font-black px-1.5 py-0.5 rounded italic">
                  FW
                </span>
                <span className="bg-black/80 backdrop-blur-md text-[8px] font-black px-1.5 py-0.5 rounded text-white italic border border-white/5 flex items-center gap-1">
                   4.8
                </span>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <h3 className="font-display font-black text-base group-hover:text-neon transition-colors uppercase tracking-tight">DWI ANGGARA</h3>
                <div className="flex items-center gap-1 text-gray-600 text-[8px] font-bold uppercase tracking-widest mt-0.5">
                  <MapPin className="w-2.5 h-2.5 text-neon" />
                  <span>Kuningan</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 py-3 border-y border-white/5">
                 <div className="flex flex-col">
                    <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Goals</span>
                    <span className="text-xs font-black text-white italic">12</span>
                 </div>
                 <div className="flex flex-col text-right">
                    <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Status</span>
                    <span className="text-[8px] font-black text-neon uppercase italic">AVAIL</span>
                 </div>
              </div>

              <button className="w-full bg-white/5 border border-white/10 hover:bg-neon hover:text-black py-2 rounded text-[9px] font-black uppercase tracking-widest transition-all italic">
                View Scouting Report
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
