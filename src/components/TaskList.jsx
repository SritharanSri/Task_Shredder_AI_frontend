import { memo } from 'react';
import { useTelegram } from '../hooks/useTelegram';

// ── TaskCard — memoized so only newly added/changed cards re-render ──
const TaskCard = memo(function TaskCard({ task, index, isActive, isDone, onTaskStart, onTaskComplete }) {
  return (
    <div
      key={task.id}
      onClick={() => !isDone && onTaskStart(task.id)}
      className={`group relative overflow-hidden transition-all duration-500 ${
        isDone
          ? 'opacity-40 grayscale scale-[0.98]'
          : isActive
            ? 'ring-2 ring-purple-500/50 bg-purple-500/5 -translate-y-1 shadow-2xl shadow-purple-500/10'
            : 'hover:bg-white/5 bg-slate-900/20 shadow-lg'
      } glass-card p-5 cursor-pointer border-white/5 rounded-3xl animate-fade-in-up`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="flex items-center gap-5">
        {/* Number/Check */}
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all shadow-inner ${
            isDone
              ? 'bg-green-500 text-white'
              : isActive
                ? 'bg-gradient-to-br from-purple-500 to-cyan-500 text-white'
                : 'bg-slate-800/80 text-slate-500 group-hover:text-slate-300'
          }`}
        >
          {isDone ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (index + 1)}
        </div>

        {/* Text Area */}
        <div className="flex-1 min-w-0">
          <h4 className={`text-[15px] font-bold leading-snug break-words ${isDone ? 'line-through text-slate-500' : 'text-slate-100'}`}>
            {task.title}
          </h4>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className={`text-[9px] uppercase font-black tracking-[0.2em] px-2 py-0.5 rounded-md ${isActive ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-slate-500'}`}>
              {isActive ? '⚡ SHREDDING NOW' : task.time ? `⏱ ${task.time}` : '25 MIN SESSION'}
            </span>
            {task.difficulty && (
              <span className="text-[9px] font-black tracking-wide px-2 py-0.5 rounded-md bg-white/5 text-slate-400">
                {task.difficulty}
              </span>
            )}
          </div>
          {task.motivation && !isDone && (
            <p className="text-[11px] text-slate-500 italic mt-1.5 leading-relaxed">
              💡 {task.motivation}
            </p>
          )}
        </div>

        {/* Interactive Checkbox */}
        <button
          onClick={(e) => { e.stopPropagation(); onTaskComplete(task.id); }}
          className={`w-10 h-10 -mr-2 flex items-center justify-center transition-all active:scale-90 ${
            isDone ? 'text-green-500' : 'text-slate-700 hover:text-purple-500'
          }`}
          aria-label="Complete task"
        >
          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
            isDone ? 'bg-green-500 border-green-500' : 'border-current'
          }`}>
            {isDone && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        </button>
      </div>

      {/* Decorative progress trace */}
      {isActive && !isDone && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500/20">
          <div className="h-full bg-purple-500 animate-[shimmer_2s_infinite]" style={{ width: '40%' }} />
        </div>
      )}
    </div>
  );
});

const TaskList = memo(function TaskList({
  tasks,
  activeTaskId,
  isTimerRunning,
  onTaskComplete,
  onTaskStart,
  isLoading,
  onReset,
  onCopy,
  onRegenerate
}) {
  const { openLink } = useTelegram();
  if (isLoading) {
    return (
      <div className="mt-8 space-y-4 animate-fade-in-up">
        <div className="flex items-center justify-center gap-3 mb-6">
           <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0s' }} />
           <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
           <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
           <span className="text-sm font-black text-slate-400 uppercase tracking-widest ml-2 animate-pulse">AI is shredding your task...</span>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="shimmer h-[72px] rounded-2xl" style={{ animationDelay: `${i * 0.1}s`, opacity: 0.5 }} />
        ))}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) return null;

  const completed = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const progress = Math.round((completed / total) * 100);

  return (
    <div className="mt-8 animate-fade-in-up pb-8 w-full max-w-full overflow-hidden">
      {/* Progress Header */}
      <div className="glass-card p-6 mb-10 border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-transparent shadow-xl shadow-purple-900/10" style={{ borderRadius: 24 }}>
        <div className="flex items-center justify-between mb-5">
          <div>
             <h3 className="text-xl font-black tracking-tight">Strategy Plan</h3>
             <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest opacity-60">5 Shredding Sessions</p>
          </div>
          <div className="text-right">
             <div className="text-3xl font-black gradient-text tracking-tighter">{progress}%</div>
             <div className="text-[9px] uppercase font-black tracking-[0.2em] text-cyan-500">{completed}/{total} SHREDDED</div>
          </div>
        </div>
        <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(139,92,246,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Task Cards — each rendered by memoized TaskCard; only changed cards re-render */}
      <div className="space-y-4">
        {tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            index={index}
            isActive={activeTaskId === task.id}
            isDone={task.completed}
            onTaskStart={onTaskStart}
            onTaskComplete={onTaskComplete}
          />
        ))}
      </div>

      {/* Engagement Loop */}
      <div className="mt-12 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-3 py-4 glass-card bg-slate-900/40 border-white/5 hover:bg-white/10 transition-all active:scale-95 group rounded-2xl min-h-[52px]"
          >
            <div className="text-slate-400 group-hover:text-purple-400 transition-colors">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M12 5v14M5 12h14" />
               </svg>
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">Shred New Task</span>
          </button>

          <button
            onClick={onCopy}
            className="flex items-center justify-center gap-3 py-4 glass-card bg-slate-900/40 border-white/5 hover:bg-white/10 transition-all active:scale-95 group rounded-2xl min-h-[52px]"
          >
            <div className="text-slate-400 group-hover:text-cyan-400 transition-colors">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                 <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                 <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
               </svg>
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">Copy Results</span>
          </button>
        </div>

        <button
          onClick={onRegenerate}
          className="w-full py-4 glass-card bg-purple-500/10 border-purple-500/30 text-purple-400 font-black uppercase tracking-[0.15em] text-[11px] flex items-center justify-center gap-3 transition-all active:scale-95 rounded-2xl min-h-[52px]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
             <path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" />
             <path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" />
          </svg>
          Regenerate Strategy
        </button>

        <button
          onClick={() => openLink('https://t.me/share/url?url=' + encodeURIComponent('https://t.me/TaskShredderBot') + '&text=' + encodeURIComponent('Check out Task Shredder AI — I just shredded my tasks! 🚀'))}
          className="w-full py-5 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-slate-200 font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all active:scale-98 rounded-2xl hover:bg-white/5 shadow-2xl shadow-purple-900/20"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          Share Shredded Strategy
        </button>
      </div>
    </div>
  );
}

export default TaskList;
