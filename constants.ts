import { Project, Experience, ToolGroup, Work3D } from './types';

export const PROFILE = {
  name: "Mehdi Acho",
  role: "Software · Machine learning · Side quests",
  location: "Gaborone, Botswana",
  coordinates: "24.6282° S, 25.9231° E",
  status: "ONLINE",
  statusSub: "Available for work",
  /** Also the meta description. Changing it changes what Google shows. */
  bio: "I'm Mehdi Acho. I build software, study machine learning and make CAD models in Gaborone, Botswana.",
  bioSub: "I'm doing an MSc at BIUST and building things in between: software people actually use, research on how models read brain signals, and the odd CAD model when something of mine breaks.",
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
    pitch: "I talk faster than I type, so I built an Android app that listens. Say the idea out loud and it comes back as a note with a title, sections and action items. A desktop companion runs on the same library.",
    category: "ai",
    stack: ["Kotlin", "Compose", "Firebase"],
    image: "/covers/yap.svg",
    status: "wip",
    private: true
  },
  {
    id: "P02",
    title: "TETHER",
    pitch: "AI agents are good at reporting what they did and bad at asking first. Tether lets an agent stop, ask a person and wait for the answer. A self-hosted MCP endpoint sits on one side, and an Android app that rings like a phone call sits on the other.",
    category: "ai",
    stack: ["TypeScript", "MCP", "Kotlin"],
    image: "/covers/tether.svg",
    status: "wip",
    private: true
  },
  {
    id: "P03",
    title: "DITHER",
    pitch: "Turn photos into 1-bit art in the browser with Atkinson, Floyd–Steinberg, Bayer or a plain threshold. Group images, give each group its own settings and download the lot as a ZIP. Nothing is uploaded.",
    category: "tools",
    stack: ["Canvas", "Vanilla JS", "Pages"],
    image: "/covers/dither.svg",
    status: "live",
    github: "https://github.com/mehdiacho/dither",
    link: "https://dither.mehdiacho.tech"
  },
  {
    id: "P04",
    title: "MACHINE_STRIKE",
    pitch: "The tactics board game from Horizon, rebuilt so you can play it in a browser. Turn-based fights on a hex grid, with the machines, the terrain and the overpower rules all read from data files. It runs on Cloudflare Workers.",
    category: "games",
    stack: ["TypeScript", "Workers", "Monorepo"],
    image: "/covers/machine-strike.svg",
    status: "wip",
    private: true
  },
  {
    id: "P05",
    title: "GRIDS_TO_GRAPHS",
    pitch: "My MSc research. EEG electrodes sit on a curved head, but a CNN reads them as a flat grid. I’m testing whether a graph network that knows the real electrode layout decodes inner-speech vowels better than EEGNet.",
    category: "ai",
    stack: ["PyTorch", "GNN", "EEG"],
    image: "/covers/grids-to-graphs.svg",
    status: "wip",
    private: true
  },
  {
    id: "P06",
    title: "FPX_NOW",
    pitch: "A small command-line tool on npm. It remembers the long npx commands you keep retyping and gives them short names, so a build incantation becomes two words.",
    category: "tools",
    stack: ["Node", "CLI", "npm"],
    image: "/covers/fpx-now.svg",
    status: "live",
    github: "https://github.com/mehdiacho/fpx-now",
    link: "https://fpx.mehdiacho.tech"
  },
  {
    id: "P07",
    title: "FILMARR",
    pitch: "Swipe through films and shows to sort out what you actually want to watch, and a graph-based recommender learns from the swipes. Exports to Letterboxd. Native Android, with Firebase and Cloud Run behind it.",
    category: "ai",
    stack: ["Kotlin", "Compose", "Cloud Run"],
    image: "/covers/filmarr.svg",
    status: "wip",
    private: true
  },
  {
    id: "P08",
    title: "KINKEEP",
    pitch: "Somewhere for a family’s important papers to live, so they can be found, checked and eventually handed on. Whether a document is still valid, and who receives it next, are part of the record instead of a note on the fridge. Encrypted so only the family can read it.",
    category: "tools",
    stack: ["React", "Firebase", "Kotlin"],
    image: "/covers/kinkeep.svg",
    status: "wip",
    private: true
  },
  {
    id: "P09",
    title: "SECURE_VAULT",
    pitch: "Share a password or a config file without the server ever being able to read it. It’s encrypted in your browser before it leaves, and the link can expire or stop working after a set number of opens. You can try it right here.",
    category: "tools",
    stack: ["React", "WebCrypto", "Cloudflare"],
    image: "/covers/secure-vault.svg",
    status: "live",
    action: { text: "LAUNCH", vault: true }
  },
  {
    id: "P10",
    title: "HIGHRISE",
    pitch: "A Monopoly-style board game for two to four players online, with bots for the empty seats. The server keeps the only real copy of the game, and both ends run the same rules engine over Socket.io.",
    category: "games",
    stack: ["TypeScript", "Fastify", "Socket.io"],
    image: "/covers/highrise.svg",
    status: "wip",
    private: true
  },
  {
    id: "P11",
    title: "FISH_PLAYER",
    pitch: "Type a line on my phone and hear it in my own cloned voice from a speaker in another building. The server renders the audio and holds the queue; the PC checks in for new lines, so no port is ever opened.",
    category: "tools",
    stack: ["TypeScript", "Docker", "Tailnet"],
    image: "/covers/fish-player.svg",
    status: "live",
    private: true
  },
  {
    id: "P12",
    title: "BLACKWALL",
    pitch: "A receipt maker with a Cyberpunk print look. Everything is encrypted in the browser, so the contents never leave it readable, and it exports print-ready pages.",
    category: "tools",
    stack: ["React", "WebCrypto", "Vite"],
    image: "/covers/blackwall.svg",
    status: "live",
    action: { text: "LAUNCH", href: "https://prints.mehdiacho.tech" },
    private: true
  },
  {
    id: "P13",
    title: "DRAFTING_TABLE",
    pitch: "A design system for technical drawings that get printed, pinned to a wall and read for months. I pulled it out of an 18-sheet greenhouse blueprint set, and it keeps that job’s rule: never let a guess look like a fact.",
    category: "tools",
    stack: ["Design System", "Tokens", "Print"],
    image: "/covers/drafting-table.svg",
    status: "wip",
    private: true
  },
  {
    id: "P14",
    title: "TALLY",
    pitch: "A counter you can install on your phone. Tap plus or minus and the count stays put, even offline. No account, no network and no build step.",
    category: "tools",
    stack: ["PWA", "Vanilla JS", "Pages"],
    image: "/covers/tally.svg",
    status: "live",
    github: "https://github.com/mehdiacho/tally-counter",
    link: "https://mehdiacho.github.io/tally-counter/"
  },
  {
    id: "P15",
    title: "BIBVERIFY",
    pitch: "Paste in a .bib file and check every reference against the official DOI records at CrossRef and DataCite. See what differs field by field, choose what to keep and download a clean file.",
    category: "ai",
    stack: ["React", "Express", "CrossRef"],
    image: "/covers/bibverify.svg",
    status: "wip",
    private: true
  },
  {
    id: "P16",
    title: "AISTUDIO_SYNC",
    pitch: "Google AI Studio can push prompts to GitHub but can’t pull them back. This Chrome extension adds a Pull button to its toolbar, so edits made in my own editor come back in.",
    category: "tools",
    stack: ["Chrome MV3", "TypeScript"],
    image: "/covers/aistudio-sync.svg",
    status: "wip",
    private: true
  },
  {
    id: "P17",
    title: "A_TESTERS",
    pitch: "Google Play wants twelve testers for fourteen days before a solo developer can publish. A-Testers is a seat exchange: test someone else’s app to earn seats, then spend them to get your own app tested.",
    category: "tools",
    stack: ["TypeScript", "Kotlin", "Firebase"],
    image: "/covers/a-testers.svg",
    status: "wip",
    private: true
  },
  {
    id: "P18",
    title: "SMARTSPEND",
    pitch: "Somewhere between the weekly shop and the semester budget. Compare unit prices when buying in bulk, and see what the month looks like before you spend. It installs to your home screen and works without signal.",
    category: "tools",
    stack: ["React", "Firebase", "PWA"],
    image: "/covers/smartspend.svg",
    status: "wip",
    private: true
  },
  {
    id: "P19",
    title: "MMILA",
    pitch: "Procurement you can see into, for a residential development in Gaborone. If anything other than the cheapest compliant quote wins, someone has to write down why, and that note goes into a hash-chained record.",
    category: "tools",
    stack: ["FastAPI", "Postgres", "Claude"],
    image: "/covers/mmila.svg",
    status: "wip",
    private: true
  },
  {
    id: "P20",
    title: "AGENTIC_BROWSER",
    pitch: "An early prototype where the architecture is the point. The AI agent side can’t reach into the browser side, and the build checks that instead of relying on a reviewer to notice. That should let me swap out the browser underneath later.",
    category: "ai",
    stack: ["Electron", "TypeScript", "React"],
    image: "/covers/agentic-browser.svg",
    status: "concept",
    private: true
  }
];

