# 🐈 soummo; money — Deployment Guide

Your personal finance app is ready. This guide walks you through deploying it to a real URL like `soummo-money.vercel.app` so you can install it on your iPhone like a real app.

## ⏱️ Total time: ~15 minutes

You don't need any coding knowledge. Just follow the steps.

---

## 📦 What's in this folder

```
soummo-money/
├── index.html              ← The app (all code in here)
├── manifest.json           ← Makes it installable as PWA
├── sw.js                   ← Service worker (offline support)
├── vercel.json             ← Vercel deployment config
├── icon-192.png            ← App icon (small)
├── icon-512.png            ← App icon (large)
├── apple-touch-icon.png    ← iOS home screen icon
└── favicon-32.png          ← Browser tab icon
```

---

## 🚀 Option A: Deploy with Vercel (Recommended — easiest)

### Step 1: Create a GitHub account (if you don't have one)
- Go to https://github.com
- Click **Sign up**
- Use your email, create a password
- Skip the survey, you're in

### Step 2: Create a new repository
- Click the **+** icon top-right → **New repository**
- Name it: `soummo-money` (or whatever you like)
- Set to **Public**
- Click **Create repository**

### Step 3: Upload your files
- On the new empty repo page, click **uploading an existing file**
- Drag ALL 8 files from the `soummo-money` folder into the browser
- Scroll down, click **Commit changes**

### Step 4: Sign up for Vercel
- Go to https://vercel.com
- Click **Sign Up** → **Continue with GitHub**
- Authorize Vercel to access your GitHub
- You're in — completely free tier

### Step 5: Import your project
- On Vercel dashboard, click **Add New...** → **Project**
- Find `soummo-money` in the list → click **Import**
- Leave all settings as default
- Click **Deploy**

### Step 6: Wait ~30 seconds
- Vercel will build and deploy
- You'll see confetti 🎉
- Click **Continue to Dashboard**
- Your URL will be something like: `soummo-money-xxxxx.vercel.app`
- Or click **Settings** → **Domains** to set a custom name

**Your app is now live on the internet.** 🐈

---

## 📱 Step 7: Install on your iPhone (the magic step)

1. On your **iPhone**, open **Safari** (must be Safari, not Chrome)
2. Go to your Vercel URL (e.g. `soummo-money.vercel.app`)
3. Tap the **Share** button (square with arrow up)
4. Scroll down → tap **Add to Home Screen**
5. Tap **Add**

🎉 **You now have a real-looking app icon on your home screen.**

- Tap it → opens fullscreen, no Safari bars
- Works offline (service worker caches everything)
- Data saves locally on your phone
- Updates automatically when you push new versions

---

## 🔄 Option B: Use Netlify Drop (Even Faster — No GitHub Needed)

If you don't want to deal with GitHub at all:

1. Go to https://app.netlify.com/drop
2. Drag the entire `soummo-money` folder into the browser
3. Wait ~10 seconds
4. You get a URL like `wonderful-name-12345.netlify.app`
5. Click **Site settings** → **Change site name** → make it `soummo-money`
6. Install on iPhone with Steps 7 above

**Done.** Less control but faster.

---

## 🔧 Updating the app later

### If you used Vercel:
1. Make changes to `index.html` on your computer
2. Go to your GitHub repo
3. Click on `index.html` → pencil icon (edit)
4. Paste the new content
5. Scroll down → **Commit changes**
6. Vercel auto-deploys in 30 seconds
7. Refresh your iPhone app → updated

### If you used Netlify Drop:
1. Make changes locally
2. Go to https://app.netlify.com/sites/[your-site]/deploys
3. Drag the updated folder in → redeploys

---

## 💰 Cost

**Completely free.** Both Vercel and Netlify have generous free tiers that this app will never exceed. No credit card needed.

---

## 🔒 Privacy & Data

- Your money data is stored in your iPhone's local browser storage
- Nothing is sent to any server
- Even Vercel/Netlify only host the HTML — they never see your data
- If you switch phones, you start fresh (no cloud sync)

### To backup your data:
The app stores everything in `localStorage` under key `soummo_money_v2`. To back up:
1. Open the app in Safari on iPhone
2. Settings → Safari → Advanced → Website Data
3. Or use this: open Console (Safari → Develop → iPhone → your-app), type `localStorage.getItem('soummo_money_v2')` → copy/save the JSON

---

## 🐛 Troubleshooting

**"Add to Home Screen" doesn't show:**
- Make sure you're using Safari, not Chrome
- The site must be served over HTTPS (Vercel/Netlify both do this automatically)

**App doesn't open fullscreen:**
- Long-press the home screen icon → check it's the PWA, not a Safari bookmark
- If it shows Safari bars, delete and re-add

**Data lost:**
- Don't clear Safari cache for your app's URL
- Don't use Private mode

**App not loading offline:**
- First open it online once so service worker can cache
- Then offline works

---

## 📞 Need help?

If you get stuck at any step, take a screenshot and share it back. The most common stumbling blocks:

1. Github upload → make sure ALL 8 files go in, not just some
2. Vercel deploy fails → wait 60 seconds and retry
3. "Add to Home Screen" missing → you're not in Safari

---

## 🎯 Your URL will be something like:

- `https://soummo-money.vercel.app`
- `https://soummo-money-soummo.vercel.app`
- `https://your-name.vercel.app`

You can set a custom domain later for free (Vercel: Settings → Domains → Add).

---

**That's it.** Push deploy, install on iPhone, track your money. 🐈

*your story; continued.*
