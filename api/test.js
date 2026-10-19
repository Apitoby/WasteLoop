import { callAI, provider, geminiModels } from './_ai.js';
import { requireUser } from './_auth.js';

// AI health check for SDP staff: sends one tiny request and shows the reply or the exact error.
// Call with a staff sign-in token (Authorization: Bearer <token>).
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!requireUser(req, res, 'admin')) return;
  const p = provider(), model = p ? geminiModels().join(', ') : null;
  try {
    const text = await callAI({ maxTokens: 20, messages: [{ role: 'user', text: 'Reply with just the word OK.' }] });
    res.status(200).json({ ok: true, provider: p, model, reply: text.trim().slice(0, 40) });
  } catch (e) {
    res.status(200).json({ ok: false, provider: p, model, error: e.message });
  }
}
