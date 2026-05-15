"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ROLE_SKILLS } from "@/lib/roles";
import {
  BookOpen,
  CheckCircle,
  ClipboardList,
  Lock,
  ExternalLink,
  Star,
  Sparkles,
  ArrowRight,
  Zap,
  ChevronRight,
  Play,
} from "lucide-react";
import Image from "next/image";
import { generateRoadmap } from "@/lib/gemini";

function GuestDashboard() {
  const router = useRouter();

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
    if (!savedRole) {
      router.push("/onboarding");
      return;
    }
    setRole(savedRole);
  }, [router]);

  // Calls Gemini directly — no backend route needed for guests
  const fetchRoadmap = async (skill: string) => {
    setLoading(true);
    setRoadmap(null);
    try {
      const data = await generateRoadmap(skill, role || "Professional");
      setRoadmap(data);
    } catch (err: any) {
      console.error("Error fetching guest roadmap:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-400 font-medium">
            Preparing your experience...
          </p>
        </div>
      </div>
    );
  }

  const requiredSkills = ROLE_SKILLS[role as keyof typeof ROLE_SKILLS] || [];
  const displaySteps = roadmap?.stages
    ? roadmap.stages.flatMap(
        (s: any) =>
          s.topics?.map((t: any) => ({ ...t, stage: s.level })) ||
          s.items?.map((t: any) => ({ ...t, stage: s.title })) ||
          [],
      )
    : roadmap?.steps || [];
  const totalModules = requiredSkills.length * 8;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50/30">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-100/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* ─── NAVBAR ─── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm border border-pink-100">
            <Image
              src="/career-intelligence.png"
              alt="CI"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <div>
            <p className="text-sm font-black text-gray-900 leading-none">
              Career Intelligence
            </p>
            <p className="text-[9px] font-bold text-pink-500 uppercase tracking-widest">
              Guest Mode
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push("/signup")}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-xs font-black rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
        >
          Sign Up Free <ArrowRight size={13} strokeWidth={3} />
        </button>
      </nav>

      {/* ─── HERO ─── */}
      <div className="relative z-10 text-center px-6 pt-12 pb-16">
        <div className="inline-flex items-center gap-2 bg-white border border-pink-100 shadow-sm px-4 py-2 rounded-full mb-8">
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
          <span className="text-[11px] font-black text-pink-600 uppercase tracking-widest">
            Personalized Preview for {role}
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-[1.1] mb-5">
          Master{" "}
          <span className="relative">
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              {role}
            </span>
            <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full opacity-40"></span>
          </span>
          <br />
          <span className="text-gray-400 font-black">like a Pro.</span>
        </h1>

        <p className="text-gray-500 text-base max-w-md mx-auto leading-relaxed mb-8 font-medium">
          AI-generated curriculum tailored to your goal. Join 10,000+ developers
          tracking their growth.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={() => {
              const el = document.getElementById("curriculum-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-black rounded-2xl shadow-xl shadow-pink-200 hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <Play size={14} fill="white" /> Explore Roadmap
          </button>
          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-2 px-7 py-3.5 bg-white border-2 border-gray-100 text-gray-700 text-sm font-black rounded-2xl hover:border-gray-200 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
          >
            View Full Access <ExternalLink size={13} />
          </button>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-center gap-8 mt-12">
          {[
            { val: totalModules + "+", label: "Total Modules" },
            { val: requiredSkills.length + "", label: "Core Skills" },
            { val: "AI", label: "Powered Path" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-black text-gray-900">{stat.val}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div
        id="curriculum-section"
        className="relative z-10 max-w-6xl mx-auto px-6 pb-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── LEFT: Curriculum Panel ── */}
          <div className="lg:col-span-3 space-y-5">
            {/* Header Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">
                    Curriculum Roadmap
                  </h3>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                    Preview for {role}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl">
                  <Lock size={11} strokeWidth={3} />
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    Locked
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {requiredSkills.slice(0, 6).map((skill, i) => {
                  const isActive = activeSkill === skill;
                  return (
                    <button
                      key={skill}
                      onClick={() => {
                        setActiveSkill(skill);
                        fetchRoadmap(skill);
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 group text-left ${
                        isActive
                          ? "border-pink-200 bg-pink-50/50 shadow-sm"
                          : "border-gray-100 hover:border-pink-100 hover:bg-pink-50/20"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-[12px] transition-all ${
                            isActive
                              ? "bg-pink-500 text-white shadow-lg shadow-pink-200"
                              : "bg-gray-100 text-gray-500 group-hover:bg-pink-100 group-hover:text-pink-600"
                          }`}
                        >
                          {i + 1}
                        </div>
                        <div>
                          <span
                            className={`font-black text-sm block ${isActive ? "text-pink-700" : "text-gray-800"}`}
                          >
                            {skill}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            8 modules
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        size={14}
                        className={`transition-all ${isActive ? "text-pink-400 translate-x-1" : "text-gray-300 group-hover:text-gray-400"}`}
                        strokeWidth={3}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Roadmap Preview Card */}
            {activeSkill && (
              <div className="bg-white rounded-3xl border border-purple-100 shadow-sm p-7 animate-in fade-in slide-in-from-top-3 duration-400">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-sm">
                      {activeSkill} — Preview
                    </h4>
                    <p className="text-[10px] text-purple-500 font-bold uppercase tracking-widest">
                      AI Generated Path
                    </p>
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 animate-pulse"
                      >
                        <div className="w-9 h-9 bg-gray-200 rounded-xl flex-shrink-0"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-gray-200 rounded-full w-2/3"></div>
                          <div className="h-2 bg-gray-100 rounded-full w-full"></div>
                        </div>
                      </div>
                    ))}
                    <p className="text-center text-xs text-gray-400 font-medium pt-2">
                      Generating your roadmap...
                    </p>
                  </div>
                ) : displaySteps.length > 0 ? (
                  <div className="space-y-3">
                    {displaySteps.slice(0, 4).map((step: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-4 rounded-2xl bg-purple-50/40 border border-purple-50"
                      >
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 flex-shrink-0 text-xs font-black">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-gray-900 text-sm leading-tight">
                            {step.name || step.title}
                          </p>
                          <p className="text-[11px] text-gray-400 font-medium mt-0.5 line-clamp-1">
                            {step.description ||
                              (step.subtopics
                                ? step.subtopics.slice(0, 2).join(", ")
                                : "")}
                          </p>
                        </div>
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Lock size={9} className="text-gray-400" />
                        </div>
                      </div>
                    ))}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 text-center">
                      <p className="text-xs text-gray-500 font-medium mb-2">
                        +{Math.max(0, displaySteps.length - 4)} more topics
                        locked
                      </p>
                      <button
                        onClick={() => router.push("/login")}
                        className="text-xs font-black text-pink-600 hover:text-pink-700 flex items-center gap-1 mx-auto"
                      >
                        Unlock Full Roadmap{" "}
                        <ArrowRight size={12} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm text-center py-4 font-medium">
                    No preview available
                  </p>
                )}
              </div>
            )}

            {/* CTA Banner */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-7 shadow-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-white font-black text-lg tracking-tight leading-tight">
                    Unlock all {totalModules} modules.
                  </p>
                  <p className="text-gray-400 text-xs font-medium mt-1">
                    Track progress, get AI feedback, earn certificates.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/login")}
                  className="flex-shrink-0 px-5 py-3 bg-white text-gray-900 font-black text-xs rounded-2xl hover:bg-gray-100 transition-all active:scale-95 flex items-center gap-2 shadow-lg"
                >
                  Get Started <ArrowRight size={13} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* AI Tutor Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-50 to-pink-50 rounded-bl-[4rem] -z-0"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-200 mb-5">
                  <Sparkles size={22} />
                </div>
                <h3 className="text-base font-black text-gray-900 tracking-tight mb-2">
                  AI-Powered Tutor
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-5">
                  Real-time feedback, concept breakdowns, and project ideas
                  tailored to your skill level.
                </p>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 w-fit">
                  <Lock size={11} className="text-gray-400" strokeWidth={3} />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Premium Only
                  </span>
                </div>
              </div>
            </div>

            {/* Feature Cards Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center group hover:border-pink-100 transition-all">
                <div className="w-11 h-11 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500 mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <CheckCircle size={20} />
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                  Verified
                </p>
                <p className="text-sm font-black text-gray-900">Certificates</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center group hover:border-purple-100 transition-all">
                <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500 mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <ClipboardList size={20} />
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                  Social
                </p>
                <p className="text-sm font-black text-gray-900">Community</p>
              </div>
            </div>

            {/* Progress Teaser */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                  <Zap size={18} />
                </div>
                <div>
                  <p className="font-black text-sm text-gray-900">
                    Your Progress
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Sign up to track
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {requiredSkills.slice(0, 3).map((skill, i) => (
                  <div key={skill} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-gray-600">{skill}</span>
                      <span className="font-black text-gray-400">Locked</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-pink-300 to-purple-300 rounded-full w-0 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => router.push("/login")}
                className="w-full mt-5 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-xs rounded-2xl shadow-lg shadow-pink-100 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Star size={14} /> Unlock Full Access
              </button>
            </div>

            {/* Social Proof */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl border border-pink-100 p-6 text-center">
              <p className="text-3xl font-black text-gray-900 mb-1">10,000+</p>
              <p className="text-xs text-gray-500 font-medium">
                developers already on their path
              </p>
              <div className="flex -space-x-2 justify-center mt-4">
                {["#f9a8d4", "#c084fc", "#93c5fd", "#6ee7b7", "#fcd34d"].map(
                  (color, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: color }}
                    ></div>
                  ),
                )}
                <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm bg-gray-100 flex items-center justify-center">
                  <span className="text-[8px] font-black text-gray-500">
                    +k
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuestDashboard;
