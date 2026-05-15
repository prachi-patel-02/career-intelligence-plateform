import React from "react";
import { X, Code2, ExternalLink, CheckCircle2 } from "lucide-react";
import { useBloomTasks, getTasksForSkill } from "@/lib/tasks";

interface TaskModalProps {
  skillName: string;
  onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ skillName, onClose }) => {
  const { completedTasks, completeTask } = useBloomTasks();
  const skillTasks = getTasksForSkill(skillName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-pink-100"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-pink-50 flex items-center justify-between bg-gradient-to-r from-pink-50/50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600">
              <Code2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">{skillName} Task</h3>
              <p className="text-xs text-gray-500 font-medium">Practice your skills</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {(() => {
            if (skillTasks.length === 0) {
              return (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🚧</span>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2">No tasks available yet</h4>
                  <p className="text-sm text-gray-500">We are currently building static tasks for {skillName}.</p>
                </div>
              );
            }

            const firstIncompleteIdx = skillTasks.findIndex(t => !completedTasks.includes(t.id));

            if (firstIncompleteIdx === -1) {
              return (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎉</span>
                  </div>
                  <h4 className="font-bold text-green-700 mb-2">All tasks completed!</h4>
                  <p className="text-sm text-green-600">You have finished all static tasks for {skillName}.</p>
                </div>
              );
            }

            const activeTask = skillTasks[firstIncompleteIdx];

            return (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      activeTask.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-600' :
                      activeTask.difficulty === 'medium' ? 'bg-amber-50 text-amber-600' :
                      'bg-rose-50 text-rose-600'
                    }`}>
                      {activeTask.difficulty}
                    </span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Task {firstIncompleteIdx + 1} of {skillTasks.length}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 leading-tight">
                    {activeTask.question}
                  </h4>
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-600">
                  <p>Open a coding environment to solve this task, then return here to mark it as complete!</p>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <a
                    href="https://codesandbox.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                  >
                    Solve Task <ExternalLink size={16} />
                  </a>
                  
                  <button
                    onClick={() => {
                      completeTask(activeTask.id);
                    }}
                    className="w-full py-3.5 bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} /> Mark as Complete
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
