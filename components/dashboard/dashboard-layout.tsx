
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import ChatPanel from "./chat-panel";
import WorkspacePanel from "./workspace-panel";
import clsx from "clsx";
import { MessageSquare, LayoutTemplate } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const DEFAULT_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Generated Site</title>
    <style>
        body { margin: 0; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #000; color: white; }
        h1 { font-size: 3rem; background: linear-gradient(to right, #ec4899, #8b5cf6); -webkit-background-clip: text; color: transparent; }
    </style>
</head>
<body>
    <h1>Hello World</h1>
</body>
</html>`;

export default function DashboardLayout() {
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt");
  const [code, setCode] = useState(DEFAULT_CODE);
  const [debouncedCode, setDebouncedCode] = useState(DEFAULT_CODE);

  // Debounce code updates for preview
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCode(code);
    }, 750); // 750ms delay

    return () => clearTimeout(timer);
  }, [code]);

  useEffect(() => {
    // In a real app, this is where we'd call the AI generation API with the prompt
    if (prompt) {
      console.log("Generating code for prompt:", prompt);
    }
  }, [prompt]);

  const [sidebarWidth, setSidebarWidth] = useState(450);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<'chat' | 'workspace'>('chat');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const sidebarWidthRef = useRef(sidebarWidth);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };
    checkUser();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  // Sync ref with state for event listeners
  useEffect(() => {
    sidebarWidthRef.current = sidebarWidth;
  }, [sidebarWidth]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check initially
    checkMobile();
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const startResizing = useCallback(() => {
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const stopResizing = useCallback(() => {
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  const resize = useCallback((mouseEvent: MouseEvent) => {
    if (isDragging) {
      const newWidth = mouseEvent.clientX;
      const maxWidth = window.innerWidth - 517;
      if (newWidth >= 400 && newWidth <= maxWidth) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isDragging, resize, stopResizing]);

  return (
    <div className={clsx("flex h-screen w-full bg-[#0a0a0a] overflow-hidden text-white", isMobile ? "flex-col" : "flex-row")}>
      {/* Sidebar / Chat */}
      <div className={clsx(isMobile ? (mobileView === 'chat' ? "flex-1 w-full overflow-hidden" : "hidden") : "h-full shrink-0")}>
        <ChatPanel 
          initialPrompt={prompt || ""} 
          width={isMobile ? "100%" : sidebarWidth} 
          isResizing={isDragging}
          isLoading={isLoading}
          onLoadingChange={setIsLoading}
        />
      </div>

      {/* Resize Handle - Desktop Only */}
      {!isMobile && (
        <div
          className={`w-1 cursor-col-resize hover:bg-blue-500 hover:opacity-100 active:bg-blue-500 transition-colors duration-200 bg-white/5 hover:bg-white/20 z-50 flex-shrink-0 ${isDragging ? 'bg-blue-500 opacity-100' : 'opacity-0 hover:opacity-100'}`}
          onMouseDown={startResizing}
        />
      )}

      {/* Main Workspace */}
      <div className={clsx(isMobile ? (mobileView === 'workspace' ? "flex-1 w-full overflow-hidden" : "hidden") : "flex-1 h-full min-w-0")}>
        <WorkspacePanel 
          code={code} 
          previewCode={debouncedCode}
          onCodeChange={(val) => setCode(val || "")} 
          isDragging={isDragging} 
          isLoading={isLoading}
        />
      </div>

      {/* Mobile Navigation */}
      {isMobile && (
        <div className="h-16 border-t border-white/10 bg-[#0a0a0a] flex items-center justify-around px-4 shrink-0 z-50 pb-safe">
          <button
            onClick={() => setMobileView('chat')}
            className={clsx(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-colors",
              mobileView === 'chat' ? "text-white bg-white/10" : "text-white/40 hover:text-white"
            )}
          >
            <MessageSquare size={20} />
            <span className="text-[10px] font-medium">Chat</span>
          </button>
          <button
            onClick={() => setMobileView('workspace')}
            className={clsx(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-colors",
              mobileView === 'workspace' ? "text-white bg-white/10" : "text-white/40 hover:text-white"
            )}
          >
            <LayoutTemplate size={20} />
            <span className="text-[10px] font-medium">Workspace</span>
          </button>
        </div>
      )}
    </div>
  );
}
