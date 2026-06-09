/**
 * Maps course slugs to the skill card slugs covered in that course.
 * Skills must exist in TIERS from src/lib/skills.ts.
 */
export const COURSE_SKILL_SLUGS: Record<string, string[]> = {
  "ai-augmented-qa": [
    "ai-for-qa-2026",
    "llm-ai-testing",
    "ai-log-debug",
    "visual-ai-testing",
    "test-design-techniques",
    "test-cases-bug-reports",
    "rest-api-testing",
    "soft-skills",
  ],
  "qa-fundamentals": [
    "stlc-sdlc",
    "test-design-techniques",
    "test-cases-bug-reports",
    "testing-types",
    "rest-api-testing",
    "tools-environment",
    "soft-skills",
    "ai-for-qa-2026",
  ],
  "automation-qa": [
    "automation-roadmap-2026",
    "playwright-guide",
    "cypress-vs-playwright",
    "rest-api-testing",
    "graphql-testing",
    "tools-environment",
    "ai-for-qa-2026",
    "visual-ai-testing",
  ],
  "security-performance": [
    "security-testing",
    "rest-api-testing",
    "graphql-testing",
    "tools-environment",
  ],
};
