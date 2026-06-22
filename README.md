<div align="center">

  <h1><code>TERMINAL-U // PORTFOLIO_V2</code></h1>
  
  <p>
    <strong>A Cyber-Industrial Single Page Application for Deep Learning Research.</strong>
    <br />
    <i>"Bloomberg Terminal meets Cyberpunk Logistics."</i>
  </p>

  <p>
    <a href="https://react.dev/">
      <img src="https://img.shields.io/badge/CORE-REACT-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    </a>
    <a href="https://tailwindcss.com/">
      <img src="https://img.shields.io/badge/STYLE-TAILWIND_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=black" alt="Tailwind" />
    </a>
    <a href="https://vitejs.dev/">
      <img src="https://img.shields.io/badge/BUNDLER-VITE-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    </a>
  </p>

<p>
    <a href="https://github.com/mehdiacho/mehdiacho.github.io/actions/workflows/Initialize%20Build.yml">
      <img src="https://github.com/mehdiacho/mehdiacho.github.io/actions/workflows/Initialize%20Build.yml/badge.svg" alt="Deploy static content to Pages" />
    </a>
  </p>

  <h3>
    <a href="https://mehdiacho.tech">🟢 INITIATE SYSTEM (LIVE DEMO)</a>
  </h3>
</div>

<br />

## 📂 01_SYSTEM_OVERVIEW
This repository contains the source code for **Mehdi Acho's** personal portfolio. It abandons traditional "web design" in favor of a utilitarian, data-dense interface designed to reflect the aesthetic of high-stakes engineering and deep learning research.

The UI follows the **Terminal-U v2.0** design language:
* **Palette:** Zinc-950 (Background) & Cyan-500 (Active State).
* **Typography:** Fira Code (Data) & Inter (Human Interface).
* **UX:** Keyboard-accessible CLI and "Glassmorphic" panels.

## 🛠 02_TECH_STACK
| MODULE | TECHNOLOGY | PURPOSE |
| :--- | :--- | :--- |
| **Core** | React 18 + Vite | Component architecture & build tool. |
| **Styling** | Tailwind CSS | Utility-first styling for "Cyber-Industrial" look. |
| **Motion** | Framer Motion | "Typewriter" effects and smooth panel transitions. |
| **Icons** | Lucide React | Vector system icons. |

## 📟 03_INSTALLATION_PROTOCOL
To deploy this system locally on your machine, execute the following command sequence:

```bash
# Clone the repository
git clone [https://github.com/mehdiacho/portfolio-v2.git](https://github.com/mehdiacho/portfolio-v2.git)

# Enter the directory
cd portfolio-v2

# Install dependencies
npm install

# (Optional) configure Firebase Analytics
cp .env.example .env   # then fill in your VITE_FIREBASE_* values

# Initialize development server
npm run dev
```

> Analytics is optional for local dev — the Firebase SDK loads lazily and
> **no-ops when `.env` is unset**, so the site runs fine without it.

## ⌨️ 04_FEATURE_SET
### A. The Command Line Interface (CLI)
The footer houses a functional terminal with **command history (↑/↓)** and
**Tab completion**. Available protocols:
* `help` — Lists available protocols.
* `status` — System diagnostics + uptime.
* `projects` — Project manifest with live build status.
* `skills` / `timeline` / `whoami` / `contact` — Section readouts.
* `ls` / `cat <name>` — Browse sections (`cat about`, `cat P1`, …).
* `neofetch` — System summary card.
* `trace` (alias `whois`) — **Visitor recon.** Resolves the current visitor's
  approximate location/ISP client-side via a keyless geo API. Nothing is
  stored — it just shows *you* what the web sees.
* `clear`, `date`, `echo`.

### B. Honest Project Status
Each project card carries a `status` badge — **`LIVE` / `WIP` / `CONCEPT`** —
driven by `Project.status` in `constants.ts`. Placeholders are labelled
`CONCEPT` (and `QUEUED // SEE_BACKLOG`) instead of faking links. Flip to
`LIVE` as each tracked project ships.

### C. Boot Sequence
A short CRT/scanline boot animation plays on first load (skippable by click or
keypress, with a "don't show again" toggle persisted to `localStorage`).
Respects `prefers-reduced-motion`.

### D. Dynamic Uptime
The "System Status" panel calculates the user's age in real-time format:
`UPTIME: 23Y 260D 14H`

### E. The "Dream" Protocol (Easter Egg)
Hidden logic exists within the CLI.
> *Hint: Sometimes you need `sudo` privileges to see the real vision.*

## 📡 05_HOSTING_&_ANALYTICS
The site currently ships to **GitHub Pages** (`Initialize Build.yml`). A
**Firebase Hosting + Analytics** path is scaffolded for migration:

| Artifact | Purpose |
| :--- | :--- |
| `lib/firebase.ts` | Lazy-loaded Analytics init (no-ops when unconfigured). |
| `firebase.json` / `.firebaserc` | Hosting config + SPA rewrites. |
| `.env.example` | The `VITE_FIREBASE_*` config keys. |
| `.github/workflows/Deploy to Firebase.yml` | Manual deploy workflow. |

**To migrate to Firebase:**
1. Create a Firebase project, enable **Analytics** (Google Analytics).
2. Copy the web app config into `.env` (and add the same keys + a deploy
   service account as **GitHub Actions secrets**).
3. Put your project id in `.firebaserc`.
4. Run the **"Deploy to Firebase Hosting"** workflow (or `firebase deploy`).
5. Point the `mehdiacho.tech` DNS at Firebase and **disable the Pages
   workflow** so the two don't fight over deploys.

## 📜 06_LICENSE
**MIT License** | System is Open Source. 
<br />
*Built by [Mehdi Acho](https://github.com/mehdiacho). Deep Learning Researcher. Gaborone, Botswana.*
