
"use client";

import { ArrowUp, Sparkles, User as UserIcon, Paperclip, FileText, Home, ChevronDown, Crosshair, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { User } from "@supabase/supabase-js";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface UploadedFile {
  file: File;
  preview: string;
}

interface ChatPanelProps {
  initialPrompt?: string;
  onSendMessage?: (message: string) => void;
  width?: number | string;
  isResizing?: boolean;
  isLoading?: boolean;
  onLoadingChange?: (loading: boolean) => void;
}

export default function ChatPanel({ 
  initialPrompt, 
  onSendMessage, 
  width = 450, 
  isResizing = false, 
  isLoading = false, 
  onLoadingChange,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSelectorActive, setIsSelectorActive] = useState(false);
  const [isPlanActive, setIsPlanActive] = useState(false);
  const [loadingText, setLoadingText] = useState("Thinking...");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt && messages.length === 0) {
      setMessages([
        { role: "user", content: initialPrompt },
        { role: "assistant", content: "I'm generating your website based on that description..." }
      ]);

      // Trigger loading sequence for initial prompt
      onLoadingChange?.(true);
      setLoadingText("Initializing...");

      setTimeout(() => {
        setLoadingText("Understanding your request...");
      }, 1500);

      setTimeout(() => {
        setLoadingText("Planning the layout...");
      }, 5000);

      setTimeout(() => {
        setLoadingText("Generating initial code...");
      }, 6700);

      setTimeout(() => {
        onLoadingChange?.(false);
      }, 7500);
    }
  }, [initialPrompt]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(uploadedFiles[index].preview);
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const send = () => {
    if (!input.trim() && uploadedFiles.length === 0) return;
    
    // In a real app, you'd send the files here. For now, we'll just show the text.
    // Ideally, we'd add the images to the message object too.
    const newMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, newMsg]);
    onSendMessage?.(input);
    setInput("");
    setUploadedFiles([]); // Clear files after sending
    onLoadingChange?.(true);
    setLoadingText("Thinking...");
    
    // Mock sequential thinking steps
    setTimeout(() => {
      setLoadingText("Understanding your request...");
    }, 1500);

    setTimeout(() => {
      setLoadingText("Planning the changes...");
    }, 5000);

    setTimeout(() => {
      setLoadingText("Generating code...");
    }, 6700);

    setTimeout(() => {
      setMessages(prev => [...prev, { role: "assistant", content: "I've updated the code based on your request. Let me know if you need any adjustments!" }]);
      onLoadingChange?.(false);
    }, 7500);
  };

  return (
    <div 
      className={clsx(
        "flex flex-col h-full bg-[#0a0a0a] border-r border-white/10 shrink-0 relative",
        isResizing && "select-none transition-none"
      )}
      style={{ width }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
         <div className="flex items-center gap-3">
             <Link href="/">
               <button className="w-[38px] h-[38px] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  <Home size={18} />
               </button>
             </Link>
             <div className="h-4 w-px bg-white/10"></div>
             <div className="flex items-center gap-3">
               <Image src="/logo.webp" alt="Orlume Logo" width={32} height={32} className="w-8 h-8 object-contain" />
               <span className="font-medium text-white text-sm">Orlume Agent</span>
             </div>
         </div>

         <div className="flex items-center gap-3">
             {/* Add a placeholder or other actions if needed */}
         </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6 dark-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={clsx("flex gap-1", msg.role === "assistant" ? "flex-row" : "flex-row-reverse")}>
             <div className={clsx(
               "rounded-full flex items-center justify-center flex-shrink-0",
               msg.role === "assistant" ? "w-12 h-12 bg-transparent" : "w-8 h-8 bg-white/10"
             )}>
                {msg.role === "assistant" ? (
                  <Image src="/logo.webp" alt="Orlume" width={48} height={48} className="w-12 h-12 object-contain animate-slow-spin" />
                ) : (
                  <UserIcon size={14} className="text-white" />
                )}
             </div>
             
             <div className={clsx(
               "relative px-4 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap break-words",
               msg.role === "assistant" 
                 ? "bg-white/5 text-white/90 rounded-tl-none border border-white/5" 
                 : "bg-[#2a2a2a] text-white rounded-tr-none font-medium"
             )}>
                {msg.content}
             </div>
          </div>
        ))}
        
        {isLoading && (
           <div className="flex gap-1 flex-row">
             <div className="rounded-full flex items-center justify-center flex-shrink-0 w-12 h-12 bg-transparent">
                <Image src="/logo.webp" alt="Orlume" width={48} height={48} className="w-12 h-12 object-contain animate-slow-spin" />
             </div>
             
             <div className="relative px-4 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed bg-white/5 text-white/90 rounded-tl-none border border-white/5">
                <span className="bg-gradient-to-r from-white/40 via-white to-white/40 bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer font-medium">
                  {loadingText}
                </span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 pb-4 bg-[#0a0a0a]">
         <div className="relative bg-[#1a1a1a] border border-white/10 rounded-xl p-3 focus-within:border-white/20 transition-all shadow-lg flex flex-col gap-2">
             {/* Uploaded Files Preview */}
             {uploadedFiles.length > 0 && (
               <div className="flex flex-wrap gap-2 mb-2 px-1">
                 {uploadedFiles.map((item, index) => (
                   <div key={index} className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/20 group/thumb">
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
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder='Ask me... (or type "@" to context or "/" to command)'
              className="w-full bg-transparent text-white px-1 text-sm focus:outline-none resize-none max-h-32 dark-scrollbar placeholder-white/30"
              rows={2}
              style={{ minHeight: '40px' }}
            />
            <div className="flex justify-between items-center pt-2">
               <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-white/50 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/5">
                    <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileUpload} />
                    <Paperclip size={18} />
                  
                  </label>
                  <button 
                    onClick={() => setIsSelectorActive(!isSelectorActive)}
                    className={clsx(
                      "p-2 rounded-full transition-colors",
                      isSelectorActive ? "text-blue-400 bg-blue-400/10" : "text-white/40 hover:text-white hover:bg-white/5"
                    )} 
                    title="Select Element"
                  >
                    <Crosshair size={18} />
                  </button>
                  <button 
                    onClick={() => setIsPlanActive(!isPlanActive)}
                    className={clsx(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors border",
                      isPlanActive 
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/50" 
                        : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border-white/5"
                    )}
                  >
                    <FileText size={14} />
                    <span>Plan</span>
                  </button>
               </div>
               <button 
                 onClick={send}
                 disabled={uploadedFiles.length === 0 && !input.trim()}
                 className={clsx(
                   "p-2 rounded-xl transition-all duration-200",
                   (input.trim() || uploadedFiles.length > 0) ? "bg-white text-black hover:bg-gray-200 shadow-md" : "bg-white/5 text-white/20 cursor-not-allowed"
                 )}
               >
                 <ArrowUp size={18} />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
