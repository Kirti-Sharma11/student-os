/**
 * Comprehensive skill detection and categorization
 */

const SKILL_CATEGORIES = {
  frontend: [
    "react",
    "next.js",
    "nextjs",
    "angular",
    "vue",
    "vue.js",
    "svelte",
    "html",
    "css",
    "scss",
    "sass",
    "tailwind",
    "bootstrap",
    "material ui",
    "mui",
    "styled components",
    "webpack",
    "vite",
    "babel",
  ],
  backend: [
    "node.js",
    "nodejs",
    "express",
    "express.js",
    "django",
    "flask",
    "spring boot",
    "spring",
    "fastapi",
    "asp.net",
    "ruby on rails",
    "rails",
    "laravel",
    "php",
    "nestjs",
    "nest",
  ],
  database: [
    "mongodb",
    "mysql",
    "postgresql",
    "postgres",
    "redis",
    "firebase",
    "dynamodb",
    "elasticsearch",
    "cassandra",
    "mariadb",
    "oracle",
    "sql server",
  ],
  programming: [
    "javascript",
    "typescript",
    "java",
    "python",
    "c++",
    "c#",
    "csharp",
    "go",
    "golang",
    "rust",
    "kotlin",
    "swift",
    "objective-c",
    "r",
    "ruby",
    "perl",
    "scala",
    "clojure",
  ],
  cloud: [
    "aws",
    "amazon web services",
    "azure",
    "google cloud",
    "gcp",
    "heroku",
    "vercel",
    "netlify",
    "docker",
    "kubernetes",
    "k8s",
    "terraform",
    "jenkins",
    "gitlab ci",
    "github actions",
  ],
  ai_ml: [
    "machine learning",
    "deep learning",
    "tensorflow",
    "pytorch",
    "keras",
    "scikit-learn",
    "sklearn",
    "pandas",
    "numpy",
    "opencv",
    "nlp",
    "computer vision",
    "neural network",
    "ai",
    "artificial intelligence",
    "generative ai",
    "llm",
    "gpt",
    "bert",
  ],
  devops: [
    "jenkins",
    "gitlab ci",
    "github actions",
    "ci/cd",
    "docker",
    "kubernetes",
    "ansible",
    "terraform",
    "vagrant",
    "prometheus",
    "grafana",
    "elk stack",
  ],
  tools: [
    "git",
    "github",
    "gitlab",
    "bitbucket",
    "jira",
    "slack",
    "postman",
    "insomnia",
    "figma",
    "adobe xd",
    "vs code",
    "vim",
    "intellij",
  ],
  softSkills: [
    "communication",
    "leadership",
    "teamwork",
    "problem solving",
    "collaboration",
    "time management",
    "critical thinking",
    "adaptability",
    "analytical",
    "organizational",
  ],
};

/**
 * Detect skills from resume text
 */
const detectSkills = (text) => {
  const lowerText = text.toLowerCase();
  const detectedSkills = {
    frontend: [],
    backend: [],
    database: [],
    programming: [],
    cloud: [],
    ai_ml: [],
    devops: [],
    tools: [],
    softSkills: [],
  };

  for (const [category, skills] of Object.entries(SKILL_CATEGORIES)) {
    skills.forEach((skill) => {
      // Use word boundaries to avoid partial matches
      const regex = new RegExp(`\\b${skill}\\b`, "gi");
      if (regex.test(lowerText)) {
        detectedSkills[category].push(skill);
      }
    });
  }

  // Remove duplicates
  for (const category in detectedSkills) {
    detectedSkills[category] = [...new Set(detectedSkills[category])];
  }

  return detectedSkills;
};

/**
 * Get flat list of all detected skills
 */
const getAllDetectedSkills = (skillsObj) => {
  return Object.values(skillsObj).flat();
};

/**
 * Suggest missing important skills based on career path detection
 */
const suggestMissingSkills = (text, allSkills) => {
  const lowerText = text.toLowerCase();
  const allDetectedSkills = getAllDetectedSkills(allSkills);

  // Detect career path
  let careerPath = null;

  if (
    lowerText.includes("react") ||
    lowerText.includes("angular") ||
    lowerText.includes("vue")
  ) {
    careerPath = "web_developer";
  } else if (
    lowerText.includes("data") &&
    (lowerText.includes("analysis") || lowerText.includes("analytics"))
  ) {
    careerPath = "data_analyst";
  } else if (
    lowerText.includes("machine learning") ||
    lowerText.includes("deep learning") ||
    lowerText.includes("neural")
  ) {
    careerPath = "ai_engineer";
  } else if (
    lowerText.includes("backend") ||
    lowerText.includes("api") ||
    lowerText.includes("server")
  ) {
    careerPath = "backend_developer";
  }

  const skillRecommendations = {
    web_developer: [
      "react",
      "typescript",
      "tailwind",
      "node.js",
      "mongodb",
      "docker",
      "git",
    ],
    backend_developer: [
      "node.js",
      "express",
      "mongodb",
      "postgresql",
      "docker",
      "aws",
      "git",
    ],
    data_analyst: [
      "python",
      "sql",
      "tableau",
      "power bi",
      "excel",
      "pandas",
      "matplotlib",
    ],
    data_scientist: [
      "python",
      "machine learning",
      "tensorflow",
      "sql",
      "tableau",
      "aws",
      "deep learning",
    ],
    ai_engineer: [
      "python",
      "machine learning",
      "tensorflow",
      "pytorch",
      "aws",
      "docker",
      "nlp",
    ],
  };

  if (careerPath && skillRecommendations[careerPath]) {
    return skillRecommendations[careerPath].filter(
      (skill) => !allDetectedSkills.includes(skill.toLowerCase())
    );
  }

  return [];
};

