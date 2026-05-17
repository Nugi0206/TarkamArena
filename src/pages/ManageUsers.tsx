import React, { useState, useEffect } from "react";
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { UserProfile } from "../types";
import { User, Shield, Trophy, Users, Trash2, CheckCircle, XCircle, Search, UserPlus, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";

export default function ManageUsers() {
  const { profile, user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "PLAYER",
    region: "Cirebon"
  });

  useEffect(() => {
    const isBootstrapAdmin = profile?.email === 'muhamadnugiandri@gmail.com';
    if (profile?.role !== "ADMIN" && !isBootstrapAdmin) return;

    const q = query(collection(db, "users"));
    const unsub = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ ...doc.data() })) as UserProfile[]);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "users");
    });

    return () => unsub();
  }, [profile]);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsCreating(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify(newUser)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create user");
      }

      setIsAddModalOpen(false);
      setNewUser({ fullName: "", email: "", password: "", role: "PLAYER", region: "Cirebon" });
      alert("User created successfully!");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isBootstrapAdmin = profile?.email === 'muhamadnugiandri@gmail.com';
  if (profile?.role !== "ADMIN" && !isBootstrapAdmin) return <div className="text-center py-20 font-black uppercase text-gray-700">Access Denied</div>;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-black uppercase italic tracking-tighter">Manajemen <span className="text-neon">User</span></h1>
          <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-[10px] mt-1 italic">Authorized Personnel Only</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-neon text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:shadow-[0_0_20px_rgba(180,255,0,0.3)] transition-all italic"
          >
            <UserPlus className="w-4 h-4" />
            Tambah User
          </button>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
            <input 
              type="text" 
              placeholder="Search Full Name / Email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-6 text-sm focus:border-neon outline-none w-full md:w-64"
            />
          </div>
        </div>
      </div>

      <div className="glass overflow-hidden rounded-[2rem] border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-600">User</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-600">Role</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-600">Region</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map(u => (
                <tr key={u.uid} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center border border-white/10">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-tight text-white">{u.fullName}</p>
                        <p className="text-[9px] text-gray-500 font-medium">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={u.role}
                      onChange={(e) => handleUpdateRole(u.uid, e.target.value)}
                      className="bg-black border border-white/10 rounded-lg py-1 px-3 text-[10px] font-black uppercase tracking-widest text-neon outline-none focus:border-neon"
                    >
                      <option value="VIEWER">VIEWER</option>
                      <option value="PLAYER">PLAYER</option>
                      <option value="EO">EO</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="CLUB_ADMIN">CLUB ADMIN</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{u.region}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 text-gray-700 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass max-w-md w-full p-8 rounded-[2.5rem] border border-white/10 relative"
            >
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <h3 className="text-xl font-display font-black uppercase italic tracking-tighter">Tambah <span className="text-neon">User Baru</span></h3>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Sistem Registrasi Admin</p>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Nama Lengkap</label>
                  <input 
                    required
                    type="text" 
                    value={newUser.fullName}
                    onChange={e => setNewUser({...newUser, fullName: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-neon outline-none"
                    placeholder="Nama User..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Email</label>
                    <input 
                      required
                      type="email" 
                      value={newUser.email}
                      onChange={e => setNewUser({...newUser, email: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-neon outline-none"
                      placeholder="user@example.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Password</label>
                    <input 
                      required
                      type="password" 
                      value={newUser.password}
                      onChange={e => setNewUser({...newUser, password: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-neon outline-none"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Role</label>
                    <select 
                      value={newUser.role}
                      onChange={e => setNewUser({...newUser, role: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-neon outline-none"
                    >
                      <option value="VIEWER">VIEWER</option>
                      <option value="PLAYER">PLAYER</option>
                      <option value="CLUB_ADMIN">CLUB ADMIN</option>
                      <option value="EO">EO</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Regional</label>
                    <select 
                      value={newUser.region}
                      onChange={e => setNewUser({...newUser, region: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-neon outline-none"
                    >
                      <option value="Cirebon">Cirebon</option>
                      <option value="Indramayu">Indramayu</option>
                      <option value="Majalengka">Majalengka</option>
                      <option value="Kuningan">Kuningan</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isCreating}
                  className="w-full bg-neon text-black py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:shadow-[0_0_20px_rgba(180,255,0,0.4)] transition-all disabled:opacity-50 mt-4 italic"
                >
                  {isCreating ? "Mendaftarkan..." : "Daftarkan User Baru"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
