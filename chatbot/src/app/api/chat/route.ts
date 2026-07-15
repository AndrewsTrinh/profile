import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
} from 'ai';
import { checkBotId } from 'botid/server';
import { SYSTEM_PROMPT } from '@/lib/persona';
import { createSkillListingTool } from '@/lib/tools/skill-listing';
import { createExperienceListingTool } from '@/lib/tools/experience-listing';
import { createGitHubQueryTool } from '@/lib/tools/git-hub-query';
import { createMphilResearchTool } from '@/lib/tools/mphil-research';
import { createBookingTool } from '@/lib/tools/booking';
import { checkRateLimit, bookingRatelimit } from '@/lib/ratelimit';
import type { ChatUIMessage } from '@/lib/types';

export const maxDuration = 60;

/** True if this turn is submitting an approved booking (i.e. the visitor just clicked "Confirm booking"). */
function isBookingApproval(messages: ChatUIMessage[]): boolean {
  const last = messages.at(-1);
  if (!last) return false;
  return last.parts.some(
    p => p.type === 'tool-booking' && p.state === 'approval-responded' && p.approval.approved,
  );
}

export async function POST(req: Request) {
  const botCheck = await checkBotId();
  if (botCheck.isBot) {
    return new Response(JSON.stringify({ error: 'Access denied' }), { status: 403 });
  }

  const { messages }: { messages: ChatUIMessage[] } = await req.json();

  // The booking tool has its own real-world side effects (calendar + email),
  // so it gets a tighter limit on top of the general /api/chat limit in proxy.ts.
  if (isBookingApproval(messages)) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const { success } = await checkRateLimit(bookingRatelimit, ip);
    if (!success) {
      return new Response(JSON.stringify({ error: 'Too many booking attempts. Please try again later.' }), {
        status: 429,
      });
    }
  }

  const stream = createUIMessageStream<ChatUIMessage>({
    execute: async ({ writer }) => {
      const result = streamText({
        model: 'google/gemini-3.5-flash',
        system: SYSTEM_PROMPT,
        messages: await convertToModelMessages(messages),
        tools: {
          skill_listing: createSkillListingTool(writer),
          experience_listing: createExperienceListingTool(writer),
          git_hub_query: createGitHubQueryTool(writer),
          mphil_research: createMphilResearchTool(writer),
          booking: createBookingTool(writer),
        },
        // Booking writes to a real calendar and sends real email — require an
        // explicit visitor confirmation in the UI before it ever executes.
        // This closes the prompt-injection path: an injected instruction can
        // make the model *propose* a booking, but cannot approve it.
        toolApproval: {
          booking: 'user-approval',
        },
        experimental_toolApprovalSecret: process.env.TOOL_APPROVAL_SECRET,
        providerOptions: {
          gateway: {
            // Automatic failover if Gemini/Vertex is unavailable.
            models: ['xai/grok-4.3'],
          },
        },
      });

      writer.merge(result.toUIMessageStream());
    },
  });

  return createUIMessageStreamResponse({ stream });
}
