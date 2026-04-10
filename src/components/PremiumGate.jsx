// PremiumGate — shows upgrade UI for free users, renders children for premium users.
// Usage: wrap any premium feature in <PremiumGate isPremium={isPremium} feature="Full History" onUpgrade={handler}>

export default function PremiumGate({ isPremium, feature = 'Premium Feature', onUpgrade, children, blur = false }) {
  if (isPremium) return children;

  if (blur) {
    return (
      <div className="relative rounded-3xl overflow-hidden">
        {/* Blurred preview of the content */}
        <div className="pointer-events-none select-none" style={{ filter: 'blur(5px)', opacity: 0.35 }}>
          {children}
        </div>
        {/* Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl"
          style={{ background: 'rgba(5,5,16,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="text-3xl">⭐</div>
          <p className="text-sm font-black text-white text-center px-4">{feature}</p>
          <p className="text-[11px] text-slate-400 text-center px-6">Upgrade to Premium to unlock this.</p>
          <button
            onClick={onUpgrade}
            className="btn-gradient px-6 py-2.5 text-sm font-black rounded-2xl shadow-lg shadow-purple-500/20 mt-1"
          >
            ⭐ Go Premium
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onUpgrade}
      className="w-full flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-95"
      style={{ background: 'rgba(139,92,246,0.05)', borderColor: 'rgba(139,92,246,0.2)' }}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">🔒</span>
        <div className="text-left">
          <p className="text-sm font-bold text-slate-200">{feature}</p>
          <p className="text-[11px] text-slate-500">Premium only</p>
        </div>
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl"
        style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--purple-light)' }}>
        ⭐ Upgrade
      </span>
    </button>
  );
}
