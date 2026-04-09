import React, { useState, useRef, useEffect } from 'react';

const TaskInput = React.memo(function TaskInput({ onBreakdown, isLoading }) {
  const [task, setTask] = useState('');
  const [debouncedTask, setDebouncedTask] = useState('');
  const textareaRef = useRef(null);

  // Debounce logic for potential secondary features
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTask(task);
    }, 500);
    return () => clearTimeout(timer);
  }, [task]);

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
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 180) + 'px';
    }
  };

  return (
    <div className="animate-fade-in-up w-full" style={{ opacity: 0, animationFillMode: 'forwards' }}>
      <div className="relative group mb-2">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-[24px] blur-sm opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
        <div className="relative glass-card bg-slate-900/40 p-5 pb-2" style={{ borderRadius: 24, border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex gap-4 items-start">
             <div className="mt-3.5 text-purple-400 opacity-60">
               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M12 2L2 7l10 5 10-5-10-5z" />
                 <path d="M2 17l10 5 10-5" />
                 <path d="M2 12l10 5 10-5" />
               </svg>
             </div>
             <textarea
                ref={textareaRef}
                value={task}
                onChange={handleInput}
                onKeyDown={handleKey}
                placeholder="What project are we shredding?"
                disabled={isLoading}
                rows={2}
                className="premium-input resize-none py-3 text-lg font-medium leading-relaxed"
                style={{ minHeight: 60, outline: 'none' }}
              />
          </div>
          
          <div className="flex items-center justify-between px-2 py-3 border-t border-white/5">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
               {task.length > 0 ? `${task.length} / 280` : 'AI ANALYSIS ACTIVE'}
            </span>
            <div className="flex gap-1.5 grayscale opacity-30">
               <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
               <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!task.trim() || isLoading}
        className="btn-gradient w-full py-5 text-lg font-black tracking-tight flex items-center justify-center gap-3 transition-all active:scale-[0.97] disabled:opacity-30 disabled:pointer-events-none shadow-2xl shadow-purple-500/10"
        style={{ borderRadius: 20 }}
      >
        {isLoading ? (
          <>
            <svg
              width="22" height="22"
              viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="3.5"
              strokeLinecap="round" strokeLinejoin="round"
              className="animate-spin"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <span className="animate-pulse">SHREDDING...</span>
          </>
        ) : (
          <>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            SHRED TASK
          </>
        )}
      </button>

      <p className="text-center mt-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] opacity-40">
        POWERED BY GROQ CLOUD
      </p>
    </div>
  );
});

export default TaskInput;
