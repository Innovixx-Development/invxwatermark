#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Default values
let outputFolder = '.';
let watermarkImage = './assets/transparent_watermark.png';

// Parse command-line arguments
const args = process.argv.slice(2);
const inputFiles: string[] = [];

for (let i = 0; i < args.length; i += 1) {
  switch (args[i]) {
    case '--output':
      outputFolder = args[i + 1];
      i += 1;
      break;
    case '--watermark':
      watermarkImage = args[i + 1];
      i += 1;
      break;
    default:
      inputFiles.push(args[i]);
      break;
  }
}

// Check if ImageMagick is installed
try {
  execSync('convert -version');
} catch (error) {
  console.error('ImageMagick is required but not installed.');
  process.exit(1);
}

// Check if Ghostscript is present for PDF processing with ImageMagick
try {
  execSync('gs -version');
} catch (error) {
  console.error('Ghostscript is required but not installed.');
  process.exit(1);
}

// Validate input and output paths
if (inputFiles.length === 0) {
  console.error('Input file path is required. Provide the path as an argument.');
  process.exit(1);
}

if (!fs.existsSync(watermarkImage)) {
  console.error(`Watermark image not found: ${watermarkImage}`);
  process.exit(1);
}

// Create temporary folder if it doesn't exist
const tempFolder = '/tmp/watermarking';
fs.mkdirSync(tempFolder, { recursive: true });

const watermarkingCommand = (inputPath: string, outputPath: string) => {
  return `composite -gravity southeast -geometry +50+50 "${watermarkImage}" "${inputPath}" "${outputPath}" && \
    composite -gravity northwest -geometry +50+50 "${watermarkImage}" "${outputPath}" "${outputPath}" && \
    composite -gravity northeast -geometry +50+50 "${watermarkImage}" "${outputPath}" "${outputPath}" && \
    composite -gravity southwest -geometry +50+50 "${watermarkImage}" "${outputPath}" "${outputPath}" && \
    composite -gravity center -geometry +0+0 "${watermarkImage}" "${outputPath}" "${outputPath}" && \
    composite -gravity north -geometry +0+50 "${watermarkImage}" "${outputPath}" "${outputPath}" && \
    composite -gravity south -geometry +0+50 "${watermarkImage}" "${outputPath}" "${outputPath}" && \
    composite -gravity east -geometry +50+0 "${watermarkImage}" "${outputPath}" "${outputPath}" && \
    composite -gravity west -geometry +50+0 "${watermarkImage}" "${outputPath}" "${outputPath}" && \
    composite -gravity east -geometry +250+400 "${watermarkImage}" "${outputPath}" "${outputPath}" && \
    composite -gravity west -geometry +250+400 "${watermarkImage}" "${outputPath}" "${outputPath}" && \
    composite -gravity east -geometry +250-400 "${watermarkImage}" "${outputPath}" "${outputPath}" && \
    composite -gravity west -geometry +250-400 "${watermarkImage}" "${outputPath}" "${outputPath}"`;
};

inputFiles.forEach((inputFile) => {
  const fileExtension = path.extname(inputFile).toLowerCase();

  // Generate a unique ID for the temporary files
  const uniqueId = Math.floor(Date.now() / 1000);

  if (fileExtension === '.pdf') {
    // Convert PDF pages to images
    const tempImagesPath = `${tempFolder}/${uniqueId}-page-%d.png`;
    execSync(`convert -density 300 "${inputFile}" "${tempImagesPath}"`);

    // Process each image with watermarking
    const pageFiles = fs.readdirSync(tempFolder).filter((file) => file.startsWith(`${uniqueId}-page`));
    pageFiles.forEach((pageFile) => {
      const tempImagePath = path.join(tempFolder, pageFile);
      execSync(watermarkingCommand(tempImagePath, tempImagePath), { stdio: 'inherit' });
    });

    // Combine watermarked images into a single PDF
    const watermarkedPdfPath = `${path.join(outputFolder, path.basename(inputFile, fileExtension))}_watermarked.pdf`;
    execSync(`convert "${tempFolder}/${uniqueId}-page-*.png" "${watermarkedPdfPath}"`);

    // Clean up temporary images
    pageFiles.forEach((pageFile) => {
      fs.unlinkSync(path.join(tempFolder, pageFile));
    });
  } else {
    // Temporary image output path
    const tempOutputImagePath = `${tempFolder}/temp_image_${uniqueId}.png`;
    // Apply watermark to image files
    execSync(watermarkingCommand(inputFile, tempOutputImagePath), { stdio: 'inherit' });
    // Move watermarked image to the output folder
    fs.renameSync(tempOutputImagePath, path.join(outputFolder, `${path.basename(inputFile, fileExtension)}_watermarked${fileExtension}`));
  }
});