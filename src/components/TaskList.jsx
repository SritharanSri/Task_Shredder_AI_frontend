import React from 'react';

const TaskList = React.memo(function TaskList({ 
  tasks, 
  activeTaskId, 
  isTimerRunning, 
  onTaskComplete, 
  onTaskStart, 
  isLoading,
  onReset,
  onCopy
}) {
  if (isLoading) {
    return (
      <div className="mt-8 space-y-4 animate-fade-in-up">
        <div className="flex items-center justify-center gap-3 mb-6">
           <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0s' }} />
           <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
           <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
           <span className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-2">AI is breaking your task...</span>
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
    <div className="mt-10 animate-fade-in-up pb-12">
      {/* Progress Header */}
      <div className="glass-card p-6 mb-8 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
        <div className="flex items-center justify-between mb-4">
          <div>
             <h3 className="text-xl font-black">Your Action Plan</h3>
             <p className="text-xs text-slate-400 font-medium">5 Focused Pomodoro Sessions</p>
          </div>
          <div className="text-right">
             <div className="text-2xl font-black gradient-text">{progress}%</div>
             <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">{completed}/{total} Complete</div>
          </div>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Task Cards */}
      <div className="space-y-3">
        {tasks.map((task, index) => {
          const isActive = activeTaskId === task.id;
          const isDone = task.completed;

          return (
            <div
              key={task.id}
              onClick={() => !isDone && onTaskStart(task.id)}
              className={`group relative overflow-hidden transition-all duration-300 ${
                isDone 
                  ? 'opacity-60 scale-[0.98]' 
                  : isActive 
                    ? 'ring-2 ring-purple-500 bg-purple-500/10 -translate-y-1' 
                    : 'hover:bg-white/5 hover:-translate-y-0.5'
              } glass-card p-4 cursor-pointer`}
              style={{ borderRadius: 16, animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-4">
                {/* Number/Check */}
                <div 
                  className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${
                    isDone 
                      ? 'bg-green-500 text-white' 
                      : isActive 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-white/5 text-slate-400 group-hover:bg-white/10'
                  }`}
                >
                  {isDone ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (index + 1)}
                </div>

                {/* Text */}
                <div className="flex-1">
                  <h4 className={`text-[15px] font-bold leading-tight ${isDone ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 opacity-60">
                    <span className="text-[10px] uppercase font-black tracking-widest">25 Min Focus</span>
                  </div>
                </div>

                {/* Interactive Checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskComplete(task.id);
                  }}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isDone 
                      ? 'bg-green-500 border-green-500 scale-110' 
                      : 'border-white/20 group-hover:border-purple-500/50'
                  }`}
                >
                  {isDone && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Active Indicator */}
              {isActive && !isDone && (
                <div className="absolute top-0 right-0 py-1 px-3 bg-purple-500 text-[9px] font-black uppercase tracking-widest text-white rounded-bl-lg animate-pulse">
                  Now Playing
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Engagement Loop */}
      <div className="mt-10 grid grid-cols-2 gap-3">
        <button
          onClick={onReset}
          className="flex flex-col items-center justify-center gap-2 p-4 glass-card border-white/5 hover:bg-white/5 transition-all active:scale-95"
          style={{ borderRadius: 16 }}
        >
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-300">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
               <path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" />
               <path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" />
             </svg>
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">New Task</span>
        </button>

        <button
          onClick={onCopy}
          className="flex flex-col items-center justify-center gap-2 p-4 glass-card border-white/5 hover:bg-white/5 transition-all active:scale-95"
          style={{ borderRadius: 16 }}
        >
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-300">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
               <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
               <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
             </svg>
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Copy Plan</span>
        </button>
      </div>

      <button
        onClick={() => window.open('https://t.me/share/url?url=' + encodeURIComponent(window.location.href), '_blank')}
        className="w-full mt-3 py-4 glass-card border-purple-500/20 text-purple-400 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all hover:bg-purple-500/10"
        style={{ borderRadius: 16 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        Share with Friends
      </button>
    </div>
  );
});

export default TaskList;
