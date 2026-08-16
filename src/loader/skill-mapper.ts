export type SkillCategory =
  | "systems"
  | "business"
  | "leadership"
  | "quality_security"
  | "data_cloud"
  | "ai_ml";

export interface SkillCategoryInfo {
  id: SkillCategory;
  name: string;
  colorHex: string;
  description: string;
  keywords: string[];
}

export const SKILL_CATEGORIES: Record<SkillCategory, SkillCategoryInfo> = {
  systems: {
    id: "systems",
    name: "Systems & Architecture",
    colorHex: "#1d4ed8", // Royal Blue
    description: "Hard Technical Depth & Systems Mastery",
    keywords: [
      "java", "python", "c", "c++", "go", "groovy", "scripting", "restful apis",
      "microservices", "asynchronous i/o", "async", "performance optimization",
      "backend", "ingestion", "throughput", "architecture", "system design",
      "multi-threaded", "concurrency", "distributed systems", "runtimes"
    ],
  },
  business: {
    id: "business",
    name: "Business Impact & Metrics",
    colorHex: "#059669", // Emerald Green
    description: "Quantified Results, Latency, Cost & ROI",
    keywords: [
      "latency", "runtime", "reduction", "cost", "operating costs", "efficiency",
      "roi", "savings", "throughput", "scale", "million", "users", "transaction",
      "compliance", "control reports", "sla", "availability", "uptime", "conversion"
    ],
  },
  leadership: {
    id: "leadership",
    name: "Leadership & Collaboration",
    colorHex: "#9333ea", // Deep Purple
    description: "SME Status, Cross-Functional Alignment & Specs",
    keywords: [
      "owned", "spearhead", "spearheaded", "led", "sme", "subject matter expert",
      "collaborated", "cross-functional", "liaising", "technical design", "openapi",
      "swagger", "documentation", "diagrams", "mentored", "guidance", "ownership"
    ],
  },
  quality_security: {
    id: "quality_security",
    name: "Quality, Testing & Security",
    colorHex: "#2563eb", // Indigo Blue
    description: "Software Craftsmanship, S-SDLC, Testing & Vault",
    keywords: [
      "s-sdlc", "sdlc", "testing", "unit test", "integration test", "code coverage",
      "defects", "post-deployment defects", "sast", "sca", "sonar", "fortify",
      "security", "hashicorp vault", "vault", "secrets", "remediated", "vulnerabilities",
      "junit", "unittest", "code reviews", "hardening"
    ],
  },
  data_cloud: {
    id: "data_cloud",
    name: "Data & Cloud Infrastructure",
    colorHex: "#d97706", // Amber Orange
    description: "Kubernetes, AWS, Docker, Snowflake & Pipelines",
    keywords: [
      "snowflake", "databricks", "data engineering", "warehousing", "kafka",
      "aws", "kubernetes", "eks", "gke", "docker", "ci/cd", "gitlab", "jenkins",
      "terraform", "cloud", "event-driven", "pipeline", "etl"
    ],
  },
  ai_ml: {
    id: "ai_ml",
    name: "AI / ML & Emerging Tech",
    colorHex: "#db2777", // Rose Pink
    description: "PyTorch, TensorFlow, Isaac Gym, AI Enablement",
    keywords: [
      "ai", "ai/ml", "ai enablement", "pytorch", "tensorflow", "isaac gym",
      "reinforcement learning", "rl", "cuda", "llvm", "clang", "shaders",
      "webgl", "recommender", "lenskit", "surprise"
    ],
  },
};

export interface CategorizedSentence {
  text: string;
  category: SkillCategory;
  colorHex: string;
  categoryName: string;
}

/**
 * Splits a bullet string into sentences and assigns a skill category + hex color to each sentence.
 */
export function categorizeBulletSentences(
  bulletContent: string,
  bulletTags: string[] = []
): CategorizedSentence[] {
  // Normalize bullet into sentences
  const sentences = splitIntoSentences(bulletContent);
  const normalizedTags = bulletTags.map((t) => t.toLowerCase());

  return sentences.map((sentence) => {
    const category = matchSentenceCategory(sentence, normalizedTags);
    const catInfo = SKILL_CATEGORIES[category];
    return {
      text: sentence,
      category,
      colorHex: catInfo.colorHex,
      categoryName: catInfo.name,
    };
  });
}

/**
 * Splits text into complete sentences based on punctuation, ignoring decimal points like 2.5M.
 */
