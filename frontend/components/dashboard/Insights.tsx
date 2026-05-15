import React from 'react';
import { ClipboardCheck, TrendingUp } from 'lucide-react';
import RadarChartComponent from "@/components/dashboard/RadarChart";
import { useAssessment } from "@/context/assessmentContext";
import { useSkills } from "@/context/skillContext";

const Insights: React.FC = () => {
  const { assessmentProgress, getBestScore, getSkillStatus } = useAssessment();
  const { skills } = useSkills();

  // Build assessment summary from skills that have been assessed
  const assessedSkills = skills
    .map(s => ({
      name: s.name,
      score: getBestScore(s.name),
      status: getSkillStatus(s.name),
    }))
    .filter(s => s.score > 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      <div className="mb-4">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Insights</h2>
        <p className="text-gray-500 text-sm mt-1 font-medium">Your learning activity and skill visualization.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Assessment Summary Card (replaces Bloom Streak) */}
        <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between hover:border-teal-400/40 hover:scale-[1.01] transition-all duration-300">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Assessment Score</p>
              <p className="text-[10px] text-gray-400 font-medium">Average across all skills</p>
            </div>
            <div className={`p-2.5 rounded-2xl ${assessmentProgress > 0 ? 'bg-teal-50' : 'bg-gray-50'}`}>
              <ClipboardCheck className={assessmentProgress > 0 ? 'text-teal-500' : 'text-gray-400'} size={24} />
            </div>
          </div>

          <div>
            <h2 className={`text-5xl font-black flex items-baseline gap-2 ${assessmentProgress > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
              {assessmentProgress}
              <span className={`text-sm font-bold uppercase tracking-wider ${assessmentProgress > 0 ? 'text-gray-400' : 'text-gray-300'}`}>%</span>
            </h2>

            {assessmentProgress === 0 ? (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-500 text-center">
                  No assessments taken yet — go to Progress to validate your skills.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {assessedSkills.slice(0, 3).map(s => (
                  <div key={s.name} className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600 truncate">{s.name}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      s.status === "Completed"
                        ? "bg-green-50 text-green-600"
                        : s.status === "In Progress"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-gray-100 text-gray-500"
                    }`}>
                      {s.score}%
                    </span>
                  </div>
                ))}
                {assessedSkills.length > 3 && (
                  <p className="text-[10px] text-gray-400 font-medium">
                    +{assessedSkills.length - 3} more skills assessed
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Skill Radar Chart */}
        <div className="col-span-1 md:col-span-2">
          <RadarChartComponent />
        </div>
      </div>
    </div>
  );
};

export default Insights;
