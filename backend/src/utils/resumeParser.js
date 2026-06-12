/**
 * Comprehensive Resume Parser
 * Extracts all relevant information from resume text
 */
function normalizeResumeText(text) {
  return text
    .replace(/PROJECTS/gi, "\nPROJECTS\n")
    .replace(/EDUCATION/gi, "\nEDUCATION\n")
    .replace(/TECHNICAL SKILLS/gi, "\nTECHNICAL SKILLS\n")
    .replace(/EXPERIENCE/gi, "\nEXPERIENCE\n")
    .replace(/CERTIFICATIONS/gi, "\nCERTIFICATIONS\n");
}
const TECH_SKILLS = {
  frontend: [
    "react",
    "vue",
    "angular",
    "svelte",
    "html",
    "css",
    "sass",
    "scss",
    "tailwind",
    "bootstrap",
    "material",
    "jquery",
    "webpack",
    "vite",
    "babel",
    "next.js",
    "nextjs",
    "nuxt",
    "gatsby",
    "remix",
  ],
  backend: [
    "node.js",
    "nodejs",
    "express",
    "fastapi",
    "flask",
    "django",
    "spring",
    "spring boot",
    "java",
    "python",
    "ruby",
    "rails",
    "laravel",
    "php",
    "nestjs",
    "hapi",
    "koa",
    "go",
    "golang",
    "rust",
  ],
  database: [
    "mongodb",
    "mysql",
    "postgresql",
    "postgres",
    "redis",
    "firebase",
    "dynamodb",
    "cassandra",
    "elasticsearch",
    "sql",
    "sqlite",
    "mariadb",
    "oracle",
    "couchdb",
  ],
  programming: [
    "javascript",
    "typescript",
    "python",
    "java",
    "c++",
    "c#",
    "csharp",
    "go",
    "rust",
    "kotlin",
    "swift",
    "objective-c",
    "perl",
    "ruby",
    "scala",
    "r",
    "matlab",
  ],
  devops: [
    "docker",
    "kubernetes",
    "jenkins",
    "gitlab ci",
    "github actions",
    "circleci",
    "terraform",
    "ansible",
    "aws",
    "azure",
    "gcp",
    "linux",
    "unix",
    "bash",
    "git",
    "svn",
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
    "sublime",
    "npm",
    "yarn",
    "maven",
    "gradle",
  ],
  cloud: [
    "aws",
    "azure",
    "gcp",
    "heroku",
    "vercel",
    "netlify",
    "cloudflare",
    "digitalocean",
    "linode",
    "ibm cloud",
  ],
  other: [
    "ai",
    "ml",
    "machine learning",
    "deep learning",
    "tensorflow",
    "pytorch",
    "keras",
    "scikit-learn",
    "pandas",
    "numpy",
    "opencv",
    "nlp",
    "api",
    "rest",
    "graphql",
    "websocket",
    "jwt",
    "oauth",
  ],
};

/**
 * Extract email addresses
 */
function extractEmail(text) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex) || [];
  return matches.length > 0 ? matches[0] : null;
}

/**
 * Extract phone numbers
 */
function extractPhone(text) {
  const phoneRegexes = [
    /\+?1?\s?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}/g, // US
    /\+91\s?[6-9]\d{9}/g, // India
    /\+\d{1,3}\s?\d{1,14}/g, // International
    /(\d{10}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/g, // Generic
  ];

  for (const regex of phoneRegexes) {
    const matches = text.match(regex) || [];
    if (matches.length > 0) {
      return matches[0].trim();
    }
  }

  return null;
}

/**
 * Extract LinkedIn URL
 */
function extractLinkedIn(text) {
  const linkedinRegex =
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|company)\/[\w\-]+/gi;
  const matches = text.match(linkedinRegex) || [];
  return matches.length > 0 ? matches[0] : null;
}

/**
 * Extract GitHub URL
 */
function extractGitHub(text) {
  const githubRegex =
    /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w\-]+\/?/gi;
  const matches = text.match(githubRegex) || [];
  return matches.length > 0 ? matches[0] : null;
}



