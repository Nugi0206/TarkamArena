import React, { useState, useEffect } from "react";
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { UserProfile } from "../types";
import { User, Shield, Trophy, Users, Trash2, CheckCircle, XCircle, Search } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function ManageUsers() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
          <input 
            type="text" 
            placeholder="Search Full Name / Email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-6 text-sm focus:border-neon outline-none w-full md:w-80"
          />
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
    </div>
  );
}
