import { useState } from 'react';
import { generateRoadmap } from '@/lib/gemini';

export interface RoadmapTopic {
  name: string;
  subtopics: string[];
  projects: string[];
}

export interface RoadmapStage {
  title: string;
  topics: RoadmapTopic[];
}

export interface RoadmapData {
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
      const data = await generateRoadmap(role);
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
