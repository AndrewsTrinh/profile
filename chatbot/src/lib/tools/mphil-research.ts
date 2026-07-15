import { tool, embed, cosineSimilarity, type UIMessageStreamWriter } from 'ai';
import { z } from 'zod';
import corpus from '../../data/mphil-corpus.json';
import type { ChatUIMessage } from '../types';

type CorpusChunk = { text: string; embedding: number[] };
const CORPUS = corpus as CorpusChunk[];
const TOP_K = 4;

export function createMphilResearchTool(writer: UIMessageStreamWriter<ChatUIMessage>) {
  return tool({
    description:
      "Search Andrew's MPhil research proposal ('Applied LLMs in AML/CTF') and return the passages most relevant to the question. Use this for any question about his research proposal, methodology, or research goals.",
    inputSchema: z.object({
      question: z.string().describe("The visitor's question about the MPhil research proposal."),
    }),
    execute: async ({ question }, { toolCallId }) => {
      if (CORPUS.length === 0) {
        writer.write({
          type: 'data-trace',
          id: toolCallId,
          data: {
            toolCallId,
            toolName: 'mphil_research',
            label: 'Corpus not built yet',
            status: 'done',
            detail: 'Run scripts/build-mphil-corpus.ts to generate the proposal corpus.',
          },
        });
        return { passages: [], error: 'The MPhil proposal corpus has not been generated yet.' };
      }

      writer.write({
        type: 'data-trace',
        id: toolCallId,
        data: { toolCallId, toolName: 'mphil_research', label: 'Embedding your question…', status: 'running' },
      });

      const { embedding } = await embed({ model: 'openai/text-embedding-3-small', value: question });

      writer.write({
        type: 'data-trace',
        id: toolCallId,
        data: {
          toolCallId,
          toolName: 'mphil_research',
          label: `Searching ${CORPUS.length} passages of the proposal…`,
          status: 'running',
        },
      });

      const ranked = CORPUS.map(chunk => ({ text: chunk.text, score: cosineSimilarity(embedding, chunk.embedding) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, TOP_K);

      writer.write({
        type: 'data-trace',
        id: toolCallId,
        data: {
          toolCallId,
          toolName: 'mphil_research',
          label: `Found ${ranked.length} relevant passage${ranked.length === 1 ? '' : 's'}`,
          status: 'done',
          detail: ranked.map(r => `${(r.score * 100).toFixed(0)}% match`).join(', '),
        },
      });

      return { passages: ranked.map(r => ({ text: r.text, relevance: r.score })) };
    },
  });
}
