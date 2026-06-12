/**
 * Extract structured data from resume text
 */

/**
 * Extract email address
 */
const extractEmail = (text) => {
  const emailRegex =
    /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
  const match = text.match(emailRegex);
  return match ? match[0] : null;
};

/**
 * Extract phone number (supports multiple formats)
 */
const extractPhone = (text) => {
  // Indian phone numbers
  const indianPhone = /(\+91[-.\s]?)?[6-9]\d{9}/;
  // US phone numbers
  const usPhone = /(\+1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?[2-9]\d{2}[-.\s]?\d{4}/;
  // Generic international format
  const intlPhone = /\+\d{1,3}[-.\s]?\d{1,14}/;

  let match = text.match(indianPhone);
  if (match) return match[0];

  match = text.match(usPhone);
  if (match) return match[0];

  match = text.match(intlPhone);
  if (match) return match[0];

  return null;
};

/**
 * Extract LinkedIn URL
 */
const extractLinkedIn = (text) => {
  const linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|company)\/[\w\-]+/i;
  const match = text.match(linkedinRegex);
  return match ? match[0] : null;
};

/**
 * Extract GitHub URL
 */
const extractGitHub = (text) => {
  const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w\-]+/i;
  const match = text.match(githubRegex);
  return match ? match[0] : null;
};

/**
 * Extract portfolio/website URL
 */
const extractPortfolio = (text) => {
  // Look for portfolio, website, personal website patterns
  const portfolioRegex = /(?:portfolio|website|personal\s+website|web)[\s:]*(?:https?:\/\/)?(?:www\.)?[\w\-]+\.[\w\-]+/i;
  const match = text.match(portfolioRegex);
  if (match) {
    const urlMatch = match[0].match(/(?:https?:\/\/)?(?:www\.)?[\w\-]+\.[\w\-]+/);
    return urlMatch ? urlMatch[0] : null;
  }
  return null;
};

/**
 * Extract full name from resume
 * Typically appears at the top of the resume
 */
const extractName = (text) => {
  const lines = text.split('\n');
  
  // First, try to find name patterns with common titles
  for (const line of lines.slice(0, 10)) {
    // Look for patterns like "John Doe" without special characters or keywords
    const cleanLine = line.trim();
    if (cleanLine.length === 0) continue;
    
    // Skip lines that are clearly section headers or contact info
    if (cleanLine.match(/^(email|phone|linkedin|github|portfolio|objective|summary|about)/i)) {
      continue;
    }
    
    // Skip URLs and contact info patterns
    if (cleanLine.match(/^[\w\-\.]+@|^http|^\+?\d{10}|^[0-9\-\s\+\(\)]+$/)) {
      continue;
    }
    
    // Look for name patterns: at least 2 words, starting with capital letters
   const nameMatch = cleanLine.match(
  /^([A-Z][A-Z\s]{2,40})$/
);
    if (nameMatch) {
      return nameMatch[1].trim();
    }
  }
  
  return null;
};

/**
 * Extract education details
 */
/**
 * Extract education with improved parsing for merged text, degree detection, and marks extraction
 */