function splitIntoSentences(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const sentences: string[] = [];
  let current = "";

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];
    current += char;

    if (char === "." || char === "!" || char === "?") {
      const isDecimal =
        char === "." &&
        i > 0 &&
        i < trimmed.length - 1 &&
        /\d/.test(trimmed[i - 1]) &&
        /\d/.test(trimmed[i + 1]);

      if (!isDecimal) {
        const nextChar = trimmed[i + 1];
        if (!nextChar || /\s/.test(nextChar)) {
          sentences.push(current.trim());
          current = "";
        }
      }
    }
  }

  if (current.trim()) {
    sentences.push(current.trim());
  }

  return sentences.filter(Boolean);
}

/**
 * Determines the primary skill category for a sentence using tag & keyword matching.
 */
function matchSentenceCategory(
  sentence: string,
  normalizedTags: string[]
): SkillCategory {
  const sentenceLower = sentence.toLowerCase();

  // 1. Business Impact / Metrics check (numbers, %, cost, latency, runtime)
  if (
    /(\d+%\s*reduction|\d+\s*(second|min|hour|ms)|runtime|operating cost|\$|\d+M\+|latency reduction|defect|coverage)/i.test(sentence) &&
    (sentenceLower.includes("cut") ||
      sentenceLower.includes("reduc") ||
      sentenceLower.includes("sav") ||
      sentenceLower.includes("increas") ||
      sentenceLower.includes("improv"))
  ) {
    // If it specifically mentions testing coverage/defects, lean toward quality_security
    if (sentenceLower.includes("defect") || sentenceLower.includes("code coverage")) {
      return "quality_security";
    }
    return "business";
  }

  // 2. AI / ML Check (Word boundary \bai\b to prevent matching 'maintainable' or 'detailed')
  if (
    /\bai\b/i.test(sentenceLower) ||
    sentenceLower.includes("pytorch") ||
    sentenceLower.includes("tensorflow") ||
    sentenceLower.includes("isaac gym") ||
    sentenceLower.includes("reinforcement learning") ||
    sentenceLower.includes("ai enablement")
  ) {
    return "ai_ml";
  }

  // 3. Security & Testing Quality Check
  if (
    sentenceLower.includes("s-sdlc") ||
    sentenceLower.includes("security") ||
    sentenceLower.includes("vault") ||
    sentenceLower.includes("sast") ||
    sentenceLower.includes("sca") ||
    sentenceLower.includes("junit") ||
    sentenceLower.includes("unit and integration test") ||
    sentenceLower.includes("test strategies")
  ) {
    return "quality_security";
  }

  // 4. Leadership & Collaboration Check
  if (
    sentenceLower.includes("sme") ||
    sentenceLower.includes("spearhead") ||
    sentenceLower.includes("collaborated with product") ||
    sentenceLower.includes("authored detailed technical design") ||
    sentenceLower.includes("swagger") ||
    sentenceLower.includes("openapi") ||
    sentenceLower.includes("align cross-functional")
  ) {
    return "leadership";
  }

  // 5. Systems & Architecture Check
  if (
    sentenceLower.includes("re-architected") ||
    sentenceLower.includes("architected") ||
    sentenceLower.includes("restful apis") ||
    sentenceLower.includes("microservices") ||
    sentenceLower.includes("asynchronous i/o") ||
    sentenceLower.includes("owned end-to-end delivery")
  ) {
    return "systems";
  }

  // 6. Data & Cloud Infra Check
  if (
    sentenceLower.includes("snowflake") ||
    sentenceLower.includes("databricks") ||
    sentenceLower.includes("kubernetes") ||
    sentenceLower.includes("docker") ||
    sentenceLower.includes("ci/cd") ||
    sentenceLower.includes("aws") ||
    sentenceLower.includes("kafka") ||
    sentenceLower.includes("data warehousing")
  ) {
    return "data_cloud";
  }

  // Fallback to tag scoring if keyword heuristics don't strongly trigger
  let bestCategory: SkillCategory = "systems";
  let maxScore = 0;

  for (const [catKey, catInfo] of Object.entries(SKILL_CATEGORIES)) {
    let score = 0;
    for (const kw of catInfo.keywords) {
      if (sentenceLower.includes(kw)) score += 2;
      if (normalizedTags.some((tag) => tag.includes(kw))) score += 1;
    }
    if (score > maxScore) {
      maxScore = score;
      bestCategory = catKey as SkillCategory;
    }
  }

  return bestCategory;
}
