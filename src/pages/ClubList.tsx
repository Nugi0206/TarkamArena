import React, { useEffect, useState } from "react";
import { Shield, Search, Filter, MapPin, Trophy, Users } from "lucide-react";
import { collection, query, getDocs, limit } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { Club } from "../types";

export default function ClubList() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const q = query(collection(db, "clubs"), limit(20));
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Club[];
        setClubs(docs);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "clubs");
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  const filtered = clubs.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesRegion = regionFilter === "All" || c.region === regionFilter;
    return matchesSearch && matchesRegion;
  });

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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-64 glass rounded-2xl animate-pulse" />)
        ) : (
          filtered.map((club) => (
            <div key={club.id} className="glass p-5 rounded-2xl space-y-6 border border-white/5 hover:neon-border transition-all cursor-pointer group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-2 group-hover:bg-neon/10 group-hover:border-neon/30 transition-all">
                    {club.logoUrl ? (
                      <img src={club.logoUrl} alt={club.name} className="w-full h-full object-contain" />
                    ) : (
                      <Shield className="w-full h-full text-gray-600 group-hover:text-neon transition-colors" />
                    )}
                  </div>
                  <div>
                     <h3 className="text-lg font-display font-black group-hover:text-neon transition-colors uppercase tracking-tight truncate max-w-[180px]">
                       {club.name}
                     </h3>
                     <div className="flex items-center gap-1 text-gray-500 text-[9px] font-bold uppercase tracking-widest mt-1">
                        <MapPin className="w-3 h-3 text-neon" />
                        <span>{club.region}</span>
                     </div>
                  </div>
                </div>
                <div className="bg-neon text-black text-[8px] font-black px-1.5 py-0.5 rounded italic">
                  PRO
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5">
                <div className="text-center">
                  <p className="text-xs font-black text-white italic">{club.squad?.length || 0}</p>
                  <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">SQUAD</p>
                </div>
                <div className="text-center border-x border-white/5">
                  <p className="text-xs font-black text-white italic">{club.achievements?.length || 0}</p>
                  <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">TROPHIES</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-neon italic">
                    {club.stats ? Math.round((club.stats.wins / (club.stats.wins + club.stats.draws + club.stats.losses || 1)) * 100) : 0}%
                  </p>
                  <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">W/RATE</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex -space-x-1.5">
                  {club.squad?.slice(0, 4).map(playerId => (
                    <div key={playerId} className="w-6 h-6 rounded-lg border border-[#0A0A0B] bg-gray-800" />
                  ))}
                </div>
                <button className="text-neon text-[10px] font-black uppercase tracking-widest hover:underline italic transition-all">View Details</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
