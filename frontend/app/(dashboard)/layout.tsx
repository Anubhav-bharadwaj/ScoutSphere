import Link from "next/link";
import { Compass, User, Settings, CheckCircle } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#0A0A0B] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 bg-[#0F0F11] flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            ScoutSphere
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/opportunities" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/10 text-white font-medium border border-white/5 shadow-sm">
            <Compass className="w-5 h-5 text-blue-400" />
            Discovery
          </Link>
          <Link href="/matches" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <CheckCircle className="w-5 h-5" />
            My Matches
          </Link>
          <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <User className="w-5 h-5" />
            Profile
          </Link>
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative bg-[#0A0A0B]">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 p-8 max-w-5xl mx-auto min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
