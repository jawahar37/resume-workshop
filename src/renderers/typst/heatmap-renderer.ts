import type { FilteredResumeView } from "../../loader/filter.js";
import { escapeTypst } from "./renderer.js";
import {
  categorizeBulletSentences,
  SKILL_CATEGORIES,
  type SkillCategory,
} from "../../loader/skill-mapper.js";
import { buildProtectedTermsRegex } from "../../config/protected-terms.js";

/**
 * Formats a date string (YYYY-MM) into clean AP style (e.g. "Jan 2024").
 */
function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  if (dateStr.toLowerCase() === "present") return "Present";

  const parts = dateStr.split("-");
  if (parts.length < 2) return dateStr;

  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  if (monthIdx >= 0 && monthIdx < 12) {
    return `${months[monthIdx]} ${year}`;
  }
  return dateStr;
}

function formatDateRange(start?: string | null, end?: string | null): string {
  const startFmt = formatDate(start);
  const endFmt = formatDate(end);
  if (startFmt && endFmt) {
    return `${startFmt} – ${endFmt}`;
  }
  return startFmt || endFmt || "";
}

import { categorizeBulletSentencesLLM } from "../../loader/llm-skill-mapper.js";

/**
 * Renders an alternate Typst source file with 1:1 identical layout, but with:
 * 1. A top Skill Category Color Legend.
 * 2. Sentence-level color coding for experience bullet points (Heuristic or LLM-assisted).
 */
