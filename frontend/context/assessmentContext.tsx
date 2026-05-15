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
import { useAuth } from "@/context/authContext";
import { apiUpdateAssessments } from "@/lib/api";

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
  const { user, isLoading: authLoading } = useAuth();

  const [tests, setTests] = useState<Record<string, AssessmentData>>({});
  const [results, setResults] = useState<Record<string, SkillResult>>({});
  const [bestScores, setBestScores] = useState<Record<string, number>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  /* ===== HYDRATE FROM AUTH USER ===== */

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setTests({});
      setResults({});
      setBestScores({});
      return;
    }

    // Load from user's persisted data
    setTests(user.assessmentTests || {});
    setResults(user.assessmentResults || {});
    setBestScores(user.assessmentBestScores || {});
  }, [user, authLoading]);

  /* ===== PERSIST TO BACKEND ===== */

  const persistAssessments = useCallback(
    (
      updatedTests: Record<string, AssessmentData>,
      updatedResults: Record<string, SkillResult>,
      updatedBest: Record<string, number>
    ) => {
      apiUpdateAssessments({
        assessmentTests: updatedTests,
        assessmentResults: updatedResults,
        assessmentBestScores: updatedBest,
      }).catch((err) => console.error("Failed to persist assessments:", err));
    },
    []
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
      const updatedTests = { ...tests, [skillName]: data };
      setTests(updatedTests);

      // Persist the new test to backend
      persistAssessments(updatedTests, results, bestScores);

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

    // Update results
    const updatedResults = { ...results, [skillName]: result };
    setResults(updatedResults);

    // Update best score
    const currentBest = bestScores[skillName] || 0;
    let updatedBest = bestScores;
    if (percentage > currentBest) {
      updatedBest = { ...bestScores, [skillName]: percentage };
      setBestScores(updatedBest);
    }

    // Persist all to backend
    persistAssessments(tests, updatedResults, updatedBest);

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
    setResults(updatedResults);

    // Persist
    persistAssessments(tests, updatedResults, bestScores);
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
