import React, { useEffect, useState } from "react";
import { collection, query, getDocs, where, orderBy } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { Tournament } from "../types";
import { Trophy, Calendar, MapPin, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate, formatCurrency, cn } from "../lib/utils";

export default function TournamentList() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const q = query(collection(db, "tournaments"), orderBy("startDate", "desc"));
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Tournament[];
        setTournaments(docs);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "tournaments");
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const filtered = tournaments.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <span className="text-neon text-[10px] font-black uppercase tracking-[0.3em] block italic">Competition Central</span>
          <h1 className="text-4xl font-display font-black tracking-tighter uppercase">Turnamen <span className="text-neon">Arena</span></h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-neon transition-colors" />
            <input 
              type="text" 
              placeholder="SEARCH TOURNAMENTS..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="md:w-80 bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest focus:border-neon/50 outline-none transition-all placeholder:text-gray-700"
            />
          </div>
          <button className="bg-white/5 border border-white/10 p-3 rounded-lg text-gray-500 hover:text-neon transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 glass rounded-2xl animate-pulse border border-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length > 0 ? (
            filtered.map((tournament) => (
              <Link key={tournament.id} to={`/tournaments/${tournament.id}`} className="group">
                <div className="glass rounded-2xl overflow-hidden transition-all hover:translate-y-[-2px] hover:neon-border group-hover:bg-[#1A1C1E]">
                  <div className="h-32 relative">
                    <img 
                      src={tournament.bannerUrl || "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=800"} 
                      alt={tournament.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                    <div className="absolute top-0 right-0 p-3">
                      <span className={cn(
                        "text-[8px] font-black px-2 py-0.5 rounded tracking-widest uppercase",
                        tournament.status === "REGISTRATION" ? "bg-neon text-black" : 
                        tournament.status === "ONGOING" ? "bg-red-600 text-white" : "bg-white/10 text-gray-400"
                      )}>
                        {tournament.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <h3 className="text-lg font-display font-black group-hover:text-neon transition-colors uppercase tracking-tight leading-tight">{tournament.name}</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest block">Schedule</span>
                        <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold">
                          <Calendar className="w-3 h-3 text-neon" />
                          <span>Jun - Jul 2024</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest block">Prize Pool</span>
                        <p className="font-black text-xs text-white italic">{tournament.prize}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                       <span className="text-[9px] font-black text-neon uppercase tracking-tighter flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          View Details <Trophy className="w-3 h-3" />
                       </span>
                       <div className="flex -space-x-1">
                         {[1, 2, 3].map(j => (
                           <div key={j} className="w-5 h-5 rounded-full border border-[#0A0A0B] bg-gray-800" />
                         ))}
                       </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8 text-slate-700" />
              </div>
              <h2 className="text-2xl font-display font-bold uppercase text-slate-500">Turnamen Tidak Ditemukan</h2>
              <p className="text-slate-600">Coba kata kunci lain atau periksa filter Anda.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
