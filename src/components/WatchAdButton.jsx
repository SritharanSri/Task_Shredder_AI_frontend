import { useState, useEffect, useCallback, useRef } from 'react';
import { showAdsgramAd } from '../services/adsgram';

const BLOCK_ID = import.meta.env.VITE_ADSGRAM_BLOCK_ID || 'YOUR_BLOCK_ID';
const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';
const COINS_PER_AD = 10;

/**
 * WatchAdButton
 *
 * Flow:
 *  1. User taps → AdsGram SDK shows ad
 *  2. Ad completes → SDK fires onReward → POST /api/reward (server credits coins)
 *  3. Success (incl. alreadyCredited) → call onRewardClaimed(result)
 *  4. Start 30s cooldown
 *
 * Handles all edge cases:
 *  - AdsGram server callback already ran (alreadyCredited)
 *  - Network failure → optimistic credit + refreshUser
 *  - Daily limit reached
 *  - Genuine cooldown
 *
 * Props:
 *  userId           – string
 *  onRewardClaimed  – fn(result) – called after server confirms (or optimistic)
 *  onError          – fn(msg)   – called on non-recoverable errors
 *  dailyCoinsEarned – number
 *  dailyCoinLimit   – number
 */
export default function WatchAdButton({
  userId,
  onRewardClaimed,
  onError,
  dailyCoinsEarned = 0,
  dailyCoinLimit = 50,
}) {
  const [phase, setPhase] = useState('idle'); // 'idle' | 'ad' | 'claiming' | 'waiting'
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);

  // Restore cooldown from localStorage on mount
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
    let remaining = Math.max(1, seconds);
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

  const claimReward = useCallback(async () => {
    setPhase('claiming');

    try {
      const res = await fetch(`${API_BASE}/reward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (res.ok) {
        // New reward OR idempotent same-ad (alreadyCredited from server callback)
        const cooldownSecs = data.cooldownSeconds || 30;
        localStorage.setItem('adsgram_cooldown_until', String(Date.now() + cooldownSecs * 1000));
        setCooldown(cooldownSecs);
        setPhase('waiting');
        startCooldownTimer(cooldownSecs);
        onRewardClaimed?.(data);
        return;
      }

      if (data.code === 'COOLDOWN') {
        const wait = data.waitSeconds || 30;
        if (wait < 25) {
          // Very recent — AdsGram server callback already credited coins
          // Treat as success: refresh user to pick up the balance
          localStorage.setItem('adsgram_cooldown_until', String(Date.now() + wait * 1000));
          setCooldown(wait);
          setPhase('waiting');
          startCooldownTimer(wait);
          onRewardClaimed?.({ success: true, coinsEarned: COINS_PER_AD, alreadyCredited: true, cooldownSeconds: wait });
        } else {
          // Genuine cooldown
          setCooldown(wait);
          setPhase('waiting');
          startCooldownTimer(wait);
          onError?.(`Next ad available in ${wait}s`);
        }
        return;
      }

      if (data.code === 'DAILY_LIMIT') {
        setPhase('idle');
        onError?.('You\'ve earned the maximum coins for today. Come back tomorrow!');
        return;
      }

      // Unexpected server error — optimistic credit (AdsGram callback may have run)
      console.error('[WatchAdButton] Server error:', data.error);
      localStorage.setItem('adsgram_cooldown_until', String(Date.now() + 30000));
      setCooldown(30);
      setPhase('waiting');
      startCooldownTimer(30);
      onRewardClaimed?.({ success: true, coinsEarned: COINS_PER_AD, optimistic: true, cooldownSeconds: 30 });

    } catch (fetchErr) {
      // Network failure — AdsGram server callback may have already credited coins
      console.error('[WatchAdButton] Network error during claim:', fetchErr.message);
      localStorage.setItem('adsgram_cooldown_until', String(Date.now() + 30000));
      setCooldown(30);
      setPhase('waiting');
      startCooldownTimer(30);
      onRewardClaimed?.({ success: true, coinsEarned: COINS_PER_AD, optimistic: true, cooldownSeconds: 30 });
    }
  }, [userId, onRewardClaimed, onError, startCooldownTimer]);

  const handleClick = useCallback(() => {
    if (phase !== 'idle' || !userId) return;
    setPhase('ad');

    showAdsgramAd({
      blockId: BLOCK_ID,
      onReward: () => {
        claimReward();
      },
      onError: (msg) => {
        console.warn('[WatchAdButton] Ad error/skip:', msg);
        setPhase('idle');
        // Only surface real errors; skip / no-fill is a normal AdsGram response
        const lower = String(msg || '').toLowerCase();
        if (lower && !lower.includes('skip') && !lower.includes('not completed')) {
          onError?.(String(msg));
        }
      },
    });
  }, [phase, userId, claimReward, onError]);

  const coinsLeft = Math.max(0, dailyCoinLimit - dailyCoinsEarned);
  const limitReached = coinsLeft <= 0;

  let label, sublabel, disabled;
  if (limitReached) {
    label = '🌙 Daily limit reached';
    sublabel = 'Come back tomorrow';
    disabled = true;
  } else if (phase === 'ad') {
    label = 'Ad loading…';
    sublabel = 'Please watch the full ad';
    disabled = true;
  } else if (phase === 'claiming') {
    label = 'Claiming reward…';
    sublabel = null;
    disabled = true;
  } else if (phase === 'waiting') {
    label = `⏱ Next ad in ${cooldown}s`;
    sublabel = `${coinsLeft} coins left today`;
    disabled = true;
  } else {
    label = '📺 Watch Ad & Earn 10 Coins';
    sublabel = `🪙 ${coinsLeft} coins left today`;
    disabled = false;
  }

  const isSpinning = phase === 'ad' || phase === 'claiming';

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className="w-full py-3 px-4 rounded-2xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
      style={{
        background: disabled
          ? 'rgba(255,255,255,0.05)'
          : 'linear-gradient(135deg,rgba(139,92,246,0.25),rgba(6,182,212,0.25))',
        border: disabled
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid rgba(139,92,246,0.35)',
        color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {isSpinning && (
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      )}
      <span className="flex flex-col items-center gap-0.5">
        <span>{label}</span>
        {sublabel && (
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
            {sublabel}
          </span>
        )}
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
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
