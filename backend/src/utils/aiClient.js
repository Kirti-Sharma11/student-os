const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

// Rate limiter: 1 request per second
const REQUEST_DELAY = 1000; // milliseconds
let lastRequestTime = 0;
let pendingRequest = null;

/**
 * Rate-limited request to Gemini API
 * Ensures max 1 request per second
 */
const rateLimitedRequest = async (prompt) => {
  // Wait for any pending request to complete
  if (pendingRequest) {
    await pendingRequest;
  }

  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < REQUEST_DELAY) {
    const waitTime = REQUEST_DELAY - timeSinceLastRequest;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  // Set this as pending
  pendingRequest = model.generateContent(prompt);

  try {
    const result = await pendingRequest;
    lastRequestTime = Date.now();
    return result;
  } finally {
    pendingRequest = null;
  }
};

/**
 * Intelligent resume parsing using Gemini
 * Returns structured JSON data
 */
exports.parseResumeIntelligently = async (resumeText) => {
  const prompt = `
You are a professional resume parser and ATS specialist. Analyze the following resume text and extract ONLY valid data.

Parse the resume and return a JSON object with this exact structure:
{
  "name": "extracted full name or null",
  "email": "extracted email or null",
  "phone": "extracted phone number or null",
  "linkedin": "extracted linkedin URL or null",
  "github": "extracted github URL or null",
  "portfolio": "extracted portfolio URL or null",
  "education": ["degree and institution", "..."],
  "skills": ["skill1", "skill2", "..."],
  "experience": ["job title at company (years)", "..."],
  "projects": ["project name and description", "..."],
  "certifications": ["certification name", "..."],
  "resumeSummary": "4-6 line professional summary",
  "atsScore": 0,
  "strengths": ["strength1", "strength2", "..."],
  "weaknesses": ["weakness1", "weakness2", "..."],
  "missingSkills": ["skill1", "skill2", "..."],
  "suggestedKeywords": ["keyword1", "keyword2", "..."],
  "recommendedTechnologies": ["tech1", "tech2", "..."],
  "suggestedProjects": ["project idea1", "project idea2", "..."],
  "improvementSuggestions": ["suggestion1", "suggestion2", "..."]
}

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, no explanations.

Resume Text:
${resumeText}
`;

  try {
    const result = await rateLimitedRequest(prompt);
    const responseText = result.response.text();

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // If no JSON found, try to parse the entire response
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Gemini parsing error:", error.message);
    throw new Error(`Failed to parse resume with Gemini: ${error.message}`);
  }
};

/**
 * Generate ATS analysis using Gemini
 */
exports.analyzeResumeATS = async (resumeText, extractedData) => {
  const prompt = `
Analyze this resume as an ATS (Applicant Tracking System) would. Provide professional feedback.

Resume Text:
${resumeText}

Extracted Data:
${JSON.stringify(extractedData, null, 2)}

Return ONLY a JSON object with:
{
  "atsScore": number (0-100),
  "strengths": ["strength1", "..."],
  "weaknesses": ["weakness1", "..."],
  "missingSkills": ["skill1", "..."],
  "suggestedKeywords": ["keyword1", "..."],
  "recommendedTechnologies": ["tech1", "..."],
  "suggestedProjects": ["project1", "..."],
  "improvementSuggestions": ["suggestion1", "..."]
}

Return ONLY valid JSON, no markdown.
`;

  try {
    const result = await rateLimitedRequest(prompt);
    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error("Gemini ATS analysis error:", error.message);
    throw error;
  }
};

/**
 * Generate professional resume summary
 */
exports.generateResumeSummary = async (resumeText, extractedData) => {
  const prompt = `
Based on this resume, write a concise 4-6 line professional summary that highlights key qualifications and career focus.

Resume:
${resumeText}

Extracted Data:
${JSON.stringify(extractedData, null, 2)}

Return ONLY the summary text, no JSON, no markdown, just plain text.
`;

  try {
    const result = await rateLimitedRequest(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Gemini summary generation error:", error.message);
    throw error;
  }
};

/**
 * Legacy function for backward compatibility
 */
exports.analyzeText = async (resumeText) => {
  const prompt = `
Analyze this resume like a professional ATS system.

Return:
- ATS score
- strengths
- weaknesses
- missing skills
- improvement suggestions
- recommended projects

Resume:
${resumeText}
`;

  try {
    const result = await rateLimitedRequest(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini analysis error:", error.message);
    throw error;
  }
};