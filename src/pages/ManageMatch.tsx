import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { useAuth } from "../contexts/AuthContext";
import { Match, MatchEvent, Tournament } from "../types";
import { ChevronLeft, Zap, Trophy, Shield, Users, Activity, Plus, Save } from "lucide-react";
import { cn } from "../lib/utils";

export default function ManageMatch() {
  const { matchId } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!matchId) return;

    const unsub = onSnapshot(doc(db, "matches", matchId), (docSnap) => {
      if (docSnap.exists()) {
        setMatch({ id: docSnap.id, ...docSnap.data() } as Match);
      }
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `matches/${matchId}`);
    });

    return () => unsub();
  }, [matchId]);

  const [matchInfo, setMatchInfo] = useState({
    flyerUrl: "",
    ticketPrice: 0,
    photographerInfo: "",
    liveStreamUrl: "",
  });

  useEffect(() => {
    if (match) {
      setMatchInfo({
        flyerUrl: match.flyerUrl || "",
        ticketPrice: match.ticketPrice || 0,
        photographerInfo: match.photographerInfo || "",
        liveStreamUrl: match.liveStreamUrl || "",
      });
    }
  }, [match]);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!match || updating) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, "matches", match.id), {
        ...matchInfo,
        ticketPrice: Number(matchInfo.ticketPrice),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `matches/${matchId}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateScore = async (side: "home" | "away", delta: number) => {
    if (!match || updating) return;
    setUpdating(true);
    try {
      const field = side === "home" ? "homeScore" : "awayScore";
      const newScore = Math.max(0, (match[field] || 0) + delta);
      await updateDoc(doc(db, "matches", match.id), {
        [field]: newScore,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `matches/${matchId}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddEvent = async (type: MatchEvent["type"], teamId: string) => {
    if (!match || updating) return;
    const minute = prompt("Minute?");
    if (!minute) return;

    setUpdating(true);
    try {
      const event: MatchEvent = {
        type,
        minute: parseInt(minute),
        teamId,
      };
      await updateDoc(doc(db, "matches", match.id), {
        events: arrayUnion(event),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `matches/${matchId}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateStatus = async (status: Match["status"]) => {
    if (!match || updating) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, "matches", match.id), {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `matches/${matchId}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddPhoto = async () => {
    if (!match || updating) return;
    const url = prompt("Enter Photo URL:");
    if (!url) return;
    
    setUpdating(true);
    try {
      await updateDoc(doc(db, "matches", match.id), {
        photoUrls: arrayUnion(url),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `matches/${matchId}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-display text-neon animate-pulse uppercase">Tactical Setup...</div>;
  if (!match) return <div className="h-screen flex items-center justify-center text-red-500 uppercase font-black">Match Not Found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Live Arena</span>
        </button>
        <div className="flex items-center gap-2">
           <span className={cn(
             "px-3 py-1 rounded text-[10px] font-black border",
             match.status === "LIVE" ? "bg-red-500/10 border-red-500 text-red-500 animate-pulse" : "bg-white/5 border-white/10 text-gray-500"
           )}>
             {match.status}
           </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Score Board */}
        <div className="glass p-8 rounded-[2rem] border-l-4 border-l-neon space-y-8 bg-gradient-to-br from-white/[0.03] to-transparent">
           <div className="flex justify-between items-center px-4">
              <div className="flex flex-col items-center gap-3">
                 <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl">
                    <Shield className="w-10 h-10 text-gray-600" />
                 </div>
                 <span className="text-xs font-black uppercase tracking-tighter text-center max-w-[100px] truncate">{match.homeTeamId}</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                 <div className="text-6xl font-display font-black tracking-tighter italic text-white flex gap-4 items-center">
                    <span>{match.homeScore}</span>
                    <span className="text-gray-800 text-4xl">:</span>
                    <span>{match.awayScore}</span>
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neon italic">Full Control</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                 <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl">
                    <Shield className="w-10 h-10 text-gray-600" />
                 </div>
                 <span className="text-xs font-black uppercase tracking-tighter text-center max-w-[100px] truncate">{match.awayTeamId}</span>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-center gap-2">
                 <button 
                   onClick={() => handleUpdateScore("home", -1)}
                   className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center font-black"
                 >-</button>
                 <button 
                   onClick={() => handleUpdateScore("home", 1)}
                   className="w-20 h-10 rounded-lg bg-neon text-black flex items-center justify-center font-black uppercase text-[10px]"
                 >GOAL</button>
              </div>
              <div className="flex justify-center gap-2">
                 <button 
                    onClick={() => handleUpdateScore("away", 1)}
                    className="w-20 h-10 rounded-lg bg-neon text-black flex items-center justify-center font-black uppercase text-[10px]"
                 >GOAL</button>
                 <button 
                    onClick={() => handleUpdateScore("away", -1)}
                    className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center font-black"
                 >-</button>
              </div>
           </div>
        </div>

        {/* Live Controller */}
        <div className="space-y-6">
           <div className="glass p-6 rounded-3xl border border-white/5 space-y-4">
              <h3 className="text-[10px] uppercase font-black text-neon tracking-widest italic">Schedule Info & Media</h3>
              <form onSubmit={handleSaveInfo} className="space-y-4">
                 <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest ml-1">Flyer Image URL</label>
                    <input 
                      type="url" 
                      value={matchInfo.flyerUrl}
                      onChange={e => setMatchInfo({...matchInfo, flyerUrl: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-xs outline-none focus:border-neon"
                      placeholder="https://..."
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                       <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest ml-1">HTM (IDR)</label>
                       <input 
                         type="number" 
                         value={matchInfo.ticketPrice}
                         onChange={e => setMatchInfo({...matchInfo, ticketPrice: parseInt(e.target.value) || 0})}
                         className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-xs outline-none focus:border-neon"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest ml-1">Photographer</label>
                       <input 
                         type="text" 
                         value={matchInfo.photographerInfo}
                         onChange={e => setMatchInfo({...matchInfo, photographerInfo: e.target.value})}
                         className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-xs outline-none focus:border-neon"
                         placeholder="@lens..."
                       />
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest ml-1">Live Stream URL</label>
                    <input 
                      type="url" 
                      value={matchInfo.liveStreamUrl}
                      onChange={e => setMatchInfo({...matchInfo, liveStreamUrl: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-xs outline-none focus:border-neon"
                      placeholder="YouTube link"
                    />
                 </div>
                 <button 
                  type="submit"
                  disabled={updating}
                  className="w-full py-2 bg-neon/10 border border-neon/20 text-neon rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Save className="w-3 h-3" />
                  Save Schedule Info
                </button>
              </form>
           </div>

           <div className="glass p-6 rounded-3xl border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] uppercase font-black text-neon tracking-widest italic">Match Gallery</h3>
                <button 
                  onClick={handleAddPhoto}
                  className="p-1 px-2 bg-neon/10 border border-neon/20 rounded text-[8px] font-black uppercase text-neon font-black"
                >Add Photo</button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {match.photoUrls?.map((url, i) => (
                  <div key={i} className="aspect-square rounded-lg bg-white/5 overflow-hidden border border-white/10 group relative">
                    <img src={url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all shadow-2xl" alt="Match" />
                  </div>
                ))}
                {!match.photoUrls?.length && (
                  <div className="col-span-3 py-6 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl">
                    <Activity className="w-4 h-4 text-gray-800" />
                    <span className="text-[8px] font-black text-gray-800 uppercase mt-2 italic">No photos uploaded</span>
                  </div>
                )}
              </div>
           </div>

           <div className="glass p-6 rounded-3xl border border-white/5 space-y-4">
              <h3 className="text-[10px] uppercase font-black text-neon tracking-widest italic">Match State</h3>
              <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={() => handleUpdateStatus("LIVE")}
                   className={cn(
                     "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                     match.status === "LIVE" ? "bg-red-500 text-white" : "bg-white/5 hover:bg-red-500/20"
                   )}
                 >Start Live</button>
                 <button 
                    onClick={() => handleUpdateStatus("FINISHED")}
                    className={cn(
                      "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      match.status === "FINISHED" ? "bg-white text-black" : "bg-white/5 hover:bg-white/20"
                    )}
                 >End Match</button>
              </div>
           </div>

           <div className="glass p-6 rounded-3xl border border-white/5 space-y-4">
              <h3 className="text-[10px] uppercase font-black text-neon tracking-widest italic">Events Registry</h3>
              <div className="space-y-2">
                 {match.events?.sort((a,b) => b.minute - a.minute).map((event, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                       <div className="flex items-center gap-3">
                          <span className="text-[9px] font-black text-gray-600">{event.minute}'</span>
                          <span className={cn(
                            "text-[8px] font-black px-1.5 py-0.5 rounded",
                            event.type === "GOAL" ? "bg-neon text-black" : "bg-gray-800 text-white"
                          )}>{event.type}</span>
                          <span className="text-[10px] font-bold uppercase">{event.teamId === match.homeTeamId ? "HOME" : "AWAY"}</span>
                       </div>
                    </div>
                 ))}
                 {!match.events?.length && <p className="text-[8px] text-gray-700 font-black uppercase text-center py-4 italic">No registered events</p>}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
