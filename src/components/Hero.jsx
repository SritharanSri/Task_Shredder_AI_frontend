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
          Break your big tasks<br/>
          <span className="gradient-text">into simple steps with AI</span>
        </h1>
        <p className="text-base md:text-lg max-w-sm mx-auto leading-relaxed font-medium" style={{ color: 'var(--text-secondary)' }}>
          The ultimate AI task shredder. Convert overwhelming goals into bite-sized actionable Pomodoro sessions.
        </p>
      </div>

      <button
        onClick={onStart}
        className="btn-gradient w-full max-w-xs py-4 text-lg font-black shadow-xl shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        style={{ borderRadius: 18 }}
      >
        <span>Start Breaking Tasks</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
