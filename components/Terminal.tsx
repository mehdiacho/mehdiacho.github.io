import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, ChevronsUp, ChevronsDown, Eye, EyeClosed } from 'lucide-react';
import { TerminalLine } from '../types';
import { PROJECTS, PROFILE, SKILLS, TIMELINE, DREAM_LOG } from '../constants';
import { track } from '../lib/firebase';

type TerminalState = 'CLOSED' | 'PEEK' | 'OPEN';

// Single source of truth for tab-completion + help.
const COMMANDS = [
  'help', 'status', 'projects', 'skills', 'timeline', 'whoami', 'contact',
  'neofetch', 'trace', 'whois', 'ls', 'cat', 'date', 'echo', 'clear',
  'vault', 'sudo dream', 'manhuascan',
] as const;

const ageYears = (): number =>
  Math.floor((Date.now() - PROFILE.birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));

const Terminal: React.FC = () => {
  const [terminalState, setTerminalState] = useState<TerminalState>('PEEK');
  const [input, setInput] = useState('');
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'system', content: 'TERMINAL-U v2.0 // INITIALIZED' },
    { type: 'system', content: 'Type "help" for available commands. ↑/↓ history · Tab to complete.' },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1); // -1 = current/empty line
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [lines, terminalState]);

  const handleTerminalClick = () => {
    if (!isTyping && terminalState !== 'CLOSED') {
      inputRef.current?.focus();
    }
  };

  const getHeightClass = () => {
    switch (terminalState) {
      case 'CLOSED': return 'h-10';
      case 'PEEK': return 'h-48';
      case 'OPEN': return 'h-96';
      default: return 'h-48';
    }
  };

  const toggleMain = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTerminalState(prev => (prev === 'OPEN' ? 'CLOSED' : 'OPEN'));
  };

  const toggleCycle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTerminalState(prev => (prev === 'CLOSED' ? 'PEEK' : 'CLOSED'));
  };

  const print = (...newLines: TerminalLine[]) =>
    setLines(prev => [...prev, ...newLines]);

  const projectDetail = (id: string): TerminalLine => {
    const p = PROJECTS.find(pr => pr.id.toLowerCase() === id.toLowerCase());
    if (!p) return { type: 'output', content: `cat: ${id}: No such file or directory` };
    return {
      type: 'output',
      content:
        `[${p.id}] ${p.title}  <${p.status.toUpperCase()}>\n` +
        `  ${p.pitch}\n` +
        `  stack: ${p.stack.join(', ')}\n` +
        `  source: ${p.github ?? 'n/a'}   demo: ${p.link ?? 'n/a'}`,
    };
  };

  const runTrace = async () => {
    print({ type: 'system', content: 'TRACE // resolving visitor signature...' });
    try {
      const res = await fetch('https://ipwho.is/');
      const d = await res.json();
      if (!d || d.success === false) throw new Error('lookup failed');
      const loc = [d.city, d.region, d.country].filter(Boolean).join(', ') || 'unknown';
      print({
        type: 'output',
        content:
          `VISITOR RECON COMPLETE\n` +
          `  IP_ADDR   : ${d.ip ?? 'unknown'}\n` +
          `  LOCATION  : ${loc}\n` +
          `  COORDS    : ${d.latitude ?? '?'}, ${d.longitude ?? '?'}\n` +
          `  ISP       : ${d.connection?.isp ?? d.connection?.org ?? 'unknown'}\n` +
          `  TIMEZONE  : ${d.timezone?.id ?? 'unknown'}\n\n` +
          `note: approximate, resolved client-side. nothing is stored. you are safe here.`,
      });
      track('terminal_trace', { country: d.country ?? 'unknown' });
    } catch {
      print({ type: 'output', content: 'TRACE FAILED // visitor signature obscured (offline or blocked).' });
    }
  };

  const handleCommand = async (raw: string) => {
    const trimmed = raw.trim();
    print({ type: 'input', content: raw });
    setInput('');
    if (trimmed) setHistory(prev => [...prev, trimmed]);
    setHistoryIndex(-1);

    const lower = trimmed.toLowerCase();
    if (lower === '') return;

    const [cmd, ...rest] = lower.split(/\s+/);
    const arg = rest.join(' ');
    track('terminal_command', { command: cmd });

    // Special handlers (async / stateful).
    if (cmd === 'clear') { setTimeout(() => setLines([]), 50); return; }
    if (cmd === 'vault') {
      const tab = arg === 'receive' || arg === 'open' || arg === 'get' ? 'receive' : 'send';
      window.dispatchEvent(new CustomEvent('vault:open', { detail: { tab } }));
      print({ type: 'system', content: `SECURE_VAULT // opening encrypted channel [${tab.toUpperCase()}] ...` });
      return;
    }
    if (lower === 'sudo dream' || cmd === 'manhuascan') { await typeWriterEffect(DREAM_LOG); return; }
    if (cmd === 'trace' || cmd === 'whois') { await runTrace(); return; }

    const response: TerminalLine[] = [];
    switch (cmd) {
      case 'help':
        response.push({
          type: 'system',
          content:
`AVAILABLE COMMANDS:
  status      - Run system diagnostics
  projects    - List active modules + build status
  skills      - Render capability matrix
  timeline    - Print execution log
  whoami      - User identity
  contact     - Open comms channels
  ls          - List sections
  cat <name>  - Read a section (e.g. cat about, cat P1)
  neofetch    - System summary
  vault       - Open SECURE_VAULT (share/receive encrypted secrets)
  trace       - Recon the current visitor (you)
  date        - Current system time
  echo <txt>  - Repeat input
  clear       - Purge terminal history
  sudo dream  - [ENCRYPTED]
  manhuascan  - [ENCRYPTED]`,
        });
        break;
      case 'status':
        response.push({ type: 'output', content: `SYSTEM: ONLINE\nLOCATION: ${PROFILE.location}\nUSER: ${PROFILE.name}\nROLE: ${PROFILE.role}\nUPTIME: ${ageYears()}Y` });
        break;
      case 'whoami':
        response.push({ type: 'output', content: `root@terminal-u:${PROFILE.name.toLowerCase().replace(' ', '_')}` });
        break;
      case 'projects': {
        const list = PROJECTS.map(p => `[${p.id}] ${p.title.padEnd(20)} <${p.status.toUpperCase()}> :: ${p.stack.join(', ')}`).join('\n');
        response.push({ type: 'output', content: `LOADED MODULES:\n${list}\n\ntip: 'cat <id>' for details (e.g. cat P1).` });
        break;
      }
      case 'skills': {
        const list = SKILLS.map(s => {
          const filled = Math.round(s.level / 10);
          const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);
          return `  ${s.name.padEnd(14)} ${bar} ${s.level}%`;
        }).join('\n');
        response.push({ type: 'output', content: `CAPABILITY MATRIX:\n${list}` });
        break;
      }
      case 'timeline': {
        const list = TIMELINE_LINES();
        response.push({ type: 'output', content: list });
        break;
      }
      case 'contact':
        response.push({
          type: 'output',
          content: `EMAIL    : ${PROFILE.email}\nGITHUB   : ${PROFILE.socials.github}\nLINKEDIN : ${PROFILE.socials.linkedin}`,
        });
        break;
      case 'neofetch':
        response.push({ type: 'output', content: NEOFETCH() });
        break;
      case 'date':
        response.push({ type: 'output', content: new Date().toString() });
        break;
      case 'echo':
        response.push({ type: 'output', content: rest.join(' ') });
        break;
      case 'ls':
        response.push({ type: 'output', content: 'about.md   projects/   skills.cfg   timeline.log   contact.vcf' });
        break;
      case 'cat': {
        if (!arg) { response.push({ type: 'output', content: 'usage: cat <name>   (about | projects | skills | timeline | contact | P1..P3)' }); break; }
        const key = arg.replace(/\.(md|cfg|log|vcf)$/,'').replace(/\/$/,'');
        if (/^p\d+$/i.test(key)) { response.push(projectDetail(key)); break; }
        switch (key) {
          case 'about':
            response.push({ type: 'output', content: `${PROFILE.bio}\n${PROFILE.bioSub}\n${PROFILE.mission}` });
            break;
          case 'projects':
            response.push({ type: 'output', content: PROJECTS.map(p => `[${p.id}] ${p.title} <${p.status.toUpperCase()}>`).join('\n') });
            break;
          case 'skills':
            response.push({ type: 'output', content: SKILLS.map(s => `${s.name}: ${s.level}%`).join('\n') });
            break;
          case 'contact':
            response.push({ type: 'output', content: `${PROFILE.email}` });
            break;
          case 'timeline':
            response.push({ type: 'output', content: TIMELINE_LINES() });
            break;
          default:
            response.push({ type: 'output', content: `cat: ${arg}: No such file or directory` });
        }
        break;
      }
      default:
        response.push({ type: 'output', content: `Error: Command '${trimmed}' not recognized. Type 'help'.` });
    }
    print(...response);
  };

  const typeWriterEffect = async (text: string) => {
    setIsTyping(true);
    print({ type: 'output', content: '', isHtml: false });
    let currentContent = '';
    for (const char of text.split('')) {
      currentContent += char;
      setLines(prev => {
        const newLines = [...prev];
        newLines[newLines.length - 1].content = currentContent;
        return newLines;
      });
      await new Promise(r => setTimeout(r, 15 + Math.random() * 20));
    }
    setIsTyping(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const navHistory = (dir: number) => {
    if (history.length === 0) return;
    const next = historyIndex === -1 ? (dir < 0 ? history.length - 1 : -1) : historyIndex + dir;
    if (next < 0 || next >= history.length) {
      setHistoryIndex(-1);
      setInput('');
      return;
    }
    setHistoryIndex(next);
    setInput(history[next]);
  };

  const complete = () => {
    const val = input.trimStart().toLowerCase();
    if (!val || val.includes(' ')) return; // only complete the command token
    const matches = COMMANDS.filter(c => c.startsWith(val));
    if (matches.length === 1) {
      setInput(matches[0] + (matches[0].includes(' ') ? '' : ' '));
    } else if (matches.length > 1) {
      print({ type: 'system', content: matches.join('   ') });
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (isTyping) return;
    if (e.key === 'Enter') { handleCommand(input); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); navHistory(-1); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); navHistory(1); return; }
    if (e.key === 'Tab') { e.preventDefault(); complete(); return; }
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out ${getHeightClass()} bg-zinc-950 border-t border-zinc-800 shadow-2xl flex flex-col font-mono`}
    >
      {/* Terminal Header / Toggle Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 select-none relative">
        <div
          className="flex items-center gap-2 text-cyan-500 text-xs font-bold tracking-widest cursor-pointer"
          onClick={toggleCycle}
        >
          <TerminalIcon size={14} />
          <span className="hidden sm:inline">TERMINAL_CLI_V2.0</span>
          <span className="sm:hidden">CLI</span>
        </div>

        <div
          className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center cursor-pointer hover:bg-zinc-800 rounded px-4 py-1 transition-colors text-zinc-400 hover:text-cyan-400 group"
          onClick={toggleMain}
          title={terminalState === 'OPEN' ? 'Close Terminal' : 'Open Terminal'}
        >
          {terminalState === 'OPEN' ? <ChevronsDown size={16} /> : <ChevronsUp size={16} />}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-zinc-600 hidden md:block">hint: try 'trace' or 'manhuascan'</span>
          <div
            className="cursor-pointer hover:bg-zinc-800 rounded p-1 transition-colors text-zinc-500 hover:text-zinc-300"
            onClick={toggleCycle}
            title="Cycle View (Close/Peek/Open)"
          >
            {terminalState === 'OPEN' || terminalState === 'PEEK' ? <Eye size={16} /> : <EyeClosed size={16} />}
          </div>
        </div>
      </div>

      {/* Terminal Content */}
      {terminalState !== 'CLOSED' && (
        <div
          className="flex-1 p-4 overflow-y-auto font-mono text-sm sm:text-base text-zinc-300 space-y-2 custom-scrollbar"
          onClick={handleTerminalClick}
        >
          {lines.map((line, idx) => (
            <div key={idx} className={`${line.type === 'system' ? 'text-cyan-600' : line.type === 'input' ? 'text-zinc-500' : 'text-green-500'}`}>
              {line.type === 'input' && <span className="mr-2 text-zinc-600">$</span>}
              <span className="whitespace-pre-wrap">{line.content}</span>
            </div>
          ))}

          {!isTyping && (
            <div className="flex items-center text-zinc-200">
              <span className="mr-2 text-cyan-500">$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                className="bg-transparent border-none outline-none flex-1 text-zinc-200 caret-cyan-500"
                autoComplete="off"
                autoFocus
              />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

// --- helpers that read from constants (kept out of the component body) ---

function NEOFETCH(): string {
  return (
`        _______        ${PROFILE.name.toLowerCase().replace(' ', '@')}
       /\\  M A \\\\       ${'-'.repeat(PROFILE.name.length + 1)}
      /  \\_____ \\\\      role   : ${PROFILE.role}
      \\   /    / /      loc    : ${PROFILE.location}
       \\ /____/ /       uptime : ${ageYears()}Y
        \\______/        stack  : React · PyTorch · Python
                        theme  : Terminal-U v2.0`
  );
}

function TIMELINE_LINES(): string {
  return TIMELINE.map(t => `${t.period.padEnd(20)} ${t.role} @ ${t.company}`).join('\n');
}

export default Terminal;
