#!/usr/bin/env node

import fs from "fs/promises";
import path from "path";
import { PDFDocument } from "pdf-lib";

async function readImage(filePath: string) {
  return fs.readFile(filePath);
}

async function convertImagesToPdf(imagePaths: string[], outputPath: string) {
  const pdfDoc = await PDFDocument.create();

  for (const imagePath of imagePaths) {
    const imageBytes = await readImage(imagePath);
    const ext = path.extname(imagePath).toLowerCase();

    let image;
    if (ext === ".jpg" || ext === ".jpeg") {
      image = await pdfDoc.embedJpg(imageBytes);
    } else if (ext === ".png") {
      image = await pdfDoc.embedPng(imageBytes);
    } else {
      console.log(`Unsupported file type: ${ext}`);
      continue;
    }

    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  const pdfBytes = await pdfDoc.save();
  await fs.writeFile(outputPath, pdfBytes);
  console.log(`PDF created at ${outputPath}`);
}

async function getImagePathsFromCwd() {
  const files = await fs.readdir(process.cwd());
  return files.filter((file) =>
    [".jpg", ".jpeg", ".png"].includes(path.extname(file).toLowerCase())
  );
}

(async () => {
  const imagePaths = await getImagePathsFromCwd();
  if (imagePaths.length === 0) {
    console.log("No image files found in the current directory.");
    return;
  }
  const outputPath = "output.pdf";
  await convertImagesToPdf(imagePaths, outputPath);
})();
