import { findAccount, safeEqual, sign } from './_auth.js';

// POST { role: 'resident' | 'admin', id, secret } -> { token, user, exp }
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ code: 'bad_request', error: 'Use POST' });
  const { role, id, secret } = req.body || {};
  if (!['resident', 'admin'].includes(role) || typeof id !== 'string' || typeof secret !== 'string' || !id.trim() || !secret) {
    return res.status(400).json({ code: 'bad_request', error: 'Fill in both fields.' });
  }
  const acct = findAccount(role, id);
  const ok = acct ? safeEqual(acct.secret, secret.trim()) : safeEqual('x', 'y'); // same work either way
  if (!ok) {
    await new Promise(r => setTimeout(r, 700)); // slow down guessing
    return res.status(401).json({
      code: 'bad_login',
      error: role === 'admin' ? 'Staff ID or password is incorrect.' : 'Unit number or PIN is incorrect.',
    });
  }
  const exp = Date.now() + (role === 'admin' ? 7 : 30) * 864e5;
  const user = { role, id: acct.id, name: acct.name, zone: acct.zone };
  res.status(200).json({ token: sign({ ...user, exp }), user, exp });
}
