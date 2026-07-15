/**
 * One-off script: fetch Andrew's MPhil research proposal PDF, chunk it, embed each
 * chunk via the AI Gateway, and write the result as a static JSON corpus for the
 * mphil_research RAG tool. Re-run manually whenever the proposal changes.
 *
 * Usage: run `vercel env pull .env.local` first (provisions VERCEL_OIDC_TOKEN
 * automatically), or set AI_GATEWAY_API_KEY manually, then:
 *   npx tsx scripts/build-mphil-corpus.ts
 */
import { embedMany } from 'ai';
import { PDFParse } from 'pdf-parse';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PDF_URL = 'https://raw.githubusercontent.com/AndrewsTrinh/mphil_research/main/main.pdf';
const OUTPUT_PATH = resolve(import.meta.dirname, '../src/data/mphil-corpus.json');
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 150;

function chunkText(text: string): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  const chunks: string[] = [];
  let start = 0;
  while (start < clean.length) {
    const end = Math.min(start + CHUNK_SIZE, clean.length);
    chunks.push(clean.slice(start, end));
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks.filter(c => c.length > 40);
}

async function main() {
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) {
    throw new Error('Set AI_GATEWAY_API_KEY (or run `vercel env pull`) before running this script.');
  }

  console.log(`Fetching ${PDF_URL}…`);
  const res = await fetch(PDF_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch PDF: ${res.status} ${res.statusText}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());

  const parser = new PDFParse({ data: buffer });
  const { text } = await parser.getText();
  await parser.destroy();

  const chunks = chunkText(text);
  console.log(`Extracted ${text.length} chars -> ${chunks.length} chunks. Embedding…`);

  const { embeddings } = await embedMany({
    model: 'openai/text-embedding-3-small',
    values: chunks,
  });

  const corpus = chunks.map((text, i) => ({ text, embedding: embeddings[i] }));
  writeFileSync(OUTPUT_PATH, JSON.stringify(corpus));
  console.log(`Wrote ${corpus.length} chunks -> ${OUTPUT_PATH}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
