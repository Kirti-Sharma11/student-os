const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const sharp = require("sharp");
const { createWorker } = require("tesseract.js");

// Tesseract worker (singleton pattern)
let tesseractWorker = null;

const getTesseractWorker = async () => {
  if (!tesseractWorker) {
    tesseractWorker = await createWorker("eng", 1, {
      cachePath: path.join(__dirname, "../../.tesseract-cache"),
    });
  }
  return tesseractWorker;
};

/**
 * Step 1: Text Extraction Layer
 * Tries normal text extraction from PDF/DOCX
 */
const extractTextBasic = async (filePath, mimetype, originalName) => {
  try {
    if (mimetype === "application/pdf" || originalName.match(/\.pdf$/i)) {
      const data = fs.readFileSync(filePath);
      const parsed = await pdfParse(data);
      return parsed.text || "";
    }

    if (
      mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      originalName.match(/\.docx$/i) ||
      mimetype === "application/msword"
    ) {
      const { value } = await mammoth.extractRawText({ path: filePath });
      return value || "";
    }

    // Try both methods
    try {
      const data = fs.readFileSync(filePath);
      const parsed = await pdfParse(data);
      if (parsed.text && parsed.text.trim().length > 0) {
        return parsed.text;
      }
    } catch (e) {}

    try {
      const { value } = await mammoth.extractRawText({ path: filePath });
      if (value && value.trim().length > 0) {
        return value;
      }
    } catch (e) {}

    return "";
  } catch (error) {
    console.error("Basic extraction error:", error.message);
    return "";
  }
};

/**
 * Step 2: OCR Fallback Layer
 * If text extraction is poor, convert PDF pages to images and use Tesseract OCR
 */
const extractTextWithOCR = async (filePath, originalName) => {
  try {
    const worker = await getTesseractWorker();
    let combinedText = "";

    if (originalName.match(/\.pdf$/i)) {
      // PDF to images conversion
      const data = fs.readFileSync(filePath);
      const pdf = await pdfParse(data);

      if (pdf.page && pdf.page > 0) {
        // Use pdfjs to render pages if available, fallback to file path
        // For now, we'll assume PDF is already converted or use a simpler approach
        console.log(`PDF has ${pdf.page} pages, attempting OCR...`);
      }

      // Note: For production, you'd want to use pdf2image or pdfjs-dist
      // to convert PDF pages to images first
      console.warn("PDF OCR requires pdf2image setup - returning basic extraction");
      return "";
    }

    // For image files (JPG, PNG, etc.)
    if (originalName.match(/\.(jpg|jpeg|png|gif)$/i)) {
      const { data: result } = await worker.recognize(filePath);
      return result.text || "";
    }

    return "";
  } catch (error) {
    console.error("OCR extraction error:", error.message);
    return "";
  }
};

/**
 * Main extraction pipeline with fallback layers
 */
const extractResumeText = async (filePath, mimetype, originalName) => {
  try {
    // Step 1: Try basic text extraction
    let text = await extractTextBasic(filePath, mimetype, originalName);
    console.log(`Step 1 - Basic extraction: ${text.length} characters`);

    // Step 2: If extraction is poor, try OCR
    if (!text || text.trim().length < 50) {
      console.log("Text extraction poor, attempting OCR fallback...");
      const ocrText = await extractTextWithOCR(filePath, originalName);

      if (ocrText && ocrText.trim().length > text.trim().length) {
        text = ocrText;
        console.log(`Step 2 - OCR extraction: ${text.length} characters`);
      }
    }

    // Return the best extraction
    return text.trim();
  } catch (error) {
    console.error("Extraction pipeline error:", error.message);
    return "";
  }
};

/**
 * Graceful shutdown of Tesseract worker
 */
const cleanupTesseract = async () => {
  if (tesseractWorker) {
    await tesseractWorker.terminate();
    tesseractWorker = null;
  }
};

module.exports = {
  extractResumeText,
  extractTextBasic,
  extractTextWithOCR,
  cleanupTesseract,
};
