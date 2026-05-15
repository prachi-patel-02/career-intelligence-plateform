import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/authContext";
import { apiUpdateBloom } from "@/lib/api";

export type Difficulty = "easy" | "medium" | "hard";

export interface Task {
  id: string;
  skill: string;
  question: string;
  difficulty: Difficulty;
}

export const tasks: Task[] = [
  { id: "html-1", skill: "HTML", question: "Create a basic HTML button", difficulty: "easy" },
  { id: "html-2", skill: "HTML", question: "What is semantic HTML?", difficulty: "easy" },
  { id: "html-3", skill: "HTML", question: "Build a functional form with validation", difficulty: "medium" },
  
  { id: "css-1", skill: "CSS", question: "Center a div using flexbox", difficulty: "medium" },
  { id: "css-2", skill: "CSS", question: "Create a responsive CSS Grid layout", difficulty: "medium" },
  { id: "css-3", skill: "CSS", question: "Implement a dark mode toggle using CSS variables", difficulty: "hard" },
  
  { id: "js-1", skill: "JavaScript", question: "Write a function to reverse a string", difficulty: "easy" },
  { id: "js-2", skill: "JavaScript", question: "Explain closures with an example", difficulty: "medium" },
  { id: "js-3", skill: "JavaScript", question: "Implement a custom debounce function", difficulty: "hard" },
  
  { id: "react-1", skill: "React", question: "Create a counter component using useState", difficulty: "easy" },
  { id: "react-2", skill: "React", question: "Fetch data using useEffect on mount", difficulty: "medium" },
  { id: "react-3", skill: "React", question: "Implement a custom hook for local storage", difficulty: "hard" }
];

export const getTasksForSkill = (skillName: string): Task[] => {
  return tasks.filter(t => t.skill.toLowerCase() === skillName.toLowerCase());
};

export const getBloomPointsForTask = (difficulty: Difficulty): number => {
  switch (difficulty) {
    case "easy": return 1;
    case "medium": return 2;
    case "hard": return 3;
    default: return 0;
  }
};

export const getBloomPoints = (completedTasks: string[]): number => {
  let points = 0;
  completedTasks.forEach(taskId => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      points += getBloomPointsForTask(task.difficulty);
    }
  });
  return points;
};

export const useBloomTasks = () => {
  const { user } = useAuth();
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  // Hydrate from user's backend data
  useEffect(() => {
    if (user) {
      setCompletedTasks(user.bloomTasks || []);
    } else {
      setCompletedTasks([]);
    }
  }, [user]);

  const completeTask = useCallback((taskId: string) => {
    setCompletedTasks((prev) => {
      if (prev.includes(taskId)) return prev; // Cannot complete twice
      const updated = [...prev, taskId];

      // Persist to backend (fire-and-forget)
      apiUpdateBloom(updated).catch((err) =>
        console.error("Failed to update bloom tasks:", err)
      );

      // Dispatch event for same-window reactivity
      window.dispatchEvent(new Event("bloomTasksUpdated"));

      return updated;
    });
  }, []);

  return { completedTasks, completeTask };
};
