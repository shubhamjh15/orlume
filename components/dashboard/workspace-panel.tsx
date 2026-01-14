"use client";

import { useState, useEffect, useRef } from "react";
import CodeEditor from "./code-editor";
import PreviewFrame from "./preview-frame";
import ConsolePanel from "./console-panel";
import { Code2, Eye, Monitor, Smartphone, Tablet, RefreshCw, ChevronLeft, ChevronRight, Blocks, Zap, Rocket, Terminal as TerminalIcon } from "lucide-react";
import clsx from "clsx";
import { io, Socket } from "socket.io-client";
import { RemoteConnection } from "./dashboard-layout";

interface WorkspacePanelProps {
  connection: RemoteConnection;
  isDragging?: boolean;
}

export type LogEntry = {
    id: string;
    timestamp: string;
    type: "info" | "warning" | "error";
    message: string;
};

export default function WorkspacePanel({ connection, isDragging = false }: WorkspacePanelProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "integration">("preview");
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [reloadKey, setReloadKey] = useState(0);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);

  // --- Backend State ---
  const [filesContent, setFilesContent] = useState<{ [key: string]: string }>({});
  const [activeFile, setActiveFile] = useState<string>("app/page.tsx");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // --- Socket.io Logic ---
  useEffect(() => {
    if (!connection) return;

    // Reset state on new connection
    setFilesContent({});
    setLogs([]);
    if (socketRef.current) socketRef.current.disconnect();

    const bridgeUrl = `http://${connection.ip}:${connection.bridgePort}`;
    const _previewUrl = `http://${connection.ip}:${connection.previewPort}`;
    
    // Initial Preview URL
    setPreviewUrl(_previewUrl);

    socketRef.current = io(bridgeUrl, {
        auth: { token: connection.token },
        transports: ["polling", "websocket"],
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
        setIsConnected(true);
        addLog("Connected to development bridge.", "info");
        
        // Start watching files and server
        socket.emit("file:watch");
        socket.emit("terminal:start", { command: "npm run dev" });
    });

    socket.on("file:update", (data) => {
        if (data.event === "add" || data.event === "change") {
            const path = data.path;
            if (path.includes("node_modules") || path.includes(".next")) return;

            // Read the content
            socket.emit("file:read", { filePath: path }, (response: any) => {
                if (response.success) {
                    setFilesContent((prev) => ({ ...prev, [path]: response.content }));
                }
            });
        }
    });

    socket.on("terminal:data", (data: string) => {
        // Simple heuristic to determine log type
        let type: LogEntry['type'] = 'info';
        if (data.toLowerCase().includes("error")) type = 'error';
        if (data.toLowerCase().includes("warn")) type = 'warning';
        
        // Clean ANSI codes
        const cleanMessage = data.replace(/[\u001b\u009b][[()#;?]*.{0,2}(?:[0-9]{1,4}(?:;0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "").trim();
        
        if (cleanMessage) {
            addLog(cleanMessage, type);
        }
    });

    socket.on("disconnect", () => {
        setIsConnected(false);
        addLog("Disconnected from bridge.", "error");
    });

    return () => {
        socket.disconnect();
    };
  }, [connection]);

  const addLog = (message: string, type: LogEntry['type']) => {
      setLogs(prev => [...prev.slice(-100), {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString().split('T')[1].slice(0, 12) + "Z",
          type,
          message
      }]);
  };

  // --- File Saving Logic ---
  const handleCodeChange = (newCode: string | undefined) => {
      if (!newCode) return;

      // Optimistic update
      setFilesContent(prev => ({ ...prev, [activeFile]: newCode }));

      if (debounceRef.current) clearTimeout(debounceRef.current);
      
      debounceRef.current = setTimeout(async () => {
          try {
              const bridgeUrl = `http://${connection.ip}:${connection.bridgePort}`;
              await fetch(`${bridgeUrl}/api/file/write`, {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json",
                      "x-secret-token": connection.token,
                  },
                  body: JSON.stringify({ filePath: activeFile, content: newCode }),
              });
          } catch (err) {
              console.error("Failed to save file", err);
          }
      }, 500); // Debounce save
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] border-l border-white/10">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 bg-[#0a0a0a] border-b border-white/10 shrink-0">
        <div className="flex bg-[#1a1a1a] rounded-lg p-1 border border-white/5 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab("preview")}
            className={clsx(
              "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
              activeTab === "preview" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white"
            )}
          >
            <Eye size={14} />
            Preview
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={clsx(
              "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
              activeTab === "code" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white"
            )}
          >
            <Code2 size={14} />
            Code
          </button>
          <button
            onClick={() => setActiveTab("integration")}
            className={clsx(
              "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
              activeTab === "integration" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white"
            )}
          >
            <Blocks size={14} />
            Integration
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-all border border-white/5">
            <Zap size={14} className="text-yellow-400 fill-yellow-400/20" />
            Upgrade
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-black bg-white hover:bg-gray-200 rounded-md transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <Rocket size={14} className="fill-black/10" />
            Publish
          </button>
        </div>
      </div>

      {/* Navigation Bar (Preview Only) */}
      {activeTab === "preview" && (
        <div className="flex flex-wrap items-center gap-4 px-4 py-2 bg-[#0a0a0a] border-b border-white/10 shrink-0">
           <div className="flex items-center gap-3 flex-shrink-0">
               <div className="flex bg-[#1a1a1a] rounded-lg p-1 border border-white/5">
                 <button onClick={() => setDevice("desktop")} className={clsx("p-1.5 rounded-md", device==='desktop'?"bg-white/10 text-white":"text-white/40 hover:text-white")}><Monitor size={14} /></button>
                 <button onClick={() => setDevice("tablet")} className={clsx("p-1.5 rounded-md", device==='tablet'?"bg-white/10 text-white":"text-white/40 hover:text-white")}><Tablet size={14} /></button>
                 <button onClick={() => setDevice("mobile")} className={clsx("p-1.5 rounded-md", device==='mobile'?"bg-white/10 text-white":"text-white/40 hover:text-white")}><Smartphone size={14} /></button>
               </div>
               <div className="w-px h-6 bg-white/10 mx-1"></div>
               <button onClick={() => setReloadKey(prev => prev + 1)} className="p-2 text-white/40 hover:text-white transition-colors"><RefreshCw size={14} /></button>
           </div>

           <div className="flex items-center gap-4 flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 text-white/20">
                <ChevronLeft size={16} />
                <ChevronRight size={16} />
              </div>
              <div className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg h-8 flex items-center px-3 text-xs text-white/40 font-mono w-full">
                <span className="truncate">{previewUrl}</span>
              </div>
           </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={clsx("flex-1 overflow-hidden relative flex flex-col", isDragging && "pointer-events-none select-none")}>
        <div className="flex-1 relative overflow-hidden">
            <div className={clsx("absolute inset-0 w-full h-full bg-[#111]", activeTab === "preview" ? "z-10" : "z-0 opacity-0 pointer-events-none")}>
               <PreviewFrame 
                  url={previewUrl} 
                  device={device} 
                  reloadKey={reloadKey} 
                  isConnected={isConnected}
               />
            </div>
            
            <div className={clsx("absolute inset-0 w-full h-full", activeTab === "code" ? "z-10" : "z-0 opacity-0 pointer-events-none")}>
               <CodeEditor 
                  activeFile={activeFile}
                  onFileSelect={setActiveFile}
                  filesContent={filesContent}
                  onChange={handleCodeChange} 
               />
            </div>

            <div className={clsx("absolute inset-0 w-full h-full flex items-center justify-center bg-[#111]", activeTab === "integration" ? "z-10" : "z-0 opacity-0 pointer-events-none")}>
               <div className="text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Blocks size={32} className="text-white/20" />
                  </div>
                  <h3 className="text-white font-medium mb-1">Integrations</h3>
                  <p className="text-white/40 text-sm">Coming Soon</p>
               </div>
            </div>

            <ConsolePanel 
                isOpen={isConsoleOpen} 
                onClose={() => setIsConsoleOpen(false)} 
                logs={logs}
            />
        </div>
      </div>
      
      {/* Bottom Status Bar */}
      <div className="h-8 bg-[#0a0a0a] border-t border-white/10 flex items-center justify-between px-3 shrink-0">
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                className={clsx("flex items-center gap-2 text-xs font-medium transition-colors h-full px-2", isConsoleOpen ? "text-white bg-white/5" : "text-white/40 hover:text-white")}
             >
                <TerminalIcon size={12} />
                Console
             </button>
          </div>
          <div className="text-[10px] text-white/20 font-mono">
             {device.toUpperCase()} MODE
          </div>
      </div>
    </div>
  );
}