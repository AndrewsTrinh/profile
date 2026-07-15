import type { InferUITools, UIMessageStreamWriter } from 'ai';
import { createSkillListingTool } from './skill-listing';
import { createExperienceListingTool } from './experience-listing';
import { createGitHubQueryTool } from './git-hub-query';
import { createMphilResearchTool } from './mphil-research';
import { createBookingTool } from './booking';

// Type-only: builds the tool shapes for UI message inference. Never executed —
// only imported via `import type`, so this never ends up in a runtime bundle.
declare const typeOnlyWriter: UIMessageStreamWriter<never>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- used below only via `typeof`
const toolShapes = {
  skill_listing: createSkillListingTool(typeOnlyWriter as never),
  experience_listing: createExperienceListingTool(typeOnlyWriter as never),
  git_hub_query: createGitHubQueryTool(typeOnlyWriter as never),
  mphil_research: createMphilResearchTool(typeOnlyWriter as never),
  booking: createBookingTool(typeOnlyWriter as never),
};

export type ChatTools = InferUITools<typeof toolShapes>;
