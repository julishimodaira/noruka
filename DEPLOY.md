# Deploying Noruka — Step-by-Step Guide
## From your computer to a testable iPhone link in ~20 minutes

---

## What you'll end up with

A URL like `https://noruka.vercel.app` that your tester opens on their iPhone in Safari, then installs directly to their home screen. It looks and feels like a native app.

---

## Step 1 — Set up your computer (5 min)

You'll need two free tools:

### Install Node.js
Go to **https://nodejs.org** and download the LTS version. Run the installer.

### Install Git
Go to **https://git-scm.com** and download for your OS. Run the installer.

To verify both installed, open Terminal (Mac) or Command Prompt (Windows) and type:
```
node --version
git --version
```
Both should print a version number.

---

## Step 2 — Create a GitHub account (2 min)

1. Go to **https://github.com** and sign up (free)
2. Verify your email

---

## Step 3 — Put the project on GitHub (5 min)

1. On GitHub, click the **+** icon → **New repository**
2. Name it `noruka`
3. Keep it **Private** for now
4. Click **Create repository**

Then in Terminal, navigate to the `noruka-pwa` folder and run:

```bash
# Navigate to the project folder
cd path/to/noruka-pwa

# Initialise git
git init

# Add all files
git add .

# First commit
git commit -m "Initial Noruka PWA"

# Connect to GitHub (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/noruka.git

# Push
git push -u origin main
```

Your code is now on GitHub.

---

## Step 4 — Deploy to Vercel (3 min)

Vercel hosts the app and gives you a live URL. It's free.

1. Go to **https://vercel.com** and sign up with your GitHub account
2. Click **Add New → Project**
3. Select your `noruka` repository
4. Vercel will auto-detect it's a React app
5. Leave all settings as default
6. Click **Deploy**

After ~90 seconds, you'll see: **"Your project is live at noruka.vercel.app"** ✅

You can set a custom domain later (like `noruka.app`) — Vercel makes this easy.

---

## Step 5 — Generate app icons (5 min)

The app needs PNG icons to look right on the home screen.

1. Open the file `public/icons/icon.svg` in your project folder
2. Go to **https://realfavicongenerator.net**
3. Upload the SVG file
4. On the iOS section, set background colour to `#080b14`
5. Download the generated package
6. Copy all the PNG files into `noruka-pwa/public/icons/`
7. Commit and push:
```bash
git add .
git commit -m "Add app icons"
git push
```
Vercel will automatically redeploy within 30 seconds.

---

## Step 6 — Send to your tester

Share this message with your tester:

> **Testing Noruka on iPhone:**
> 1. Open **Safari** (must be Safari, not Chrome)
> 2. Go to: `https://noruka.vercel.app`
> 3. Tap the **Share button** (box with arrow at bottom of screen)
> 4. Scroll down and tap **"Add to Home Screen"**
> 5. Tap **Add** in the top right
> 6. The Noruka icon will appear on your home screen
> 7. Open it — it will run full screen like a native app

---

## What your tester should check

Ask them to test:

- [ ] Home screen icon looks good
- [ ] App opens full screen (no Safari browser bar)
- [ ] All 5 cities load correctly
- [ ] Station detail pages open and tabs work
- [ ] Phrase cards copy on tap
- [ ] Emergency card works
- [ ] Search works
- [ ] Works on slow/no WiFi (offline mode)
- [ ] Text is readable — nothing too small
- [ ] Scrolling feels smooth

---

## Making updates

Any time you update the code, just run:
```bash
git add .
git commit -m "Description of change"
git push
```
Vercel deploys automatically. Your tester refreshes and gets the new version instantly.

---

## After testing — next steps

Once your tester gives the thumbs up, you have two options:

### Option A: Keep it as a PWA
- Add a custom domain (e.g. `noruka.app` — ~$12/year from Namecheap or Google Domains)
- Share the link publicly
- Users install it from Safari on iPhone, Chrome on Android

### Option B: Submit to App Store
- Requires converting to React Native (~2-4 weeks of dev work)
- $99/year Apple Developer Program membership
- Apple review process takes 1-3 days
- App appears in App Store search results

**Recommendation:** Run the PWA for 1-2 months, see if real users engage with it, then decide on a native app.

---

## Need help?

Common issues:

**"git push" asks for a password**
→ Use a Personal Access Token instead. GitHub Settings → Developer Settings → Personal Access Tokens → Generate new token.

**Vercel says "Build failed"**
→ Check the build log. Usually a missing dependency — run `npm install` locally first.

**Icons not showing on iPhone**
→ Make sure `public/icons/apple-touch-icon.png` exists and is exactly 180x180px.

**App doesn't install to home screen**
→ Must be opened in **Safari specifically** — Chrome on iOS cannot install PWAs.
