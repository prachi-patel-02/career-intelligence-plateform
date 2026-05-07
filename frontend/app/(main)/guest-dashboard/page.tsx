"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ROLE_SKILLS } from "@/lib/roles";
import {
  BookOpen,
  CheckCircle,
  XCircle,
  ClipboardList,
  Eye,
  Lock,
  ExternalLink,
  Star,
  LogIn,
} from "lucide-react";
import Image from "next/image";
import { useSkills } from "@/context/skillContext";

function GuestDashboard() {
  const router = useRouter();
  const { role: contextRole } = useSkills();

  const [role, setRole] = useState("");
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const isGuest = localStorage.getItem("isGuest");

    if (token) {
      router.push("/dashboard");
      return;
    }
    if (isGuest !== "true") {
      router.push("/login");
      return;
    }

    const savedRole = localStorage.getItem("role_guest");
    console.log("role_guest:", savedRole);
    console.log("isGuest:", localStorage.getItem("isGuest"));

    if (!savedRole) {
      router.push("/onboarding");
      return;
    }

    setRole(savedRole);
  }, [router]);

  const fetchRoadmap = async (skill: string) => {
    setLoading(true);
    setRoadmap(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/ai-roadmap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, skill }),
        signal: controller.signal,
      });

      const data = await res.json();
      console.log("🔓 Guest Roadmap Data:", data);
      setRoadmap(data.roadmap);
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.error("Roadmap request timed out (8s)");
      } else {
        console.error("Error fetching roadmap:", err);
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-pink-50/30 flex items-center justify-center">
        <div className="animate-pulse text-gray-400 font-medium">
          Loading...
        </div>
      </div>
    );
  }

  const requiredSkills = ROLE_SKILLS[role as keyof typeof ROLE_SKILLS] || [];

  // Flatten stages for guest preview
  const displaySteps = roadmap?.stages
    ? roadmap.stages.flatMap((s: any) =>
        s.topics.map((t: any) => ({ ...t, stage: s.level })),
      )
    : roadmap?.steps || [];

  const totalModules = requiredSkills.length * 8;

  return (
    <div className="min-h-screen bg-pink-50/30">
      {/* ─── HEADER / LOGO ─── */}
      <div className="flex flex-col items-center pt-10 pb-4">
        <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md mb-3">
          <Image
            src="/career-intelligence.png"
            alt="Career Intelligence"
            width={56}
            height={56}
            className="object-contain"
          />
        </div>
        <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">
          Career Intelligence
        </h2>
        <p className="text-[10px] font-bold text-pink-500 uppercase tracking-[0.2em] mt-0.5">
          Guest Experience
        </p>
      </div>

      {/* ─── HERO SECTION ─── */}
      <div className="text-center px-6 pb-10">
        <div className="inline-flex items-center gap-2 bg-pink-100/60 px-4 py-1.5 rounded-full mb-6">
          <span className="text-sm">🎯</span>
          <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider">
            Previewing your personalized journey
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-4">
          Master{" "}
          <span className="bg-linear-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            {role}
          </span>
          <br />
          Expertly.
        </h1>

        <p className="text-gray-500 text-sm max-w-lg mx-auto leading-relaxed mb-8">
          We&apos;ve analyzed your goals and built this custom roadmap. Join
          10,000+ builders tracking their growth in real-time.
        </p>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => {
              const el = document.getElementById("curriculum-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-6 py-3 bg-linear-to-r from-gray-900 to-gray-800 text-white text-sm font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            Start Learning Now <ExternalLink size={14} />
          </button>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 border-2 border-gray-200 text-gray-600 text-sm font-bold rounded-full hover:border-gray-400 transition-all"
          >
            View All Features
          </button>
        </div>
      </div>

      {/* ─── MAIN CONTENT — 2 COLUMN GRID ─── */}
      <div id="curriculum-section" className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── LEFT: Curriculum Roadmap (3 cols) ── */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                  Curriculum Roadmap
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                  Locked preview for {role}
                </p>
              </div>
              <span className="px-3 py-1 bg-pink-50 text-pink-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-pink-100">
                Action Required
              </span>
            </div>

            {/* Skills List */}
            <div className="space-y-3">
              {requiredSkills.slice(0, 5).map((skill) => (
                <button
                  key={skill}
                  onClick={() => {
                    setActiveSkill(skill);
                    fetchRoadmap(skill);
                  }}
                  className="w-full flex items-center justify-between p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-pink-200 hover:bg-pink-50/30 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-pink-400 group-hover:text-pink-600 group-hover:border-pink-200 transition-colors shadow-sm">
                      <Lock size={16} />
                    </div>
                    <span className="font-bold text-gray-800 text-sm">
                      {skill}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-gray-400">
                    8 modules
                  </span>
                </button>
              ))}
            </div>

            {/* Roadmap Preview (when a skill is clicked) */}
            {activeSkill && (
              <div className="mt-6 p-5 bg-purple-50/50 rounded-2xl border border-purple-100 animate-in fade-in slide-in-from-top-2 duration-300">
                <h4 className="font-bold text-purple-800 text-sm mb-3 flex items-center gap-2">
                  <BookOpen size={16} />
                  {activeSkill} — Preview
                </h4>
                {loading ? (
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                    Generating roadmap preview...
                  </div>
                ) : (
                  <div className="space-y-2">
                    {displaySteps.length > 0 ? (
                      displaySteps.slice(0, 2).map((step: any, i: number) => (
                        <div
                          key={i}
                          className="p-3 bg-white rounded-xl border border-purple-100"
                        >
                          <p className="font-bold text-purple-700 text-sm">
                            {step.stage || "Stage"}: {step.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {step.description ||
                              (step.subtopics
                                ? step.subtopics.slice(0, 3).join(", ")
                                : "")}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm italic">
                        No roadmap available
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Bottom CTA */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-3">
                Unlock all {totalModules} modules and start tracking your
                progress today.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="text-sm font-black text-transparent bg-linear-to-r from-pink-500 to-purple-600 bg-clip-text uppercase tracking-wider flex items-center gap-1 hover:gap-2 transition-all"
              >
                Reveal Entire Roadmap{" "}
                <ExternalLink size={14} className="text-pink-500" />
              </button>
            </div>
          </div>

          {/* ── RIGHT COLUMN (2 cols) ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI-Powered Tutor */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="w-12 h-12 bg-linear-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-200 mb-5">
                <Star size={22} />
              </div>
              <h3 className="text-lg font-extrabold text-gray-900 tracking-tight mb-2">
                AI-Powered Tutor
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Get real-time feedback, concept breakdowns, and project ideas
                tailored to your skill level.
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                <Lock size={12} className="text-gray-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Premium Access Only
                </span>
              </div>
            </div>

            {/* Small Cards: Certificates + Community */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500 mx-auto mb-3">
                  <CheckCircle size={20} />
                </div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  Verified
                </p>
                <p className="text-sm font-extrabold text-gray-900">
                  Certificates
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500 mx-auto mb-3">
                  <ClipboardList size={20} />
                </div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  Social
                </p>
                <p className="text-sm font-extrabold text-gray-900">
                  Community
                </p>
              </div>
            </div>

            {/* Final Dark CTA */}
            <div className="bg-linear-to-br from-gray-900 to-gray-800 rounded-3xl p-7 text-white shadow-xl">
              <h3 className="text-xl font-extrabold tracking-tight mb-2">
                Start your journey today.
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-5">
                Save your progress, unlock all roadmap modules, and access your
                personal AI Tutor.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="w-full py-3 bg-white text-gray-900 font-bold text-sm rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
              >
                Create Free Account <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuestDashboard;
