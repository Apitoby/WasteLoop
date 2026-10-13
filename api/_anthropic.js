// Shared helper: calls the Anthropic Messages API with the key kept on the server.
// The phone never sees the key, and nobody needs a Claude.ai login.
export const MODEL_VISION = process.env.WASTELOOP_MODEL || 'claude-sonnet-5-5';
export const MODEL_CHAT = process.env.WASTELOOP_CHAT_MODEL || 'claude-haiku-5-5';

export async function callClaude({ model, messages, max_tokens = 800 }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { const e = new Error('ANTHROPIC_API_KEY is not set on the server'); e.code = 'not_configured'; throw e; }
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model, max_tokens, messages }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    const e = new Error(j?.error?.message || `Anthropic API error ${r.status}`);
    e.code = r.status === 429 ? 'rate_limited' : 'upstream_error';
    e.status = r.status;
    throw e;
  }
  return (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
}

export function parseJson(text) {
  try { return JSON.parse(text); } catch {}
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) { try { return JSON.parse(fence[1]); } catch {} }
  const a = text.indexOf('{'), b = text.lastIndexOf('}');
  if (a >= 0 && b > a) { try { return JSON.parse(text.slice(a, b + 1)); } catch {} }
  return null;
}

export function sendError(res, e) {
  const status = e.code === 'not_configured' ? 503 : e.code === 'rate_limited' ? 429 : e.code === 'bad_request' ? 400 : 502;
  res.status(status).json({ code: e.code || 'upstream_error', error: e.message });
}
