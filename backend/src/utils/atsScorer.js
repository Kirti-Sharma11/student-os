/**
 * ATS Score Calculator
 * Calculates ATS score (0-100) based on resume quality
 */

function calculateATSScore(text, parsedData) {
  console.log("[ATS Scorer] Starting ATS score calculation...");

  let score = 0;
  const breakdown = {};

  // 1. Contact Information (20 points)
  breakdown.contact = 0;
  if (parsedData.email) breakdown.contact += 10;
  if (parsedData.phone) breakdown.contact += 5;
  if (parsedData.name) breakdown.contact += 5;
  score += breakdown.contact;
  console.log(`[ATS Scorer] Contact info: ${breakdown.contact}/20`);

  // 2. Social & Professional Links (15 points)
  breakdown.links = 0;
  if (parsedData.linkedin) breakdown.links += 7;
  if (parsedData.github) breakdown.links += 8;
  score += breakdown.links;
  console.log(`[ATS Scorer] Professional links: ${breakdown.links}/15`);

  // 3. Content Sections (25 points)
  breakdown.sections = 0;
  const lowerText = text.toLowerCase();

  if (parsedData.education && parsedData.education.length > 0) {
    breakdown.sections += 8;
  }
  if (parsedData.experience && parsedData.experience.length > 0) {
    breakdown.sections += 8;
  }
  if (parsedData.skills && parsedData.skills.length > 0) {
    breakdown.sections += 6;
  }
  if (parsedData.projects && parsedData.projects.length > 0) {
    breakdown.sections += 3;
  }
  score += breakdown.sections;
  console.log(`[ATS Scorer] Content sections: ${breakdown.sections}/25`);

  // 4. Technical Keywords & Skills (20 points)
  breakdown.keywords = 0;
  if (parsedData.skills && parsedData.skills.length > 3) {
    breakdown.keywords += 10;
  } else if (parsedData.skills && parsedData.skills.length > 0) {
    breakdown.keywords += 5;
  }

  // Bonus for advanced skills
  const advancedSkills = [
    "machine learning",
    "ai",
    "cloud",
    "docker",
    "kubernetes",
    "devops",
  ];
  const hasAdvancedSkills = advancedSkills.some((skill) =>
    text.toLowerCase().includes(skill)
  );
  if (hasAdvancedSkills) breakdown.keywords += 10;

  score += Math.min(breakdown.keywords, 20);
  console.log(`[ATS Scorer] Technical keywords: ${breakdown.keywords}/20`);

  // 5. Certifications (10 points)
  breakdown.certifications = 0;
  if (
    parsedData.certifications &&
    parsedData.certifications.length > 0
  ) {
    breakdown.certifications = Math.min(
      parsedData.certifications.length * 3,
      10
    );
  }
  score += breakdown.certifications;
  console.log(`[ATS Scorer] Certifications: ${breakdown.certifications}/10`);

  // 6. Achievements & Metrics (10 points)
  breakdown.achievements = 0;
  if (parsedData.achievements && parsedData.achievements.length > 0) {
    breakdown.achievements = Math.min(
      parsedData.achievements.length * 2,
      10
    );
  }

  // Bonus for quantified achievements
  const metricsRegex = /%|\d+\s*(increased|improved|reduced|achieved|grew)/gi;
  if (metricsRegex.test(text)) {
    breakdown.achievements = Math.min(breakdown.achievements + 5, 10);
  }
  score += breakdown.achievements;
  console.log(`[ATS Scorer] Achievements: ${breakdown.achievements}/10`);

  console.log(`[ATS Scorer] Final ATS Score: ${score}/100`);

  return {
    score: Math.min(score, 100),
    breakdown,
  };
}

/**
 * Generate strengths based on parsed data
 */
