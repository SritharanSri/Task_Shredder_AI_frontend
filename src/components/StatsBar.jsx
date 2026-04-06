export default function StatsBar({ streak, credits, completed, todaySessions }) {
  return (
    <div className="grid grid-cols-4 gap-2 mt-6">
      <div className="stat-card">
        <div style={{ fontSize: 20 }}>🔥</div>
        <div className="text-lg font-bold" style={{ color: '#fb923c', lineHeight: 1 }}>{streak}</div>
        <div className="text-center" style={{ fontSize: 10, color: 'var(--text-muted)' }}>Streak</div>
      </div>
      <div className="stat-card">
        <div style={{ fontSize: 20 }}>✅</div>
        <div className="text-lg font-bold gradient-text" style={{ lineHeight: 1 }}>{completed}</div>
        <div className="text-center" style={{ fontSize: 10, color: 'var(--text-muted)' }}>Total</div>
      </div>
      <div className="stat-card">
        <div style={{ fontSize: 20 }}>⏱️</div>
        <div className="text-lg font-bold" style={{ color: '#67e8f9', lineHeight: 1 }}>{todaySessions}</div>
        <div className="text-center" style={{ fontSize: 10, color: 'var(--text-muted)' }}>Today</div>
      </div>
      <div className="stat-card">
        <div style={{ fontSize: 20 }}>⚡</div>
        <div className="text-lg font-bold" style={{ color: '#fbbf24', lineHeight: 1 }}>{credits}</div>
        <div className="text-center" style={{ fontSize: 10, color: 'var(--text-muted)' }}>Credits</div>
      </div>
    </div>
  );
}
