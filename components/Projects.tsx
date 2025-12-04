import React from 'react';
import { motion } from 'framer-motion';
import { Github, ExternalLink, Cpu } from 'lucide-react';
import { PROJECTS } from '../constants';

const Projects: React.FC = () => {
  return (
    <div className="w-full">
      <h3 className="font-mono text-cyan-500 text-sm tracking-widest uppercase mb-6 border-b border-zinc-800 pb-2">
        Active_Modules
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PROJECTS.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="group relative bg-zinc-900 border border-zinc-800 p-0 overflow-hidden hover:border-cyan-500/50 transition-colors duration-300"
          >
            {/* Header bar */}
            <div className="bg-zinc-950 border-b border-zinc-800 p-2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Cpu size={14} className="text-zinc-500" />
                    <span className="font-mono text-xs text-zinc-400 uppercase">{project.id}</span>
                </div>
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-zinc-800 group-hover:bg-cyan-500/50 transition-colors"></div>
                    <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                </div>
            </div>

            {/* Image Placeholder */}
            <div className="relative h-32 w-full overflow-hidden border-b border-zinc-800/50">
                <div className="absolute inset-0 bg-cyan-900/10 z-10 group-hover:bg-transparent transition-colors duration-500"></div>
                <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover filter grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-105"
                />
                {/* Tech Stack Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-zinc-950 to-transparent z-20 flex gap-2">
                    {project.stack.map(tech => (
                        <span key={tech} className="text-[10px] font-mono text-cyan-200 bg-cyan-950/50 px-1 border border-cyan-900/50">
                            {tech}
                        </span>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h4 className="font-mono text-zinc-100 text-lg font-bold mb-2 group-hover:text-cyan-400 transition-colors">
                    {project.title}
                </h4>
                <p className="text-zinc-400 text-sm mb-4 h-16 line-clamp-3">
                    {project.pitch}
                </p>

                <div className="flex gap-4 mt-auto">
                    {project.github && (
                        <a href={project.github} className="flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-zinc-200 transition-colors">
                            <Github size={14} />
                            <span>SOURCE</span>
                        </a>
                    )}
                    {project.link && (
                        <a href={project.link} className="flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-zinc-200 transition-colors">
                            <ExternalLink size={14} />
                            <span>DEPLOY</span>
                        </a>
                    )}
                </div>
            </div>
            
            {/* Corner Accent */}
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-zinc-700 group-hover:border-cyan-500 transition-colors"></div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Projects;