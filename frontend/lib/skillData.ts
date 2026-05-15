export const SKILL_ROADMAP: Record<
  string,
  {
    steps: {
      stage: string;
      description: string;
      resource: string;
      resourceLabel: string;
    }[];
  }
> = {
  HTML: {
    steps: [
      {
        stage: "Basics",
        description: "Tags, headings, forms",
        resource: "https://www.w3schools.com/html/",
        resourceLabel: "Learn HTML",
      },
      {
        stage: "Intermediate",
        description: "Semantic HTML & SEO",
        resource: "https://developer.mozilla.org/en-US/docs/Web/HTML",
        resourceLabel: "MDN HTML",
      },
      {
        stage: "Advanced",
        description: "Accessibility & best practices",
        resource: "https://web.dev/accessibility/",
        resourceLabel: "Accessibility Guide",
      },
      {
        stage: "Projects",
        description: "Build landing pages",
        resource: "#",
        resourceLabel: "Practice",
      },
    ],
  },

  CSS: {
    steps: [
      {
        stage: "Basics",
        description: "Selectors, colors, box model",
        resource: "https://www.w3schools.com/css/",
        resourceLabel: "Learn CSS",
      },
      {
        stage: "Flexbox",
        description: "Layout system",
        resource: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
        resourceLabel: "Flexbox Guide",
      },
      {
        stage: "Grid",
        description: "Advanced layouts",
        resource: "https://css-tricks.com/snippets/css/complete-guide-grid/",
        resourceLabel: "Grid Guide",
      },
      {
        stage: "Projects",
        description: "Responsive UI",
        resource: "#",
        resourceLabel: "Build UI",
      },
    ],
  },

  JavaScript: {
    steps: [
      {
        stage: "Basics",
        description: "Variables, loops, functions",
        resource: "https://javascript.info/",
        resourceLabel: "JS Guide",
      },
      {
        stage: "DOM",
        description: "DOM manipulation",
        resource:
          "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model",
        resourceLabel: "DOM Docs",
      },
      {
        stage: "ES6+",
        description: "Promises, async/await",
        resource: "https://javascript.info/async",
        resourceLabel: "Async JS",
      },
      {
        stage: "Projects",
        description: "Interactive apps",
        resource: "#",
        resourceLabel: "Practice",
      },
    ],
  },

  React: {
    steps: [
      {
        stage: "Basics",
        description: "JSX, components",
        resource: "https://react.dev",
        resourceLabel: "React Docs",
      },
      {
        stage: "State",
        description: "Props & state",
        resource: "https://react.dev/learn",
        resourceLabel: "React Learn",
      },
      {
        stage: "Hooks",
        description: "useState, useEffect",
        resource: "https://react.dev/reference/react",
        resourceLabel: "Hooks Docs",
      },
      {
        stage: "Projects",
        description: "Build full apps",
        resource: "#",
        resourceLabel: "Practice Apps",
      },
    ],
  },
  TypeScript: {
    steps: [
      {
        stage: "Basics",
        description: "Types, Interfaces, Enums",
        resource: "https://www.typescriptlang.org/docs/",
        resourceLabel: "TS Docs",
      },
      {
        stage: "Advanced",
        description: "Generics, Utility Types",
        resource: "https://www.typescriptlang.org/docs/handbook/2/generics.html",
        resourceLabel: "Advanced TS",
      },
    ],
  },
  "Next.js": {
    steps: [
      {
        stage: "App Router",
        description: "Pages, Layouts, Routing",
        resource: "https://nextjs.org/docs",
        resourceLabel: "Next.js Docs",
      },
      {
        stage: "Data Fetching",
        description: "Server Components, Suspense",
        resource: "https://nextjs.org/docs/app/building-your-application/data-fetching",
        resourceLabel: "Fetching Guide",
      },
    ],
  },
  "Tailwind CSS": {
    steps: [
      {
        stage: "Utility First",
        description: "Classes, Responsive Design",
        resource: "https://tailwindcss.com/docs",
        resourceLabel: "Tailwind Docs",
      },
      {
        stage: "Configuration",
        description: "tailwind.config.js, Customizing",
        resource: "https://tailwindcss.com/docs/configuration",
        resourceLabel: "Config Guide",
      },
    ],
  },
};

/**
 * Returns structured roadmap steps for a skill.
 * Uses static SKILL_ROADMAP data where available.
 * Falls back to sensible placeholder steps for unknown skills.
 */
export const getRoadmap = (skill: string) => {
  const found = SKILL_ROADMAP[skill];
  if (found) return found;

  return {
    steps: [
      {
        stage: "Foundations",
        description: `Core concepts and fundamentals of ${skill}.`,
        resource: "#",
        resourceLabel: "Learn More",
      },
      {
        stage: "Intermediate",
        description: `Build practical ${skill} skills with real examples.`,
        resource: "#",
        resourceLabel: "Practice",
      },
      {
        stage: "Advanced",
        description: `Deep dive into advanced ${skill} patterns and use cases.`,
        resource: "#",
        resourceLabel: "Advanced Guide",
      },
      {
        stage: "Projects",
        description: `Apply ${skill} in real-world projects.`,
        resource: "#",
        resourceLabel: "Build",
      },
    ],
  };
};
