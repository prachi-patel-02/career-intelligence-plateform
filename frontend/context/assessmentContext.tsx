"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  generateSkillAssessment,
  AssessmentData,
  AssessmentQuestion,
} from "@/lib/gemini";

/* ================= TYPES ================= */

export interface SkillResult {
  skillName: string;
  score: number;
  total: number;
  percentage: number;
  status: "Completed" | "In Progress" | "Beginner";
  answers: string[];
  correctFlags: boolean[];
}

interface AssessmentContextType {
  /* Test data */
  getTest: (skillName: string) => AssessmentData | null;
  generateTest: (skillName: string, roleName: string) => Promise<AssessmentData>;
  isGenerating: boolean;
  generateError: string | null;

  /* Results */
  submitAnswers: (
    skillName: string,
    questions: AssessmentQuestion[],
    answers: string[]
  ) => SkillResult;
  getSkillResult: (skillName: string) => SkillResult | null;
  getBestScore: (skillName: string) => number;
  getSkillStatus: (skillName: string) => "Completed" | "In Progress" | "Beginner" | null;

  /* Actions */
  retryTest: (skillName: string) => void;

  /* Overall */
  assessmentProgress: number;
}

/* ================= HELPERS ================= */

function computeStatus(pct: number): "Completed" | "In Progress" | "Beginner" {
  if (pct >= 70) return "Completed";
  if (pct >= 40) return "In Progress";
  return "Beginner";
}

function normalizeAnswer(a: string): string {
  return a.trim().toLowerCase().replace(/[^a-z0-9\s]/g, "");
}

function checkAnswer(userAnswer: string, correctAnswer: string): boolean {
  const norm = normalizeAnswer(userAnswer);
  const correct = normalizeAnswer(correctAnswer);
  if (!norm) return false;

  // Exact match
  if (norm === correct) return true;

  // Contains match (for short answers — if user answer contains the core answer)
  if (correct.length > 3 && norm.includes(correct)) return true;
  if (correct.length > 3 && correct.includes(norm) && norm.length >= correct.length * 0.6)
    return true;

  return false;
}

/* ================= CONTEXT ================= */

const AssessmentContext = createContext<AssessmentContextType | undefined>(
  undefined
);

/* ================= PROVIDER ================= */

export function AssessmentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tests, setTests] = useState<Record<string, AssessmentData>>({});
  const [results, setResults] = useState<Record<string, SkillResult>>({});
  const [bestScores, setBestScores] = useState<Record<string, number>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  /* ===== DETECT USER ===== */

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

    setUserId(getUserId());

    const interval = setInterval(() => {
      const currentId = getUserId();
      if (currentId !== userId) setUserId(currentId);
    }, 1000);

    return () => clearInterval(interval);
  }, [userId]);

  /* ===== STORAGE KEYS ===== */

  const getKeys = useCallback(() => {
    const prefix = userId ? `${userId}_` : "";
    return {
      tests: `${prefix}assessmentTests`,
      results: `${prefix}assessmentResults`,
      best: `${prefix}assessmentBestScores`,
    };
  }, [userId]);

  /* ===== LOAD FROM STORAGE ===== */

  useEffect(() => {
    const keys = getKeys();
    try {
      const storedTests = JSON.parse(
        localStorage.getItem(keys.tests) || "{}"
      );
      setTests(storedTests);
    } catch {
      setTests({});
    }
    try {
      const storedResults = JSON.parse(
        localStorage.getItem(keys.results) || "{}"
      );
      setResults(storedResults);
    } catch {
      setResults({});
    }
    try {
      const storedBest = JSON.parse(
        localStorage.getItem(keys.best) || "{}"
      );
      setBestScores(storedBest);
    } catch {
      setBestScores({});
    }
  }, [getKeys, userId]);

  /* ===== PERSIST HELPERS ===== */

  const saveTests = useCallback(
    (updated: Record<string, AssessmentData>) => {
      const keys = getKeys();
      localStorage.setItem(keys.tests, JSON.stringify(updated));
      setTests(updated);
    },
    [getKeys]
  );

  const saveResults = useCallback(
    (updated: Record<string, SkillResult>) => {
      const keys = getKeys();
      localStorage.setItem(keys.results, JSON.stringify(updated));
      setResults(updated);
    },
    [getKeys]
  );

  const saveBestScores = useCallback(
    (updated: Record<string, number>) => {
      const keys = getKeys();
      localStorage.setItem(keys.best, JSON.stringify(updated));
      setBestScores(updated);
    },
    [getKeys]
  );

  /* ===== GET / GENERATE TEST ===== */

  const getTest = (skillName: string): AssessmentData | null => {
    return tests[skillName] || null;
  };

  const generateTest = async (
    skillName: string,
    roleName: string
  ): Promise<AssessmentData> => {
    // Return cached if exists
    if (tests[skillName]) return tests[skillName];

    setIsGenerating(true);
    setGenerateError(null);

    try {
      const data = await generateSkillAssessment(skillName, roleName);
      const updated = { ...tests, [skillName]: data };
      saveTests(updated);
      return data;
    } catch (err: any) {
      const msg = err.message || "Failed to generate assessment";
      setGenerateError(msg);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  /* ===== SUBMIT ANSWERS ===== */

  const submitAnswers = (
    skillName: string,
    questions: AssessmentQuestion[],
    answers: string[]
  ): SkillResult => {
    let correct = 0;
    const correctFlags: boolean[] = [];

    questions.forEach((q, i) => {
      const isCorrect = checkAnswer(answers[i] || "", q.answer);
      correctFlags.push(isCorrect);
      if (isCorrect) correct++;
    });

    const percentage = Math.round((correct / questions.length) * 100);
    const status = computeStatus(percentage);

    const result: SkillResult = {
      skillName,
      score: correct,
      total: questions.length,
      percentage,
      status,
      answers,
      correctFlags,
    };

    // Save result
    const updatedResults = { ...results, [skillName]: result };
    saveResults(updatedResults);

    // Update best score
    const currentBest = bestScores[skillName] || 0;
    if (percentage > currentBest) {
      const updatedBest = { ...bestScores, [skillName]: percentage };
      saveBestScores(updatedBest);
    }

    return result;
  };

  /* ===== GETTERS ===== */

  const getSkillResult = (skillName: string): SkillResult | null => {
    return results[skillName] || null;
  };

  const getBestScore = (skillName: string): number => {
    return bestScores[skillName] || 0;
  };

  const getSkillStatus = (
    skillName: string
  ): "Completed" | "In Progress" | "Beginner" | null => {
    const best = bestScores[skillName];
    if (best === undefined) return null;
    return computeStatus(best);
  };

  /* ===== RETRY ===== */

  const retryTest = (skillName: string) => {
    const updatedResults = { ...results };
    delete updatedResults[skillName];
    saveResults(updatedResults);
  };

  /* ===== OVERALL PROGRESS ===== */

  const assessmentProgress = (() => {
    const scores = Object.values(bestScores);
    if (scores.length === 0) return 0;
    const sum = scores.reduce((a, b) => a + b, 0);
    return Math.round(sum / scores.length);
  })();

  /* ===== PROVIDE ===== */

  return (
    <AssessmentContext.Provider
      value={{
        getTest,
        generateTest,
        isGenerating,
        generateError,
        submitAnswers,
        getSkillResult,
        getBestScore,
        getSkillStatus,
        retryTest,
        assessmentProgress,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}

/* ================= HOOK ================= */

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error("useAssessment must be used within an AssessmentProvider");
  }
  return context;
}