const extractName = (text) => {
  const firstPart = text.substring(0, 300);

  const allCapsMatch = firstPart.match(
    /\b([A-Z]{2,}(?:\s+[A-Z]{2,}){1,3})\b/
  );

  if (allCapsMatch) {
    return allCapsMatch[1].trim();
  }

  const normalMatch = firstPart.match(
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/
  );

  if (normalMatch) {
    return normalMatch[1].trim();
  }

  return null;
};
function detectStudent(text, education = []) {
  const lowerText = text.toLowerCase();

  const studentKeywords = [
    "b.tech",
    "bachelor",
    "student",
    "cgpa",
    "class xii",
    "class x",
    "undergraduate",
    "university",
    "college",
    "institute"
  ];

  let score = 0;

  studentKeywords.forEach((keyword) => {
    if (lowerText.includes(keyword)) {
      score++;
    }
  });

  if (education.length > 0) {
    score += 2;
  }

  return score >= 3;
}
function getStudentYear(education) {
  const text = Array.isArray(education)
    ? education.join(" ")
    : education;

  const years = text.match(/20\d{2}/g);

  if (!years) return null;

  const admissionYear = Math.max(
    ...years.map(Number).filter(y => y >= 2020)
  );

  const currentYear = new Date().getFullYear();

  const year = currentYear - admissionYear + 1;

  if (year < 1) return null;
  if (year > 4) return "Graduate";

  return {
    1: "1st Year",
    2: "2nd Year",
    3: "3rd Year",
    4: "4th Year"
  }[year];
}
/**
 * Extract education
 */
function extractEducation(text) {
  const educationKeywords = [
    "bachelor",
    "master",
    "phd",
    "b.tech",
    "m.tech",
    "bca",
    "mca",
    "bsc",
    "msc",
    "diploma",
    "associate",
    "degree",
    "university",
    "college",
    "institute",
  ];

  const lines = text.split("\n");
  const education = [];
  let inEducationSection = false;

  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();

    // Check for education section header
    if (
      lowerLine.includes("education") ||
      lowerLine.includes("academic")
    ) {
      inEducationSection = true;
      continue;
    }

    // Exit education section
    if (
      inEducationSection &&
      lowerLine.match(/^(experience|skills|projects|certifications|languages)/i)
    ) {
      inEducationSection = false;
    }

    // Extract education entries
    if (inEducationSection && line.trim().length > 10) {
      for (const keyword of educationKeywords) {
        if (lowerLine.includes(keyword)) {
          education.push(line.trim());
          break;
        }
      }
    }
  }

  return education.length > 0 ? education : [];
}

/**
 * Extract skills with technology detection
 */
function extractSkills(text) {
  const allSkills = {};
  const lowerText = text.toLowerCase();

  // Detect skills by category
  for (const [category, skills] of Object.entries(TECH_SKILLS)) {
    allSkills[category] = [];

    for (const skill of skills) {

  const escapedSkill = skill.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
console.log("Checking:", skill);
  let regex;

  // skills containing special characters
  if (
    skill.includes("+") ||
    skill.includes("#") ||
    skill.includes(".") ||
    skill.includes("-")
  ) {
    regex = new RegExp(escapedSkill, "i");
  } else {
    regex = new RegExp(`\\b${escapedSkill}\\b`, "i");
  }

  if (regex.test(lowerText)) {
    allSkills[category].push(skill);
  }
}

    // Remove duplicates
    allSkills[category] = [...new Set(allSkills[category])];
  }

  return allSkills;
}

/**
 * Get flat list of all detected skills
 */
function getAllSkills(skillsByCategory) {
  return Object.values(skillsByCategory)
    .flat()
    .filter((skill, index, self) => self.indexOf(skill) === index);
}

/**
 * Extract experience
 */
