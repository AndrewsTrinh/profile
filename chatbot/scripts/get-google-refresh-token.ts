/**
 * One-time setup: run this locally to authorize the chatbot against YOUR OWN
 * Google Calendar and print a long-lived refresh token. Run once, paste the
 * printed token into GOOGLE_REFRESH_TOKEN in Vercel env vars, then delete/ignore
 * this script's output — it never runs in production.
 *
 * Prerequisites:
 *   1. Create an OAuth client (type "Desktop app") in Google Cloud Console
 *      (APIs & Services -> Credentials), with the Calendar API enabled.
 *   2. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your shell before running.
 *
 * Usage:
 *   GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... npx tsx scripts/get-google-refresh-token.ts
 */
import { google } from 'googleapis';
import { createServer } from 'node:http';
import { URL } from 'node:url';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:8765/oauth2callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET before running this script.');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent', // forces a refresh_token even if previously authorized
  scope: ['https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/calendar.freebusy'],
});

console.log('\nOpen this URL, sign in with the Google account you want the chatbot to book on:\n');
console.log(authUrl, '\n');

const server = createServer(async (req, res) => {
  if (!req.url) return;
  const url = new URL(req.url, REDIRECT_URI);
  const code = url.searchParams.get('code');
  if (!code) {
    res.writeHead(400).end('Missing code');
    return;
  }
  const { tokens } = await oauth2Client.getToken(code);
  res.writeHead(200, { 'Content-Type': 'text/plain' }).end('Done — check your terminal, then close this tab.');
  console.log('\nGOOGLE_REFRESH_TOKEN=' + tokens.refresh_token + '\n');
  console.log('Paste that into your Vercel project env vars, then Ctrl+C this script.');
  server.close();
});

server.listen(8765);