function extractEducation(text) {
  console.log("[extractEducation] Starting education extraction...");
  
  // Step 1: Preprocess text to split merged words
  let processedText = text
    // Split merged year with text: "Kurukshetra2024" -> "Kurukshetra 2024"
    .replace(/([a-zA-Z])(\d{4})\b/g, "$1 $2")
    // Split merged text with CGPA/GPA: "EngineeringCGPA" -> "Engineering CGPA"
    .replace(/([a-z])([A-Z][A-Z])/g, "$1 $2")
    // Split "Present" from merged: "2024Present" -> "2024 Present"
    .replace(/(\d{4})(Present)/g, "$1 $2")
    // Split year from marks: "2024Percentage" -> "2024 Percentage"
    .replace(/(\d{4})([A-Z][a-z]+)/g, "$1 $2");

  console.log("[extractEducation] Text preprocessing completed");

  // Step 2: Define all detection patterns
  const degreePatterns = {
    "b.tech": /\bb\.tech\b/gi,
    "b.e": /\bb\.e\.?\b/gi,
    bachelor: /\bbachelor\b/gi,
    "m.tech": /\bm\.tech\b/gi,
    "m.e": /\bm\.e\.?\b/gi,
    master: /\bmaster\b/gi,
    phd: /\bphd\b|\bph\.d\b/gi,
    bca: /\bbca\b/gi,
    mca: /\bmca\b/gi,
    bsc: /\bbsc\b|\bb\.sc\b/gi,
    msc: /\bmsc\b|\bm\.sc\b/gi,
    diploma: /\bdiploma\b/gi,
    associate: /\bassociate\b/gi,
    "class xii": /\bclass\s+xii\b/gi,
    "class x": /\bclass\s+x\b/gi,
    "class ix": /\bclass\s+ix\b/gi,
  };

  const marksPatterns = {
    cgpa: /cgpa:\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/gi,
    gpa: /gpa:\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/gi,
    percentage: /percentage:\s*(\d+(?:\.\d+)?)\s*%?/gi,
  };

  const institutePatterns = [
    /([A-Z][a-zA-Z\s&]+(?:Institute|University|College|School|Academy|polytechnic))/gi,
    /([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*(?:\s+(?:Institute|University|College|School|Academy)))/gi,
  ];

  const yearPattern = /\b(19\d{2}|20\d{2})\b/g;

  // Step 3: Find education section boundaries
  const lines = processedText.split("\n");
  let educationStartIndex = -1;
  let educationEndIndex = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const lowerLine = lines[i].toLowerCase();
    if (lowerLine.includes("education") || lowerLine.includes("academic")) {
      educationStartIndex = i + 1;
      console.log(`[extractEducation] Found education section at line ${i}`);
    }
    if (
      educationStartIndex !== -1 &&
      i > educationStartIndex &&
      lowerLine.match(/^(experience|skills|projects|certifications|languages)/i)
    ) {
      educationEndIndex = i;
      break;
    }
  }

  // Step 4: Extract education entries
  const educationEntries = [];
  const seenEntries = new Set(); // Track duplicates

  // If no education section found, search entire text
  const searchLines =
    educationStartIndex > -1
      ? lines.slice(educationStartIndex, educationEndIndex)
      : lines;

  console.log(
    `[extractEducation] Searching ${searchLines.length} lines for education entries`
  );

  for (const line of searchLines) {
    const trimmedLine = line.trim();
    if (trimmedLine.length < 5) continue;

    // Step 5: Check if line contains education keywords
    let hasEducationKeyword = false;
    let detectedDegree = null;

    for (const [degreeType, pattern] of Object.entries(degreePatterns)) {
      if (pattern.test(trimmedLine)) {
        hasEducationKeyword = true;
        detectedDegree = degreeType;
        break;
      }
    }

    if (!hasEducationKeyword) continue;

    console.log(
      `[extractEducation] Found education line with degree: ${detectedDegree}`
    );

    // Step 6: Extract components from line
    let institute = "";
    let degree = detectedDegree;
    let marks = null;
    let marksType = null;
    let years = [];

    // Extract institute name
    for (const pattern of institutePatterns) {
      const match = trimmedLine.match(pattern);
      if (match) {
        institute = match[0].trim();
        break;
      }
    }

    // If no institute pattern found, take first capitalized words
    if (!institute) {
      const wordMatch = trimmedLine.match(/^([A-Z][a-zA-Z\s]+?)(?=\d{4}|CGPA|GPA|Percentage|$)/);
      if (wordMatch) {
        institute = wordMatch[1].trim();
      }
    }

    // Extract marks (CGPA, GPA, Percentage)
    for (const [type, pattern] of Object.entries(marksPatterns)) {
      const match = pattern.exec(trimmedLine);
      if (match) {
        marks = match[1];
        marksType = type.toUpperCase();
        console.log(
          `[extractEducation] Extracted ${marksType}: ${marks}`
        );
        break;
      }
    }

    // Extract years
    const yearMatches = trimmedLine.match(yearPattern);
    if (yearMatches) {
      years = [...new Set(yearMatches)].sort();
      console.log(`[extractEducation] Extracted years: ${years.join(", ")}`);
    }

    // Step 7: Build education object
    const educationEntry = {
      institute: institute || "Unknown Institute",
      degree: degree,
      marks: marks,
      marksType: marksType,
      duration:
        years.length >= 2
          ? `${years[0]} - ${years[years.length - 1]}`
          : years.length === 1
            ? years[0]
            : "Unknown",
      year: years[years.length - 1] || null,
      rawText: trimmedLine,
    };

    // Step 8: Prevent duplicates
    const duplicateKey = `${educationEntry.institute}|${educationEntry.degree}`;
    if (!seenEntries.has(duplicateKey)) {
      seenEntries.add(duplicateKey);
      educationEntries.push(educationEntry);
      console.log(
        `[extractEducation] Added: ${educationEntry.institute} - ${educationEntry.degree}`
      );
    } else {
      console.log(
        `[extractEducation] Skipped duplicate: ${educationEntry.institute}`
      );
    }
  }

  console.log(
    `[extractEducation] Extraction complete. Found ${educationEntries.length} entries`
  );

  return educationEntries;
}

