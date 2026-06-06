/**
 * Comprehensive Resume Parser
 * Extracts all relevant information from resume text
 */

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

/**
 * Extract full name
 */
function extractName(text) {
  const lines = text.split("\n").slice(0, 5);

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 0 && trimmed.length < 100) {
      // Look for patterns with capital letters
      const nameMatch = trimmed.match(
        /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/
      );
      if (nameMatch) {
        const name = nameMatch[1];
        // Avoid section headers and common words
        if (
          !name.match(
            /^(summary|contact|email|phone|skills|experience|education|projects|certifications)/i
          ) &&
          name.length > 2
        ) {
          return name;
        }
      }
    }
  }

  return null;
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

/**
 * Extract projects
 */
function extractProjects(text) {
  const lines = text.split("\n");
  const projects = [];
  let inProjectSection = false;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Check for projects section
    if (lowerLine.includes("project") && !lowerLine.includes("experience")) {
      inProjectSection = true;
      continue;
    }

    // Exit section
    if (
      inProjectSection &&
      lowerLine.match(/^(experience|education|skills|certifications)/i)
    ) {
      inProjectSection = false;
    }

    // Extract project entries
    if (inProjectSection && line.trim().length > 5) {
      if (line.match(/^[A-Z]/) || line.match(/^-\s/)) {
        projects.push(line.trim());
      }
    }
  }

  return projects.length > 0 ? projects : [];
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
  const skillsByCategory = extractSkills(text);
  const allSkills = getAllSkills(skillsByCategory);
  const experience = extractExperience(text);
  const projects = extractProjects(text);
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
