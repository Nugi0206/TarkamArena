import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Trophy, Calendar, MapPin, Share2, Info, List, Grid, Zap, Shield, LayoutGrid } from "lucide-react";
import { cn, formatCurrency } from "../lib/utils";
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { Tournament, Match, Venue } from "../types";

export default function TournamentDetail() {
  const { id } = useParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("OVERVIEW");

  useEffect(() => {
    if (!id) return;

    const fetchTournament = async () => {
      try {
        const docSnap = await getDoc(doc(db, "tournaments", id));
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Tournament;
          setTournament(data);
          
          if (data.venueId) {
            const venueSnap = await getDoc(doc(db, "venues", data.venueId));
            if (venueSnap.exists()) {
              setVenue({ id: venueSnap.id, ...venueSnap.data() } as Venue);
            }
          }
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `tournaments/${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();

    const matchesQuery = query(collection(db, "matches"), where("tournamentId", "==", id));
    const unsubMatches = onSnapshot(matchesQuery, (snapshot) => {
      setMatches(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Match[]);
    });

    return () => unsubMatches();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-display text-neon animate-pulse uppercase tracking-[0.5em] text-xs font-black italic">Loading Arena...</div>;
  if (!tournament) return <div className="min-h-screen flex items-center justify-center font-display text-red-500 uppercase tracking-widest text-xs font-black italic">Tournament Not Found</div>;

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
          src={tournament.bannerUrl || "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=2000"} 
          className="absolute inset-0 w-full h-full object-cover grayscale opacity-50"
          alt="Tournament Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/40 to-transparent flex flex-col justify-end p-8 md:p-12">
          <div className="flex items-center gap-2 mb-3">
             <span className={cn(
               "text-[9px] font-black px-2 py-0.5 rounded italic",
               tournament.status === "REGISTRATION" ? "bg-neon text-black" : "bg-red-600 text-white"
             )}>
               {tournament.status} OPEN
             </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black leading-[0.85] tracking-tighter uppercase max-w-2xl">
             {tournament.name}
          </h1>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Metrics */}
          <div className="glass p-6 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-4 border border-white/5">
            <InfoItem icon={<Calendar className="w-4 h-4 text-neon" />} label="Schedule" value="Jun - Jul 2024" />
            <InfoItem icon={<MapPin className="w-4 h-4 text-neon" />} label="Location" value={venue?.name || "Multiple Venues"} />
            <InfoItem icon={<Trophy className="w-4 h-4 text-neon" />} label="Grand Prize" value={tournament.prize} />
            <InfoItem icon={<Zap className="w-4 h-4 text-neon" />} label="Format" value="KO SYSTEM" />
          </div>

          {/* Dynamic Tabs */}
          <div className="space-y-4">
            <div className="flex gap-6 border-b border-white/5 px-2 overflow-x-auto pb-0">
              {["OVERVIEW", "SCHEDULE", "SQUAD LIST", "VENUE"].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "pb-3 text-[10px] font-black tracking-[0.2em] transition-all border-b-2 whitespace-nowrap",
                    activeTab === tab ? "border-neon text-neon" : "border-transparent text-gray-600 hover:text-white"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="space-y-4">
               {activeTab === "OVERVIEW" && (
                 <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
                   <h3 className="text-xs font-black uppercase tracking-widest text-neon italic">Description</h3>
                   <p className="text-sm text-gray-400 leading-relaxed">{tournament.description}</p>
                 </div>
               )}

               {activeTab === "SCHEDULE" && (
                 <div className="space-y-2">
                   {matches.length > 0 ? (
                     matches.map(match => (
                       <MatchItem key={match.id} match={match} />
                     ))
                   ) : (
                     <EmptyState icon={<Calendar className="w-8 h-8 opacity-10" />} message="No matches scheduled yet" />
                   )}
                 </div>
               )}

               {activeTab === "SQUAD LIST" && (
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                   {tournament.participants?.length > 0 ? (
                     tournament.participants.map(clubId => (
                        <div key={clubId} className="glass p-4 rounded-xl border border-white/5 flex flex-col items-center gap-2">
                           <Shield className="w-8 h-8 text-neon/40" />
                           <span className="text-[10px] font-black uppercase tracking-tighter truncate w-full text-center">{clubId}</span>
                        </div>
                     ))
                   ) : (
                     <div className="col-span-full">
                       <EmptyState icon={<Users className="w-8 h-8 opacity-10" />} message="No teams registered yet" />
                     </div>
                   )}
                 </div>
               )}

               {activeTab === "VENUE" && venue && (
                 <div className="glass p-6 rounded-2xl border border-white/5 space-y-6">
                    <div className="flex items-start justify-between">
                       <div>
                          <h3 className="text-xl font-display font-black text-white uppercase">{venue.name}</h3>
                          <div className="flex items-center gap-1 text-gray-500 text-[10px] font-bold uppercase mt-1">
                             <MapPin className="w-3 h-3 text-neon" />
                             <span>{venue.location}</span>
                          </div>
                       </div>
                       <button className="bg-neon text-black px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest hover:bg-neon/90 transition-all">
                          Open Map
                       </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-white/5 p-4 rounded-xl space-y-1">
                          <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Grass Condition</span>
                          <p className="text-xs font-black text-white italic">{venue.grassCondition}</p>
                       </div>
                       <div className="bg-white/5 p-4 rounded-xl space-y-1">
                          <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Capacity</span>
                          <p className="text-xs font-black text-white italic">20K Fans</p>
                       </div>
                    </div>
                 </div>
               )}
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
                <p className="text-[11px] font-bold uppercase tracking-tighter">DISPORA {tournament.name.includes("Kuningan") ? "KUNINGAN" : "REGIONAL"}</p>
                <p className="text-[8px] text-gray-600 uppercase font-black">Regional Authority</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchItem({ match }: { match: Match }) {
  const isLive = match.status === "LIVE";
  return (
    <div className="glass rounded-xl p-3 flex items-center gap-4 border border-transparent hover:border-neon/20 transition-all cursor-pointer group">
      <div className={cn(
        "w-12 text-[9px] font-black uppercase tracking-tighter",
        isLive ? "text-red-500 animate-pulse" : "text-gray-500"
      )}>
        {isLive ? "LIVE" : match.status}
      </div>
      
      <div className="flex-1 flex items-center justify-between px-2">
        <div className="flex-1 flex items-center justify-end gap-3 text-right">
           <span className="text-[11px] font-black uppercase tracking-tighter truncate max-w-[100px]">{match.homeTeamId}</span>
           <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs">🛡️</div>
        </div>
        
        <div className="px-6 flex flex-col items-center">
           <div className={cn(
             "px-3 py-1 rounded text-[13px] font-black tabular-nums transition-colors min-w-[60px] text-center",
             isLive ? "bg-neon/10 text-neon border border-neon/20" : "bg-black text-gray-400 border border-white/5"
           )}>
             {match.homeScore} - {match.awayScore}
           </div>
        </div>

        <div className="flex-1 flex items-center justify-start gap-3 text-left">
           <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs">⚔️</div>
           <span className="text-[11px] font-black uppercase tracking-tighter truncate max-w-[100px]">{match.awayTeamId}</span>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, message }: any) {
  return (
    <div className="glass h-48 rounded-2xl flex flex-col items-center justify-center text-gray-700 gap-3 border border-dashed border-white/10">
       {icon}
       <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">{message}</p>
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
