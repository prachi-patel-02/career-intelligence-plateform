"use client";
 
import React, { useState, useEffect } from "react";
import { FileText, Download, Wand2, CheckCircle, RefreshCcw, Plus, Trash2, Loader2, Sparkles, Lightbulb, Zap, ArrowRight, BarChart3, Layout, BrainCircuit, Info } from "lucide-react";
import { useSkills } from "@/context/skillContext";
import { optimizeResumeBullet, checkResumeKeywords, generateExperienceBullets, getResumeHints } from "@/lib/gemini";

interface ResumeBuilderProps {
  user?: any;
  role?: string;
}

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ user, role: propRole }) => {
  const { skills: contextSkills, role: contextRole } = useSkills();
  
  const [resumeData, setResumeData] = useState({
    name: user?.name || "Your Name",
    role: propRole || contextRole || "Target Role",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    skills: [] as string[],
    experience: [
      { id: 1, company: "Projects & Learning", position: "Aspiring " + (propRole || contextRole || "Professional"), period: "2024 - Present", bullets: ["Started learning journey on the platform"] }
    ]
  });

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizingBulletIdx, setOptimizingBulletIdx] = useState<{expId: number, bulletIdx: number} | null>(null);
  const [atsResult, setAtsResult] = useState<{
    score: number; 
    suggestions: string[];
    feedback: string;
  } | null>(null);
  const [isCheckingAts, setIsCheckingAts] = useState(false);
  const [isGeneratingExp, setIsGeneratingExp] = useState(false);
  const [hints, setHints] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);

  // Success message timer
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Sync with context skills (only completed ones)
  useEffect(() => {
    // Filter out meta-skills and levels
    const completedSkills = contextSkills
      .filter(s => s.tasks.some(t => t.completed))
      .map(s => s.name)
      .filter(name => !["Basics", "Intermediate", "Advanced"].includes(name));
    
    // Map tasks to professional bullets
    const completedTasks = contextSkills
      .flatMap(s => s.tasks)
      .filter(t => t.completed)
      .map(t => {
        const title = t.title;
        if (title.toLowerCase().includes("basics")) return `Mastered fundamental concepts and architecture of ${resumeData.role}`;
        if (title.toLowerCase().includes("intermediate")) return `Developed scalable application features and structured components`;
        if (title.toLowerCase().includes("advanced")) return `Optimized performance and implemented advanced architectural patterns`;
        return title;
      });

    if (completedSkills.length > 0 || completedTasks.length > 0) {
      setResumeData(prev => {
        const updatedSkills = Array.from(new Set([...prev.skills, ...completedSkills]));
        
        // Remove placeholder if we have real content
        const filteredExp = prev.experience.map(exp => {
          if (exp.id === 1) {
            const realBullets = exp.bullets.filter(b => b !== "Started learning journey on the platform");
            return { ...exp, bullets: realBullets };
          }
          return exp;
        });

        const existingBullets = filteredExp.flatMap(e => e.bullets);
        const newTaskBullets = completedTasks.filter(t => !existingBullets.includes(t));
        
        if (newTaskBullets.length === 0 && updatedSkills.length === prev.skills.length) return prev;

        return {
          ...prev,
          skills: updatedSkills,
          experience: filteredExp.map((exp, idx) => 
            idx === 0 
              ? { ...exp, bullets: Array.from(new Set([...exp.bullets, ...newTaskBullets])).slice(0, 5) }
              : exp
          )
        };
      });
    }
  }, [contextSkills]);

  // Sync user name/role if they change
  useEffect(() => {
    if (user?.name) {
      setResumeData(prev => ({ ...prev, name: user.name }));
    }
    if (propRole || contextRole) {
      setResumeData(prev => ({ ...prev, role: propRole || contextRole || prev.role }));
    }
  }, [user, propRole, contextRole]);

  const addSkill = () => {
    const skill = prompt("Enter skill name:");
    if (skill) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { 
          id: Date.now(), 
          company: "New Company", 
          position: "Role Name", 
          period: "Date Range", 
          bullets: ["Add a responsibility..."] 
        }
      ]
    }));
  };

  const updateExperience = (id: number, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const handleOptimizeAll = async () => {
    setIsOptimizing(true);
    try {
      const updatedExp = await Promise.all(resumeData.experience.map(async (exp) => {
        const optimized = await Promise.all(exp.bullets.map(b => optimizeResumeBullet(b, resumeData.role)));
        return { ...exp, bullets: optimized };
      }));
      setResumeData(prev => ({ ...prev, experience: updatedExp }));
      setSuccessMsg("✔ Bullets Improved Professionally");
    } catch (err) {
      console.error(err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleImproveSingleBullet = async (expId: number, bulletIdx: number, currentText: string) => {
    setOptimizingBulletIdx({ expId, bulletIdx });
    try {
      const improved = await optimizeResumeBullet(currentText, resumeData.role);
      setResumeData(prev => ({
        ...prev,
        experience: prev.experience.map(exp => 
          exp.id === expId 
            ? { ...exp, bullets: exp.bullets.map((b, i) => i === bulletIdx ? improved : b) }
            : exp
        )
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setOptimizingBulletIdx(null);
    }
  };

  const handleAutoGenerate = async () => {
    setIsAutoGenerating(true);
    try {
      const completedSkills = contextSkills.filter(s => s.tasks.some(t => t.completed)).map(s => s.name).filter(n => !["Basics", "Intermediate", "Advanced"].includes(n));
      const completedTasks = contextSkills.flatMap(s => s.tasks).filter(t => t.completed).map(t => t.title);
      
      const role = resumeData.role;
      const skills = completedSkills.length > 0 ? completedSkills : contextSkills.map(s => s.name).slice(0, 5).filter(n => !["Basics", "Intermediate", "Advanced"].includes(n));
      
      const generatedBullets = await generateExperienceBullets(role, skills);
      
      // Map tasks to more professional bullets
      const taskBullets = completedTasks.map(t => {
        if (t.toLowerCase().includes("basics")) return `Engineered core features using industry-standard ${role} principles`;
        if (t.toLowerCase().includes("intermediate")) return `Integrated complex APIs and managed state for dynamic user interfaces`;
        return `Architected and deployed high-performance ${role} solutions`;
      });
      
      setResumeData(prev => ({
        ...prev,
        skills: Array.from(new Set([...prev.skills, ...skills])),
        experience: [
          { 
            id: Date.now(), 
            company: "Professional Portfolio & Development", 
            position: `${role} Specialist`, 
            period: "2024 - Present", 
            bullets: Array.from(new Set([...generatedBullets.slice(0, 2), ...taskBullets.slice(0, 3)]))
          },
          ...prev.experience.filter(e => e.id !== 1) // Remove initial placeholder if present
        ]
      }));
      setSuccessMsg("✔ Professional Resume Generated");
    } catch (err) {
      console.error(err);
    } finally {
      setIsAutoGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleATSCheck = async () => {
    setIsCheckingAts(true);
    
    // Artificial delay for UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const suggestions: string[] = [];
      const allBullets = resumeData.experience.flatMap(e => e.bullets);
      const fullText = JSON.stringify(resumeData).toLowerCase();
      
      // Check 1: Experience depth
      if (allBullets.length < 3) {
        suggestions.push("Add more experience points to showcase your background");
      }
      
      // Check 2: Measurable impact
      const hasNumbers = allBullets.some(b => /[\d%]+/.test(b));
      if (!hasNumbers) {
        suggestions.push("Include measurable impact (e.g., improved performance by 30%)");
      }
      
      // Check 3: Skills count
      if (resumeData.skills.length < 3) {
        suggestions.push("Expand your skills section with at least 3-5 relevant technical skills");
      }
      
      // Check 4: Bullet descriptiveness
      const hasShortBullets = allBullets.some(b => b.length < 40);
      if (hasShortBullets) {
        suggestions.push("Write more descriptive bullet points using the STAR method");
      }
      
      // Check 5: Project mention
      if (!fullText.includes("project")) {
        suggestions.push("Mention at least one specific project you've built or contributed to");
      }
      
      // Check 6: Action verbs
      const actionVerbs = ["developed", "built", "engineered", "implemented", "optimized", "architected"];
      const hasActionVerbs = actionVerbs.some(v => fullText.includes(v));
      if (!hasActionVerbs) {
        suggestions.push("Use strong action verbs like 'Developed', 'Built', or 'Optimized'");
      }

      setAtsResult({
        score: 0, // Not used in UI
        suggestions: suggestions.length > 0 ? suggestions : ["Your resume looks good 👍"],
        feedback: ""
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingAts(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in zoom-in-95 duration-500">
      {/* Editor Side */}
      <div className="lg:col-span-2 space-y-6 print:w-full">
        
        {/* Profile Info Section */}
        <div className="bg-white rounded-2xl border border-pink-100 p-6 shadow-sm space-y-4 print:hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Layout size={14} className="text-pink-500" /> Professional Profile
            </h3>
            <button 
              onClick={handleAutoGenerate}
              disabled={isAutoGenerating}
              className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
              {isAutoGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              Generate Resume from Activity
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Email", key: "email", type: "email" },
              { label: "Phone", key: "phone", type: "tel" },
              { label: "LinkedIn", key: "linkedin", type: "text" },
              { label: "GitHub", key: "github", type: "text" }
            ].map(field => (
              <div key={field.key} className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase ml-1">{field.label}</label>
                <input 
                  type={field.type}
                  placeholder={`Your ${field.label}`}
                  value={(resumeData as any)[field.key]}
                  onChange={(e) => setResumeData({...resumeData, [field.key]: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-[11px] outline-none focus:border-pink-300 focus:bg-white transition-all"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden print:border-none print:shadow-none">
          <div className="p-6 border-b border-pink-50 flex items-center justify-between print:hidden">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <FileText size={18} className="text-pink-500" />
              Resume Editor
            </h3>
            {successMsg && (
              <div className="text-xs font-bold text-green-600 flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                <CheckCircle size={14} /> {successMsg}
              </div>
            )}
          </div>
          
          <div id="resume-content" className="p-10 space-y-8">
            {/* Header section in resume */}
            <div className="flex flex-col items-center text-center space-y-2">
              <h2 
                className="text-3xl font-black text-gray-900 outline-none" 
                contentEditable
                suppressContentEditableWarning={true}
                onBlur={(e) => setResumeData({...resumeData, name: e.currentTarget.textContent || ""})}
              >{resumeData.name}</h2>
              <p 
                className="text-lg font-bold text-pink-600 outline-none"
                contentEditable
                suppressContentEditableWarning={true}
                onBlur={(e) => setResumeData({...resumeData, role: e.currentTarget.textContent || ""})}
              >{resumeData.role}</p>
              
              {/* Contact Info Row */}
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
                {resumeData.email && <span>{resumeData.email}</span>}
                {resumeData.phone && <span>• {resumeData.phone}</span>}
                {resumeData.linkedin && <span>• {resumeData.linkedin}</span>}
                {resumeData.github && <span>• {resumeData.github}</span>}
              </div>
            </div>

            {/* Skills section */}
            <div>
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 print:text-gray-600">Skills & Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map(skill => (
                  <span key={skill} className="group relative px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium print:bg-white">
                    {skill}
                    <button 
                      onClick={() => removeSkill(skill)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all print:hidden"
                    >
                      <Trash2 size={8} />
                    </button>
                  </span>
                ))}
                <button 
                  onClick={addSkill}
                  className="px-3 py-1 border border-dashed border-pink-200 rounded-lg text-sm text-pink-400 hover:border-pink-400 hover:text-pink-600 transition-all print:hidden"
                >
                  <Plus size={14} className="inline mr-1" /> Add Skill
                </button>
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-6">
              <div className="flex justify-between items-center print:hidden">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Experience</h4>
                <button 
                  onClick={addExperience}
                  className="text-xs font-bold text-pink-500 hover:text-pink-600 flex items-center gap-1"
                >
                  <Plus size={14} /> Add Experience
                </button>
              </div>
              <h4 className="hidden print:block text-xs font-black text-gray-400 uppercase tracking-widest mb-4 text-gray-600">Experience</h4>

              {resumeData.experience.map((exp) => (
                <div key={exp.id} className="group relative space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 
                        className="font-bold text-gray-800 outline-none" 
                        contentEditable
                        suppressContentEditableWarning={true}
                        onBlur={(e) => updateExperience(exp.id, "position", e.currentTarget.textContent)}
                      >{exp.position}</h5>
                      <p 
                        className="text-sm text-gray-600 outline-none"
                        contentEditable
                        suppressContentEditableWarning={true}
                        onBlur={(e) => updateExperience(exp.id, "company", e.currentTarget.textContent)}
                      >{exp.company}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span 
                        className="text-xs text-gray-400 font-medium outline-none"
                        contentEditable
                        suppressContentEditableWarning={true}
                        onBlur={(e) => updateExperience(exp.id, "period", e.currentTarget.textContent)}
                        >{exp.period}</span>
                      <button 
                        onClick={() => setResumeData(prev => ({...prev, experience: prev.experience.filter(e => e.id !== exp.id)}))}
                        className="p-1.5 text-red-400 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100 print:hidden"
                        title="Remove Experience"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {exp.bullets.map((bullet, idx) => (
                      <li 
                        key={idx} 
                        className="group/bullet relative outline-none pl-1"
                        contentEditable
                        suppressContentEditableWarning={true}
                        onBlur={(e) => {
                          const newBullets = [...exp.bullets];
                          newBullets[idx] = e.currentTarget.textContent || "";
                          updateExperience(exp.id, "bullets", newBullets);
                        }}
                      >
                        {bullet}
                        
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 flex items-center gap-1 opacity-0 group-hover/bullet:opacity-100 transition-all print:hidden">
                          <button 
                            onClick={() => handleImproveSingleBullet(exp.id, idx, bullet)}
                            className="p-1 bg-indigo-100 text-indigo-600 rounded-md hover:bg-indigo-200 transition-colors"
                            title="Improve with AI"
                          >
                            {optimizingBulletIdx?.expId === exp.id && optimizingBulletIdx?.bulletIdx === idx 
                              ? <Loader2 size={12} className="animate-spin" /> 
                              : <Zap size={12} />}
                          </button>
                          <button 
                            onClick={() => {
                              const newBullets = exp.bullets.filter((_, i) => i !== idx);
                              updateExperience(exp.id, "bullets", newBullets);
                            }}
                            className="p-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => {
                      const newBullets = [...exp.bullets, "Add a custom responsibility..."];
                      updateExperience(exp.id, "bullets", newBullets);
                    }}
                    className="mt-2 text-[10px] font-bold text-gray-400 hover:text-pink-500 flex items-center gap-1 transition-all print:hidden"
                  >
                    <Plus size={12} /> Add Bullet
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Final Structure */}
      <div className="print:hidden h-fit sticky top-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 shadow-sm">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">AI Actions</h3>
          
          <div className="space-y-3">
            {/* Action 1: Scan */}
            <div className="space-y-2">
              <button 
                onClick={handleATSCheck}
                disabled={isCheckingAts}
                className="w-full py-4 px-4 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all flex items-center gap-2 group"
              >
                <BarChart3 size={16} className="text-gray-400 group-hover:text-pink-500 transition-colors" />
                <span>{isCheckingAts ? "Scanning..." : "Scan Resume"}</span>
              </button>
              
              {!atsResult && !isCheckingAts && (
                <p className="text-[10px] text-gray-400 px-1 italic">Identify improvements instantly</p>
              )}

              {atsResult && !isCheckingAts && (
                <div className="space-y-3 px-1 animate-in fade-in">
                  <div className="flex items-center gap-2 text-[11px] font-black text-gray-500 uppercase tracking-widest">
                    <Lightbulb size={12} className="text-pink-500" /> Improvement Suggestions
                  </div>
                  <div className="space-y-2">
                    {atsResult.suggestions.slice(0, 4).map((s, i) => (
                      <div key={i} className="flex gap-2 text-[11px] text-gray-600 leading-relaxed font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-1.5 shrink-0" />
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action 2: Improve */}
            <button 
              onClick={handleOptimizeAll}
              disabled={isOptimizing}
              className="w-full py-4 px-4 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all flex items-center gap-2"
            >
              {isOptimizing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              <span>{isOptimizing ? "Improving..." : "Improve Bullets"}</span>
            </button>

            {/* Action 3: Download */}
            <button 
              onClick={handleDownloadPDF}
              className="w-full py-4 px-4 bg-gray-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
            >
              <Download size={16} />
              <span>Download PDF</span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-center gap-1 text-[9px] font-bold text-gray-300 uppercase tracking-tighter">
            <CheckCircle size={10} /> Saved to Cloud
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
            -webkit-print-color-adjust: exact;
          }
          #resume-content, #resume-content * {
            visibility: visible;
          }
          #resume-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
            background: white;
          }
          .print\:hidden, button, .lucide {
            display: none !important;
          }
          /* Remove browser headers/footers */
          @page {
            margin: 0.5cm;
            size: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default ResumeBuilder;
