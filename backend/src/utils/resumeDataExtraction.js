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
    const nameMatch = cleanLine.match(/^([A-Z][a-z]+\s+(?:[A-Z][a-z]+\s+)*[A-Z][a-z]+)/);
    if (nameMatch) {
      return nameMatch[1].trim();
    }
  }
  
  return null;
};

/**
 * Extract education details
 */
const extractEducation = (text) => {
  const educationKeywords = ['bachelor', 'master', 'phd', 'degree', 'b.tech', 'm.tech', 'bca', 'mca', 'bse', 'mse', 'diploma', 'course'];
  const education = [];

  const lines = text.split('\n');
  let inEducationSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();

    if (line.includes('education')) {
      inEducationSection = true;
      continue;
    }

    if (inEducationSection && line.match(/^(experience|skill|project|certification|award|achievement|internship)/)) {
      inEducationSection = false;
    }

    if (inEducationSection) {
      for (const keyword of educationKeywords) {
        if (line.includes(keyword)) {
          education.push(lines[i].trim());
          break;
        }
      }
    }
  }

  return education;
};

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
