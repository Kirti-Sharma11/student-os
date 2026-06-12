// utils/pdfGenerator.js
const path = require("path");
const PDFDocument = require("pdfkit");
const fs = require("fs");

function generatePDF(reportData) {
  return new Promise((resolve) => {

    const outputPath = path.join(
      __dirname,
      "../../uploads",
      `ATS_Report_${Date.now()}.pdf`
    );

    const doc = new PDFDocument();

    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);

    doc.fontSize(22).text("Resume Analysis Report", {
      align: "center",
    });

    doc.moveDown();

    doc.fontSize(14).text(`Name: ${reportData.name}`);
    doc.text(`ATS Score: ${reportData.atsScore}/100`);

    doc.moveDown();

    doc.fontSize(16).text("Strengths");

    reportData.strengths.forEach((item) => {
      doc.fontSize(12).text(`• ${item}`);
    });

    doc.moveDown();

    doc.fontSize(16).text("Weaknesses");

    reportData.weaknesses.forEach((item) => {
      doc.fontSize(12).text(`• ${item}`);
    });

    doc.moveDown();

    doc.fontSize(16).text("Missing Skills");

    reportData.missingSkills.forEach((item) => {
      doc.fontSize(12).text(`• ${item}`);
    });

    doc.moveDown();

    doc.fontSize(16).text("Suggestions");

    reportData.suggestions.forEach((item) => {
      doc.fontSize(12).text(`• ${item}`);
    });
    stream.on("finish", () => {
  resolve(outputPath);
});

    doc.end();

    stream.on("finish", () => resolve(outputPath));
  });
}

module.exports = generatePDF;