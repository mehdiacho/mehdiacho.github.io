import { Project, Experience, Skill } from './types';

export const PROFILE = {
  name: "MEHDI ACHO",
  role: "DEEP LEARNING RESEARCHER // FULL-STACK ENGINEER",
  location: "GABORONE, BOTSWANA",
  coordinates: "24.6282° S, 25.9231° E",
  status: "ONLINE",
  statusSub: "OPEN_TO_WORK",
  bio: "Deep Learning Researcher based in Gaborone.",
  bioSub: "Investigating high-dimensional signal processing.",
  mission: "I do research. I build software. For money. For fun. For the future.",
  email: "mehdiacho@gmail.com",
  socials: {
    linkedin: "https://linkedin.com/in/mehdiacho",
    github: "https://github.com/mehdiacho"
  },
  birthDate: new Date("2002-03-18T00:00:00")
};

/**
 * Fallback project list.
 *
 * At runtime the site prefers the `projects` collection in Firestore (managed
 * from admin.mehdiacho.tech) and only falls back to this array when Firestore
 * is unreachable or empty — so the page still renders offline, on a cold cache,
 * or if the database is wiped. Keep it a truthful mirror of what's published.
 *
 * Real work only: every entry maps to a repo that exists, and every URL here
 * has been requested and returned 200.
 *
 * Ordering is deliberate: clickable things are salted through the list so a
 * visitor hits something they can try without scrolling to the bottom. The
 * `id` is baked into each cover SVG, so reordering means re-running
 * `node scripts/gen-covers.mjs`.
 */
