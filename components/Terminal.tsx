import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2 } from 'lucide-react';
import { TerminalLine } from '../types';
import { PROJECTS, PROFILE, DREAM_LOG } from '../constants';

const Terminal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
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
  }, [lines]);

  // Focus input when clicking anywhere in terminal
  const handleTerminalClick = () => {
    if (!isTyping) {
        inputRef.current?.focus();
    }
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
        className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out ${isOpen ? 'h-96' : 'h-10'} bg-zinc-950 border-t border-zinc-800 shadow-2xl flex flex-col font-mono`}
    >
      {/* Terminal Header / Toggle Bar */}
      <div 
        className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 cursor-pointer hover:bg-zinc-800/50 transition-colors select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 text-cyan-500 text-xs font-bold tracking-widest">
            <TerminalIcon size={14} />
            <span>TERMINAL_CLI_V2.0</span>
        </div>
        <div className="flex items-center gap-3 text-zinc-500">
            <span className="text-[10px] hidden sm:block">hint: try 'help' or 'manhuascan'</span>
            {isOpen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </div>
      </div>

      {/* Terminal Content */}
      {isOpen && (
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