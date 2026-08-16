import type { FilteredResumeView } from "../../loader/filter.js";
import { buildProtectedTermsRegex } from "../../config/protected-terms.js";

// Escape special Typst characters
export function escapeTypst(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/\\/g, () => "\\\\")
    .replace(/\[/g, () => "\\[")
    .replace(/\]/g, () => "\\]")
    .replace(/\$/g, () => "\\$")
    .replace(/#/g, () => "\\#")
    .replace(/@/g, () => "\\@")
    .replace(/_/g, () => "\\_")
    .replace(/\*/g, () => "\\*");
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  if (dateStr === "Present" || dateStr === "present") return "Present";
  const match = dateStr.match(/^(\d{4})-(\d{2})$/);
  if (!match) return dateStr;
  const year = match[1];
  const monthNum = parseInt(match[2], 10);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  if (monthNum >= 1 && monthNum <= 12) {
    return `${months[monthNum - 1]} ${year}`;
  }
  return dateStr;
}

function formatDateRange(startDate?: string | null, endDate?: string | null): string {
  const start = formatDate(startDate);
  const end = formatDate(endDate) || "Present";
  if (!start) return end;
  return `${start} – ${end}`;
}

export function renderTypstSource(resume: FilteredResumeView): string {
  const p = resume.personalInfo;
  
  // Format contact items
  const contactParts: string[] = [];
  if (p.email) contactParts.push(`#link("mailto:${p.email}")[${escapeTypst(p.email)}]`);
  if (p.phone) {
    const cleanPhoneDigits = p.phone.replace(/[^0-9+]/g, "");
    contactParts.push(`#link("tel:${cleanPhoneDigits}")[${escapeTypst(p.phone)}]`);
  }
  if (p.location) {
    const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(p.location)}`;
    contactParts.push(`#link("${mapsUrl}")[${escapeTypst(p.location)}]`);
  }
  if (p.linkedin) {
    const cleanUrl = p.linkedin.startsWith("http") ? p.linkedin : `https://${p.linkedin}`;
    contactParts.push(`#link("${cleanUrl}")[${escapeTypst(p.linkedin)}]`);
  }
  if (p.github) {
    const cleanUrl = p.github.startsWith("http") ? p.github : `https://${p.github}`;
    contactParts.push(`#link("${cleanUrl}")[${escapeTypst(p.github)}]`);
  }
  if (p.website) {
    const cleanUrl = p.website.startsWith("http") ? p.website : `https://${p.website}`;
    contactParts.push(`#link("${cleanUrl}")[${escapeTypst(p.website)}]`);
  }

  const contactLine = contactParts.join(" | ");

  let content = `// Resume Workshop — Typst Opinionated Default Template
#set page(
  paper: "us-letter",
  margin: (x: 1.5cm, top: 0.8cm, bottom: 1.4cm),
)
#set text(
  font: ("Calibri", "Helvetica", "Arial", "Liberation Sans", "DejaVu Sans"),
  size: 9.5pt,
  fill: rgb("#1a1a1a"),
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

// Header
#align(center)[
  #text(font: ("Cambria", "Caladea", "Georgia", "Times New Roman"), size: 16pt, weight: "bold", fill: rgb("#0f172a"))[${escapeTypst(p.name)}] \\
  #v(4pt)
  #text(size: 8.5pt, fill: rgb("#64748b"))[
    ${contactLine}
  ]
]
`;

  // Summary
  if (p.summary) {
    const summaryLines = p.summary
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

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
      content += `#list(
  tight: true,
  marker: [•],
  spacing: 4pt,
`;
      for (const bullet of exp.bullets) {
        content += `  [${escapeTypst(bullet.content)}],\n`;
      }
      content += `)
`;
    }
  }

  // Skills
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
      if (edu.courses) {
        content += `#block(above: 2pt, below: 4pt)[#text(size: 8.5pt)[*Courses:* ${escapeTypst(edu.courses)}]]\n`;
      }
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
