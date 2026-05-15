"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/context/authContext";

type HeaderProps = {
  currentSection: string;
  user?: { name?: string; role?: string };
  role?: string;
};

const SECTION_LABELS: Record<string, string> = {
  overview:         "Overview",
  "skill-explorer": "Skill Explorer",
  "ai-roadmap":     "AI Roadmap",
  progress:         "Progress Tracker",
  "radar-chart":    "Skill Radar",
  streak:           "Streak",
  "skill-gap":      "Skill Gap",
  insights:         "Insights",
  resume:           "Resume Builder",
};

export default function Header({ currentSection, user, role }: HeaderProps) {
  const { logout } = useAuth();

  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  const handleLogout = () => {
    logout();
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <header className="flex justify-between items-center px-8 py-4 bg-white/80 backdrop-blur-md border-b border-pink-100/40 sticky top-0 z-30 shadow-sm">
      {/* LEFT — section title */}
      <div className="flex flex-col">
        <h1 className="text-xl font-display font-extrabold text-gray-900 tracking-tight leading-none mb-1">
          {SECTION_LABELS[currentSection] || currentSection}
        </h1>
        <p className="text-[10px] font-sans font-bold text-pink-500 uppercase tracking-[0.15em] opacity-80">{date}</p>
      </div>

      {/* RIGHT — profile + notifications + logout */}
      <div className="flex items-center gap-5">


        {/* Profile Card */}
        <div className="flex items-center gap-3 bg-gray-50/50 pl-2 pr-4 py-1.5 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all duration-300 cursor-pointer group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center font-bold text-[10px] shadow-lg shadow-pink-100 group-hover:scale-105 transition-transform">
            {initials}
          </div>

          <div className="hidden sm:block">
            <p className="text-xs font-bold text-gray-900 leading-tight">
              {user?.name || "User"}
            </p>
            <p className="text-[9px] font-bold text-pink-500 uppercase tracking-wider mt-0.5 opacity-80">
              {role || user?.role || "No Role"}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-pink-100/60 hidden md:block" />

        {/* Logout */}
        <button
          id="header-logout"
          onClick={handleLogout}
          className="flex items-center gap-2 text-[11px] font-bold text-gray-400 hover:text-red-500 transition-all px-3 py-2 rounded-xl hover:bg-red-50"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
