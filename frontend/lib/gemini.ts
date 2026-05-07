export async function generateRoadmap(role: string) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_api_key_here") {
    throw new Error("Gemini API key is missing. Please add it to your .env.local file.");
  }

  const prompt = `Generate a complete step-by-step learning roadmap for becoming a ${role}. 
Return ONLY valid JSON in this format:
{
  "stages": [
    {
      "title": "Beginner",
      "topics": [
        {
          "name": "HTML",
          "subtopics": ["Tags", "Forms"],
          "projects": ["Build a basic webpage"]
        }
      ]
    }
  ]
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            response_mime_type: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to call Gemini API");
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Invalid response from Gemini API");
    }

    // Attempt to parse the JSON response
    try {
      return JSON.parse(text);
    } catch (parseError) {
      // In case Gemini returns markdown-wrapped JSON despite the generationConfig
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error("Failed to parse roadmap data");
    }
  } catch (error) {
    console.error("Error generating roadmap:", error);
    throw error;
  }
}

/* ================= SKILL ASSESSMENT ================= */

export interface AssessmentQuestion {
  type: "mcq" | "fill" | "short";
  question: string;
  options?: string[];
  answer: string;
}

export interface AssessmentData {
  skill: string;
  questions: AssessmentQuestion[];
}

export async function generateSkillAssessment(
  skillName: string,
  roleName: string
): Promise<AssessmentData> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_api_key_here") {
    throw new Error(
      "Gemini API key is missing. Please add it to your .env.local file."
    );
  }

  const prompt = `Generate a structured assessment test for the skill: ${skillName} based on the role: ${roleName}.

Requirements:
- Total 30 to 40 questions
- Difficulty: beginner to intermediate
- Mix of:
  1. Multiple Choice Questions (MCQ)
  2. Fill in the blanks
  3. Short answer questions

Return ONLY valid JSON in this format:
{
  "skill": "${skillName}",
  "questions": [
    {
      "type": "mcq",
      "question": "",
      "options": ["", "", "", ""],
      "answer": ""
    },
    {
      "type": "fill",
      "question": "",
      "answer": ""
    },
    {
      "type": "short",
      "question": "",
      "answer": ""
    }
  ]
}

