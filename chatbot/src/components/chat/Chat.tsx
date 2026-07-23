'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithApprovalResponses } from 'ai';
import { profile } from '@/lib/resume-data';
import type { ChatUIMessage, TraceStep } from '@/lib/types';
import { TraceChip } from './TracePanel';
import { BookingApprovalCard } from './BookingApprovalCard';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const GREETING: ChatUIMessage = {
  id: 'greeting',
  role: 'assistant',
  parts: [
    {
      type: 'text',
      text: `Hi, I’m ${profile.heroName}’s AI persona 👋 I’m a RAG-based generative chatbot built on Andrew’s embedded resume and relevant documents, designed to answer interview-style questions about his experience, skills, MPhil research, and projects. I run on a lean freemium stack — free hosting plus the start-up tier of Vertex AI — reflecting my engineering philosophy: rigorously optimising for the best price–performance. I can reply in whatever language you write in — English, Vietnamese, or otherwise.`,
    },
  ],
};

const SUGGESTIONS_POOL = [
  'What are your biggest achievements?',
  'What skills do you bring to a financial crime role?',
  'Tell me about your MPhil research',
  "What's Typology Extractor about?",
  'Do you want to have a coffee chat?',
  'Tell me a time when you led a project',
  'How do you deal with incidents?',
  'What did you do at Bendigo Bank?',
  'What did you do at Remitano?',
  'How do you use Agentic AI?',
  'Can you explain your experience with BigQuery ML?',
];

function getRelevantSuggestions(messages: ChatUIMessage[]): string[] {
  if (messages.length <= 1) {
    return [
      'What are your biggest achievements?',
      'What skills do you bring to a financial crime role?',
      'Tell me about your MPhil research',
      "What's Typology Extractor about?",
      'Do you want to have a coffee chat?'
    ];
  }
  
  // Get all user messages text
  const userTexts = messages
    .filter(m => m.role === 'user')
    .flatMap(m => m.parts.filter(p => p.type === 'text').map(p => (p as {text?: string}).text || ''))
    .join(' ')
    .toLowerCase();
    
  // Filter out suggestions the user has already asked about
  const available = SUGGESTIONS_POOL.filter(s => !userTexts.includes(s.toLowerCase().replace('?', '')));
  
  // Always try to include the coffee chat if it hasn't been asked
  const coffeeChat = 'Do you want to have a coffee chat?';
  const hasCoffee = available.includes(coffeeChat);
  const withoutCoffee = available.filter(s => s !== coffeeChat);
  
  // Shuffle and pick 3
  const shuffled = withoutCoffee.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3);
  
  if (hasCoffee) {
    selected.push(coffeeChat);
  }
  
  return selected;
}

function collectTraceSteps(message: ChatUIMessage): TraceStep[] {
  return message.parts
    .filter((p): p is Extract<ChatUIMessage['parts'][number], { type: 'data-trace' }> => p.type === 'data-trace')
    .map(p => p.data);
}

export function Chat() {
  const [sessionId] = useState(() => Math.random().toString(36).substring(2, 15));
  const [input, setInput] = useState('');
  const { messages, sendMessage, status, error, addToolApprovalResponse } = useChat<ChatUIMessage>({
    messages: [GREETING],
    transport: new DefaultChatTransport({ 
      api: process.env.NODE_ENV === 'development' ? 'http://localhost:8000/api/chat' : '/api/chat',
      body: { sessionId }
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
  });

  const allSteps = messages.flatMap(collectTraceSteps);

  function submit(text: string) {
    if (!text.trim() || status !== 'ready') return;
    sendMessage({ text });
    setInput('');
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:px-10">
      <div className="flex-1 space-y-4 overflow-y-auto pb-4">
        {messages.map(message => {
          const traceSteps = collectTraceSteps(message);
          const textParts = message.parts.filter(p => p.type === 'text');
          const bookingApprovals = message.parts.filter(
            (p): p is Extract<ChatUIMessage['parts'][number], { type: 'tool-booking'; state: 'approval-requested' }> =>
              p.type === 'tool-booking' && p.state === 'approval-requested',
          );

          return (
            <div key={message.id} className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'bg-ctp-mauve text-ctp-crust'
                    : 'border border-ctp-surface0 bg-ctp-mantle text-ctp-text'
                }`}
              >
                {message.role === 'assistant' && (
                  <p className="mb-1 text-xs font-semibold text-ctp-mauve">🙂 {profile.heroName}</p>
                )}
                {textParts.map((p, i) => (
                  <div key={i} className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-ctp-surface0 prose-pre:text-ctp-text">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {p.type === 'text' ? p.text : ''}
                    </ReactMarkdown>
                  </div>
                ))}

                {bookingApprovals.map(part => (
                  <BookingApprovalCard
                    key={part.toolCallId}
                    input={part.input}
                    onRespond={approved =>
                      addToolApprovalResponse({
                        id: part.approval.id,
                        approved,
                      })
                    }
                  />
                ))}

                {message.role === 'assistant' && traceSteps.length > 0 && (
                  <TraceChip steps={traceSteps} allSteps={allSteps} />
                )}
              </div>
            </div>
          );
        })}

        {(status === 'submitted' || status === 'streaming') && (
          <div className="flex justify-start" role="status" aria-live="polite">
            <div className="rounded-2xl border border-ctp-surface0 bg-ctp-mantle px-4 py-3 text-sm text-ctp-subtext0">
              thinking…
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex justify-start" role="alert">
            <div className="max-w-[85%] rounded-2xl border border-ctp-red/50 bg-ctp-mantle px-4 py-3 text-sm text-ctp-text">
              <p className="mb-1 text-xs font-semibold text-ctp-red">🙂 {profile.heroName}</p>
              Sorry, something went wrong{error?.message ? ` (${error.message})` : ''} — please try again.
            </div>
          </div>
        )}
      </div>

      {status === 'ready' && (
        <div className="flex flex-wrap gap-2 border-t border-ctp-surface0 py-3">
          {getRelevantSuggestions(messages).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => submit(s)}
              disabled={status !== 'ready'}
              className="rounded-full border border-ctp-surface1 px-3 py-1.5 text-xs text-ctp-subtext1 transition-colors hover:border-ctp-mauve hover:text-ctp-mauve disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={e => {
          e.preventDefault();
          submit(input);
        }}
        className="flex items-center gap-2 rounded-full border border-ctp-surface1 bg-ctp-mantle px-2 py-2"
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={status !== 'ready'}
          placeholder="Ask an interview question… (Enter to send)"
          aria-label="Ask an interview question"
          className="flex-1 bg-transparent px-3 text-sm text-ctp-text placeholder:text-ctp-overlay0 focus:outline-none"
        />
        <button
          type="submit"
          disabled={status !== 'ready' || !input.trim()}
          className="rounded-full bg-ctp-mauve px-4 py-2 text-sm font-semibold text-ctp-crust disabled:opacity-50"
        >
          Send ▸
        </button>
      </form>
      <p className="pt-2 text-center text-[11px] text-ctp-overlay0">
        Answers are grounded in tool calls over Andrew&apos;s real resume, research, and GitHub data — click the 🔧
        chip under a reply to see what was retrieved.
      </p>
    </div>
  );
}
