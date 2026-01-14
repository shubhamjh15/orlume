"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { MoreHorizontal, Trash2, FolderPlus } from "lucide-react";
import clsx from "clsx";

import { createClient } from "@/utils/supabase/client";

interface Project {
  id: string;
  title: string;
  thumbnail: string;
  lastViewed: string;
  icon?: string;
  type: 'project' | 'template';
}

const INITIAL_DATA: Project[] = [
  // PROJECTS (Dummy items removed from initial state, fetched at runtime)
  // TEMPLATES (6 items)
  {
    id: "t1",
    title: "SaaS Starter Kit",
    thumbnail: "/Generated%20Image%20January%2008,%202026%20-%205_06PM.webp",
    lastViewed: "Popular",
    icon: "🚀",
    type: "template"
  },
  {
    id: "t2",
    title: "E-Commerce Store",
    thumbnail: "/Generated%20Image%20January%2008,%202026%20-%205_06PM.webp",
    lastViewed: "New",
    icon: "🛍️",
    type: "template"
  },
  {
    id: "t3",
    title: "Blog Template",
    thumbnail: "/Generated%20Image%20January%2008,%202026%20-%205_06PM.webp",
    lastViewed: "Trending",
    icon: "📝",
    type: "template"
  },
  {
    id: "t4",
    title: "Agency Landing",
    thumbnail: "/Generated%20Image%20January%2008,%202026%20-%205_06PM.webp",
    lastViewed: "Popular",
    icon: "🏢",
    type: "template"
  },
  {
    id: "t5",
    title: "Dashboard UI",
    thumbnail: "/Generated%20Image%20January%2008,%202026%20-%205_06PM.webp",
    lastViewed: "Premium",
    icon: "📊",
    type: "template"
  },
  {
    id: "t6",
    title: "Mobile App Landing",
    thumbnail: "/Generated%20Image%20January%2008,%202026%20-%205_06PM.webp",
    lastViewed: "New",
    icon: "📱",
    type: "template"
  }
];

export default function ProjectGrid() {
  const [activeTab, setActiveTab] = useState<"projects" | "templates">("projects");
  const [items, setItems] = useState<Project[]>(INITIAL_DATA);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      // Only fetch if "projects" tab is active
      if (activeTab !== "projects") return; 

      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }

      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://6a68a84ec602.ngrok-free.app";
      const API_PREFIX = "/api/v1";

      try {
        const res = await fetch(`${BACKEND_URL}${API_PREFIX}/projects/list?page=1&page_size=50`, {
           headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'ngrok-skip-browser-warning': 'true'
           }
        });

        if (!res.ok) {
           console.error("Failed to fetch projects:", await res.text());
           setLoading(false);
           return;
        }

        const data = await res.json();
        
        // ProjectListResponse structure: { items: [], total: int, page: int, size: int }
        const projectList = data.items || [];

        const mappedProjects: Project[] = projectList.map((p: any) => ({
          id: p.id,
          title: p.project_name || p.name || "Untitled Project", 
          thumbnail: "/Generated%20Image%20January%2008,%202026%20-%205_06PM.webp", // Todo: Add thumbnail field to API
          lastViewed: p.updated_at 
             ? `Updated ${new Date(p.updated_at).toLocaleDateString()}` 
             : `Created ${new Date(p.created_at).toLocaleDateString()}`,
          icon: "📦", // Todo: Add icon field to API
          type: 'project'
        }));

        setItems((prev) => {
           // Keep templates, replace projects
           const templates = prev.filter(i => i.type === 'template');
           return [...mappedProjects, ...templates];
        });

      } catch (err) {
          console.error("Error fetching projects:", err);
      } finally {
          setLoading(false);
      }
    };

    fetchProjects();
  }, [activeTab]);

  const handleDelete = async (id: string) => {
    // Optimistic update
    setItems((prev) => prev.filter((item) => item.id !== id));
    setActiveMenu(null);
    
    // Delete from DB if it's a real project
    if (items.find(i => i.id === id)?.type === 'project') {
       await supabase.from('projects').delete().eq('id', id);
    }
  };

  const filteredItems = items.filter((item) => {
    if (activeTab === "projects") return item.type === "project";
    if (activeTab === "templates") return item.type === "template";
    return false;
  });

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 py-12 pb-24">
      {/* Header / Tabs - NO 'Browse All' button */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("projects")}
            className={clsx(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer",
              activeTab === "projects" ? "bg-[#1a1a1a] text-white" : "text-[#888] hover:text-white"
            )}
          >
            {activeTab === "projects" && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
            My Projects
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={clsx(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ml-2",
              activeTab === "templates" ? "bg-[#1a1a1a] text-white" : "text-[#888] hover:text-white"
            )}
          >
             {activeTab === "templates" && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
            Templates
          </button>
        </div>
      </div>

      {/* Grid */}
      {/* Grid */}
      <div className="min-h-[50vh]">
        {filteredItems.length === 0 ? (
          <div className="h-[50vh] flex flex-col items-center justify-center text-white/20">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <FolderPlus size={32} />
            </div>
            <p className="text-lg font-medium">No {activeTab} found</p>
            <p className="text-sm">Create a new {activeTab === 'projects' ? 'project' : 'template'} to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((project) => (
              <div key={project.id} className="group relative flex flex-col gap-3">
                {/* Thumbnail Card */}
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/5 group-hover:border-white/20 transition-all shadow-lg group-hover:shadow-2xl group-hover:translate-y-[-2px]">
                  <Image
                    src={project.thumbnail}
                    alt={project.title}
                    fill
                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Info */}
                <div className="flex items-start justify-between px-1 relative">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-sm border border-orange-500/10">
                      {project.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-xs text-white/40 mt-0.5">{project.lastViewed}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(activeMenu === project.id ? null : project.id);
                    }}
                    className={clsx(
                       "text-white/20 hover:text-white transition-colors relative z-20",
                       activeMenu === project.id && "text-white"
                    )}
                  >
                    <MoreHorizontal size={16} />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenu === project.id && (
                    <div 
                       ref={menuRef}
                       className="absolute right-0 top-8 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl z-30 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                    >
                       <div className="p-1">
                          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left">
                            <FolderPlus size={14} />
                            Add to folder
                          </button>
                          <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(project.id);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                          >
                            <Trash2 size={14} />
                            Delete project
                          </button>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
