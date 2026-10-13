import { provider } from './_ai.js';

// Lets the app know whether AI sorting is switched on, and which provider.
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const p = provider();
  res.status(200).json({ ai: Boolean(p), provider: p });
}
