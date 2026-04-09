import React from 'react';

export default function Hero({ onStart }) {
  return (
    <div className="flex flex-col items-center text-center px-4 py-12 animate-fade-in-up">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-4">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          AI Powered Productivity
        </div>
        <h1 className="text-4xl md:text-5xl font-black leading-[1.1] tracking-tight mb-4">
          Break your <span className="gradient-text">big tasks</span> into simple steps with AI
        </h1>
        <p className="text-lg text-slate-400 max-w-sm mx-auto leading-relaxed">
          The ultimate Pomodoro-powered task shredder. Crush your goals one 25-minute slice at a time.
        </p>
      </div>

      <button 
        onClick={onStart}
        className="btn-gradient w-full max-w-xs py-4 text-lg font-bold shadow-lg shadow-purple-500/20 animate-pulse-glow"
      >
        Start Breaking Tasks
      </button>

      <div className="mt-8 flex items-center gap-6 opacity-40 grayscale pointer-events-none">
        <div className="flex flex-col items-center">
            <span className="text-xl font-bold">50k+</span>
            <span className="text-[10px] uppercase font-bold tracking-widest">Tasks Broken</span>
        </div>
        <div className="w-px h-8 bg-white/20" />
        <div className="flex flex-col items-center">
            <span className="text-xl font-bold">4.9/5</span>
            <span className="text-[10px] uppercase font-bold tracking-widest">User Rating</span>
        </div>
      </div>
    </div>
  );
}
