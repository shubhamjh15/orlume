"use client";

import { Wifi } from "lucide-react";
import { useEffect, useRef } from "react";

interface PreviewFrameProps {
  url: string;
  device: "desktop" | "tablet" | "mobile";
  reloadKey: number;
  isConnected: boolean;
}

export default function PreviewFrame({ url, device, reloadKey, isConnected }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && url && isConnected) {
       // Append reload key to force refresh if needed, though mostly used to re-set src
       iframeRef.current.src = url;
    }
  }, [url, reloadKey, isConnected]);

  if (!isConnected || !url) {
      return (
          <div className="h-full w-full flex flex-col items-center justify-center bg-[#111] text-white/40 gap-4">
              <div className="relative">
                 <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
                 <Wifi className="w-12 h-12 relative z-10 animate-pulse" />
              </div>
              <p>Waiting for server to start...</p>
          </div>
      );
  }

  return (
    <div className="h-full w-full flex flex-col bg-[#111] items-center justify-center overflow-hidden">
       <div 
         className={`transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] bg-white h-full shadow-2xl relative overflow-hidden
           ${device === 'desktop' ? 'w-full' : ''}
           ${device === 'tablet' ? 'w-[768px] border-x border-white/10 rounded-lg my-4 h-[calc(100%-2rem)]' : ''}
           ${device === 'mobile' ? 'w-[375px] border-x border-white/10 rounded-lg my-4 h-[calc(100%-2rem)]' : ''}
         `}
       >
         <iframe
           key={reloadKey} // Force remount on manual reload button
           ref={iframeRef}
           className="w-full h-full border-none bg-white"
           title="Preview"
           sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
           src={url}
         />
       </div>
    </div>
  );
}