export function renderTypstSkillHeatmapSource(
  resume: FilteredResumeView,
  options?: { llm?: boolean }
): string {
  const isLLM = Boolean(options?.llm);
  const p = resume.personalInfo;
  const contactParts: string[] = [];
  if (p.email) contactParts.push(escapeTypst(p.email));
  if (p.phone) contactParts.push(escapeTypst(p.phone));
  if (p.location) contactParts.push(escapeTypst(p.location));
  if (p.linkedin) contactParts.push(escapeTypst(p.linkedin));
  if (p.github) contactParts.push(escapeTypst(p.github));

  const contactLine = contactParts.join(" #h(2pt) | #h(2pt) ");
  const protectedTermsRegex = buildProtectedTermsRegex();

  const modeTitle = isLLM ? "SKILL HEATMAP (LLM-CLASSIFIED)" : "SKILL DIMENSION LEGEND";

  let content = `// Resume Workshop — Skill-Mapped Color Resume View (Heatmap)
#set page(
  paper: "us-letter",
  margin: (x: 1.5cm, top: 0.8cm, bottom: 1.4cm),
)
#set text(
  font: ("Liberation Sans", "Helvetica Neue", "Arial", "DejaVu Sans"),
  size: 9.5pt,
  fill: rgb("#1e293b"),
  spacing: 115%,
  hyphenate: true,
  lang: "en",
  region: "us",
)
#set par(justify: true, leading: 0.52em)
#set block(above: 5pt, below: 4pt)
#show link: set text(fill: rgb("#1d4ed8"))
#show regex("${protectedTermsRegex}"): it => text(hyphenate: false)[#it]

// Custom heading styles (System 3: Left Accent Bar)
#let section-heading(title) = block(
  stroke: (left: 2.5pt + rgb("#1d4ed8")),
  inset: (left: 7pt),
  above: 10pt,
  below: 4pt,
)[#text(size: 10.5pt, weight: "bold", fill: rgb("#0f172a"))[#upper(title)]]

// Candidate Header
#align(center)[
  #text(size: 19pt, weight: "bold", fill: rgb("#0f172a"))[${escapeTypst(p.name)}] \\
  #v(-2pt)
  #text(size: 10pt, style: "italic", fill: rgb("#475569"))[${escapeTypst(p.title)}] \\
  #v(2pt)
  #text(size: 8.5pt, fill: rgb("#64748b"))[${contactLine}]
]

// Skill Category Heatmap Color Legend
#v(2pt)
#align(center)[
  #block(
    fill: rgb("#f8fafc"),
    stroke: 0.5pt + rgb("#e2e8f0"),
    inset: (x: 8pt, y: 4pt),
    radius: 3pt,
  )[
    #text(size: 7.5pt, weight: "bold", fill: rgb("#475569"))[${modeTitle}: ]
    #text(size: 7.5pt, weight: "bold", fill: rgb("${SKILL_CATEGORIES.systems.colorHex}"))[■ Systems & Architecture] #h(4pt)
    #text(size: 7.5pt, weight: "bold", fill: rgb("${SKILL_CATEGORIES.business.colorHex}"))[■ Business Impact] #h(4pt)
    #text(size: 7.5pt, weight: "bold", fill: rgb("${SKILL_CATEGORIES.leadership.colorHex}"))[■ Leadership] #h(4pt)
    #text(size: 7.5pt, weight: "bold", fill: rgb("${SKILL_CATEGORIES.quality_security.colorHex}"))[■ Quality & Security] #h(4pt)
    #text(size: 7.5pt, weight: "bold", fill: rgb("${SKILL_CATEGORIES.data_cloud.colorHex}"))[■ Data & Cloud] #h(4pt)
    #text(size: 7.5pt, weight: "bold", fill: rgb("${SKILL_CATEGORIES.ai_ml.colorHex}"))[■ AI / ML]
  ]
]
#v(2pt)
`;

  // Executive / Professional Summary
  if (p.summary) {
    const summaryLines = p.summary
      .trim()
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    content += `
#section-heading("Professional Summary")
`;
    if (summaryLines.length > 1) {
      content += `#list(
  tight: true,
  marker: [•],
  spacing: 4pt,
`;
      for (const line of summaryLines) {
        content += `  [${escapeTypst(line)}],\n`;
      }
      content += `)
`;
    } else {
      content += `#text(size: 9pt)[${escapeTypst(p.summary)}]\n`;
    }
  }

  // Work Experience
  if (resume.experiences.length > 0) {
    content += `
#section-heading("Work Experience")
`;
    for (const exp of resume.experiences) {
      const dateRange = formatDateRange(exp.startDate, exp.endDate);
      content += `
#block(above: 6pt, below: 4pt)[
  #grid(
    columns: (1fr, auto),
    align: (left, right),
    row-gutter: 4pt,
    [*${escapeTypst(exp.company)}*],
    [#text(size: 8.5pt)[${escapeTypst(dateRange)}]],
    [#emph[${escapeTypst(exp.roleTitle)}]],
    [#text(size: 8.5pt)[${escapeTypst(exp.location || "")}]],
  )
]
`;
      if (exp.summary) {
        const cleanSummary = exp.summary.replace(/^Summary:\s*/i, "");
        content += `#block(above: 3pt, below: 4pt)[#text(size: 8.5pt)[*Summary:* ${escapeTypst(cleanSummary)}]]\n`;
      }

      content += `#list(
  tight: true,
  marker: [•],
  spacing: 4pt,
`;
      for (const bullet of exp.bullets) {
        const categorizedSentences = isLLM
          ? categorizeBulletSentencesLLM(bullet.content, bullet.tags || [])
          : categorizeBulletSentences(bullet.content, bullet.tags || []);

        const coloredText = categorizedSentences
          .map((cs) => `#text(fill: rgb("${cs.colorHex}"))[${escapeTypst(cs.text)}]`)
          .join(" ");

        content += `  [${coloredText}],\n`;
      }
      content += `)
`;
    }
  }

  // Technical Skills
  if (resume.skillGroups && resume.skillGroups.length > 0) {
    content += `
#section-heading("Technical Skills")
`;
    for (const sg of resume.skillGroups) {
      content += `#text(size: 9pt)[*${escapeTypst(sg.category)}:* ${escapeTypst(sg.items)}] \\ \n`;
    }
  }

  // Education
  if (resume.education && resume.education.length > 0) {
    content += `
#section-heading("Education")
`;
    for (const edu of resume.education) {
      const eduDate = formatDateRange(edu.startDate, edu.endDate);
      const degreeLine = edu.field ? `${edu.degree}, ${edu.field}` : edu.degree;
      content += `
#block(above: 5pt, below: 4pt)[
  #grid(
    columns: (1fr, auto),
    align: (left, right),
    row-gutter: 4pt,
    [*${escapeTypst(edu.institution)}*],
    [#text(size: 8.5pt)[${escapeTypst(eduDate)}]],
    [#emph[${escapeTypst(degreeLine)}]],
    [#text(size: 8.5pt)[${escapeTypst(edu.location || "")}]],
  )
]
`;
    }
  }

  // Academic Projects
  if (resume.projects && resume.projects.length > 0) {
    content += `
#section-heading("Academic Projects")
`;
    for (const proj of resume.projects) {
      const categorizedSentences = isLLM
        ? categorizeBulletSentencesLLM(proj.description)
        : categorizeBulletSentences(proj.description);

      const coloredText = categorizedSentences
        .map((cs) => `#text(fill: rgb("${cs.colorHex}"))[${escapeTypst(cs.text)}]`)
        .join(" ");

      content += `
#block(above: 5pt, below: 3pt)[
  #text(size: 9.5pt, weight: "bold", fill: rgb("#0f172a"))[${escapeTypst(proj.title)}:]
  #text(size: 9pt)[ ${coloredText}]
]
`;
    }
  }

  return content;
}
