import { useEffect, useRef, useState, useCallback } from 'react';
import { useSound } from '../hooks/useSound';
import PremiumGate from './PremiumGate';

// ── Mode definitions — pomodoro durations are configurable for premium ──
const buildModes = (pomodoroDuration = 25) => ({
  pomodoro: { label: 'Pomodoro', duration: pomodoroDuration * 60, icon: '🍅' },
  short:    { label: 'Short Break', duration: 5 * 60, icon: '☕' },
  long:     { label: 'Long Break', duration: 15 * 60, icon: '🌿' },
});

const PREMIUM_DURATIONS = [15, 25, 50]; // minutes
const RADIUS = 88;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {});
  }
}

function sendNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try { new Notification(title, { body, icon: '/favicon.svg', silent: false }); } catch (_) {}
  }
}

export default function PomodoroTimer({ activeTask, onComplete, onRunningChange, isPremium, onUpgrade }) {
  const [mode, setMode] = useState('pomodoro');
  const [pomodoroDuration, setPomodoroDuration] = useState(25); // minutes — premium-configurable
  const MODES = buildModes(pomodoroDuration);
  const [timeLeft, setTimeLeft] = useState(MODES.pomodoro.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sessionCount, setSessionCount] = useState(0);
  const intervalRef = useRef(null);
  // Ref holds latest handler to fix stale-closure bug in timer effect
  const handleTimerEndRef = useRef(null);
  const { playComplete, playStart, playPause, playTick } = useSound();

  useEffect(() => { requestNotificationPermission(); }, []);

  useEffect(() => {
    if (activeTask) {
      switchMode('pomodoro', true);
    } else {
      clearInterval(intervalRef.current);
      setIsRunning(false);
      setTimeLeft(MODES.pomodoro.duration);
      setMode('pomodoro');
      setSessionCount(0);
    }
  }, [activeTask?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Core countdown — uses ref to avoid stale-closure bug
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (soundEnabled && t % 60 === 0 && t > 0 && t < MODES[mode].duration) playTick();
          return t - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(intervalRef.current);
      setIsRunning(false);
      // Use ref so we always call the latest version (fixes stale closure)
      handleTimerEndRef.current?.();
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { onRunningChange?.(isRunning); }, [isRunning, onRunningChange]);

  const handleTimerEnd = useCallback(() => {
    if (soundEnabled) playComplete();
    if (mode === 'pomodoro') {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      onComplete?.();
      sendNotification('🍅 Pomodoro Complete!', 'Great focus! Time for a break.');
      setTimeout(() => switchMode(newCount % 4 === 0 ? 'long' : 'short', true), 800);
    } else {
      sendNotification('☕ Break Over!', 'Ready to focus again?');
      setTimeout(() => switchMode('pomodoro', false), 800);
    }
  }, [mode, sessionCount, soundEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the ref current every render — this is the stale-closure fix
  handleTimerEndRef.current = handleTimerEnd;

  const switchMode = useCallback((newMode, autoStart = false) => {
    clearInterval(intervalRef.current);
    setMode(newMode);
    setTimeLeft(MODES[newMode].duration);
    setIsRunning(autoStart);
    if (autoStart && soundEnabled) playStart();
  }, [soundEnabled, pomodoroDuration]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = () => {
    const next = !isRunning;
    setIsRunning(next);
    if (soundEnabled) next ? playStart() : playPause();
  };

  const reset = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTimeLeft(MODES[mode].duration);
  };

  const currentMode = MODES[mode];
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');
  const progress = (currentMode.duration - timeLeft) / currentMode.duration;
  const dashOffset = progress === 0 ? CIRCUMFERENCE : CIRCUMFERENCE * (1 - progress);

  const isWarning = mode === 'pomodoro' && timeLeft <= 5 * 60 && timeLeft > 60;
  const isDanger  = mode === 'pomodoro' && timeLeft <= 60;

  const ringGradientId = isDanger ? 'dangerGradient' : isWarning ? 'warningGradient' : currentMode.color;

  if (!activeTask) return null;

  return (
    <div className="glass-card bg-slate-950/40 p-6 animate-fade-in-up border-white/5 shadow-2xl shadow-purple-900/10" style={{ borderRadius: 32, opacity: 0, animationFillMode: 'forwards' }}>

      {/* ── Mode Selector — wraps on small screens ── */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 mb-4">
        {Object.entries(MODES).map(([key, m]) => (
          <button
            key={key}
            onClick={() => switchMode(key, false)}
            className="text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-2xl transition-all active:scale-95"
            style={{
              background: mode === key ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
              border: mode === key ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(255,255,255,0.05)',
              color: mode === key ? 'var(--purple-light)' : 'var(--text-muted)',
            }}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* ── Premium: Custom Pomodoro Duration ── */}
      {isPremium ? (
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Focus Time:</span>
          {PREMIUM_DURATIONS.map(d => (
            <button
              key={d}
              onClick={() => { setPomodoroDuration(d); if (!isRunning) setTimeLeft(d * 60); }}
              className="text-[10px] font-black px-2.5 py-1 rounded-xl transition-all active:scale-95"
              style={{
                background: pomodoroDuration === d ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)',
                border: pomodoroDuration === d ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.06)',
                color: pomodoroDuration === d ? 'var(--purple-light)' : 'var(--text-muted)',
              }}
            >{d}m</button>
          ))}
        </div>
      ) : (
        <button onClick={onUpgrade} className="flex items-center justify-center gap-2 w-full mb-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
          style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', color: 'var(--text-muted)' }}>
          🔒 Custom Duration (15/25/50 min) — ⭐ Premium
        </button>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 mb-1 opacity-80">
            {mode === 'pomodoro' ? 'SHREDDING PHASE' : 'RECHARGE PHASE'}
          </p>
          <p className="text-base font-bold line-clamp-1 text-slate-100 pr-4">
            {mode === 'pomodoro' ? activeTask.title : mode === 'short' ? 'Rest your eyes ☕' : 'Take a proper break 🌿'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setSoundEnabled(s => !s)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 active:scale-90 transition-all"
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" />
              </svg>
            )}
          </button>
          {sessionCount > 0 && (
            <div className="bg-purple-500/20 text-purple-400 text-[10px] font-black px-2 py-1 rounded-lg border border-purple-500/30">
              #{sessionCount}
            </div>
          )}
        </div>
      </div>

      {/* ── Circular Timer — responsive: min(230px, viewport) ── */}
      <div className="flex justify-center mb-10">
        <div className="relative" style={{ width: 'min(230px, calc(100vw - 80px))', height: 'min(230px, calc(100vw - 80px))' }}>
          <svg width="100%" height="100%" viewBox="0 0 210 210" style={{ transform: 'rotate(-90deg)' }}>
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <circle cx="105" cy="105" r={RADIUS} fill="none" strokeWidth="6" stroke="rgba(255,255,255,0.03)" />
            <circle
              cx="105" cy="105" r={RADIUS}
              fill="none" strokeWidth="10"
              stroke={`url(#timerGradient)`}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 1s linear', filter: 'url(#glow)', opacity: isRunning ? 1 : 0.4 }}
            />
          </svg>

          {/* Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-6xl font-black tabular-nums tracking-tighter ${isDanger ? 'animate-pulse text-red-500' : 'text-slate-100'}`} style={{ lineHeight: 1 }}>
              {minutes}:{seconds}
            </div>
            <p className="text-[10px] mt-3 font-black uppercase tracking-[0.2em] text-slate-500">
               {isRunning ? 'Session Active' : 'Ready to shred'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={reset}
          className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-slate-400 active:scale-90 transition-all hover:bg-white/10"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" />
          </svg>
        </button>

        <button
          onClick={toggle}
          className="w-20 h-20 flex items-center justify-center rounded-3xl btn-gradient shadow-2xl shadow-purple-500/20 active:scale-95 transition-all"
        >
          {isRunning ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="2" /><rect x="14" y="5" width="4" height="14" rx="2" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
          )}
        </button>

        <button
          onClick={mode === 'pomodoro' ? onComplete : () => switchMode('pomodoro', false)}
          className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-slate-400 active:scale-90 transition-all hover:bg-white/10"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="mt-10 flex flex-col items-center gap-2">
         <div className="h-1.5 w-32 bg-slate-900 rounded-full overflow-hidden border border-white/5">
            <div className="h-full bg-purple-500/40 transition-all duration-1000" style={{ width: `${progress * 100}%` }} />
         </div>
         <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Session Progress</span>
      </div>
    </div>
  );
}
