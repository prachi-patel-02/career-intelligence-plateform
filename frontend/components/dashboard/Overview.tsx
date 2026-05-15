"use client";

import {
  TrendingUp,
  ArrowRight,
  Sparkles,
  Target,
  ClipboardCheck,
  FileText,
} from "lucide-react";
import { useAssessment } from "@/context/assessmentContext";
import { useSkills } from "@/context/skillContext";

interface OverviewProps {
  onNavigate: (section: string) => void;
}

const Overview: React.FC<OverviewProps> = ({ onNavigate }) => {
  const { overallProgress, skills, role } = useSkills();
  const { assessmentProgress } = useAssessment();

  const atsScore = Math.min(100, 40 + (overallProgress * 0.6));

  // Next incomplete task across all skills
  const nextTask = skills.flatMap(s => s.tasks).find(t => !t.completed)?.title || "All completed!";

  // Skills with no completed tasks (gap analysis)
  const missingSkillsCount = skills.filter(s => s.tasks.every(t => !t.completed)).length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">

      {/* Dynamic Content Section */}
      <div className="bg-pink-50/40 rounded-[3rem] p-8 md:p-12 border border-pink-100/50 shadow-inner">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Progress Card */}
          <button
            onClick={() => onNavigate("progress")}
            className="group bg-blue-50/50 p-10 rounded-[2.5rem] border border-blue-100 hover:border-blue-400 hover:bg-white transition-all duration-500 text-left flex flex-col gap-6 shadow-sm hover:shadow-xl hover:shadow-blue-500/5"
          >
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm border border-blue-50 group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Current Progress</p>
              <h3 className="text-xl font-bold text-gray-800 tracking-tight">{overallProgress}% Completed</h3>
            </div>
            <div className="mt-auto flex items-center gap-2 text-[11px] font-black text-blue-500 uppercase tracking-widest group-hover:gap-3 transition-all">
              Track Progress <ArrowRight size={14} />
            </div>
          </button>

          {/* Roadmap Card */}
          <button
            onClick={() => onNavigate("ai-roadmap")}
            className="group bg-purple-50/50 p-10 rounded-[2.5rem] border border-purple-100 hover:border-purple-400 hover:bg-white transition-all duration-500 text-left flex flex-col gap-6 shadow-sm hover:shadow-xl hover:shadow-purple-500/5"
          >
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-purple-500 shadow-sm border border-purple-50 group-hover:scale-110 transition-transform">
              <Sparkles size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">AI Roadmap</p>
              <h3 className="text-xl font-bold text-gray-800 tracking-tight">Next: {nextTask}</h3>
            </div>
            <div className="mt-auto flex items-center gap-2 text-[11px] font-black text-purple-500 uppercase tracking-widest group-hover:gap-3 transition-all">
              Explore Path <ArrowRight size={14} />
            </div>
          </button>

          {/* Skill Gap Card */}
          <button
            onClick={() => onNavigate("skill-gap")}
            className="group bg-orange-50/50 p-10 rounded-[2.5rem] border border-orange-100 hover:border-orange-400 hover:bg-white transition-all duration-500 text-left flex flex-col gap-6 shadow-sm hover:shadow-xl hover:shadow-orange-500/5"
          >
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm border border-orange-50 group-hover:scale-110 transition-transform">
              <Target size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">Skill Gap</p>
              <h3 className="text-xl font-bold text-gray-800 tracking-tight">{missingSkillsCount} Skills Missing</h3>
            </div>
            <div className="mt-auto flex items-center gap-2 text-[11px] font-black text-orange-500 uppercase tracking-widest group-hover:gap-3 transition-all">
              Bridge Gap <ArrowRight size={14} />
            </div>
          </button>

          {/* Assessment Card (replaces Bloom Points) */}
          <button
            onClick={() => onNavigate("insights")}
            className="group bg-teal-50/50 p-10 rounded-[2.5rem] border border-teal-100 hover:border-teal-400 hover:bg-white transition-all duration-500 text-left flex flex-col gap-6 shadow-sm hover:shadow-xl hover:shadow-teal-500/5"
          >
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-teal-500 shadow-sm border border-teal-50 group-hover:scale-110 transition-transform">
              <ClipboardCheck size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest mb-2">Assessments</p>
              <h3 className="text-xl font-bold text-gray-800 tracking-tight">
                {assessmentProgress > 0 ? `Avg Score: ${assessmentProgress}%` : "Not started yet"}
              </h3>
            </div>
            <div className="mt-auto flex items-center gap-2 text-[11px] font-black text-teal-600 uppercase tracking-widest group-hover:gap-3 transition-all">
              View Insights <ArrowRight size={14} />
            </div>
          </button>

          {/* Resume Card */}
          <button
            onClick={() => onNavigate("resume")}
            className="group bg-pink-50/50 p-10 rounded-[2.5rem] border border-pink-100 hover:border-pink-400 hover:bg-white transition-all duration-500 text-left flex flex-col gap-6 shadow-sm hover:shadow-xl hover:shadow-pink-500/5"
          >
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-pink-500 shadow-sm border border-pink-50 group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest mb-2">Professional Resume</p>
              <h3 className="text-xl font-bold text-gray-800 tracking-tight">ATS Health: {atsScore.toFixed(0)}%</h3>
            </div>
            <div className="mt-auto flex items-center gap-2 text-[11px] font-black text-pink-500 uppercase tracking-widest group-hover:gap-3 transition-all">
              Optimize Resume <ArrowRight size={14} />
            </div>
          </button>

        </div>
      </div>
    </div>
  );
};
export default Overview;
