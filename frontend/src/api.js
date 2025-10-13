// Resolve API base URL with a sensible fallback for local dev
const ENV_BASE = import.meta.env.VITE_API_URL;
const BASE = ENV_BASE || (
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : 'http://localhost:8000'
);
const STREAMING = String(import.meta.env.VITE_STREAMING || '').toLowerCase() === 'true';

// If we are using fallback, log a helpful hint
if (!ENV_BASE) {
  // eslint-disable-next-line no-console
  console.warn(
    '[sally] VITE_API_URL not set; defaulting to http://localhost:8000. Add VITE_API_URL to .env to silence this.'
  );
}

export async function chat(message, role, { stream = STREAMING, onToken } = {}, userNamePreference) {
  // BASE is always defined due to fallback above

  // eslint-disable-next-line no-console
  console.log(`[chat] POST ${stream ? '/chat/stream' : '/chat'} →`, BASE, { role });

  if (!stream) {
    const res = await fetch(`${BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, role, userNamePreference }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const err = new Error(data.detail || res.statusText || 'Request failed');
      err.status = res.status;
      throw err;
    }
    return res.json();
  }

  // Streaming via SSE-like chunked transfer
  const res = await fetch(`${BASE}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, role, userNamePreference }),
  });
  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data.detail || res.statusText || 'Stream request failed');
    err.status = res.status;
    throw err;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let firstToken = true;
  let full = '';
  let buffer = '';
  let eventName = 'message';
  let eventData = [];

  const flushEvent = () => {
    const data = eventData.join('\n');
    eventData = [];
    if (eventName === 'error') {
      const m = data || 'Stream error';
      const statusMatch = /^([0-9]{3})\s/.exec(m);
      const err = new Error(m);
      err.status = statusMatch ? Number(statusMatch[1]) : 500;
      throw err;
    }
    // default: message event with incremental token
    if (data) {
      full += data;
      if (onToken) onToken(data, full, { first: firstToken });
      if (firstToken) firstToken = false;
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf('\n')) >= 0) {
      const rawLine = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      const line = rawLine.replace(/\r$/, '');
      if (line === '') {
        // dispatch event
        if (eventData.length) flushEvent();
        eventName = 'message';
        continue;
      }
      if (line.startsWith('event:')) {
        eventName = line.slice(6).trim();
        continue;
      }
      if (line.startsWith('data:')) {
        eventData.push(line.slice(5).trimStart());
        continue;
      }
      // ignore other fields
    }
  }
  // flush trailing
  if (eventData.length) flushEvent();
  return { reply: full };
}

export function isStreamingEnabled() {
  return STREAMING;
}
