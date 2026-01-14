
"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { X, Loader2, Github } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: "login" | "signup";
}

export default function AuthModal({ isOpen, onClose, defaultView = "login" }: AuthModalProps) {
  const [view, setView] = useState<"login" | "signup">(defaultView);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (view === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }

      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="relative w-full max-w-5xl min-h-[700px] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2">
        
        {/* Left Side - Image */}
        <div className="relative hidden md:block w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('/Generated%20Image%20January%2008,%202026%20-%205_06PM.webp')" }}>
          <div className="absolute inset-0 bg-black/20" /> {/* Subtle overlay if needed */}
        </div>

        {/* Right Side - Form */}
        <div className="relative p-8 md:p-12 flex flex-col justify-center bg-[#0a0a0a]">
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">
              Sign in / Sign up
            </h2>
            <p className="text-white/50 text-sm">
              We'll sign you in or create an account if you don't have one yet
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleOAuth("google")}
              className="w-full flex items-center justify-center gap-3 bg-[#f0f0f0] text-black font-medium py-2.5 rounded-lg hover:bg-white transition-colors"
              disabled={loading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
            
            {/* Hidden GitHub button to match reference simplicity, or could keep it. 
                Reference only showed Google. I'll hide GitHub to be "similar" or keep it as secondary? 
                User said "similar to this", reference has only Google. I will COMMENT OUT GitHub for now or remove it to match visuals. 
                I'll keep it but maybe styled less prominently? No, let's match the reference simplicity for now. 
                Actually, I'll keep it because functionality > exact pixel match if user uses GitHub. 
                I will leave it but maybe add the divider after it. 
                Wait, reference has "Continue with Google" -> OR -> "Email".
                I will put GitHub aside or remove it to match the clean look. 
                Let's remove GitHub button to match the "clean" reference, assuming Google/Email is priority. 
                (Or I can keep it if I want). I'll keep it commented out or remove. 
                Actually, the user might want GitHub. I'll stick to the reference: Only Google shown. 
            */}

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-white/30 text-xs font-medium">OR</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your work or personal email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                required
              />
               {/* Keeping password for functionality, though reference doesn't show it explicitly (could be following step). */}
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                required
              />
              
              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white/10 text-white font-medium py-2.5 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Continue"
                )}
              </button>
            </form>
          </div>

          <p className="mt-8 text-center text-xs text-white/30 leading-relaxed">
            By signing up or signing in, you agree to our <a href="#" className="underline hover:text-white/50">Terms</a> and <a href="#" className="underline hover:text-white/50">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
