import type { FilteredResumeView } from "../../loader/filter.js";
import { escapeTypst } from "./renderer.js";
import { buildProtectedTermsRegex } from "../../config/protected-terms.js";

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

/**
 * Renders the Master View displaying ALL accomplishments (active & saved),
 * rendering inactive points inside a slightly dark/gray shaded background box.
 */
export function renderTypstMasterSource(resume: FilteredResumeView): string {
  const p = resume.personalInfo;
  const contactParts: string[] = [];
  if (p.email) contactParts.push(escapeTypst(p.email));
  if (p.phone) contactParts.push(escapeTypst(p.phone));
  if (p.location) contactParts.push(escapeTypst(p.location));
  if (p.linkedin) contactParts.push(escapeTypst(p.linkedin));
  if (p.github) contactParts.push(escapeTypst(p.github));

  const contactLine = contactParts.join(" | ");
  const protectedTermsRegex = buildProtectedTermsRegex();

  let content = `// Resume Workshop — Master View (Overview)
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
#set par(justify: true, leading: 0.52em, spacing: 4pt)
#set block(above: 5pt, below: 4pt)
#show link: set text(fill: rgb("#1d4ed8"))

// Custom heading styles (System 3: Left Accent Bar)
#let section-heading(title) = block(
  stroke: (left: 2.5pt + rgb("#1d4ed8")),
  inset: (left: 7pt),
  above: 10pt,
  below: 4pt,
)[#text(size: 10.5pt, weight: "bold", fill: rgb("#0f172a"))[#upper(title)]]

// Candidate Header
#align(center)[
  #text(font: ("Cambria", "Caladea", "Georgia", "Times New Roman"), size: 16pt, weight: "bold", fill: rgb("#0f172a"))[${escapeTypst(p.name)}] \\
  #v(4pt)
  #text(size: 8.5pt, fill: rgb("#64748b"))[${contactLine}]
]
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
  *${escapeTypst(exp.company)}* #h(1fr) #text(size: 8.5pt)[${escapeTypst(dateRange)}] \\
  #v(1.5pt)
  #emph[${escapeTypst(exp.roleTitle)}] #h(1fr) #text(size: 8.5pt)[${escapeTypst(exp.location || "")}]
]
`;
      if (exp.summary) {
        const cleanSummary = exp.summary.replace(/^Summary:\s*/i, "");
        content += `#block(above: 3pt, below: 4pt)[#text(size: 8.5pt)[*Summary:* ${escapeTypst(cleanSummary)}]]\n`;
      }

      // Group active vs inactive bullets for clean presentation
      const activeBullets = exp.bullets.filter((b) => b.isActive);
      const inactiveBullets = exp.bullets.filter((b) => !b.isActive);

      if (activeBullets.length > 0) {
        content += `#list(
  tight: true,
  marker: [•],
  spacing: 4pt,
`;
        for (const bullet of activeBullets) {
          content += `  [${escapeTypst(bullet.content)}],\n`;
        }
        content += `)
`;
      }

      if (inactiveBullets.length > 0) {
        content += `#v(2pt)\n#text(size: 8pt, weight: "bold", fill: rgb("#64748b"))[Saved points:]\n#v(1pt)\n`;
        for (const bullet of inactiveBullets) {
          const tagsStr = bullet.tags && bullet.tags.length > 0 ? ` (Tags: ${bullet.tags.join(", ")})` : "";
          content += `#block(
  fill: rgb("#f1f5f9"),
  stroke: (left: 2.5pt + rgb("#94a3b8")),
  inset: (x: 8pt, y: 4.5pt),
  radius: 3pt,
  above: 3pt,
  below: 3pt,
)[#text(size: 8.5pt, fill: rgb("#475569"))[— ${escapeTypst(bullet.content)}#text(size: 7.5pt, style: "italic", fill: rgb("#64748b"))[${escapeTypst(tagsStr)}]]]\n`;
        }
        content += `#v(2pt)\n`;
      }
    }
  }

  // Technical Skills
  if (resume.skillGroups && resume.skillGroups.length > 0) {
    content += `
#section-heading("Technical Skills")
`;
    for (const sg of resume.skillGroups) {
      content += `#text(size: 9.5pt)[*${escapeTypst(sg.category)}:* ${escapeTypst(sg.items)}] \\ \n`;
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
  *${escapeTypst(edu.institution)}* #h(1fr) #text(size: 8.5pt)[${escapeTypst(eduDate)}] \\
  #v(1.5pt)
  ${escapeTypst(degreeLine)} #h(1fr) #text(size: 8.5pt)[${escapeTypst(edu.location || "")}]
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
      content += `
#block(above: 5pt, below: 3pt)[
  #text(size: 9.5pt, weight: "bold", fill: rgb("#0f172a"))[${escapeTypst(proj.title)}:]
  #text(size: 9pt)[ ${escapeTypst(proj.description)}]
]
`;
    }
  }

  return content;
}

/** Backwards compatibility alias */
export const renderTypstFullVaultSource = renderTypstMasterSource;
