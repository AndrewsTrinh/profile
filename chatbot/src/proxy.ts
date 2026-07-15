import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit, chatRatelimit } from '@/lib/ratelimit';

// Coarse per-IP limit on every /api/chat request (~20/hr). The tighter
// booking-specific limit (~3/hr) lives in the route handler itself, since
// booking runs as a tool-approval turn on this same endpoint, not a
// separate route — see src/app/api/chat/route.ts.
export async function proxy(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const { success } = await checkRateLimit(chatRatelimit, ip);

  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
  }

  return NextResponse.next();
}

export const proxyConfig = {
  matcher: ['/api/chat'],
};
