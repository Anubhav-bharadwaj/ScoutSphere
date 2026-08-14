"use client";

import { useEffect, useState } from "react";
import MatchCard from "@/components/MatchCard";
import { Sparkles } from "lucide-react";

export default function DiscoveryDashboard() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd use SWR or React Query, and authenticate properly.
    // For MVP, we simulate a fetch from the backend.
    const fetchMatches = async () => {
      try {
        const res = await fetch("http://localhost:8000/opportunities/matches");
        if (res.ok) {
          const data = await res.json();
          setMatches(data);
        } else {
          console.error("Failed to fetch matches");
        }
      } catch (err) {
        console.error("Network error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
          Discovery Dashboard
          <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
        </h1>
        <p className="text-gray-400 mt-3 text-lg max-w-2xl">
          We've scouted the web and analyzed thousands of opportunities. Here are the top matches curated specifically for your profile.
        </p>
      </header>

      {matches.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
          <p className="text-gray-400 text-lg">No matches found yet. Try triggering the scout pipeline!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
