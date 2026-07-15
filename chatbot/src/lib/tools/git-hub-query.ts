import { tool, type UIMessageStreamWriter } from 'ai';
import { z } from 'zod';
import { projects } from '../resume-data';
import type { ChatUIMessage } from '../types';

const reposWithLinks = projects.filter(p => p.repoUrl);

function parseOwnerRepo(repoUrl: string): { owner: string; repo: string } | null {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+?)\/?$/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

async function githubFetch(path: string) {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) return null;
  return res.json();
}

export function createGitHubQueryTool(writer: UIMessageStreamWriter<ChatUIMessage>) {
  return tool({
    description:
      "Look up details about one of Andrew's projects that has a linked GitHub repository (Typology Extractor, PheChat, or the Cross-Ownership Graph Analytics project). Fetches the repo's description and README to answer 'what is this project about' style questions. Only works for projects with a GitHub link — do not use for the MPhil research proposal (use mphil_research instead).",
    inputSchema: z.object({
      project: z
        .string()
        .describe(
          `The project to look up. One of: ${reposWithLinks.map(p => p.name).join(', ')}.`,
        ),
    }),
    execute: async ({ project }, { toolCallId }) => {
      writer.write({
        type: 'data-trace',
        id: toolCallId,
        data: { toolCallId, toolName: 'git_hub_query', label: `Looking up "${project}"…`, status: 'running' },
      });

      const needle = project.trim().toLowerCase();
      const match = reposWithLinks.find(
        p => p.name.toLowerCase().includes(needle) || needle.includes(p.id.replace(/-/g, ' ')),
      );

      if (!match || !match.repoUrl) {
        writer.write({
          type: 'data-trace',
          id: toolCallId,
          data: {
            toolCallId,
            toolName: 'git_hub_query',
            label: 'No linked repo found',
            status: 'done',
            detail: `"${project}" doesn't match a project with a GitHub link.`,
          },
        });
        return {
          found: false,
          availableProjects: reposWithLinks.map(p => p.name),
        };
      }

      const ownerRepo = parseOwnerRepo(match.repoUrl);
      if (!ownerRepo) {
        return { found: false, description: match.description };
      }

      writer.write({
        type: 'data-trace',
        id: toolCallId,
        data: {
          toolCallId,
          toolName: 'git_hub_query',
          label: `Fetching ${ownerRepo.owner}/${ownerRepo.repo} from GitHub…`,
          status: 'running',
        },
      });

      const [repoMeta, readmeMeta] = await Promise.all([
        githubFetch(`/repos/${ownerRepo.owner}/${ownerRepo.repo}`),
        githubFetch(`/repos/${ownerRepo.owner}/${ownerRepo.repo}/readme`),
      ]);

      const readme = readmeMeta?.content
        ? Buffer.from(readmeMeta.content, 'base64').toString('utf-8').slice(0, 6000)
        : null;

      writer.write({
        type: 'data-trace',
        id: toolCallId,
        data: {
          toolCallId,
          toolName: 'git_hub_query',
          label: `Fetched ${match.name}`,
          status: 'done',
          detail: repoMeta ? `${repoMeta.stargazers_count ?? 0} stars, live at GitHub` : 'GitHub API unavailable, used static description',
        },
      });

      return {
        found: true,
        name: match.name,
        staticDescription: match.description,
        liveUrl: match.url,
        repoUrl: match.repoUrl,
        githubDescription: repoMeta?.description ?? null,
        stars: repoMeta?.stargazers_count ?? null,
        language: repoMeta?.language ?? null,
        readmeExcerpt: readme,
      };
    },
  });
}
