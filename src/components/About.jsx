import React, { useState } from 'react';
import { PRIVACY_POLICY, TERMS_OF_USE } from '../constants/LegalText';

export default function About() {
  const [activeDoc, setActiveDoc] = useState(null); // 'privacy' | 'terms' | null

  if (activeDoc) {
    const content = activeDoc === 'privacy' ? PRIVACY_POLICY : TERMS_OF_USE;
    return (
      <div className="animate-fade-in-up pb-10">
        <button 
          onClick={() => setActiveDoc(null)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 mb-6 group"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:-translate-x-1 transition-transform">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Info
        </button>
        
        <div className="bg-card p-6 rounded-2xl border border-subtle prose prose-invert prose-sm max-w-none">
          {content.split('\n').map((line, i) => {
            if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-black mb-4 uppercase tracking-tight text-white">{line.replace('# ', '')}</h1>;
            if (line.startsWith('## ')) return <h2 key={i} className="text-sm font-black mt-6 mb-3 uppercase text-purple-400 tracking-widest">{line.replace('## ', '')}</h2>;
            if (line.startsWith('- ')) return <li key={i} className="text-xs text-secondary mb-2 list-none flex gap-2"><span>•</span> {line.replace('- ', '')}</li>;
            if (!line.trim()) return <br key={i} />;
            return <p key={i} className="text-xs text-muted leading-relaxed mb-3">{line}</p>;
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 animate-fade-in">
      {/* ... previous content ... */}
      <section>
        <h2 className="text-2xl font-black mb-4 gradient-text tracking-tight">HOW IT WORKS</h2>
        <div className="bg-card p-5 rounded-2xl border border-subtle text-left">
          <p className="text-sm text-secondary leading-relaxed mb-4">
            Task Shredder AI uses advanced Groq Cloud models to break down your overwhelming goals into 5 clear, actionable steps.
          </p>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold flex-shrink-0">1</div>
              <p className="text-xs text-muted flex-1">Enter a big goal like "Build a Startup" or "Learn React".</p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold flex-shrink-0">2</div>
              <p className="text-xs text-muted flex-1">AI Shredder generates 5 focused Pomodoro sessions.</p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold flex-shrink-0">3</div>
              <p className="text-xs text-muted flex-1">Execute each step using the integrated 25-minute timer.</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-black mb-4 text-slate-400 tracking-tight">THE POMODORO METHOD</h2>
        <div className="bg-card p-5 rounded-2xl border border-subtle text-left">
          <p className="text-xs text-muted leading-relaxed">
            The Pomodoro Technique is a time management method that uses a timer to break work into intervals, traditionally 25 minutes in length, separated by short breaks. Task Shredder AI automates the planning phase so you can jump straight into the work.
          </p>
        </div>
      </section>

      <section className="pt-2">
        <div className="flex flex-col gap-3">
          <button 
             onClick={() => window.open('https://t.me/Kalai_Developer', '_blank')}
             className="w-full bg-slate-800/50 border border-white/5 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
          >
            Contact Developer
          </button>
          <div className="flex gap-3">
            <button 
              onClick={() => setActiveDoc('privacy')}
              className="flex-1 bg-slate-800/30 border border-white/5 py-3 rounded-xl text-[10px] font-bold text-slate-500 uppercase transition-all active:scale-95 hover:text-slate-300"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => setActiveDoc('terms')}
              className="flex-1 bg-slate-800/30 border border-white/5 py-3 rounded-xl text-[10px] font-bold text-slate-500 uppercase transition-all active:scale-95 hover:text-slate-300"
            >
              Terms of Use
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
