/**
 * Centralized API client for the Career Intelligence Platform.
 * Every request attaches the JWT token from localStorage.
 * Handles 401 responses by clearing auth and redirecting.
 */

import { API_ENDPOINTS } from "./apiConfig";

// ─── Token helpers ───
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const setToken = (token: string) => {
  localStorage.setItem("token", token);
};

export const clearToken = () => {
  localStorage.removeItem("token");
};

// ─── Base fetch wrapper ───
async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  // Handle unauthorized — token expired or invalid
  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Session expired. Please log in again.");
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "API request failed");
  }

  return data as T;
}

// ─── Types ───
export interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  selectedSkills: string[];
  onboardingCompleted: boolean;
  skills: {
    id: string;
    name: string;
    tasks: { id: string; title: string; completed: boolean }[];
  }[];
  assessmentTests: Record<string, any>;
  assessmentResults: Record<string, any>;
  assessmentBestScores: Record<string, number>;
  bloomTasks: string[];
  streak: { current: number; lastActiveDate: string };
  resumeData: any;
  cachedRoadmap: any;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  message: string;
  token: string;
  user: UserData;
}

interface UserResponse {
  message?: string;
  user: UserData;
}

// ─── Auth API ───
export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function apiSignup(name: string, email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(API_ENDPOINTS.AUTH.SIGNUP, {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

// ─── User API (all protected) ───
export async function apiFetchProfile(): Promise<UserResponse> {
  return apiFetch<UserResponse>(API_ENDPOINTS.USER.PROFILE, {
    method: "GET",
  });
}

export async function apiSaveOnboarding(data: {
  role: string;
  selectedSkills: string[];
  skills: any[];
}): Promise<UserResponse> {
  return apiFetch<UserResponse>(API_ENDPOINTS.USER.ONBOARDING, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiUpdateSkills(skills: any[]): Promise<UserResponse> {
  return apiFetch<UserResponse>(API_ENDPOINTS.USER.SKILLS, {
    method: "PUT",
    body: JSON.stringify({ skills }),
  });
}

export async function apiUpdateAssessments(data: {
  assessmentTests?: Record<string, any>;
  assessmentResults?: Record<string, any>;
  assessmentBestScores?: Record<string, number>;
}): Promise<UserResponse> {
  return apiFetch<UserResponse>(API_ENDPOINTS.USER.ASSESSMENTS, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function apiUpdateBloom(bloomTasks: string[]): Promise<UserResponse> {
  return apiFetch<UserResponse>(API_ENDPOINTS.USER.BLOOM, {
    method: "PUT",
    body: JSON.stringify({ bloomTasks }),
  });
}

export async function apiSaveResume(resumeData: any): Promise<UserResponse> {
  return apiFetch<UserResponse>(API_ENDPOINTS.USER.RESUME, {
    method: "PUT",
    body: JSON.stringify({ resumeData }),
  });
}

export async function apiSaveCachedRoadmap(cachedRoadmap: any): Promise<UserResponse> {
  return apiFetch<UserResponse>(API_ENDPOINTS.USER.CACHED_ROADMAP, {
    method: "PUT",
    body: JSON.stringify({ cachedRoadmap }),
  });
}
