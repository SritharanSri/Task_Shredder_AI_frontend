import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

/**
 * RewardPage — shown after AdsGram completes.
 *
 * Props:
 *  userId           – string  – the user who completed the ad
 *  onDone           – fn()   – called when user taps "Back to App"
 *  autoClose        – number – ms before auto-closing (default 3500, 0 = off)
 *  prefetchedResult – object – if provided, skip the API call and show success directly.
 *                              Used when WatchAdButton already claimed the reward so we
 *                              don't double-call /api/reward and hit the cooldown.
 */
export default function RewardPage({ userId, onDone, autoClose = 3500, prefetchedResult = null }) {
  // If the caller already has the server result, start in 'success' immediately.
  const [status, setStatus] = useState(prefetchedResult ? 'success' : 'loading');
  const [result, setResult] = useState(prefetchedResult);
  const [waitSeconds, setWaitSeconds] = useState(0);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    // Skip API call when result was pre-fetched by WatchAdButton
    if (prefetchedResult) return;

    if (!userId) {
      setStatus('error');
      return;
    }

    let cancelled = false;

    fetch(`${API_BASE}/reward`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) {
          setResult(data);
          setStatus('success');
        } else if (data.code === 'COOLDOWN') {
          setWaitSeconds(data.waitSeconds || 30);
          setStatus('cooldown');
        } else if (data.code === 'DAILY_LIMIT') {
          setStatus('limit');
        } else {
          setStatus('error');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => { cancelled = true; };
  }, [userId, prefetchedResult]);

  // Auto-close after success
  useEffect(() => {
    if (status !== 'success' || !autoClose) return;
    let secs = Math.ceil(autoClose / 1000);
    setCountdown(secs);
    const tick = setInterval(() => {
      secs -= 1;
      setCountdown(secs);
      if (secs <= 0) {
        clearInterval(tick);
        onDone?.();
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [status, autoClose, onDone]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* ── Loading ── */}
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-5 animate-fade-in">
          <div
            className="w-16 h-16 rounded-full border-4 border-t-purple-500 border-b-cyan-400"
            style={{ borderLeftColor: 'transparent', borderRightColor: 'transparent', animation: 'spin 0.8s linear infinite' }}
          />
          <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Verifying your reward…
          </p>
        </div>
      )}

      {/* ── Success ── */}
      {status === 'success' && result && (
        <div className="flex flex-col items-center gap-4 animate-fade-in-up">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg,rgba(139,92,246,0.25),rgba(6,182,212,0.25))',
              border: '2px solid rgba(139,92,246,0.4)',
              fontSize: 48,
              animation: 'coinPop 0.6s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            🪙
          </div>

          <div className="text-center">
            <h2
              className="text-2xl font-black gradient-text"
              style={{ animation: 'fadeInUp 0.4s 0.1s both' }}
            >
              🎉 You earned {result.coinsEarned} coins!
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)', animation: 'fadeInUp 0.4s 0.2s both' }}>
              Total balance: <strong style={{ color: 'var(--text-primary)' }}>{result.coins} 🪙</strong>
            </p>
            <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)', animation: 'fadeInUp 0.4s 0.3s both' }}>
              Today: {result.totalCoinsToday} / {result.dailyLimit} coins
            </p>
          </div>

          {/* Particle burst (CSS-only) */}
          <div className="relative w-0 h-0 pointer-events-none" aria-hidden="true">
            {[...Array(8)].map((_, i) => (
              <span
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: i % 2 === 0 ? '#8b5cf6' : '#06b6d4',
                  animation: `burst${i} 0.8s 0.2s both`,
                  '--angle': `${i * 45}deg`,
                }}
              />
            ))}
          </div>

          <button
            className="btn-gradient mt-4 px-8 py-3 font-semibold"
            onClick={onDone}
          >
            {countdown != null ? `Back to App (${countdown}s)` : 'Back to App'}
          </button>
        </div>
      )}

      {/* ── Cooldown ── */}
      {status === 'cooldown' && (
        <div className="flex flex-col items-center gap-4 text-center animate-fade-in">
          <span style={{ fontSize: 56 }}>⏱️</span>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Cooldown Active</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Watch your next ad in <strong style={{ color: 'var(--text-primary)' }}>{waitSeconds}s</strong>
          </p>
          <button className="btn-gradient mt-2 px-6 py-2.5 font-semibold" onClick={onDone}>
            Go Back
          </button>
        </div>
      )}

      {/* ── Daily limit ── */}
      {status === 'limit' && (
        <div className="flex flex-col items-center gap-4 text-center animate-fade-in">
          <span style={{ fontSize: 56 }}>🌙</span>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Daily Limit Reached</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            You&apos;ve earned the maximum 50 coins today. Come back tomorrow!
          </p>
          <button className="btn-gradient mt-2 px-6 py-2.5 font-semibold" onClick={onDone}>
            Go Back
          </button>
        </div>
      )}

      {/* ── Error ── */}
      {status === 'error' && (
        <div className="flex flex-col items-center gap-4 text-center animate-fade-in">
          <span style={{ fontSize: 56 }}>⚠️</span>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Something went wrong</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Could not process your reward. Please try again.
          </p>
          <button className="btn-gradient mt-2 px-6 py-2.5 font-semibold" onClick={onDone}>
            Go Back
          </button>
        </div>
      )}

      <style>{`
        @keyframes coinPop {
          from { transform: scale(0) rotate(-20deg); opacity: 0; }
          to   { transform: scale(1) rotate(0deg);   opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        ${[...Array(8)].map((_, i) => {
          const rad = (i * 45 * Math.PI) / 180;
          const x = Math.round(Math.cos(rad) * 50);
          const y = Math.round(Math.sin(rad) * 50);
          return `@keyframes burst${i} { from { transform: translate(0,0) scale(1); opacity:1; } to { transform: translate(${x}px,${y}px) scale(0); opacity:0; } }`;
        }).join('')}
      `}</style>
    </div>
  );
}
