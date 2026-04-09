import React from 'react';

export default function Hero({ onStart }) {
  return (
    <div className="flex flex-col items-center text-center px-4 py-8 md:py-16 animate-fade-in-up">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          Next-Gen AI Productivity
        </div>
        <h1 className="text-4xl md:text-6xl font-black leading-[1.05] tracking-tight mb-6">
          Shred big tasks<br/>
          <span className="gradient-text">into simple steps</span>
        </h1>
        <p className="text-base md:text-lg text-slate-400 max-w-sm mx-auto leading-relaxed font-medium">
          The AI-powered task shredder. Convert overwhelming projects into bite-sized Pomodoro sessions.
        </p>
      </div>

      <button 
        onClick={onStart}
        className="btn-gradient w-full max-w-xs py-4.5 text-lg font-black shadow-xl shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        style={{ borderRadius: 18 }}
      >
        <span>Start Breaking Tasks</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>

      <div className="mt-12 flex items-center justify-center gap-8 opacity-30 grayscale saturate-0 pointer-events-none">
        <div className="flex flex-col items-center">
            <span className="text-2xl font-black tracking-tighter">50K+</span>
            <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">Goals Shredded</span>
        </div>
        <div className="w-px h-10 bg-white/10" />
        <div className="flex flex-col items-center">
            <span className="text-2xl font-black tracking-tighter">4.9/5</span>
            <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">Rating</span>
        </div>
      </div>
    </div>
  );
}
