"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

import Overview from "@/components/dashboard/Overview";
import Progress from "@/components/dashboard/Progress";
import RadarChartComponent from "@/components/dashboard/RadarChart";
import SkillGap from "@/components/dashboard/SkillGap";
import Roadmap from "@/components/dashboard/Roadmap";
import StreakCard from "@/components/dashboard/StreakCard";

import { useSkills } from "@/context/skillContext";
import SkillExplorer from "@/components/skills/SkillExplorer";
import ResumeBuilder from "@/components/resume/ResumeBuilder";
import RoadmapGenerator from "@/components/ai/RoadmapGenerator";
import Insights from "@/components/dashboard/Insights";

export default function DashboardPage() {
  const [section, setSection] = useState("overview");
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState("");
  const [activeSkill, setActiveSkill] = useState("");

  const router = useRouter();

  const { role: contextRole, onboardingComplete: contextOnboarded } = useSkills();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    
    setUser(storedUser);
    setRole(contextRole);
    setLoading(false);
  }, [router, contextOnboarded, contextRole]);

  useEffect(() => {
    setActiveSkill("");
  }, [section]);

  if (loading) return null;

  return (
    <div className="flex bg-[#fafafa] min-h-screen">
      <Sidebar activeSection={section} onNavigate={setSection} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header currentSection={section} user={user} role={role} />

        <div className="p-6 space-y-6">
          {/* Welcome Section */}
          {section !== "insights" && (
            <div className="mb-8 animate-in fade-in slide-in-from-left-4 duration-700">
              <p className="text-[11px] font-black text-pink-500 uppercase tracking-[0.3em] mb-2">Personal Workspace</p>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-none">
                Welcome back, {user?.name?.split(' ')[0] || "User"}!
              </h2>
              <p className="text-gray-500 text-sm mt-3 font-medium">
                You are currently mastering <span className="text-gray-900 font-black underline decoration-pink-500/40 decoration-4 underline-offset-4 transition-all hover:decoration-pink-500">{role || user?.role || "Your Role"}</span>
              </p>
            </div>
          )}

          {/* Sections */}
          {section === "overview" && <Overview onNavigate={setSection} />}
          {section === "insights" && <Insights />}

          {section === "progress" && <Progress onNavigate={setSection} />}

          {section === "ai-roadmap" && <RoadmapGenerator />}

          {section === "resume" && <ResumeBuilder user={user} role={role} />}

          {section === "skill-gap" && (
            <>
              <SkillGap onSkillClick={setActiveSkill} onNavigate={setSection} />
              {activeSkill && <Roadmap activeSkill={activeSkill} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
