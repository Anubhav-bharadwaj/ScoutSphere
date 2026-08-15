"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Calendar, Briefcase, ChevronRight, CheckCircle2, FileText, X, Building2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

// The data structure based on the API response
type Opportunity = {
  id: string;
  title: string;
  description: string;
  source_url: string;
  deadline: string | null;
  requirements: Record<string, string> | null;
};

type MatchData = {
  id: string;
  score: number;
  reason: string;
  strong_areas?: string[];
  missing_skills?: string[];
  opportunity: Opportunity;
};

export default function MatchCard({ match }: { match: MatchData }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailoredResume, setTailoredResume] = useState<string | null>(null);
  const [isFetchingIntel, setIsFetchingIntel] = useState(false);
  const [intel, setIntel] = useState<any | null>(null);
  const router = useRouter();
  
  const opp = match.opportunity;
  const scorePercent = Math.round(match.score * 100);
  
  // Dynamic chart data using actual missing score part
  const chartData = [
    { name: 'Match', value: scorePercent, color: scorePercent >= 80 ? '#10B981' : scorePercent >= 60 ? '#F59E0B' : '#EF4444' },
    { name: 'Missing', value: 100 - scorePercent, color: '#1F2937' }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-rose-400";
  };

  const handleApply = async () => {
    try {
      setIsApplying(true);
      const token = localStorage.getItem("scoutsphere_token");
      const res = await fetch(`http://localhost:8000/applications/auto-fill/${opp.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/applications/co-pilot/${data.id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsApplying(false);
    }
  };

  const handleTailorResume = async () => {
    try {
      setIsTailoring(true);
      const token = localStorage.getItem("scoutsphere_token");
      const res = await fetch(`http://localhost:8000/opportunities/${opp.id}/tailor-resume`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTailoredResume(data.markdown);
      } else {
        alert("Failed to tailor resume. Please make sure you have uploaded a resume in your Profile.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTailoring(false);
    }
  };

  const handleFetchIntel = async () => {
    try {
      setIsFetchingIntel(true);
      const token = localStorage.getItem("scoutsphere_token");
      const res = await fetch(`http://localhost:8000/opportunities/${opp.id}/intel`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIntel(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingIntel(false);
    }
  };

  return (
    <div className="bg-[#151518] border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-white/20 hover:shadow-blue-500/10">
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          
          {/* Main Info */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-gray-300 tracking-wide uppercase">
                  Opportunity
                </span>
                {scorePercent >= 80 && (
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-medium text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Top Match
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{opp.title}</h2>
              <p className="text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                {opp.description || "No description provided."}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              {opp.deadline && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  {new Date(opp.deadline).toLocaleDateString()}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-500" />
                {Object.keys(opp.requirements || {}).length > 0 ? "Specific Requirements" : "General Apply"}
              </div>
            </div>
            
            <div className="pt-2 flex flex-wrap gap-3">
              <button 
                onClick={handleApply}
                disabled={isApplying || isTailoring || isFetchingIntel}
                className="inline-flex items-center justify-center bg-white text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] disabled:opacity-50"
              >
                {isApplying ? "Starting Co-Pilot..." : "Auto-Fill Application"}
              </button>
              <button 
                onClick={handleTailorResume}
                disabled={isApplying || isTailoring || isFetchingIntel}
                className="inline-flex items-center justify-center gap-2 bg-transparent border border-white/20 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                {isTailoring ? "Tailoring..." : "Tailor Resume"}
              </button>
              <button 
                onClick={handleFetchIntel}
                disabled={isApplying || isTailoring || isFetchingIntel}
                className="inline-flex items-center justify-center gap-2 bg-transparent border border-white/20 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                <Building2 className="w-4 h-4" />
                {isFetchingIntel ? "Fetching Intel..." : "Company Intel"}
              </button>
            </div>
          </div>

          {/* AI Match Score Side */}
          <div className="w-full md:w-64 flex flex-col items-center justify-center p-6 bg-black/20 rounded-xl border border-white/5">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className={`text-3xl font-bold tracking-tighter ${getScoreColor(scorePercent)}`}>
                  {scorePercent}
                </span>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-300 mt-4 tracking-wide uppercase">AI Match Score</p>
          </div>

        </div>

        {/* AI Justification Section */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <span className="text-blue-400 font-bold font-mono text-sm">AI</span>
              </div>
              <span className="font-medium text-gray-300 group-hover:text-white transition-colors">
                Why this is a match for you
              </span>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
          
          <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                <p className="text-gray-300 leading-relaxed text-sm">
                  {match.reason || "We determined this is a strong match based on your skills and preferences."}
                </p>
                {match.strong_areas && match.strong_areas.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <h4 className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-3">Strong Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {match.strong_areas.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-medium text-emerald-400">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {match.missing_skills && match.missing_skills.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <h4 className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-3">Missing Skills to Improve</h4>
                    <div className="flex flex-wrap gap-2">
                      {match.missing_skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-xs font-medium text-rose-400">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {!match.strong_areas && opp.requirements && Object.keys(opp.requirements).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Key Requirements</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(opp.requirements).slice(0, 4).map(([key, value]) => (
                        <li key={key} className="flex items-start gap-2 text-sm text-gray-400">
                          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1"><strong className="text-gray-300">{key}:</strong> {value as string}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tailored Resume Modal */}
      {tailoredResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#151518] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Tailored Resume
              </h2>
              <button 
                onClick={() => setTailoredResume(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 prose prose-invert max-w-none">
              <ReactMarkdown>{tailoredResume}</ReactMarkdown>
            </div>
            
            <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-black/20">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(tailoredResume);
                  alert("Copied to clipboard!");
                }}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-medium hover:bg-white/10 transition-colors"
              >
                Copy
              </button>
              <button 
                onClick={() => setTailoredResume(null)}
                className="px-4 py-2 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Company Intel Modal */}
      {intel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#151518] border border-white/10 rounded-2xl w-full max-w-3xl flex flex-col shadow-2xl max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                Company Intelligence Dossier
              </h2>
              <button 
                onClick={() => setIntel(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Company Overview</h3>
                <p className="text-gray-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">{intel.overview}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Estimated Culture</h3>
                <p className="text-gray-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">{intel.culture}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Salary Insights</h3>
                <p className="text-emerald-400 font-medium bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">{intel.salary_insights}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Simulated Recent News</h3>
                <ul className="space-y-3">
                  {intel.recent_news.map((news: string, idx: number) => (
                    <li key={idx} className="flex gap-3 text-gray-300 bg-white/5 p-4 rounded-xl border border-white/5">
                      <ChevronRight className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <span>{news}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="p-6 border-t border-white/5 flex justify-end bg-black/20">
              <button 
                onClick={() => setIntel(null)}
                className="px-6 py-2 bg-purple-600 rounded-lg text-white font-medium hover:bg-purple-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
