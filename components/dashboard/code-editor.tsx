
"use client";

import Editor, { OnMount } from "@monaco-editor/react";
import { useRef, useState } from "react";
import { Loader2, File, Folder, ChevronRight, ChevronDown, Copy, Download, FileJson, FileType, FileCode, Check } from "lucide-react";
import clsx from "clsx";

interface CodeEditorProps {
  code: string;
  onChange?: (value: string | undefined) => void;
  language?: string;
  readOnly?: boolean;
}

const FILES = [
  { name: "app", type: "folder", isOpen: true, children: [
    { name: "globals.css", type: "file", icon: FileType },
    { name: "layout.tsx", type: "file", icon: FileCode },
    { name: "page.tsx", type: "file", icon: FileCode, active: true },
  ]},
  { name: "components", type: "folder", isOpen: false, children: [
    { name: "button.tsx", type: "file", icon: FileCode },
    { name: "input.tsx", type: "file", icon: FileCode },
  ]},
  { name: ".eslintrc.json", type: "file", icon: FileJson },
  { name: "next.config.js", type: "file", icon: FileJson },
  { name: "package.json", type: "file", icon: FileJson },
  { name: "tsconfig.json", type: "file", icon: FileJson },
];

export default function CodeEditor({ 
  code, 
  onChange, 
  language = "typescript",
  readOnly = false 
}: CodeEditorProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);
  const [copied, setCopied] = useState(false);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "page.tsx"; // Default to page.tsx for now
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const FolderItem = ({ item, depth = 0 }: { item: any, depth?: number }) => {
    const [isOpen, setIsOpen] = useState(item.isOpen);
    
    if (item.type === "folder") {
      return (
        <div>
          <div 
            className="flex items-center gap-1.5 py-1 px-2 text-white/60 hover:text-white hover:bg-white/5 cursor-pointer select-none text-xs transition-colors"
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <Folder size={14} className="text-yellow-500 fill-yellow-500/20" />
            <span>{item.name}</span>
          </div>
          {isOpen && item.children?.map((child: any, i: number) => (
            <FolderItem key={i} item={child} depth={depth + 1} />
          ))}
        </div>
      );
    }

    const Icon = item.icon || File;
    return (
      <div 
        className={clsx(
          "flex items-center gap-2 py-1 px-2 cursor-pointer text-xs transition-colors border-l-2",
          item.active 
            ? "border-blue-500 bg-[#1e1e1e] text-white" 
            : "border-transparent text-white/50 hover:text-white hover:bg-white/5"
        )}
        style={{ paddingLeft: `${depth * 12 + 20}px` }}
      >
        <Icon size={14} className={item.name.endsWith('css') ? "text-blue-400" : item.name.endsWith('json') ? "text-yellow-400" : "text-blue-500"} />
        <span>{item.name}</span>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex bg-[#0a0a0a]">
      {/* File Explorer */}
      <div className="w-64 flex-shrink-0 border-r border-white/10 flex flex-col bg-[#0a0a0a]">
        <div className="p-3 text-xs font-bold text-white/40 uppercase tracking-wider">
          Files
        </div>
        <div className="flex-1 overflow-y-auto">
          {FILES.map((item, i) => (
            <FolderItem key={i} item={item} />
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
        {/* Editor Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-black/20">
           <span className="text-sm text-white/80 font-mono">app/page.tsx</span>
           <div className="flex items-center gap-2">
             <button 
               onClick={handleCopy}
               className="p-1.5 text-white/40 hover:text-white transition-colors" 
               title="Copy code"
             >
               {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
             </button>
             <button 
               onClick={handleDownload}
               className="p-1.5 text-white/40 hover:text-white transition-colors" 
               title="Download"
             >
               <Download size={14} />
             </button>
           </div>
        </div>
        
        {/* Editor */}
        <div className="flex-1 relative group">
          <Editor
            height="100%"
            defaultLanguage={language}
            language={language}
            value={code}
            onChange={onChange}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              readOnly,
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "Geist Mono, monospace",
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              padding: { top: 16, bottom: 16 },
              roundedSelection: false,
              automaticLayout: true,
              scrollbar: {
                vertical: "visible",
                horizontal: "visible",
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
              },
            }}
            loading={
              <div className="flex items-center justify-center gap-2 text-white/50">
                <Loader2 className="animate-spin" size={20} />
                <span>Loading editor...</span>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
