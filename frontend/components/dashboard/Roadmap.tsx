"use client";

import React, { useEffect, useState } from "react";
import { 
  ChevronRight, Star, Loader2, BookOpen, Code2, Sprout, 
  Target, Zap, Plus, CheckCircle2, MessageSquare, ExternalLink,
  ChevronDown, ChevronUp, Trophy
} from "lucide-react";
import { useSkills, Skill, Task } from "@/context/skillContext";
import { generateRoadmap } from "@/lib/gemini";

interface RoadmapProps {
  activeSkill: string;
}

const Roadmap: React.FC<RoadmapProps> = ({ activeSkill }) => {
  const { skills, role, addSkillWithRoadmap, addCustomTask, toggleTask } = useSkills();
  const [aiRoadmap, setAiRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [customTaskTitle, setCustomTaskTitle] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Check if skill is already in user's profile
  const existingSkill = skills.find(s => s.name.toLowerCase() === activeSkill.toLowerCase());

  useEffect(() => {
    const loadRoadmap = async () => {
      setLoading(true);
      setError(null);
      
      if (existingSkill) {
        // Transform user skill back into roadmap structure for display
        const stagesMap = new Map();
        existingSkill.tasks.forEach(task => {
          const stage = task.stage || "General";
          if (!stagesMap.has(stage)) stagesMap.set(stage, []);
          stagesMap.get(stage).push(task);
        });
        
        setAiRoadmap({
          skill: existingSkill.name,
          stages: Array.from(stagesMap.entries()).map(([title, items]) => ({ title, items }))
        });
        setLoading(false);
        return;
      }

      // If not existing, generate via AI
      try {
        const data = await generateRoadmap(activeSkill, role || "Professional");
        setAiRoadmap(data);
      } catch (err: any) {
        setError(err.message || "Failed to generate roadmap");
      } finally {
        setLoading(false);
      }
    };

    loadRoadmap();
  }, [activeSkill, existingSkill, role]);

  const handleAddToMySkills = async () => {
    if (!aiRoadmap) return;
    setIsAdding(true);
    await addSkillWithRoadmap(activeSkill, aiRoadmap);
    setIsAdding(false);
  };

  const handleAddCustom = async () => {
    if (!customTaskTitle.trim() || !existingSkill) return;
    await addCustomTask(existingSkill.id, customTaskTitle);
    setCustomTaskTitle("");
    setShowCustomInput(false);
  };

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-[2rem] border border-pink-100 flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center animate-pulse">
          <Zap className="text-pink-500" size={32} />
        </div>
        <div className="text-center">
          <p className="text-gray-900 font-black text-lg">AI Architect is building your path...</p>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Generating detailed tasks for {activeSkill}</p>
        </div>
        <Loader2 className="text-pink-500 animate-spin" size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-12 rounded-[2rem] border border-rose-100 flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
          <Target size={32} />
        </div>
        <h4 className="text-xl font-black text-gray-900">Roadmap Unavailable</h4>
        <p className="text-gray-500 text-sm max-w-xs font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-top-4 duration-500 mt-6">
      {/* Header Card */}
      <div className="bg-white rounded-[2rem] border border-pink-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-pink-50 flex items-center justify-between bg-gradient-to-r from-purple-50/50 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-100 transition-transform hover:rotate-6">
              <BookOpen size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-800 tracking-tight">{activeSkill} Learning Path</h3>
              <p className="text-[10px] text-pink-600 font-black uppercase tracking-[0.2em] mt-0.5">AI-Generated Curriculum</p>
            </div>
          </div>
          
          {!existingSkill ? (
            <button 
              onClick={handleAddToMySkills}
              disabled={isAdding}
              className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-black text-xs shadow-lg shadow-pink-100 hover:scale-105 transition-all flex items-center gap-2"
            >
              {isAdding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Add to My Skills
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl border border-green-100">
              <CheckCircle2 size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">In Your Skills</span>
            </div>
          )}
        </div>

        {/* ROADMAP BODY */}
        <div className="p-8 pb-16 bg-gray-50/30">
          <div className="relative">
            {/* LEFT VERTICAL SPINE LINE */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-100 hidden md:block"></div>

            <div className="space-y-16">
              {aiRoadmap?.stages.map((stage: any, sIdx: number) => {
                const stageColors = [
                  { dot: "bg-pink-500",    border: "border-pink-200",   text: "text-pink-600",   pill: "bg-pink-50",    iconBg: "bg-pink-100",   iconText: "text-pink-500"   },
                  { dot: "bg-purple-500",  border: "border-purple-200", text: "text-purple-600", pill: "bg-purple-50",  iconBg: "bg-purple-100", iconText: "text-purple-500" },
                  { dot: "bg-blue-500",    border: "border-blue-200",   text: "text-blue-600",   pill: "bg-blue-50",    iconBg: "bg-blue-100",   iconText: "text-blue-500"   },
                  { dot: "bg-emerald-500", border: "border-emerald-200",text: "text-emerald-600",pill: "bg-emerald-50", iconBg: "bg-emerald-100",iconText: "text-emerald-500"},
                ];
                const c = stageColors[sIdx % stageColors.length];

                return (
                  <div key={sIdx} className="relative">
                    {/* Stage Dot on Spine */}
                    <div className={`absolute left-[14px] top-[18px] w-3 h-3 rounded-full ${c.dot} border-2 border-white shadow-md z-10 hidden md:block`}></div>

                    {/* STAGE HEADER PILL */}
                    <div className="flex justify-center mb-8 md:pl-14">
                      <div className={`inline-flex items-center gap-3 px-8 py-2.5 rounded-full bg-white border-2 ${c.border} shadow-lg`}>
                        <div className={`w-7 h-7 ${c.dot} rounded-full flex items-center justify-center text-white text-[11px] font-black shadow-md`}>
                          {sIdx + 1}
                        </div>
                        <span className={`text-[12px] font-black uppercase tracking-[0.35em] ${c.text}`}>
                          {stage.title}
                        </span>
                      </div>
                    </div>

                    {/* TOPIC GRID CARD */}
                    <div className="md:ml-14 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="grid grid-cols-1 md:grid-cols-3" style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
                        {stage.items.map((item: any, iIdx: number) => (
                          <div
                            key={iIdx}
                            className="p-6 flex items-start gap-4 group hover:bg-gray-50/60 transition-colors duration-200"
                            style={{
                              borderRight: iIdx % 3 !== 2 ? '1px solid #f5f5f5' : 'none',
                              borderBottom: Math.floor(iIdx / 3) < Math.floor((stage.items.length - 1) / 3) ? '1px solid #f5f5f5' : 'none'
                            }}
                          >
                            {/* Square Icon */}
                            <div className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center ${c.iconBg} ${c.iconText} group-hover:scale-110 transition-transform duration-300`}>
                              {item.type === 'project' ? <Zap size={18} strokeWidth={2} /> :
                               item.type === 'interview' ? <MessageSquare size={18} strokeWidth={2} /> :
                               <BookOpen size={18} strokeWidth={2} />}
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-1 mb-1">
                                <h5 className={`font-black text-[13px] leading-tight tracking-tight ${item.completed ? 'text-green-600 line-through decoration-green-400' : 'text-gray-900'}`}>
                                  {iIdx + 1}. {item.title}
                                </h5>
                                {existingSkill && (
                                  <button
                                    onClick={() => toggleTask(existingSkill.id, item.id)}
                                    className={`flex-shrink-0 p-0.5 rounded transition-all ${
                                      item.completed ? 'text-green-500' : 'text-gray-200 hover:text-green-400'
                                    }`}
                                  >
                                    <CheckCircle2 size={13} strokeWidth={2.5} />
                                  </button>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-400 font-medium leading-relaxed line-clamp-2">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* CUSTOM MILESTONE */}
              {existingSkill && (
                <div className="relative">
                  <div className="absolute left-[14px] top-[18px] w-3 h-3 rounded-full bg-gray-400 border-2 border-white shadow-md z-10 hidden md:block"></div>
                  <div className="md:ml-14">
                    {!showCustomInput ? (
                      <button
                        onClick={() => setShowCustomInput(true)}
                        className="group w-full flex items-center gap-4 p-5 bg-white border-2 border-dashed border-gray-200 rounded-2xl hover:border-pink-300 hover:shadow-md transition-all duration-500"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:text-pink-500 group-hover:bg-pink-50 transition-all duration-500">
                          <Plus size={22} />
                        </div>
                        <div className="text-left">
                          <span className="block text-sm font-black text-gray-700">Add Custom Milestone</span>
                          <span className="text-[11px] text-gray-400 font-medium">Add a unique step to your path</span>
                        </div>
                      </button>
                    ) : (
                      <div className="bg-white border border-pink-100 p-6 rounded-2xl shadow-lg shadow-pink-50 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500">
                            <Target size={20} />
                          </div>
                          <h5 className="font-black text-gray-900">New Custom Step</h5>
                        </div>
                        <input
                          type="text"
                          placeholder="e.g., Build a full-stack authentication system..."
                          value={customTaskTitle}
                          onChange={(e) => setCustomTaskTitle(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-400 focus:bg-white transition-all font-medium"
                        />
                        <div className="flex gap-3">
                          <button onClick={handleAddCustom} className="flex-1 py-3 bg-pink-500 text-white rounded-xl font-black text-sm hover:bg-pink-600 transition-all shadow-lg shadow-pink-200">
                            Add to Path
                          </button>
                          <button onClick={() => setShowCustomInput(false)} className="px-6 py-3 bg-gray-100 text-gray-500 rounded-xl font-black text-sm hover:bg-gray-200 transition-all">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