/**
 * 3D / CAD work.
 *
 * Stills live in `public/portfolio-3d/`. Add a file there, add an entry here,
 * and write the `alt` yourself — the gallery will not invent one, and an item
 * whose image 404s is dropped from the grid rather than shown broken.
 *
 * Set `model` to a `.glb` in the same folder to get a "VIEW_3D" button. The
 * viewer is ~1 MB and is only fetched when someone presses it.
 *
 * Source for all of this: `X:\Projects\3d` — the blueprints, the Python build
 * scripts and the STLs.
 */
export const WORKS_3D: Work3D[] = [
  {
    id: "M01",
    title: "Laptop charger brace",
    caption:
      "The rubber sleeve where my charger cable meets the plug tore off completely and left the wires showing. This grips the plug, carries the cable past the damaged bit and clips onto the back of the laptop. It prints as two halves that close around the cable, so you don't have to cut anything.",
    image: "/portfolio-3d/charger-brace-v1.png",
    alt:
      "Four shaded CAD views of the charger brace. The assembled part is shown from behind the laptop and from the face that touches it; below, the two halves lie flat on their split faces the way they print, and one half is turned over to show the hollow the plug barrel sits in. The part is a round ribbed sleeve on a flat mounting plate, with a thin arm hooking off one side.",
    specs: ["Black PETG", "About 12 g", "Prints in two halves"],
    status: "wip"
  },
  {
    id: "M02",
    title: "Mazda flip-key body",
    caption:
      "A new shell for a 2007 Mazda flip key. No scanner, just calipers and a lot of patience. Every corner on the drawing is tagged and measured, and anything I haven't got a reading for yet stays a question mark instead of a guess. Three fit-test variants have been printed; the fit results are still pending.",
    image: "/portfolio-3d/mazda-key-blueprint.png",
    alt:
      "A measurement blueprint sheet for a Mazda flip-key head. Four orthographic views (front, back, side and bottom) have every corner tagged with a red lettered point and every edge boxed in teal. A schedule beside them lists measurements A to Z in millimetres, with question marks where a reading has not been taken yet.",
    specs: ["Measured by caliper", "3 test fits", "About 20 g"],
    status: "wip"
  }
];

