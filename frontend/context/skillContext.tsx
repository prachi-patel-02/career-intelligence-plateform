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

/* ================= TYPES ================= */

export interface Task {
  id: string;
  title: string;
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

  setSkillsFromRole: (role: string, selectedSkills?: string[]) => void;
  toggleTask: (skillId: string, taskId: string) => void;
  calculateProgress: () => number;
  completeOnboarding: () => void;
}

/* ================= CONTEXT ================= */

const SkillContext = createContext<SkillContextType | undefined>(undefined);

/* ================= PROVIDER ================= */

export function SkillProvider({ children }: { children: React.ReactNode }) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [role, setRole] = useState("");
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  /* ===== DETECT USER CHANGES ===== */

  useEffect(() => {
    const getUserId = () => {
      const userJson = localStorage.getItem("user");
      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          return user.email || user._id || "unknown";
        } catch {
          return "unknown";
        }
      }
      if (localStorage.getItem("isGuest") === "true") return "guest";
      return null;
    };

    // Initial check
    setUserId(getUserId());

    // Poll for changes (since localStorage isn't reactive within the same tab)
    const interval = setInterval(() => {
      const currentId = getUserId();
      if (currentId !== userId) {
        setUserId(currentId);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [userId]);

  /* ===== STORAGE KEYS (PER USER / GUEST) ===== */

  const getStorageKeys = useCallback(() => {
    const prefix = userId ? `${userId}_` : "";
    return {
      role: `${prefix}role`,
      skills: `${prefix}skills`,
      onboarded: `${prefix}onboardingComplete`,
    };
  }, [userId]);

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

  /* ===== LOAD DATA ON START / USER CHANGE ===== */

  useEffect(() => {
    // Don't load data until we know who the user is (email or "guest")
    if (userId === null) return;

    const keys = getStorageKeys();

    // Check pendingRole FIRST (set during onboarding → login flow)
    const pendingRole = localStorage.getItem("pendingRole");
    let storedRole = pendingRole || localStorage.getItem(keys.role) || "";

    let isNewRoleFromOnboarding = false;
    if (pendingRole) {
      isNewRoleFromOnboarding = true;
      // Persist the new role from onboarding under the correct prefixed key
      localStorage.setItem(keys.role, storedRole);
    }

    if (!storedRole) {
      // Fall back to plain keys if still empty
      const fallbackRole =
        localStorage.getItem("role") ||
        localStorage.getItem("role_guest");
        
      if (fallbackRole) {
        storedRole = fallbackRole;
      } else {
        // Auto-generate default role if completely empty
        storedRole = "Frontend Dev";
        localStorage.setItem("role", storedRole); // fallback standard key
      }
      
      // Persist under the correct prefixed key so future loads find it
      localStorage.setItem(keys.role, storedRole);
    }

    // Read completed (onboarding-selected) skills
    let completedSkillNames: string[] = [];
    try {
      // pendingSkills is set during onboarding → login flow
      const pending = localStorage.getItem("pendingSkills");
      const saved = localStorage.getItem(`${keys.skills}_completed`);
      // Also check unprefixed key (data saved before userId was set)
      const unprefixedSaved = localStorage.getItem("skills_completed");
      if (pending) {
        completedSkillNames = JSON.parse(pending);
        // Migrate to the prefixed key and clean up
        localStorage.setItem(`${keys.skills}_completed`, pending);
        localStorage.removeItem("pendingSkills");
        localStorage.removeItem("pendingRole");
      } else if (saved) {
        completedSkillNames = JSON.parse(saved);
      } else if (unprefixedSaved) {
        completedSkillNames = JSON.parse(unprefixedSaved);
        // Migrate to prefixed key
        localStorage.setItem(`${keys.skills}_completed`, unprefixedSaved);
      }
    } catch {
      completedSkillNames = [];
    }

    const storedOnboarded = localStorage.getItem(keys.onboarded) === "true";

    let rawSkills: any[] = [];
    if (!isNewRoleFromOnboarding) {
      try {
        rawSkills = JSON.parse(localStorage.getItem(keys.skills) || "[]");
      } catch {
        rawSkills = [];
      }
    } else {
      // Clear out the old role's skills so we can cleanly bootstrap the new ones
      localStorage.removeItem(keys.skills);
    }

    // Fallback: check unprefixed "skills" key (data saved before userId was set)
    if (rawSkills.length === 0 && !isNewRoleFromOnboarding) {
      try {
        const unprefixedSkills = localStorage.getItem("skills");
        if (unprefixedSkills) {
          rawSkills = JSON.parse(unprefixedSkills);
          // Migrate to prefixed key
          localStorage.setItem(keys.skills, unprefixedSkills);
        }
      } catch {
        // ignore
      }
    }

    setRole(storedRole);
    setOnboardingComplete(storedOnboarded);

    // 1. Ensure formattedSkills is a list of Skill objects
    let formattedSkills: Skill[] = [];
    if (rawSkills.length > 0 && typeof rawSkills[0] === "string") {
      formattedSkills = (rawSkills as string[]).map((skillName) => {
        const roadmap = getRoadmap(skillName);
        return {
          id: skillName.toLowerCase().replace(/\s+/g, "-"),
          name: skillName,
          tasks: roadmap.steps.map((step, index) => ({
            id: `${skillName.toLowerCase()}-${index}`,
            title: step.stage,
            completed: false,
          })),
        };
      });
    } else {
      formattedSkills = rawSkills as Skill[];
    }

    // 2. Bootstrap default skills from ROLE_SKILLS when nothing is stored yet
    if (formattedSkills.length === 0 && storedRole && ROLE_SKILLS[storedRole]) {
      const defaultSkillNames = ROLE_SKILLS[storedRole];
      formattedSkills = defaultSkillNames.map((skillName) => {
        const isCompleted = completedSkillNames.includes(skillName);
        const roadmap = getRoadmap(skillName);
        return {
          id: skillName.toLowerCase().replace(/\s+/g, "-"),
          name: skillName,
          tasks: roadmap.steps.map((step, index) => ({
            id: `${skillName.toLowerCase()}-${index}`,
            title: step.stage,
            completed: isCompleted,
          })),
        };
      });
    }

    // 2b. Apply completed status to existing skills if not already applied
    if (completedSkillNames.length > 0 && formattedSkills.length > 0) {
      formattedSkills = formattedSkills.map((skill) => {
        if (completedSkillNames.includes(skill.name)) {
          const allDone = skill.tasks.every((t) => t.completed);
          if (!allDone) {
            return {
              ...skill,
              tasks: skill.tasks.map((t) => ({ ...t, completed: true })),
            };
          }
        }
        return skill;
      });
    }

    // 3. Sync with Role — add any missing skills that the role requires
    if (storedRole && ROLE_SKILLS[storedRole] && formattedSkills.length > 0) {
      const requiredNames = ROLE_SKILLS[storedRole];
      const currentNames = formattedSkills.map((s) => s.name);
      const missingNames = requiredNames.filter((name) => !currentNames.includes(name));

      if (missingNames.length > 0) {
        console.log("Syncing missing skills for role:", storedRole, missingNames);
        const missingSkills: Skill[] = missingNames.map((skillName) => {
          const roadmap = getRoadmap(skillName);
          return {
            id: skillName.toLowerCase().replace(/\s+/g, "-"),
            name: skillName,
            tasks: roadmap.steps.map((step, index) => ({
              id: `${skillName.toLowerCase()}-${index}`,
              title: step.stage,
              completed: false,
            })),
          };
        });
        formattedSkills = [...formattedSkills, ...missingSkills];
      }
    }

    // 4. Final Update
    setSkills(formattedSkills);
    
    const skillsString = JSON.stringify(formattedSkills);
    if (skillsString !== localStorage.getItem(keys.skills)) {
      localStorage.setItem(keys.skills, skillsString);
    }
  }, [getStorageKeys, userId]);

  /* ===== SET ROLE + SKILLS ===== */

  const setSkillsFromRole = (newRole: string, selectedSkills?: string[]) => {
    const keys = getStorageKeys();

    const requiredSkills = ROLE_SKILLS[newRole] || [];
    const completedSet = new Set(selectedSkills || []);

    const initialSkills: Skill[] = requiredSkills.map((skillName) => {
      const roadmap = getRoadmap(skillName);
      const isCompleted = completedSet.has(skillName);

      const tasks: Task[] = roadmap.steps.map((step, index) => ({
        id: `${skillName.toLowerCase()}-${index}`,
        title: step.stage,
        completed: isCompleted,
      }));

      return {
        id: skillName.toLowerCase().replace(/\s+/g, "-"),
        name: skillName,
        tasks,
      };
    });

    /* SAVE */
    localStorage.setItem(keys.role, newRole);
    localStorage.setItem(keys.skills, JSON.stringify(initialSkills));

    // Persist which skills the user marked as "already known"
    if (selectedSkills && selectedSkills.length > 0) {
      localStorage.setItem(
        `${keys.skills}_completed`,
        JSON.stringify(selectedSkills),
      );
    }

    /* UPDATE STATE */
    setRole(newRole);
    setSkills(initialSkills);
  };

  /* ===== TOGGLE TASK ===== */

  const toggleTask = (skillId: string, taskId: string) => {
    const keys = getStorageKeys();

    setSkills((prev) => {
      const updated = prev.map((skill) => {
        if (skill.id !== skillId) return skill;

        const updatedTasks = skill.tasks.map((task) => {
          if (task.id !== taskId) return task;
          return { ...task, completed: !task.completed };
        });

        return { ...skill, tasks: updatedTasks };
      });

      localStorage.setItem(keys.skills, JSON.stringify(updated));

      return updated;
    });
  };

  /* ===== COMPLETE ONBOARDING ===== */

  const completeOnboarding = () => {
    const keys = getStorageKeys();

    localStorage.setItem(keys.onboarded, "true");
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
