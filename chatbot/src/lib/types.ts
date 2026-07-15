import type { UIMessage } from 'ai';
import type { ChatTools } from './tools/tool-types';

/** Progress/trace events streamed alongside tool calls, for the trace panel. */
export type TraceStep = {
  toolCallId: string;
  toolName: string;
  label: string;
  status: 'running' | 'done';
  detail?: string;
};

export type ChatDataParts = {
  trace: TraceStep;
};

export type ChatUIMessage = UIMessage<never, ChatDataParts, ChatTools>;
