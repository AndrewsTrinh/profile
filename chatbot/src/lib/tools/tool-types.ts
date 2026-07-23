import type { InferUITools, UIMessageStreamWriter } from 'ai';
import { createSkillListingTool } from './skill-listing';
import { createExperienceListingTool } from './experience-listing';
import { createGitHubQueryTool } from './git-hub-query';
import type { BookingInput } from './booking-types';

// Type-only: builds the tool shapes for UI message inference. Never executed —
// only imported via `import type`, so this never ends up in a runtime bundle.
declare const typeOnlyWriter: UIMessageStreamWriter<never>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- used below only via `typeof`
const toolShapes = {
  skill_listing: createSkillListingTool(typeOnlyWriter as never),
  experience_listing: createExperienceListingTool(typeOnlyWriter as never),
  git_hub_query: createGitHubQueryTool(typeOnlyWriter as never),
};

// booking and mphil_research have no TS-side execute() — they're executed by the
// Python backend (backend/router.py, backend/tools2.py, backend/calendar_lib.py)
// — so their shapes are hand-declared here rather than inferred from a tool()
// call like the others above.
export type ChatTools = InferUITools<typeof toolShapes> & {
  booking: { input: BookingInput; output: { booked: boolean; calendarLink?: string; reason?: string } };
  mphil_research: { input: { question: string }; output: { passages: { text: string; relevance: number }[]; error?: string } };
  behavioral_question_retrieve: { input: { query: string }; output: { passages: { text: string; relevance: number }[]; error?: string } };
};
