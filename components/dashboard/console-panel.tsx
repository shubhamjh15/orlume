"use client";

import { X, Copy, Trash2, Filter } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

interface LogMessage {
  id: string;
  timestamp: string;
  type: "info" | "warning" | "error";
  message: string;
}

const MOCK_LOGS: LogMessage[] = [
  {
    id: "1",
    timestamp: new Date().toISOString().split('T')[1].slice(0, 12) + "Z", // Format like 23:41:55.628Z
    type: "warning",
    message: "THREE.WARNING: Multiple instances of Three.js being imported."
  }
];

interface ConsolePanelProps {
  isOpen: boolean;
  onClose: () => void;
  height?: number;
}

export default function ConsolePanel({ isOpen, onClose, height = 200 }: ConsolePanelProps) {
  const [logs, setLogs] = useState<LogMessage[]>(MOCK_LOGS);
  const [filter, setFilter] = useState("");

  if (!isOpen) return null;

  const filteredLogs = logs.filter(log => 
    log.message.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div 
      className="absolute bottom-0 left-0 w-full bg-black border-t border-white/10 flex flex-col z-20"
      style={{ height: `${height}px` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#111] border-b border-white/10">
        <span className="text-xs font-medium text-white/80">Console</span>
        
        <div className="flex items-center gap-2">
          {/* Filter Input */}
          <div className="relative group">
            <input
              type="text"
              placeholder="Filter..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[#0a0a0a] border border-white/10 rounded px-2 py-0.5 text-xs text-white/70 w-32 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1 border-l border-white/10 pl-2 ml-1">
             <button className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white transition-colors" title="Copy">
               <Copy size={12} />
             </button>
             <button 
                onClick={() => setLogs([])}
                className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white transition-colors" 
                title="Clear"
             >
               <Trash2 size={12} />
             </button>
             <button 
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white transition-colors" 
                title="Close"
             >
               <X size={12} />
             </button>
          </div>
        </div>
      </div>

      {/* Logs Area */}
      <div className="flex-1 overflow-y-auto font-mono text-xs p-1 space-y-0.5">
        {filteredLogs.map((log) => (
          <div 
            key={log.id} 
            className={clsx(
                "flex items-start gap-2 px-2 py-1 hover:bg-white/5 rounded select-text",
                log.type === "warning" && "text-orange-400 bg-orange-500/5",
                log.type === "error" && "text-red-400 bg-red-500/5",
                log.type === "info" && "text-white/80"
            )}
          >
             <span className="opacity-50 flex-shrink-0 select-none">{log.timestamp}</span>
             <span className="break-all">{log.message}</span>
          </div>
        ))}
        {filteredLogs.length === 0 && (
            <div className="px-2 py-1 text-white/20 italic">No logs found</div>
        )}
      </div>
    </div>
  );
}
