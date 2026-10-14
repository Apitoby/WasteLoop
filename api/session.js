import { userFrom } from './_auth.js';

// POST with "Authorization: Bearer <token>" -> { user } or 401
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const u = userFrom(req);
  if (!u) return res.status(401).json({ code: 'unauthorized', error: 'Please sign in again.' });
  res.status(200).json({ user: { role: u.role, id: u.id, name: u.name, zone: u.zone } });
}
