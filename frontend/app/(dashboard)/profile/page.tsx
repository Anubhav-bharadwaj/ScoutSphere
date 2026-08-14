"use client";

import { User } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";

export default function ProfilePage() {
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
        <h2 className="text-xl font-semibold mb-4 text-white">Profile Overview</h2>
        <div className="space-y-4 text-gray-300">
          <p><strong>Email:</strong> test_new@example.com</p>
          <p><strong>Role:</strong> Applicant</p>
          <p><strong>Resume Status:</strong> Synced with Vector Store</p>
        </div>
      </GlassCard>
    </div>
  );
}
