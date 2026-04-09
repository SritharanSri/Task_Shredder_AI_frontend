import React, { useState, useRef, useEffect } from 'react';

const TaskInput = React.memo(function TaskInput({ onBreakdown, isLoading }) {
  const [task, setTask] = useState('');
  const [debouncedTask, setDebouncedTask] = useState('');
  const textareaRef = useRef(null);

  // Debounce logic
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
      el.style.height = Math.min(el.scrollHeight, 150) + 'px';
    }
  };

  return (
    <div className="animate-fade-in-up" style={{ opacity: 0, animationFillMode: 'forwards' }}>
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-[24px] blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-focus-within:duration-200"></div>
        <div className="relative glass-card p-4 pb-1" style={{ borderRadius: 24 }}>
          <div className="flex gap-3 items-start">
             <div className="mt-3 text-purple-400">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
               </svg>
             </div>
             <textarea
                ref={textareaRef}
                value={task}
                onChange={handleInput}
                onKeyDown={handleKey}
                placeholder="Enter your task (e.g. Build a website)"
                disabled={isLoading}
                rows={2}
                className="premium-input resize-none py-3"
                style={{ minHeight: 52, fontSize: 16 }}
              />
          </div>
          
          <div className="flex items-center gap-2 px-8 py-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {task.length > 0 ? `${task.length} characters` : 'AI Breakdown Ready'}
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!task.trim() || isLoading}
        className="btn-gradient w-full mt-4 py-4 text-lg font-bold flex items-center justify-center gap-3 disabled:opacity-40 disabled:grayscale"
        style={{ borderRadius: 20 }}
      >
        {isLoading ? (
          <>
            <svg
              width="20" height="20"
              viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="3"
              strokeLinecap="round" strokeLinejoin="round"
              className="animate-spin-slow"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            AI is breaking your task...
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Generate Steps
          </>
        )}
      </button>

      <p className="text-center mt-4 text-[11px] font-medium text-slate-500 uppercase tracking-tighter">
        Guaranteed result in &lt; 5 seconds
      </p>
    </div>
  );
});

export default TaskInput;
