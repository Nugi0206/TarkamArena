import React, { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { Sparing } from "../types";
import { MessageCircle, MapPin, Calendar, Plus, Search, Shield, Zap, X } from "lucide-react";
import { formatDate, cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

export default function SparingBoard() {
  const [requests, setRequests] = useState<Sparing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    clubName: "",
    venue: "",
    dateTime: "",
    region: "Cirebon",
    contactWhatsApp: ""
  });

  useEffect(() => {
    const q = query(collection(db, "sparing"), orderBy("dateTime", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Sparing[]);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "sparing");
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "sparing"), {
        ...formData,
        status: "OPEN",
        dateTime: new Date(formData.dateTime),
        createdAt: serverTimestamp()
      });
      setShowForm(false);
      setFormData({ clubName: "", venue: "", dateTime: "", region: "Cirebon", contactWhatsApp: "" });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "sparing");
    }
  };

  const handleUpdateStatus = async (id: string, status: "OPEN" | "FOUND") => {
    try {
      await updateDoc(doc(db, "sparing", id), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, "sparing");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-4xl font-display font-black uppercase tracking-tighter italic">Sparing <span className="text-neon">Echo</span></h1>
           <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-1">Find your next battlefield</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-neon text-black px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest italic flex items-center gap-2 hover:shadow-[0_0_20px_rgba(180,255,0,0.3)] transition-all"
        >
          <Plus className="w-4 h-4" />
          Cari Lawan Sparing
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 glass rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : requests.length > 0 ? (
              <div className="grid gap-4">
                {requests.map((req) => (
                  <motion.div 
                    layout
                    key={req.id}
                    className="glass p-6 rounded-3xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-neon/10 transition-all">
                          <Shield className="w-8 h-8 text-gray-600 group-hover:text-neon transition-colors" />
                       </div>
                       <div className="space-y-1">
                          <h3 className="text-xl font-display font-black uppercase tracking-tight italic">{req.clubName}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-gray-500">
                             <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
                                <MapPin className="w-3 h-3 text-neon" />
                                {req.venue} ({req.region})
                             </div>
                             <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
                                <Calendar className="w-3 h-3 text-neon" />
                                {new Date(req.dateTime.toDate()).toLocaleString()}
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-3">
                       <span className={cn(
                          "px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest border",
                          req.status === "OPEN" ? "bg-neon/10 border-neon/20 text-neon" : "bg-white/5 border-white/10 text-gray-600"
                       )}>
                          {req.status === "OPEN" ? "Mencari Lawan" : "Sudah Dapat Lawan"}
                       </span>
                       <a 
                         href={`https://wa.me/${req.contactWhatsApp}`}
                         target="_blank"
                         rel="noreferrer"
                         className="p-3 rounded-xl bg-white/5 hover:bg-neon hover:text-black transition-all text-white border border-white/10"
                       >
                          <MessageCircle className="w-5 h-5" />
                       </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="glass p-20 rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-4">
                 <Zap className="w-12 h-12 text-gray-800" />
                 <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest italic">Belum ada permintaan sparing aktif hari ini.</p>
              </div>
            )}
         </div>

         <div className="space-y-6">
            <div className="glass p-8 rounded-3xl border border-white/5 space-y-4">
               <h3 className="text-[11px] font-black uppercase tracking-widest text-neon italic">Sparing Rules</h3>
               <ul className="space-y-3">
                  {["Fair play di atas segalanya.", "Biaya sewa lapangan dibagi rata (biasanya).", "Hubungi pengunggah via WA untuk verifikasi.", "Hargai jadwal dan waktu kick-off."].map((rule, i) => (
                    <li key={i} className="flex gap-2 text-[10px] text-gray-400 font-bold leading-relaxed">
                       <span className="text-neon">•</span>
                       {rule}
                    </li>
                  ))}
               </ul>
            </div>
         </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass max-w-lg w-full p-8 rounded-[2.5rem] border border-white/10 relative"
            >
              <button 
                onClick={() => setShowForm(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              <h2 className="text-2xl font-display font-black uppercase italic tracking-tight mb-8">Post <span className="text-neon">Sparing</span> Request</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Nama Klub</label>
                  <input 
                    required
                    type="text"
                    value={formData.clubName}
                    onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-neon/50 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Wilayah</label>
                    <select 
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-neon/50 outline-none transition-all"
                    >
                       <option value="Cirebon">Cirebon</option>
                       <option value="Indramayu">Indramayu</option>
                       <option value="Majalengka">Majalengka</option>
                       <option value="Kuningan">Kuningan</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">WA Contact</label>
                    <input 
                      required
                      type="tel"
                      placeholder="62812..."
                      value={formData.contactWhatsApp}
                      onChange={(e) => setFormData({ ...formData, contactWhatsApp: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-neon/50 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Venue / Lapangan</label>
                  <input 
                    required
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-neon/50 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Jadwal (Tanggal & Jam)</label>
                  <input 
                    required
                    type="datetime-local"
                    value={formData.dateTime}
                    onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-neon/50 outline-none transition-all"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-neon text-black py-4 rounded-xl font-black uppercase tracking-widest italic mt-4 hover:shadow-[0_0_20px_rgba(180,255,0,0.3)] transition-all"
                >
                  Broadcast Sparing Request
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
