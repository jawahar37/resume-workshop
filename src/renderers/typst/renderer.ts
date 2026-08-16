import type { FilteredResumeView } from "../../loader/filter.js";

// Escape special Typst characters
function escapeTypst(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/@/g, "\\@")
    .replace(/_/g, "\\_")
    .replace(/\*/g, "\\*");
}

export function renderTypstSource(resume: FilteredResumeView): string {
  const p = resume.personalInfo;
  
  // Format contact items
  const contactParts: string[] = [];
  if (p.email) contactParts.push(`link("mailto:${p.email}")[${escapeTypst(p.email)}]`);
  if (p.phone) contactParts.push(`[${escapeTypst(p.phone)}]`);
  if (p.location) contactParts.push(`[${escapeTypst(p.location)}]`);
  if (p.linkedin) {
    const cleanUrl = p.linkedin.startsWith("http") ? p.linkedin : `https://${p.linkedin}`;
    contactParts.push(`link("${cleanUrl}")[${escapeTypst(p.linkedin)}]`);
  }
  if (p.github) {
    const cleanUrl = p.github.startsWith("http") ? p.github : `https://${p.github}`;
    contactParts.push(`link("${cleanUrl}")[${escapeTypst(p.github)}]`);
  }
  if (p.website) {
    const cleanUrl = p.website.startsWith("http") ? p.website : `https://${p.website}`;
    contactParts.push(`link("${cleanUrl}")[${escapeTypst(p.website)}]`);
  }

  const contactLine = contactParts.join(" #h(8pt) | #h(8pt) ");

  let content = `// Resume Workshop — Typst Opinionated Default Template
#set page(
  paper: "us-letter",
  margin: (x: 1.5cm, y: 1.4cm),
)
#set text(
  font: ("Helvetica", "Arial", "Liberation Sans", "DejaVu Sans"),
  size: 9.5pt,
  fill: rgb("#1a1a1a"),
  spacing: 120%,
)
#set par(justify: false, leading: 0.55em)

// Custom heading styles
#let section-heading(title) = {
  v(8pt)
  text(size: 11pt, weight: "bold", fill: rgb("#0f172a"))[#upper(title)]
  v(-3pt)
  line(length: 100%, stroke: 0.75pt + rgb("#cbd5e1"))
  v(3pt)
}

// Header
#align(center)[
  #text(size: 18pt, weight: "bold", fill: rgb("#0f172a"))[${escapeTypst(p.name)}] \\
  #v(2pt)
  #text(size: 10.5pt, weight: "medium", fill: rgb("#475569"))[${escapeTypst(p.title)}] \\
  #v(3pt)
  #text(size: 8.5pt, fill: rgb("#64748b"))[
    ${contactLine}
  ]
]
`;

  // Summary
  if (p.summary) {
    content += `
#section-heading("Professional Summary")
#text(size: 9pt)[${escapeTypst(p.summary)}]
`;
  }

  // Work Experience
  if (resume.experiences.length > 0) {
    content += `
#section-heading("Work Experience")
`;
    for (const exp of resume.experiences) {
      const dateRange = exp.endDate ? `${exp.startDate} – ${exp.endDate}` : `${exp.startDate} – Present`;
      content += `
#grid(
  columns: (1fr, auto),
  [*${escapeTypst(exp.company)}*],
  [#text(fill: rgb("#64748b"), size: 8.5pt)[${escapeTypst(dateRange)}]],
  [#emph[${escapeTypst(exp.roleTitle)}]],
  [#text(fill: rgb("#64748b"), size: 8.5pt)[${escapeTypst(exp.location || "")}]],
)
#v(-2pt)
#list(
  tight: true,
  marker: [•],
  spacing: 4.5pt,
`;
      for (const bullet of exp.bullets) {
        content += `  [${escapeTypst(bullet.content)}],\n`;
      }
      content += `)
#v(3pt)
`;
    }
  }

  // Skills
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
      const eduDate = edu.endDate ? `${edu.startDate || ""} – ${edu.endDate}` : `${edu.startDate || ""}`;
      const degreeLine = edu.field ? `${edu.degree}, ${edu.field}` : edu.degree;
      content += `
#grid(
  columns: (1fr, auto),
  [*${escapeTypst(edu.institution)}*],
  [#text(fill: rgb("#64748b"), size: 8.5pt)[${escapeTypst(eduDate)}]],
  [${escapeTypst(degreeLine)}],
  [#text(fill: rgb("#64748b"), size: 8.5pt)[${escapeTypst(edu.location || "")}]],
)
#v(2pt)
`;
    }
  }

  return content;
}
