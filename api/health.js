import { provider } from './_ai.js';
import { usingDemo, accounts } from './_auth.js';

// Tells the app whether AI sorting is on, and (only while demo accounts are in use)
// which demo sign-ins to show on the sign-in screen.
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const p = provider();
  const hint = role => (usingDemo(role) ? `${accounts(role)[0].id} / ${accounts(role)[0].secret}` : null);
  res.status(200).json({ ai: Boolean(p), provider: p, demo: { resident: hint('resident'), admin: hint('admin') } });
}
