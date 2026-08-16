import type { LoadedResume, LoadedExperience, LoadedBullet } from "./query.js";

export interface FilteredResumeView {
  profileId: string | null;
  profileName: string;
  maxPages: number;
  personalInfo: LoadedResume["personalInfo"];
  experiences: Array<{
    id: string;
    company: string;
    roleTitle: string;
    startDate: string;
    endDate: string | null;
    location: string | null;
    summary: string | null;
    bullets: LoadedBullet[];
  }>;
  education: LoadedResume["education"];
  projects: LoadedResume["projects"];
  skillGroups: LoadedResume["skillGroups"];
  stats: {
    totalMasterBullets: number;
    selectedBulletsCount: number;
    estimatedPageCount: number;
    maxPages: number;
    isOverLimit: boolean;
  };
}

export function filterResumeForProfile(
  resume: LoadedResume,
  profileId?: string
): FilteredResumeView {
  const profile = profileId
    ? resume.targetProfiles.find((p) => p.id === profileId)
    : resume.targetProfiles[0];

  const totalMasterBullets = resume.experiences.reduce(
    (sum, e) => sum + e.bullets.length,
    0
  );

  let selectedBulletIds = new Set<string>();
  if (profile && profile.selectedBulletIds && profile.selectedBulletIds.length > 0) {
    selectedBulletIds = new Set(profile.selectedBulletIds);
  }

  const tagWeights = profile?.tagWeights || {};

  const filteredExperiences = resume.experiences
    .map((exp) => {
      let bulletsToInclude: LoadedBullet[] = [];

      if (selectedBulletIds.size > 0) {
        // Explicit profile selection
        bulletsToInclude = exp.bullets.filter((b) => selectedBulletIds.has(b.id));
      } else {
        // Fallback: take active bullets, ranked by tag match and priority
        bulletsToInclude = exp.bullets
          .filter((b) => b.isActive)
          .sort((a, b) => {
            // Tag score
            const aTagScore = a.tags.reduce((s, t) => s + (tagWeights[t] === "high" ? 3 : tagWeights[t] === "medium" ? 2 : 1), 0);
            const bTagScore = b.tags.reduce((s, t) => s + (tagWeights[t] === "high" ? 3 : tagWeights[t] === "medium" ? 2 : 1), 0);
            if (aTagScore !== bTagScore) return bTagScore - aTagScore;
            return a.priority - b.priority;
          });
      }

      return {
        id: exp.id,
        company: exp.company,
        roleTitle: exp.roleTitle,
        startDate: exp.startDate,
        endDate: exp.endDate,
        location: exp.location,
        summary: exp.summary || null,
        notes: exp.notes || null,
        bullets: bulletsToInclude,
      };
    })
    .filter((exp) => exp.bullets.length > 0);

  const selectedBulletsCount = filteredExperiences.reduce(
    (sum, e) => sum + e.bullets.length,
    0
  );

  // Estimate page count:
  // Header: ~6 lines, Skills: ~4 lines, Education: ~4 lines, Experiences: ~4 lines per role + ~2 lines per bullet
  const totalEstimatedLines =
    6 +
    (resume.skillGroups.length > 0 ? 4 : 0) +
    (resume.education.length > 0 ? 4 : 0) +
    filteredExperiences.length * 3 +
    selectedBulletsCount * 2;

  const maxPages = profile?.maxPages ?? 1;
  const estimatedPages = Math.max(1, Math.round((totalEstimatedLines / 38) * 10) / 10);
  const isOverLimit = estimatedPages > maxPages;

  return {
    profileId: profile?.id ?? null,
    profileName: profile?.name ?? "Master Resume",
    maxPages,
    personalInfo: {
      ...resume.personalInfo,
      summary: profile?.summary || resume.personalInfo.summary,
    },
    experiences: filteredExperiences,
    education: resume.education,
    projects: resume.projects || [],
    skillGroups: resume.skillGroups,
    stats: {
      totalMasterBullets,
      selectedBulletsCount,
      estimatedPageCount: estimatedPages,
      maxPages,
      isOverLimit,
    },
  };
}

/**
 * Creates a Full Vault view showing ALL bullets (active & inactive) for each experience.
 */
export function loadFullVaultResumeView(
  resume: LoadedResume,
  profileId?: string
): FilteredResumeView {
  const profile = profileId
    ? resume.targetProfiles.find((p) => p.id === profileId)
    : resume.targetProfiles[0];

  const selectedBulletIds = new Set(profile?.selectedBulletIds || []);

  const fullExperiences = resume.experiences.map((exp) => {
    // Include ALL bullets for each experience, preserving priority order
    const allBullets = [...exp.bullets].sort((a, b) => {
      // Show active selected bullets first, then by priority
      const aIsActive = selectedBulletIds.size > 0 ? selectedBulletIds.has(a.id) : a.isActive;
      const bIsActive = selectedBulletIds.size > 0 ? selectedBulletIds.has(b.id) : b.isActive;
      if (aIsActive !== bIsActive) return aIsActive ? -1 : 1;
      return a.priority - b.priority;
    }).map((b) => ({
      ...b,
      // Ensure isActive reflects current profile active state
      isActive: selectedBulletIds.size > 0 ? selectedBulletIds.has(b.id) : b.isActive,
    }));

    return {
      id: exp.id,
      company: exp.company,
      roleTitle: exp.roleTitle,
      startDate: exp.startDate,
      endDate: exp.endDate,
      location: exp.location,
      summary: exp.summary || null,
      notes: exp.notes || null,
      bullets: allBullets,
    };
  });

  const totalBulletsCount = fullExperiences.reduce(
    (sum, e) => sum + e.bullets.length,
    0
  );

  return {
    profileId: profile?.id ?? null,
    profileName: (profile?.name ?? "Master Vault") + " (Full Vault View)",
    maxPages: 99,
    personalInfo: {
      ...resume.personalInfo,
      summary: profile?.summary || resume.personalInfo.summary,
    },
    experiences: fullExperiences,
    education: resume.education,
    projects: resume.projects || [],
    skillGroups: resume.skillGroups,
    stats: {
      totalMasterBullets: totalBulletsCount,
      selectedBulletsCount: totalBulletsCount,
      estimatedPageCount: Math.ceil(totalBulletsCount / 12),
      maxPages: 99,
      isOverLimit: false,
    },
  };
}
