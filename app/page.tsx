"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUp, X } from "lucide-react";
import { useState, useEffect } from "react";
import AuthModal from "../components/auth-modal";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import UserMenu from "@/components/dashboard/user-menu";
import ProjectGrid from "@/components/landing/project-grid";
import SiteFooter from "@/components/landing/site-footer";
import clsx from "clsx";

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState<{ file: File; preview: string }[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<"login" | "signup">("login");
  const [user, setUser] = useState<User | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const openAuthModal = (view: "login" | "signup") => {
    setAuthView(view);
    setIsAuthModalOpen(true);
  };

  /* Add state for prompt input */
  const [prompt, setPrompt] = useState("");

  const handleGenerate = () => {
    if (!user) {
      openAuthModal("signup");
      return;
    }
    if (prompt.trim()) {
      window.location.href = `/dashboard?prompt=${encodeURIComponent(prompt)}`;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    }
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <main className={clsx(
      "relative w-full text-white",
      user ? "min-h-screen overflow-y-auto overflow-x-hidden" : "h-screen overflow-hidden flex flex-col items-center justify-center"
    )}>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        defaultView={authView}
      />

      {/* Background Image */}
      <div 
        className={clsx(
          "absolute top-0 left-0 w-full -z-10 brightness-[0.8] bg-cover bg-center bg-no-repeat",
          user ? "h-[100vh]" : "h-full"
        )}
        style={{ backgroundImage: "url('/Generated%20Image%20January%2008,%202026%20-%205_06PM.webp')" }}
      />
      
      {/* Overlay gradient for smooth transition to dark sections */}
      {user && (
        <div className="absolute top-[60vh] left-0 w-full h-[40vh] bg-gradient-to-b from-transparent to-[#0a0a0a] -z-10" />
      )}

      {/* Navigation */}
      <nav className="absolute top-0 w-full flex items-center justify-between px-8 py-6 z-50">
        <div className="flex items-center gap-0.5">
           <Image
            src="/logo.webp"
            alt="Orlume Logo"
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
          />
          <span className="font-semibold text-lg tracking-tight">orlume</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
          <Link href="#" className="hover:text-white transition-colors">Create</Link>
          <Link href="#" className="hover:text-white transition-colors">Explore</Link>
          <Link href="#" className="hover:text-white transition-colors">Pricing</Link>
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <UserMenu user={user} onSignOut={handleSignOut} />
          ) : (
            <>
              <button 
                onClick={() => openAuthModal("login")}
                className="text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                Log in
              </button>
              <button 
                onClick={() => openAuthModal("signup")}
                className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-full hover:bg-gray-100 transition-colors"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Content Wrapper */}
      <div className="min-h-screen w-full flex flex-col items-center justify-center text-center px-4 z-10 shrink-0">
        
        {/* Brand Center */}
        <div className="flex flex-col items-center mb-8">
           <div className="relative w-20 h-20">
             <div className="absolute inset-0 bg-pink-500/20 blur-3xl rounded-full"></div>
             <div className="animate-slow-spin">
               <Image
                src="/logo.webp"
                alt="Orlume Logo"
                width={80}
                height={80}
                className="object-contain"
              />
             </div>
           </div>
           <h1 className="text-5xl md:text-6xl font-cormorant italic font-medium tracking-tight mb-2 -mt-4 text-white">orlume</h1>
           <p className="text-base md:text-lg text-white/70 mt-5 -mb-1 font-light max-w-lg">
             Where interfaces bloom into beautiful websites.
           </p>
        </div>

        {/* AI Input Box */}
        <div className="w-full max-w-3xl relative group">
           <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
           <div className="relative w-full bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-2xl">
              
              {/* Uploaded Files Preview */}
              {uploadedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {uploadedFiles.map((item, index) => (
                    <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/20 group/thumb">
                      <img
                        src={item.preview}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 rounded-full text-white/80 hover:text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <textarea 
                className="w-full bg-transparent border-none outline-none text-white placeholder-white/40 text-lg resize-none h-24 dark-scrollbar"
                placeholder="Describe the website you want to build..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
              />
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-medium text-white/50 hover:text-white transition-colors cursor-pointer">
                    <input type="file" className="hidden" multiple onChange={handleFileUpload} accept="image/*" />
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                    <span>Upload files</span>
                  </label>
                </div>

                <div className="flex items-center gap-3">
                   <button 
                    onClick={handleGenerate}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                  >
                     <ArrowUp size={20} />
                   </button>
                </div>
                </div>
              </div>
           </div>
        </div>


      
      {/* Logged In Sections */}
      {user && (
        <div className="relative z-10 bg-[#0a0a0a]">
          <ProjectGrid />
          <SiteFooter />
        </div>
      )}
      
      {/* Footer Links (Minimal - Guest Only) */}
      {!user && (
        <div className="absolute bottom-6 flex gap-6 text-[10px] uppercase tracking-widest text-white/30">
          <Link href="#" className="hover:text-white/50">Privacy Policy</Link>
          <Link href="#" className="hover:text-white/50">Terms of Service</Link>
        </div>
      )}

    </main>
  );
}
