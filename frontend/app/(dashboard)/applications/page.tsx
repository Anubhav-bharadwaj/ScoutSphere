"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/GlassCard";

interface Application {
  id: string;
  opportunity_id: string;
  workflow_state: string;
  kanban_stage: string;
  next_action_note: string | null;
  opportunity: {
    title: string;
    company: string;
  };
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("scoutsphere_token");
        const res = await fetch("http://localhost:8000/applications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setApplications(data);
        }
      } catch (err) {
        console.error("Failed to fetch applications", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const saved = applications.filter((app) => app.kanban_stage === "SAVED");
  const applying = applications.filter((app) => app.kanban_stage === "APPLYING");
  const applied = applications.filter((app) => app.kanban_stage === "APPLIED");
  const interviewing = applications.filter((app) => app.kanban_stage === "INTERVIEWING");
  const offer = applications.filter((app) => app.kanban_stage === "OFFER");
  const rejected = applications.filter((app) => app.kanban_stage === "REJECTED");

  const renderKanbanColumn = (title: string, apps: Application[], count: number, dotColor: string = "bg-cyber-cyan shadow-[0_0_8px_#06B6D4]") => (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-2">
        <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
        <h3 className="text-sm font-technical text-gray-300 tracking-wider uppercase">
          {title} <span className="text-gray-500">({count})</span>
        </h3>
      </div>
      
      {apps.length === 0 ? (
        <div className="border border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-white/[0.02]">
          <p className="text-gray-500 text-sm">No applications</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {apps.map((app) => (
            <GlassCard key={app.id} className="p-5 flex flex-col gap-3 hover:border-cyber-cyan/30 transition-colors cursor-pointer w-full">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-geist text-white font-medium line-clamp-1">{app.opportunity.title}</h4>
                  <p className="text-gray-400 text-sm mt-1">{app.opportunity.company}</p>
                </div>
                <div className="px-2.5 py-1 rounded bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan text-xs font-technical flex items-center gap-1.5 shrink-0">
                  <span>✨</span>
                  <span>Match</span>
                </div>
              </div>
              
              {app.next_action_note && (
                <div className="mt-2 bg-electric-violet/10 border border-electric-violet/20 rounded p-3 h-full">
                  <p className="text-xs text-electric-violet font-technical uppercase mb-1">Next Action:</p>
                  <p className="text-sm text-gray-300 line-clamp-2">{app.next_action_note}</p>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-8 h-full flex flex-col overflow-hidden">
      <div className="mb-8 flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-3xl font-geist text-white mb-2">My Applications</h1>
          <p className="text-gray-400 text-sm">Track and manage your active opportunities.</p>
        </div>
        <div className="px-4 py-2 bg-surface-low border border-white/10 rounded text-sm text-gray-400 font-technical flex items-center gap-3">
          <span>Ask AI to filter...</span>
          <span className="px-2 py-0.5 bg-black/40 rounded text-xs text-gray-500">Cmd+K</span>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-cyber-cyan border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-10 overflow-y-auto pr-4 custom-scrollbar">
          {renderKanbanColumn("Saved", saved, saved.length, "bg-gray-400 shadow-[0_0_8px_#9CA3AF]")}
          {renderKanbanColumn("Applying", applying, applying.length, "bg-yellow-400 shadow-[0_0_8px_#FACC15]")}
          {renderKanbanColumn("Applied", applied, applied.length, "bg-blue-400 shadow-[0_0_8px_#60A5FA]")}
          {renderKanbanColumn("Interview", interviewing, interviewing.length, "bg-purple-400 shadow-[0_0_8px_#C084FC]")}
          {renderKanbanColumn("Offer Letter", offer, offer.length, "bg-green-400 shadow-[0_0_8px_#4ADE80]")}
          {renderKanbanColumn("Rejected", rejected, rejected.length, "bg-red-400 shadow-[0_0_8px_#F87171]")}
        </div>
      )}
    </div>
  );
}
