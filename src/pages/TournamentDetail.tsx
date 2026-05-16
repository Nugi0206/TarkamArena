import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Trophy, Calendar, MapPin, Share2, Info, List, Grid, Zap, Shield, LayoutGrid, Users, X, MessageCircle } from "lucide-react";
import { cn, formatCurrency } from "../lib/utils";
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { Tournament, Match, Venue, Club } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { addDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";

export default function TournamentDetail() {
  const { id } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [userClubs, setUserClubs] = useState<Club[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("OVERVIEW");
  const [registering, setRegistering] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [regForm, setRegForm] = useState({ clubName: "", managerName: "", contactWhatsApp: "" });

  useEffect(() => {
    if (!id) return;

    if (profile?.role === "CLUB_ADMIN") {
      const clubsQuery = query(collection(db, "clubs"), where("adminId", "==", profile.uid));
      onSnapshot(clubsQuery, (snapshot) => {
        setUserClubs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Club[]);
      }, (err) => {
        handleFirestoreError(err, OperationType.GET, "clubs");
      });
    }

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
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, "matches");
    });

    return () => unsubMatches();
  }, [id, profile]);

  const handlePublicRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournament || registering) return;
    setRegistering(true);
    try {
      await addDoc(collection(db, "registrations"), {
        tournamentId: tournament.id,
        ...regForm,
        status: "PENDING",
        registeredAt: serverTimestamp()
      });
      alert("Pendaftaran berhasil! EO akan menghubungi anda via WhatsApp untuk verifikasi pembayaran.");
      setShowRegModal(false);
      setRegForm({ clubName: "", managerName: "", contactWhatsApp: "" });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "registrations");
    } finally {
      setRegistering(false);
    }
  };

  const handleBuyTicket = async () => {
    alert("Fitur Pembelian Tiket Online akan segera hadir! Simulasi QR Code tiket akan dikirim ke Email.");
    setShowTicketModal(false);
  };

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
                 <div className="space-y-6">
                   <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
                     <h3 className="text-xs font-black uppercase tracking-widest text-neon italic">Description</h3>
                     <p className="text-sm text-gray-400 leading-relaxed">{tournament.description}</p>
                   </div>
                   <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
                     <h3 className="text-xs font-black uppercase tracking-widest text-neon italic">Terms & Conditions</h3>
                     <div className="bg-black/40 p-4 rounded-xl font-mono text-[11px] text-gray-400 whitespace-pre-wrap leading-relaxed">
                        {tournament.termsAndConditions}
                     </div>
                   </div>
                 </div>
               )}

               {activeTab === "SCHEDULE" && (
                 <div className="space-y-4">
                   {matches.length > 0 ? (
                     matches.sort((a,b) => a.scheduledAt?.seconds - b.scheduledAt?.seconds).map(match => (
                       <MatchItem 
                          key={match.id} 
                          match={match} 
                          isEO={profile?.uid === tournament.eoId} 
                          onShowDetails={() => setSelectedMatch(match)}
                       />
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
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">PENDAFTARAN</span>
              <p className="text-3xl font-display font-black text-white italic tracking-tighter">
                {tournament.registrationFee ? `Rp ${tournament.registrationFee.toLocaleString()}` : "Gratis"}
              </p>
            </div>
            
            <div className="space-y-2">
              <button 
                onClick={() => setShowRegModal(true)}
                className="w-full bg-neon text-black py-4 rounded-lg font-black text-xs uppercase tracking-[0.2em] hover:bg-neon/90 transition-all active:scale-95 shadow-lg shadow-neon/20 flex items-center justify-center gap-2 italic"
              >
                <Shield className="w-4 h-4" />
                Daftarkan Klub
              </button>
              
              <button 
                onClick={() => setShowTicketModal(true)}
                className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-lg font-black text-[10px] uppercase tracking-widest hover:border-neon transition-all italic flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-neon" />
                Beli Tiket Online
              </button>
            </div>

            <div className="flex items-center justify-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
               <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest italic tracking-tighter">Spot Terbatas</p>
            </div>
          </div>

          {profile?.uid === tournament.eoId && (
            <div className="glass p-6 rounded-2xl space-y-4 border border-neon/20 shadow-xl shadow-neon/5">
              <h3 className="text-xs font-black uppercase tracking-widest text-neon italic">Organizer Control</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Anda adalah penyelenggara turnamen ini.</p>
              <div className="grid grid-cols-1 gap-2">
                 <button className="w-full py-3 bg-neon text-black rounded-lg font-black text-[10px] uppercase tracking-widest">Generate Bracket</button>
                 <button 
                  onClick={() => navigate(`/tournaments/edit/${tournament.id}`)}
                  className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-white/10"
                >
                  Edit Tournament
                </button>
              </div>
            </div>
          )}

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

      <AnimatePresence>
        {selectedMatch && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
          >
             <motion.div 
               initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
               className="glass max-w-xl w-full p-2 rounded-[3.5rem] border border-white/10 relative overflow-hidden"
             >
                <div className="relative aspect-video rounded-[3rem] overflow-hidden mb-6 group">
                   <img 
                    src={selectedMatch.flyerUrl || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200"} 
                    className="w-full h-full object-cover grayscale opacity-60"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] to-transparent p-10 flex flex-col justify-end">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-black bg-neon text-black px-2 py-0.5 rounded italic">UPCOMING BATTLE</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedMatch.scheduledAt?.toDate().toLocaleDateString()}</span>
                      </div>
                      <h2 className="text-4xl font-display font-black uppercase text-white tracking-tighter">
                        {selectedMatch.homeTeamId} <span className="text-neon italic text-2xl mx-1">VS</span> {selectedMatch.awayTeamId}
                      </h2>
                   </div>
                </div>

                <div className="px-8 pb-8 space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="glass p-4 rounded-2xl border border-white/5 space-y-1">
                         <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Tiket Masuk (HTM)</span>
                         <p className="text-sm font-black text-white italic">
                            {selectedMatch.ticketPrice ? `Rp ${selectedMatch.ticketPrice.toLocaleString()}` : "Gratis / Walk-in"}
                         </p>
                      </div>
                      <div className="glass p-4 rounded-2xl border border-white/5 space-y-1">
                         <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Media Coverage</span>
                         <p className="text-sm font-black text-neon italic truncate">{selectedMatch.photographerInfo || "Default Photographer"}</p>
                      </div>
                   </div>

                   <div className="flex gap-4">
                      {selectedMatch.liveStreamUrl && (
                        <a 
                          href={selectedMatch.liveStreamUrl} 
                          target="_blank" 
                          className="flex-1 py-4 bg-red-600/10 border border-red-600/20 text-red-500 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-600/10"
                        >
                          <Zap className="w-4 h-4 fill-current" />
                          Watch Live Stream
                        </a>
                      )}
                      {!selectedMatch.liveStreamUrl && (
                         <div className="flex-1 py-4 bg-white/5 border border-white/10 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                            <Zap className="w-4 h-4 opacity-10" />
                            Live Stream Unavailable
                         </div>
                      )}
                   </div>

                   <button 
                    onClick={() => setSelectedMatch(null)}
                    className="w-full py-2 text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-colors"
                   >
                     Tutup Informasi
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}

        {showRegModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          >
             <motion.div 
               initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
               className="glass max-w-lg w-full p-8 rounded-[2.5rem] border border-white/10 relative"
             >
                <button onClick={() => setShowRegModal(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
                <h2 className="text-2xl font-display font-black uppercase italic tracking-tight mb-8">Daftar <span className="text-neon">Turnamen</span></h2>
                <form onSubmit={handlePublicRegister} className="space-y-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Nama Klub</label>
                      <input required type="text" value={regForm.clubName} onChange={(e) => setRegForm({...regForm, clubName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-neon outline-none" />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Nama Manager</label>
                      <input required type="text" value={regForm.managerName} onChange={(e) => setRegForm({...regForm, managerName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-neon outline-none" />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">WhatsApp (cth: 62812...)</label>
                      <input required type="tel" value={regForm.contactWhatsApp} onChange={(e) => setRegForm({...regForm, contactWhatsApp: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-neon outline-none" />
                   </div>
                   <div className="p-4 bg-neon/10 rounded-xl space-y-2 border border-neon/10">
                      <p className="text-[9px] font-black text-neon uppercase tracking-widest">PENTING</p>
                      <p className="text-[8px] text-gray-400 font-bold leading-relaxed uppercase">Dengan mendaftar, anda menyetujui seluruh Aturan & Ketentuan turnamen. Biaya pendaftaran sebesar Rp {tournament.registrationFee?.toLocaleString()} harus dilunasi setelah verifikasi EO.</p>
                   </div>
                   <button type="submit" disabled={registering} className="w-full bg-neon text-black py-4 rounded-xl font-black uppercase tracking-widest italic mt-4 hover:shadow-[0_0_20px_rgba(180,255,0,0.3)] transition-all">
                      {registering ? "Memproses..." : "Ajukan Pendaftaran"}
                   </button>
                </form>
             </motion.div>
          </motion.div>
        )}

        {showTicketModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
          >
             <motion.div 
               initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
               className="glass max-w-sm w-full p-8 rounded-[3rem] border border-white/5 relative flex flex-col items-center text-center space-y-6"
             >
                <button onClick={() => setShowTicketModal(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
                <div className="w-16 h-16 rounded-3xl bg-neon/10 flex items-center justify-center border border-neon/20">
                   <Zap className="w-8 h-8 text-neon" />
                </div>
                <div>
                   <h2 className="text-xl font-display font-black uppercase italic tracking-tighter">Beli Tiket <span className="text-neon">Online</span></h2>
                   <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-1">Stadion Mashud Wisnusaputra</p>
                </div>
                <div className="w-full bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-gray-500">Harga Tiket</span>
                      <span className="text-white italic">Rp 15.000</span>
                   </div>
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-gray-500">Service Fee</span>
                      <span className="text-white italic">Rp 1.000</span>
                   </div>
                   <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs font-black uppercase tracking-widest">
                      <span className="text-neon italic">Total Bayar</span>
                      <span className="text-white italic">Rp 16.000</span>
                   </div>
                </div>
                <button onClick={handleBuyTicket} className="w-full bg-neon text-black py-4 rounded-xl font-black uppercase tracking-widest italic hover:shadow-[0_0_20px_rgba(180,255,0,0.3)] transition-all">
                   Lanjutkan Pembayaran
                </button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MatchItem({ match, isEO, onShowDetails }: { match: Match, isEO?: boolean, onShowDetails: () => void }) {
  const isLive = match.status === "LIVE";
  return (
    <div 
      onClick={onShowDetails}
      className="glass rounded-2xl p-4 flex flex-col md:flex-row items-center gap-6 border border-white/5 hover:border-neon/30 transition-all group cursor-pointer relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-neon opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className={cn(
          "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter border",
          isLive ? "bg-red-500 text-white animate-pulse border-red-400" : "bg-black text-gray-500 border-white/10"
        )}>
          {isLive ? "LIVE NOW" : match.status}
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-neon uppercase tracking-widest italic">{match.scheduledAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">GROUP STAGE</span>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-between px-4 w-full">
        <div className="flex-1 flex items-center justify-end gap-4 text-right">
           <span className="text-xs md:text-sm font-black uppercase tracking-tighter truncate max-w-[120px]">{match.homeTeamId}</span>
           <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shadow-xl group-hover:scale-110 transition-transform">🛡️</div>
        </div>
        
        <div className="px-8 flex flex-col items-center">
           <div className={cn(
             "px-4 py-2 rounded-xl text-lg md:text-xl font-display font-black tabular-nums transition-all min-w-[80px] text-center border-2",
             isLive ? "bg-neon text-black border-neon" : "bg-black text-white border-white/5 shadow-2xl"
           )}>
             {match.homeScore} - {match.awayScore}
           </div>
        </div>

        <div className="flex-1 flex items-center justify-start gap-4 text-left">
           <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shadow-xl group-hover:scale-110 transition-transform">⚔️</div>
           <span className="text-xs md:text-sm font-black uppercase tracking-tighter truncate max-w-[120px]">{match.awayTeamId}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 md:flex items-center gap-2 w-full md:w-auto">
        {match.flyerUrl && <div className="p-2 bg-neon/10 rounded-lg text-neon"><Info className="w-4 h-4" /></div>}
        {match.liveStreamUrl && <div className="p-2 bg-red-600/10 rounded-lg text-red-500"><Zap className="w-4 h-4" /></div>}
        {isEO && (
          <Link 
            to={`/matches/${match.id}/manage`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 md:flex-none bg-white text-black text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-lg hover:bg-neon transition-all italic text-center"
          >
            Manage
          </Link>
        )}
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
