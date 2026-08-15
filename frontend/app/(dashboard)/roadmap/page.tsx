"use client";

import { useState } from "react";
import { Map, Rocket, Sparkles, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import ReactMarkdown from 'react-markdown';

export default function RoadmapPage() {
  const [targetRole, setTargetRole] = useState("");
  const [roadmap, setRoadmap] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim()) return;

    try {
      setIsGenerating(true);
      setError(null);
      const token = localStorage.getItem("scoutsphere_token");
      const res = await fetch("http://localhost:8000/roadmap/generate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ target_role: targetRole })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to generate roadmap.");
      }
      
      const data = await res.json();
      setRoadmap(data.markdown);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          Career Roadmap <Map className="text-blue-400 w-8 h-8" />
        </h1>
        <p className="text-gray-400 mt-2">
          Tell us where you want to go. We'll analyze your current resume and build a step-by-step path to get there.
        </p>
      </div>

      <GlassCard className="p-8 border border-white/5">
        <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">Target Role</label>
            <input
              id="role"
              type="text"
              placeholder="e.g. Senior Machine Learning Engineer"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              disabled={isGenerating}
            />
          </div>
          <button
            type="submit"
            disabled={isGenerating || !targetRole.trim()}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl transition-colors shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-5 h-5 animate-pulse" />
                Generating Path...
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5" />
                Generate Roadmap
              </>
            )}
          </button>
        </form>
        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}
      </GlassCard>

      {roadmap && (
        <GlassCard className="p-8 border border-white/5">
          <div className="prose prose-invert prose-blue max-w-none prose-h2:text-white prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2 prose-h3:text-gray-200">
            <ReactMarkdown>{roadmap}</ReactMarkdown>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
