import React from "react";
import { Shield, Search, Filter, MapPin, Trophy, Users } from "lucide-react";

export default function ClubList() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <span className="text-neon text-[10px] font-black uppercase tracking-[0.3em] block italic">CLUBS & TEAMS</span>
          <h1 className="text-4xl font-display font-black tracking-tighter uppercase">DATABASE <span className="text-neon">KLUB</span></h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-neon transition-colors" />
            <input 
              type="text" 
              placeholder="SEARCH CLUBS..." 
              className="md:w-80 bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest focus:border-neon/50 outline-none transition-all placeholder:text-gray-700"
            />
          </div>
          <button className="bg-white/5 border border-white/10 p-3 rounded-lg text-gray-500 hover:text-neon transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="glass p-5 rounded-2xl space-y-6 border border-white/5 hover:neon-border transition-all cursor-pointer group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-2 group-hover:bg-neon/10 group-hover:border-neon/30 transition-all">
                  <Shield className="w-full h-full text-gray-600 group-hover:text-neon transition-colors" />
                </div>
                <div>
                   <h3 className="text-lg font-display font-black group-hover:text-neon transition-colors uppercase tracking-tight">INDRAMAYU UNITED</h3>
                   <div className="flex items-center gap-1 text-gray-500 text-[9px] font-bold uppercase tracking-widest mt-1">
                      <MapPin className="w-3 h-3 text-neon" />
                      <span>Indramayu, West Java</span>
                   </div>
                </div>
              </div>
              <div className="bg-neon text-black text-[8px] font-black px-1.5 py-0.5 rounded italic">
                PRO
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5">
              <div className="text-center">
                <p className="text-xs font-black text-white italic">24</p>
                <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">SQUAD</p>
              </div>
              <div className="text-center border-x border-white/5">
                <p className="text-xs font-black text-white italic">12</p>
                <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">TROPHIES</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-black text-neon italic">85%</p>
                <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">W/RATE</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex -space-x-1.5">
                {[1, 2, 3, 4].map(j => (
                  <div key={j} className="w-6 h-6 rounded-lg border border-[#0A0A0B] bg-gray-800" />
                ))}
              </div>
              <button className="text-neon text-[10px] font-black uppercase tracking-widest hover:underline italic transition-all">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
