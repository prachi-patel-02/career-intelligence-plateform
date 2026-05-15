"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import { ROLE_SKILLS } from "@/lib/roles";
import { getRoadmap } from "@/lib/skillData";
import { useAuth } from "@/context/authContext";
import { apiUpdateSkills, apiSaveOnboarding } from "@/lib/api";

/* ================= TYPES ================= */

export interface Task {
  id: string;
  title: string;
  type: 'concept' | 'task' | 'project' | 'interview' | 'custom';
  description?: string;
  stage?: string;
  resource?: string;
  resumeReady?: boolean;
  completed: boolean;
}

export interface Skill {
  id: string;
  name: string;
  tasks: Task[];
}

interface SkillContextType {
  skills: Skill[];
  role: string;
  onboardingComplete: boolean;
  overallProgress: number;

  setSkillsFromRole: (role: string, selectedSkills?: string[]) => Promise<void>;
  addSkillWithRoadmap: (skillName: string, roadmap: any) => Promise<void>;
  addCustomTask: (skillId: string, taskTitle: string) => Promise<void>;
  toggleTask: (skillId: string, taskId: string) => void;
  calculateProgress: () => number;
  completeOnboarding: () => void;
}

/* ================= HELPERS ================= */

/**
 * Build the full skills array for a role, marking selected skills as completed.
 */
function buildSkillsForRole(role: string, completedSkillNames: string[] = []): Skill[] {
  const requiredSkills = ROLE_SKILLS[role] || [];
  const completedSet = new Set(completedSkillNames);

  return requiredSkills.map((skillName) => {
    const roadmap = getRoadmap(skillName);
    const isCompleted = completedSet.has(skillName);

    return {
      id: skillName.toLowerCase().replace(/\s+/g, "-"),
      name: skillName,
      tasks: roadmap.steps.map((step, index) => ({
        id: `${skillName.toLowerCase().replace(/\s+/g, "-")}-${index}`,
        title: step.stage,
        type: 'concept',
        stage: step.stage,
        description: step.description,
        resource: step.resource,
        completed: isCompleted,
      })),
    };
  });
}

/* ================= CONTEXT ================= */

const SkillContext = createContext<SkillContextType | undefined>(undefined);

/* ================= PROVIDER ================= */

export function SkillProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading, updateUserLocal } = useAuth();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [role, setRole] = useState("");
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  /* ===== HYDRATE FROM AUTH USER ===== */

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // No user logged in — reset state
      setSkills([]);
      setRole("");
      setOnboardingComplete(false);
      return;
    }

    // Set role from backend
    setRole(user.role || "");
    setOnboardingComplete(user.onboardingCompleted || false);

    // If user has skills stored in DB, use those
    if (user.skills && user.skills.length > 0) {
      setSkills(user.skills as Skill[]);
    } else if (user.role && ROLE_SKILLS[user.role]) {
      // User has a role but no skills yet — bootstrap from role definition
      const bootstrapped = buildSkillsForRole(
        user.role,
        user.selectedSkills || []
      );
      setSkills(bootstrapped);
    } else {
      setSkills([]);
    }
  }, [user, authLoading]);

  /* ===== PROGRESS ===== */

  const calculateProgress = useCallback(() => {
    if (!skills || skills.length === 0) return 0;

    let totalTasks = 0;
    let completedTasks = 0;

    skills.forEach((skill) => {
      if (skill && skill.tasks) {
        totalTasks += skill.tasks.length;
        completedTasks += skill.tasks.filter((t) => t && t.completed).length;
      }
    });

    if (totalTasks === 0) return 0;

    return Math.round((completedTasks / totalTasks) * 100);
  }, [skills]);

  /* ===== SET ROLE + SKILLS (during onboarding) ===== */

  const setSkillsFromRole = async (newRole: string, selectedSkills?: string[]) => {
    const initialSkills = buildSkillsForRole(newRole, selectedSkills || []);

    // Optimistic UI update
    setRole(newRole);
    setSkills(initialSkills);
    setOnboardingComplete(true);

    // Persist to backend
    try {
      const { user: updatedUser } = await apiSaveOnboarding({
        role: newRole,
        selectedSkills: selectedSkills || [],
        skills: initialSkills,
      });

      // Sync auth context with response
      updateUserLocal(updatedUser);
    } catch (err) {
      console.error("Failed to save onboarding:", err);
    }
  };

  /* ===== TOGGLE TASK ===== */

  const toggleTask = (skillId: string, taskId: string) => {
    setSkills((prev) => {
      const updated = prev.map((skill) => {
        if (skill.id !== skillId) return skill;

        const updatedTasks = skill.tasks.map((task) => {
          if (task.id !== taskId) return task;
          return { ...task, completed: !task.completed };
        });

        return { ...skill, tasks: updatedTasks };
      });

      // Persist to backend (fire-and-forget)
      apiUpdateSkills(updated).catch((err) =>
        console.error("Failed to update skills:", err)
      );

      return updated;
    });
  };

  /* ===== ADD SKILL WITH ROADMAP ===== */

  const addSkillWithRoadmap = async (skillName: string, roadmap: any) => {
    const newSkill: Skill = {
      id: skillName.toLowerCase().replace(/\s+/g, "-"),
      name: skillName,
      tasks: roadmap.stages.flatMap((stage: any) => 
        stage.items.map((item: any, i: number) => ({
          ...item,
          id: `${skillName.toLowerCase().replace(/\s+/g, "-")}-${stage.title.toLowerCase()}-${i}`,
          stage: stage.title,
          completed: false
        }))
      )
    };

    const updatedSkills = [...skills, newSkill];
    setSkills(updatedSkills);

    try {
      const { user: updatedUser } = await apiUpdateSkills(updatedSkills);
      updateUserLocal(updatedUser);
    } catch (err) {
      console.error("Failed to add skill roadmap:", err);
    }
  };

  /* ===== ADD CUSTOM TASK ===== */

  const addCustomTask = async (skillId: string, taskTitle: string) => {
    const updatedSkills = skills.map(skill => {
      if (skill.id !== skillId) return skill;
      const newTask: Task = {
        id: `custom-${Date.now()}`,
        title: taskTitle,
        type: 'custom',
        completed: false
      };
      return { ...skill, tasks: [...skill.tasks, newTask] };
    });

    setSkills(updatedSkills);

    try {
      const { user: updatedUser } = await apiUpdateSkills(updatedSkills);
      updateUserLocal(updatedUser);
    } catch (err) {
      console.error("Failed to add custom task:", err);
    }
  };

  /* ===== COMPLETE ONBOARDING ===== */

  const completeOnboarding = () => {
    setOnboardingComplete(true);
  };

  /* ===== CONTEXT VALUE ===== */

  return (
    <SkillContext.Provider
      value={{
        skills,
        role,
        onboardingComplete,
        overallProgress: calculateProgress(),

        setSkillsFromRole,
        addSkillWithRoadmap,
        addCustomTask,
        toggleTask,
        calculateProgress,
        completeOnboarding,
      }}
    >
      {children}
    </SkillContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useSkills() {
  const context = useContext(SkillContext);

  if (!context) {
    throw new Error("useSkills must be used within a SkillProvider");
  }

  return context;
}
