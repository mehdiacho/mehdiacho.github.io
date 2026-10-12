import React from 'react';
import { IsometricDesk } from './Drawings';
export default function Visualisation() {
 return <div className="grid items-center gap-8 lg:grid-cols-2">
   <div className="panel p-8"><IsometricDesk className="w-full max-w-[520px] mx-auto text-ink" /></div>
   <div className="p-4 lg:p-8"><p className="label text-accent">Still taking shape</p><h3 className="font-display text-4xl mt-5">My desk, in a browser</h3><p className="text-lg leading-relaxed mt-6 max-w-[48ch]">Desk Twin is an experiment based on my setup. I’m working on the objects, the lighting and what happens when you click on things. Some dimensions are estimates; it is not a finished replica.</p><a className="btn mt-8" href="https://v2.mehdiacho.tech/">Visit Desk Twin ↗</a></div>
 </div>;
}