/**
 * Calculate comprehensive ATS score (0-100)
 */
const calculateATSScore = (text, extractedData) => {
  let score = 0;

  const lowerText = text.toLowerCase();

  // Contact Information (20 points)
  if (extractedData?.email) score += 10;
  if (extractedData?.phone) score += 5;
  if (extractedData?.name) score += 5;

  // LinkedIn/GitHub/Portfolio (15 points)
  if (extractedData?.linkedin || lowerText.includes("linkedin")) score += 5;
  if (extractedData?.github || lowerText.includes("github")) score += 5;
  if (extractedData?.portfolio || lowerText.includes("portfolio")) score += 5;

  // Content sections (25 points)
  if (lowerText.includes("skills") || extractedData?.skills?.length > 0)
    score += 5;
  if (
    lowerText.includes("experience") ||
    lowerText.includes("work experience")
  )
    score += 5;
  if (
    lowerText.includes("education") ||
    lowerText.includes("degree") ||
    extractedData?.education?.length > 0
  )
    score += 5;
  if (lowerText.includes("project") || extractedData?.projects?.length > 0)
    score += 5;
  if (lowerText.includes("certification"))
    score += 5;

  // Technical Keywords (15 points)
  const technicalKeywords = [
    "api",
    "database",
    "framework",
    "library",
    "algorithm",
    "optimization",
    "architecture",
    "deployment",
  ];
  const keywordCount = technicalKeywords.filter((kw) =>
    lowerText.includes(kw.toLowerCase())
  ).length;
  score += Math.min(keywordCount * 2, 15);

  // Achievements & Metrics (15 points)
  const metricPatterns = [/%/, /\d+\s*(increased|improved|reduced)/i, /\$\d+/];
  const metricsFound = metricPatterns.filter((pattern) =>
    pattern.test(text)
  ).length;
  score += Math.min(metricsFound * 5, 15);

  // Text length quality (10 points)
  if (text.length > 500) score += 10;
  else if (text.length > 300) score += 5;

  return Math.min(score, 100);
};

/**
 * Generate resume strengths based on content
 */
const analyzeStrengths = (text, extractedData) => {
  const strengths = [];
  const lowerText = text.toLowerCase();

  if (extractedData?.email && extractedData?.phone) {
    strengths.push("Complete contact information provided");
  }

  if (extractedData?.linkedin || lowerText.includes("linkedin")) {
    strengths.push("LinkedIn profile included");
  }

  if (extractedData?.github || lowerText.includes("github")) {
    strengths.push("GitHub portfolio linked");
  }

  if (extractedData?.skills?.length > 5) {
    strengths.push(`Strong technical skills listed (${extractedData.skills.length})`);
  }

  if (extractedData?.experience?.length > 0) {
    strengths.push(
      `Relevant work experience documented (${extractedData.experience.length} roles)`
    );
  }

  if (extractedData?.projects?.length > 0) {
    strengths.push(
      `Practical projects demonstrated (${extractedData.projects.length} projects)`
    );
  }

  if (extractedData?.education?.length > 0) {
    strengths.push("Educational background clearly stated");
  }

  if (
    lowerText.includes("quantified") ||
    lowerText.includes("increased") ||
    lowerText.includes("improved")
  ) {
    strengths.push("Achievements include quantifiable metrics");
  }

  if (text.length > 800) {
    strengths.push("Comprehensive resume with sufficient detail");
  }

  return strengths;
};

/**
 * Generate resume weaknesses based on missing content
 */
const analyzeWeaknesses = (text, extractedData) => {
  const weaknesses = [];
  const lowerText = text.toLowerCase();

  if (!extractedData?.email) {
    weaknesses.push("Email address not found");
  }

  if (!extractedData?.phone) {
    weaknesses.push("Phone number not found");
  }

  if (!lowerText.includes("linkedin") && !extractedData?.linkedin) {
    weaknesses.push("LinkedIn profile not included");
  }

  if (!lowerText.includes("github") && !extractedData?.github) {
    weaknesses.push("GitHub profile not linked (expected for tech roles)");
  }

  if (!extractedData?.skills || extractedData.skills.length < 3) {
    weaknesses.push("Limited skills section");
  }

  if (!extractedData?.experience || extractedData.experience.length === 0) {
    weaknesses.push("No work experience mentioned");
  }

  if (!extractedData?.projects || extractedData.projects.length === 0) {
    weaknesses.push("No projects showcased");
  }

  if (!extractedData?.education || extractedData.education.length === 0) {
    weaknesses.push("Educational background not clearly stated");
  }

  if (!lowerText.includes("achievement") && !lowerText.includes("impact")) {
    weaknesses.push("Lacks specific achievements or impact statements");
  }

  if (!lowerText.includes("certification")) {
    weaknesses.push("No certifications listed");
  }

  if (text.length < 300) {
    weaknesses.push("Resume appears too brief");
  }

  return weaknesses;
};

module.exports = {
  detectSkills,
  getAllDetectedSkills,
  suggestMissingSkills,
  calculateATSScore,
  analyzeStrengths,
  analyzeWeaknesses,
  SKILL_CATEGORIES,
};
