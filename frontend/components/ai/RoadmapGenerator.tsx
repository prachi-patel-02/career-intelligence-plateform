"use client";

import React, { useState, useEffect } from 'react';
import { useRoadmap } from '@/hooks/useRoadmap';
import { useSkills } from '@/context/skillContext';
import { Sparkles, Loader2, CheckCircle2, Target, BookOpen, AlertCircle, ChevronRight } from 'lucide-react';

const RoadmapGenerator: React.FC = () => {
  const { role } = useSkills();
  const { roadmap, loading, error, generate } = useRoadmap();

  const handleGenerate = () => {
    if (role) {
      generate(role);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Search Input Card */}
      <div className="bg-white rounded-[2rem] border border-pink-100/40 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="p-8 border-b border-pink-50/50 flex items-center justify-between bg-gradient-to-r from-pink-50/30 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-100 border border-pink-300/50 transition-transform hover:rotate-6 duration-500">
              <Sparkles size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">AI Learning Roadmap</h3>
              <p className="text-[11px] font-bold text-pink-600 uppercase tracking-widest mt-0.5">Custom paths for {role || "your role"}</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <p className="text-gray-500 text-sm font-medium">
                We'll generate a personalized, step-by-step learning journey specifically for your selected role: 
                <span className="text-gray-900 font-black ml-2 px-3 py-1 bg-pink-50 text-pink-600 rounded-lg">{role || "Not Set"}</span>
              </p>
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading || !role}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black rounded-2xl shadow-xl shadow-pink-100 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center gap-3 min-w-[240px]"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Analyzing Role...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Generate AI Roadmap</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in fade-in zoom-in duration-300">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Roadmap Content */}
      {roadmap && (
        <div className="relative max-w-5xl mx-auto pb-20">
          {/* Vertical Path Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-100 via-pink-200 to-rose-100 -translate-x-1/2 hidden lg:block rounded-full"></div>

          <div className="space-y-24 relative">
            {roadmap.stages.map((stage, sIdx) => (
              <div key={sIdx} className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000" style={{ animationDelay: `${sIdx * 200}ms` }}>
                {/* Stage Header */}
                <div className="flex flex-col items-center relative z-10">
                  <div className="px-8 py-3 bg-white border-2 border-pink-100 rounded-full shadow-xl shadow-pink-50/50 flex items-center gap-3 group hover:border-pink-300 transition-all duration-500">
                    <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg shadow-pink-200">
                      {sIdx + 1}
                    </div>
                    <h4 className="text-base font-black text-gray-900 uppercase tracking-[0.2em]">{stage.title}</h4>
                  </div>
                </div>

                {/* Topics Grid/List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  {stage.topics.map((topic, tIdx) => (
                    <div 
                      key={tIdx} 
                      className={`bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_15px_40px_rgb(0,0,0,0.02)] hover:shadow-2xl hover:shadow-pink-100/50 transition-all duration-700 group hover:-translate-y-2 flex flex-col h-full ${
                        tIdx % 2 === 0 ? "lg:translate-x-[-1rem]" : "lg:translate-x-[1rem]"
                      }`}
                    >
                      {/* Topic Header */}
                      <div className="p-8 border-b border-gray-50 flex items-start justify-between bg-gradient-to-br from-white to-gray-50/30 rounded-t-[2.5rem]">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-100 group-hover:rotate-6 transition-transform duration-500">
                            <Target size={24} strokeWidth={2.5} />
                          </div>
                          <div>
                            <h5 className="text-xl font-black text-gray-900 tracking-tight leading-tight">{topic.name}</h5>
                            <p className="text-[10px] font-bold text-pink-500 uppercase tracking-widest mt-1">Focus Area</p>
                          </div>
                        </div>
                        <div className="p-2 bg-pink-50 rounded-full text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <CheckCircle2 size={20} strokeWidth={2.5} />
                        </div>
                      </div>
                      
                      <div className="p-8 space-y-8 flex-1 flex flex-col justify-between">
                        {/* Subtopics */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center">
                              <BookOpen size={12} className="text-blue-500" />
                            </div>
                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Key Concepts</span>
                          </div>
                          <div className="flex flex-wrap gap-2.5">
                            {topic.subtopics.map((sub, subIdx) => (
                              <span key={subIdx} className="px-4 py-2 bg-white border border-gray-100 rounded-2xl text-[12px] font-bold text-gray-600 shadow-sm group-hover:border-pink-100 group-hover:text-pink-600 transition-all duration-300">
                                {sub}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Projects */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-amber-50 rounded-lg flex items-center justify-center">
                              <Sparkles size={12} className="text-amber-500" />
                            </div>
                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Practical Application</span>
                          </div>
                          <div className="space-y-3">
                            {topic.projects.map((proj, pIdx) => (
                              <div key={pIdx} className="p-4 bg-gradient-to-r from-amber-50/40 to-transparent border border-amber-100/50 rounded-2xl text-[13px] font-bold text-amber-800 flex items-center gap-3 group-hover:from-amber-50 group-hover:scale-[1.02] transition-all duration-500">
                                <ChevronRight size={14} className="text-amber-400 shrink-0" />
                                {proj}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapGenerator;
