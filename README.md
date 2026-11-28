# PlaySpark — Kids Math, English & AR Adventure (PWA)

An interactive, responsive, offline-ready HTML5 Progressive Web App (PWA) for kids featuring **Math** (3D blocks & Times Tables), **English** (K–5 Phonics & Air-Trace writing), **Learning Guides**, and **AR Camera Motion Games**.

## Features
- **Interactive 3D Math Blocks**: Drag to rotate 3D cubes on touch or mouse; tap **Animate** to watch addition groups merge, subtraction cubes lift away, or multiplication grids form row-by-row.
- **Adventure Quests**: Starter, Explorer, and Master levels for `+`, `−`, `×`, or Mixed mode, with either 4-choice buttons or a Number Pad.
- **Times Tables Playground (1–12)**: CSS 3D flip flashcards paired with a live 3D cube array explorer and a per-table quiz.
- **60s Speed Blitz**: Fast-paced arcade mode with personal high-score tracking.
- **Trophy Room & Ranks**: Earn stars, build streaks, unlock badges, and level up from *Number Sprout* to *3D Math Wizard* (saved in `localStorage`).
- **Offline PWA & Zero External Dependencies**: Works 100% offline with a Service Worker (`sw.js`), Web App Manifest (`manifest.webmanifest`), and built-in Web Audio API sound effects.

## Hosting on GitHub Pages
All asset, bundle, and service-worker paths are relative (`./` with `base: './'` in `vite.config.ts`), so it works out of the box on both root domains and repository subpaths (e.g. `https://<username>.github.io/<repo>/`):

1. Push this repository to GitHub (`main` branch).
2. Open **Settings → Pages** in your GitHub repository.
3. Under **Build and deployment**, select **GitHub Actions** as the source.
4. The workflow in `.github/workflows/deploy.yml` automatically builds `dist/` (`npm ci && npm run build`) and publishes your Liquid Glass PWA on every push!

## Local Development & Testing
Install dependencies once and start the Vite dev server:

```bash
npm install
npm run dev
```

Or build and preview the production bundle (required to test the Service Worker):

```bash
npm run build
npx vite preview --port 8080 --host
```

### Testing on Your Phone (Same Wi-Fi)
1. Start the local server on port `8080`:
   ```powershell
   npx --yes serve . -l 8080
   ```
2. Find your PC's IPv4 address (e.g., `ipconfig`) and open `http://<YOUR_PC_IP>:8080` in your phone's browser (allow port `8080` in Windows Firewall if prompted).

> **Important Note for Testing Camera AR on iPhone:**  
> iOS Safari blocks camera and microphone access (`getUserMedia`) over plain `http://` LAN IP addresses (non-camera modes like Word Builder Board, Math Quests, and Learning Guides work over HTTP). To test **Letter Blaster AR** or other camera games with the live camera on iPhone, start an **HTTPS tunnel** in a second terminal pointing to port `8080`:

- **Using `localtunnel` via `npx` (no extra install):**
  ```powershell
  npx localtunnel --port 8080 --subdomain playspark
  ```
  This requests `https://playspark.loca.lt` (if taken, try `playspark-kids`, `playspark-ar`, `playspark-fun`, or `playspark3d`).  
  *(Tip: On first visit from your phone, if `loca.lt` asks for a tunnel password, enter your PC's public IP shown at `https://loca.lt/mytunnelpassword` on your PC.)*

- **Or using `ngrok`:**
  ```powershell
  winget install Ngrok.Ngrok
  ngrok http 8080
  ```
  Then open the generated `https://...` URL on your iPhone.
