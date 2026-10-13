import { callAI, provider, geminiModels } from './_ai.js';

// Open /api/test in a browser to check the AI key end to end.
// Sends one tiny text request and shows Google's (or Anthropic's) exact reply or error.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const p = provider();
  const model = p === 'gemini' ? geminiModels().join(', ')
    : p === 'anthropic' ? (process.env.WASTELOOP_MODEL || 'claude-sonnet-5-5') : null;
  const key = p === 'gemini' ? process.env.GEMINI_API_KEY : process.env.ANTHROPIC_API_KEY;
  const keyHint = key ? `${key.slice(0, 4)}… (${key.length} chars${/\s/.test(key) ? ', CONTAINS SPACES' : ''})` : 'none';
  try {
    const text = await callAI({ kind: 'chat', maxTokens: 20, messages: [{ role: 'user', text: 'Reply with just the word OK.' }] });
    res.status(200).json({ ok: true, provider: p, model, key: keyHint, reply: text.trim().slice(0, 40) });
  } catch (e) {
    res.status(200).json({ ok: false, provider: p, model, key: keyHint, error: e.message });
  }
}
