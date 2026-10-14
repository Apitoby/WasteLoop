import { requireUser } from './_auth.js';
import { callAI, parseJson, sendError } from './_ai.js';

// POST { prompt: string, image?: base64 JPEG } -> { result: {...sorting JSON} }
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ code: 'bad_request', error: 'Use POST' });
  if (!requireUser(req, res)) return; // only signed-in residents and staff can use the AI
  try {
    const { prompt, image } = req.body || {};
    if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 8000) {
      const e = new Error('Missing or oversized prompt'); e.code = 'bad_request'; throw e;
    }
    if (image && (typeof image !== 'string' || image.length > 4_000_000)) {
      const e = new Error('Image too large; send a JPEG under about 3 MB'); e.code = 'bad_request'; throw e;
    }
    const text = await callAI({ kind: 'vision', json: true, maxTokens: 700,
      messages: [{ role: 'user', text: prompt, image: image || undefined }] });
    const result = parseJson(text);
    if (!result) return res.status(502).json({ code: 'invalid_json', error: 'AI reply was not valid JSON' });
    res.status(200).json({ result });
  } catch (e) { sendError(res, e); }
}
