/**
 * Protected Technical Terms & Brand Names
 * These terms are protected from being split by hyphenation in Typst / LaTeX renderers.
 */
export const PROTECTED_TECH_TERMS: string[] = [
  // Companies & Organizations
  "Goldman",
  "Sachs",
  "Asuitech",
  "SAP",
  "UTD",
  "ASU",
  "Marcus",

  // Languages & Runtimes
  "Java",
  "Python",
  "TypeScript",
  "JavaScript",
  "Go",
  "Rust",
  "Swift",
  "Kotlin",
  "HTML5",
  "CSS3",
  "Bash",
  "Perl",

  // Web & API Frameworks
  "React",
  "Svelte",
  "Angular",
  "Vue",
  "Next.js",
  "Node.js",
  "FastAPI",
  "Express",
  "Django",
  "Flask",
  "Spring",
  "SpringBoot",
  "GraphQL",
  "RESTful",
  "gRPC",

  // Databases & Storage
  "Snowflake",
  "Databricks",
  "PostgreSQL",
  "MySQL",
  "SQLite",
  "MongoDB",
  "Redis",
  "Cassandra",
  "DynamoDB",
  "ElasticSearch",
  "Kafka",
  "Spark",
  "Hadoop",

  // Cloud & DevOps
  "AWS",
  "GCP",
  "Azure",
  "Docker",
  "Kubernetes",
  "Terraform",
  "Ansible",
  "Jenkins",
  "Git",
  "GitHub",
  "GitLab",
  "Nginx",
  "Linux",
  "Unix",
  "S-SDLC",

  // AI, ML & Data Science
  "PyTorch",
  "TensorFlow",
  "Keras",
  "Scikit-Learn",
  "Pandas",
  "NumPy",
  "OpenCV",
  "Isaac Gym",
  "LangChain",
  "LlamaIndex",
  "OpenAI",
  "Gemini",
  "Anthropic",
  "HuggingFace",
];

/**
 * Builds a regex pattern matching any of the protected terms at word boundaries.
 */
export function buildProtectedTermsRegex(terms: string[] = PROTECTED_TECH_TERMS): string {
  const escapedTerms = terms.map((t) => t.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"));
  return `\\b(${escapedTerms.join("|")})\\b`;
}
