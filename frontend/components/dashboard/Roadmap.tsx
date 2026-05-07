"use client";

import React, { useEffect, useState } from "react";
import { getRoadmap } from "@/lib/skillData";
import { ChevronRight, Star, Loader2, BookOpen, Code2, Sprout } from "lucide-react";
import TaskModal from "./TaskModal";

interface RoadmapProps {
  activeSkill: string;
}

const Roadmap: React.FC<RoadmapProps> = ({ activeSkill }) => {
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Simulate API delay
    const timer = setTimeout(() => {
      const data = getRoadmap(activeSkill);
      setRoadmap(data);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [activeSkill]);

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-pink-100 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="text-pink-500 animate-spin" size={32} />
        <p className="text-gray-500 font-medium animate-pulse">Generating your learning path...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden animate-in slide-in-from-top-4 duration-500 mt-6">
      <div className="p-6 border-b border-pink-50 flex items-center justify-between bg-gradient-to-r from-purple-50/50 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-sm">
            <BookOpen size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{activeSkill} Learning Path</h3>
            <p className="text-xs text-gray-500 font-medium">Expert curated roadmap</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={14} className="text-amber-400 fill-amber-400" />
          ))}
        </div>
      </div>

      <div className="p-8">
        <div className="relative border-l-2 border-dashed border-pink-100 ml-4 space-y-8 pb-4">
          {roadmap?.steps.map((step: any, i: number) => (
            <div key={i} className="relative pl-10 group">
              {/* Dot */}
              <div className="absolute left-[-9px] top-1 w-4 h-4 bg-white border-2 border-pink-500 rounded-full group-hover:bg-pink-500 transition-all duration-300"></div>
              
              <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl group-hover:border-pink-200 group-hover:bg-pink-50/30 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h4 className="font-bold text-gray-800">{step.stage}</h4>
                  <span className="px-2 py-0.5 bg-white border border-gray-100 rounded text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    {i === 0 ? "Beginner" : i === roadmap.steps.length - 1 ? "Expert" : "Intermediate"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Focus on mastering the fundamentals of {activeSkill.toLowerCase()} in this stage.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <a 
                    href={step.resource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-pink-600 hover:underline flex items-center gap-1"
                  >
                    {step.resourceLabel || "Study Materials"} <ChevronRight size={12} />
                  </a>
                  <button 
                    onClick={() => setShowTaskModal(true)}
                    className="text-xs font-bold bg-pink-50 hover:bg-pink-100 text-pink-600 px-3 py-1.5 rounded-lg border border-pink-200 transition-colors flex items-center gap-1.5 group/task"
                  >
                    <Code2 size={12} /> Start Task
                    <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded text-[10px] border border-pink-100 shadow-sm group-hover/task:bg-pink-500 group-hover/task:text-white group-hover/task:border-pink-500 transition-all">
                      <Sprout size={10} />
                      <span>+ Bloom</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-center">
          <button className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-pink-200 hover:shadow-pink-300 transition-all">
            Add to My Skills
          </button>
        </div>
      </div>
      
      {showTaskModal && (
        <TaskModal 
          skillName={activeSkill} 
          onClose={() => setShowTaskModal(false)} 
        />
      )}
    </div>
  );
};

export default Roadmap;
