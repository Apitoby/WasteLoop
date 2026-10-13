# WasteLoop: install on iPhone for free (no Claude login needed)

WasteLoop is a **Progressive Web App (PWA)**. You host it once on a free website. Anyone then opens the link in Safari and taps **Add to Home Screen**. It installs like a normal app, with its own icon, full screen, and it works offline.

AI photo sorting runs on a small server function that holds **your** API key. Phones never see the key, and users don't need any account.

**Total cost: RM 0.** GitHub, Vercel's Hobby plan and Gemini's free tier are all free.

```
index.html            the whole app (resident + SDP admin)
manifest.webmanifest  app name, icon, colours for "Add to Home Screen"
sw.js                 offline support
icons/                home-screen icons
api/_ai.js            talks to Gemini (free) or Claude (paid), key stays on server
api/analyze.js        AI photo sorting  (POST /api/analyze)
api/chat.js           "Ask the AI why"  (POST /api/chat)
api/health.js         tells the app whether AI is switched on
```

---

## 1. Get a free Gemini API key (about 3 minutes)

1. Go to **aistudio.google.com** and sign in with any Google account.
2. Click **Get API key**, then **Create API key**. Copy the key. It starts with `AIza`.
3. You don't need billing. Leave the project on the free tier and don't link a billing account.

Things to know about the free tier:
- **Limits are low.** There is a cap per minute and per day. You can see your exact limits in AI Studio under your project's rate limits. This is fine for building and demoing, but not for a whole township.
- **Google may use free-tier data to improve its products**, and human reviewers may see it. Don't snap photos showing people's faces, IC numbers or addresses.

## 2. Put it online with Vercel (free, about 10 minutes, no coding)

1. Create a free account at **github.com**. Create a new repository called `wasteloop`, then use **Add file → Upload files** to drag in **everything inside this folder**, including the `api` and `icons` folders. Click **Commit**.
2. Create a free account at **vercel.com** (Hobby plan) and sign in with GitHub.
3. Click **Add New → Project**, pick the `wasteloop` repo, and click **Import**.
   - Framework preset: **Other**. Leave the build settings empty.
4. Before deploying, open **Environment Variables** and add:
   - Name: `GEMINI_API_KEY`
   - Value: your `AIza...` key
5. Click **Deploy**. You get a link like `https://wasteloop-xxxx.vercel.app`.

To check it worked, open `https://<your-link>/api/health`. It should show `{"ai":true,"provider":"gemini"}`.

If you add or change a key later, go to **Settings → Environment Variables**, then **Deployments → ⋯ → Redeploy**.

## 3. Install on the iPhone

1. Open the Vercel link in **Safari**. It has to be Safari; Chrome on iPhone can't install apps to the home screen.
2. Tap the **Share** button (the square with an up-arrow).
3. Scroll down and tap **Add to Home Screen**, then **Add**.
4. Open **WasteLoop** from the home screen. It runs full screen.

Share the same link with your teammates and judges, and each of them can install it the same way.

---

## If something goes wrong

| What you see | Fix |
|---|---|
| "AI sorting is offline right now" | The key is missing. Add `GEMINI_API_KEY` in Vercel, then redeploy. |
| "Too many requests just now" | You hit the free per-minute or daily limit. Wait a minute, or try again tomorrow. |
| "Something went wrong reaching the AI" and Vercel logs mention the model | Google renamed or retired the model. In AI Studio, find a current free **Flash** model name, then set `GEMINI_MODEL` to it in Vercel and redeploy. |

## What works on the phone

- **Snap:** tapping the photo box opens the iPhone camera or the photo library. The AI returns Reuse, Recycle or Dispose, plus a description, weight, value, CO₂ estimate and a handling tip.
- **Real QR scanning at pickup:** the receiver's camera scans the owner's handover QR. Typing the 6-character code still works as a backup.
- **Offline:** the app opens without a connection. Only AI sorting needs the internet.
- **No AI key at all?** Everything else still works, and residents pick the route themselves.
- **Admin view:** tap **SDP Admin** at the top.

## Current limits

- **Data is stored on each phone.** Two phones won't see each other's posts yet. A shared database (Supabase and Firebase both have free tiers) is the next step.
- Neighbours, history and the first listings are **sample data**. Use **Reset demo data** in the side menu (desktop) to start fresh.
- CO₂ factors are rough estimates. Replace them with SDP's audited factors before reporting.
- **App Store version** needs a Mac with Xcode and an Apple Developer account (USD 99 per year). The project can be wrapped with **Capacitor** later.

## Optional settings (Vercel → Settings → Environment Variables)

| Variable | Default | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | none | Free Google AI key. Used first if set. |
| `GEMINI_MODEL` | `gemini-flash-latest` | Gemini model for sorting and chat |
| `ANTHROPIC_API_KEY` | none | Paid option, used only when there is no Gemini key |
| `WASTELOOP_MODEL` | `claude-sonnet-5-5` | Claude model for photo sorting |
| `WASTELOOP_CHAT_MODEL` | `claude-haiku-5-5` | Claude model for "Ask the AI why" |

To test on a computer first, install Node 18 or newer, run `npm i -g vercel`, then run `vercel dev` in this folder. Open http://localhost:3000.
