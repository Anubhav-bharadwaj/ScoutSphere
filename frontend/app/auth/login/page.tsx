"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { GlassCard } from "@/components/GlassCard";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password_hash: password }),
      });

      if (!res.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);
      router.push("/onboarding");
    } catch (err) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--background)]">
      {/* Ambient violet blur */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-primary)] opacity-20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="z-10 flex flex-col md:flex-row max-w-4xl w-full gap-8 p-6">
        {/* LOGO & BRAND AREA */}
        <div className="flex-1 flex flex-col justify-center text-[var(--foreground)]">
          <div className="w-16 h-16 bg-[var(--color-primary)] rounded-xl mb-6 shadow-[0_0_20px_var(--color-primary)]"></div>
          <h1 className="text-4xl font-bold mb-2">ScoutSphere</h1>
          <p className="text-gray-400 text-lg">Autonomous agents finding your next big move.</p>
        </div>

        {/* SIGN IN CARD */}
        <div className="flex-1">
          <GlassCard className="w-full">
            <h2 className="text-2xl font-semibold text-white mb-2">Sign In</h2>
            <p className="text-gray-400 mb-6 text-sm">Access your AI command center.</p>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="text-[var(--color-error)] text-sm">{error}</div>
              )}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className={error ? "border-[var(--color-error)]" : ""}
                  required
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm text-gray-400">Password</label>
                  <a href="#" className="text-xs text-[var(--color-primary)]">Forgot?</a>
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={error ? "border-[var(--color-error)]" : ""}
                  required
                />
              </div>

              <Button type="submit" className="w-full flex justify-center items-center gap-2" disabled={loading}>
                {loading ? <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> : "Sign In →"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
              Don't have an account? <a href="#" className="text-[var(--color-primary)] hover:underline">Request Access</a>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
