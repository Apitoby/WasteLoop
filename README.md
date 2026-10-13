# WasteLoop — install on iPhone (no Claude login needed)

WasteLoop is a **Progressive Web App (PWA)**. You host it once on a free website. Then anyone opens the link in Safari and taps **Add to Home Screen**, and it installs like a normal app: its own icon, full screen, works offline.

The AI photo sorting runs on a small server function that holds **your** Anthropic API key. Phones never see the key, and users don't need a Claude account.

```
index.html            the whole app (resident + SDP admin)
manifest.webmanifest  app name, icon, colours for "Add to Home Screen"
sw.js                 offline support
icons/                home-screen icons
api/analyze.js        AI photo sorting  (POST /api/analyze)
api/chat.js           "Ask the AI why"  (POST /api/chat)
api/health.js         tells the app whether AI is switched on
```

---

## 1. Get an Anthropic API key (about 5 minutes)

1. Go to **console.anthropic.com** and sign up. This is separate from your Claude.ai login.
2. Add a little credit under **Billing**. Each photo sort costs well under 1 US cent, so a few dollars covers a hackathon.
3. Under **Settings → Limits**, set a low monthly spend limit, for example USD 10. The app URL is public, so this caps your risk.
4. Under **API Keys**, click **Create Key**, then copy it. It starts with `sk-ant-`.

## 2. Put it online with Vercel (free, about 10 minutes, no coding)

1. Create a free account at **github.com**. Create a new repository called `wasteloop`, then use **Add file → Upload files** to drag in **everything inside this folder**, including the `api` and `icons` folders. Click **Commit**.
2. Create a free account at **vercel.com** and sign in with GitHub.
3. Click **Add New → Project**, pick the `wasteloop` repo, and click **Import**.
   - Framework preset: **Other**. Leave the build settings empty.
4. Before deploying, open **Environment Variables** and add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: your `sk-ant-...` key
5. Click **Deploy**. You get a link like `https://wasteloop-xxxx.vercel.app`.

If you add or change the key later, go to **Settings → Environment Variables**, then **Deployments → ⋯ → Redeploy**.

## 3. Install on the iPhone

1. Open the Vercel link in **Safari**. It has to be Safari; Chrome on iPhone can't install apps to the home screen.
2. Tap the **Share** button (the square with an up-arrow).
3. Scroll down and tap **Add to Home Screen**, then **Add**.
4. Open **WasteLoop** from the home screen. It runs full screen, without the Safari bar.

Share the same link with your teammates and judges, and each of them can install it the same way.

---

## What works on the phone

- **Snap:** tapping the photo box opens the iPhone camera or the photo library. The AI returns Reuse, Recycle or Dispose, plus a description, weight, value, CO₂ estimate and a handling tip.
- **Real QR scanning at pickup:** the receiver's camera scans the owner's handover QR. iPhone asks for camera permission the first time. Typing the 6-character code still works as a backup.
- **Offline:** the app opens without a connection. Only AI sorting needs the internet.
- **Admin view:** tap **SDP Admin** at the top.

## Current limits

- **Data is stored on each phone.** Listings, points and the ESG numbers live on the device. Two phones won't see each other's posts yet. For a real multi-user version, add a shared database such as Supabase or Firebase. That is the next step.
- Neighbours, history and the first listings are **sample data**. Use **Reset demo data** in the side menu (desktop) to start fresh.
- CO₂ factors are rough estimates. Replace them with SDP's audited factors before reporting.
- **App Store version:** a PWA is the fastest way onto iPhones. A real App Store app needs a Mac with Xcode and an Apple Developer account (USD 99 per year). This same project can later be wrapped with **Capacitor** for that.

## Optional settings

| Variable | Default | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | (required for AI) | Your API key |
| `WASTELOOP_MODEL` | `claude-sonnet-5-5` | Model for photo sorting |
| `WASTELOOP_CHAT_MODEL` | `claude-haiku-5-5` | Model for "Ask the AI why" |

To test on a computer first, install Node 18 or newer, run `npm i -g vercel`, then run `vercel dev` in this folder. Open http://localhost:3000.
