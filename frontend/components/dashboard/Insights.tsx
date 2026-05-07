import React from 'react';
import { Sprout, Leaf, Sun } from 'lucide-react';
import RadarChartComponent from "@/components/dashboard/RadarChart";
import { useBloomTasks, getBloomPoints } from "@/lib/tasks";

const Insights: React.FC = () => {
  const { completedTasks } = useBloomTasks();
  const bloomPoints = getBloomPoints(completedTasks);

  // Determine stage
  let stageName = "Sprout";
  let StageIcon = Sprout;
  let stageColor = "text-green-500";
  let stageBg = "bg-green-50";
  
  if (bloomPoints >= 10) {
    stageName = "Full Bloom";
    StageIcon = Sun;
    stageColor = "text-pink-500";
    stageBg = "bg-pink-50";
  } else if (bloomPoints >= 6) {
    stageName = "Blooming";
    StageIcon = Sun;
    stageColor = "text-rose-500";
    stageBg = "bg-rose-50";
  } else if (bloomPoints >= 3) {
    stageName = "Growing";
    StageIcon = Leaf;
    stageColor = "text-emerald-500";
    stageBg = "bg-emerald-50";
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="mb-4">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Insights</h2>
        <p className="text-gray-500 text-sm mt-1 font-medium">Your learning activity and skill visualization.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bloom Streak Card */}
        <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between hover:border-pink-500/30 hover:scale-[1.01] transition-all duration-300">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Bloom Streak</p>
              <p className="text-[10px] text-gray-400 font-medium">Action-based progression</p>
            </div>
            <div className={`p-2.5 rounded-2xl ${bloomPoints > 0 ? stageBg : 'bg-gray-50'}`}>
              <StageIcon className={bloomPoints > 0 ? stageColor : 'text-gray-400'} size={24} />
            </div>
          </div>
          
          <div>
            <h2 className={`text-5xl font-black flex items-baseline gap-2 ${bloomPoints > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
              {bloomPoints} <span className={`text-sm font-bold uppercase tracking-wider ${bloomPoints > 0 ? 'text-gray-400' : 'text-gray-300'}`}>pts</span>
            </h2>
            
            {bloomPoints === 0 ? (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-500 text-center">
                  No activity yet — complete tasks to grow your bloom 🌱
                </p>
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${stageBg} ${stageColor}`}>
                  Stage: {stageName}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Skill Radar Chart Card */}
        <div className="col-span-1 md:col-span-2">
          <RadarChartComponent />
        </div>
      </div>
    </div>
  );
};

export default Insights;