export const PROJECTS: Project[] = [
  {
    id: "P01",
    title: "YAP",
    pitch: "Voice-first idea capture for Android. Speak the thought, get it back structured — title, sections, action items pulled out. Kotlin + Compose on Firebase, with a desktop companion on the same library.",
    stack: ["Kotlin", "Compose", "Firebase"],
    image: "/covers/yap.svg",
    status: "wip",
    private: true
  },
  {
    id: "P02",
    title: "TETHER",
    pitch: "A human-in-the-loop layer for AI agents: ask(), not notify(). A self-hosted MCP endpoint an agent blocks on, plus an Android app that rings like an actual phone call.",
    stack: ["TypeScript", "MCP", "Kotlin"],
    image: "/covers/tether.svg",
    status: "wip",
    private: true
  },
  {
    id: "P03",
    title: "DITHER",
    pitch: "1-bit dithering in the browser — Atkinson, Floyd–Steinberg, Bayer, threshold. Group images with independent presets and export a ZIP. Nothing is ever uploaded.",
    stack: ["Canvas", "Vanilla JS", "Pages"],
    image: "/covers/dither.svg",
    status: "live",
    github: "https://github.com/mehdiacho/dither",
    link: "https://dither.mehdiacho.tech"
  },
  {
    id: "P04",
    title: "MACHINE_STRIKE",
    pitch: "The Horizon tactics board game, rebuilt for the browser. Turn-based combat on a hex grid — machine roster, terrain and overpower rules driven from data, in a typed monorepo over Cloudflare Workers.",
    stack: ["TypeScript", "Workers", "Monorepo"],
    image: "/covers/machine-strike.svg",
    status: "wip",
    private: true
  },
  {
    id: "P05",
    title: "GRIDS_TO_GRAPHS",
    pitch: "MSc research. Benchmarks a graph convolutional network against EEGNet on 3-class inner-speech vowel decoding — testing whether electrode geometry beats the grid a CNN assumes.",
    stack: ["PyTorch", "GNN", "EEG"],
    image: "/covers/grids-to-graphs.svg",
    status: "wip",
    private: true
  },
  {
    id: "P06",
    title: "FPX_NOW",
    pitch: "Published npm CLI. Caches and aliases the npx invocations you keep retyping, so a long build incantation collapses into a two-word command.",
    stack: ["Node", "CLI", "npm"],
    image: "/covers/fpx-now.svg",
    status: "live",
    github: "https://github.com/mehdiacho/fpx-now",
    link: "https://fpx.mehdiacho.tech"
  },
  {
    id: "P07",
    title: "FILMARR",
    pitch: "Swipe-first film and TV tracker. Tinder-style triage feeding a graph recommender, with Letterboxd export. Native Kotlin + Compose on a Firebase and Cloud Run backend.",
    stack: ["Kotlin", "Compose", "Cloud Run"],
    image: "/covers/filmarr.svg",
    status: "wip",
    private: true
  },
  {
    id: "P08",
    title: "KINKEEP",
    pitch: "A family's documents — findable, verifiable, handed on. Treats a document's validity and its eventual succession as first-class, with tier-based envelope encryption.",
    stack: ["React", "Firebase", "Kotlin"],
    image: "/covers/kinkeep.svg",
    status: "wip",
    private: true
  },
  {
    id: "P09",
    title: "SECURE_VAULT",
    pitch: "Zero-knowledge secret sharing. Encrypts files & .env vars in your browser, then mints a one-time access key + link with view limits and auto-expiry. Cloudflare Workers + KV.",
    stack: ["React", "WebCrypto", "Cloudflare"],
    image: "/covers/secure-vault.svg",
    status: "live",
    action: { text: "LAUNCH", vault: true }
  },
  {
    id: "P10",
    title: "HIGHRISE",
    pitch: "Monopoly-family multiplayer board game — 2–4 players plus bots. Server-authoritative, built on one pure reducer engine shared by client and server over Socket.io.",
    stack: ["TypeScript", "Fastify", "Socket.io"],
    image: "/covers/highrise.svg",
    status: "wip",
    private: true
  },
  {
    id: "P11",
    title: "FISH_PLAYER",
    pitch: "Type a line on your phone, hear it in your own cloned voice from a speaker in another building. The server renders and holds the queue; the PC long-polls, so no port is ever opened.",
    stack: ["TypeScript", "Docker", "Tailnet"],
    image: "/covers/fish-player.svg",
    status: "live",
    private: true
  },
  {
    id: "P12",
    title: "BLACKWALL",
    pitch: "Receipt generator with client-side encryption — contents never leave the browser in the clear. Cyberpunk print aesthetic, exports print-ready output.",
    stack: ["React", "WebCrypto", "Vite"],
    image: "/covers/blackwall.svg",
    status: "live",
    action: { text: "LAUNCH", href: "https://prints.mehdiacho.tech" },
    private: true
  },
  {
    id: "P13",
    title: "DRAFTING_TABLE",
    pitch: "A design system for technical drawing sets that get printed, pinned to a wall and read for months. Extracted from an 18-sheet A2 greenhouse blueprint set, and it carries that job's rule: never let a guess look like a fact.",
    stack: ["Design System", "Tokens", "Print"],
    image: "/covers/drafting-table.svg",
    status: "wip",
    private: true
  },
  {
    id: "P14",
    title: "TALLY",
    pitch: "An installable counter PWA. Tap +/−, the count persists offline, runs from the home screen. No accounts, no network, no build step.",
    stack: ["PWA", "Vanilla JS", "Pages"],
    image: "/covers/tally.svg",
    status: "live",
    github: "https://github.com/mehdiacho/tally-counter",
    link: "https://mehdiacho.github.io/tally-counter/"
  },
  {
    id: "P15",
    title: "BIBVERIFY",
    pitch: "Paste a .bib file and check every entry against the official DOI registry. Field-by-field diff against CrossRef/DataCite, accept-or-keep per field, export a clean file.",
    stack: ["React", "Express", "CrossRef"],
    image: "/covers/bibverify.svg",
    status: "wip",
    private: true
  },
  {
    id: "P16",
    title: "AISTUDIO_SYNC",
    pitch: "Google AI Studio can push prompts to GitHub but never pull them back. This adds a Pull button straight into its toolbar, so edits made in any local editor sync in.",
    stack: ["Chrome MV3", "TypeScript"],
    image: "/covers/aistudio-sync.svg",
    status: "wip",
    private: true
  },
  {
    id: "P17",
    title: "A_TESTERS",
    pitch: "A seat exchange for Google Play closed testing. Test another developer's app to earn seats, spend seats to get your own tested — solving the twelve-testers-for-fourteen-days wall solo devs hit.",
    stack: ["TypeScript", "Kotlin", "Firebase"],
    image: "/covers/a-testers.svg",
    status: "wip",
    private: true
  },
  {
    id: "P18",
    title: "SMARTSPEND",
    pitch: "Bridges the weekly shop and the semester budget. Built for buying in bulk — unit-price comparison, forecast spend across months, installable and offline-first.",
    stack: ["React", "Firebase", "PWA"],
    image: "/covers/smartspend.svg",
    status: "wip",
    private: true
  },
  {
    id: "P19",
    title: "MMILA",
    pitch: "Procurement transparency for a Gaborone residential development. Awarding anything but the cheapest compliant quote demands a written justification, appended to a hash-chained ledger.",
    stack: ["FastAPI", "Postgres", "Claude"],
    image: "/covers/mmila.svg",
    status: "wip",
    private: true
  },
  {
    id: "P20",
    title: "AGENTIC_BROWSER",
    pitch: "An early prototype where the architecture is the point: the agent package is physically unable to import Electron, enforced by a dependency-cruiser CI gate rather than a code review. The engine tier underneath it stays swappable.",
    stack: ["Electron", "TypeScript", "React"],
    image: "/covers/agentic-browser.svg",
    status: "concept",
    private: true
  }
];

