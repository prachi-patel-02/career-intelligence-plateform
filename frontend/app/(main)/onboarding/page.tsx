"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ROLE_SKILLS } from "@/lib/roles";
import {
  Code,
  Server,
  Rocket,
  BarChart3,
  Settings,
  Circle,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Brain,
  Shield,
} from "lucide-react";

import { useSkills } from "@/context/skillContext";

export default function Onboarding() {
  const router = useRouter();
  const { setSkillsFromRole, completeOnboarding } = useSkills();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [error, setError] = useState("");

  const allRoles = Object.keys(ROLE_SKILLS);

  const roleIcons: Record<string, React.ElementType> = {
    "Frontend Dev": Code,
    "Backend Dev": Server,
    "Full Stack": Rocket,
    "Data Scientist": BarChart3,
    DevOps: Settings,
    "Mobile Developer": Smartphone,
    "AI Engineer": Brain,
    "Cybersecurity": Shield,
  };

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  const handleContinueWithAccount = () => {
    if (!role || skills.length === 0) {
      setError("Please select a role and at least one skill");
      return;
    }
    setError("");
    setLoading(true);

    // Save for after login
    localStorage.setItem("pendingRole", role);
    localStorage.setItem("pendingSkills", JSON.stringify(skills));
    localStorage.removeItem("isGuest");

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleGuest = () => {
    if (!role || skills.length === 0) {
      setError("Please select a role and at least one skill");
      return;
    }
    setError("");
    setLoading(true);

    // Clear any existing session data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("guest_role");
    localStorage.removeItem("role_guest");

    // Set new guest data (ALWAYS overwrite)
    console.log("Setting guest role:", role);
    localStorage.setItem("isGuest", "true");
    localStorage.setItem("role_guest", role);
    
    // Sync with SkillContext
    setSkillsFromRole(role, skills);
    completeOnboarding();
    
    // Immediate navigation
    router.push("/guest-dashboard");
  };

  const skillsForRole = role ? ROLE_SKILLS[role as keyof typeof ROLE_SKILLS] || [] : [];

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center px-4">
      {/* HEADER */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto mb-4 rounded-xl overflow-hidden shadow-sm">
          <Image
            src="/career-intelligence.png"
            alt="logo"
            width={56}
            height={56}
          />
        </div>
        <h1 className="text-2xl font-bold text-pink-800 tracking-tight">
          Career Intelligence
        </h1>
        <p className="text-sm mt-2 text-gray-600 max-w-xs mx-auto">
          Your personal learning dashboard. Let's get you set up.
        </p>
      </div>

      <div className="w-full max-w-3xl bg-white p-8 rounded-3xl border-2 border-pink-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {/* Step Indicator */}
        <div className="flex justify-center items-center gap-4 mb-10">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
              step === 1 ? "bg-purple-600 text-white shadow-lg shadow-purple-200 scale-110" : "bg-gray-100 text-gray-400"
            }`}
          >
            1
          </div>
          <div className="w-16 h-0.5 bg-gray-100 rounded-full overflow-hidden">
             <div className={`h-full bg-purple-600 transition-all duration-500 ${step === 2 ? 'w-full' : 'w-0'}`} />
          </div>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
              step === 2 ? "bg-purple-600 text-white shadow-lg shadow-purple-200 scale-110" : "bg-gray-100 text-gray-400"
            }`}
          >
            2
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              What's your target role?
            </h2>
            <p className="text-gray-500 mb-8">
              We'll tailor your experience based on this.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allRoles.map((r) => {
                const Icon = roleIcons[r] || Code;
                const isSelected = role === r;

                return (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r);
                      setSkills([]);
                      setError("");
                      setStep(2);
                    }}
                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-300 group ${
                      isSelected
                        ? "border-purple-600 bg-purple-50/50 shadow-sm"
                        : "border-pink-50 hover:border-purple-200 hover:bg-pink-50/30"
                    }`}
                  >
                    <div className={`p-3 rounded-xl transition-colors ${isSelected ? "bg-purple-600 text-white" : "bg-gray-50 text-purple-600 group-hover:bg-white"}`}>
                       <Icon size={24} />
                    </div>
                    <div className="text-left">
                      <p className={`font-bold ${isSelected ? "text-purple-900" : "text-gray-800"}`}>{r}</p>
                      <p className="text-xs text-gray-500">
                        {ROLE_SKILLS[r as keyof typeof ROLE_SKILLS]?.length || 0} skills available
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-purple-600 mb-6 transition-colors group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Change role
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-1">{role}</h2>
            <p className="text-gray-500 mb-8">
              Select skills you already know
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
              {skillsForRole.map((skill) => {
                const isSelected = skills.includes(skill);

                return (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`py-3.5 px-4 rounded-2xl border-2 transition-all duration-200 text-sm font-medium ${
                      isSelected
                        ? "border-purple-600 bg-purple-50 text-purple-700 shadow-sm"
                        : "border-gray-50 text-gray-600 hover:border-purple-100 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 justify-center">
                      {isSelected ? (
                        <CheckCircle size={18} className="text-purple-600" />
                      ) : (
                        <Circle size={18} className="text-gray-300" />
                      )}
                      {skill}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleContinueWithAccount}
                disabled={loading}
                className={`flex-1 py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-100 transition-all ${
                  loading ? "opacity-70 cursor-not-allowed" : "hover:bg-purple-700 hover:-translate-y-0.5 active:scale-95"
                }`}
              >
                {loading ? "Preparing your Roadmap..." : "Continue with Account"}
              </button>

              <button
                onClick={handleGuest}
                disabled={loading}
                className={`flex-1 py-4 border-2 border-pink-200 text-pink-600 rounded-2xl font-bold transition-all ${
                  loading ? "opacity-30 cursor-not-allowed" : "hover:bg-pink-600 hover:text-white hover:border-pink-600 active:scale-95"
                }`}
              >
                {loading ? "Setting up Guest access..." : "Continue as Guest"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