function analyzeStrengths(text, parsedData) {
  console.log("[Strength Analyzer] Analyzing resume strengths...");

  const strengths = [];
  const lowerText = text.toLowerCase();

  // Contact information
  if (parsedData.email && parsedData.phone) {
    strengths.push("Complete contact information provided");
  }

  // Social profiles
  if (parsedData.linkedin) {
    strengths.push("LinkedIn profile included for professional networking");
  }
  if (parsedData.github) {
    strengths.push("GitHub profile linked to showcase coding projects");
  }

  // Experience
  if (parsedData.experience && parsedData.experience.length > 3) {
    strengths.push(
      `Solid work experience documented (${parsedData.experience.length} roles)`
    );
  }

  // Skills
  if (parsedData.skills && parsedData.skills.length > 5) {
    strengths.push(
      `Strong technical skills listed (${parsedData.skills.length} technologies)`
    );
  }

  // Education
  if (parsedData.education && parsedData.education.length > 0) {
    strengths.push("Educational background clearly documented");
  }

  // Projects
  if (parsedData.projects && parsedData.projects.length > 0) {
    strengths.push(
      `Practical projects showcased (${parsedData.projects.length} projects)`
    );
  }

  // Certifications
  if (parsedData.certifications && parsedData.certifications.length > 0) {
    strengths.push(
      `Professional certifications included (${parsedData.certifications.length})`
    );
  }

  // Achievements
  if (parsedData.achievements && parsedData.achievements.length > 0) {
    strengths.push(
      "Notable achievements and awards highlighted"
    );
  }

  // Quantified metrics
  if (lowerText.match(/%|\d+\s*(increased|improved|reduced)/gi)) {
    strengths.push("Quantified metrics demonstrate impact and results");
  }

  console.log(`[Strength Analyzer] Found ${strengths.length} strengths`);
  return strengths.length > 0
    ? strengths
    : ["Resume structure is present"];
}

/**
 * Generate weaknesses based on missing elements
 */
function analyzeWeaknesses(text, parsedData) {
  console.log("[Weakness Analyzer] Analyzing resume weaknesses...");

  const weaknesses = [];
  const lowerText = text.toLowerCase();

  // Missing contact info
  if (!parsedData.email) {
    weaknesses.push("Email address is missing");
  }
  if (!parsedData.phone) {
    weaknesses.push("Phone number is missing");
  }

  // Missing links
  if (!parsedData.linkedin) {
    weaknesses.push("LinkedIn profile URL not included");
  }
  if (!parsedData.github && lowerText.includes("developer")) {
    weaknesses.push("GitHub profile not linked (expected for tech roles)");
  }

  // Missing sections
  if (!parsedData.education || parsedData.education.length === 0) {
    weaknesses.push("Education section is missing or unclear");
  }
  if (!parsedData.experience || parsedData.experience.length === 0) {
    weaknesses.push("Work experience section not found");
  }
  if (!parsedData.skills || parsedData.skills.length < 3) {
    weaknesses.push("Skills section is too brief (less than 3 skills)");
  }
  if (!parsedData.projects || parsedData.projects.length === 0) {
    weaknesses.push("Projects section is missing");
  }

  // Missing certifications
  if (!parsedData.certifications || parsedData.certifications.length === 0) {
    weaknesses.push("No certifications or professional credentials listed");
  }

  // Missing achievements
  if (!parsedData.achievements || parsedData.achievements.length === 0) {
    weaknesses.push("No specific achievements or impact statements");
  }

  // Text quality
  if (text.length < 300) {
    weaknesses.push("Resume appears too brief (less than 300 characters)");
  }

  // Missing quantified results
  if (!lowerText.match(/%|\d+\s*(increased|improved|reduced)/gi)) {
    weaknesses.push("Lacks quantified metrics or measurable results");
  }

  console.log(`[Weakness Analyzer] Found ${weaknesses.length} weaknesses`);
  return weaknesses.length > 0 ? weaknesses : [];
}

/**
 * Suggest missing skills based on career path
 */
