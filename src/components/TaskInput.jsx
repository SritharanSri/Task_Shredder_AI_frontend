import { useState, useRef } from 'react';

export default function TaskInput({ onBreakdown, isLoading }) {
  const [task, setTask] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = () => {
    if (!task.trim() || isLoading) return;
    onBreakdown(task.trim());
    setTask('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e) => {
    setTask(e.target.value);
    // Auto-resize textarea
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }
  };

  return (
    <div className="animate-fade-in-up" style={{ opacity: 0, animationFillMode: 'forwards' }}>
      {/* Label */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
          What's your goal today?
        </h2>
        <span className="badge badge-cyan">AI Powered</span>
      </div>

      {/* Input card */}
      <div className="glow-border">
        <div
          className="glass-card p-4"
          style={{ borderRadius: 20 }}
        >
          <textarea
            ref={textareaRef}
            value={task}
            onChange={handleInput}
            onKeyDown={handleKey}
            placeholder="e.g. Build a landing page for my startup..."
            disabled={isLoading}
            rows={2}
            className="premium-input resize-none"
            style={{ minHeight: 52, lineHeight: 1.6 }}
          />

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Breaks into 5 Pomodoro steps
            </div>

            <button
              onClick={handleSubmit}
              disabled={!task.trim() || isLoading}
              className="btn-gradient flex items-center gap-2 px-4 py-2 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ borderRadius: 12, height: 38 }}
            >
              {isLoading ? (
                <>
                  <svg
                    width="14" height="14"
                    viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"
                    className="animate-spin-slow"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Breaking…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  Break it Down
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tip */}
      <p className="text-center mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
        Press <kbd style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace' }}>Enter</kbd> to analyze your task
      </p>
    </div>
  );
}
