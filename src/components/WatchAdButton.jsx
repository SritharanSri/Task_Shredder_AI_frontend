import { useState, useEffect, useCallback, useRef } from 'react';
import { showAdsgramAd } from '../services/adsgram';

const BLOCK_ID = import.meta.env.VITE_ADSGRAM_BLOCK_ID || 'YOUR_BLOCK_ID';

/**
 * WatchAdButton
 *
 * Props:
 *  userId          – string – current user ID
 *  onRewardClaimed – fn(result) – called after server confirms the reward
 *  dailyCoinsEarned – number   – coins earned today (from user state)
 *  dailyCoinLimit  – number    – daily cap (default 50)
 */
export default function WatchAdButton({
  userId,
  onRewardClaimed,
  dailyCoinsEarned = 0,
  dailyCoinLimit = 50,
}) {
  const [phase, setPhase] = useState('idle'); // 'idle' | 'loading' | 'waiting' | 'done'
  const [cooldown, setCooldown] = useState(0); // remaining cooldown in seconds
  const timerRef = useRef(null);

  // ── Restore cooldown from localStorage between renders ──
  useEffect(() => {
    const stored = parseInt(localStorage.getItem('adsgram_cooldown_until') || '0', 10);
    const remaining = Math.ceil((stored - Date.now()) / 1000);
    if (remaining > 0) {
      setCooldown(remaining);
      setPhase('waiting');
      startCooldownTimer(remaining);
    }
    return () => clearInterval(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCooldownTimer = useCallback((seconds) => {
    clearInterval(timerRef.current);
    let remaining = seconds;
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setCooldown(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        setPhase('idle');
        setCooldown(0);
      }
    }, 1000);
  }, []);

  const handleClick = useCallback(() => {
    if (phase !== 'idle' || !userId) return;
    setPhase('loading');

    showAdsgramAd({
      blockId: BLOCK_ID,
      onReward: () => {
        // Ad completed — claim reward from server
        setPhase('loading');
        const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

        fetch(`${API_BASE}/reward`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        })
          .then(async (res) => {
            const data = await res.json();
            if (res.ok) {
              onRewardClaimed?.(data);
              // Store cooldown end time in localStorage so it survives remounts
              const cooldownSecs = data.cooldownSeconds || 30;
              localStorage.setItem('adsgram_cooldown_until', String(Date.now() + cooldownSecs * 1000));
              setCooldown(cooldownSecs);
              setPhase('waiting');
              startCooldownTimer(cooldownSecs);
            } else if (data.code === 'COOLDOWN') {
              const wait = data.waitSeconds || 30;
              setCooldown(wait);
              setPhase('waiting');
              startCooldownTimer(wait);
            } else {
              setPhase('idle');
              onRewardClaimed?.({ error: data.error });
            }
          })
          .catch(() => {
            setPhase('idle');
          });
      },
      onError: (msg) => {
        console.warn('[WatchAdButton] ad error:', msg);
        setPhase('idle');
      },
    });
  }, [phase, userId, onRewardClaimed, startCooldownTimer]);

  const coinsLeft = dailyCoinLimit - dailyCoinsEarned;
  const limitReached = coinsLeft <= 0;

  // ── Derived UI ──
  let label, sublabel, disabled;
  if (limitReached) {
    label = '🌙 Daily limit reached';
    sublabel = 'Come back tomorrow';
    disabled = true;
  } else if (phase === 'loading') {
    label = 'Loading ad…';
    sublabel = null;
    disabled = true;
  } else if (phase === 'waiting') {
    label = `⏱ Next ad in ${cooldown}s`;
    sublabel = `${coinsLeft} coins left today`;
    disabled = true;
  } else {
    label = '📺 Watch Ad & Earn Coins';
    sublabel = `+10 🪙 · ${coinsLeft} left today`;
    disabled = false;
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className="w-full py-3 px-4 rounded-2xl font-semibold text-sm transition-all active:scale-95 flex flex-col items-center gap-0.5"
      style={{
        background: disabled
          ? 'rgba(255,255,255,0.05)'
          : 'linear-gradient(135deg,rgba(139,92,246,0.25),rgba(6,182,212,0.25))',
        border: disabled
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid rgba(139,92,246,0.35)',
        color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled && !phase.includes('waiting') && !limitReached ? 0.5 : 1,
      }}
    >
      <span>{label}</span>
      {sublabel && (
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
          {sublabel}
        </span>
      )}
      {phase === 'loading' && (
        <svg
          width="14" height="14"
          viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          className="animate-spin-slow mt-1"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      )}
    </button>
  );
}
