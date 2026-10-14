import crypto from 'node:crypto';

// Sign-in for WasteLoop. Accounts live in Vercel environment variables:
//   RESIDENT_ACCOUNTS = "EG2-08-12:1234:Aina:Elmina Green 2, EW-03-05:5678:Hafiz:Elmina West"
//                        unit : PIN : name : zone   (comma-separated entries)
//   ADMIN_ACCOUNTS    = "SDP001:a-strong-password:Nadia"
//                        staff ID : password : name
//   SESSION_SECRET    = any long random text (signs the sign-in tokens)
// When an accounts variable is not set, the demo accounts below are used.

const DEMO = {
  resident: [
    { id: 'EG2-08-12', secret: '1234', name: 'Aina', zone: 'Elmina Green 2' },
    { id: 'EE-02-07', secret: '5678', name: 'Farid', zone: 'Elmina East' },
  ],
  admin: [{ id: 'SDP-ADMIN', secret: 'elmina2026', name: 'SDP Admin', zone: '' }],
};

const envFor = role => (role === 'admin' ? process.env.ADMIN_ACCOUNTS : process.env.RESIDENT_ACCOUNTS) || '';

function parse(list) {
  return list.split(/[,\n;]+/).map(s => s.trim()).filter(Boolean).map(entry => {
    const [id, secret, name, zone] = entry.split(':').map(x => (x || '').trim());
    return { id, secret, name: name || id, zone: zone || '' };
  }).filter(a => a.id && a.secret);
}

export const usingDemo = role => !envFor(role).trim();
export const accounts = role => (usingDemo(role) ? DEMO[role] : parse(envFor(role)));
export const findAccount = (role, id) => accounts(role).find(a => a.id.toUpperCase() === String(id || '').trim().toUpperCase());

function key() {
  return process.env.SESSION_SECRET ||
    crypto.createHash('sha256').update('wasteloop|' + (process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY || 'demo')).digest('hex');
}

export function safeEqual(a, b) {
  const x = crypto.createHash('sha256').update(String(a)).digest();
  const y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
}

export function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = crypto.createHmac('sha256', key()).update(body).digest('base64url');
  return `${body}.${mac}`;
}

export function verify(token) {
  if (typeof token !== 'string') return null;
  const [body, mac] = token.split('.');
  if (!body || !mac) return null;
  const expected = crypto.createHmac('sha256', key()).update(body).digest('base64url');
  if (!safeEqual(mac, expected)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (!p.exp || p.exp < Date.now()) return null;
    if (!findAccount(p.role, p.id)) return null; // account removed since sign-in
    return p;
  } catch { return null; }
}

export function userFrom(req) {
  const m = String(req.headers?.authorization || '').match(/^Bearer\s+(.+)$/i);
  return m ? verify(m[1].trim()) : null;
}

// Returns the signed-in user, or sends 401 and returns null.
export function requireUser(req, res, role) {
  const u = userFrom(req);
  if (!u || (role && u.role !== role)) {
    res.status(401).json({ code: 'unauthorized', error: 'Please sign in again.' });
    return null;
  }
  return u;
}
