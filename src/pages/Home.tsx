import React, { useEffect, useState } from "react";
import { Trophy, Users, Shield, MapPin, Search, ChevronRight, Activity } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { collection, query, where, onSnapshot, limit, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Match, Tournament } from "../types";

export default function Home() {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Live Matches
    const liveQuery = query(
      collection(db, "matches"),
      where("status", "==", "LIVE"),
      limit(5)
    );
    
    // Upcoming Matches
    const upcomingQuery = query(
      collection(db, "matches"),
      where("status", "==", "SCHEDULED"),
      orderBy("scheduledAt", "asc"),
      limit(5)
    );

    const unsubLive = onSnapshot(liveQuery, (snapshot) => {
      setLiveMatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Match[]);
    });

    const unsubUpcoming = onSnapshot(upcomingQuery, (snapshot) => {
      setUpcomingMatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Match[]);
      setLoading(false);
    });

    return () => {
      unsubLive();
      unsubUpcoming();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <section className="relative h-64 md:h-80 glass rounded-3xl overflow-hidden flex flex-col justify-center px-8 md:px-16 border-l-4 border-l-neon shadow-2xl shadow-neon/10">
        <div className="absolute top-0 right-0 p-4">
           {liveMatches.length > 0 && (
             <span className="bg-red-600 text-[10px] font-black px-2 py-0.5 rounded italic animate-pulse">LIVE - {liveMatches.length} MATCHES</span>
           )}
        </div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <span className="text-neon text-[10px] font-black uppercase tracking-[0.3em] mb-2 block italic">
            Regional Ecosystem
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-black mb-4 leading-[0.9] tracking-tighter max-w-xl group">
             DOMINASI <span className="text-neon">ARENA</span> TARKAM CIAYUMAJAKUNING
          </h1>
          <div className="flex flex-wrap gap-3">
             <Link to="/tournaments" className="bg-neon text-black px-8 py-2.5 rounded text-[11px] font-black uppercase tracking-widest hover:bg-neon/90 transition-all active:scale-95">
                Jelajahi Turnamen
             </Link>
             <Link to="/register" className="bg-white/5 border border-white/10 hover:bg-white/10 px-8 py-2.5 rounded text-[11px] font-black uppercase tracking-widest transition-all">
                Daftar Pemain
             </Link>
          </div>
        </motion.div>
        
        {/* Abstract Background Element */}
        <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-10 pointer-events-none">
           <Trophy className="w-full h-full text-neon -rotate-12 translate-x-1/4 translate-y-1/4" />
        </div>
      </section>

      {/* Regions Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {["Cirebon", "Indramayu", "Majalengka", "Kuningan"].map((region) => (
          <Link 
            key={region} 
            to={`/tournaments?region=${region}`}
            className="glass rounded-xl p-3 flex items-center justify-between border border-white/5 hover:border-neon/30 transition-all cursor-pointer group"
          >
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider transition-colors group-hover:text-neon">{region}</span>
            <div className="w-5 h-5 rounded bg-white/5 flex items-center justify-center">
               <ChevronRight className="w-3 h-3 text-gray-700 group-hover:text-neon transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Live Scores Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
             <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                <span className="w-1.5 h-3 bg-neon rounded-full" />
                Pertandingan Hari Ini
             </h2>
             <Link to="/tournaments" className="text-neon text-[10px] font-bold uppercase tracking-widest hover:underline">
                Lihat Semua
             </Link>
          </div>
          <div className="space-y-2">
            {liveMatches.length === 0 && upcomingMatches.length === 0 && !loading && (
              <div className="glass p-8 rounded-xl text-center border border-dashed border-white/5">
                <p className="text-[10px] uppercase font-black text-gray-700 tracking-widest italic">Tidak ada pertandingan terjadwal</p>
              </div>
            )}
            {liveMatches.map(match => (
              <MatchItem 
                key={match.id}
                homeTeam={match.homeTeamId} 
                awayTeam={match.awayTeamId} 
                homeScore={match.homeScore} 
                awayScore={match.awayScore} 
                status="LIVE" 
                time="LIVE" 
                tournament="Tarkam Match"
              />
            ))}
            {upcomingMatches.map(match => (
              <MatchItem 
                key={match.id}
                homeTeam={match.homeTeamId} 
                awayTeam={match.awayTeamId} 
                homeScore={0} 
                awayScore={0} 
                status={new Date(match.scheduledAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                tournament="Upcoming"
              />
            ))}
          </div>
        </div>

        {/* Sidebar Mini Components */}
        <div className="space-y-6">
           <div className="glass rounded-2xl p-5 neon-border space-y-4">
              <div className="flex justify-between items-start">
                 <h3 className="text-[10px] uppercase font-black text-neon tracking-widest italic">Bursa Transfer</h3>
                 <span className="text-[8px] bg-neon text-black font-bold px-1 rounded">PLAYER OPEN</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
                 <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center border border-neon/30">
                    <Users className="w-5 h-5 text-neon" />
                 </div>
                 <div className="flex-1">
                    <p className="text-[11px] font-bold truncate uppercase tracking-tighter">Deden "Flash" R.</p>
                    <p className="text-[9px] text-gray-500 uppercase font-medium">LW • Kuningan</p>
                 </div>
                 <div className="text-right">
                    <div className="text-[10px] text-neon font-black italic">9.2</div>
                    <p className="text-[7px] text-gray-600 uppercase font-black">Rating</p>
                 </div>
              </div>
              <button className="w-full py-2 bg-neon text-black text-[10px] font-black rounded-lg uppercase tracking-widest hover:bg-neon/90 transition-all">
                Hubungi Scout
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-morphism p-8 rounded-3xl space-y-4 hover:translate-y-[-4px] transition-transform">
      <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-display font-bold">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function MatchItem({ homeTeam, awayTeam, homeScore, awayScore, status, time, tournament }: any) {
  const isLive = status === "LIVE";
  return (
    <div className="glass rounded-xl p-3 flex items-center gap-4 border border-transparent hover:border-neon/20 transition-all cursor-pointer group">
      <div className={cn(
        "w-12 text-[9px] font-black uppercase tracking-tighter",
        isLive ? "text-red-500 animate-pulse" : "text-gray-500"
      )}>
        {isLive ? "LIVE" : status}
      </div>
      
      <div className="flex-1 flex items-center justify-between px-2">
        <div className="flex-1 flex items-center justify-end gap-3 translate-x-2 group-hover:translate-x-0 transition-transform">
           <span className="text-[11px] font-black uppercase tracking-tighter">{homeTeam}</span>
           <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs">🛡️</div>
        </div>
        
        <div className="px-6 flex flex-col items-center">
           <div className={cn(
             "px-3 py-1 rounded text-[13px] font-black tabular-nums transition-colors",
             isLive ? "bg-neon/10 text-neon border border-neon/20" : "bg-black text-gray-400 border border-white/5"
           )}>
             {homeScore} - {awayScore}
           </div>
           {isLive && <span className="text-[8px] font-bold text-neon mt-1 italic">{time}</span>}
        </div>

        <div className="flex-1 flex items-center justify-start gap-3 -translate-x-2 group-hover:translate-x-0 transition-transform">
           <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs">⚔️</div>
           <span className="text-[11px] font-black uppercase tracking-tighter">{awayTeam}</span>
        </div>
      </div>

      <div className="w-20 text-right opacity-0 group-hover:opacity-100 transition-opacity">
         <button className="text-[9px] font-black text-neon uppercase tracking-widest hover:underline italic">Details</button>
      </div>
    </div>
  );
}