export const TIMELINE: Experience[] = [
  {
    id: "E1",
    role: "MSc Computer Science",
    company: "BIUST",
    period: "Feb 2025 - Present",
    description: "Specializing in Deep Learning architectures. Expected completion: Late 2026."
  },
  {
    id: "E2",
    role: "Innovation Club President",
    company: "BIUST",
    period: "Aug 2023 - May 2024",
    description: "Led student initiatives and fostered a culture of tech innovation."
  },
  {
    id: "E3",
    role: "Software Intern",
    company: "Spectrum Analytics",
    period: "May 2023 - Aug 2023",
    description: "Led AI integration projects and collaborated with cross-functional teams."
  },
  {
    id: "E4",
    role: "BSc Computer Science",
    company: "BIUST",
    period: "Aug 2020 - May 2024",
    description: "Graduated with a strong foundation in software engineering principles."
  }
];

export const SKILLS: Skill[] = [
  { name: "Python", level: 95, category: "language" },
  { name: "JavaScript", level: 85, category: "language" },
  { name: "C++", level: 70, category: "language" },
  { name: "Dart", level: 65, category: "language" },
  { name: "React.js", level: 90, category: "framework" },
  { name: "PyTorch", level: 85, category: "framework" },
  { name: "GNNs & CNNs", level: 90, category: "core" },
  { name: "Full-Stack", level: 80, category: "core" },
];

export const DREAM_LOG = `Initializing Core Dump...

Truth is, I love building software. I found a love for research I didn't expect. My goal isn't just a job; it's to work on tech that will see the light of day.

The Dream: A massive signing bonus from a company that actually cares about mankind. Or starting a business that does. I want to use that capital to invest in global change. I've lived on the short side of the stick. I know what it's like. I want to make sure one less kid has to live like that.

Capabilities: My strength is ideas. I have too many. I need teams to help me execute them.

Downtime Protocols: Cyberpunk 2077 (Masterpiece). Shared gaming sessions. Reading Manhwa (formerly Anime/Manga, but I evolved).

End of Log.`;
