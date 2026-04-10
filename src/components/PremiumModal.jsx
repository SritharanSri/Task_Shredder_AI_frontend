import { useMemo, useState } from 'react';

const plans = [
  {
    id: 'pro_plan',
    name: 'Pro',
    stars: 300,
    anchor: true,
    badge: 'High Value',
    benefits: ['Advanced AI breakdown', 'Smart modes: Focus / Deep Work / Lazy', 'Priority ranking + motivation tips'],
  },
  {
    id: 'starter_plan',
    name: 'Starter',
    stars: 100,
    anchor: false,
    badge: 'Most Popular',
    benefits: ['Unlimited task generation', 'Save task history', 'Copy / share output', 'Fast response mode'],
  },
  {
    id: 'basic_boost',
    name: 'Basic',
    stars: 50,
    anchor: false,
    badge: null,
    benefits: ['Small support pack', '+10 AI credits'],
  },
];

export default function PremiumModal({ onClose, onBuy, buyLoading }) {
  const [selectedPlan, setSelectedPlan] = useState('starter_plan');

  const active = useMemo(
    () => plans.find((p) => p.id === selectedPlan) || plans[1],
    [selectedPlan],
  );

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    zIndex: 12000,
    background: 'rgba(5,5,16,0.85)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: '0 0 max(12px, env(safe-area-inset-bottom))',
  };

  const sheetStyle = {
    background: 'var(--bg-secondary)',
    border: '1px solid rgba(139,92,246,0.25)',
    borderRadius: '24px 24px 0 0',
    padding: '22px 18px max(30px, calc(env(safe-area-inset-bottom) + 12px))',
    width: '100%',
    maxWidth: 520,
    maxHeight: 'calc(100dvh - 12px)',
    overflowY: 'auto',
  };

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={sheetStyle}>
        <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, margin: '0 auto 16px' }} />

        <div className="text-center mb-4">
          <div style={{ fontSize: 34 }}>⭐</div>
          <h2 className="text-xl font-black mt-1" style={{ color: 'var(--text-primary)' }}>
            You&apos;re becoming productive 🔥
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Unlock unlimited mode with Telegram Stars in one tap.
          </p>
        </div>

        <div className="glass-card p-3 rounded-2xl mb-4" style={{ borderColor: 'rgba(139,92,246,0.22)' }}>
          <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Free plan limits</p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
            <div>• 5 AI tasks / day</div>
            <div>• Basic breakdown only</div>
            <div>• No history saving</div>
            <div>• No advanced modes</div>
          </div>
        </div>

        {/* Anchoring order: Pro first, Starter middle (default), Basic last */}
        <div className="space-y-2.5 mb-4">
          {plans.map((plan) => {
            const selected = selectedPlan === plan.id;
            const isPopular = plan.id === 'starter_plan';

            return (
              <button
                key={plan.id}
                type="button"
                disabled={buyLoading}
                onClick={() => setSelectedPlan(plan.id)}
                className="w-full text-left p-3 rounded-2xl relative transition-all active:scale-95"
                style={{
                  background: selected ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
                  border: selected ? '1px solid rgba(139,92,246,0.45)' : '1px solid rgba(255,255,255,0.08)',
                  opacity: buyLoading ? 0.6 : 1,
                  boxShadow: selected ? '0 0 24px rgba(139,92,246,0.20)' : 'none',
                }}
              >
                {plan.badge && (
                  <span
                    className="absolute top-2.5 right-2.5 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide"
                    style={{
                      background: isPopular
                        ? 'linear-gradient(90deg,#8b5cf6,#06b6d4)'
                        : 'rgba(255,255,255,0.10)',
                      color: '#fff',
                    }}
                  >
                    {plan.badge}
                  </span>
                )}

                <div className="flex items-center justify-between pr-24">
                  <p className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>{plan.name}</p>
                  <p className="font-black text-sm" style={{ color: '#a78bfa' }}>{plan.stars} ⭐</p>
                </div>

                <div className="mt-1 space-y-0.5">
                  {plan.benefits.slice(0, 2).map((b) => (
                    <p key={b} className="text-[11px]" style={{ color: 'var(--text-muted)' }}>• {b}</p>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <div className="glass-card p-3 rounded-2xl mb-4" style={{ borderColor: 'rgba(6,182,212,0.25)' }}>
          <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Selected: {active.name}
          </p>
          <div className="mt-2 space-y-1">
            {active.benefits.map((b) => (
              <p key={b} className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>✓ {b}</p>
            ))}
          </div>
        </div>

        {/* One primary CTA only */}
        <button
          onClick={() => onBuy(selectedPlan)}
          disabled={buyLoading}
          className="btn-gradient w-full py-3.5 rounded-2xl text-sm font-black tracking-wide disabled:opacity-60"
        >
          {buyLoading ? 'Opening Telegram checkout…' : `🔥 Unlock ${active.name} · ${active.stars}⭐`}
        </button>

        <button
          onClick={onClose}
          className="w-full py-2.5 mt-2 text-xs font-medium rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
        >
          Continue with free plan
        </button>
      </div>
    </div>
  );
}
