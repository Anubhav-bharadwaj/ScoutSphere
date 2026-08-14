"use client";

import { Sparkles, CheckCircle } from "lucide-react";

export default function MyMatchesPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          My Saved Matches <CheckCircle className="text-blue-400 w-8 h-8" />
        </h1>
        <p className="text-gray-400 mt-2">
          Opportunities you've saved and approved for application.
        </p>
      </div>
      
      <div className="bg-[#0F0F11] border border-gray-800 rounded-xl p-12 text-center text-gray-500 shadow-xl">
        <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-white mb-2">No saved matches yet</h3>
        <p>Head over to the Discovery feed to find and save opportunities you're interested in.</p>
      </div>
    </div>
  );
}
