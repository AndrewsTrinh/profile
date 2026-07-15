'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import type { TraceStep } from '@/lib/types';

const TOOL_LABELS: Record<string, string> = {
  skill_listing: 'skill_listing',
  experience_listing: 'experience_listing',
  git_hub_query: 'git_hub_query',
  mphil_research: 'mphil_research',
  booking: 'booking',
};

/** Small chip under an assistant message; expands into a full trace console. */
export function TraceChip({
  steps,
  allSteps,
}: {
  /** Steps that belong to this specific message. */
  steps: TraceStep[];
  /** Every trace step in the conversation, for the split-view console. */
  allSteps: TraceStep[];
}) {
  const [open, setOpen] = useState(false);
  if (steps.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="mt-1.5 inline-flex flex-wrap items-center gap-1.5 rounded-full border border-ctp-surface1 bg-ctp-surface0/70 px-2.5 py-1 font-mono text-[11px] text-ctp-subtext1 transition-colors hover:border-ctp-mauve hover:text-ctp-mauve"
        >
          {steps.map(s => (
            <span key={s.toolCallId} className="flex items-center gap-1">
              🔧 {TOOL_LABELS[s.toolName] ?? s.toolName}
              {s.status === 'running' ? (
                <span className="animate-pulse text-ctp-yellow">…</span>
              ) : (
                <span className="text-ctp-green">✓</span>
              )}
            </span>
          ))}
        </button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex h-[70vh] flex-col">
          <div className="flex items-center justify-between border-b border-ctp-surface1 px-5 py-4">
            <DialogTitle className="font-mono text-sm text-ctp-text">Agent trace</DialogTitle>
            <DialogClose className="text-ctp-subtext0 hover:text-ctp-text">✕</DialogClose>
          </div>
          <div className="flex-1 overflow-y-auto p-5 font-mono text-xs">
            {allSteps.map(step => {
              const isHighlighted = steps.some(s => s.toolCallId === step.toolCallId);
              return (
                <div
                  key={step.toolCallId}
                  className={`mb-3 rounded-lg border px-3 py-2 transition-colors ${
                    isHighlighted
                      ? 'border-ctp-mauve bg-ctp-mauve/10'
                      : 'border-ctp-surface0 bg-ctp-surface0/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-ctp-mauve">{TOOL_LABELS[step.toolName] ?? step.toolName}</span>
                    <span className={step.status === 'running' ? 'text-ctp-yellow' : 'text-ctp-green'}>
                      {step.status}
                    </span>
                  </div>
                  <p className="mt-1 text-ctp-subtext1">{step.label}</p>
                  {step.detail && <p className="mt-1 text-ctp-subtext0">{step.detail}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
