"use client";

import React, { useState } from "react";
import { Search, Plus, Filter, Sparkles, BookOpen } from "lucide-react";
import { ROLE_SKILLS } from "@/lib/roles";

const SkillExplorer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");

  const categories = ["All", "Frontend", "Backend", "Mobile", "Data", "Cloud"];
  
  // Flatten all skills from ROLE_SKILLS for exploration
  const allAvailableSkills = Array.from(new Set(Object.values(ROLE_SKILLS).flat()));
  
  const filteredSkills = allAvailableSkills.filter(skill => 
    skill.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-lg">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search thousands of skills and certifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-pink-100 rounded-2xl focus:ring-4 focus:ring-pink-50 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                category === cat 
                  ? "bg-purple-600 text-white shadow-md shadow-purple-100" 
                  : "bg-white border border-pink-100 text-gray-500 hover:border-pink-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Recommended Card */}
        <div className="bg-gradient-to-br from-purple-700 to-indigo-600 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
              <Sparkles size={20} />
            </div>
            <h3 className="font-bold text-lg leading-tight">AI Recommended for you</h3>
            <p className="text-purple-100 text-xs mt-2 opacity-80">Based on your Frontend Dev path</p>
          </div>
          <button className="mt-6 w-full bg-white text-purple-700 py-2.5 rounded-xl text-sm font-bold hover:bg-purple-50 transition-all">
            Refresh Insights
          </button>
        </div>

        {filteredSkills.map((skill, i) => (
          <div 
            key={i} 
            className="bg-white p-5 rounded-2xl border border-pink-100 shadow-sm hover:border-pink-300 hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-all">
                <BookOpen size={18} />
              </div>
              <button className="p-2 text-gray-300 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-all">
                <Plus size={20} />
              </button>
            </div>
            <h4 className="font-bold text-gray-800">{skill}</h4>
            <div className="flex items-center gap-2 mt-4">
              <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-50 text-gray-500 rounded uppercase">Technical</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-pink-50 text-pink-500 rounded uppercase">Trending</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillExplorer;
