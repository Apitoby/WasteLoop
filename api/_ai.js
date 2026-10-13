// Shared AI helper. Keys stay on the server; phones never see them.
// Uses Google Gemini (free tier) when GEMINI_API_KEY is set, otherwise Anthropic Claude.
//
// Messages use one simple shape for both providers:
//   [{ role: 'user' | 'assistant', text: string, image?: base64 JPEG }]

export function provider() {
  if (process.env.GEMINI_API_KEY) return 'gemini';
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  return null;
}

export async function callAI({ kind, messages, maxTokens = 800, json = false }) {
  const p = provider();
  if (!p) { const e = new Error('No AI key set. Add GEMINI_API_KEY (free) or ANTHROPIC_API_KEY on the server.'); e.code = 'not_configured'; throw e; }
  return p === 'gemini' ? gemini({ kind, messages, maxTokens, json }) : anthropic({ kind, messages, maxTokens });
}

/* ---------- Google Gemini ---------- */
// Models to try in order. GEMINI_MODEL can be one name or a comma-separated list.
export function geminiModels() {
  const list = (process.env.GEMINI_MODEL || 'gemini-flash-latest,gemini-flash-lite-latest')
    .split(',').map(s => s.trim()).filter(Boolean);
  return [...new Set(list)];
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
// Busy / overloaded / temporary errors: worth retrying or switching model.
const isBusy = e => [429, 500, 503, 504].includes(e.status) || /overload|high demand|unavailable|try again/i.test(e.message || '');

async function gemini(args) {
  const models = geminiModels();
  let last;
  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try { return await geminiOnce(model, args); }
      catch (e) {
        last = e;
        if (!isBusy(e)) throw e;                 // a real error (bad key, bad request): stop now
        if (attempt === 0) await sleep(1200);    // brief pause, then one retry on the same model
      }
    }
  }
  last.message = `All Gemini models are busy right now (${models.join(', ')}). ${last.message}`;
  throw last;
}

async function geminiOnce(model, { messages, maxTokens, json }) {
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [
      ...(m.image ? [{ inline_data: { mime_type: 'image/jpeg', data: m.image } }] : []),
      { text: m.text },
    ],
  }));
  const generationConfig = { maxOutputTokens: Math.max(2048, maxTokens) }; // headroom for models that think first
  if (json) generationConfig.responseMimeType = 'application/json';
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY.trim() },
    body: JSON.stringify({ contents, generationConfig }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw apiError(r.status, j?.error?.message || `Gemini API error ${r.status}`);
  const cand = j.candidates?.[0];
  const text = (cand?.content?.parts || []).filter(x => typeof x.text === 'string' && !x.thought).map(x => x.text).join('');
  if (!text) {
    const e = new Error(j.promptFeedback?.blockReason ? 'The AI declined this request' : 'The AI returned no text');
    e.code = j.promptFeedback?.blockReason ? 'refused' : 'upstream_error'; throw e;
  }
  return text;
}

/* ---------- Anthropic Claude ---------- */
async function anthropic({ kind, messages, maxTokens }) {
  const model = kind === 'vision'
    ? (process.env.WASTELOOP_MODEL || 'claude-sonnet-5-5')
    : (process.env.WASTELOOP_CHAT_MODEL || 'claude-haiku-5-5');
  const msgs = messages.map(m => ({
    role: m.role,
    content: [
      ...(m.image ? [{ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: m.image } }] : []),
      { type: 'text', text: m.text },
    ],
  }));
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY.trim(), 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model, max_tokens: maxTokens, messages: msgs }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw apiError(r.status, j?.error?.message || `Anthropic API error ${r.status}`);
  return (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
}

function apiError(status, message) {
  const e = new Error(message);
  e.status = status;
  e.code = status === 429 ? 'rate_limited' : 'upstream_error';
  return e;
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
  const status = { not_configured: 503, rate_limited: 429, bad_request: 400, refused: 422 }[e.code] || 502;
  res.status(status).json({ code: e.code || 'upstream_error', error: e.message });
}
