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

export const PROJECTS: Project[] = [
  {
    id: "P1",
    title: "NEURO_VIS_V1",
    pitch: "Real-time EEG signal visualization using WebGL and Python.",
    stack: ["React", "Three.js", "Python"],
    image: "https://picsum.photos/400/250?grayscale&blur=2",
    github: "#",
    link: "#"
  },
  {
    id: "P2",
    title: "SENTINEL_BOT",
    pitch: "Autonomous discord bot for server administration and anomaly detection.",
    stack: ["Node.js", "Discord.js", "TensorFlow"],
    image: "https://picsum.photos/400/251?grayscale&blur=2",
    github: "#"
  },
  {
    id: "P3",
    title: "GABORONE_TRAFFIC_AI",
    pitch: "Computer vision model for optimizing local traffic light patterns.",
    stack: ["OpenCV", "PyTorch", "Flutter"],
    image: "https://picsum.photos/400/252?grayscale&blur=2",
    link: "#"
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