Rules:
- Do NOT include explanations
- Do NOT include extra text outside JSON
- Ensure answers are correct and concise
- Keep questions relevant to real-world usage`;

  const models = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.0-flash-exp",
    "gemini-2.0-flash",
  ];

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
              generationConfig: {
                response_mime_type: "application/json",
              },
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          const errMsg = errorData.error?.message || "";

          // If quota exceeded, try next model
          if (errMsg.includes("Quota exceeded") || errMsg.includes("quota")) {
            console.warn(`Quota exceeded for ${model}, trying next model...`);
            break; // break retry loop, move to next model
          }

          // If rate limited with retry time, wait and retry
          const retryMatch = errMsg.match(/retry in ([\d.]+)s/i);
          if (retryMatch && attempt === 0) {
            const waitSec = Math.min(parseFloat(retryMatch[1]) + 1, 30);
            console.warn(`Rate limited on ${model}, retrying in ${waitSec}s...`);
            await new Promise((r) => setTimeout(r, waitSec * 1000));
            continue;
          }

          throw new Error(errMsg || "Failed to call Gemini API");
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
          throw new Error("Invalid response from Gemini API");
        }

        try {
          return JSON.parse(text) as AssessmentData;
        } catch {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]) as AssessmentData;
          }
          throw new Error("Failed to parse assessment data");
        }
      } catch (error: any) {
        // If it's our quota break, don't log — we already warned
        if (error.message?.includes("Quota exceeded")) break;

        // Last model, last attempt — throw
        if (model === models[models.length - 1] && attempt === 1) {
          console.error("Error generating skill assessment:", error);
          throw error;
        }
      }
    }
  }

  console.warn("All Gemini models rate-limited, returning fallback assessment data.");
  return {
    skill: skillName,
    questions: [
      {
        type: "mcq",
        question: `What is the primary role of ${skillName} in a ${roleName} context?`,
        options: [
          "Styling the user interface",
          "Handling core logic and functionality",
          "Managing server infrastructure",
          "Optimizing network requests"
        ],
        answer: "Handling core logic and functionality"
      },
      {
        type: "mcq",
        question: `Which of the following is a key benefit of mastering ${skillName}?`,
        options: [
          "Reduced code maintainability",
          "Increased technical debt",
          "Improved development efficiency and robust solutions",
          "Slower application performance"
        ],
        answer: "Improved development efficiency and robust solutions"
      },
      {
        type: "fill",
        question: `A common best practice in ${skillName} is to write clean and modular _____.`,
        answer: "code"
      },
      {
        type: "short",
        question: `Explain in a few words why ${skillName} is important for a ${roleName}.`,
        answer: "It is essential for building robust and scalable solutions."
      },
      {
        type: "mcq",
        question: `When debugging an issue related to ${skillName}, what is the recommended first step?`,
        options: [
          "Rewrite the entire codebase",
          "Ignore the error and hope it goes away",
          "Analyze the error logs and trace the execution flow",
          "Change the programming language"
        ],
        answer: "Analyze the error logs and trace the execution flow"
      }
    ]
  };
}

/* ================= RESUME AI ASSISTANT ================= */

export async function optimizeResumeBullet(bullet: string, role: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_api_key_here") throw new Error("API Key missing");

  const prompt = `You are a professional resume writer. Optimize the following resume bullet point for a ${role} position. 
  Make it more impactful, use strong action verbs, and include quantifiable results if possible.
  Keep it concise (one sentence).
  
  Bullet: ${bullet}
  
  Return ONLY the optimized bullet text.`;

  const models = ["gemini-1.5-flash", "gemini-pro", "gemini-1.5-pro"];

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
            ],
          }),
        }
      );

      if (!response.ok) continue;

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch (err) {
      console.warn(`Model ${model} failed, trying next...`);
    }
  }
  return bullet;
}

export async function checkResumeKeywords(resumeText: string, role: string): Promise<{ 
  score: number; 
  breakdown: { content: number; keywords: number; formatting: number; impact: number };
  missing: string[]; 
  suggestions: string[];
  feedback: string 
}> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_api_key_here") throw new Error("API Key missing");

  const prompt = `Analyze this resume text for a ${role} role. 
  Identify missing industry-standard keywords and give an ATS compatibility score (0-100).
  
  Resume: ${resumeText}
  
  Return ONLY valid JSON in this format:
  {
    "score": 85,
    "breakdown": { "content": 90, "keywords": 80, "formatting": 95, "impact": 75 },
    "missing": ["Docker", "Kubernetes"],
    "suggestions": ["Add more quantifiable achievements", "Include cloud platforms like AWS or GCP"],
    "feedback": "Overall strong, but consider adding containerization skills."
  }`;

  const models = ["gemini-1.5-flash", "gemini-pro", "gemini-1.5-pro"];

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { response_mime_type: "application/json" },
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
            ],
          }),
        }
      );

      if (!response.ok) continue;

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) continue;

      try {
        return JSON.parse(text);
      } catch (parseError) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        continue;
      }
    } catch (err) {
      console.warn(`Model ${model} failed in keyword check, trying next...`);
    }
  }

  return { 
    score: 0, 
    breakdown: { content: 0, keywords: 0, formatting: 0, impact: 0 },
    missing: [], 
    suggestions: [],
    feedback: "Failed to analyze resume after trying multiple models." 
  };
}

export async function generateExperienceBullets(role: string, skills: string[]): Promise<string[]> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_api_key_here") throw new Error("API Key missing");

  const prompt = `Generate 3 professional resume bullet points for a ${role} position.
  Key skills to highlight: ${skills.join(", ")}.
  Focus on accomplishments, technical proficiency, and measurable impact.
  
  Return ONLY a JSON array of strings:
  ["Bullet point 1", "Bullet point 2", "Bullet point 3"]`;

  const models = ["gemini-1.5-flash", "gemini-pro", "gemini-1.5-pro"];

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { response_mime_type: "application/json" },
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
            ],
          }),
        }
      );

      if (!response.ok) continue;

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) continue;

      try {
        return JSON.parse(text);
      } catch {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        continue;
      }
    } catch (err) {
      console.warn(`Model ${model} failed in bullet generation, trying next...`);
    }
  }

  return [
    `Implemented core features for ${role} applications using ${skills[0] || "modern technologies"}.`,
    `Optimized performance and scalability of frontend components.`,
    `Collaborated with cross-functional teams to deliver high-quality code.`
  ];
}

export async function getResumeHints(resumeText: string): Promise<string[]> {
  const hints: string[] = [];
  
  // Heuristic: Check for metrics
  if (!/\d+%|\d+x|\$\d+/.test(resumeText)) {
    hints.push("Try adding quantifiable metrics (%, $, numbers) to show impact.");
  }
  
  // Heuristic: Check for weak verbs
  const weakVerbs = ["made", "did", "helped", "worked on", "responsible for"];
  if (weakVerbs.some(v => resumeText.toLowerCase().includes(v))) {
    hints.push("Replace weak phrases like 'helped' or 'responsible for' with strong action verbs (Led, Developed, Optimized).");
  }
  
  // Heuristic: Check for length
  if (resumeText.length < 500) {
    hints.push("Your resume seems a bit short. Add more detail about your projects and responsibilities.");
  }

  return hints;
}
