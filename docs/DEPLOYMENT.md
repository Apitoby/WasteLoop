# Deploying WasteLoop

WasteLoop is a static Progressive Web App plus a few serverless functions. It runs on Vercel's free Hobby plan with Google Gemini's free tier.

## 1. Get a Gemini API key

1. Go to aistudio.google.com and sign in with a Google account.
2. Click **Get API key**, then **Create API key**, and copy it.

The free tier has per-minute and per-day limits, and Google may use free-tier data to improve its products, so avoid photos showing faces, IC numbers or addresses.

## 2. Deploy to Vercel

1. Push this repository to GitHub.
2. In Vercel: **Add New → Project**, import the repository. Framework preset: **Other**, no build settings.
3. Under **Environment Variables**, add `GEMINI_API_KEY`.
4. Click **Deploy**.

Check it at `https://<your-link>/api/health`; it should show `"ai":true`. After changing any variable, redeploy (**Deployments → ⋯ → Redeploy**).

## 3. Install on a phone

Open the link in Safari (iPhone) or Chrome (Android) and choose **Add to Home Screen**.

## Accounts

Until real accounts are set, demo accounts work and are shown on the sign-in screen.

| Variable | Format (comma between people) |
|---|---|
| `RESIDENT_ACCOUNTS` | `unit:PIN:Name:Zone`, e.g. `EG2-08-12:4821:Aina:Elmina Green 2` |
| `ADMIN_ACCOUNTS` | `staffID:password:Name`, e.g. `SDP001:a-long-password:Nadia` |
| `SESSION_SECRET` | Long random text used to sign sessions |

Zones: Elmina Green 1, Elmina Green 2, Elmina West, Elmina East, Elmina Lakeside.

## Other settings

| Variable | Default | Purpose |
|---|---|---|
| `GEMINI_MODEL` | `gemini-flash-latest,gemini-flash-lite-latest` | Models to try in order |

## Demo photos

Put photos in `images/market/` and `images/showcase/` using the names in `images/README.txt`. JPG, PNG and WebP work; missing files fall back to drawn symbols. Staff can also add photos on one device from the Listings and Showcase pages.

## Troubleshooting

| Symptom | Fix |
|---|---|
| "AI sorting is offline" | `GEMINI_API_KEY` is missing; add it and redeploy |
| "Too many requests" or "models are busy" | Free-tier limit or Google demand spike; wait a few minutes |
| Model not found | Set `GEMINI_MODEL` to a current Flash model name from AI Studio |

## Run locally

Install Node 18+, run `npm i -g vercel`, then `vercel dev` in this folder and open http://localhost:3000.
