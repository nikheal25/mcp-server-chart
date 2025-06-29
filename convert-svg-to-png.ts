#!/usr/bin/env ts-node

import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join, extname, basename } from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function main() {
  const args = process.argv.slice(2);
  const inputDir = args[0] || "./generated-charts";
  const outputDir = args[1] || inputDir;

  console.log(`🔄 Converting SVG files from: ${inputDir}`);
  console.log(`📁 Output directory: ${outputDir}`);

  if (!existsSync(inputDir)) {
    console.error(`❌ Input directory not found: ${inputDir}`);
    process.exit(1);
  }

  const svgFiles = readdirSync(inputDir).filter(
    (file) => extname(file).toLowerCase() === ".svg"
  );

  if (svgFiles.length === 0) {
    console.log("⚠️ No SVG files found");
    return;
  }

  console.log(`📊 Found ${svgFiles.length} SVG files`);

  const results: { success: string[]; failed: string[] } = { success: [], failed: [] };

  for (const file of svgFiles) {
    const svgPath = join(inputDir, file);
    const pngFile = basename(file, ".svg") + ".png";
    const pngPath = join(outputDir, pngFile);

    try {
      await convertSvgToPng(svgPath, pngPath);
      results.success.push(file);
      console.log(`✅ ${file} → ${pngFile}`);
    } catch (error: any) {
      results.failed.push(file);
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed: ${file} - ${errorMessage}`);
    }
  }

  console.log(`\n🎉 Conversion complete!`);
  console.log(`✅ Success: ${results.success.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
}

async function convertSvgToPng(svgPath: string, pngPath: string): Promise<void> {
  const converters = [
    () => execAsync(`rsvg-convert -o "${pngPath}" "${svgPath}"`),
    () => execAsync(`convert "${svgPath}" "${pngPath}"`),
    () => execAsync(`inkscape --export-filename="${pngPath}" "${svgPath}"`),
  ];

  for (const converter of converters) {
    try {
      await converter();
      return;
    } catch (error) {
      continue;
    }
  }

  await createHtmlFallback(svgPath, pngPath);
}

async function createHtmlFallback(svgPath: string, pngPath: string): Promise<void> {
  const svgContent = readFileSync(svgPath, "utf-8");
  
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>SVG to PNG</title>
    <style>
        body { margin: 0; padding: 20px; background: white; font-family: Arial, sans-serif; }
        .notice { margin-bottom: 20px; padding: 10px; border: 1px solid #ddd; background: #f9f9f9; }
        svg { border: 1px solid #ccc; }
    </style>
</head>
<body>
    <div class="notice">
        <strong>Manual Conversion Required</strong><br>
        Original: ${basename(svgPath)}<br>
        Target: ${basename(pngPath)}<br>
        Right-click the SVG below and save as PNG, or take a screenshot.
    </div>
    ${svgContent}
</body>
</html>`;

  const htmlPath = pngPath.replace('.png', '.html');
  writeFileSync(htmlPath, htmlContent);
  
  console.log(`📄 Created fallback HTML: ${htmlPath}`);
  throw new Error(`No converter available. Created ${htmlPath} for manual conversion.`);
}

// Run main function directly (ES module compatible)
main().catch((error) => {
  console.error("💥 Script failed:", error.message);
  console.log(`
🔧 To install SVG converters:

macOS (Homebrew):
  brew install librsvg imagemagick inkscape

Ubuntu/Debian:
  sudo apt install librsvg2-bin imagemagick inkscape

Windows (Chocolatey):
  choco install rsvg-convert imagemagick inkscape
`);
  process.exit(1);
}); 