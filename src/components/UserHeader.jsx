import { useEffect, useRef, useState } from 'react';

export default function UserHeader({ user, credits, coins = 0, isDarkMode, onToggleTheme, isPremium }) {
  if (!user) return null;

  const initial = user.firstName?.[0]?.toUpperCase() || '?';

  // Animate coin badge when coins value increases
  const prevCoins = useRef(coins);
  const [coinPop, setCoinPop] = useState(false);
  useEffect(() => {
    if (coins > prevCoins.current) {
      setCoinPop(true);
      const t = setTimeout(() => setCoinPop(false), 600);
      prevCoins.current = coins;
      return () => clearTimeout(t);
    }
    prevCoins.current = coins;
  }, [coins]);

  return (
    <header className="flex items-center justify-between mb-8">
      {/* Left: Avatar + Name */}
      <div className="flex items-center gap-3">
        <div className="relative">
          {user.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={user.firstName}
              className="rounded-full object-cover shadow-lg border-2 border-purple-500/30"
              style={{ width: 44, height: 44 }}
            />
          ) : (
            <div
              className="rounded-full flex items-center justify-center text-sm font-bold shadow-lg shadow-purple-500/20"
              style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', color: 'white' }}
            >
              {initial}
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>{user.firstName}</span>
            {isPremium && (
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest"
                style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.3),rgba(6,182,212,0.3))', color: 'var(--purple-light)', border: '1px solid rgba(139,92,246,0.3)' }}>
                ⭐ PRO
              </span>
            )}
          </div>
          <div className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
            {user.username ? `@${user.username}` : 'Pro Member'}
          </div>
        </div>
      </div>

      {/* Right: Coins + Credits + Theme toggle */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-end gap-1">
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-sm">
            <span className="text-sm font-black gradient-text tracking-tight">SHREDDER AI</span>
          </div>

          {/* Coin balance */}
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(234,179,8,0.1)',
              border: '1px solid rgba(234,179,8,0.25)',
              transform: coinPop ? 'scale(1.18)' : 'scale(1)',
              transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            <span
              className="text-[10px] font-black tracking-widest uppercase"
              style={{ color: '#eab308' }}
            >
              🪙 {coins} Coins
            </span>
          </div>

          {/* Credits */}
          <div className="flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
            <span className="text-[10px] text-cyan-400 font-black tracking-widest uppercase">⚡ {credits} Credits</span>
          </div>
        </div>

        {/* Theme toggle — proper 44×44 touch target */}
        <button
          onClick={onToggleTheme}
          className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 transition-all active:scale-95 hover:bg-white/10"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ color: 'var(--text-muted)' }} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
