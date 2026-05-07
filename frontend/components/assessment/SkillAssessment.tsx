"use client";

import React, { useState, useEffect } from "react";
import {
  Loader2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowLeft,
  Sparkles,
  Trophy,
  AlertCircle,
  ClipboardCheck,
} from "lucide-react";
import { useAssessment, SkillResult } from "@/context/assessmentContext";
import { AssessmentQuestion } from "@/lib/gemini";

interface SkillAssessmentProps {
  skillName: string;
  roleName: string;
  onClose: () => void;
}

type Phase = "loading" | "test" | "results";

const SkillAssessment: React.FC<SkillAssessmentProps> = ({
  skillName,
  roleName,
  onClose,
}) => {
  const {
    getTest,
    generateTest,
    isGenerating,
    generateError,
    submitAnswers,
    getSkillResult,
    getBestScore,
    retryTest,
  } = useAssessment();

  const [phase, setPhase] = useState<Phase>("loading");
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<SkillResult | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  /* ===== LOAD OR GENERATE TEST ===== */

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      // Check if we already have a result — show it
      const existingResult = getSkillResult(skillName);
      const existingTest = getTest(skillName);

      if (existingResult && existingTest) {
        setQuestions(existingTest.questions);
        setAnswers(existingResult.answers);
        setResult(existingResult);
        setPhase("results");
        return;
      }

      // Have cached test but no result — go straight to test
      if (existingTest) {
        setQuestions(existingTest.questions);
        setAnswers(new Array(existingTest.questions.length).fill(""));
        setPhase("test");
        return;
      }

      // Need to generate
      setPhase("loading");
      setLoadError(null);
      try {
        const data = await generateTest(skillName, roleName);
        if (!cancelled) {
          setQuestions(data.questions);
          setAnswers(new Array(data.questions.length).fill(""));
          setPhase("test");
        }
      } catch (err: any) {
        if (!cancelled) {
          setLoadError(err.message || "Failed to generate test");
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillName]);

  /* ===== HANDLERS ===== */

  const handleAnswer = (value: string) => {
    const updated = [...answers];
    updated[currentIdx] = value;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((p) => p + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((p) => p - 1);
    }
  };

  const handleSubmit = () => {
    const res = submitAnswers(skillName, questions, answers);
    setResult(res);
    setPhase("results");
  };

  const handleRetry = () => {
    retryTest(skillName);
    setAnswers(new Array(questions.length).fill(""));
    setCurrentIdx(0);
    setResult(null);
    setShowReview(false);
    setPhase("test");
  };

  const bestScore = getBestScore(skillName);
  const progressPct =
    questions.length > 0
      ? Math.round(((currentIdx + 1) / questions.length) * 100)
      : 0;
  const answeredCount = answers.filter((a) => a.trim() !== "").length;

  /* ===== LOADING STATE ===== */
  if (phase === "loading") {
    return (
      <div className="bg-white rounded-2xl border border-pink-100 p-12 flex flex-col items-center justify-center space-y-5 animate-in fade-in duration-500">
        {loadError || generateError ? (
          <>
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center">
              <AlertCircle size={32} className="text-rose-500" />
            </div>
            <p className="text-rose-600 font-bold text-sm text-center max-w-md">
              {loadError || generateError}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
              >
                Go Back
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-pink-500 text-white rounded-xl font-bold text-sm hover:bg-pink-600 transition-all"
              >
                Retry
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-gradient-to-tr from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-100 animate-pulse">
              <Sparkles size={28} className="text-white" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-gray-900">
                Generating Assessment
              </h3>
              <p className="text-sm text-gray-500 font-medium">
                Creating 30–40 questions for{" "}
                <span className="text-pink-600 font-bold">{skillName}</span>
                ...
              </p>
            </div>
            <Loader2 size={24} className="text-pink-500 animate-spin" />
          </>
        )}
      </div>
    );
  }

  /* ===== RESULTS STATE ===== */
  if (phase === "results" && result) {
    const statusColor =
      result.status === "Completed"
        ? "text-green-600 bg-green-50 border-green-100"
        : result.status === "In Progress"
        ? "text-amber-600 bg-amber-50 border-amber-100"
        : "text-rose-600 bg-rose-50 border-rose-100";

    const circleColor =
      result.status === "Completed"
        ? "#22c55e"
        : result.status === "In Progress"
        ? "#f59e0b"
        : "#ef4444";

    const circumference = 2 * Math.PI * 54;
    const dashOffset = circumference - (circumference * result.percentage) / 100;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm text-gray-500 font-bold hover:text-pink-500 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Skills
          </button>
          {bestScore > 0 && bestScore !== result.percentage && (
            <div className="px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-xl text-xs font-bold text-purple-600">
              Best Score: {bestScore}%
            </div>
          )}
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
          <div className="p-8 flex flex-col md:flex-row items-center gap-8 border-b border-pink-50">
            {/* Circular Progress */}
            <div className="relative w-36 h-36 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke={circleColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-gray-900">
                  {result.percentage}%
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Score
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <h3 className="text-2xl font-black text-gray-900">
                {skillName} Assessment
              </h3>
              <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                <span
                  className={`px-4 py-1.5 rounded-xl text-sm font-bold border ${statusColor}`}
                >
                  {result.status === "Completed"
                    ? "✅ Completed"
                    : result.status === "In Progress"
                    ? "🔄 In Progress"
                    : "🔰 Beginner"}
                </span>
                <span className="text-sm font-medium text-gray-500">
                  {result.score}/{result.total} correct
                </span>
              </div>
              <div className="flex gap-3 justify-center md:justify-start pt-2">
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-pink-100 hover:scale-105 active:scale-95 transition-all"
                >
                  <RotateCcw size={16} /> Retry Test
                </button>
                <button
                  onClick={() => setShowReview(!showReview)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-pink-100 text-gray-700 rounded-xl font-bold text-sm hover:border-pink-300 transition-all"
                >
                  <ClipboardCheck size={16} />{" "}
                  {showReview ? "Hide Review" : "Review Answers"}
                </button>
              </div>
            </div>
          </div>

          {/* Review Section */}
          {showReview && (
            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {questions.map((q, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border ${
                    result.correctFlags[i]
                      ? "bg-green-50/50 border-green-100"
                      : "bg-rose-50/50 border-rose-100"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {result.correctFlags[i] ? (
                        <CheckCircle2
                          size={18}
                          className="text-green-500"
                        />
                      ) : (
                        <XCircle size={18} className="text-rose-500" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-bold text-gray-800">
                        <span className="text-gray-400 mr-1">Q{i + 1}.</span>{" "}
                        {q.question}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 text-xs">
                        <span className="font-bold text-gray-500">
                          Your answer:{" "}
                          <span
                            className={
                              result.correctFlags[i]
                                ? "text-green-700"
                                : "text-rose-700"
                            }
                          >
                            {result.answers[i] || "(blank)"}
                          </span>
                        </span>
                        {!result.correctFlags[i] && (
                          <span className="font-bold text-green-700">
                            Correct: {q.answer}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ===== TEST STATE ===== */
  const currentQ = questions[currentIdx];
  if (!currentQ) return null;

  const isLastQuestion = currentIdx === questions.length - 1;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-sm text-gray-500 font-bold hover:text-pink-500 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Skills
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-400">
            {answeredCount}/{questions.length} answered
          </span>
          {bestScore > 0 && (
            <div className="px-3 py-1 bg-purple-50 border border-purple-100 rounded-lg text-xs font-bold text-purple-600">
              Best: {bestScore}%
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-pink-50 bg-gradient-to-r from-pink-50/50 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-gray-900 text-lg">
              {skillName} Assessment
            </h3>
            <span className="text-sm font-bold text-gray-500">
              Question {currentIdx + 1} of {questions.length}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="p-8">
          {/* Type badge */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                currentQ.type === "mcq"
                  ? "bg-blue-50 text-blue-600 border-blue-100"
                  : currentQ.type === "fill"
                  ? "bg-amber-50 text-amber-600 border-amber-100"
                  : "bg-purple-50 text-purple-600 border-purple-100"
              }`}
            >
              {currentQ.type === "mcq"
                ? "Multiple Choice"
                : currentQ.type === "fill"
                ? "Fill in the Blank"
                : "Short Answer"}
            </span>
          </div>

          {/* Question Text */}
          <h4 className="text-lg font-bold text-gray-900 leading-relaxed mb-6">
            {currentQ.question}
          </h4>

          {/* Answer Input */}
          {currentQ.type === "mcq" && currentQ.options ? (
            <div className="space-y-3">
              {currentQ.options.map((opt, oi) => (
                <button
                  key={oi}
                  onClick={() => handleAnswer(opt)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium text-sm ${
                    answers[currentIdx] === opt
                      ? "border-pink-500 bg-pink-50 text-pink-700 shadow-md shadow-pink-50"
                      : "border-gray-100 bg-white text-gray-700 hover:border-pink-200 hover:bg-pink-50/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        answers[currentIdx] === opt
                          ? "border-pink-500 bg-pink-500"
                          : "border-gray-300"
                      }`}
                    >
                      {answers[currentIdx] === opt && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    {opt}
                  </div>
                </button>
              ))}
            </div>
          ) : currentQ.type === "fill" ? (
            <input
              type="text"
              value={answers[currentIdx] || ""}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Type your answer..."
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-50 outline-none transition-all text-gray-800 font-medium"
            />
          ) : (
            <textarea
              value={answers[currentIdx] || ""}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Write your answer..."
              rows={3}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-50 outline-none transition-all text-gray-800 font-medium resize-none"
            />
          )}
        </div>

        {/* Navigation */}
        <div className="px-8 py-5 border-t border-pink-50 bg-gray-50/50 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={16} /> Previous
          </button>

          {/* Question dots (compact) */}
          <div className="hidden md:flex items-center gap-1 max-w-xs overflow-hidden">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className={`w-2 h-2 rounded-full transition-all shrink-0 ${
                  i === currentIdx
                    ? "bg-pink-500 w-4"
                    : answers[i]?.trim()
                    ? "bg-pink-300"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-100 hover:scale-105 active:scale-95 transition-all"
            >
              <Trophy size={16} /> Submit Test
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-pink-100 hover:scale-105 active:scale-95 transition-all"
            >
              Next <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillAssessment;
