import { callClaude, sendError, MODEL_CHAT } from './_anthropic.js';

// POST { messages: [{role:'user'|'assistant', content:string}, ...] } -> { text }
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ code: 'bad_request', error: 'Use POST' });
  try {
    let { messages } = req.body || {};
    if (!Array.isArray(messages) || !messages.length) { const e = new Error('No messages'); e.code = 'bad_request'; throw e; }
    messages = messages
      .filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));
    // keep the instructions turn plus the last 10 turns
    if (messages.length > 11) messages = [messages[0], ...messages.slice(-10)];
    // the API needs alternating roles: merge consecutive same-role turns
    const merged = [];
    for (const m of messages) {
      const last = merged[merged.length - 1];
      if (last && last.role === m.role) last.content += '\n\n' + m.content; else merged.push({ ...m });
    }
    if (merged[merged.length - 1].role !== 'user') { const e = new Error('Last message must be from the user'); e.code = 'bad_request'; throw e; }
    const text = await callClaude({ model: MODEL_CHAT, messages: merged, max_tokens: 400 });
    res.status(200).json({ text: text || 'Sorry, I could not answer that.' });
  } catch (e) { sendError(res, e); }
}
