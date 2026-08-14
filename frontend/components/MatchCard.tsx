"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Calendar, Briefcase, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

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
  opportunity: Opportunity;
};

export default function MatchCard({ match }: { match: MatchData }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const opp = match.opportunity;
  const scorePercent = Math.round(match.score * 100);
  
  // Fake chart data for MVP display of score breakdown (Skills 40, Eligibility 25, Location 15, Exp 10, Deadline 10)
  // In a real scenario, the backend would return the individual component scores.
  const chartData = [
    { name: 'Skills', value: 40 * match.score, color: '#3B82F6' },
    { name: 'Eligibility', value: 25 * match.score, color: '#8B5CF6' },
    { name: 'Location', value: 15 * match.score, color: '#10B981' },
    { name: 'Experience', value: 10 * match.score, color: '#F59E0B' },
    { name: 'Deadline', value: 10 * match.score, color: '#EF4444' },
    { name: 'Missing', value: 100 - scorePercent, color: '#1F2937' } // The missing score part
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-rose-400";
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
            
            <div className="pt-2">
              <a 
                href={match.opportunity.source_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-white text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
              >
                Apply Now
              </a>
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
                {opp.requirements && Object.keys(opp.requirements).length > 0 && (
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
    </div>
  );
}
