import { initBotId } from 'botid/client/core';

// Protect the endpoints that cost money (LLM calls) or have real-world side
// effects (creating a calendar event / sending email) from automated abuse.
initBotId({
  protect: [
    { path: '/api/chat', method: 'POST' },
  ],
});
