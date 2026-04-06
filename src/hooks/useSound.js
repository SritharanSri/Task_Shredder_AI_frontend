import { useCallback, useRef } from 'react';

// Generates tones using the Web Audio API — no audio file needed
function createAudioContext() {
  return new (window.AudioContext || window.webkitAudioContext)();
}

function playTone(ctx, frequency, startTime, duration, type = 'sine', gain = 0.3) {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

export function useSound() {
  const ctxRef = useRef(null);

  const getCtx = () => {
    if (!ctxRef.current) ctxRef.current = createAudioContext();
    return ctxRef.current;
  };

  // 🎉 Timer complete — triumphant 3-note chord
  const playComplete = useCallback(() => {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      playTone(ctx, 523.25, now, 0.4, 'sine', 0.25);       // C5
      playTone(ctx, 659.25, now + 0.15, 0.4, 'sine', 0.25); // E5
      playTone(ctx, 783.99, now + 0.30, 0.6, 'sine', 0.3);  // G5
    } catch (e) { console.warn('Sound error:', e); }
  }, []);

  // ⏱️ Tick — subtle click every second
  const playTick = useCallback(() => {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      playTone(ctx, 800, now, 0.05, 'square', 0.05);
    } catch (e) {}
  }, []);

  // ▶️ Start — gentle ascending beep
  const playStart = useCallback(() => {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      playTone(ctx, 440, now, 0.15, 'sine', 0.2);
      playTone(ctx, 550, now + 0.1, 0.2, 'sine', 0.2);
    } catch (e) { console.warn('Sound error:', e); }
  }, []);

  // ⏸️ Pause — descending soft tone
  const playPause = useCallback(() => {
    try {
      const ctx = getCtx();
      const now = ctx.currentTime;
      playTone(ctx, 440, now, 0.15, 'sine', 0.15);
      playTone(ctx, 330, now + 0.1, 0.2, 'sine', 0.15);
    } catch (e) { console.warn('Sound error:', e); }
  }, []);

  return { playComplete, playTick, playStart, playPause };
}
