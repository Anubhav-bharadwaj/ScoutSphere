"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Target, Activity } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell } from "recharts";

type AnalyticsData = {
  total_applications: number;
  status_counts: Record<string, number>;
  weekly_activity: { name: string; applications: number }[];
  ats_score_estimate: number;
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const token = localStorage.getItem("scoutsphere_token");
        const res = await fetch("http://localhost:8000/analytics", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error("Failed to fetch analytics:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="text-white p-8 animate-pulse flex items-center justify-center">Loading Analytics Dashboard...</div>;
  }

  if (!data) {
    return <div className="text-red-400 p-8">Failed to load analytics.</div>;
  }

  const funnelData = [
    { name: "Draft", value: data.status_counts["Draft"] || 0 },
    { name: "Applied", value: data.status_counts["Applied"] || 0 },
    { name: "Interviewing", value: data.status_counts["Interviewing"] || 0 },
    { name: "Offer", value: data.status_counts["Offer"] || 0 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          Analytics Dashboard <BarChart3 className="text-blue-400 w-8 h-8" />
        </h1>
        <p className="text-gray-400 mt-2">
          Track your application performance, response rates, and profile strength.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 border border-white/5 bg-gradient-to-br from-blue-900/20 to-transparent">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wider">Total Applications</h3>
              <p className="text-3xl font-bold text-white">{data.total_applications}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 border border-white/5 bg-gradient-to-br from-emerald-900/20 to-transparent">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wider">Interview Rate</h3>
              <p className="text-3xl font-bold text-white">
                {data.total_applications > 0 
                  ? Math.round(((data.status_counts["Interviewing"] || 0) + (data.status_counts["Offer"] || 0)) / data.total_applications * 100) 
                  : 0}%
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 border border-white/5 bg-gradient-to-br from-purple-900/20 to-transparent">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
              <Activity className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wider">Base ATS Score</h3>
              <p className="text-3xl font-bold text-white">{data.ats_score_estimate}/100</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard className="p-6 border border-white/5">
          <h2 className="text-xl font-bold text-white mb-6">Application Funnel</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888' }} />
                <YAxis stroke="#888" tick={{ fill: '#888' }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151518', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#6B7280', '#3B82F6', '#F59E0B', '#10B981'][index % 4]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6 border border-white/5">
          <h2 className="text-xl font-bold text-white mb-6">Weekly Activity</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.weekly_activity} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888' }} />
                <YAxis stroke="#888" tick={{ fill: '#888' }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151518', border: '1px solid #333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="applications" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorApplications)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
