const fs = require("fs");
const path = require("path");
const { createWorker } = require("tesseract.js");
const sharp = require("sharp");


let tesseractWorker = null;

/**
 * Initialize or get Tesseract worker
 */
async function getTesseractWorker() {
  if (!tesseractWorker) {
    console.log("[OCR] Initializing Tesseract worker...");
    tesseractWorker = await createWorker("eng", 1, {
      cachePath: path.join(__dirname, "../../.tesseract-cache"),
    });
    console.log("[OCR] Tesseract worker initialized");
  }
  return tesseractWorker;
}

/**
 * Convert PDF pages to images and perform OCR
 */
async function ocrFromPDF(filePath) {
  try {
    console.log("[OCR PDF] Starting PDF to image OCR conversion...");
    const worker = await getTesseractWorker();

    const data = fs.readFileSync(filePath);
    const pdf = await pdfjsLib.getDocument({ data }).promise;

    let fullText = "";
    const numPages = Math.min(pdf.numPages, 5); // Limit to first 5 pages for performance

    console.log(`[OCR PDF] Processing ${numPages} pages with OCR...`);

    for (let i = 1; i <= numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });

        // Render page to canvas
        const canvas = await page.render({
          canvasContext: {
            fillRect: () => {},
            clearRect: () => {},
            getImageData: () => ({
              data: new Array(4),
            }),
            createImageData: () => [],
            setTransform: () => {},
            drawImage: () => {},
            save: () => {},
            fillText: () => {},
            restore: () => {},
            beginPath: () => {},
            moveTo: () => {},
            lineTo: () => {},
            closePath: () => {},
            stroke: () => {},
            translate: () => {},
            scale: () => {},
            transform: () => {},
            rotate: () => {},
            arc: () => {},
            fill: () => {},
            measureText: () => ({ width: 0 }),
            transform: () => {},
            rect: () => {},
            clip: () => {},
          },
          viewport,
        }).promise;

        // Note: This approach requires canvas support
        // For production, use pdf2image library instead
        console.log(`[OCR PDF] Warning: PDF rendering not fully supported in Node.js`);
        
      } catch (pageError) {
        console.warn(`[OCR PDF] Error processing page ${i}:`, pageError.message);
        continue;
      }
    }

    return fullText;
  } catch (error) {
    console.error("[OCR PDF] Error:", error.message);
    return "";
  }
}

/**
 * OCR from image file
 */
async function ocrFromImage(filePath) {
  try {
    console.log("[OCR Image] Starting image OCR...");
    const worker = await getTesseractWorker();

    const { data: ocrData } = await worker.recognize(filePath);
    const text = ocrData.text || "";

    console.log(`[OCR Image] Extracted: ${text.length} characters`);
    return text;
  } catch (error) {
    console.error("[OCR Image] Error:", error.message);
    return "";
  }
}

/**
 * Convert PDF to images and perform OCR (recommended approach)
 * Requires: npm install pdf2image
 * Or use python: pdf2image >= 1.16.2
 */
async function ocrFromPDFImages(filePath) {
  try {
    console.log("[OCR PDF Images] Starting PDF OCR with image conversion...");

    // For production: Use pdf2image or pdftoppm
    // Example with sharp if PDF is converted to PNG first:
    /*
    const { exec } = require("child_process");
    const util = require("util");
    const execPromise = util.promisify(exec);

    // Convert PDF to images
    const imageDir = path.join(path.dirname(filePath), ".pdf-images");
    if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir);

    await execPromise(`pdftoppm "${filePath}" "${path.join(imageDir, 'page')}"`);

    // Process images with OCR
    const worker = await getTesseractWorker();
    const images = fs.readdirSync(imageDir).sort();
    let fullText = "";

    for (const image of images) {
      const { data: ocrData } = await worker.recognize(path.join(imageDir, image));
      fullText += ocrData.text + "\n";
    }

    // Cleanup
    fs.rmSync(imageDir, { recursive: true });
    return fullText;
    */

    console.log(
      "[OCR PDF Images] PDF image conversion requires system dependencies"
    );
    console.log(
      "[OCR PDF Images] Install: pdftoppm (from poppler-utils)"
    );
    return "";
  } catch (error) {
    console.error("[OCR PDF Images] Error:", error.message);
    return "";
  }
}

/**
 * Fallback OCR function - tries multiple OCR approaches
 */
async function performOCRFallback(filePath, originalName) {
  try {
    console.log("[OCR Fallback] Starting OCR fallback for:", originalName);

    const isPDF = originalName.toLowerCase().endsWith(".pdf");
    const isImage = /\.(jpg|jpeg|png|gif|bmp)$/i.test(originalName);

    if (isImage) {
      console.log("[OCR Fallback] Detected image file, using image OCR...");
      return await ocrFromImage(filePath);
    }

    if (isPDF) {
      console.log("[OCR Fallback] Detected PDF, attempting OCR...");
      // Try PDF to images approach first
      let text = await ocrFromPDFImages(filePath);
      if (text.length > 50) return text;

      // Fallback to direct PDF OCR (limited)
      text = await ocrFromPDF(filePath);
      return text;
    }

    console.warn("[OCR Fallback] Unsupported file type for OCR");
    return "";
  } catch (error) {
    console.error("[OCR Fallback] Error:", error.message);
    return "";
  }
}

/**
 * Cleanup Tesseract worker
 */
async function cleanupTesseract() {
  if (tesseractWorker) {
    console.log("[OCR] Cleaning up Tesseract worker...");
    try {
      await tesseractWorker.terminate();
      tesseractWorker = null;
      console.log("[OCR] Tesseract worker terminated");
    } catch (error) {
      console.error("[OCR] Error terminating worker:", error.message);
    }
  }
}

module.exports = {
  performOCRFallback,
  ocrFromImage,
  ocrFromPDF,
  ocrFromPDFImages,
  getTesseractWorker,
  cleanupTesseract,
};
