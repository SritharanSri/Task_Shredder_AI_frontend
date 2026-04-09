import React from 'react';

export default function About() {
  return (
    <div className="space-y-8 pb-10 animate-fade-in">
      <section>
        <h2 className="text-2xl font-black mb-4 gradient-text tracking-tight">HOW IT WORKS</h2>
        <div className="bg-card p-5 rounded-2xl border border-subtle">
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
        <div className="bg-card p-5 rounded-2xl border border-subtle">
          <p className="text-xs text-muted leading-relaxed">
            The Pomodoro Technique is a time management method that uses a timer to break work into intervals, traditionally 25 minutes in length, separated by short breaks. Task Shredder AI automates the planning phase so you can jump straight into the work.
          </p>
        </div>
      </section>

      <section className="pt-2">
        <div className="flex flex-col gap-3">
          <button 
             onClick={() => window.open('https://t.me/Kalai_Developer', '_blank')}
             className="w-full bg-slate-800/50 border border-white/5 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
          >
            Contact Developer
          </button>
          <div className="flex gap-3">
            <button className="flex-1 bg-slate-800/30 border border-white/5 py-3 rounded-xl text-[10px] font-bold text-slate-500 uppercase">Privacy Policy</button>
            <button className="flex-1 bg-slate-800/30 border border-white/5 py-3 rounded-xl text-[10px] font-bold text-slate-500 uppercase">Terms of Use</button>
          </div>
        </div>
      </section>
    </div>
  );
}
