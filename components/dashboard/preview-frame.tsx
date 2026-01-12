
"use client";

import { useEffect, useRef } from "react";

interface PreviewFrameProps {
  code: string;
  device: "desktop" | "tablet" | "mobile";
  reloadKey: number;
}

export default function PreviewFrame({ code, device, reloadKey }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(code);
        doc.close();
      }
    }
  }, [code, reloadKey]);

  return (
    <div className="h-full w-full flex flex-col bg-[#111] items-center justify-center overflow-hidden">
       <div 
         className={`transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] bg-white h-full shadow-2xl relative
           ${device === 'desktop' ? 'w-full' : ''}
           ${device === 'tablet' ? 'w-[768px] border-x border-white/10' : ''}
           ${device === 'mobile' ? 'w-[375px] border-x border-white/10' : ''}
         `}
       >
         <iframe
           key={reloadKey}
           ref={iframeRef}
           className="w-full h-full border-none bg-white"
           title="Preview"
           sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
         />
       </div>
    </div>
  );
}