export const TIMELINE: Experience[] = [
  {
    id: "E1",
    role: "MSc Computer Science",
    company: "BIUST",
    period: "Feb 2025 - Present",
    description: "Deep learning architectures. My thesis benchmarks graph networks against CNNs on EEG inner-speech data."
  },
  {
    id: "E2",
    role: "Innovation Club President",
    company: "BIUST",
    period: "Aug 2023 - May 2024",
    description: "Ran the club for a year. Events, talks and getting student projects off the ground."
  },
  {
    id: "E3",
    role: "Software Intern",
    company: "Spectrum Analytics",
    period: "May 2023 - Aug 2023",
    description: "First proper job. AI integration work, across teams that had not built with it before."
  },
  {
    id: "E4",
    role: "BSc Computer Science",
    company: "BIUST",
    period: "Aug 2020 - May 2024",
    description: "Four years of software engineering. Graduated in 2024; returned for an MSc in 2025."
  }
];

/**
 * What I actually reach for, grouped. There used to be a percentage against
 * each of these; it was a number I made up about myself, which is worse than
 * saying nothing, so it is gone.
 */
export const TOOLKIT: ToolGroup[] = [
  {
    group: "Modeling",
    items: ["Fusion 360", "Parametric models in Python", "Caliper surveys and drawings", "Designing for fabrication"]
  },
  {
    group: "Web",
    items: ["React", "TypeScript", "Tailwind", "Firebase", "Cloudflare Workers"]
  },
  {
    group: "Machine learning",
    items: ["PyTorch", "Graph and convolutional networks"]
  },
  {
    group: "Languages",
    items: ["Python", "JavaScript", "Kotlin", "C++", "Dart"]
  }
];

/**
 * Mehdi's own words, from the terminal easter egg the old site hid them in.
 * Only the machine framing around them was removed — the sentences are his.
 */
export const ABOUT: string[] = [
  "Truth is, I love building software. I found a love for research I didn't expect. My goal isn't just a job; it's to work on tech that will see the light of day.",
  "The dream is a signing bonus from a company that actually cares about mankind — or starting a business that does — and using that to invest in global change. I've lived on the short side of the stick. I know what it's like. I want to make sure one less kid has to live like that.",
  "My strength is ideas. I have too many of them. I need teams to help me execute them.",
  "Off the clock: Cyberpunk 2077, gaming with friends, and reading manhwa."
];
