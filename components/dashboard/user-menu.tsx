"use client";

import { User } from "@supabase/supabase-js";
import { LogOut, Settings, LayoutTemplate, ChevronRight, User as UserIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import clsx from "clsx";

interface UserMenuProps {
  user: User | null;
  onSignOut: () => void;
}

export default function UserMenu({ user, onSignOut }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || "User";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-[38px] h-[38px] rounded-full overflow-hidden border border-white/10 hover:border-white/20 transition-colors focus:outline-none"
      >
        <div className="w-full h-full bg-white/10 flex items-center justify-center">
            {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
            ) : (
                <UserIcon size={20} className="text-white/60" />
            )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* User Info Header */}
          <div className="p-4 border-b border-white/5 flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                ) : (
                    <UserIcon size={20} className="text-white/60" />
                )}
             </div>
             <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">
                    {user.user_metadata?.full_name || user.email?.split('@')[0] || "User"}
                </h3>
                <p className="text-white/50 text-xs truncate">{user.email}</p>
             </div>
          </div>

          {/* Plan Info */}
          <div className="p-2">
            <div className="bg-[#1a1a1a] rounded-lg p-3 border border-white/5">
                <div className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-1">Current Plan</div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-bold">Starter</span>
                    <button className="text-blue-400 text-xs hover:underline">Upgrade</button>
                </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2 space-y-0.5">
             <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors group">
                <LayoutTemplate size={16} />
                <span className="flex-1 text-left">Templates</span>
             </button>

             <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors group">
                <Settings size={16} />
                <span className="flex-1 text-left">Account settings</span>
                <ChevronRight size={14} className="text-white/20 group-hover:text-white/50" />
             </button>
          </div>

          {/* Sign Out */}
          <div className="p-2 border-t border-white/5">
             <button 
                onClick={onSignOut}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
             >
                <LogOut size={16} />
                <span>Sign out</span>
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
