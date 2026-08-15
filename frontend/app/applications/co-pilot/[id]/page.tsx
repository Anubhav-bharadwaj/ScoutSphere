"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";

interface Application {
  id: string;
  opportunity_id: string;
  workflow_state: string;
  form_payload: {
    first_name?: string;
    last_name?: string;
    email?: string;
    questionnaire_answer?: string;
  };
  opportunity: {
    title: string;
    company: string;
  };
}

export default function CoPilotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [appData, setAppData] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(true);
  const [refining, setRefining] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [questionAnswer, setQuestionAnswer] = useState("");

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem("scoutsphere_token");
      const res = await fetch(`http://localhost:8000/applications/${id}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAppData(data);
        
        if (data.workflow_state === "USER_REVIEW" || data.workflow_state === "SUBMITTED") {
          setPolling(false);
          setFirstName(data.form_payload?.first_name || "");
          setLastName(data.form_payload?.last_name || "");
          setEmail(data.form_payload?.email || "");
          setQuestionAnswer(data.form_payload?.questionnaire_answer || "");
        }
      }
    } catch (err) {
      console.error("Failed to fetch application status", err);
    } finally {
      setLoading(false);
    }
  };

  // Polling Effect
  useEffect(() => {
    fetchStatus();
    
    let interval: NodeJS.Timeout;
    if (polling) {
      interval = setInterval(fetchStatus, 2000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [polling, id]);

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("scoutsphere_token");
      const res = await fetch(`http://localhost:8000/applications/${id}/submit`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        router.push("/applications");
      }
    } catch (err) {
      console.error("Failed to submit", err);
    }
  };

  const handleRefine = async (instruction: string) => {
    try {
      setRefining(true);
      const token = localStorage.getItem("scoutsphere_token");
      const res = await fetch(`http://localhost:8000/applications/${id}/refine`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ instruction })
      });
      
      if (res.ok) {
        const data = await res.json();
        setAppData(data);
        setQuestionAnswer(data.form_payload?.questionnaire_answer || "");
      }
    } catch (err) {
      console.error("Failed to refine", err);
    } finally {
      setRefining(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-bg-base flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-cyber-cyan border-t-transparent animate-spin"></div>
          <p className="text-cyber-cyan font-technical tracking-widest text-sm">INITIALIZING CO-PILOT...</p>
        </div>
      </div>
    );
  }

  if (!appData) return null;

  if (appData.workflow_state === "READY_TO_APPLY" || appData.workflow_state === "FORM_FILLING") {
    return (
      <div className="h-screen bg-bg-base flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-low border border-cyber-cyan/30 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-cyber-cyan/10 animate-pulse"></div>
            <span className="text-2xl relative z-10">🤖</span>
          </div>
          
          <div>
            <h2 className="text-xl font-geist text-white mb-2">Agent is drafting your application</h2>
            <p className="text-gray-400 text-sm">
              The Form-Filler agent is analyzing your profile and mapping answers to the application for <span className="text-white">{appData.opportunity.company}</span>.
            </p>
          </div>
          
          <div className="w-full h-1 bg-surface-low rounded-full overflow-hidden">
            <div className="h-full bg-cyber-cyan w-1/2 animate-[pulse_2s_ease-in-out_infinite] rounded-full shadow-[0_0_8px_#06B6D4]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-bg-base flex overflow-hidden">
      {/* Left Panel: Simulated Target Form (55%) */}
      <div className="w-[55%] h-full flex flex-col bg-white overflow-hidden relative shadow-2xl z-10">
        {/* Browser Header Bar */}
        <div className="h-12 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-4 shrink-0">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="flex-1 bg-white border border-gray-200 rounded px-3 py-1 text-xs text-gray-500 font-sans flex items-center justify-center">
            🔒 https://careers.{appData.opportunity.company.toLowerCase().replace(/\s+/g, '')}.com/apply
          </div>
        </div>
        
        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-8 font-sans text-black">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 pb-4 border-b border-gray-200">
              <h1 className="text-3xl font-bold text-gray-900">{appData.opportunity.title}</h1>
              <p className="text-gray-600 mt-2">{appData.opportunity.company} • Remote</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input 
                      type="text" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-blue-50/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input 
                      type="text" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-blue-50/30"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-blue-50/30"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pt-4 border-t border-gray-100">Questionnaire</h2>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-900">
                      Why do you want to work at {appData.opportunity.company}? *
                    </label>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                      <span>✨</span> AI Drafted
                    </div>
                  </div>
                  <textarea 
                    rows={6} 
                    value={questionAnswer}
                    onChange={(e) => setQuestionAnswer(e.target.value)}
                    className="w-full p-3 border border-electric-violet/50 rounded focus:ring-2 focus:ring-electric-violet/50 outline-none bg-electric-violet/5 shadow-[0_0_10px_rgba(139,92,246,0.1)] transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Form Action Bar */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center shrink-0">
          <p className="text-xs text-gray-500 font-sans">Powered by ScoutSphere AI</p>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors">
              Save Draft
            </button>
            <button 
              disabled
              className="px-4 py-2 bg-gray-300 text-white font-medium text-sm rounded cursor-not-allowed"
            >
              Submit Application
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel: AI Co-Pilot Drawer (45%) */}
      <div className="w-[45%] h-full bg-bg-base border-l border-white/10 flex flex-col relative z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="h-16 px-6 border-b border-white/10 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-electric-violet/20 flex items-center justify-center border border-electric-violet/30">
              <span className="text-electric-violet text-lg">✨</span>
            </div>
            <div>
              <h2 className="text-white font-geist font-medium">AI Co-Pilot</h2>
              <p className="text-xs text-electric-violet font-technical uppercase tracking-wider">Human Review Required</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-low border border-white/10">
            <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]"></div>
            <span className="text-xs text-gray-300 font-technical">Connected</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div className="bg-surface-low border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-amber-500">⚠️</span>
              <h3 className="text-white font-medium text-sm">Action Required</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              I've successfully mapped your profile data to the target form fields. Please review my drafted response for the free-text questionnaire to ensure it accurately reflects your background.
            </p>
          </div>

          <div className="bg-[#0F172A] border border-cyber-cyan/30 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.05)]">
            <div className="bg-cyber-cyan/10 px-4 py-2 border-b border-cyber-cyan/20 flex items-center gap-2">
              <span className="text-xs text-cyber-cyan font-technical uppercase tracking-widest">Questionnaire Draft</span>
            </div>
            <div className="p-4">
              <p className="text-gray-300 text-sm leading-relaxed italic border-l-2 border-cyber-cyan/50 pl-3">
                "{appData.form_payload?.questionnaire_answer}"
              </p>
              
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-end gap-2">
                <button 
                  onClick={() => handleRefine("Make the tone more professional and confident.")}
                  disabled={refining}
                  className="px-3 py-1.5 rounded bg-surface-low border border-white/10 text-gray-300 text-xs font-medium hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  {refining ? "Refining..." : "Refine Tone"}
                </button>
                <button 
                  onClick={() => handleRefine("Make it much shorter, max 2 sentences.")}
                  disabled={refining}
                  className="px-3 py-1.5 rounded bg-surface-low border border-white/10 text-gray-300 text-xs font-medium hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  {refining ? "Refining..." : "Make it shorter"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Submission Area */}
        <div className="p-6 bg-surface-low border-t border-white/10 shrink-0">
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <input type="checkbox" id="review-confirm" className="mt-1" defaultChecked />
              <label htmlFor="review-confirm" className="text-sm text-gray-400 leading-tight">
                I have reviewed all AI-populated fields and confirm they are accurate. I authorize ScoutSphere to submit this application on my behalf.
              </label>
            </div>
            
            <Button 
              onClick={handleSubmit}
              className="w-full flex justify-center items-center py-3 bg-electric-violet hover:bg-[#7c4df2] text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]"
            >
              Confirm & Submit Application
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
