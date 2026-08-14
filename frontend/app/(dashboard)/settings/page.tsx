"use client";

import { Settings, ShieldAlert } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/Button";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          Settings & Preferences <Settings className="text-blue-400 w-8 h-8" />
        </h1>
        <p className="text-gray-400 mt-2">
          Manage your workspace preferences, AI model training data, and notification streams.
        </p>
      </div>
      
      <GlassCard className="p-8 border border-gray-800 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-white">System Persona Context</h2>
        <p className="text-gray-400 mb-4 text-sm">
          Define custom persona instructions for the LLM during form filling.
        </p>
        <textarea 
          className="w-full bg-[#0A0A0B] border border-gray-700 rounded-lg p-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
          rows={4}
          placeholder="e.g. Specializes in identifying high-growth SaaS opportunities..."
          defaultValue="Specializes in identifying high-growth SaaS opportunities and predictive market modeling."
        />
        <div className="mt-4 flex justify-end">
          <Button>Save Context</Button>
        </div>
      </GlassCard>

      <div className="bg-[#4a1212]/20 border border-red-900/50 rounded-xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
        <h2 className="text-xl font-semibold mb-2 text-red-400 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" /> Danger Zone
        </h2>
        <p className="text-gray-400 mb-6 text-sm">
          Irreversible actions regarding your account data. Permanently remove all data, AI context, and active models associated with this workspace.
        </p>
        <button className="bg-red-500/10 text-red-500 border border-red-500/50 px-6 py-2 rounded-lg font-medium hover:bg-red-500 hover:text-white transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}
