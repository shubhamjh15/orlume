"use client";

import Editor, { OnMount } from "@monaco-editor/react";
import { useRef, useState, useMemo } from "react";
import { Loader2, File, Folder, ChevronRight, ChevronDown, Copy, Download, FileJson, FileType, FileCode, Check } from "lucide-react";
import clsx from "clsx";

interface CodeEditorProps {
  activeFile: string;
  filesContent: { [key: string]: string };
  onFileSelect: (path: string) => void;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

// --- Helper: Build Tree from Flat Paths ---
type FileTreeItem = {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileTreeItem[];
};

const buildFileTree = (files: string[]) => {
  const root: FileTreeItem[] = [];

  files.forEach(path => {
    const parts = path.split('/');
    let currentLevel = root;
    let currentPath = "";

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const existingNode = currentLevel.find(node => node.name === part);

      if (existingNode) {
        if (existingNode.type === "folder") {
            currentLevel = existingNode.children!;
        }
      } else {
        const isFile = index === parts.length - 1;
        const newNode: FileTreeItem = {
          name: part,
          path: currentPath,
          type: isFile ? "file" : "folder",
          children: isFile ? undefined : []
        };
        currentLevel.push(newNode);
        if (!isFile) currentLevel = newNode.children!;
      }
    });
  });

  // Sort: Folders first, then files, alphabetical
  const sortTree = (nodes: FileTreeItem[]) => {
    nodes.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === "folder" ? -1 : 1;
    });
    nodes.forEach(node => {
      if (node.children) sortTree(node.children);
    });
  };

  sortTree(root);
  return root;
};

export default function CodeEditor({ 
  activeFile, 
  filesContent,
  onFileSelect,
  onChange,
  readOnly = false 
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const [copied, setCopied] = useState(false);

  // Derive Tree Structure
  const fileTree = useMemo(() => {
     return buildFileTree(Object.keys(filesContent));
  }, [filesContent]);

  const activeCode = filesContent[activeFile] || "// Select a file to view code";

  const getLanguage = (filename: string) => {
    if (filename.endsWith(".tsx") || filename.endsWith(".ts")) return "typescript";
    if (filename.endsWith(".jsx") || filename.endsWith(".js")) return "javascript";
    if (filename.endsWith(".css")) return "css";
    if (filename.endsWith(".json")) return "json";
    if (filename.endsWith(".html")) return "html";
    return "plaintext";
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Recursive Tree Component
  const TreeItem = ({ item, depth = 0 }: { item: FileTreeItem, depth?: number }) => {
    const [isOpen, setIsOpen] = useState(true); // Default open for now
    
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
          {isOpen && item.children?.map((child) => (
            <TreeItem key={child.path} item={child} depth={depth + 1} />
          ))}
        </div>
      );
    }

    // File Icon Logic
    let Icon = File;
    let colorClass = "text-blue-500";
    if (item.name.endsWith('css')) { Icon = FileType; colorClass = "text-blue-400"; }
    else if (item.name.endsWith('json')) { Icon = FileJson; colorClass = "text-yellow-400"; }
    else if (item.name.endsWith('tsx') || item.name.endsWith('ts')) { Icon = FileCode; colorClass = "text-blue-500"; }

    return (
      <div 
        onClick={() => onFileSelect(item.path)}
        className={clsx(
          "flex items-center gap-2 py-1 px-2 cursor-pointer text-xs transition-colors border-l-2",
          activeFile === item.path
            ? "border-blue-500 bg-[#1e1e1e] text-white" 
            : "border-transparent text-white/50 hover:text-white hover:bg-white/5"
        )}
        style={{ paddingLeft: `${depth * 12 + 20}px` }}
      >
        <Icon size={14} className={colorClass} />
        <span>{item.name}</span>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex bg-[#0a0a0a]">
      {/* File Explorer */}
      <div className="w-64 flex-shrink-0 border-r border-white/10 flex flex-col bg-[#0a0a0a]">
        <div className="p-3 text-xs font-bold text-white/40 uppercase tracking-wider">
          Explorer
        </div>
        <div className="flex-1 overflow-y-auto">
          {fileTree.length === 0 ? (
             <div className="p-4 text-xs text-white/30 text-center">Loading files...</div>
          ) : (
             fileTree.map((item) => <TreeItem key={item.path} item={item} />)
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
        <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-black/20">
           <span className="text-sm text-white/80 font-mono">{activeFile}</span>
           <div className="flex items-center gap-2">
             <button onClick={handleCopy} className="p-1.5 text-white/40 hover:text-white transition-colors" title="Copy code">
               {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
             </button>
           </div>
        </div>
        
        <div className="flex-1 relative group">
          <Editor
            height="100%"
            path={activeFile} // Helper for Monaco to manage models
            language={getLanguage(activeFile)}
            value={activeCode}
            onChange={(val) => onChange(val || "")}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              readOnly,
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "Geist Mono, monospace",
              scrollBeyondLastLine: false,
              padding: { top: 16, bottom: 16 },
              automaticLayout: true,
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