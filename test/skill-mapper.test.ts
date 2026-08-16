import { test } from "node:test";
import assert from "node:assert/strict";
import { categorizeBulletSentences, SKILL_CATEGORIES } from "../src/loader/skill-mapper.js";
import { renderTypstSkillHeatmapSource } from "../src/renderers/typst/heatmap-renderer.js";
import type { FilteredResumeView } from "../src/loader/filter.js";

test("Skill Mapper - Sentence-level splitting and categorization", async (t) => {
  await t.test("Splits multi-sentence bullet into individual sentences with distinct categories", () => {
    const multiSentenceBullet =
      "Architected distributed event-driven pipeline in Go and Kafka ingesting 2.5M events/sec. Cut cloud operating costs by 15% in Q2 2024 by streamlining vendor API contracts.";

    const result = categorizeBulletSentences(multiSentenceBullet, ["Kafka", "Go", "Cost"]);

    assert.equal(result.length, 2);
    assert.equal(result[0].category, "systems");
    assert.equal(result[0].colorHex, SKILL_CATEGORIES.systems.colorHex);

    assert.equal(result[1].category, "business");
    assert.equal(result[1].colorHex, SKILL_CATEGORIES.business.colorHex);
  });

  await t.test("Categorizes Security & S-SDLC bullet correctly", () => {
    const bullet = "Engineered Hashicorp vault integrations into both critical and legacy systems through clean, maintainable code.";
    const result = categorizeBulletSentences(bullet, ["HashiCorp Vault", "Security"]);

    assert.equal(result.length, 1);
    assert.equal(result[0].category, "quality_security");
  });

  await t.test("Categorizes Leadership & SME bullet correctly", () => {
    const bullet = "Authored detailed technical design documents, data flow diagrams, and API specifications (OpenAPI/Swagger) to align cross-functional teams.";
    const result = categorizeBulletSentences(bullet, ["OpenAPI", "Swagger", "Architecture"]);

    assert.equal(result.length, 1);
    assert.equal(result[0].category, "leadership");
  });

  await t.test("Categorizes AI / ML bullet correctly", () => {
    const bullet = "Developed and upgraded Java and Python web applications for AI enablement and PyTorch integration.";
    const result = categorizeBulletSentences(bullet, ["AI Integration", "PyTorch"]);

    assert.equal(result.length, 1);
    assert.equal(result[0].category, "ai_ml");
  });

  await t.test("Renders Typst Skill Heatmap Source with legend and colored text", () => {
    const mockResume: FilteredResumeView = {
      profileId: "full-stack-software-engineer",
      profileName: "Full Stack Software Engineer",
      targetRole: "Senior Software Engineer",
      personalInfo: {
        name: "Jawahar Pinnelli",
        title: "Software Developer",
        email: "jawahar@example.com",
      },
      experiences: [
        {
          id: "exp-1",
          company: "Goldman Sachs",
          roleTitle: "Software Engineer",
          startDate: "2024-01",
          endDate: "Present",
          bullets: [
            {
              id: "b-1",
              content: "Re-architected Python backend API ingestion scripts using asynchronous I/O. Cut batch synchronization runtime from 30 minutes to 30 seconds.",
              isActive: true,
              tags: ["Python", "Async"],
            },
          ],
        },
      ],
      skillGroups: [],
      education: [],
      projects: [],
      stats: {
        activeBulletCount: 1,
        totalWordCount: 50,
        estimatedPageCount: 1,
      },
    };

    const source = renderTypstSkillHeatmapSource(mockResume);
    assert.match(source, /SKILL DIMENSION LEGEND/);
    assert.match(source, /#text\(fill: rgb\("#1d4ed8"\)\)/);
    assert.match(source, /#text\(fill: rgb\("#059669"\)\)/);
  });
});
