const plans = [
  {
    id: 'premium_monthly',
    label: 'Monthly',
    price: '299 Stars',
    desc: 'Billed every month',
    badge: null,
  },
  {
    id: 'premium_annual',
    label: 'Annual',
    price: '1,999 Stars',
    desc: 'Save ~44% vs monthly',
    badge: 'Best Value',
  },
  {
    id: 'premium_lifetime',
    label: 'Lifetime',
    price: '2,499 Stars',
    desc: 'Pay once, keep forever',
    badge: 'Most Popular',
  },
];

const features = [
  '∞ Unlimited AI task breakdowns per day',
  '⚡ Up to 500 credits',
  '🕐 Custom Pomodoro durations (15 / 25 / 50 min)',
  '📊 Full 7-day productivity chart',
  '🔄 Streak restore (never lose your streak)',
  '🏅 Premium badge on your profile',
  '🚫 No forced ads',
];

export default function PremiumModal({ onClose, onBuy, buyLoading }) {
  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    background: 'rgba(5,5,16,0.85)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: '0 0 env(safe-area-inset-bottom)',
  };

  const sheetStyle = {
    background: 'var(--bg-secondary)',
    border: '1px solid rgba(139,92,246,0.25)',
    borderRadius: '24px 24px 0 0',
    padding: '24px 20px 32px',
    width: '100%',
    maxWidth: 520,
    maxHeight: '90dvh',
    overflowY: 'auto',
  };

  return (
    <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={sheetStyle}>
        {/* Handle */}
        <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, margin: '0 auto 20px' }} />

        {/* Header */}
        <div className="text-center mb-5">
          <div style={{ fontSize: 40 }}>⭐</div>
          <h2 className="text-xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>
            Task Shredder Premium
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Unlock your full productivity potential
          </p>
        </div>

        {/* Feature list */}
        <div className="mb-5 space-y-2">
          {features.map(f => (
            <div key={f} className="flex items-start gap-2">
              <span style={{ color: '#a78bfa', fontSize: 14, marginTop: 1 }}>✓</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Plan cards */}
        <div className="space-y-3 mb-5">
          {plans.map(plan => (
            <button
              key={plan.id}
              disabled={buyLoading}
              onClick={() => onBuy(plan.id)}
              className="w-full text-left p-4 rounded-2xl relative transition-all active:scale-95"
              style={{
                background: plan.badge ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
                border: plan.badge ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.08)',
                opacity: buyLoading ? 0.6 : 1,
              }}
            >
              {plan.badge && (
                <span className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'linear-gradient(90deg,#8b5cf6,#06b6d4)', color: '#fff' }}>
                  {plan.badge}
                </span>
              )}
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{plan.label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{plan.desc}</p>
              <p className="font-bold mt-1" style={{ color: '#a78bfa', fontSize: 15 }}>{plan.price}</p>
            </button>
          ))}
        </div>

        {/* Dismiss */}
        <button
          onClick={onClose}
          className="w-full py-3 text-sm font-medium rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
