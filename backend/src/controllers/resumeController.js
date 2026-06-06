const fs = require("fs");
const path = require("path");
const ResumeAnalysis = require("../models/ResumeAnalysis");

// Import all utilities
const { extractText } = require("../utils/textExtraction");
const { performOCRFallback, cleanupTesseract } = require("../utils/ocrFallback");
const { parseResume } = require("../utils/resumeParser");
const {
  calculateATSScore,
  analyzeStrengths,
  analyzeWeaknesses,
  suggestMissingSkills,
  generateImprovementSuggestions,
} = require("../utils/atsScorer");

/**
 * Main resume analysis function
 */
exports.analyze = async (req, res) => {
  let filePath = null;

  try {
    // Validate file upload
    if (!req.file) {
      console.log("[Controller] No file uploaded");
      return res.status(400).json({
        success: false,
        message: "No resume file uploaded",
      });
    }

    filePath = req.file.path;
    const { mimetype, originalname, filename } = req.file;

    console.log("\n");
    console.log("═══════════════════════════════════════════════════════");
    console.log("📄 RESUME ANALYSIS STARTED");
    console.log("═══════════════════════════════════════════════════════");
    console.log("FILE:", filename);
    console.log("ORIGINAL NAME:", originalname);
    console.log("MIME TYPE:", mimetype);
    console.log("FILE PATH:", filePath);
    console.log("FILE SIZE:", req.file.size, "bytes");

    // Step 1: Extract text from file
    console.log("\n[Step 1] Extracting text from file...");
    let extractedText = "";
    let extractionMethod = "basic";

    try {
      extractedText = await extractText(filePath, mimetype, originalname);
      console.log("TEXT LENGTH:", extractedText.length, "characters");

      if (extractedText.length > 0) {
        console.log("TEXT PREVIEW (first 500 chars):");
        console.log(extractedText.substring(0, 500));
        console.log("...");
      }
    } catch (extractError) {
      console.error("[Step 1] Text extraction failed:", extractError.message);
      return res.status(400).json({
        success: false,
        message: "Failed to extract text from resume",
        error: extractError.message,
      });
    }

    // Step 2: OCR Fallback if needed
    if (extractedText.length < 50) {
      console.log(
        "\n[Step 2] Text extraction insufficient (<50 chars), triggering OCR fallback..."
      );

      try {
        const ocrText = await performOCRFallback(filePath, originalname);
        if (ocrText && ocrText.length > extractedText.length) {
          extractedText = ocrText;
          extractionMethod = "ocr";
          console.log("[Step 2] OCR extraction successful");
          console.log("OCR TEXT LENGTH:", extractedText.length, "characters");
          console.log("OCR TEXT PREVIEW (first 500 chars):");
          console.log(extractedText.substring(0, 500));
        } else {
          console.warn("[Step 2] OCR extraction unsuccessful");
        }
      } catch (ocrError) {
        console.error("[Step 2] OCR fallback error:", ocrError.message);
        // Continue with whatever text we have
      }
    } else {
      console.log("\n[Step 2] Text extraction sufficient, skipping OCR");
    }

    // Validate we have text
    if (extractedText.length === 0) {
      console.error("[Controller] No text extracted from file");
      return res.status(400).json({
        success: false,
        message:
          "Could not extract text from resume. Please ensure it's a valid PDF or DOCX file.",
        debugging: {
          extractedLength: 0,
          extractionMethod: extractionMethod,
        },
      });
    }

    // Step 3: Parse resume
    console.log("\n[Step 3] Parsing resume content...");
    let parsedData = parseResume(extractedText);

    if (!parsedData) {
      console.error("[Step 3] Resume parsing failed");
      return res.status(400).json({
        success: false,
        message: "Failed to parse resume content",
      });
    }

    // Step 4: Calculate ATS Score
    console.log("\n[Step 4] Calculating ATS Score...");
    const { score: atsScore, breakdown } = calculateATSScore(
      extractedText,
      parsedData
    );
    console.log("ATS SCORE:", atsScore, "/100");
    console.log("SCORE BREAKDOWN:", breakdown);

    // Step 5: Analyze strengths and weaknesses
    console.log("\n[Step 5] Analyzing strengths and weaknesses...");
    const strengths = analyzeStrengths(extractedText, parsedData);
    const weaknesses = analyzeWeaknesses(extractedText, parsedData);
    console.log("STRENGTHS:", strengths.length);
    console.log("WEAKNESSES:", weaknesses.length);

    // Step 6: Suggest missing skills
    console.log("\n[Step 6] Suggesting missing skills...");
    const missingSkills = suggestMissingSkills(extractedText, parsedData);
    console.log("MISSING SKILLS SUGGESTED:", missingSkills.length);

    // Step 7: Generate improvement suggestions
    console.log("\n[Step 7] Generating improvement suggestions...");
    const improvementSuggestions = generateImprovementSuggestions(
      extractedText,
      parsedData,
      atsScore
    );
    console.log("IMPROVEMENT SUGGESTIONS:", improvementSuggestions.length);

    // Step 8: Build analysis response
    console.log("\n[Step 8] Building analysis response...");
    const analysis = {
      atsScore,
      name: parsedData.name,
      email: parsedData.email,
      phone: parsedData.phone,
      linkedin: parsedData.linkedin,
      github: parsedData.github,
      education: parsedData.education,
      experience: parsedData.experience,
      projects: parsedData.projects,
      certifications: parsedData.certifications,
      achievements: parsedData.achievements,
      skills: parsedData.skills || [],
      skillsByCategory: parsedData.skillsByCategory || {},
      resumeSummary: extractedText.substring(0, 500),
      strengths,
      weaknesses,
      missingSkills,
      recommendedTechnologies: (
        parsedData.skillsByCategory?.frontend || []
      ).concat(parsedData.skillsByCategory?.backend || []),
      suggestedProjects: [
        "Full-Stack Web Application",
        "Mobile Application",
        "AI/ML Project",
        "Open Source Contribution",
      ],
      suggestedKeywords: parsedData.skills || [],
      improvementSuggestions,
    };

    console.log("\n[Step 8] Analysis Summary:");
    console.log({
      name: analysis.name,
      email: analysis.email,
      phone: analysis.phone,
      atsScore: analysis.atsScore,
      skillsDetected: analysis.skills.length,
      strengths: analysis.strengths.length,
      weaknesses: analysis.weaknesses.length,
    });

    // Step 9: Save to MongoDB
    console.log("\n[Step 9] Saving to MongoDB...");
    let savedDoc = null;

    try {
      savedDoc = await ResumeAnalysis.create({
        userId: req.user?._id || null,
        resumeFile: filename,
        name: analysis.name,
        email: analysis.email,
        phone: analysis.phone,
        linkedin: analysis.linkedin,
        github: analysis.github,
        education: analysis.education,
        experience: analysis.experience,
        projects: analysis.projects,
        certifications: analysis.certifications,
        skills: analysis.skills,
        skillsByCategory: analysis.skillsByCategory,
        atsScore: analysis.atsScore,
        resumeSummary: analysis.resumeSummary,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        missingSkills: analysis.missingSkills,
        suggestedKeywords: analysis.suggestedKeywords,
        recommendedTechnologies: analysis.recommendedTechnologies,
        suggestedProjects: analysis.suggestedProjects,
        improvementSuggestions: analysis.improvementSuggestions,
        extractionMethod: extractionMethod,
      });

      console.log("[Step 9] Saved successfully. Doc ID:", savedDoc._id);
    } catch (dbError) {
      console.warn("[Step 9] Database save failed:", dbError.message);
      console.warn("[Step 9] Continuing with analysis (non-critical error)");
    }

    // Step 10: Cleanup
    console.log("\n[Step 10] Cleaning up...");
    try {
      fs.unlinkSync(filePath);
      console.log("[Step 10] Temporary file deleted");
    } catch (cleanupError) {
      console.warn("[Step 10] File cleanup failed:", cleanupError.message);
    }

    // Success response
    console.log("\n═══════════════════════════════════════════════════════");
    console.log("✅ RESUME ANALYSIS COMPLETED SUCCESSFULLY");
    console.log("═══════════════════════════════════════════════════════\n");

    return res.status(200).json({
      success: true,
      message: "Resume analyzed successfully",
      analysis: {
        ...analysis,
        documentId: savedDoc?._id,
      },
    });
  } catch (error) {
    console.error("\n❌ ERROR DURING ANALYSIS:", error.message);
    console.error("STACK:", error.stack);

    // Cleanup on error
    if (filePath) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {}
    }

    try {
      await cleanupTesseract();
    } catch (e) {}

    return res.status(500).json({
      success: false,
      message: "An error occurred during resume analysis",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get analysis by ID
 */
exports.getAnalysis = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Analysis ID is required",
      });
    }

    const analysis = await ResumeAnalysis.findById(id);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    return res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("[Get Analysis] Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve analysis",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get user's analyses
 */
exports.getUserAnalyses = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const analyses = await ResumeAnalysis.find({ userId })
      .sort({ createdAt: -1 })
      .select("-rawText");

    return res.status(200).json({
      success: true,
      count: analyses.length,
      analyses,
    });
  } catch (error) {
    console.error("[Get User Analyses] Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve analyses",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Delete analysis
 */
exports.deleteAnalysis = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Analysis ID is required",
      });
    }

    const analysis = await ResumeAnalysis.findById(id);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    await ResumeAnalysis.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Analysis deleted successfully",
    });
  } catch (error) {
    console.error("[Delete Analysis] Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to delete analysis",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Cleanup on server shutdown
 */
exports.cleanup = async () => {
  try {
    console.log("[Controller] Cleaning up resources...");
    await cleanupTesseract();
    console.log("[Controller] Cleanup completed");
  } catch (error) {
    console.error("[Controller] Cleanup error:", error.message);
  }
};