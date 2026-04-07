import { useEffect, useRef, useState, useCallback } from 'react';
import { useSound } from '../hooks/useSound';

const MODES = {
  pomodoro: { label: 'Pomodoro', duration: 25 * 60, color: 'timerGradient', badge: 'badge-purple', icon: '🍅' },
  short:    { label: 'Short Break', duration: 5 * 60, color: 'breakGradient', badge: 'badge-green', icon: '☕' },
  long:     { label: 'Long Break', duration: 15 * 60, color: 'longGradient', badge: 'badge-cyan', icon: '🌿' },
};

const RADIUS = 88;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// ── Request browser notification permission once ──
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {});
  }
}

function sendNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, { body, icon: '/favicon.svg', silent: false });
    } catch (e) {}
  }
}

export default function PomodoroTimer({ activeTask, onComplete, onRunningChange }) {
  const [mode, setMode] = useState('pomodoro');
  const [timeLeft, setTimeLeft] = useState(MODES.pomodoro.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sessionCount, setSessionCount] = useState(0);
  const intervalRef = useRef(null);
  const { playComplete, playStart, playPause, playTick } = useSound();

  // Request notification permission on first render
  useEffect(() => { requestNotificationPermission(); }, []);

  // When activeTask changes, reset everything to Pomodoro and auto-start
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

  // Core countdown
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
      handleTimerEnd();
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync running state back to parent
  useEffect(() => {
    onRunningChange?.(isRunning);
  }, [isRunning, onRunningChange]);

  const handleTimerEnd = useCallback(() => {
    if (soundEnabled) playComplete();
    if (mode === 'pomodoro') {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      onComplete?.();
      sendNotification('🍅 Pomodoro Complete!', 'Great focus! Time for a break.');
      // Auto-start short break
      setTimeout(() => switchMode(newCount % 4 === 0 ? 'long' : 'short', true), 800);
    } else {
      sendNotification('☕ Break Over!', 'Ready to focus again?');
      // Auto-switch back to Pomodoro (don't auto-start)
      setTimeout(() => switchMode('pomodoro', false), 800);
    }
  }, [mode, sessionCount, soundEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const switchMode = useCallback((newMode, autoStart = false) => {
    clearInterval(intervalRef.current);
    setMode(newMode);
    setTimeLeft(MODES[newMode].duration);
    setIsRunning(autoStart);
    if (autoStart && soundEnabled) playStart();
  }, [soundEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

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
  // Ensure we don't have a full ring at exactly 0 progress due to transition artifacts
  const dashOffset = progress === 0 ? CIRCUMFERENCE : CIRCUMFERENCE * (1 - progress);

  const isWarning = mode === 'pomodoro' && timeLeft <= 5 * 60 && timeLeft > 60;
  const isDanger  = mode === 'pomodoro' && timeLeft <= 60;

  const ringGradientId = isDanger ? 'dangerGradient' : isWarning ? 'warningGradient' : currentMode.color;

  if (!activeTask) return null;

  return (
    <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>

      {/* ── Mode Selector ── */}
      <div className="flex items-center justify-center gap-2 mb-5">
        {Object.entries(MODES).map(([key, m]) => (
          <button
            key={key}
            onClick={() => switchMode(key, false)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
            style={{
              background: mode === key ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.05)',
              border: mode === key ? '1px solid rgba(139,92,246,0.45)' : '1px solid transparent',
              color: mode === key ? 'var(--purple-light)' : 'var(--text-muted)',
            }}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            {mode === 'pomodoro' ? 'Now Focusing' : mode === 'short' ? 'Short Break' : 'Long Break'}
          </p>
          <p className="text-sm font-medium mt-1 line-clamp-1" style={{ color: 'var(--text-secondary)', paddingRight: 8 }}>
            {mode === 'pomodoro' ? activeTask.title : mode === 'short' ? 'Rest your eyes ☕' : 'Take a proper break 🌿'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(s => !s)}
            className="flex items-center justify-center rounded-full transition-all"
            title={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}
            style={{
              width: 32, height: 32,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: soundEnabled ? 'var(--text-secondary)' : 'var(--text-muted)',
            }}
          >
            {soundEnabled ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
          {/* Session count badge */}
          {sessionCount > 0 && (
            <span className="badge badge-purple" style={{ fontSize: 10 }}>#{sessionCount}</span>
          )}
          <span className={`badge ${isDanger ? 'badge-red' : isWarning ? 'badge-orange' : mode === 'short' ? 'badge-green' : mode === 'long' ? 'badge-cyan' : 'badge-purple'}`}>
            {isDanger ? '⚡ Last min' : isWarning ? '⏳ Almost' : currentMode.label}
          </span>
        </div>
      </div>

      {/* ── Circular Timer ── */}
      <div className="flex justify-center mb-6">
        <div className="relative" style={{ width: 210, height: 210 }}>
          <svg width="210" height="210" viewBox="0 0 210 210" style={{ transform: 'rotate(-90deg)' }}>
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
              <linearGradient id="breakGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
              <linearGradient id="longGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#67e8f9" />
              </linearGradient>
              <linearGradient id="warningGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fb923c" />
              </linearGradient>
              <linearGradient id="dangerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <circle cx="105" cy="105" r={RADIUS} fill="none" strokeWidth="8" stroke="rgba(255,255,255,0.06)" />
            <circle
              cx="105" cy="105" r={RADIUS}
              fill="none" strokeWidth="8"
              stroke={`url(#${ringGradientId})`}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 1s linear', filter: 'url(#glow)' }}
            />
          </svg>

          {/* Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className={`text-5xl font-black tabular-nums ${isDanger ? 'animate-pulse' : ''}`}
              style={{
                background: isDanger
                  ? 'linear-gradient(135deg, #ef4444, #f43f5e)'
                  : isWarning
                  ? 'linear-gradient(135deg, #f59e0b, #fb923c)'
                  : mode === 'short'
                  ? 'linear-gradient(135deg, #10b981, #34d399)'
                  : mode === 'long'
                  ? 'linear-gradient(135deg, #06b6d4, #67e8f9)'
                  : 'linear-gradient(135deg, #a78bfa, #67e8f9)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1,
              }}
            >
              {minutes}:{seconds}
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              {isDanger ? '🚨 Almost done!' : isRunning
                ? mode === 'pomodoro' ? 'Stay focused 🔥' : 'Relax 🌊'
                : 'Press play'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={reset}
          className="flex items-center justify-center rounded-full transition-all"
          style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3" />
          </svg>
        </button>

        <button
          onClick={toggle}
          className={`flex items-center justify-center rounded-full transition-all btn-gradient ${isRunning ? 'animate-pulse-glow' : ''}`}
          style={{ width: 72, height: 72 }}
        >
          {isRunning ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 3 }}>
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>

        {/* Skip / complete */}
        <button
          onClick={mode === 'pomodoro' ? onComplete : () => switchMode('pomodoro', false)}
          className="flex items-center justify-center rounded-full transition-all"
          title={mode === 'pomodoro' ? 'Mark complete & skip' : 'Back to Pomodoro'}
          style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          {mode === 'pomodoro' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
      </div>

      {/* ── Progress bar ── */}
      <div className="mt-5 rounded-full overflow-hidden" style={{ height: 4, background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${progress * 100}%`,
            background: isDanger
              ? 'linear-gradient(90deg, #ef4444, #f43f5e)'
              : isWarning
              ? 'linear-gradient(90deg, #f59e0b, #fb923c)'
              : mode === 'short'
              ? 'linear-gradient(90deg, #10b981, #34d399)'
              : mode === 'long'
              ? 'linear-gradient(90deg, #06b6d4, #67e8f9)'
              : 'linear-gradient(90deg, #8b5cf6, #06b6d4)',
          }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>0:00</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{Math.floor(currentMode.duration / 60)}:00</span>
      </div>

      {/* ── Auto-break hint ── */}
      {mode === 'pomodoro' && isRunning && (
        <p className="text-center mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          Break starts automatically after this Pomodoro 🧘
        </p>
      )}
    </div>
  );
}
