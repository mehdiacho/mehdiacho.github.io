import React from 'react';
import { motion } from 'framer-motion';
import { TIMELINE } from '../constants';

const Timeline: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="font-mono text-cyan-500 text-sm tracking-widest uppercase mb-4 border-b border-zinc-800 pb-2">
        Execution_Log
      </h3>
      
      <div className="relative border-l border-zinc-800 ml-3 space-y-8">
        {TIMELINE.map((item, index) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="relative pl-8"
          >
            {/* Dot */}
            <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 bg-zinc-950 border border-cyan-500 rounded-full"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1">
                <h4 className="font-mono text-zinc-200 font-bold text-sm md:text-base uppercase">{item.role}</h4>
                <span className="font-mono text-zinc-500 text-xs">{item.period}</span>
            </div>
            
            <div className="text-cyan-500/80 font-mono text-xs mb-2 uppercase tracking-wide">
                @{item.company}
            </div>
            
            <p className="text-zinc-400 text-sm leading-relaxed max-w-lg">
                {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;