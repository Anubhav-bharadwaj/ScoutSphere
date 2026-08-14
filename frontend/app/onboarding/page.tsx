"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { GlassCard } from "@/components/GlassCard";

export default function OnboardingPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("preferences", JSON.stringify({ roles: ["Frontend Engineer"], locations: ["Remote"] }));

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:8000/users/me/profile", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      if (res.ok) {
        // Mock redirect to dashboard for milestone 1
        router.push("/app/dashboard");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6 text-[var(--foreground)]">
      <div className="w-full max-w-2xl">
        <div className="flex justify-center mb-12 gap-8 text-sm font-medium">
          <div className="flex items-center gap-2 text-[var(--color-primary)]"><span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-[var(--background)] flex items-center justify-center">1</span> UPLOAD</div>
          <div className="flex items-center gap-2 text-gray-500"><span className="w-6 h-6 rounded-full border border-gray-500 flex items-center justify-center">2</span> PREF</div>
          <div className="flex items-center gap-2 text-gray-500"><span className="w-6 h-6 rounded-full border border-gray-500 flex items-center justify-center">3</span> SYNC</div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Initialize Data Model</h1>
          <p className="text-gray-400">Upload your resume to allow ScoutSphere AI to extract and map your professional vector.</p>
        </div>

        <GlassCard className="mb-8 p-12 border-dashed border-2 hover:border-[var(--color-primary)] transition-colors flex flex-col items-center justify-center cursor-pointer relative">
          <input 
            type="file" 
            accept=".pdf" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <div className="w-12 h-12 bg-[var(--color-surface-high)] rounded-lg flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          </div>
          <h3 className="text-lg font-medium mb-1">Drag & Drop Resume</h3>
          <p className="text-gray-500 text-sm mb-4">Supports PDF (Max 5MB)</p>
          {file && (
             <div className="bg-[var(--color-surface-low)] px-4 py-2 rounded-md text-sm text-[var(--color-secondary)]">
               {file.name} selected
             </div>
          )}
        </GlassCard>

        <div className="flex justify-between items-center">
          <button className="text-gray-400 hover:text-white transition-colors text-sm">Skip for now</button>
          <Button onClick={handleUpload} disabled={!file || loading} className="px-8">
            {loading ? "Processing..." : "Continue →"}
          </Button>
        </div>
      </div>
    </div>
  );
}
