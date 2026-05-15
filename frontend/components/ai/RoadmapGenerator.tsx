"use client";

import React, { useEffect, useState } from 'react';
import { useSkills } from '@/context/skillContext';
import { useAuth } from '@/context/authContext';
import { generateRoadmap } from '@/lib/gemini';
import { apiSaveCachedRoadmap } from '@/lib/api';
import {
  Sparkles, Loader2, BookOpen, AlertCircle,
  Zap, MessageSquare, RefreshCw,
} from 'lucide-react';

const stageColors = [
  { dot: "bg-pink-500",    border: "border-pink-200",   text: "text-pink-600",   iconBg: "bg-pink-100",    iconText: "text-pink-500"    },
  { dot: "bg-purple-500",  border: "border-purple-200", text: "text-purple-600", iconBg: "bg-purple-100",  iconText: "text-purple-500"  },
  { dot: "bg-blue-500",    border: "border-blue-200",   text: "text-blue-600",   iconBg: "bg-blue-100",    iconText: "text-blue-500"    },
  { dot: "bg-emerald-500", border: "border-emerald-200",text: "text-emerald-600",iconBg: "bg-emerald-100", iconText: "text-emerald-500" },
];

const RoadmapGenerator: React.FC = () => {
  const { role } = useSkills();
  const { user, updateUserLocal } = useAuth();

  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On mount: load persisted roadmap from MongoDB if it exists
  useEffect(() => {
    if (user?.cachedRoadmap) {
      setRoadmap(user.cachedRoadmap);
    }
  }, [user?.cachedRoadmap]);

  const handleGenerate = async (force = false) => {
    if (!role) return;
    // If cached and not forcing regeneration, skip
    if (roadmap && !force) return;

    setLoading(true);
    setError(null);
    try {
      const data = await generateRoadmap(role, role);

      // Update local state
      setRoadmap(data);

      // Persist to MongoDB (fire-and-forget with optimistic local update)
      updateUserLocal({ cachedRoadmap: data });
      apiSaveCachedRoadmap(data).catch((err) =>
        console.error("Failed to persist cached roadmap:", err)
      );
    } catch (err: any) {
      setError(err.message || "Failed to generate roadmap.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Card */}
      <div className="bg-white rounded-[2rem] border border-pink-100/40 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-pink-50/50 flex items-center justify-between bg-gradient-to-r from-pink-50/30 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-100 transition-transform hover:rotate-6 duration-500">
              <Sparkles size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">AI Learning Roadmap</h3>
              <p className="text-[11px] font-bold text-pink-600 uppercase tracking-widest mt-0.5">
                Custom paths for {role || "your role"}
              </p>
            </div>
          </div>

          {/* Regenerate button (only shown when roadmap exists) */}
          {roadmap && !loading && (
            <button
              onClick={() => handleGenerate(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 text-xs font-black rounded-xl hover:bg-gray-200 transition-all active:scale-95"
            >
              <RefreshCw size={14} />
              Regenerate
            </button>
          )}
        </div>

        <div className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <p className="text-gray-500 text-sm font-medium">
                {roadmap
                  ? "Your personalized learning roadmap is ready. Navigate each stage to master your role."
                  : `We'll generate a personalized, step-by-step learning journey for:`}{" "}
                <span className="text-gray-900 font-black ml-2 px-3 py-1 bg-pink-50 text-pink-600 rounded-lg">
                  {role || "Not Set"}
                </span>
              </p>
            </div>

            {!roadmap && (
              <button
                onClick={() => handleGenerate(false)}
                disabled={loading || !role}
                className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black rounded-2xl shadow-xl shadow-pink-100 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center gap-3 min-w-[220px]"
              >
                {loading ? (
                  <><Loader2 size={20} className="animate-spin" /><span>Analyzing Role...</span></>
                ) : (
                  <><Sparkles size={20} /><span>Generate AI Roadmap</span></>
                )}
              </button>
            )}

            {roadmap && loading && (
              <div className="flex items-center gap-3 text-pink-600 font-bold text-sm">
                <Loader2 size={18} className="animate-spin" />
                Regenerating...
              </div>
            )}
          </div>

          {error && (
            <div className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in fade-in zoom-in duration-300">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Roadmap Infographic */}
      {roadmap && !loading && (
        <div className="bg-gray-50/30 rounded-[2rem] p-8">
          <div className="relative">
            {/* Left vertical spine */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-100 hidden md:block"></div>

            <div className="space-y-16">
              {roadmap.stages?.map((stage: any, sIdx: number) => {
                const c = stageColors[sIdx % stageColors.length];
                return (
                  <div
                    key={sIdx}
                    className="relative animate-in fade-in slide-in-from-bottom-4 duration-700"
                    style={{ animationDelay: `${sIdx * 150}ms` }}
                  >
                    {/* Spine dot */}
                    <div className={`absolute left-[14px] top-[18px] w-3 h-3 rounded-full ${c.dot} border-2 border-white shadow-md z-10 hidden md:block`}></div>

                    {/* Stage pill */}
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

                    {/* 3-column topic grid */}
                    <div className="md:ml-14 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                      <div
                        className="grid grid-cols-1 md:grid-cols-3"
                        style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
                      >
                        {stage.items?.map((item: any, iIdx: number) => (
                          <div
                            key={iIdx}
                            className="p-6 flex items-start gap-4 group hover:bg-gray-50/60 transition-colors duration-200"
                            style={{
                              borderRight: iIdx % 3 !== 2 ? '1px solid #f5f5f5' : 'none',
                              borderBottom: Math.floor(iIdx / 3) < Math.floor((stage.items.length - 1) / 3) ? '1px solid #f5f5f5' : 'none',
                            }}
                          >
                            <div className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center ${c.iconBg} ${c.iconText} group-hover:scale-110 transition-transform duration-300`}>
                              {item.type === 'project'
                                ? <Zap size={18} strokeWidth={2} />
                                : item.type === 'interview'
                                  ? <MessageSquare size={18} strokeWidth={2} />
                                  : <BookOpen size={18} strokeWidth={2} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-black text-[13px] leading-tight tracking-tight text-gray-900 mb-1">
                                {iIdx + 1}. {item.title}
                              </h5>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapGenerator;
