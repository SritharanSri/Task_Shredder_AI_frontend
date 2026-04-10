// Groq Cloud AI Service
// All generative logic runs on the Backend proxy for security 🔒

const BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';
const API_URL        = `${BASE}/break-task`;
const STREAM_API_URL = `${BASE}/break-task-stream`;

// ── Client-side response cache ─────────────────────────────────────────────
// Hashes the task string to a short key, stores in localStorage with a TTL.
// Same input → instant result without touching the network.
const CACHE_PREFIX = 'ai_v2_';
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

function hashStr(str) {
  let h = 2166136261; // FNV-1a 32-bit
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h.toString(36);
}

export function getCachedBreakdown(task) {
  try {
    const key = CACHE_PREFIX + hashStr(task.toLowerCase().trim());
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { steps, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) { localStorage.removeItem(key); return null; }
    return steps;
  } catch { return null; }
}

export function cacheBreakdown(task, steps) {
  try {
    const key = CACHE_PREFIX + hashStr(task.toLowerCase().trim());
    localStorage.setItem(key, JSON.stringify({ steps, ts: Date.now() }));
  } catch { /* storage full — silently skip */ }
}

// ── Streaming breakdown ────────────────────────────────────────────────────
// Calls the SSE endpoint and invokes `onStep(step)` for each step as it
// arrives. Steps appear in the UI one-by-one without waiting for all 5.
export async function streamBreakdown(task, userId = null, onStep, signal = null) {
  const response = await fetch(STREAM_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task, userId }),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const error = new Error(err?.message || err?.error || `HTTP ${response.status}`);
    error.code = err?.error;
    error.upgradeRequired = err?.upgradeRequired || false;
    throw error;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    const lines = buf.split('\n');
    buf = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6).trim();
      if (payload === '[DONE]') return;
      if (!payload) continue;
      try {
        const step = JSON.parse(payload);
        if (step.error) { const e = new Error(step.error); throw e; }
        if (step.title) onStep(step);
      } catch (e) {
        // Re-throw real errors; ignore JSON parse failures on partial chunks
        if (e.message && !e.message.startsWith('Unexpected')) throw e;
      }
    }
  }
}

// ── Non-streaming fallback ─────────────────────────────────────────────────
/**
 * @param {string} task - The task to break down
 * @param {string|null} userId - Telegram user ID (enables server-side daily limit enforcement)
 * @param {AbortSignal|null} signal - Optional AbortSignal for request cancellation
 */
export async function breakdownWithAI(task, userId = null, signal = null) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task, userId }),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    // Surface structured errors from backend
    const error = new Error(err?.message || err?.error || `HTTP ${response.status}`);
    error.code = err?.error;
    error.upgradeRequired = err?.upgradeRequired || false;
    throw error;
  }

  return response.json();
}

// ── Fallback mock (used when no API key) ──
export function mockBreakdown(task) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const steps = [
        { title: `🔍 Research & define exact success criteria for: "${task}"`, time: '15 min', difficulty: 'Easy 🟢', motivation: 'Clarity now saves 10x the time later.' },
        { title: '📐 Outline structure, scope and assign time blocks', time: '10 min', difficulty: 'Easy 🟢', motivation: 'A plan you build is a plan you follow.' },
        { title: '⚡ Execute the first and hardest phase without distractions', time: '25 min', difficulty: 'Hard 🔴', motivation: 'The first strike is 80% of the battle.' },
        { title: '🔁 Review your output and iterate on the weak spots', time: '20 min', difficulty: 'Medium 🟡', motivation: 'Perfection is the enemy — progress wins.' },
        { title: '✅ Finalize, polish and prepare for delivery', time: '15 min', difficulty: 'Easy 🟢', motivation: 'Ship it. Done beats perfect every time.' },
      ].map((s, i) => ({ id: Date.now() + i, ...s, completed: false }));
      resolve(steps);
    }, 1500);
  });
}

/**
 * @param {string} task - The task to break down
 * @param {string|null} userId - Telegram user ID (enables server-side daily limit enforcement)
 * @param {AbortSignal|null} signal - Optional AbortSignal for request cancellation
 */
export async function breakdownWithAI(task, userId = null, signal = null) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task, userId }),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    // Surface structured errors from backend
    const error = new Error(err?.message || err?.error || `HTTP ${response.status}`);
    error.code = err?.error;
    error.upgradeRequired = err?.upgradeRequired || false;
    throw error;
  }

  return response.json();
}

// ── Fallback mock (used when no API key) ──
export function mockBreakdown(task) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const steps = [
        { title: `🔍 Research & define exact success criteria for: "${task}"`, time: '15 min', difficulty: 'Easy 🟢', motivation: 'Clarity now saves 10x the time later.' },
        { title: '📐 Outline structure, scope and assign time blocks', time: '10 min', difficulty: 'Easy 🟢', motivation: 'A plan you build is a plan you follow.' },
        { title: '⚡ Execute the first and hardest phase without distractions', time: '25 min', difficulty: 'Hard 🔴', motivation: 'The first strike is 80% of the battle.' },
        { title: '🔁 Review your output and iterate on the weak spots', time: '20 min', difficulty: 'Medium 🟡', motivation: 'Perfection is the enemy — progress wins.' },
        { title: '✅ Finalize, polish and prepare for delivery', time: '15 min', difficulty: 'Easy 🟢', motivation: 'Ship it. Done beats perfect every time.' },
      ].map((s, i) => ({ id: Date.now() + i, ...s, completed: false }));
      resolve(steps);
    }, 1500);
  });
}
