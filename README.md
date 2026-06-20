# 🎬 InstaDL - Instagram Reel Downloader

> Download Instagram reels instantly. Edge-deployed on Cloudflare — no server, no Python, no Docker. Just paste a URL and download.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Deployed on Cloudflare](https://img.shields.io/badge/Deployed-Cloudflare-f38020)](https://cloudflare.com)

## ✨ Features

- 🎨 **Glassmorphism UI** — Clean, modern design with smooth animations
- 🎬 **Inline Video Player** — Watch reels directly on the page
- ☁️ **Cloudflare R2 Storage** — 10-minute auto-expiry, no permanent storage
- ⚡ **Edge Deployed** — Cloudflare Pages + Workers, no server to manage
- 📱 **Responsive** — Works on mobile & desktop
- 🔐 **Privacy First** — No data stored, files auto-delete

## 🏗️ Architecture

```
User → Cloudflare Pages (static frontend)
          ↓ POST /download-reel
       Pages Function (Worker)
          ↓ fetch with session cookie
       Instagram API (video URL)
          ↓ download video
       Cloudflare R2 (10min expiry)
          ↓ return URL
       User watches/downloads
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JS |
| API | Cloudflare Pages Functions (Workers) |
| Storage | Cloudflare R2 |
| Runtime | JavaScript (V8 Isolate) |
| Hosting | Cloudflare Pages (free tier) |

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Cloudflare account](https://dash.cloudflare.com/) (free)
- Instagram account (for session cookie)

## 🚀 Local Development

### 1. Clone and install

```bash
git clone https://github.com/hariomop12/Insta-Reel-Downloder.git
cd Insta-Reel-Downloder
```

### 2. Set environment variables

Copy `.env.sample` to `.env` and fill in the **3 required values**:

```bash
cp .env.sample .env
```

### 3. Get your Instagram cookies

1. Open Chrome, go to `instagram.com` and log in
2. Open DevTools → **Application** → **Cookies** → `www.instagram.com`
3. Copy these 3 values and paste into `.env`:

| Variable | Where to find it |
|----------|-----------------|
| `IG_SESSION_ID` | Cookie `sessionid` |
| `IG_CSRF_TOKEN` | Cookie `csrftoken` |
| `IG_DS_USER_ID` | Cookie `ds_user_id` |

Your `.env` should look like:
```
IG_SESSION_ID=79635847399:BMvunP1iqF6RjX:6:AYggjVC0qHlPzuAEsAgSnEq4mxcffZOOSnsF328ZgwQ
IG_CSRF_TOKEN=your_csrftoken_here
IG_DS_USER_ID=your_ds_user_id_here
```

### 4. Start the dev server

```bash
npm run dev
```

Open **http://localhost:8788** — paste a reel URL and download.

## 🚀 Deployment

### Deploy to Cloudflare Pages

```bash
# Login to Cloudflare
npx wrangler login

# Deploy everything (frontend + API)
npx wrangler pages deploy . --project-name=insta-reel-downloader
```

After deployment, go to **Cloudflare Dashboard → Pages → `insta-reel-downloader` → Settings → Environment Variables** and add the same 3 variables (`IG_SESSION_ID`, `IG_CSRF_TOKEN`, `IG_DS_USER_ID`) as **Secrets** for the **Production** environment.

## 📡 API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/download-reel` | Download an Instagram reel |
| `GET` | `/media/:filename` | Serve video (auto-expires in 10min) |

### Download Request

```json
POST /download-reel
Content-Type: application/json

{ "reelUrl": "https://www.instagram.com/reel/ABC123/" }
```

### Response

```json
{
  "success": true,
  "download_url": "/media/123456_ABC123.mp4",
  "message": "Reel ready for download! Link expires in 10 minutes.",
  "expires_in": "10 minutes"
}
```

## 📁 Project Structure

```
├── index.html                 # Frontend (static)
├── functions/
│   ├── download-reel.js       # POST handler — fetch, extract, upload to R2
│   └── media/
│       └── [filename].js      # GET handler — serve video from R2
├── wrangler.toml              # Cloudflare config + R2 binding
├── .env.sample                # Environment variable template
├── package.json               # Scripts: dev, deploy, login
└── .gitignore
```

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| `Instagram session required` | Add `IG_SESSION_ID` to `.env` or Dashboard Secrets |
| `Could not extract video` | Session expired — re-login to Instagram and get fresh cookie |
| `File expired` | Files auto-delete after 10 minutes — download again |
| `Deploy not working` | Ensure R2 bucket binding is set in Dashboard → Functions |

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <strong>Made with ❤️ by <a href="https://github.com/hariomop12">Hariom</a></strong>
  <br>
  <sub>⭐ Star this repo if you found it helpful!</sub>
</div>