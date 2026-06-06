// Quick test to verify pdfjs-dist module loading
try {
  console.log("Testing module imports...");
  
  const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
  console.log("✅ pdfjs-dist loaded successfully");
  
  const mammoth = require("mammoth");
  console.log("✅ mammoth loaded successfully");
  
  const Tesseract = require("tesseract.js");
  console.log("✅ tesseract.js loaded successfully");
  
  // Try importing the utilities
  const textExtraction = require("./src/utils/textExtraction");
  console.log("✅ textExtraction module loaded successfully");
  
  const ocrFallback = require("./src/utils/ocrFallback");
  console.log("✅ ocrFallback module loaded successfully");
  
  const resumeParser = require("./src/utils/resumeParser");
  console.log("✅ resumeParser module loaded successfully");
  
  const atsScorer = require("./src/utils/atsScorer");
  console.log("✅ atsScorer module loaded successfully");
  
  console.log("\n✅ All modules loaded successfully!");
  console.log("Ready to start server: npm run dev");
  
  process.exit(0);
} catch (error) {
  console.error("❌ Module loading failed:");
  console.error(error.message);
  console.error("\nStack:", error.stack);
  process.exit(1);
}
