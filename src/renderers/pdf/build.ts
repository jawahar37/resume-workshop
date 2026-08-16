import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { renderTypstSource } from "../typst/renderer.js";
import type { FilteredResumeView } from "../../loader/filter.js";

export function isTypstInstalled(): boolean {
  try {
    execSync("typst --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export interface BuildPdfOptions {
  outputPath: string;
  sourcePath?: string;
  keepSource?: boolean;
}

export interface BuildPdfResult {
  success: boolean;
  pdfPath: string;
  typSourcePath: string;
  typstInstalled: boolean;
  message: string;
  stats: FilteredResumeView["stats"];
}

export function compileTypstToPdf(
  resume: FilteredResumeView,
  options: BuildPdfOptions
): BuildPdfResult {
  const typContent = renderTypstSource(resume);
  const pdfOutDir = path.dirname(options.outputPath);
  if (!fs.existsSync(pdfOutDir)) {
    fs.mkdirSync(pdfOutDir, { recursive: true });
  }

  // Determine source file path
  const sourcePath =
    options.sourcePath ||
    options.outputPath.replace(/\.pdf$/, ".typ");

  const sourceDir = path.dirname(sourcePath);
  if (!fs.existsSync(sourceDir)) {
    fs.mkdirSync(sourceDir, { recursive: true });
  }

  fs.writeFileSync(sourcePath, typContent, "utf8");

  const typstAvailable = isTypstInstalled();

  if (!typstAvailable) {
    return {
      success: false,
      pdfPath: options.outputPath,
      typSourcePath: sourcePath,
      typstInstalled: false,
      message: `Typst binary not found. Generated Typst markup at ${sourcePath}. Install Typst with: 'winget install typst.typst' (Windows) or 'brew install typst' (macOS/Linux)`,
      stats: resume.stats,
    };
  }

  try {
    execSync(`typst compile "${sourcePath}" "${options.outputPath}"`, {
      stdio: "pipe",
    });

    if (!options.keepSource && sourcePath !== options.outputPath) {
      // clean up intermediate if desired
    }

    return {
      success: true,
      pdfPath: options.outputPath,
      typSourcePath: sourcePath,
      typstInstalled: true,
      message: `Compiled PDF successfully (${resume.stats.estimatedPageCount} page est.)`,
      stats: resume.stats,
    };
  } catch (err: any) {
    return {
      success: false,
      pdfPath: options.outputPath,
      typSourcePath: sourcePath,
      typstInstalled: true,
      message: `Typst compilation failed: ${err.message || err}`,
      stats: resume.stats,
    };
  }
}
