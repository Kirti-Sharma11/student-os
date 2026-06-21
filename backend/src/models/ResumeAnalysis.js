const mongoose = require("mongoose");

const ResumeAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  resumeFile: { type: String },

  // Extracted Personal Information
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  linkedin: { type: String },
  github: { type: String },
  portfolio: { type: String },

  // Extracted Content
  education: { type: [String], default: [] },
  skills: { type: [String], default: [] },
  experience: { type: [String], default: [] },
  projects: { type: [String], default: [] },
  certifications: { type: [String], default: [] },

  // Skill Categories
  skillsByCategory: {
    frontend: { type: [String], default: [] },
    backend: { type: [String], default: [] },
    database: { type: [String], default: [] },
    programming: { type: [String], default: [] },
    cloud: { type: [String], default: [] },
    ai_ml: { type: [String], default: [] },
    devops: { type: [String], default: [] },
    tools: { type: [String], default: [] },
    softSkills: { type: [String], default: [] },
  },

  // ATS Analysis
  atsScore: { type: Number, default: 0 },
  resumeSummary: { type: String },

  // Analysis Results
  strengths: { type: [String], default: [] },
  weaknesses: { type: [String], default: [] },
  missingSkills: { type: [String], default: [] },
  suggestedKeywords: { type: [String], default: [] },
  recommendedTechnologies: { type: [String], default: [] },
  suggestedProjects: { type: [String], default: [] },
  suggestions: { type: [String], default: [] }, // For improvement suggestions
  improvementSuggestions: { type: [String], default: [] },

  // Extraction Method (for debugging)
  extractionMethod: {
    type: String,
    enum: ["basic", "ocr", "gemini"],
    default: "basic",
  },

  // Raw extracted text
  rawText: { type: String, select: false }, // Don't select by default

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ResumeAnalysis", ResumeAnalysisSchema);
