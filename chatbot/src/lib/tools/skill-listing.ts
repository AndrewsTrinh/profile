import { tool, type UIMessageStreamWriter } from 'ai';
import { z } from 'zod';
import { focusSkills, timeline } from '../resume-data';
import type { ChatUIMessage } from '../types';

export function createSkillListingTool(writer: UIMessageStreamWriter<ChatUIMessage>) {
  return tool({
    description:
      "List Andrew's skills, optionally filtered by a search term (e.g. 'python', 'genai', 'dashboards'), and the achievements that demonstrate each one — including which role/organisation each achievement is from.",
    inputSchema: z.object({
      query: z
        .string()
        .optional()
        .describe(
          'Optional free-text filter, e.g. a skill name or a topic like "machine learning". Omit to list all skills.',
        ),
    }),
    execute: async ({ query }, { toolCallId }) => {
      writer.write({
        type: 'data-trace',
        id: toolCallId,
        data: { toolCallId, toolName: 'skill_listing', label: 'Looking up skills…', status: 'running' },
      });

      const needle = query?.trim().toLowerCase();
      const matched = needle
        ? focusSkills.filter(
            s => s.label.toLowerCase().includes(needle) || s.id.toLowerCase().includes(needle),
          )
        : focusSkills;

      const results = matched.map(skill => {
        const achievements = timeline
          .filter(item => item.type === 'experience')
          .flatMap(item =>
            item.achievements
              .filter(a => a.skills.includes(skill.id))
              .map(a => ({ org: item.org, role: item.role, text: a.text })),
          );
        return { skill: skill.label, kind: skill.kind, achievements };
      });

      writer.write({
        type: 'data-trace',
        id: toolCallId,
        data: {
          toolCallId,
          toolName: 'skill_listing',
          label: `Found ${results.length} skill${results.length === 1 ? '' : 's'}`,
          status: 'done',
          detail: results.map(r => r.skill).join(', '),
        },
      });

      return { skills: results };
    },
  });
}
