import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Trophy, Users, Shield, Home, User, Zap, MessageCircle } from "lucide-react";
import { cn } from "../lib/utils";

export default function MobileNav() {
  const location = useLocation();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Arena", href: "/tournaments", icon: Trophy },
    { label: "Sparing", href: "/sparing", icon: Zap },
    { label: "Bantuan", href: "https://wa.me/628993358221", icon: MessageCircle, external: true },
    { label: "Pro", href: "/profile", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-xl border-t border-white/10 px-6 h-16 flex items-center justify-between pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        if (item.external) {
          return (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-1 group"
            >
              <div className="text-gray-600 transition-all group-active:scale-90 group-hover:text-neon">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[8px] font-black uppercase tracking-tighter text-gray-600 transition-colors group-hover:text-neon">
                {item.label}
              </span>
            </a>
          );
        }
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
