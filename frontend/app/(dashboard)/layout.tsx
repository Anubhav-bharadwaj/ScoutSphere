import { Compass, User, Settings, CheckCircle, Briefcase } from "lucide-react";
import SidebarNav from "@/components/SidebarNav";

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
        
        <SidebarNav />
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
