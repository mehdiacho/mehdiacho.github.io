import React from 'react';
import { SKILLS } from '../constants';

const Skills: React.FC = () => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 relative overflow-hidden">
      {/* Decorative Grid Lines */}
      <div className="absolute top-0 right-0 w-16 h-16 border-l border-b border-zinc-800/50 pointer-events-none"></div>
      
      <h3 className="font-mono text-cyan-500 text-sm tracking-widest uppercase mb-6 flex items-center gap-2">
        <span className="w-2 h-2 bg-cyan-500 animate-pulse rounded-full"></span>
        System_Diagnostics
      </h3>

      <div className="space-y-4">
        {SKILLS.map((skill) => (
          <div key={skill.name}>
            <div className="flex justify-between mb-1">
              <span className="font-mono text-xs text-zinc-400 uppercase">{skill.name}</span>
              <span className="font-mono text-xs text-cyan-500">{skill.level}%</span>
            </div>
            <div className="w-full bg-zinc-950 h-2 border border-zinc-800 p-[1px]">
              <div 
                className={`h-full ${skill.category === 'language' ? 'bg-zinc-400' : skill.category === 'framework' ? 'bg-cyan-700' : 'bg-green-700'}`} 
                style={{ width: `${skill.level}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between text-[10px] font-mono text-zinc-600 uppercase">
        <span>Mem_Usage: 45%</span>
        <span>Threads: 12</span>
        <span>Temp: 42°C</span>
      </div>
    </div>
  );
};

export default Skills;