/**
 * Extract experience/work history
 */
const extractExperience = (text) => {
  const experience = [];
  const lines = text.split('\n');
  let inExperienceSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();

    if (line.match(/^(work\s+experience|experience|employment)/)) {
      inExperienceSection = true;
      continue;
    }

    if (inExperienceSection && line.match(/^(education|skill|project|certification|award|achievement)/)) {
      inExperienceSection = false;
    }

    if (inExperienceSection && lines[i].trim().length > 0) {
      // Look for job titles and company names (usually capitalized)
      if (lines[i].match(/^[A-Z]/) && (
        lines[i].match(/engineer|developer|manager|analyst|lead|specialist|coordinator|intern/i) ||
        lines[i].match(/[A-Z][a-z]+\s*(?:Inc|Ltd|LLC|Corp|Company)/)
      )) {
        experience.push(lines[i].trim());
      }
    }
  }

  return experience;
};

/**
 * Extract projects
 */
const extractProjects = (text) => {
  const projects = [];
  const lines = text.split('\n');
  let inProjectSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();

    if (line.includes('project')) {
      inProjectSection = true;
      continue;
    }

    if (inProjectSection && line.match(/^(experience|education|skill|certification|award|achievement)/)) {
      inProjectSection = false;
    }

    if (inProjectSection && lines[i].trim().length > 0) {
      // Look for capitalized lines (likely project names/descriptions)
      if (lines[i].match(/^[A-Z]/)) {
        projects.push(lines[i].trim());
      }
    }
  }

  return projects;
};

/**
 * Extract certifications
 */
const extractCertifications = (text) => {
  const certifications = [];
  const lines = text.split('\n');
  let inCertSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();

    if (line.includes('certification') || line.includes('certificate') || line.includes('credential')) {
      inCertSection = true;
      continue;
    }

    if (inCertSection && line.match(/^(experience|education|skill|project|award|achievement)/)) {
      inCertSection = false;
    }

    if (inCertSection && lines[i].trim().length > 0) {
      if (lines[i].match(/^[A-Z]/)) {
        certifications.push(lines[i].trim());
      }
    }
  }

  return certifications;
};

/**
 * Extract all structured resume data
 */
const extractResumeData = (text) => {
  return {
    name: extractName(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    linkedin: extractLinkedIn(text),
    github: extractGitHub(text),
    portfolio: extractPortfolio(text),
    education: extractEducation(text),
    experience: extractExperience(text),
    projects: extractProjects(text),
    certifications: extractCertifications(text),
  };
};

module.exports = {
  extractEmail,
  extractPhone,
  extractLinkedIn,
  extractGitHub,
  extractPortfolio,
  extractName,
  extractEducation,
  extractExperience,
  extractProjects,
  extractCertifications,
  extractResumeData,
};
