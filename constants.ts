import { Project, Experience, ToolGroup, Service, Work3D } from './types';

export const PROFILE = {
  name: "Mehdi Acho",
  role: "3D and CAD modeling · Web development",
  location: "Gaborone, Botswana",
  coordinates: "24.6282° S, 25.9231° E",
  status: "ONLINE",
  statusSub: "Available for work",
  /** Also the meta description. Changing it changes what Google shows. */
  bio: "I'm Mehdi Acho. I do CAD modeling, 3D printing and web development in Gaborone, Botswana.",
  bioSub: "I'm doing an MSc at BIUST and building things in between. Mostly replacement parts for things that broke and nobody sells any more, plus software that people actually end up using. If you've got something that needs measuring and printing, or a site that needs building, send me a photo of it.",
  mission: "I do research. I build software. For money. For fun. For the future.",
  email: "mehdiacho@gmail.com",
  socials: {
    linkedin: "https://linkedin.com/in/mehdiacho",
    github: "https://github.com/mehdiacho"
  },
  birthDate: new Date("2002-03-18T00:00:00")
};

/**
 * What someone can actually hire him for, in the order he wants to be hired
 * for it. Rendered in the hero card, directly under the bio — a visitor who
 * came from a search for "CAD modeling Gaborone" should not have to scroll.
 */
export const SERVICES: Service[] = [
  {
    name: "3D and CAD modeling",
    detail:
      "Something broke and nobody sells the part any more. I measure the original with calipers, draw it, model it, and then either hand you the file or print it here on PETG.",
    href: "/cad-modeling-botswana/",
    linkText: "More on CAD modeling"
  },
  {
    name: "Web development",
    detail:
      "Sites and web apps. Quick on a bad connection, usable on a phone, and findable on Google. This site is the example. It was built to rank, not just to look at.",
    href: "/web-development-gaborone/",
    linkText: "More on web development"
  },
  {
    name: "Machine learning",
    detail:
      "This is what my MSc is in. I train models for one specific question and then put them somewhere they can be used, which is the part most people skip.",
    // No page of its own yet, so this points at the work further down the page
    // rather than at an unrelated service page.
    href: "#software",
    linkText: "See the research work"
  }
];

/**
 * How the work actually goes, in four steps. Shown under the hero with a
 * drawing against each one — it is the clearest answer to "what do you
 * actually do", and it is the thing that separates this from a print shop.
 */
export const PROCESS: { step: string; title: string; detail: string }[] = [
  { step: "01", title: "Measure", detail: "Calipers on the real thing. Every edge written down before I open anything." },
  { step: "02", title: "Draw", detail: "A drawing comes first. Mistakes are cheap at this stage and expensive later." },
  { step: "03", title: "Model", detail: "Built from those numbers. Change one and the rest of the model follows." },
  { step: "04", title: "Print", detail: "Test fit. Adjust. Then print the real one." }
];

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
    pitch: "Voice-first idea capture for Android. Speak the thought and get it back structured, with the title, sections and action items pulled out. Kotlin + Compose on Firebase, with a desktop companion on the same library.",
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
    pitch: "1-bit dithering in the browser. Atkinson, Floyd-Steinberg, Bayer and plain threshold. Group images with independent presets and export a ZIP. Nothing is ever uploaded.",
    stack: ["Canvas", "Vanilla JS", "Pages"],
    image: "/covers/dither.svg",
    status: "live",
    github: "https://github.com/mehdiacho/dither",
    link: "https://dither.mehdiacho.tech"
  },
  {
    id: "P04",
    title: "MACHINE_STRIKE",
    pitch: "The Horizon tactics board game, rebuilt for the browser. Turn-based combat on a hex grid. The machine roster, the terrain and the overpower rules all come out of data files, in a typed monorepo running on Cloudflare Workers.",
    stack: ["TypeScript", "Workers", "Monorepo"],
    image: "/covers/machine-strike.svg",
    status: "wip",
    private: true
  },
  {
    id: "P05",
    title: "GRIDS_TO_GRAPHS",
    pitch: "MSc research. Benchmarks a graph convolutional network against EEGNet on 3-class inner-speech vowel decoding, to find out whether the real electrode layout beats the square grid a CNN assumes.",
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
    pitch: "A family's papers, kept somewhere they can be found, checked and eventually handed on. Whether a document is still valid, and who gets it next, are built into it rather than written on a sticky note. Encrypted so that only the family can read it.",
    stack: ["React", "Firebase", "Kotlin"],
    image: "/covers/kinkeep.svg",
    status: "wip",
    private: true
  },
  {
    id: "P09",
    title: "SECURE_VAULT",
    pitch: "Share a password or a config file without the server ever being able to read it. Everything is encrypted in your browser first; what you send is a link that can expire or be opened a set number of times. Cloudflare Workers and KV.",
    stack: ["React", "WebCrypto", "Cloudflare"],
    image: "/covers/secure-vault.svg",
    status: "live",
    action: { text: "LAUNCH", vault: true }
  },
  {
    id: "P10",
    title: "HIGHRISE",
    pitch: "A Monopoly-shaped multiplayer board game for two to four players, with bots to fill the empty seats. The server has the only real copy of the game, and both ends run the same rules engine over Socket.io.",
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
    pitch: "Receipt generator that encrypts in the browser, so the contents never leave it in the clear. Cyberpunk print aesthetic, exports print-ready output.",
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
    pitch: "A seat exchange for Google Play closed testing. Test another developer's app to earn seats, spend seats to get your own tested. It exists because of the twelve-testers-for-fourteen-days wall that every solo developer runs into.",
    stack: ["TypeScript", "Kotlin", "Firebase"],
    image: "/covers/a-testers.svg",
    status: "wip",
    private: true
  },
  {
    id: "P18",
    title: "SMARTSPEND",
    pitch: "Bridges the weekly shop and the semester budget. Built for buying in bulk: compare unit prices, see what the month looks like before you commit. Installs to the home screen and works with no signal.",
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
    pitch: "An early prototype where the architecture is the point: the agent half of it physically cannot reach into the browser half. That is checked by the build rather than by a reviewer noticing, which means the browser underneath can be swapped out later.",
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
      "A new shell for a 2007 Mazda flip key. No scanner, just calipers and a lot of patience. Every corner on the drawing is tagged and measured, and anything I haven't got a reading for yet stays a question mark instead of a guess. Three test fits printed so far and it still isn't right.",
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
    description: "Deep learning architectures. My thesis benchmarks graph networks against CNNs on EEG inner-speech data. Finishing late 2026."
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
    description: "Four years of software engineering. Graduated 2024, straight into the MSc."
  }
];

/**
 * What I actually reach for, grouped. There used to be a percentage against
 * each of these; it was a number I made up about myself, which is worse than
 * saying nothing, so it is gone.
 */
export const TOOLKIT: ToolGroup[] = [
  {
    group: "Modeling and printing",
    items: ["Fusion 360", "Parametric models in Python", "Caliper surveys and drawings", "PETG on an Ender-3"]
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
