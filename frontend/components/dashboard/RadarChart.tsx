"use client";

import React from "react";
import { Radar } from "lucide-react";
import { useSkills } from "@/context/skillContext";
import { useAssessment } from "@/context/assessmentContext";

const RadarChartComponent: React.FC = () => {
  const { skills } = useSkills();
  const { getBestScore } = useAssessment();

  // Identify completed skills (progress >= 70% or assessment >= 70%)
  const completedSkills = skills.map(skill => {
    const progress = skill.tasks.length > 0 
      ? Math.round((skill.tasks.filter(t => t.completed).length / skill.tasks.length) * 100)
      : 0;
    const testScore = getBestScore(skill.name);
    
    return {
      ...skill,
      progress,
      testScore,
      score: Math.max(progress, testScore)
    };
  }).filter(s => s.score >= 70);

  // Top 5 sorted by score descending
  const topSkills = completedSkills.sort((a, b) => b.score - a.score).slice(0, 5);

  if (topSkills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] w-full text-center px-4 bg-gray-50/50 rounded-3xl border border-gray-200 shadow-sm hover:border-pink-500/30 hover:scale-[1.01] transition-all duration-300">
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 border border-gray-100">
          <Radar size={20} className="text-gray-300" />
        </div>
        <p className="text-sm font-bold text-gray-600">Complete a skill to see your insights</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-6 w-full h-full bg-gray-50/50 rounded-3xl border border-gray-200 shadow-sm hover:border-pink-500/30 hover:scale-[1.01] transition-all duration-300">
      <div className="relative w-48 h-48 flex items-center justify-center mb-6">
        {/* Decorative Outer Ring */}
        <div className="absolute inset-0 border-[2px] border-pink-50/50 rounded-full animate-[spin_20s_linear_infinite]"></div>
        
        {/* Background Grid Circles */}
        <div className="absolute inset-0 border border-pink-100/30 rounded-full scale-100"></div>
        <div className="absolute inset-0 border border-pink-100/30 rounded-full scale-[0.66]"></div>
        <div className="absolute inset-0 border border-pink-100/30 rounded-full scale-[0.33]"></div>
        
        {/* Glowing Center */}
        <div className="absolute w-2 h-2 bg-pink-500 rounded-full blur-[2px] shadow-[0_0_10px_rgba(236,72,153,0.8)]"></div>
        
        {/* Axes */}
        {[0, 72, 144, 216, 288].map((deg) => (
          <div 
            key={deg} 
            className="absolute h-full w-[1px] bg-gradient-to-t from-transparent via-pink-100/40 to-transparent" 
            style={{ transform: `rotate(${deg}deg)` }}
          ></div>
        ))}

        {/* Data Points */}
        <div className="absolute inset-0 flex items-center justify-center">
          {topSkills.map((skill, i) => {
            const angle = (i * (360 / Math.max(topSkills.length, 1))) - 90;
            const progressRatio = skill.score / 100;
            const radius = 20 + (progressRatio * 65); // Max radius approx 85px to fit inside 96px half-width
            
            return (
              <div 
                key={skill.id} 
                className="absolute transition-all duration-1000 ease-out group"
                style={{ 
                  transform: `rotate(${angle}deg) translate(${radius}px) rotate(${-angle}deg)` 
                }}
              >
                <div className="relative">
                  {/* Glowing Connection Line */}
                  <div 
                    className="absolute top-1/2 left-1/2 h-[1px] bg-gradient-to-r from-pink-500/20 to-transparent origin-left -z-10"
                    style={{ 
                      width: `${radius}px`, 
                      transform: `rotate(${angle + 180}deg)`,
                      transformOrigin: '0 0'
                    }}
                  />
                  
                  <div 
                    className="w-8 h-8 bg-white border-2 border-pink-500 rounded-xl shadow-md shadow-pink-100 flex items-center justify-center text-pink-600 font-black text-[8px] group-hover:scale-125 transition-transform cursor-pointer"
                    style={{ 
                      opacity: 0.6 + (progressRatio * 0.4),
                      boxShadow: `0 0 ${5 + progressRatio * 15}px rgba(236,72,153,${0.1 + progressRatio * 0.4})`
                    }}
                    title={`${skill.name} - ${skill.score}%`}
                  >
                    {skill.name.slice(0, 3).toUpperCase()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-4 w-full max-w-[300px]">
        {topSkills.map((skill) => (
          <div key={skill.id} className="flex flex-col gap-1 group cursor-default">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-pink-500 rounded-full shadow-[0_0_8px_rgba(236,72,153,0.8)]"></div>
              <span className="text-[9px] font-black text-gray-900 uppercase tracking-tighter truncate w-full group-hover:text-pink-600 transition-colors" title={skill.name}>{skill.name}</span>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-pink-500 transition-all duration-1000" 
                style={{ width: `${skill.score}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RadarChartComponent;