function suggestMissingSkills(text, parsedData) {
  console.log("[Missing Skills Analyzer] Analyzing missing skills...");

  const allSkills = (parsedData.skills || []).map((s) =>
    s.toLowerCase()
  );
  const lowerText = text.toLowerCase();

  let careerPath = "generalist";
  const suggestions = [];

  // Detect career path
  if (
    lowerText.includes("react") ||
    lowerText.includes("vue") ||
    lowerText.includes("angular")
  ) {
    careerPath = "frontend";
  } else if (
    lowerText.includes("node") ||
    lowerText.includes("express") ||
    lowerText.includes("backend")
  ) {
    careerPath = "backend";
  } else if (
    lowerText.includes("data") ||
    lowerText.includes("analysis") ||
    lowerText.includes("analyst")
  ) {
    careerPath = "data";
  } else if (
    lowerText.includes("machine learning") ||
    lowerText.includes("deep learning")
  ) {
    careerPath = "ai_ml";
  }

  console.log(`[Missing Skills Analyzer] Detected career path: ${careerPath}`);

  // Skill recommendations by path
  const recommendations = {
    frontend: [
      "typescript",
      "next.js",
      "tailwind css",
      "react native",
      "testing library",
    ],
    backend: ["typescript", "sql", "mongodb", "docker", "aws"],
    fullstack: ["typescript", "next.js", "tailwind", "mongodb", "docker"],
    data: ["python", "sql", "tableau", "power bi", "pandas"],
    ai_ml: [
      "python",
      "tensorflow",
      "pytorch",
      "scikit-learn",
      "nlp",
    ],
    generalist: ["git", "docker", "ci/cd", "testing", "rest api"],
  };

  const suggested =
    recommendations[careerPath] || recommendations.generalist;

  for (const skill of suggested) {
    if (!allSkills.includes(skill.toLowerCase())) {
      suggestions.push(skill);
    }
  }

  console.log(`[Missing Skills Analyzer] Suggested ${suggestions.length} skills`);
  return suggestions;
}

/**
 * Generate improvement suggestions
 */
function generateImprovementSuggestions(text, parsedData, atsScore) {
  console.log("[Suggestion Generator] Generating improvement suggestions...");

  const suggestions = [];

  // Score-based suggestions
  if (atsScore < 40) {
    suggestions.push(
      "Add more specific skills and technical expertise details"
    );
    suggestions.push(
      "Include at least one significant project or achievement"
    );
    suggestions.push("Make sure all contact information is clearly visible");
  } else if (atsScore < 70) {
    suggestions.push(
      "Add quantified metrics and results to experience descriptions"
    );
    suggestions.push("Include relevant certifications or technical training");
    suggestions.push(
      "Consider adding a professional summary at the top"
    );
  } else {
    suggestions.push("Add advanced technical skills like AI/ML or cloud tech");
    suggestions.push(
      "Highlight leadership or mentoring experience if applicable"
    );
  }

  // Specific improvements
  if (!parsedData.linkedin && !parsedData.github) {
    suggestions.push(
      "Link professional profiles (LinkedIn, GitHub) for credibility"
    );
  }

  if (!parsedData.certifications || parsedData.certifications.length === 0) {
    suggestions.push(
      "Consider adding relevant industry certifications (AWS, GCP, etc.)"
    );
  }

  if (parsedData.projects && parsedData.projects.length < 2) {
    suggestions.push("Showcase at least 2-3 significant projects");
  }

  if (!text.match(/\d+%|\d+\s*\w+\s*(increased|improved|reduced)/gi)) {
    suggestions.push(
      "Quantify achievements (e.g., 'improved performance by 40%')"
    );
  }

  console.log(`[Suggestion Generator] Generated ${suggestions.length} suggestions`);
  return suggestions;
}

module.exports = {
  calculateATSScore,
  analyzeStrengths,
  analyzeWeaknesses,
  suggestMissingSkills,
  generateImprovementSuggestions,
};
