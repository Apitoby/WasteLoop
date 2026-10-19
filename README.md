# WasteLoop

**Snap it. Share it. Keep it out of landfill.**

WasteLoop is an AI-powered circular marketplace for Sime Darby Property townships. Residents snap a photo of something they no longer need; AI identifies it and routes it to **reuse** (a neighbour takes it for free or as a swap), **recycle** (SDP collects it) or **dispose** (safe disposal steps). Unclaimed items are routed to recycling automatically, so a listed item never ends in landfill. SDP gets a live ESG dashboard of waste diverted, money saved and CO₂ avoided.

Built for the **Sime Darby Property University Hackathon 2026 (Planet theme)**, piloting in Elmina.

**Live demo:** https://YOUR-LINK.vercel.app
On iPhone, open it in Safari and tap Share, then Add to Home Screen.

| Demo account | ID | PIN / password |
|---|---|---|
| Resident (Aina, Elmina Green 2) | `EG2-08-12` | `1234` |
| SDP staff | `SDP-ADMIN` | `elmina2026` |

---

## The problem

Residents throw away usable furniture, appliances and renovation leftovers because there is no easy, trusted way to pass them to neighbours. The same items are bought new by another household down the road, and the developer pays for bulk-waste collection with no data to show the reduction.

## How it works

1. **Snap**: the resident photographs an item (or describes it).
2. **AI routes it**: identifies the item, judges its condition, writes the listing and recommends Reuse, Recycle or Dispose, following the 3R hierarchy.
3. **Share**: reusable items go to a township-only marketplace (free or swap, no money involved). Neighbours with a matching wishlist are notified.
4. **Hand over**: the collector chats with the owner, then confirms pickup by scanning the owner's QR, or by entering a pickup code when the item was left at the door.
5. **Auto-route**: items unclaimed after 7 days (with a reminder 2 days before) go to SDP's recycling collection queue.
6. **Reward and measure**: Green Points (reuse earns most) are redeemed for township rewards, and every handover updates the resident's impact and SDP's ESG dashboard.

## Features

**Resident app**
- **Home**: pickups to action, free items nearby, what neighbours are looking for, points progress, latest SDP project
- **Market**: neighbours' feed with category filters, *List your item* (AI Smart Snap with live progress and "Ask the AI why"), My listings (remove with undo), Wishlist
- **Claims**: items to collect, items neighbours claimed from you, history; pickup chat with contactless code handover
- **Impact**: money saved (RM), kg diverted, items reused, CO₂ avoided, phase-by-phase comparison, SDP Showcase
- **Rewards**: points by 3R hierarchy, redeemable township rewards with voucher codes

**SDP admin console**
- **ESG dashboard**: tonnes diverted, items reused, total money saved (residents + disposal cost avoided), CO₂e avoided, monthly trend, weigh-in logging
- **Community heatmap**: activity by residential phase over 8 weeks
- **Collection**: recycling pickup queue, scheduling, collection logging
- **Listings**: oversight of listings and points, photo moderation
- **Showcase**: publish SDP projects that reuse construction surplus, with before/after photos

**Across the app**: role-based sign-in (residents and staff see separate apps), notifications that open the right page, confirmation for important actions, photo viewer, light/dark theme, works offline, installable on any phone.

## Tech stack

| Layer | Choice |
|---|---|
| App | Progressive Web App: HTML, CSS, vanilla JavaScript, service worker for offline use |
| Hosting | Vercel (static site + serverless functions) |
| AI | Google Gemini (vision) via server-side functions; automatic retry and model fallback when busy |
| Sign-in | Server-verified accounts with HMAC-signed session tokens; AI endpoints require sign-in |
| QR | qrcode.js (generate) and jsQR (camera scanning) |
| Running cost | RM 0 for the prototype (free tiers) |

```
index.html             the app: resident side and SDP admin console
sw.js                  offline support
manifest.webmanifest   install settings, icons/
images/                demo photos (see images/README.txt)
api/login.js           sign-in
api/session.js         session check
api/analyze.js         AI photo sorting
api/chat.js            "Ask the AI why"
api/_ai.js             Gemini client with retry and fallback
api/_auth.js           accounts and signed tokens
api/health.js          service status
api/test.js            AI health check (staff only)
```

## Impact measurement

| Metric | Method |
|---|---|
| Kg diverted from landfill | Estimated weight of each item handed over or collected, plus collection-point weigh-ins |
| Items reused | Count of QR- or code-verified handovers |
| Money saved (RM) | Second-hand value of reused items + tonnes diverted × disposal cost per tonne |
| CO₂e avoided | Weight × emission factor per category and route |

Figures in the demo are **simulated projections** based on sample data. Emission factors and the disposal cost per tonne are placeholders to be replaced with SDP's audited figures.

## Running it yourself

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). In short: deploy the folder to Vercel and set `GEMINI_API_KEY`.

## Roadmap

| Phase | Scope |
|---|---|
| Pilot (months 1–3) | One Elmina phase: Smart Snap, marketplace, auto-route, points |
| Improve (months 4–6) | Shared cloud database for multi-device sync and real-time chat; IoT scales at collection points; residents vote on SDP reuse projects |
| Scale (year 2) | Other SDP townships; group-wide ESG reporting; native app store release |

**Current prototype limits:** data is stored on each device (a shared database is the next step), pickup chat uses sample neighbours, and impact figures are projections.

## AI tools disclosure

In line with Clause 13 of the hackathon Terms and Conditions, we disclose the AI tools used in this submission:

| Tool | Provider | How it was used |
|---|---|---|
| Claude | Anthropic | AI coding and design assistant: wrote the prototype's code (web app and serverless functions) from our requirements, generated the app icons, and drafted the documentation |
| Gemini | Google | Runs inside the product: identifies photographed items, writes listing descriptions and suggests reuse, recycle or dispose. Residents review every suggestion and can change the route before anything is posted |

**What the team did:** defined the problem, the concept and the 3R feature set; decided the scope (for example no payments, no AI pricing, separate resident and staff access); directed every design and feature change; and tested the app on real phones. <!-- Add anything else that applies: research, interviews, pitch deck, other AI tools used for the deck or research -->

## Team

<!-- Add team members, roles and university -->
