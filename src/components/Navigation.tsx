import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Trophy, Users, Shield, MapPin, User, Search, Home } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";

export default function Navigation() {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Tournaments", href: "/tournaments", icon: Trophy },
    { label: "Clubs", href: "/clubs", icon: Shield },
    { label: "Players", href: "/players", icon: Users },
  ];

  return (
    <nav className="hidden md:flex border-b border-white/10 bg-[#0A0A0B] sticky top-0 z-50 h-16">
      <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2 group">
            <h1 className="text-2xl font-black tracking-tighter text-neon">
              TARKAM<span className="text-white">ARENA</span>
            </h1>
          </Link>

          <div className="flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "text-xs font-bold uppercase tracking-widest transition-colors hover:text-neon",
                    isActive ? "text-neon" : "text-gray-400"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="bg-white/5 px-4 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-2 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> 
            124 LIVE MATCHES
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Search className="w-4 h-4" />
            </button>
            
            {user ? (
              <Link to="/profile" className="flex items-center gap-2 bg-neon/10 border border-neon/30 rounded-full px-3 py-1 hover:bg-neon/20 transition-colors">
                <div className="w-6 h-6 bg-neon rounded-full flex items-center justify-center text-[10px] font-black text-black">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter text-neon">Profile</span>
              </Link>
            ) : (
              <Link to="/login" className="bg-neon text-black px-5 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-neon/90 transition-all active:scale-95">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
