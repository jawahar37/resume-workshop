import type { FilteredResumeView } from "../../loader/filter.js";

export function renderMarkdownSource(resume: FilteredResumeView): string {
  const p = resume.personalInfo;
  const lines: string[] = [];

  // Header
  lines.push(`# ${p.name}`);
  lines.push(`**${p.title}**`);
  const contact: string[] = [];
  if (p.email) contact.push(p.email);
  if (p.phone) contact.push(p.phone);
  if (p.location) contact.push(p.location);
  if (p.website) contact.push(p.website);
  if (p.github) contact.push(p.github);
  if (p.linkedin) contact.push(p.linkedin);
  lines.push(contact.join(" | "));
  lines.push("");

  // Summary
  if (p.summary) {
    lines.push("## Summary");
    lines.push(p.summary);
    lines.push("");
  }

  // Work Experience
  if (resume.experiences.length > 0) {
    lines.push("## Work Experience");
    for (const exp of resume.experiences) {
      const dateRange = exp.endDate ? `${exp.startDate} – ${exp.endDate}` : `${exp.startDate} – Present`;
      lines.push(`### ${exp.roleTitle} — ${exp.company}`);
      lines.push(`*${dateRange}* | *${exp.location || "Remote"}*`);
      if (exp.summary) {
        lines.push(`*${exp.summary}*`);
      }
      lines.push("");
      for (const bullet of exp.bullets) {
        lines.push(`- ${bullet.content}`);
      }
      lines.push("");
    }
  }

  // Skills
  if (resume.skillGroups && resume.skillGroups.length > 0) {
    lines.push("## Technical Skills");
    for (const sg of resume.skillGroups) {
      lines.push(`- **${sg.category}:** ${sg.items}`);
    }
    lines.push("");
  }

  // Education
  if (resume.education && resume.education.length > 0) {
    lines.push("## Education");
    for (const edu of resume.education) {
      const date = edu.endDate ? `${edu.startDate || ""} – ${edu.endDate}` : `${edu.startDate || ""}`;
      const deg = edu.field ? `${edu.degree}, ${edu.field}` : edu.degree;
      lines.push(`- **${edu.institution}** — ${deg} (${date})`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
