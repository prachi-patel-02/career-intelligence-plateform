"use client";

import React from "react";
import {
  LayoutDashboard,
  LineChart,
  Target,
  Trophy,
  FileText,
  Search,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Image from "next/image";

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onNavigate }) => {
  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "progress", label: "My Progress", icon: LineChart },
    { id: "ai-roadmap", label: "AI Roadmap", icon: Sparkles },
    { id: "skill-gap", label: "Skill Gap", icon: Target },
    { id: "insights", label: "Insights", icon: Trophy },
    { id: "resume", label: "Resume Builder", icon: FileText },
  ];

  return (
    <div className="w-72 bg-white border-r border-pink-100/60 flex flex-col h-screen sticky top-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.01)]">
      {/* Premium Logo Section */}
      <div className="p-8 mb-2">
        <div className="flex items-center gap-4 group cursor-pointer outline-none">
          <div className="relative p-2.5 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm transition-all duration-200">
            <Image 
              src="/career-intelligence.png" 
              alt="Career Intelligence" 
              width={34} 
              height={34} 
              className="rounded-lg object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-gray-900 text-xl leading-none tracking-tight">Career</span>
            <span className="font-sans font-bold text-pink-500 text-[10px] leading-none tracking-[0.2em] uppercase mt-1.5 opacity-80">Intelligence</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 mt-2">Main Menu</p>
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group relative outline-none border-none ${
                isActive
                  ? "bg-pink-50 text-pink-600 shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              {/* Background Glow for Active */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-pink-50/50 to-transparent pointer-events-none" />
              )}

              <div className="flex items-center gap-4 relative z-10">
                <div className={`p-2 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? "bg-pink-500 text-white shadow-sm" 
                    : "bg-gray-50 text-gray-400 group-hover:text-pink-500"
                }`}>
                  <Icon size={18} strokeWidth={2.5} />
                </div>
                <span className={`font-bold text-sm tracking-tight transition-all duration-200 ${
                  isActive ? "text-pink-600" : "text-gray-500"
                }`}>
                  {item.label}
                </span>
              </div>

              <div className="relative z-10">
                  <ChevronRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-all" />

              </div>

              {/* Stable Left Indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-pink-500 rounded-r-full" />
              )}
            </button>
          );
        })}
      </nav>


    </div>
  );
};

export default Sidebar;
