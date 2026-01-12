"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { MoreHorizontal, Trash2, FolderPlus } from "lucide-react";
import clsx from "clsx";

interface Project {
  id: string;
  title: string;
  thumbnail: string;
  lastViewed: string;
  icon?: string;
  type: 'project' | 'template';
}

const INITIAL_DATA: Project[] = [
  // PROJECTS (6 items)
  {
    id: "p1",
    title: "My Little Clone",
    thumbnail: "/Generated%20Image%20January%2008,%202026%20-%205_06PM.webp",
    lastViewed: "Viewed 3 hours ago",
    icon: "🎨",
    type: "project"
  },
  {
    id: "p2",
    title: "Simple Cloud Services",
    thumbnail: "/Generated%20Image%20January%2008,%202026%20-%205_06PM.webp",
    lastViewed: "Viewed 2 days ago",
    icon: "☁️",
    type: "project"
  },
  {
    id: "p3",
    title: "Rungta Landing Page",
    thumbnail: "/Generated%20Image%20January%2008,%202026%20-%205_06PM.webp",
    lastViewed: "Viewed 5 days ago",
    icon: "🏫",
    type: "project"
  },
  {
    id: "p4",
    title: "Tool Showcase",
    thumbnail: "/Generated%20Image%20January%2008,%202026%20-%205_06PM.webp",
    lastViewed: "Viewed 7 days ago",
    icon: "🛠️",
    type: "project"
  },
  {
    id: "p5",
    title: "Blackout Button",
    thumbnail: "/Generated%20Image%20January%2008,%202026%20-%205_06PM.webp",
    lastViewed: "Viewed 16 days ago",
    icon: "⚫",
    type: "project"
  },
   {
    id: "p6",
    title: "Personal Portfolio",
    thumbnail: "/Generated%20Image%20January%2008,%202026%20-%205_06PM.webp",
    lastViewed: "Viewed 18 days ago",
    icon: "👤",
    type: "project"
  },

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
  const [activeTab, setActiveTab] = useState<"recent" | "projects" | "templates">("recent");
  const [items, setItems] = useState<Project[]>(INITIAL_DATA);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setActiveMenu(null);
  };

  const filteredItems = items.filter((item) => {
    if (activeTab === "projects") return item.type === "project";
    if (activeTab === "templates") return item.type === "template";
    return true; // 'recent' shows all
  });

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 py-12 pb-24">
      {/* Header / Tabs - NO 'Browse All' button */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("recent")}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === "recent" ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
            )}
          >
            Recently viewed
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === "projects" ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
            )}
          >
            My projects
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === "templates" ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
            )}
          >
            Templates
          </button>
        </div>
      </div>

      {/* Grid */}
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
    </div>
  );
}
