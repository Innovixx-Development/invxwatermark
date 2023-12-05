#!/usr/bin/env node

import { execSync } from 'child_process';
import readline from 'readline';
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
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('ImageMagick is not installed. Do you want to install it? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      // Install ImageMagick
      execSync('sudo apt-get install imagemagick');
    } else {
      process.exit(1);
    }

    rl.close();
  });
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
const tempFolder = '/tmp';
fs.mkdirSync(tempFolder, { recursive: true });

inputFiles.forEach((inputFile) => {
  // Generate a unique ID for the temporary image file
  const uniqueId = Math.floor(Date.now() / 1000);

  // Perform watermarking
  execSync(
    `composite -gravity southeast -geometry +50+50 "${watermarkImage}" "${inputFile}" "${tempFolder}/temp_image_${uniqueId}.png" && \
    composite -gravity northwest -geometry +50+50 "${watermarkImage}" "${tempFolder}/temp_image_${uniqueId}.png" "${tempFolder}/temp_image_${uniqueId}.png" && \
    composite -gravity northeast -geometry +50+50 "${watermarkImage}" "${tempFolder}/temp_image_${uniqueId}.png" "${tempFolder}/temp_image_${uniqueId}.png" && \
    composite -gravity southwest -geometry +50+50 "${watermarkImage}" "${tempFolder}/temp_image_${uniqueId}.png" "${tempFolder}/temp_image_${uniqueId}.png" && \
    composite -gravity center -geometry +0+0 "${watermarkImage}" "${tempFolder}/temp_image_${uniqueId}.png" "${tempFolder}/temp_image_${uniqueId}.png" && \
    composite -gravity north -geometry +0+50 "${watermarkImage}" "${tempFolder}/temp_image_${uniqueId}.png" "${tempFolder}/temp_image_${uniqueId}.png" && \
    composite -gravity south -geometry +0+50 "${watermarkImage}" "${tempFolder}/temp_image_${uniqueId}.png" "${tempFolder}/temp_image_${uniqueId}.png" && \
    composite -gravity east -geometry +50+0 "${watermarkImage}" "${tempFolder}/temp_image_${uniqueId}.png" "${tempFolder}/temp_image_${uniqueId}.png" && \
    composite -gravity west -geometry +50+0 "${watermarkImage}" "${tempFolder}/temp_image_${uniqueId}.png" "${tempFolder}/temp_image_${uniqueId}.png" && \
    composite -gravity east -geometry +250+400 "${watermarkImage}" "${tempFolder}/temp_image_${uniqueId}.png" "${tempFolder}/temp_image_${uniqueId}.png" && \
    composite -gravity west -geometry +250+400 "${watermarkImage}" "${tempFolder}/temp_image_${uniqueId}.png" "${tempFolder}/temp_image_${uniqueId}.png" && \
    composite -gravity east -geometry +250-400 "${watermarkImage}" "${tempFolder}/temp_image_${uniqueId}.png" "${tempFolder}/temp_image_${uniqueId}.png" && \
    composite -gravity west -geometry +250-400 "${watermarkImage}" "${tempFolder}/temp_image_${uniqueId}.png" "${tempFolder}/temp_image_${uniqueId}.png" && \
    mv "${tempFolder}/temp_image_${uniqueId}.png" "${path.join(outputFolder, path.basename(inputFile, path.extname(inputFile)))}_watermarked.png"`,
    { stdio: 'inherit' },
  );
});
