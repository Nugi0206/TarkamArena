import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Trophy, Users, Shield, Home, User } from "lucide-react";
import { cn } from "../lib/utils";

export default function MobileNav() {
  const location = useLocation();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Tournaments", href: "/tournaments", icon: Trophy },
    { label: "Clubs", href: "/clubs", icon: Shield },
    { label: "Players", href: "/players", icon: Users },
    { label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-xl border-t border-white/10 px-6 h-16 flex items-center justify-between pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            className="flex flex-col items-center gap-1 group"
          >
            <div className={cn(
              "transition-all group-active:scale-90",
              isActive ? "text-neon" : "text-gray-600"
            )}>
              <Icon className="w-5 h-5" />
            </div>
            <span className={cn(
              "text-[8px] font-black uppercase tracking-tighter transition-colors",
              isActive ? "text-neon" : "text-gray-600"
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
