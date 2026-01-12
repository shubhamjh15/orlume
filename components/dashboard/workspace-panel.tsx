
"use client";

import { useState } from "react";
import CodeEditor from "./code-editor";
import PreviewFrame from "./preview-frame";
import Loader from "./loader";
import { Code2, Eye, Monitor, Smartphone, Tablet, RefreshCw, ChevronLeft, ChevronRight, Blocks, Zap, Rocket } from "lucide-react";
import clsx from "clsx";

interface WorkspacePanelProps {
  code: string;
  previewCode?: string;
  onCodeChange?: (value: string | undefined) => void;
  isDragging?: boolean;
  isLoading?: boolean;
}

import ConsolePanel from "./console-panel";
import { Terminal } from "lucide-react";

export default function WorkspacePanel({ activeTab: initialTab = "preview", code, previewCode, onCodeChange, isDragging = false, isLoading = false }: WorkspacePanelProps & { activeTab?: "preview" | "code" | "integration" }) {
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "integration">(initialTab);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [reloadKey, setReloadKey] = useState(0);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] border-l border-white/10">
      {/* Top Bar: View Toggles & Actions */}
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

      {/* Second Bar: Navigation & Address */}
      {activeTab === "preview" && (
        <div className="flex flex-wrap items-center gap-4 px-4 py-2 bg-[#0a0a0a] border-b border-white/10 shrink-0">
           
           {/* Left: Device & Reload */}
           <div className="flex items-center gap-3 flex-shrink-0">
               <div className="flex bg-[#1a1a1a] rounded-lg p-1 border border-white/5">
                 <button 
                   onClick={() => setDevice("desktop")}
                   className={clsx(
                     "p-1.5 rounded-md transition-all",
                     device === 'desktop' ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white"
                   )}
                 >
                   <Monitor size={14} />
                 </button>
                 <button 
                   onClick={() => setDevice("tablet")}
                   className={clsx(
                     "p-1.5 rounded-md transition-all",
                     device === 'tablet' ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white"
                   )}
                 >
                   <Tablet size={14} />
                 </button>
                 <button 
                   onClick={() => setDevice("mobile")}
                   className={clsx(
                     "p-1.5 rounded-md transition-all",
                     device === 'mobile' ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white"
                   )}
                 >
                   <Smartphone size={14} />
                 </button>
               </div>
               
               <div className="w-px h-6 bg-white/10 mx-1"></div>

               <button 
                 onClick={() => setReloadKey(prev => prev + 1)}
                 className="p-2 text-white/40 hover:text-white transition-colors"
               >
                 <RefreshCw size={14} />
               </button>
           </div>

           {/* Center: Address Bar */}
           <div className="flex items-center gap-4 flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 text-white/20">
                <ChevronLeft size={16} className="hover:text-white/60 cursor-pointer transition-colors" />
                <ChevronRight size={16} className="hover:text-white/60 cursor-pointer transition-colors" />
              </div>
              <div className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg h-8 flex items-center px-3 text-xs text-white/40 font-mono w-full">
                <span className="truncate">about:blank</span>
              </div>
           </div>

        </div>
      )}

      {/* Content */}
      <div className={clsx("flex-1 overflow-hidden relative flex flex-col", isDragging && "pointer-events-none select-none")}>
        <div className="flex-1 relative overflow-hidden">
            <div className={clsx("absolute inset-0 w-full h-full bg-[#111]", activeTab === "preview" ? "z-10" : "z-0 opacity-0 pointer-events-none")}>
               {isLoading ? (
                 <Loader />
               ) : (
                 <PreviewFrame code={previewCode || code} device={device} reloadKey={reloadKey} />
               )}
            </div>
            <div className={clsx("absolute inset-0 w-full h-full", activeTab === "code" ? "z-10" : "z-0 opacity-0 pointer-events-none")}>
               <CodeEditor code={code} onChange={onCodeChange} />
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

            {/* Console Overlay */}
            <ConsolePanel isOpen={isConsoleOpen} onClose={() => setIsConsoleOpen(false)} />
        </div>
      </div>
      
      {/* Bottom Status Bar */}
      <div className="h-8 bg-[#0a0a0a] border-t border-white/10 flex items-center justify-between px-3 shrink-0">
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                className={clsx(
                    "flex items-center gap-2 text-xs font-medium transition-colors h-full px-2",
                    isConsoleOpen ? "text-white bg-white/5" : "text-white/40 hover:text-white"
                )}
             >
                <Terminal size={12} />
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
