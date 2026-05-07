"use client";

import React from "react";
import { AlertCircle, CheckCircle2, ChevronRight, Zap } from "lucide-react";
import { useSkills } from "@/context/skillContext";
import { ROLE_SKILLS } from "@/lib/roles";

interface SkillGapProps {
  onSkillClick: (skill: string) => void;
  onNavigate?: (section: string) => void;
}

const SkillGap: React.FC<SkillGapProps> = ({ onSkillClick, onNavigate }) => {
  const { skills, role } = useSkills();

  // Priority map based on market demand
  const MARKET_PRIORITY: Record<string, number> = {
    JavaScript: 3,
    React: 3,
    "Node.js": 3,
    Python: 3,
    TypeScript: 2,
    "Next.js": 2,
    Testing: 2,
    Git: 2,
    Docker: 2,
    Performance: 1,
    Accessibility: 1,
    CSS: 1,
    HTML: 1,
  };

  const requiredSkills = ROLE_SKILLS[role] || [];

  const getSkillProgress = (skillName: string) => {
    const skill = skills.find((s) => s.name === skillName);
    if (!skill || !skill.tasks || skill.tasks.length === 0) return 0;
    const completed = skill.tasks.filter((t) => t.completed).length;
    return completed / skill.tasks.length;
  };

  const acquired: string[] = [];
  const missing: { name: string; priority: number }[] = [];

  requiredSkills.forEach((skillName) => {
    const progress = getSkillProgress(skillName);
    // If progress is >= 70%, consider it completed
    if (progress >= 0.7) {
      acquired.push(skillName);
    } else {
      missing.push({
        name: skillName,
        priority: MARKET_PRIORITY[skillName] || 1, // Default to low priority if not in map
      });
    }
  });

  // Sort remaining skills by priority descending
  missing.sort((a, b) => b.priority - a.priority);

  return (
    <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-pink-50 flex items-center justify-between bg-gradient-to-r from-pink-50/50 to-transparent">
        <div>
          <h3 className="font-bold text-gray-800">Skill Gap Analysis</h3>
          <p className="text-xs text-gray-500 font-medium">Comparison for {role || "your target role"}</p>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
            {acquired.length} Acquired
          </div>
          <div className="px-3 py-1 bg-pink-50 text-pink-700 text-xs font-bold rounded-full border border-pink-100">
            {missing.length} Missing
          </div>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Acquired */}
        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
          <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4">
            <CheckCircle2 size={16} className="text-green-500" />
            Matching Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {acquired.map((skill) => (
              <div 
                key={skill}
                className="px-4 py-2 bg-green-50/50 border border-green-100 rounded-xl text-sm font-medium text-green-800"
              >
                {skill}
              </div>
            ))}
            {acquired.length === 0 && <p className="text-xs text-gray-400 italic">No matches yet.</p>}
          </div>
        </div>

        {/* Missing */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-pink-500" />
            Gaps to Fill
          </h4>
          <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
            {missing.map((skillObj) => (
              <div 
                key={skillObj.name}
                className="w-full flex items-center justify-between p-2.5 bg-pink-50/30 border border-pink-100 rounded-xl hover:bg-pink-50 transition-all group"
              >
                <div 
                  className="flex items-center gap-2 cursor-pointer flex-1"
                  onClick={() => onSkillClick(skillObj.name)}
                  title={`View details for ${skillObj.name}`}
                >
                  <span className="text-sm font-medium text-gray-800 hover:text-pink-600 transition-colors">{skillObj.name}</span>
                  {skillObj.priority === 3 && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">High</span>
                  )}
                  {skillObj.priority === 2 && (
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-full">Med</span>
                  )}
                  {skillObj.priority === 1 && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">Low</span>
                  )}
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSkillClick(skillObj.name);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-pink-600 border border-pink-200 rounded-lg text-xs font-bold shadow-sm hover:bg-pink-600 hover:text-white hover:border-pink-600 transition-all active:scale-95 group/btn"
                >
                  <span>View Path</span>
                  <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ))}
            {missing.length === 0 && (
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl flex items-center gap-3">
                <Zap className="text-purple-500" size={20} />
                <p className="text-sm font-medium text-purple-800">You're fully qualified!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillGap;
