"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, User, Settings, CheckCircle, Briefcase, BarChart3, Map, Bot } from "lucide-react";

export default function SidebarNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Discovery", href: "/opportunities", icon: Compass },
    { name: "My Matches", href: "/matches", icon: CheckCircle },
    { name: "My Applications", href: "/applications", icon: Briefcase },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Career Roadmap", href: "/roadmap", icon: Map },
    { name: "Run Agent", href: "/scout", icon: Bot },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? "bg-white/10 text-white font-medium border border-white/5 shadow-sm" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-blue-400" : ""}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <Link 
          href="/settings" 
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            pathname === "/settings"
              ? "bg-white/10 text-white font-medium border border-white/5 shadow-sm" 
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Settings className={`w-5 h-5 ${pathname === "/settings" ? "text-blue-400" : ""}`} />
          Settings
        </Link>
      </div>
    </>
  );
}
