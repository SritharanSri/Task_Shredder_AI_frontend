import PremiumGate from './PremiumGate';

export default function StatsBar({ streak, credits, completed, todaySessions, isPremium, onUpgrade, dailyBreakdownsLeft, freeLimit }) {
  const statCards = [
    { icon: '🔥', value: `${streak} Days`, label: 'Current Streak', color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { icon: '✅', value: completed, label: 'Total Shredded', color: 'text-green-400', bg: 'bg-green-500/10' },
    { icon: '⏲️', value: todaySessions, label: "Today's Flow", color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { icon: '⚡', value: credits, label: 'AI Credits', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className="space-y-4">
      {/* Daily breakdown usage */}
      <div className="glass-card p-4 flex items-center justify-between" style={{ borderRadius: 20 }}>
        <div>
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Daily Shreds
          </p>
          {isPremium ? (
            <p className="text-lg font-black gradient-text">∞ Unlimited</p>
          ) : (
            <p className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
              {Math.max(0, freeLimit - (freeLimit - (dailyBreakdownsLeft || 0)))} / {freeLimit} used
            </p>
          )}
        </div>
        {isPremium ? (
          <span className="text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest"
            style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--purple-light)', border: '1px solid rgba(139,92,246,0.3)' }}>
            ⭐ Premium
          </span>
        ) : (
          <button onClick={onUpgrade} className="text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest transition-all active:scale-95"
            style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--purple-light)', border: '1px solid rgba(139,92,246,0.2)' }}>
            ⭐ Upgrade
          </button>
        )}
      </div>

      {/* Stat cards grid */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map(({ icon, value, label, color, bg }) => (
          <div key={label} className="glass-card rounded-3xl p-4 flex items-center gap-4 group shadow-lg">
            <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform`}>{icon}</div>
            <div>
              <div className={`text-xl font-black ${color} leading-tight`}>{value}</div>
              <div className="text-[10px] uppercase font-black tracking-widest" style={{ color: 'var(--text-muted)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 7-day chart — premium only */}
      <div className="mt-2">
        <PremiumGate isPremium={isPremium} feature="7-Day Productivity Chart" onUpgrade={onUpgrade} blur>
          <div className="glass-card p-5 rounded-3xl">
            <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
              This Week's Focus
            </p>
            <div className="flex items-end gap-2 h-16">
              {[4, 7, 3, 6, 5, 8, 2].map((v, i) => (
                <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-purple-500 to-cyan-500 opacity-70"
                  style={{ height: `${(v / 8) * 100}%`, minHeight: 4 }} />
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {['M','T','W','T','F','S','S'].map((d, i) => (
                <span key={i} className="flex-1 text-center text-[9px] font-black uppercase" style={{ color: 'var(--text-muted)' }}>{d}</span>
              ))}
            </div>
          </div>
        </PremiumGate>
      </div>
    </div>
  );
}
