import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, ChevronsUp, ChevronsDown, ChevronUp, ChevronDown, Eye, EyeClosed } from 'lucide-react';
import { TerminalLine } from '../types';
import { PROJECTS, PROFILE, DREAM_LOG } from '../constants';

type TerminalState = 'CLOSED' | 'PEEK' | 'OPEN';

const Terminal: React.FC = () => {
  const [terminalState, setTerminalState] = useState<TerminalState>('PEEK');
  const [input, setInput] = useState('');
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'system', content: 'TERMINAL-U v2.0 // INITIALIZED' },
    { type: 'system', content: 'Type "help" for available commands.' },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [lines, terminalState]);

  // Focus input when clicking anywhere in terminal
  const handleTerminalClick = () => {
    if (!isTyping && terminalState !== 'CLOSED') {
      inputRef.current?.focus();
    }
  };

  const getHeightClass = () => {
    switch (terminalState) {
      case 'CLOSED': return 'h-10';
      case 'PEEK': return 'h-48'; // Approx PEEK/peek
      case 'OPEN': return 'h-96';
      default: return 'h-48';
    }
  };

  const toggleMain = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (terminalState === 'OPEN') {
      setTerminalState('CLOSED');
    } else {
      setTerminalState('OPEN');
    }
  };

  const toggleCycle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTerminalState(prev => {
      if (prev === 'CLOSED') return 'PEEK';
      return 'CLOSED';
    });
  };

  const handleCommand = async (cmd: string) => {
    const cleanCmd = cmd.trim().toLowerCase();

    // Add user input line
    setLines(prev => [...prev, { type: 'input', content: cmd }]);
    setInput('');

    if (cleanCmd === 'clear') {
      setTimeout(() => setLines([]), 100);
      return;
    }

    let response: TerminalLine[] = [];

    switch (cleanCmd) {
      case 'help':
        response.push({
          type: 'system',
          content: `
AVAILABLE COMMANDS:
  status    - Run system diagnostics
  projects  - List active modules
  clear     - Purge terminal history
  whoami    - User identity
  sudo dream - [ENCRYPTED]
  manhuascan - [ENCRYPTED]
`
        });
        break;
      case 'status':
        response.push({ type: 'output', content: `SYSTEM: ONLINE\nLOCATION: ${PROFILE.location}\nUSER: ${PROFILE.name}\nROLE: ${PROFILE.role}` });
        break;
      case 'whoami':
        response.push({ type: 'output', content: `root@terminal-u:${PROFILE.name.toLowerCase().replace(' ', '_')}` });
        break;
      case 'projects':
        const projectList = PROJECTS.map(p => `[${p.id}] ${p.title} :: ${p.stack.join(', ')}`).join('\n');
        response.push({ type: 'output', content: `LOADED MODULES:\n${projectList}` });
        break;
      case 'sudo dream':
      case 'manhuascan':
        await typeWriterEffect(DREAM_LOG);
        return; // typeWriter handles the state update
      default:
        response.push({ type: 'output', content: `Error: Command '${cmd}' not recognized.` });
    }

    setLines(prev => [...prev, ...response]);
  };

  const typeWriterEffect = async (text: string) => {
    setIsTyping(true);
    const chars = text.split('');
    let currentContent = '';

    // Add an empty line to start filling
    setLines(prev => [...prev, { type: 'output', content: '', isHtml: false }]);

    for (const char of chars) {
      currentContent += char;
      setLines(prev => {
        const newLines = [...prev];
        newLines[newLines.length - 1].content = currentContent;
        return newLines;
      });
      await new Promise(r => setTimeout(r, 15 + Math.random() * 20)); // Random typing speed
    }
    setIsTyping(false);
    // Re-focus input after typing
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isTyping) {
      handleCommand(input);
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out ${getHeightClass()} bg-zinc-950 border-t border-zinc-800 shadow-2xl flex flex-col font-mono`}
    >
      {/* Terminal Header / Toggle Bar */}
      <div
        className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 select-none relative"
      >
        {/* Left: Title */}
        <div
          className="flex items-center gap-2 text-cyan-500 text-xs font-bold tracking-widest cursor-pointer"
          onClick={toggleCycle} // Allow clicking title to cycle too, or just make it static? User said tab center and right. Left can be static or cycle. I'll make it static or cycle. Let's make it consistent.
        >
          <TerminalIcon size={14} />
          <span className="hidden sm:inline">TERMINAL_CLI_V2.0</span>
          <span className="sm:hidden">CLI</span>
        </div>

        {/* Center: Main Toggle (Double Arrows) */}
        <div
          className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center cursor-pointer hover:bg-zinc-800 rounded px-4 py-1 transition-colors text-zinc-400 hover:text-cyan-400 group"
          onClick={toggleMain}
          title={terminalState === 'OPEN' ? "Close Terminal" : "Open Terminal"}
        >
          {terminalState === 'OPEN' ? (
            <ChevronsDown size={16} />
          ) : (
            <ChevronsUp size={16} />
          )}
        </div>

        {/* Right: Hint + Cycle Toggle (Single Arrow) */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-zinc-600 hidden md:block">hint: try 'help' or 'manhuascan'</span>
          <div
            className="cursor-pointer hover:bg-zinc-800 rounded p-1 transition-colors text-zinc-500 hover:text-zinc-300"
            onClick={toggleCycle}
            title="Cycle View (Close/Peek/Open)"
          >
            {/* Visual indicator for cycle - maybe simple single chevron indicating direction? 
                    If closed -> Up (to PEEK).
                    If PEEK -> Up (to open).
                    If Open -> Down (to closed).
                */}
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

export default Terminal;