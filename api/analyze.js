import { callClaude, parseJson, sendError, MODEL_VISION } from './_anthropic.js';

// POST { prompt: string, image?: base64 JPEG } -> { result: {...sorting JSON} }
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ code: 'bad_request', error: 'Use POST' });
  try {
    const { prompt, image } = req.body || {};
    if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 8000) {
      const e = new Error('Missing or oversized prompt'); e.code = 'bad_request'; throw e;
    }
    if (image && (typeof image !== 'string' || image.length > 4_000_000)) {
      const e = new Error('Image too large; send a JPEG under about 3 MB'); e.code = 'bad_request'; throw e;
    }
    const content = [];
    if (image) content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image } });
    content.push({ type: 'text', text: prompt });

    const text = await callClaude({ model: MODEL_VISION, messages: [{ role: 'user', content }], max_tokens: 700 });
    const result = parseJson(text);
    if (!result) return res.status(502).json({ code: 'invalid_json', error: 'AI reply was not valid JSON' });
    res.status(200).json({ result });
  } catch (e) { sendError(res, e); }
}
