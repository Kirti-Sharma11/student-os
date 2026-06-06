const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { rateLimit } = require("../middleware/rateLimit");
const {
  analyze,
  getAnalysis,
  getUserAnalyses,
  deleteAnalysis,
} = require("../controllers/resumeController");

/**
 * Rate limiting rules:
 * - Analysis: 5 requests per minute (resource intensive)
 * - Get/List: 30 requests per minute
 * - Delete: 10 requests per minute
 */

// POST /api/resume/analyze - Analyze a new resume (rate limited)
router.post(
  "/analyze",
  rateLimit({
    limit: 5,
    windowMs: 60000,
    message: "Too many resume analyses. Please wait before uploading another.",
  }),
  upload.single("resume"),
  analyze
);

// GET /api/resume/:id - Get a specific resume analysis (rate limited)
router.get(
  "/:id",
  rateLimit({
    limit: 30,
    windowMs: 60000,
    message: "Too many requests. Please try again later.",
  }),
  getAnalysis
);

// GET /api/resume - Get all user's resume analyses (protected & rate limited)
router.get(
  "/",
  rateLimit({
    limit: 30,
    windowMs: 60000,
    message: "Too many requests. Please try again later.",
  }),
  getUserAnalyses
);

// DELETE /api/resume/:id - Delete a resume analysis (protected & rate limited)
router.delete(
  "/:id",
  rateLimit({
    limit: 10,
    windowMs: 60000,
    message: "Too many delete requests. Please try again later.",
  }),
  deleteAnalysis
);

module.exports = router;
