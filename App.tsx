import React from 'react';
import { Github, Linkedin, Mail, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

import SystemStatus from './components/SystemStatus';
import Timeline from './components/Timeline';
import Projects from './components/Projects';
import Terminal from './components/Terminal';
import Skills from './components/Skills';
import { PROFILE } from './constants';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-cyan-900 selection:text-white pb-40">
      <SystemStatus />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Left Column: Profile & Diagnostics (Fixed-ish on Desktop) */}
        <div className="lg:col-span-4 space-y-8">

          {/* Hero Profile Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-zinc-900 border border-zinc-800 p-6 relative"
          >
            <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-cyan-500"></div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-cyan-500"></div>

            <div className="mb-6">
              <h1 className="font-mono text-4xl font-bold text-white tracking-tighter mb-2">
                {PROFILE.name.split(' ')[0]}<br />
                <span className="text-zinc-600">{PROFILE.name.split(' ')[1]}</span>
              </h1>
              <p className="font-mono text-xs text-cyan-500 tracking-widest mb-1">{PROFILE.role}</p>
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                {PROFILE.statusSub}
              </div>
            </div>

            <p className="text-zinc-400 leading-relaxed text-sm mb-6 border-l-2 border-zinc-800 pl-4 italic">
              {PROFILE.bio}
            </p>
            <p className="text-zinc-400 leading-relaxed text-sm border-l-2 border-zinc-800 pl-4 italic">
              {PROFILE.bioSub}
            </p>
            <p className="text-zinc-400 leading-relaxed text-sm mb-6 border-l-2 border-zinc-800 pl-4 italic">
              {PROFILE.mission}
            </p>

            {/* Social Actions */}
            <div className="flex flex-col gap-3">
              <a href={`mailto:${PROFILE.email}`} className="flex items-center justify-between px-4 py-3 bg-zinc-950 border border-zinc-800 hover:border-cyan-500/50 hover:text-cyan-400 transition-all group">
                <span className="font-mono text-xs uppercase">Init_Contact</span>
                <Mail size={16} className="text-zinc-600 group-hover:text-cyan-500" />
              </a>
              <div className="grid grid-cols-2 gap-3">
                <a href={PROFILE.socials.github} className="flex items-center justify-center gap-2 py-3 bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 transition-all">
                  <Github size={16} />
                  <span className="font-mono text-xs">GITHUB</span>
                </a>
                <a href={PROFILE.socials.linkedin} className="flex items-center justify-center gap-2 py-3 bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 transition-all">
                  <Linkedin size={16} />
                  <span className="font-mono text-xs">LINKEDIN</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Skills Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Skills />
          </motion.div>

        </div>

        {/* Right Column: Projects & Timeline */}
        <div className="lg:col-span-8 space-y-16">
          <Projects />
          <Timeline />
        </div>

      </main>

      {/* Floating CLI Terminal */}
      <Terminal />
    </div>
  );
};

export default App;