const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

async function extractText(filePath, mimeType, originalName) {
  try {
    let text = "";

    // =========================
    // PDF EXTRACTION
    // =========================
    if (
      mimeType === "application/pdf" ||
      originalName.toLowerCase().endsWith(".pdf")
    ) {
      console.log("[TEXT EXTRACTION] Processing PDF...");

      const dataBuffer = fs.readFileSync(filePath);

      const data = await pdfParse(dataBuffer);

      console.log("PAGES:", data.numpages);
      console.log("RAW TEXT LENGTH:", data.text?.length || 0);
      console.log("RAW TEXT PREVIEW:");
      console.log(data.text?.substring(0, 300));

      // IMPORTANT FIX
      text = data.text || "";
    }

    // =========================
    // DOCX EXTRACTION
    // =========================
    else if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      originalName.toLowerCase().endsWith(".docx")
    ) {
      console.log("[TEXT EXTRACTION] Processing DOCX...");

      const result = await mammoth.extractRawText({
        path: filePath,
      });

      text = result.value || "";

      console.log(
        "DOCX RAW TEXT LENGTH:",
        text.length
      );
    }

    // =========================
    // CLEAN TEXT
    // =========================
    console.log("BEFORE CLEAN:", text.length);

    text = text
      .replace(/\s+/g, " ")
      .trim();

    console.log("AFTER CLEAN:", text.length);

    return text;
  } catch (err) {
    console.error("TEXT EXTRACTION ERROR:", err);
    return "";
  }
}

module.exports = {
  extractText,
};