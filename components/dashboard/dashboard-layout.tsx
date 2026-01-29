"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import ChatPanel from "./chat-panel";
import WorkspacePanel from "./workspace-panel";
import clsx from "clsx";
import { MessageSquare, LayoutTemplate } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import Loader from "./loader";

// --- Configuration ---
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://6a68a84ec602.ngrok-free.app";
const API_PREFIX = "/api/v1"; 

// --- Types ---
export type RemoteConnection = {
  ip: string;
  bridgePort: number;
  previewPort: number;
  token: string;
};

type ProjectCreateResponse = {
  project_id: string; 
};

type ProjectStatusResponse = {
  status: "pending" | "provisioning" | "failed" | "ready";
};

type ProjectDetailsResponse = {
  ip: string;
  bridge_port: number;
  preview_port: number;
  bridge_token: string;
};

export default function DashboardLayout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get Project ID from URL
  const projectIdParam = searchParams.get("projectId");
  const initialPrompt = searchParams.get("prompt");
  
  // --- UI State ---
  const [sidebarWidth, setSidebarWidth] = useState(450);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<'chat' | 'workspace'>('chat');
  const [user, setUser] = useState<User | null>(null);

  // --- Logic State ---
  const [connection, setConnection] = useState<RemoteConnection | null>(null);
  const [projectStatus, setProjectStatus] = useState<string>("initializing");
  const [statusMessage, setStatusMessage] = useState<string>("Initializing environment...");
  
  // State flags to prevent duplicate calls
  const [isCreating, setIsCreating] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- 1. Authentication Check ---
  useEffect(() => {
    const supabase = createClient();
    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/');
            return;
        }
        setUser(user);
    };
    checkUser();
  }, [router]);

  // --- 2. CREATE Project (Only if no ID in URL) ---
  useEffect(() => {
    if (!user || projectIdParam || isCreating) return;

    const createProject = async () => {
      setIsCreating(true);
      console.log("⚡ [Frontend] No ID found. Creating new project...");
      setStatusMessage("Provisioning new cloud container...");

      try {
        const { data: { session } } = await createClient().auth.getSession();
        if (!session) return;

        const res = await fetch(`${BACKEND_URL}${API_PREFIX}/orchestrator/create`, { 
            method: "POST", 
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
                'ngrok-skip-browser-warning': 'true' // VITAL FOR NGROK
            } 
        });

        if (!res.ok) throw new Error(await res.text());

        const data: ProjectCreateResponse = await res.json();
        console.log("✅ [Frontend] Project Created with ID:", data.project_id);

        // Update URL - This will trigger Effect #3
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("projectId", data.project_id);
        router.replace(`?${newParams.toString()}`);
      } catch (e) {
        console.error("❌ [Frontend] Creation Failed:", e);
        setProjectStatus("error");
        setStatusMessage("Failed to create project.");
      }
    };

    createProject();
  }, [user, projectIdParam, isCreating, searchParams, router]);

  // --- 3. POLL Status (Runs when ID exists in URL) ---
  useEffect(() => {
    // Requirements to start polling:
    // 1. User is logged in
    // 2. We have a Project ID
    // 3. We are not already connected
    // 4. We aren't currently polling (interval ref check)
    if (!user || !projectIdParam || connection || pollingIntervalRef.current) return;

    console.log(`⏳ [Frontend] ID found (${projectIdParam}). Initializing Polling...`);
    setProjectStatus("polling");
    setStatusMessage("Waiting for server to be ready...");

    const startPolling = async () => {
      const { data: { session } } = await createClient().auth.getSession();
      if (!session) return;
      const token = session.access_token;

      // Clear any existing interval just in case
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

      pollingIntervalRef.current = setInterval(async () => {
        try {
          console.log(`📡 [Frontend] Polling status...`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const res = await fetch(`${BACKEND_URL}${API_PREFIX}/orchestrator/${projectIdParam}/status`, {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true' 
            },
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (!res.ok) {
             console.warn(`⚠️ [Frontend] Polling 4xx/5xx: ${res.status}`);
             return;
          }

          const data: ProjectStatusResponse = await res.json();
          console.log(`📥 [Frontend] Status: ${data.status}`);

          if (data.status === "ready") {
             console.log("🎉 [Frontend] Ready! Stopping poll.");
             if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
             }
             fetchConnectionDetails(projectIdParam, token);
          } else if (data.status === "failed") {
             if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
             }
             setProjectStatus("error");
             setStatusMessage("Server provisioning failed.");
          } else {
             // Still provisioning
             setStatusMessage(`Status: ${data.status}...`);
          }
        } catch (e) {
          console.error("⚠️ [Frontend] Polling Error:", e);
        }
      }, 5000);
    };

    startPolling();

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        console.log("🛑 [Frontend] Cleaning up polling interval.");
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [user, projectIdParam, connection]); // Reruns if ID changes

  const fetchConnectionDetails = async (projectId: string, token: string) => {
    try {
      console.log("🔗 [Frontend] Fetching connection details...");
      setStatusMessage("Establishing secure bridge...");
      
      const res = await fetch(`${BACKEND_URL}${API_PREFIX}/orchestrator/${projectId}/details`, { 
          headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'ngrok-skip-browser-warning': 'true'
          }
      });
      
      if (!res.ok) throw new Error("Failed to get details");
      
      const data: ProjectDetailsResponse = await res.json();
      console.log("✅ [Frontend] Connected:", data);

      setConnection({
        ip: data.ip,
        bridgePort: data.bridge_port,
        previewPort: data.preview_port,
        token: data.bridge_token
      });
      
      setProjectStatus("ready");
    } catch (error) {
      console.error(error);
      setProjectStatus("error");
      setStatusMessage("Failed to retrieve connection details.");
    }
  };

  // --- Layout Resizing Logic ---
  const sidebarWidthRef = useRef(sidebarWidth);
  useEffect(() => { sidebarWidthRef.current = sidebarWidth; }, [sidebarWidth]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
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

  // --- Render ---

  if (projectStatus === "error") {
      return (
        <div className="h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center text-white gap-4">
            <p className="text-red-400">{statusMessage}</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded">Retry</button>
        </div>
      );
  }

  // --- Render ---
  return (
    <div className={clsx("flex h-screen w-full bg-[#0a0a0a] overflow-hidden text-white", isMobile ? "flex-col" : "flex-row")}>
      <div className={clsx(isMobile ? (mobileView === 'chat' ? "flex-1 w-full overflow-hidden" : "hidden") : "h-full shrink-0")}>
        <ChatPanel 
          initialPrompt={initialPrompt || ""} 
          width={isMobile ? "100%" : sidebarWidth} 
          isResizing={isDragging}
          connection={connection}
          projectId={projectIdParam}
        />
      </div>

      {!isMobile && (
        <div
          className={`w-1 cursor-col-resize hover:bg-blue-500 hover:opacity-100 active:bg-blue-500 transition-colors duration-200 bg-white/5 hover:bg-white/20 z-50 flex-shrink-0 ${isDragging ? 'bg-blue-500 opacity-100' : 'opacity-0 hover:opacity-100'}`}
          onMouseDown={startResizing}
        />
      )}

      <div className={clsx(isMobile ? (mobileView === 'workspace' ? "flex-1 w-full overflow-hidden" : "hidden") : "flex-1 h-full min-w-0")}>
        <WorkspacePanel 
          connection={connection}
          isDragging={isDragging} 
          isLoading={projectStatus !== "ready"}
          statusMessage={statusMessage}
        />
      </div>
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