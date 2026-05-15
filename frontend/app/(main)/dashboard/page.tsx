"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

import Overview from "@/components/dashboard/Overview";
import Progress from "@/components/dashboard/Progress";
import SkillGap from "@/components/dashboard/SkillGap";
import Roadmap from "@/components/dashboard/Roadmap";

import { useAuth } from "@/context/authContext";
import { useSkills } from "@/context/skillContext";
import SkillExplorer from "@/components/skills/SkillExplorer";
import ResumeBuilder from "@/components/resume/ResumeBuilder";
import RoadmapGenerator from "@/components/ai/RoadmapGenerator";
import Insights from "@/components/dashboard/Insights";

import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [section, setSection] = useState("overview");
  const [activeSkill, setActiveSkill] = useState("");

  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { role } = useSkills();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!authLoading && user && (!user.onboardingCompleted || !user.role)) {
      router.replace("/onboarding");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    setActiveSkill("");
  }, [section]);

  // Show loading while auth is hydrating
  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fafafa]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

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
                You are currently mastering <span className="text-gray-900 font-black underline decoration-pink-500/40 decoration-4 underline-offset-4 transition-all hover:decoration-pink-500">{role || "Your Role"}</span>
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