function extractExperience(text) {
  const lines = text.split("\n");
  const experience = [];
  let inExperienceSection = false;

  const jobTitlePatterns = [
    "engineer",
    "developer",
    "manager",
    "analyst",
    "designer",
    "lead",
    "architect",
    "specialist",
    "coordinator",
    "intern",
    "associate",
    "senior",
    "junior",
  ];

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Check for experience section
    if (
      lowerLine.includes("experience") ||
      lowerLine.includes("employment") ||
      lowerLine.includes("work history")
    ) {
      inExperienceSection = true;
      continue;
    }

    // Exit section
    if (
      inExperienceSection &&
      lowerLine.match(/^(education|skills|projects|certifications)/i)
    ) {
      inExperienceSection = false;
    }

    // Extract experience entries
    if (inExperienceSection && line.trim().length > 5) {
      const hasJobTitle = jobTitlePatterns.some((pattern) =>
        lowerLine.includes(pattern)
      );

      if (hasJobTitle || line.match(/^[A-Z].*[A-Za-z]/)) {
        experience.push(line.trim());
      }
    }
  }

  return experience.length > 0 ? experience : [];
}

function extractProjects(text) {
  const projectSection = text.match(
    /PROJECTS([\s\S]*?)(EXPERIENCE|WORK EXPERIENCE|ACHIEVEMENTS|POSITION OF RESPONSIBILITY|$)/i
  );

  if (!projectSection) return [];

  const section = projectSection[1];

  const projects = [];

  const matches = section.match(
    /([A-Z][A-Za-z0-9\s&\-]{2,50})\s*\(GitHub\)/g
  );

  if (matches) {
    matches.forEach(item => {
      projects.push(
        item.replace(/\(GitHub\)/i, "").trim()
      );
    });
  }

  return [...new Set(projects)];
}

/**
 * Extract certifications and achievements
 */
function extractCertificationsAndAchievements(text) {
  const lines = text.split("\n");
  const certifications = [];
  const achievements = [];
  let inCertSection = false;
  let inAchievementSection = false;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Check section headers
    if (
      lowerLine.includes("certification") ||
      lowerLine.includes("certificate")
    ) {
      inCertSection = true;
      inAchievementSection = false;
      continue;
    }

    if (
      lowerLine.includes("achievement") ||
      lowerLine.includes("award")
    ) {
      inAchievementSection = true;
      inCertSection = false;
      continue;
    }

    if (lowerLine.match(/^(experience|education|skills|projects)/i)) {
      inCertSection = false;
      inAchievementSection = false;
    }

    if (inCertSection && line.trim().length > 5) {
      certifications.push(line.trim());
    }

    if (inAchievementSection && line.trim().length > 5) {
      achievements.push(line.trim());
    }
  }

  return { certifications, achievements };
}

/**
 * Parse complete resume from text
 */
function parseResume(text) {
  text = normalizeResumeText(text);
  console.log("[Resume Parser] Starting comprehensive resume parsing...");

  if (!text || text.trim().length === 0) {
    console.warn("[Resume Parser] Empty text received");
    return null;
  }

  const name = extractName(text);
  const email = extractEmail(text);
  const phone = extractPhone(text);
  const linkedin = extractLinkedIn(text);
  const github = extractGitHub(text);
  const education = extractEducation(text);
  const isStudent = detectStudent(
  text,
  education
);

const studentYear =
  getStudentYear(education);
  const skillsByCategory = extractSkills(text);
  const allSkills = getAllSkills(skillsByCategory);
  const experience = extractExperience(text);
  const projects = extractProjects(text);

console.log("PROJECTS FOUND:", projects);
  const { certifications, achievements } =
    extractCertificationsAndAchievements(text);

  const parsed = {
    name,
    email,
    phone,
    linkedin,
    github,
    education,
    experience,
    projects,
    certifications,
    isStudent,
    studentYear,
    achievements,
    skills: allSkills,
    skillsByCategory,
  };

  console.log("[Resume Parser] Parsed data:", {
    name: !!name,
    email: !!email,
    phone: !!phone,
    skills: allSkills.length,
    experience: experience.length,
    projects: projects.length,
  });
  console.log({
  projects: parsed.projects,
  education: parsed.education,
  isStudent: parsed.isStudent,
  studentYear: parsed.studentYear,
});
  return parsed;
}

module.exports = {
  parseResume,
  extractEmail,
  extractPhone,
  extractLinkedIn,
  extractGitHub,
  extractName,
  extractEducation,
  extractExperience,
  extractProjects,
  extractSkills,
  getAllSkills,
  extractCertificationsAndAchievements,
  TECH_SKILLS,
};
