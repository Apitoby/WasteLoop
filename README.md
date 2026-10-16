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
api/_auth.js          resident / staff accounts and signed sign-in tokens
api/login.js          sign in   (POST /api/login)
api/session.js        checks a saved sign-in is still valid
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

## Sign-in: residents and SDP staff are separate

Nobody can use the app without signing in, and the AI only answers signed-in users, so strangers can't use up your free Gemini quota.

- **Residents** sign in with their **unit number + resident PIN** and only see the resident app (Home, Market, Impact, Rewards).
- **SDP staff** tap **"SDP staff? Sign in here"** and use **staff ID + password**. They only see the admin console (ESG, Heatmap, Collection, Listings, Showcase).

**Demo accounts** work out of the box and are shown on the sign-in screen until you set your own:

| Who | ID | PIN / password |
|---|---|---|
| Resident (Aina, Elmina Green 2) | `EG2-08-12` | `1234` |
| Resident (Farid, Elmina East) | `EE-02-07` | `5678` |
| SDP staff | `SDP-ADMIN` | `elmina2026` |

**To set real accounts**, add these in Vercel → Settings → Environment Variables, then redeploy. The demo accounts and the hint on the sign-in screen disappear automatically.

| Variable | Format (comma between people) |
|---|---|
| `RESIDENT_ACCOUNTS` | `unit:PIN:Name:Zone`, e.g. `EG2-08-12:4821:Aina:Elmina Green 2, EW-03-05:9930:Hafiz:Elmina West` |
| `ADMIN_ACCOUNTS` | `staffID:password:Name`, e.g. `SDP001:a-long-password:Nadia` |
| `SESSION_SECRET` | any long random text. It signs sign-ins; changing it signs everyone out. |

Zone must be one of: Elmina Green 1, Elmina Green 2, Elmina West, Elmina East, Elmina Lakeside.

## Accidental taps

Important actions (claim, redeem, post, send to recycling, remove listing, schedule pickup, mark collected, weigh-in, publish showcase, sign out, reset) open a confirmation sheet first. The Confirm button stays inactive for a moment so the same swipe can't press it, and taps that land right after scrolling are ignored.

## Adding real photos

Demo marketplace items and SDP Showcase projects show a drawn symbol until you add a photo. Two ways to add one:

1. **Every phone sees it:** put photo files in `images/market/` and `images/showcase/` in your GitHub repo, named as listed in `images/README.txt` (for example `images/market/rattan-armchair.jpg` or `images/showcase/lakeside-gazebo-after.jpg`). JPG, PNG and WebP all work. Vercel updates the app in about a minute.
2. **This phone only (quick demo setup):** sign in as SDP staff. Use **Add** under Photo on the Listings page, or **Before / after photos** on a Showcase project. New Showcase projects can include before and after photos when you publish them.

## Other features

- **Tap a photo to inspect it.** Item and Showcase photos show in full inside their box (nothing cropped). Tapping one opens it full screen with its name.
- **List your item** lives in Market (and the "List your item" button on Home). Snap or describe the item, tap **Check with AI**, review, then post or send to recycling.
- **Notifications open the right page.** For example, a claim on your item opens My listings, and a wishlist match opens the marketplace.
- **Claims page** (new tab): *To collect* (items you claimed), *My items* (claimed by neighbours, waiting to be claimed, sent to recycling) and *History* (received and given away).
- **Pickup chat.** Claiming an item opens a chat with the owner. If the owner isn't home, they leave the item at the door and tap **Share pickup code**. The collector enters that code (or scans the QR) to confirm. In this prototype the other person is a sample neighbour with scripted replies. Real person-to-person chat needs the shared database.
- **Home page** shows your pickups, nearby free items, what neighbours are looking for, points progress to the next reward, the latest SDP Showcase project and last month's township total.
- **Launch screen.** Each time the app is opened, a short WasteLoop animation plays (about 2.5 seconds). Tap anywhere to skip it. Reloading during the same visit skips it automatically.
- **Light mode by default.** Change it under the initials button → Settings → Theme (Light, Dark or System). The choice is remembered on that phone.

## Money saved (RM)

- **Resident Impact page:** "Money saved" adds up the second-hand value of items the resident took instead of buying new, plus the value of items they gave to neighbours. The Home screen shows the same total.
- **SDP ESG dashboard:** "Total money saved" = residents' savings + SDP's disposal cost avoided (tonnes kept out of landfill × disposal cost per tonne). The cost per tonne starts at a **placeholder RM 150**. Set SDP's real rate in the **Money saved** card on the dashboard.

## If something goes wrong

| What you see | Fix |
|---|---|
| "Unit number or PIN is incorrect" | Check the account in `RESIDENT_ACCOUNTS` (or use the demo account). IDs are not case-sensitive. |
| "AI sorting is offline right now" | The key is missing. Add `GEMINI_API_KEY` in Vercel, then redeploy. |
| "Too many requests just now" | You hit the free per-minute or daily limit. Wait a minute, or try again tomorrow. |
| "Something went wrong reaching the AI" and Vercel logs mention the model | Google renamed or retired the model. In AI Studio, find a current free **Flash** model name, then set `GEMINI_MODEL` to it in Vercel and redeploy. |

## What works on the phone

- **Snap:** tapping the photo box opens the iPhone camera or the photo library. The AI returns Reuse, Recycle or Dispose, plus a description, weight, value, CO₂ estimate and a handling tip.
- **Real QR scanning at pickup:** the receiver's camera scans the owner's handover QR. Typing the 6-character code still works as a backup.
- **Offline:** the app opens without a connection. Only AI sorting needs the internet.
- **No AI key at all?** Everything else still works, and residents pick the route themselves.
- **Admin view:** sign in as SDP staff.
- **Prototype controls** (skip a day, reset demo data) and **Sign out** are under the round initials button, top right.

## Current limits

- **Sign-in is checked by the server**, but listings and points are still stored on each phone, so a technical user could edit their own phone's data.
- **Data is stored on each phone.** Two phones won't see each other's posts yet. A shared database (Supabase and Firebase both have free tiers) is the next step.
- Neighbours, history and the first listings are **sample data**. Use **Reset demo data** under the initials button to start fresh.
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
