import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

const MEDAL = ['🥇', '🥈', '🥉'];

export default function Leaderboard({ currentUserId }) {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`${API_BASE}/leaderboard`)
      .then(r => r.json())
      .then(data => {
        if (!cancelled) {
          if (Array.isArray(data)) setBoard(data);
          else setError('Failed to load leaderboard');
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) { setError('Network error'); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-6 flex justify-center items-center gap-3" style={{ minHeight: 120 }}>
        <div
          className="w-6 h-6 rounded-full border-2 border-t-purple-500"
          style={{ borderLeftColor: 'transparent', animation: 'spin 0.7s linear infinite' }}
        />
        <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Loading leaderboard…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-5 text-center">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{error}</p>
      </div>
    );
  }

  if (board.length === 0) {
    return (
      <div className="glass-card p-5 text-center">
        <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
          No coin earners yet. Watch an ad to be first! 🪙
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 animate-fade-in-up" style={{ opacity: 0, animationFillMode: 'forwards' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
          🏆 Coin Leaderboard
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Top 10
        </span>
      </div>

      <div className="space-y-2">
        {board.map((entry) => {
          const isMe = entry.userId === currentUserId || entry.telegramId === currentUserId;
          const medal = MEDAL[entry.rank - 1];
          return (
            <div
              key={entry.userId}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
              style={{
                background: isMe
                  ? 'linear-gradient(90deg,rgba(139,92,246,0.15),rgba(6,182,212,0.1))'
                  : 'rgba(255,255,255,0.03)',
                border: isMe
                  ? '1px solid rgba(139,92,246,0.3)'
                  : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* Rank */}
              <span
                className="text-base font-black shrink-0"
                style={{ width: 24, textAlign: 'center', color: medal ? undefined : 'var(--text-muted)' }}
              >
                {medal || `#${entry.rank}`}
              </span>

              {/* User ID (truncated) */}
              <span
                className="flex-1 text-xs font-semibold truncate"
                style={{ color: isMe ? 'var(--purple-light)' : 'var(--text-secondary)' }}
              >
                {isMe ? 'You' : `User …${String(entry.userId).slice(-6)}`}
              </span>

              {/* Coins */}
              <span
                className="text-xs font-black shrink-0"
                style={{ color: '#eab308' }}
              >
                🪙 {entry.coins}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
