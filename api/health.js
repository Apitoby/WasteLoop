// Lets the app know whether AI sorting is switched on.
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ ai: Boolean(process.env.ANTHROPIC_API_KEY) });
}
