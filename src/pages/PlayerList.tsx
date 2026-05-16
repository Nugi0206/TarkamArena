import React, { useEffect, useState } from "react";
import { Users, Search, Filter, MapPin, Award, Star, Activity } from "lucide-react";
import { collection, query, getDocs, where, limit } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { PlayerProfile, UserProfile } from "../types";
import { cn } from "../lib/utils";

export default function PlayerList() {
  const [players, setPlayers] = useState<(PlayerProfile & { user?: UserProfile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const q = query(collection(db, "players"), limit(20));
        const snapshot = await getDocs(q);
        const playerDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as unknown as PlayerProfile[];
        
        // Fetch users for each player to get details like name and region
        const enrichedPlayers = await Promise.all(playerDocs.map(async (player) => {
          const userSnap = await getDocs(query(collection(db, "users"), where("uid", "==", player.userId)));
          const user = userSnap.docs[0]?.data() as UserProfile;
          return { ...player, user };
        }));
        
        setPlayers(enrichedPlayers);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "players");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const filtered = players.filter(p => {
    const matchesSearch = p.user?.fullName.toLowerCase().includes(search.toLowerCase()) || 
                          p.nickname?.toLowerCase().includes(search.toLowerCase());
    const matchesRegion = regionFilter === "All" || p.user?.region === regionFilter;
    return matchesSearch && matchesRegion;
  });

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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="md:w-80 bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest focus:border-neon/50 outline-none transition-all placeholder:text-gray-700"
            />
          </div>
          <select 
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="bg-white/5 border border-white/10 p-3 rounded-lg text-[10px] font-black uppercase tracking-widest outline-none focus:border-neon/50"
          >
            <option value="All">All Regions</option>
            <option value="Cirebon">Cirebon</option>
            <option value="Indramayu">Indramayu</option>
            <option value="Majalengka">Majalengka</option>
            <option value="Kuningan">Kuningan</option>
          </select>
        </div>
      </div>

      {/* Promotion CTA */}
      <div className="glass p-8 rounded-[2rem] border border-neon/20 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-neon/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-neon/10 transition-colors" />
         <div className="relative z-10 text-center md:text-left">
            <h2 className="text-2xl font-display font-black uppercase italic tracking-tight">INGIN <span className="text-neon">PROMOSI</span> PROFIL KARIR?</h2>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Lengkapi syarat & ketentuan untuk tampil di bursa scouting</p>
         </div>
         <a 
           href="https://wa.me/628123456789" // Example admin WA
           target="_blank"
           rel="noreferrer"
           className="relative z-10 bg-neon text-black px-10 py-4 rounded-xl font-black uppercase text-[11px] tracking-[0.2em] shadow-lg shadow-neon/20 hover:shadow-neon/40 hover:scale-105 active:scale-95 transition-all italic flex items-center gap-2"
          >
            HUBUNGI ADMIN PORTAL
         </a>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [1, 2, 3, 4].map(i => <div key={i} className="h-64 glass rounded-2xl animate-pulse" />)
        ) : (
          filtered.map((player) => (
            <div key={player.userId} className="glass rounded-2xl overflow-hidden group hover:neon-border transition-all cursor-pointer">
              <div className="h-44 relative bg-black/40">
                <img 
                  src={player.user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.userId}`} 
                  alt="Player" 
                  className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-700" 
                />
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  <span className="bg-neon text-black text-[8px] font-black px-1.5 py-0.5 rounded italic">
                    {player.positions[0] || "POS"}
                  </span>
                  <span className="bg-black/80 backdrop-blur-md text-[8px] font-black px-1.5 py-0.5 rounded text-white italic border border-white/5 flex items-center gap-1">
                     {player.rating || "0.0"}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                     <h3 className="font-display font-black text-base group-hover:text-neon transition-colors uppercase tracking-tight truncate">
                       {player.user?.fullName || "UNKNOWN PLAYER"}
                     </h3>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 text-[8px] font-bold uppercase tracking-widest mt-0.5">
                    <MapPin className="w-2.5 h-2.5 text-neon" />
                    <span>{player.user?.region || "Unknown Region"}</span>
                  </div>
                </div>

                <div className="bg-neon/5 p-3 rounded-xl border border-neon/10 text-center">
                   <p className="text-[7px] font-black text-gray-600 uppercase tracking-widest leading-none">Negotiation Price</p>
                   <p className="text-sm font-display font-black text-neon uppercase italic tracking-tighter mt-1">{player.negotiationPrice || "Berdasarkan Match"}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 py-2 border-y border-white/5">
                   <div className="flex flex-col">
                      <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Goals</span>
                      <span className="text-xs font-black text-white italic">{player.stats?.goals || 0}</span>
                   </div>
                   <div className="flex flex-col text-right">
                      <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Status</span>
                      <span className={cn(
                        "text-[8px] font-black uppercase italic",
                        player.isOpenToJoin ? "text-neon" : "text-red-500"
                      )}>
                        {player.isOpenToJoin ? "AVAIL" : "IN CLUB"}
                      </span>
                   </div>
                </div>

                <a 
                  href={`https://wa.me/${player.contactWhatsApp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-neon text-black py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all italic flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(180,255,0,0.3)]"
                >
                  Negosiasi via WA
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
