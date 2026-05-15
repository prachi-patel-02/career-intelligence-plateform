import { useState } from 'react';
import { generateRoadmap } from '@/lib/gemini';

export interface RoadmapItem {
  title: string;
  type: 'concept' | 'task' | 'project' | 'interview';
  description: string;
  resource?: string;
  resumeReady?: boolean;
}

export interface RoadmapStage {
  title: string;
  items: RoadmapItem[];
}

export interface RoadmapData {
  skill?: string;
  stages: RoadmapStage[];
}

export function useRoadmap() {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (role: string) => {
    if (!role.trim()) {
      setError("Please enter a role.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // For role-level roadmaps, we use the role as the skill name too
      const data = await generateRoadmap(role, role);
      setRoadmap(data);
    } catch (err: any) {
      setError(err.message || "Failed to generate roadmap.");
      setRoadmap(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    roadmap,
    loading,
    error,
    generate,
  };
}
