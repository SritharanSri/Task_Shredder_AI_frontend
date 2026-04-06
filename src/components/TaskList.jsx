export default function TaskList({ tasks, activeTaskId, onTaskComplete, onTaskStart, isLoading }) {
  if (isLoading) {
    return (
      <div className="mt-6 space-y-3 animate-fade-in-up" style={{ opacity: 0, animationFillMode: 'forwards' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            AI is analyzing…
          </span>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="shimmer" style={{ height: 64, animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) return null;

  const completed = tasks.filter(t => t.completed).length;
  const pct = Math.round((completed / tasks.length) * 100);

  return (
    <div className="mt-6 animate-fade-in-up" style={{ opacity: 0, animationFillMode: 'forwards', animationDelay: '0.15s' }}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Pomodoro Breakdown
        </span>
        <span className="badge badge-purple">{completed}/{tasks.length} done</span>
      </div>

      {/* Overall progress */}
      <div className="rounded-full overflow-hidden mb-4" style={{ height: 4, background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
            transition: 'width 0.6s ease',
          }}
        />
      </div>

      {/* Task items */}
      <div className="space-y-2">
        {tasks.map((task, index) => {
          const isActive = activeTaskId === task.id;

          return (
            <div
              key={task.id}
              className={`task-item ${isActive ? 'active' : ''} ${task.completed ? 'completed' : ''}`}
              style={{
                animationDelay: `${index * 0.07}s`,
                padding: '14px 16px',
              }}
              onClick={() => !task.completed && onTaskStart(task.id)}
            >
              <div className="flex items-center gap-3">
                {/* Step number */}
                <div
                  className="flex-shrink-0 flex items-center justify-center rounded-lg text-xs font-bold"
                  style={{
                    width: 28, height: 28,
                    background: isActive
                      ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)'
                      : 'rgba(255,255,255,0.06)',
                    color: isActive ? 'white' : 'var(--text-muted)',
                  }}
                >
                  {task.completed ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (index + 1)}
                </div>

                {/* Text */}
                <p
                  className="flex-1 text-sm font-medium leading-snug"
                  style={{
                    color: task.completed ? 'var(--text-muted)' : isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    textDecoration: task.completed ? 'line-through' : 'none',
                  }}
                >
                  {task.title}
                </p>

                {/* Action area */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isActive && !task.completed && (
                    <span className="badge badge-purple" style={{ fontSize: 10 }}>Active</span>
                  )}

                  {/* Check button */}
                  <div
                    role="button"
                    className={`check-circle ${task.completed ? 'done' : ''}`}
                    onClick={(e) => { e.stopPropagation(); onTaskComplete(task.id); }}
                  >
                    {task.completed && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>

              {/* Session info row */}
              <div className="flex items-center gap-2 mt-2" style={{ marginLeft: 40 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>25 min session</span>
                {isActive && (
                  <>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>·</span>
                    <span style={{ fontSize: 11, color: 'var(--purple-light)' }}>Timer running 🔥</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
