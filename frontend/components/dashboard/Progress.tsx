"use client";

import React, { useState } from "react";
import { 
  ChevronDown, 
  ChevronUp,
  Search,
  Filter,
  ClipboardCheck,
  Trophy,
  RefreshCcw,
} from "lucide-react";
import { useSkills } from "@/context/skillContext";
import { useAssessment } from "@/context/assessmentContext";
import SkillAssessment from "@/components/assessment/SkillAssessment";

interface ProgressProps {
  onNavigate: (section: string) => void;
}

const Progress: React.FC<ProgressProps> = ({ onNavigate }) => {
  const { skills, role, toggleTask } = useSkills();
  const { getBestScore, getSkillStatus } = useAssessment();
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [assessingSkill, setAssessingSkill] = useState<string | null>(null);

  const filteredSkills = skills.filter(skill => 
    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* If a skill is being assessed, show full-screen assessment */
  if (assessingSkill) {
    return (
      <SkillAssessment
        skillName={assessingSkill}
        roleName={role}
        onClose={() => setAssessingSkill(null)}
      />
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 max-w-6xl mx-auto">
      
      {/* Refined Compact Header */}
      <div className="mb-12 flex items-end justify-between px-2">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Expertise</h2>
          <p className="text-sm text-gray-500 font-medium mt-1 italic opacity-80">Validating your frontend journey</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="h-10 w-[1px] bg-gray-200 hidden sm:block" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Active Role</span>
            <span className="text-sm font-bold text-pink-600">{role}</span>
          </div>
        </div>
      </div>

      {/* Compact 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-2">
        {filteredSkills.map((skill) => {
          const isExpanded = expandedSkill === skill.id;
          const bestScore = getBestScore(skill.name);
          const assessStatus = getSkillStatus(skill.name);

          return (
            <div 
              key={skill.id} 
              className={`group transition-all duration-500 ${
                isExpanded ? "col-span-1 md:col-span-2" : ""
              }`}
            >
              <div className={`h-full bg-white rounded-3xl border transition-all duration-500 ${
                isExpanded 
                  ? "border-pink-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.04)]" 
                  : "border-gray-100 hover:border-gray-300 shadow-sm"
              } overflow-hidden`}>
                
                {/* Compact Header */}
                <div 
                  className={`p-5 flex items-center justify-between cursor-pointer transition-colors ${isExpanded ? 'bg-pink-50/20' : 'hover:bg-gray-50/50'}`}
                  onClick={() => setExpandedSkill(isExpanded ? null : skill.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-sm transition-transform duration-500 group-hover:scale-105 ${
                      assessStatus === "Completed" ? "bg-green-500" : "bg-gray-900"
                    }`}>
                      {skill.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-base leading-tight">{skill.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          {skill.tasks.filter(t => t.completed).length}/{skill.tasks.length} Tasks
                        </span>
                        {assessStatus && (
                          <div className={`w-1 h-1 rounded-full ${assessStatus === "Completed" ? "bg-green-500" : "bg-pink-500"}`} />
                        )}
                        {assessStatus && (
                          <span className={`text-[9px] font-black uppercase tracking-widest ${assessStatus === "Completed" ? "text-green-600" : "text-pink-600"}`}>
                            {assessStatus === "Completed" ? "Verified" : `${bestScore}%`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center transition-all ${isExpanded ? 'rotate-180 bg-pink-100 text-pink-600' : 'text-gray-300'}`}>
                    <ChevronDown size={14} strokeWidth={3} />
                  </div>
                </div>

                {/* Compact Expanded UI */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-4 border-t border-gray-50 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {bestScore > 0 && (
                        <div className="flex-1 flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm ${
                            bestScore >= 70 ? "bg-green-500" : "bg-pink-500"
                          }`}>
                            {bestScore}%
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mastery Level</p>
                            <p className="text-xs text-gray-700 font-bold">
                              {assessStatus === "Completed" ? "Verification Success" : "Requires Practice"}
                            </p>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssessingSkill(skill.name);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-pink-600 transition-all shadow-lg hover:shadow-pink-200 active:scale-95"
                      >
                        {bestScore > 0 ? <RefreshCcw size={14} /> : <ClipboardCheck size={14} />}
                        {bestScore > 0 ? "Retake" : "Validate"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>


      {filteredSkills.length === 0 && (
        <div className="p-12 text-center mt-8">
          <p className="text-gray-400 font-medium tracking-tight">No expertise recorded in your path yet.</p>
        </div>
      )}
    </div>
  );
};

export default Progress;
