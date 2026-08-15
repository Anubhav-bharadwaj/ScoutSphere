"use client";

import { User, FileSearch, X, CheckCircle2, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { useState } from "react";

type ATSAnalysis = {
  score: number;
  feedback: string;
  improvements: string[];
};

export default function ProfilePage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      const token = localStorage.getItem("scoutsphere_token");
      const res = await fetch("http://localhost:8000/users/me/resume-analysis", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
      } else {
        alert("Failed to analyze resume. Please ensure you have uploaded a resume.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          My Profile <User className="text-blue-400 w-8 h-8" />
        </h1>
        <p className="text-gray-400 mt-2">
          Manage your personal data, resume, and preferences.
        </p>
      </div>
      
      <GlassCard className="p-8 border border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-white">Profile Overview</h2>
            <div className="space-y-4 text-gray-300">
              <p><strong>Email:</strong> test_new@example.com</p>
              <p><strong>Role:</strong> Applicant</p>
              <p><strong>Resume Status:</strong> Synced with Vector Store</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-xl border border-white/10 max-w-sm">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 border border-blue-500/30">
              <FileSearch className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-white font-medium mb-2 text-center">Resume & ATS Analysis</h3>
            <p className="text-gray-400 text-sm text-center mb-4">
              Get an instant AI-powered ATS compatibility score and actionable improvement suggestions.
            </p>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Analysis Modal */}
      {analysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#151518] border border-white/10 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileSearch className="w-5 h-5 text-blue-400" />
                ATS Analysis Results
              </h2>
              <button 
                onClick={() => setAnalysis(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="flex items-center justify-center mb-8">
                <div className="relative w-40 h-40 flex items-center justify-center rounded-full border-8 border-white/5">
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle 
                      cx="50%" cy="50%" r="46%" 
                      fill="transparent" stroke={analysis.score >= 80 ? "#10B981" : analysis.score >= 60 ? "#F59E0B" : "#EF4444"} 
                      strokeWidth="8%" 
                      strokeDasharray={`${(analysis.score / 100) * 289}% 289%`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="text-center">
                    <span className="text-4xl font-bold text-white">{analysis.score}</span>
                    <span className="text-sm block text-gray-400">/ 100</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Overall Feedback</h3>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-gray-300 leading-relaxed">{analysis.feedback}</p>
                  </div>
                </div>

                {analysis.improvements && analysis.improvements.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Suggested Improvements</h3>
                    <ul className="space-y-3">
                      {analysis.improvements.map((imp, idx) => (
                        <li key={idx} className="flex gap-3 text-gray-300 bg-rose-500/5 p-4 rounded-xl border border-rose-500/10">
                          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-white/5 flex justify-end bg-black/20">
              <button 
                onClick={() => setAnalysis(null)}
                className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
