import { tool, type UIMessageStreamWriter } from 'ai';
import { z } from 'zod';
import { timeline } from '../resume-data';
import type { ChatUIMessage } from '../types';

export function createExperienceListingTool(writer: UIMessageStreamWriter<ChatUIMessage>) {
  return tool({
    description:
      "List Andrew's work experience, education, and achievements. Optionally filter by organisation, role, or a free-text topic (e.g. 'AML', 'dashboards', 'leadership'). Use this for questions like 'what are your achievements' or 'tell me about your experience at X'.",
    inputSchema: z.object({
      query: z
        .string()
        .optional()
        .describe('Optional filter: organisation name, role, or topic keyword. Omit to list the full timeline.'),
    }),
    execute: async ({ query }, { toolCallId }) => {
      writer.write({
        type: 'data-trace',
        id: toolCallId,
        data: { toolCallId, toolName: 'experience_listing', label: 'Looking up experience…', status: 'running' },
      });

      const needle = query?.trim().toLowerCase();
      const results = timeline
        .filter(item => {
          if (!needle) return true;
          const haystack = [
            item.role,
            item.org,
            item.orgNote ?? '',
            ...item.achievements.map(a => a.text),
          ]
            .join(' ')
            .toLowerCase();
          return haystack.includes(needle);
        })
        .map(item => ({
          type: item.type,
          role: item.role,
          org: item.org,
          orgNote: item.orgNote,
          start: item.start,
          end: item.end,
          achievements: item.achievements.map(a => a.text),
        }));

      writer.write({
        type: 'data-trace',
        id: toolCallId,
        data: {
          toolCallId,
          toolName: 'experience_listing',
          label: `Found ${results.length} timeline entr${results.length === 1 ? 'y' : 'ies'}`,
          status: 'done',
          detail: results.map(r => `${r.role} @ ${r.org}`).join(', '),
        },
      });

      return { timeline: results };
    },
  });
}
