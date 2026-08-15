"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Bot, Loader2, CheckCircle2, ChevronRight, Activity, Database, Search, Cpu, FileText, Settings, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";

type PipelineStep = {
  id: string;
  label: string;
  icon: any;
};

const PIPELINE_STEPS: PipelineStep[] = [
  { id: "seed", label: "Loading Seed Sources", icon: Database },
  { id: "scrape", label: "Scraping Opportunities", icon: Search },
  { id: "extract", label: "Extracting Requirements", icon: FileText },
  { id: "eval", label: "Evaluating Opportunities", icon: Activity },
  { id: "match", label: "Matching User Profile", icon: Settings },
  { id: "recommend", label: "Generating Recommendations", icon: Cpu },
];

export default function ScoutPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"IDLE" | "PROCESSING" | "COMPLETE">("IDLE");
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "PROCESSING") {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  // Fake sub-step progression just to animate UI while waiting for actual backend
  useEffect(() => {
    if (status !== "PROCESSING") return;
    
    // We roughly estimate the backend takes ~15-20 seconds. 
    // We'll increment the visual step every 3 seconds up to step 4, 
    // and wait for the real HTTP response to finish the rest.
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < PIPELINE_STEPS.length - 2) {
          return prev + 1;
        }
        return prev;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [status]);

  const handleStartSphere = async () => {
    try {
      setStatus("PROCESSING");
      setCurrentStepIndex(0);
      setElapsedTime(0);
      
      const token = localStorage.getItem("scoutsphere_token");
      const res = await fetch("http://localhost:8000/scout/trigger", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        // Backend finished processing completely!
        setCurrentStepIndex(PIPELINE_STEPS.length);
        setStatus("COMPLETE");
      } else {
        alert("Failed to start sphere. Check backend logs.");
        setStatus("IDLE");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to backend.");
      setStatus("IDLE");
    }
  };

  return (
    <div className="p-8 h-full flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
      
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-cyber-cyan/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-cyber-cyan/20">
          <Bot className="w-8 h-8 text-cyber-cyan" />
        </div>
        <h1 className="text-4xl font-geist text-white mb-4">ScoutSphere</h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
          Feed your topic to the sphere. Our AI agents will research, synthesize, and deliver perfectly matched opportunities to your pipeline.
        </p>
      </div>

      <GlassCard className="w-full p-8 border border-white/10 relative overflow-hidden">
        
        {/* Background ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyber-cyan/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        {status === "IDLE" && (
          <div className="flex flex-col items-center justify-center py-12">
            <button
              onClick={handleStartSphere}
              className="flex items-center gap-3 px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              <Rocket className="w-5 h-5" />
              Initialize Scout Agents
            </button>
            <p className="text-gray-500 text-sm mt-6 font-technical">System Ready. Awaiting Command.</p>
          </div>
        )}

        {status !== "IDLE" && (
          <div className="w-full max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/20 text-cyber-cyan text-sm font-technical font-medium">
                {status === "PROCESSING" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    PROCESSING
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    COMPLETE
                  </>
                )}
              </div>
              <div className="text-gray-400 font-technical text-sm">
                Time Elapsed: <span className="text-white">{elapsedTime}s</span>
              </div>
            </div>

            <div className="space-y-6 relative">
              {/* Vertical connecting line */}
              <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-gray-800"></div>
              <div 
                className="absolute left-[23px] top-4 w-0.5 bg-cyber-cyan transition-all duration-1000 ease-in-out shadow-[0_0_8px_#06B6D4]"
                style={{ height: currentStepIndex >= 0 ? `${(Math.min(currentStepIndex, PIPELINE_STEPS.length - 1) / (PIPELINE_STEPS.length - 1)) * 100}%` : "0%" }}
              ></div>

              {PIPELINE_STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isComplete = idx < currentStepIndex || status === "COMPLETE";
                const isActive = idx === currentStepIndex && status === "PROCESSING";
                const isPending = idx > currentStepIndex;

                return (
                  <div key={step.id} className="relative z-10 flex items-center gap-6">
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                        isComplete ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan' : 
                        isActive ? 'bg-black border-cyber-cyan text-cyber-cyan shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 
                        'bg-[#151518] border-gray-800 text-gray-600'
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : isActive ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`text-lg font-medium transition-colors duration-500 ${
                        isComplete ? 'text-white' : 
                        isActive ? 'text-cyber-cyan' : 
                        'text-gray-600'
                      }`}>
                        {step.label}
                      </h3>
                      {isActive && (
                        <p className="text-sm text-gray-400 mt-1 font-technical animate-pulse">
                          Aggregating information streams...
                        </p>
                      )}
                    </div>
                    
                    {isComplete && (
                      <div className="text-xs font-technical text-cyber-cyan px-2 py-1 rounded bg-cyber-cyan/10 border border-cyber-cyan/20">
                        Done
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {status === "COMPLETE" && (
              <div className="mt-12 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <button
                  onClick={() => router.push("/opportunities")}
                  className="flex items-center gap-2 px-8 py-4 bg-[#06B6D4] text-black font-semibold rounded-xl hover:bg-[#06B6D4]/90 transition-all shadow-[0_0_20px_rgba(6,182,212,0.6)]"
                >
                  Browse New Opportunities
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
