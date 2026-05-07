"use client";

import React from "react";
import { Trophy, Calendar, Zap, Flame } from "lucide-react";

const StreakCard: React.FC = () => {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const completedDays = [true, true, true, false, false, false, false];

  return (
    <div className="bg-white rounded-[2rem] border border-pink-100/40 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
      <div className="p-8 border-b border-pink-50/50 flex items-center justify-between bg-gradient-to-r from-amber-50/30 to-transparent">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-100 border border-amber-300/50 transition-transform hover:scale-110 duration-500">
            <Flame size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Learning Streak</h3>
            <p className="text-[11px] font-bold text-amber-600 uppercase tracking-widest mt-0.5">Keep up the momentum!</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-400 to-orange-500 leading-none">3</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Days</p>
        </div>
      </div>

      <div className="p-8 flex flex-col items-center">
        <div className="flex justify-between w-full mb-10 px-2">
          {days.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">{day}</span>
              <div 
                className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-700 transform ${
                  completedDays[i] 
                    ? "bg-white border-amber-400 text-amber-500 shadow-xl shadow-amber-50 scale-110" 
                    : "bg-gray-50/50 border-gray-100 text-gray-200 scale-90"
                }`}
              >
                {completedDays[i] ? <Zap size={18} fill="currentColor" strokeWidth={2.5} /> : <Calendar size={16} />}
              </div>
            </div>
          ))}
        </div>

        <div className="w-full bg-gray-50/50 rounded-3xl p-6 border border-gray-100 relative overflow-hidden group hover:bg-white hover:shadow-xl hover:shadow-amber-50 transition-all duration-500">
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-md border border-amber-50 group-hover:scale-110 transition-transform duration-500">
                <Trophy size={22} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Next Milestone</p>
                <p className="text-lg font-black text-gray-900 tracking-tight">5 Day Streak</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-amber-600 tracking-tighter">60%</p>
            </div>
          </div>
          <div className="mt-5 h-3 bg-white rounded-full overflow-hidden border border-amber-100/50 p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(245,158,11,0.4)]"
              style={{ width: "60%" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakCard;
