"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ROLE_SKILLS } from "@/lib/roles";
import { useAuth } from "@/context/authContext";
import { useSkills } from "@/context/skillContext";
import {
  Sparkles, ChevronRight, Check, User, Code2, Loader2,
  Server, Rocket, BarChart3, Settings, Smartphone, Brain, Shield, ArrowLeft
} from "lucide-react";

const roleIcons: Record<string, React.ElementType> = {
  "Frontend Dev": Code2,
  "Backend Dev": Server,
  "Full Stack": Rocket,
  "Data Scientist": BarChart3,
  DevOps: Settings,
  "Mobile Developer": Smartphone,
  "AI Engineer": Brain,
  Cybersecurity: Shield,
};

const roleColors: Record<string, { from: string; to: string; text: string; bg: string; border: string }> = {
  "Frontend Dev":      { from: "from-pink-500",    to: "to-rose-500",    text: "text-pink-600",   bg: "bg-pink-50",    border: "border-pink-200"   },
  "Backend Dev":       { from: "from-blue-500",    to: "to-indigo-600",  text: "text-blue-600",   bg: "bg-blue-50",    border: "border-blue-200"   },
  "Full Stack":        { from: "from-purple-500",  to: "to-violet-600",  text: "text-purple-600", bg: "bg-purple-50",  border: "border-purple-200" },
  "Data Scientist":    { from: "from-amber-500",   to: "to-orange-500",  text: "text-amber-600",  bg: "bg-amber-50",   border: "border-amber-200"  },
  DevOps:              { from: "from-teal-500",    to: "to-emerald-500", text: "text-teal-600",   bg: "bg-teal-50",    border: "border-teal-200"   },
  "Mobile Developer":  { from: "from-cyan-500",    to: "to-blue-500",    text: "text-cyan-600",   bg: "bg-cyan-50",    border: "border-cyan-200"   },
  "AI Engineer":       { from: "from-violet-500",  to: "to-purple-600",  text: "text-violet-600", bg: "bg-violet-50",  border: "border-violet-200" },
  Cybersecurity:       { from: "from-red-500",     to: "to-rose-600",    text: "text-red-600",    bg: "bg-red-50",     border: "border-red-200"    },
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated, refreshProfile } = useAuth();
  const { setSkillsFromRole } = useSkills();

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles = Object.keys(ROLE_SKILLS);

  // If fully onboarded, skip onboarding
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.onboardingCompleted && user?.role) {
      router.push("/dashboard");
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Removed auto-onboarding logic that was causing unintended redirections

  const availableSkills = selectedRole ? ROLE_SKILLS[selectedRole] || [] : [];

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleContinue = async () => {
    if (!selectedRole) return;

    if (isAuthenticated) {
      // Authenticated user — save to backend, refresh auth state, then navigate
      setIsSubmitting(true);
      try {
        await setSkillsFromRole(selectedRole, selectedSkills);
        // Force fresh profile fetch to eliminate race condition:
        // updateUserLocal() is optimistic but may not settle before dashboard guard runs.
        await refreshProfile();
        router.push("/dashboard");
      } catch (err) {
        console.error("Onboarding failed:", err);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Not authenticated — save pending data and go to login
      localStorage.setItem("pendingRole", selectedRole);
      localStorage.setItem("pendingSkills", JSON.stringify(selectedSkills));
      localStorage.removeItem("isGuest");
      router.push("/login");
    }
  };

  const handleGuestContinue = () => {
    if (!selectedRole) return;
    // Clear any existing auth session, set guest mode
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.setItem("isGuest", "true");
    localStorage.setItem("role_guest", selectedRole);
    router.push("/guest-dashboard");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-pink-100">
            <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          </div>
          <p className="text-sm text-gray-400 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const activeColor = selectedRole ? roleColors[selectedRole] : roleColors["Full Stack"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/60 via-white to-purple-50/40 flex items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-100/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Logo + Title */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl overflow-hidden shadow-xl border-2 border-white">
            <Image src="/career-intelligence.png" alt="logo" width={64} height={64} className="object-contain" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {step === 1 ? "Choose your path" : "Select your skills"}
          </h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">
            {step === 1
              ? "Pick the role that best matches your career goal"
              : `Tell us what you already know in ${selectedRole}`}
          </p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-500 ${
            step >= 1 ? "bg-pink-500 text-white shadow-lg shadow-pink-200" : "bg-gray-100 text-gray-400"
          }`}>
            <span>1</span>
            <span>Role</span>
          </div>
          <div className={`h-0.5 w-10 rounded-full transition-all duration-700 ${step >= 2 ? "bg-pink-400" : "bg-gray-200"}`}></div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-500 ${
            step >= 2 ? "bg-pink-500 text-white shadow-lg shadow-pink-200" : "bg-gray-100 text-gray-400"
          }`}>
            <span>2</span>
            <span>Skills</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] border border-gray-100 shadow-[0_20px_60px_rgb(0,0,0,0.06)] overflow-hidden">
          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roles.map((role) => {
                  const Icon = roleIcons[role] || Code2;
                  const colors = roleColors[role] || roleColors["Full Stack"];
                  const isSelected = selectedRole === role;
                  const skillCount = (ROLE_SKILLS[role] || []).length;

                  return (
                    <button
                      key={role}
                      onClick={() => { setSelectedRole(role); setSelectedSkills([]); }}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-300 group relative overflow-hidden ${
                        isSelected
                          ? `${colors.border} ${colors.bg} shadow-md`
                          : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/50"
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        isSelected
                          ? `bg-gradient-to-br ${colors.from} ${colors.to} text-white shadow-lg`
                          : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                      }`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-black text-[14px] tracking-tight ${isSelected ? colors.text : "text-gray-800"}`}>
                          {role}
                        </p>
                        <p className="text-xs text-gray-400 font-medium">{skillCount} skills</p>
                      </div>
                      {isSelected && (
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center flex-shrink-0`}>
                          <Check size={11} className="text-white" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => { if (selectedRole) setStep(2); }}
                disabled={!selectedRole}
                className="w-full mt-6 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-purple-100 disabled:opacity-30 transition-all hover:shadow-2xl hover:shadow-pink-100 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
              >
                Continue <ChevronRight size={16} strokeWidth={3} />
              </button>
            </div>
          )}

          {/* Step 2: Skill Selection */}
          {step === 2 && (
            <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors group font-bold"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Change role
              </button>

              {/* Selected role badge */}
              {selectedRole && (
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest mb-6 ${
                  (roleColors[selectedRole] || roleColors["Full Stack"]).bg
                } ${(roleColors[selectedRole] || roleColors["Full Stack"]).text}`}>
                  {(() => { const Icon = roleIcons[selectedRole] || Code2; return <Icon size={14} />; })()}
                  {selectedRole}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-6">
                {availableSkills.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  const colors = selectedRole ? roleColors[selectedRole] : roleColors["Full Stack"];

                  return (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                        isSelected
                          ? `${colors.border} ${colors.bg} ${colors.text} shadow-sm`
                          : "border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {isSelected
                        ? <Check size={13} strokeWidth={3} />
                        : <div className="w-3.5 h-3.5 rounded-sm border-2 border-gray-300"></div>}
                      {skill}
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-gray-400 text-center mb-6 font-medium">
                {selectedSkills.length === 0
                  ? "Select skills you already know (optional)"
                  : `${selectedSkills.length} skill${selectedSkills.length > 1 ? "s" : ""} selected — these will be marked as completed`}
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleContinue}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-purple-100 disabled:opacity-60 transition-all hover:shadow-2xl hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Saving your roadmap...</>
                  ) : (
                    <><Sparkles size={16} /> Continue with Account</>
                  )}
                </button>

                <button
                  onClick={handleGuestContinue}
                  className="w-full py-4 border-2 border-gray-100 text-gray-500 rounded-2xl font-black text-sm hover:border-gray-200 hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <User size={16} /> Continue as Guest
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 font-medium">
          By continuing, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
